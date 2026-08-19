# Backend design — FastAPI + MongoDB

Koda works today with no server: lessons are bundled JSON, progress is
`localStorage`, and the PWA precaches the app so a cold start with no network
still reaches a playable round. **That does not change.** The backend is a
second copy of the record, not the place the app reads from.

Everything below is designed around one rule:

> The device is the source of truth while a child is playing. The server is
> where that truth is kept safe, merged with the child's other devices, and
> shown to a parent.

---

## 1. What the backend is for

Three jobs, in order of value:

1. **A record that survives the device** — clear the browser, lose the tablet,
   reinstall the app: XP, mastery and the learning log come back.
2. **A parent view** — one place to see what a child has practised, across
   whatever they played on.
3. **A child on their own device** — a kid signs in on their tablet with a code
   the parent gives them and their record follows.

Non-goals for now, stated so they do not creep in: realtime multiplayer, an
analytics warehouse, per-field conflict resolution, third-party plugin hosting,
serving lessons from the server (they stay bundled — that is what makes the app
work offline on first run).

---

## 2. What already exists to build on

The client was written with this seam in mind, so most of the work is wiring,
not rewriting.

| Seam | Where | What it gives us |
|---|---|---|
| `setLearningSink(fn)` | `src/lib/learning/learningLog.ts` | One function call turns the local event ring into an upload; nothing above it changes |
| `LearningEventBatch` + `LEARNING_SCHEMA_VERSION` | `src/lib/learning/events.ts` | A versioned wire format already exists — the server can accept batches from older builds |
| `learnerId` | `learningLog.ts` | A stable per-device id, ready to be re-pointed at a real learner |
| Versioned storage keys | `pluginStore`, `lessonContent`, `scoring`, `learnerProgress` | Each is one JSON blob under one key — a natural document boundary |
| `useOnlineStatus()` | `src/pwa/useServiceWorker.ts` | Online/offline signal for the flush loop and status UI |

Local state that becomes syncable documents:

| Doc kind | Key | Written by | Scope |
|---|---|---|---|
| `progress` | learnerId | `learnerProgress.ts` | learner |
| `levels` | learnerId | `learnerProgress.ts` | learner |
| `profile` | learnerId | `learningLog.ts` (also derived server-side) | learner |
| `plugin` | pluginId | `pluginStore.ts` | family |
| `lessonContent` | `pluginId/lessonId` | `lessonContent.ts` | family |
| `scoring` | `default` | `scoring.ts` | family |

`viewer.ts` (age/beta/developer toggles) and the Gemini API key stay device-local
and are never uploaded — they describe the device, not the child.

---

## 3. Shape: two processes, one origin

FastAPI owns data. `server.ts` keeps everything it already does — serving the
SPA, the Gemini REST proxy, the `/api/live` WebSocket, and the dev-only SVG file
routes. Nothing in it needs to change except five lines of proxy.

```
browser ──► Express :3001 ──┬── /            SPA (Vite dev middleware / dist)
                            ├── /api/*       Gemini proxy + SVG asset routes (unchanged)
                            └── /v1/*  ────► FastAPI :8000 ──► MongoDB :27017
```

One origin means no CORS in dev and no second hostname to configure in the
service worker. The client calls `import.meta.env.VITE_API_BASE ?? "/v1"`, so a
separate deployment is an env var, not a code change.

```ts
// server.ts — dev and prod alike
import { createProxyMiddleware } from "http-proxy-middleware";
app.use("/v1", createProxyMiddleware({ target: process.env.API_URL ?? "http://127.0.0.1:8000", changeOrigin: true }));
```

Add `/v1` to the service worker's `navigateFallbackDenylist` alongside `/api/`
— a cached sync response would be worse than an offline one.

### Deployment topology

Two processes, always. One *origin* is the design decision; how many machines is
a deployment choice the client never sees, because the base URL is one env var.

| Topology | Shape | Trade |
|---|---|---|
| **One box** — start here | `docker compose`: Express published, FastAPI and Mongo on the internal network only | One origin, one certificate, no CORS. Cheapest to run and to reason about |
| One box, proxy in front | Caddy or nginx serves `dist/` statically, routes `/api` → Node, `/v1` → FastAPI | Still one origin; Node stops serving files. Worth it when traffic justifies it |
| Split | SPA on a CDN, API on its own host, Mongo Atlas | `VITE_API_BASE=https://api…`, a CORS allowlist, two certificates. Scales independently |

Splitting stays cheap because auth is **bearer tokens, not cookies**: no
`SameSite` rules, no credentialed CORS, just an `Authorization` header and an
origin allowlist. The service worker is unaffected either way — `/v1` is on the
denylist by design, so a sync response is never cached.

What does not move: the Gemini proxy and `/api/live` stay with Express wherever
it runs. FastAPI owns data, and only data.

