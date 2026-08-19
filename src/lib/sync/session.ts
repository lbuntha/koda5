import { ApiError, request } from "./api";

/**
 * Who this device is signed in as.
 *
 * Kept in `localStorage` on purpose: the app has to work after a week in a
 * drawer with no network, so the session cannot live only in a cookie the
 * server has to reissue. Nothing here blocks play — every call fails soft, and
 * a signed-out app is exactly the app that shipped before there was a server.
 */

const STORAGE_KEY = "koda_session_v1";

export interface Session {
  accessToken: string;
  refreshToken: string;
  /** Epoch ms. Refreshed a minute early, so a slow request does not race it. */
  expiresAt: number;
  deviceId: string;
  /** Absent for staff — an admin belongs to no family. */
  familyId?: string | null;
  role: string;
  /** "admin" or "support" for staff, "none" for everyone else. */
  platformRole?: string;
  email?: string;
  familyName?: string;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  deviceId: string;
  familyId: string | null;
  role: string;
  platformRole?: string;
}

interface MeOut {
  userId: string | null;
  email: string | null;
  familyId: string | null;
  familyName: string | null;
  role: string;
  platformRole: string;
  learnerId: string | null;
}

const listeners = new Set<() => void>();
let current: Session | null = load();

function load(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

function store(next: Session | null): void {
  current = next;
  try {
    if (next) localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // A blocked store must not take the app down; the session lasts this tab.
  }
  listeners.forEach((fn) => fn());
}

const fromPair = (pair: TokenPair, extra: Partial<Session> = {}): Session => ({
  accessToken: pair.accessToken,
  refreshToken: pair.refreshToken,
  expiresAt: Date.now() + pair.expiresIn * 1000,
  deviceId: pair.deviceId,
  familyId: pair.familyId,
  role: pair.role,
  platformRole: pair.platformRole ?? "none",
  ...extra,
});

/** Refresh a minute before expiry rather than after a 401. */
const isStale = (session: Session) => session.expiresAt - Date.now() < 60_000;

async function refresh(): Promise<Session | null> {
  if (!current) return null;
  try {
    const pair = await request<TokenPair>("/auth/refresh", {
      method: "POST",
      body: { refreshToken: current.refreshToken },
    });
    const next = fromPair(pair, { email: current.email, familyName: current.familyName });
    store(next);
    return next;
  } catch (error) {
    // Offline keeps the session — the token is stale, not wrong. A rejected
    // refresh means it was revoked, and only then is the device signed out.
    if (error instanceof ApiError && error.isOffline) return current;
    store(null);
    return null;
  }
}

/** The token to send, refreshed first if it is about to expire. */
export async function accessToken(): Promise<string | null> {
  if (!current) return null;
  if (!isStale(current)) return current.accessToken;
  const next = await refresh();
  return next?.accessToken ?? null;
}

async function loadProfile(session: Session): Promise<void> {
  try {
    const me = await request<MeOut>("/auth/me", { token: session.accessToken });
    store({
      ...session,
      email: me.email ?? undefined,
      familyName: me.familyName ?? undefined,
      role: me.role,
      platformRole: me.platformRole,
    });
  } catch {
    // The tokens are good; only the display name is missing. Not worth failing.
  }
}

/**
 * Ask the server who this device is.
 *
 * The gate in App.tsx trusts `localStorage`, and `localStorage` is typed by
 * anyone with devtools — so on every boot the stored session is put to the
 * server, and a session the server does not recognise is cleared. A forged
 * entry then buys nothing: it is gone within a second of the app loading, and
 * it never bought data anyway, because every route checks the token itself.
 *
 * Offline is the case this must not punish: a failed `fetch` leaves the session
 * exactly where it is, so a tablet that signed in last week still opens.
 */
async function verify(): Promise<boolean> {
  if (!current) return false;

  const token = await accessToken();
  if (!token) return false;

  try {
    const me = await request<MeOut>("/auth/me", { token });
    store({
      ...current,
      email: me.email ?? undefined,
      familyName: me.familyName ?? undefined,
      role: me.role,
      platformRole: me.platformRole,
    });
    return true;
  } catch (error) {
    if (error instanceof ApiError && error.isOffline) return true;
    store(null);
    return false;
  }
}

export const SessionAPI = {
  current: (): Session | null => current,

  verify,

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  async signUp(email: string, password: string, familyName: string): Promise<Session> {
    const pair = await request<TokenPair>("/auth/signup", {
      method: "POST",
      body: { email, password, familyName, deviceName: deviceName() },
    });
    const session = fromPair(pair, { email, familyName });
    store(session);
    return session;
  },

  async signIn(email: string, password: string): Promise<Session> {
    const pair = await request<TokenPair>("/auth/login", {
      method: "POST",
      body: { email, password, deviceName: deviceName() },
    });
    const session = fromPair(pair, { email });
    store(session);
    void loadProfile(session);
    return session;
  },

  async signOut(): Promise<void> {
    const token = current?.accessToken;
    // Local state clears either way: a person pressing "sign out" on a plane
    // means it, and the refresh token dies with the row when it next reaches us.
    store(null);
    if (token) {
      try {
        await request<void>("/auth/logout", { method: "POST", token });
      } catch {
        // Nothing to tell them — they are signed out here regardless.
      }
    }
  },

  refresh,
};

function deviceName(): string {
  const ua = navigator.userAgent;
  if (/iPad|Tablet/i.test(ua)) return "Tablet";
  if (/iPhone|Android/i.test(ua)) return "Phone";
  if (/Macintosh/i.test(ua)) return "Mac";
  if (/Windows/i.test(ua)) return "Windows PC";
  return "This device";
}