Production checklist, short version: TLS terminated in front, Mongo reachable
only from the API (compose network, or Atlas with SCRAM and an IP allowlist),
`JWT_SECRET` and `GEMINI_API_KEY` from the host's secret store rather than a
`.env` file, `docker compose --profile api up -d` with restart policies, and a
daily `mongodump` to object storage — a backup is what makes "a record that
survives the device" true.

---

## 4. Identity: families, parents, learners, devices

Per your decision: parents sign up, create a child account, and share a code the
child uses to sign in on their own device. On a device where the parent is
already signed in, the child just taps their own face on a picker.

```
Family ──┬── Parent (email + password)          can see every learner
         ├── Learner "Mia"   ─── JoinCode ───► Device (kid tablet)
         └── Learner "Sam"
```

**Four flows, four endpoints:**

| Flow | Call | Result |
|---|---|---|
| Parent signs up | `POST /v1/auth/signup {email, password}` | Family + parent created, tokens returned |
| Parent signs in | `POST /v1/auth/login` | Family-scoped tokens on this device |
| Parent adds a child | `POST /v1/learners {displayName, birthYear?}` | Learner id; the local `learnerId` is claimed into it on first sync |
| Child signs in elsewhere | parent: `POST /v1/learners/{id}/join-code` → child: `POST /v1/auth/join {code, deviceName}` | Learner-scoped tokens on the kid's device |
| Staff sign in | `POST /v1/auth/login` | A family-less token whose `role` is the platform role; family routes refuse it |

**Tokens.** Access token: JWT, 15 minutes, carries `familyId`, `scope`
(`family` or `learner`), and `learnerId` when learner-scoped. Refresh token:
opaque random string, 60 days, rotated on use, stored hashed server-side so it
can be revoked ("sign out that tablet"). Both live in `localStorage` — the app
must work after a week in a drawer with no network, which rules out
session-cookie-only auth.

**Join codes.** 8 characters, unambiguous alphabet (no `O`/`0`/`I`/`1`), hashed
at rest, single use, 15-minute TTL via a Mongo TTL index, rate-limited to 5
attempts per minute per IP. A short-lived single-use code is a weak secret used
once, which is the only way it is safe.

**Offline is not signed out.** Expired access token, dead network, revoked
device — none of these may block a round. Play is local; sync fails soft and
retries. The only visible effect is the sync indicator, and after a revoke, a
quiet "sign in again to save your work" note that keeps the outbox intact.

---

## 5. Users, roles and rights

Four adults' worth of situations show up immediately — a second parent, a
grandparent who only watches, a tutor, and you, running the service — so
authorisation is a model, not an `if is_parent` scattered through the routers.

### Two separate axes

A person's rights come from **membership in a family**. Running the platform is
a **different axis entirely**: staff are not members of anyone's family, and no
amount of platform role silently makes someone a parent.

```
User ──< Membership >── Family        family axis:   owner · parent · caregiver
  │                                   (a user can be in more than one family —
  │                                    blended families, a tutor with clients)
  └── platformRole                    platform axis: none · support · admin
Device ── learner-scoped token        the child: no password, one learner
```

### The roles

| Role | Who | In one line |
|---|---|---|
| `owner` | the parent who signed up | Everything in the family, plus deleting it and handing it over |
| `parent` | a second guardian, invited | Everything except destroying or transferring the family |
| `caregiver` | grandparent, tutor, co-parent who should only watch | Read the children and their records; change nothing |
| `learner` | the child, via a device token | Play, and write their own record. Reads family settings, changes none |
| `support` | staff, first line | Account shape only — never a child's learning record without a grant |
| `admin` | staff, accountable | Account lifecycle, device revocation, deletion requests. Learning records still need a grant |

`superadmin` is not a fourth staff tier — it is `admin` plus one permission,
`staff:manage`, held by whoever bootstraps the system. One extra tier is easier
to reason about than a hierarchy nobody remembers.

### The rights

Permissions are verb-on-resource strings, and a role is exactly a set of them.
No role is checked by name anywhere except in this table.

| Permission | owner | parent | caregiver | learner | support | admin |
|---|:--:|:--:|:--:|:--:|:--:|:--:|
| `family:read` | ✓ | ✓ | ✓ | own | ✓ | ✓ |
| `family:update` | ✓ | ✓ | | | | |
| `family:delete` · `family:transfer` | ✓ | | | | | ✓ audited |
| `member:invite` | ✓ | ✓ | | | | |
| `member:list` | ✓ | ✓ | ✓ | | ✓ | ✓ |
| `member:role` · `member:remove` | ✓ | | | | | ✓ audited |
| `learner:create` · `learner:update` | ✓ | ✓ | | | | |
| `learner:delete` | ✓ | ✓ | | | | ✓ audited |
| `learner_data:read` | ✓ | ✓ | ✓ | own | grant | grant |
| `learner_data:write` | | | | own | | |
| `settings:read` | ✓ | ✓ | ✓ | ✓ | | |
| `settings:write` | ✓ | ✓ | | | | |
| `device:list` | ✓ | ✓ | ✓ | own | ✓ | ✓ |
| `device:revoke` | ✓ | ✓ | | own | | ✓ audited |
| `platform:*` | | | | | read | ✓ |

Two rows carry the product decisions worth noticing. **A learner cannot write
family settings** — plugin toggles, scoring rates and lesson wording are a
parent's, which means the Plugins and Art pages become parent-only on a kid's
device (see *App consequences* below). And **`learner_data:read` is not
something staff simply have**: it takes a grant.

### Enforcement: two layers, and the second is the real one

```python
@router.post("/learners", dependencies=[Depends(require("learner:create"))])
async def create_learner(body: NewLearner, p: Principal = Depends(principal)):
    await db.learners.insert_one({**body.model_dump(), "familyId": p.family_id})
```

1. **The permission check** answers "may this principal do this kind of thing?"
2. **The tenancy filter** answers "to whose data?" — `familyId` comes from the
   token, *never* from the request body or a path parameter. Every query is
   built through a `scoped(principal)` helper that adds it.

Layer two is what actually keeps two families apart, and it holds even if a
permission table is wrong. A route that builds a raw query is the bug to look
for in review.

The access token carries `{sub, typ: "user"|"device", familyId, role,
learnerId?, platformRole?}`. The client reads these to decide what to *show*;
the server re-derives them to decide what to *allow*. Client-side gating is UX,
never security.

### Staff access to a child's record: the grant

An admin who can silently read any child's learning history is a liability. So
they cannot.

```
POST /v1/admin/grants { familyId, reason, hours ≤ 24 }
   → parent is notified in-app and by email, immediately
   → the grant is a row with an expiry, not a flag on a user
   → every read under it is written to the audit log with the grant id
   → the family can revoke it; it dies on its own within a day regardless
```

Account-shape work — "I can't sign in", "delete my child's account" — needs no
grant, because it touches `users`, `memberships`, `devices` and `learners`, not
events. Anything that touches a child's record does.

### Audit log

One append-only collection, no update or delete endpoint, 2-year TTL:

```python
{ ts, actor: {type: "user"|"device"|"system", id, platformRole},
  action: "learner:delete", target: {kind: "learner", id}, familyId,
  grantId: None, ip, userAgent, meta: {…} }
```

Everything on the platform axis is logged, plus family-side destructive acts
(delete, transfer, role change, device revoke). Ordinary play is not — it is
already the event stream.

### Staff accounts are provisioned, never signed up

- No public admin signup, ever. First admin comes from a CLI seed
  (`python -m app.cli create-admin --email …`) gated on an env secret; after
  that, `staff:manage` invites the rest.
- **Staff sign in through the same route as everyone else** and get a token with
  **no `familyId`**, because they are in no family. Their `role` *is* their
  platform role. Family-scoped routes then refuse them at the query layer —
  `repos/base.scoped()` raises rather than quietly returning an unscoped filter,
  which is precisely how "an admin reads one family" would otherwise become "an
  admin reads all of them by accident".
- TOTP is **mandatory** for `support` and `admin`, optional for parents.
- Admin tokens carry `aud: "admin"` and are rejected by `/v1/sync/*`; the kid app
  cannot hold one even if someone pastes it in.
- The admin console is a **separate surface** — its own route bundle, not part of
  the child PWA and not precached by the service worker.

### App consequences

| Surface | Who sees it |
|---|---|
| Learn, Dashboard, a round | Everyone, including a signed-out device |
| Plugins, Art, scoring, lesson wording | `settings:write` — parents only |
| Family, members, devices, join codes | Parents; role changes owner-only |
| A child's record | Parents and caregivers; the child sees their own |

On a shared tablet where the parent is signed in, parent areas sit behind a
**4–6 digit parent PIN** rather than a full sign-out and sign-in — the realistic
gesture when a child hands you the tablet. The PIN gates the UI; the token still
carries the rights, and the server still checks them.

Offline, the cached token's claims decide what is shown. A learner device that
has never been online has learner rights, which is exactly what it has today.

---

## 6. Data model

Two kinds of data with genuinely different rules, plus rollups the server owns.

### Append-only: learning events

Immutable facts with client-generated ids. They never conflict — the merge of
two devices' events is their union — which is why they carry the record and the
counters are derived from them.

```python
# events collection
{ "_id": ObjectId, "familyId": ..., "learnerId": ..., "eventId": "e_...",  # client id
  "serverSeq": 41207, "receivedAt": ISODate, "schemaVersion": 1, "appVersion": "1.0.0",
  "deviceId": ..., "sessionId": ..., "seq": 17, "ts": ISODate,
  "type": "answer_submitted", "pluginId": "counting", "activityId": ..., "lessonId": ...,
  "conceptKey": "corresponder", "levelNumber": 3, "standards": ["CCSS.K.CC.B.4a"],
  "payload": { ... }  # the rest of the event, as sent
}
```

Index `{familyId: 1, eventId: 1}` **unique** — that one index is the whole
idempotency story: a retried batch inserts nothing twice.

### Mutable: documents

Everything a person edits — plugin toggles, lesson wording, scoring rates,
progress — is one small JSON blob. One collection handles all of them, so a new
kind of setting needs no backend change.

```python
# docs collection
{ "familyId": ..., "learnerId": ... | None, "kind": "plugin", "key": "counting",
  "body": { ... }, "rev": 7, "serverSeq": 41208,
  "updatedAt": ISODate, "updatedBy": deviceId, "deletedAt": None }
```

Index `{familyId: 1, kind: 1, key: 1}` unique, `{familyId: 1, serverSeq: 1}` for pulls.

### Derived: rollups

`concept_totals`, one document per `(learnerId, conceptKey)`, `$inc`-ed as
events land — the same shape `LearningProfile` already
has locally. Because they are only touched when an event insert was *new*, they
inherit the events' idempotency.

**They fold events exactly the way the client does, and that is a contract.**
`questionsAnswered` counts first attempts only — a retry of a question whose
answer the child has just seen measures memory, not understanding — and a
correct answer after a hint is not `correctFirstTry`. Errors count on every
attempt, because the pattern is what a recommendation reads. The rule lives in
`applyToProfile` (client) and `services/rollup.py` (server); if they drift, the
app and the parent view will quietly disagree about the same child. Building P1
found exactly that drift, and `test_sync_events.py` now pins it. They are also written back as a `profile` doc
so other devices and the parent view pull them like anything else.

### Supporting collections

| Collection | Purpose | Notes |
|---|---|---|
| `families` | one per parent signup | |
| `users` | adults — parents and staff alike | `email` unique, Argon2id hash, `platformRole`, TOTP secret |
| `learners` | children | `displayName` only — no email, no full birthdate |
| `devices` | one per install | refresh-token hash, `lastSeenAt`, `appVersion` |
| `join_codes` | code hash + learnerId | TTL index on `expiresAt` |
| `ops` | applied mutation ids | TTL 7 days; makes retries idempotent |
| `counters` | `{_id: familyId, seq: n}` | `$inc` gives the sync cursor |
| `memberships` | user ↔ family with a role | unique `(userId, familyId)` |
| `invitations` | invite a second parent or caregiver | token hash, role, TTL index |
| `grants` | time-boxed staff access to one family | TTL on `expiresAt`, referenced by audit rows |
| `audit_log` | who did what, when, why | append-only, 2-year TTL, indexed by `familyId` and by actor |

**Retention.** Raw events get a 400-day TTL; rollups are permanent. That keeps
"a year of practice still counts" true without an unbounded collection, and it
matches the local design where the ring is capped but the profile is not.

---

## 7. The sync protocol

A per-family monotonic integer (`counters`) is the cursor. Not a timestamp —
device clocks are wrong, and children's tablets are the worst offenders.

### Push

```http
POST /v1/sync/push
{ "deviceId": "...", "cursor": 41190,
  "events": [ { ...LearningEvent } ],                       // append-only
  "mutations": [ { "opId": "op_...", "kind": "plugin", "key": "counting",
                   "learnerId": null, "body": {...}, "baseRev": 6, "deleted": false } ] }

200 { "cursor": 41208,
      "accepted": ["e_a1", "e_a2", "op_x"],
      "conflicts": [ { "kind": "lessonContent", "key": "counting/l3", "doc": {...}, "rev": 9 } ] }
```

- Events: `insert_many(ordered=False)`, duplicates ignored by the unique index.
- Mutations: `findOneAndUpdate` guarded on `rev == baseRev`. Match → `rev + 1`,
  new `serverSeq`. No match → the server's copy comes back as a conflict and the
  client overwrites its local value. **Last write wins, server arbitrates.**
- One exception, because losing XP is the one merge people notice: `kind:
  "progress"` merges field-wise, taking `max` of the monotonic counters (`xp`,
  `problemsSolved`, `level`, `streakDays`) and last-write-wins for the rest
  (`dailyGoal`). Three lines, and it prevents the worst two-device regression.
- Limits: 500 events or 200 mutations per batch, 1 MB body. Over that, the
  client splits.

### Pull

```http
GET /v1/sync/changes?since=41190&limit=500
200 { "cursor": 41208, "docs": [ {kind, key, learnerId, body, rev, deletedAt} ], "hasMore": false }
```

Docs only. Events are never sent back down — the device that wrote them has
them, and a device that has none needs the rollup, not 40,000 taps. A fresh
install therefore restores: profile, progress, levels, plugin state, lesson
wording — everything a child would notice.

Deletes are tombstones (`deletedAt` set, body dropped), so a delete propagates
instead of resurrecting on the next push from a stale device.

### When the client syncs

App start · `online` event · 30 s timer while the outbox is non-empty ·
`visibilitychange` to hidden (catches the tablet being closed) · after a round
ends. Single-flight with exponential backoff (2 s → 60 s, full jitter) on 5xx or
network error; 401 triggers one refresh attempt then backs off quietly.

---

## 8. Client architecture

One new folder, no rewrite of the stores. Four files carry the mechanism — the
full tree, including the account screens, is in §10:

```
src/lib/sync/
  api.ts        ✅ fetch wrapper — base URL, auth header, error envelope
  session.ts    ✅ tokens, sign up / in / out, refresh-before-expiry
  useSession.ts ✅ the signed-in state, live
  outbox.ts     the queue: append, coalesce, drain, cap                (P1)
  engine.ts     when to flush, backoff, applying pulled docs, status   (P1)
```

The parts marked ✅ are built, alongside the account UI:

```
src/components/account/
  AccountForm.tsx    ✅ the credentials form — one copy, two homes
  SignInScreen.tsx   ✅ the full page, reached from the account menu
  SignInPanel.tsx    ✅ the Settings card: summary when signed in, form when not
```

The screen is **not a gate**. Koda is playable with no account and no network,
so "keep playing without an account" is a first-class button on it, not fine
print — and the sidebar's account menu is where signing out lives.
Two rules it follows that the rest will too: a failed `fetch` is the *offline*
case and never signs anyone out, while a **rejected** refresh means the device
was revoked and does. Sign-out clears local state first and tells the server
after — a person pressing it on a plane means it.

**The outbox** is a `localStorage` array under `koda_outbox_v1`, capped at 2 000
entries. Mutations coalesce by `(kind, key)` — only the latest body of a doc
matters, so toggling a feature ten times offline is one op. Events do not
coalesce; they are the record. When batches get big enough that JSON-parsing the
whole queue per append hurts (roughly: art in Mongo, or a shared classroom
tablet), move this one file to IndexedDB. Not before — it would be machinery in
place of a working thing.

**Existing stores opt in with one line** in the function that already saves:

```ts
// src/lib/pluginStore.ts
function saveStoredPlugins(plugins: LearningPlugin[]) {
  localStorage.setItem(STORAGE_KEY_PLUGINS, JSON.stringify(plugins));
  Sync.record("plugin", plugins.map(...));   // ← the only new line
}
```

and the learning log needs none at all — it already has the seam:

```ts
setLearningSink(async (batch) => Sync.recordEvents(batch.events));
```

**Applying a pull** writes the doc into the same `localStorage` key the store
already reads, then calls its existing `notify()` — the UI updates by the path it
already uses.

**Status UI**: extend `PwaStatus` (it already owns the quiet corner and the
online signal) with `synced · N waiting · signed out`. Same tone as the offline
notice: never a blocking banner.

---

## 9. Offline behaviour

| Situation | What happens |
|---|---|
| No network, playing | Everything works. Events and edits queue. Nothing is lost, nothing is shown |
| No network, app restarted | Queue survives in `localStorage`, flushes when back |
| Back online | One batch push, then a pull; UI updates in place |
| Access token expired offline | Ignored — refresh happens on the next successful connection |
| Device revoked by a parent | Local play continues, queue is kept, quiet "sign in again" note |
| Two devices edited the same lesson | Server's copy wins, the loser's UI updates; XP counters merge by max |
| Never signed in, offline | **Blocked at the gate.** First sign-in is the one thing that needs a network |
| Signed in once, then offline forever | Everything works — the session is in `localStorage` and a failed check leaves it alone |

Signing in is now required to reach the app (`App.tsx`), so the table's last two
rows are the trade that was accepted: a device that has signed in once is
untouched by losing the network, and a device that never has cannot start.

Proven rather than assumed. `src/lib/sync/session.test.ts` covers the rules —
a failed `fetch` and a 503 from the proxy both keep the session, a 401 from
`/auth/me` clears it, and signing out clears this device even when the server
cannot be told. Live: with the API container stopped the app still loads and
stays signed in; with **everything** stopped, a production build boots from the
service worker cache, still signed in.

---

## 10. Project structure

### Where it sits in the repo

The Python service is a folder, not a second repository. One checkout, one
branch, one review — the wire format lives in two languages and they must move
together.

```
koda5/
├── src/                      the React app (unchanged, plus src/lib/sync/)
├── server.ts                 Express: SPA · Gemini · /api/live · /v1 proxy
├── server/                   ← the FastAPI service
├── docker-compose.yml        mongo + api for local work
└── docs/BACKEND.md           this file
```

### The service

```
server/
├── app/
│   ├── main.py               app factory, lifespan (Motor client, index sync), router mounting
│   ├── settings.py           pydantic-settings — MONGODB_URI, JWT_SECRET, TTLs, CORS, ADMIN_SEED
│   ├── db.py                 the Motor client and database handle, nothing else
│   ├── indexes.py            every index in one list, applied on startup and by `cli migrate`
│   ├── rbac.py               PERMISSIONS + ROLE_PERMISSIONS — the §5 table, and the only place roles are named
│   ├── deps.py               principal() · require(*perms) · scoped(principal) · current_family()
│   ├── errors.py             one exception → response mapping; no bare HTTPException in routers
│   ├── cli.py                create-admin · migrate · expire-grants · revoke-device · backfill-rollups
│   │
│   ├── models/               pydantic v2 — the wire, and nothing about storage
│   │   ├── common.py         ObjectId handling, timestamps, the envelope shapes
│   │   ├── auth.py           SignupIn · LoginIn · TokenPair · Principal · JoinIn
│   │   ├── family.py         Family · Membership · Invitation · Learner · Device
│   │   ├── events.py         the LearningEvent union — mirror of src/lib/learning/events.ts
│   │   ├── sync.py           PushIn · PushOut · Mutation · SyncDoc · ChangesOut
│   │   └── admin.py          Grant · AuditEntry · AdminFamilyView
│   │
│   ├── repos/                data access, one module per collection
│   │   ├── base.py           the scoped() query helper — every filter gets familyId from the principal
│   │   ├── users.py · families.py · memberships.py · learners.py · devices.py
│   │   ├── events.py · docs.py · rollups.py · counters.py
│   │   └── grants.py · audit.py · invitations.py
│   │
│   ├── services/             rules that span more than one collection
│   │   ├── tokens.py         issue · rotate · revoke · verify
│   │   ├── codes.py          join codes: mint, redeem, rate-limit
│   │   ├── sync.py           push and pull, conflict resolution, the progress max-merge
│   │   ├── rollup.py         events → concept and skill totals, and the profile doc
│   │   ├── grants.py         open · notify the family · expire
│   │   ├── audit.py          one write() call, used by every mutating admin path
│   │   └── mailer.py         invitations, grant notices, password reset (console backend in dev)
│   │
│   ├── routers/              thin: validate, call a service, return a model
│   │   ├── health.py         /v1/health — liveness and Mongo ping
│   │   ├── auth.py           signup · login · refresh · logout · join · totp
│   │   ├── family.py         family, members, invitations, ownership transfer
│   │   ├── learners.py       CRUD, join codes, profile read
│   │   ├── devices.py        list, rename, revoke
│   │   ├── sync.py           push · changes
│   │   └── admin.py          family lookup, grants, deletion requests, audit read
│   │
│   └── middleware/           request id · structured logging · rate limit
│
├── tests/
│   ├── conftest.py           app fixture, a throwaway database per run, factories
│   ├── test_auth.py          signup, login, refresh rotation, join codes, lockout
│   ├── test_rbac.py          the §5 matrix, asserted cell by cell
│   ├── test_tenancy.py       family A cannot read family B, by any route
│   ├── test_sync_events.py   idempotent replay, out-of-order batches, rollup correctness
│   ├── test_sync_docs.py     rev conflicts, tombstones, the progress merge
│   └── test_grants.py        no read without a grant, expiry, audit rows written
│
├── scripts/seed_dev.py       a family, two learners, a week of plausible events
├── pyproject.toml            deps + ruff + pytest config in one file
├── Dockerfile
└── README.md                 how to run it in four lines
```

### The layering rule

```
routers  →  services  →  repos  →  Motor
   ↑            ↑
  deps       models
```

A router never touches the driver, and a repo never imports a router. The point
is not tidiness: **`repos/base.py` is where tenancy is enforced**, so every query
in the system passes through one function that adds `familyId` from the token.
If that rule holds, a wrong permission cell leaks nothing across families.

### The client half

```
src/lib/sync/
  index.ts       the public surface: Sync.record · Sync.recordEvents · useSyncStatus
  types.ts       the wire types — the TypeScript side of models/sync.py
  session.ts     tokens, signup/login/join, current learner, sign-out
  outbox.ts      queue: append, coalesce by (kind, key), drain, cap
  api.ts         fetch wrapper — base URL, auth header, retry classification
  engine.ts      when to flush, backoff, single-flight, status subscription
  apply.ts       write a pulled doc into the store that owns it
  kinds.ts       kind → { storageKey, notify } — one table, like the plugin registry

src/components/account/
  SignInPanel.tsx · FamilyPanel.tsx · LearnerPicker.tsx · ParentPinGate.tsx
```

`kinds.ts` is the piece worth insisting on: without it, "apply a pulled document"
becomes a switch statement that every new setting has to remember to update.

### Tooling

| Concern | Choice | Why this one |
|---|---|---|
| Runtime | Python 3.12, FastAPI, uvicorn | Async all the way to the driver |
| Driver | Motor | The async Mongo driver; no ORM — the documents are the model |
| Validation | pydantic v2 | Already the FastAPI idiom, and it is the wire contract |
| Auth | pyjwt · argon2-cffi · pyotp | Access JWT, Argon2id passwords, TOTP for staff |
| Lint/format | ruff | One tool, configured in `pyproject.toml` |
| Tests | pytest · pytest-asyncio · httpx ASGI transport | Real routes, real Mongo, throwaway database per run |
| Migrations | `app/indexes.py` + `cli migrate` | Mongo needs index management, not schema migration |

### Running it locally

The whole stack is Docker, driven by one target:

```bash
make dev-local        # app + API + Mongo, built and running
make logs · logs-api  # follow either service
make test-api         # pytest against the compose Mongo
make lint-api         # ruff
make migrate          # apply every index
make down             # stop, keep the database
make clean            # stop and drop the database volume
```

`make dev-local` renews the anonymous `node_modules` volume, so a dependency
added since the last build is actually picked up rather than shadowed by a stale
one — the failure mode that looks like "the package is installed but not found".

`make dev-local` runs the `dev` stage of the root `Dockerfile`: the working tree
is bind-mounted, so an edit on the host reloads inside the container, while
`node_modules` stays the Linux copy baked into the image rather than the host's.
Mongo keeps its data in the `mongo-data` volume, so `make down` is not
destructive and `make clean` is.

Ports are overridable, which matters on a machine already running things:

| Service | Default | Override |
|---|---|---|
| App | 3001 | `APP_PORT=3002 make dev-local` |
| Mongo | 27017 | `MONGO_PORT=27018 make dev-local` |
| FastAPI | 8000 | `API_PORT=…` |

Those are only the *published* ports. Inside compose, containers reach each
other by service name — `mongo:27017`, `api:8000` — which is why the Node
process is told `API_URL=http://api:8000` and not a localhost address. If
another stack on the machine already holds a number, move the published one and
nothing inside changes.

### What reloads, and what needs a rebuild

Every layer watches its own files, and each watches only its own — a component
edit must not restart the Node process, or Vite's HMR is pointless.

| You edit | What happens | How |
|---|---|---|
| `src/**` — React, styles | The browser updates in place, state kept | Vite HMR through the `.:/app` mount |
| `server.ts`, `svgAssetRoutes.ts` | Node restarts in ~1s | `tsx watch`, with `src/**` ignored so it stays out of Vite's way |
| `server/app/**` — Python | uvicorn restarts in ~1s | `--reload` over the `./server/app:/srv/app` mount |
| `server/tests/**` | Nothing runs by itself | `make test-api` |

And the things a watcher cannot pick up, because they change the *image* rather
than the code inside it:

| You change | Do this |
|---|---|
| `package.json` — a new npm dependency | `make dev-local` (rebuilds, and renews the `node_modules` volume) |
| `server/pyproject.toml` — a new Python dependency | `make dev-local` |
| `Dockerfile`, `docker-compose.yml`, env vars | `make dev-local` |
| `server/app/indexes.py` — a new index | `make migrate`, or restart the API (startup applies them) |

`make dev-local` is idempotent and safe to re-run at any time: it rebuilds what
changed, leaves the database volume alone, and reprints the URLs.

Prefer running Node on the host? `docker compose up -d mongo api` for the
database and the service, then `npm run dev` in a terminal. `server/.env` holds
the service's secrets; the repo's `.env` keeps Node's.

**Model parity is the one thing that will rot.** `events.ts` and
`models/events.py` describe the same wire format in two languages. Keep
`LEARNING_SCHEMA_VERSION` honest, have the server accept unknown fields rather
than 422 on them, and reject only what it must — an older tablet must never be
locked out by a newer server.

### What exists in which phase

| Phase | Files that appear |
|---|---|
| P0 ✅ | `main` · `settings` · `db` · `indexes` · `rbac` · `deps` · `errors` · `models/{common,auth,family}` · `repos/{base,users,families,memberships,devices}` · `services/{passwords,tokens}` · `routers/{health,auth,devices}` · `middleware/requests` · `cli` · `tests/{auth,rbac,tenancy}`. Client `api`/`session` still to come |
| P1 | `models/events` · `repos/{events,rollups,counters}` · `services/{sync,rollup}` · `routers/sync` (push) · client `outbox`/`engine` |
| P2 | `models/{sync,family}` · `repos/{docs,memberships,invitations}` · `services/codes` · `routers/{family,learners,devices}` · changes endpoint · client `apply`/`kinds`/account UI |
| P2.5 | `repos/{grants,audit}` · `services/{grants,audit,mailer}` · `routers/admin` · `cli create-admin` · TOTP |
| P3 | parent view endpoints · `svg_assets` repo and router |

---

## 11. Security and privacy

- Passwords: Argon2id. Never logged, never returned.
- Refresh tokens and join codes: random 32 bytes, stored as SHA-256 hashes,
  rotated on use, revocable per device.
- Rate limits on `/auth/*`: 10/min per IP, 5/min per email or code; lockout with
  exponential delay after 10 failures on one account.
- Authorisation is §5: permissions from a single table, tenancy from the token.
  TOTP is mandatory for staff, admin tokens are rejected by `/v1/sync/*`, and
  staff cannot read a child's record without a time-boxed, audited, parent-visible grant.
- CORS locked to the app origin; behind TLS in production; Mongo reachable only
  from the API (compose network or Atlas IP allowlist with SCRAM).
- **Children's data minimisation stays a design rule, not a promise.** Events
  already carry no names, no free text a child typed, no audio. The server must
  reject unknown top-level fields on events rather than store them, so a future
  careless client cannot start uploading text.
- A learner's `displayName` and optional birth *year* are the only child data.
- `DELETE /v1/learners/{id}` cascades events, docs and rollups in one call —
  build it in phase 2, not "later", because it is the thing you cannot retrofit
  under time pressure.

---

## 12. Phases

Each phase is shippable and leaves the app working if the next never happens.

**P0 — skeleton. Built.** `server/` with the layering below, Mongo indexes
applied on startup, the Express `/v1` proxy, and auth end to end: signup, login,
refresh with rotation, logout, `/auth/me`, `/devices`. The `rbac.py` table and
`require()` exist from the first route — retrofitting authorisation is what
makes it leaky — with all four family roles and both staff roles filled in, and
`tests/test_rbac.py` asserting the §5 matrix cell by cell. What is *not* here
yet: the client half (`api.ts`, `session.ts`) and any sign-in UI.
*Done when:* a parent can sign in and the app is otherwise unchanged.

**P1 — events up. Built.** `outbox.ts`, `engine.ts`, `POST /v1/sync/push`,
the rollup service and `GET /v1/sync/profile/{learnerId}`, plus a one-time
**backfill**: a device played on before it had an account hands its whole local
ring to the outbox on first install, because signing in must not restart the
record from zero.
*Done when:* play a round in airplane mode, reconnect, and the server's concept
totals match the local profile exactly. **They do** — 441 events uploaded from a
real device, 16 concepts, zero mismatches.

**P2 — documents both ways, and the family.** Mutations, conflicts,
`GET /v1/sync/changes`, learner creation, join codes, learner deletion — plus
memberships: invite a second parent, invite a caregiver, transfer ownership,
list and revoke devices. Parent-only surfaces and the parent PIN land here,
because this is the release where a second adult can appear.
*Done when:* a kid signs in on a second tablet with a code and their progress,
XP and edited lesson wording are all there — and a caregiver can see it without
being able to change a single setting.

**P2.5 — staff.** The audit log, grants, TOTP, `python -m app.cli create-admin`,
and a small admin console on its own surface: find a family, see account shape,
revoke a device, action a deletion request, request a grant.
*Done when:* you can answer a support email without touching Mongo directly, and
every thing you did is in the audit log.

**P3 — the parent view, and art.** A read-only parent screen over the rollups
(practised concepts, accuracy trend, time spent), then the SVG library moves to
Mongo so a deployed app can edit art (`docs/PLUGINS.md` §art, and the generated
`SvgAssetId` union becomes a build-time snapshot of the collection).

**Deliberately not now:** websockets/live updates, CRDTs, per-field merge beyond
the progress rule, classroom and teacher roles (a school is a different tenancy
model, not another role), SSO, per-learner scoping of a caregiver, data export
tooling.

---

## 13. Open decisions

1. **Where it runs.** Mongo Atlas free tier + a small container host is the
   cheapest real deployment; `docker compose` locally either way.
2. **Does `learnerId` migrate or restart?** Simplest is: on first claim, the
   existing device `learnerId` becomes the server learner's id, so nothing local
   has to be rewritten. It only breaks if two children shared one device before
   signing up — worth accepting for the prototype.
3. **Do parents get their own device rows?** Yes as written (a parent phone is a
   device with family scope), which is what makes "sign out that tablet" work.
4. **Does a caregiver see every child, or named ones?** Written as every child in
   the family, because per-learner scoping doubles the permission model for a
   case that may never come up. The membership row has room for a `learnerIds`
   field when it does.
5. **Deletion is a request, not a button, for staff.** A parent deletes their own
   family outright; an admin actioning "delete my data" gets an audited,
   reason-carrying path with a 7-day soft-delete window. Confirm that window.
6. **Event volume.** ~30 events per round. A child playing daily for a year is
   roughly 300 k events — fine for Mongo, but the 400-day TTL is what keeps it
   from being a decision you have to make later under pressure.
