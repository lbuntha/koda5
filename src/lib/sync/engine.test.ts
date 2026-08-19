import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * What the upload loop does with a network that is not there.
 *
 * The rule under test: a queued event is never lost. Not when the connection
 * drops, not when the app restarts, not when the server refuses the batch, and
 * not when somebody signs out mid-round.
 */

const SESSION_KEY = "koda_session_v1";
const OUTBOX_KEY = "koda_outbox_v1";

const event = (id: string) => ({
  id,
  ts: "2026-08-19T09:00:00.000Z",
  type: "answer_submitted",
  sessionId: "s_1",
  learnerId: "l_mia",
  seq: 1,
  skillId: "counting",
  conceptKey: "corresponder",
  correct: true,
  attempt: 1,
});

const signIn = () =>
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({
      accessToken: "access-token",
      refreshToken: "refresh-token",
      expiresAt: Date.now() + 10 * 60 * 1000,
      deviceId: "d_1",
      familyId: "f_1",
      role: "owner",
    }),
  );

const load = async () => {
  const [{ SyncEngine }, { Outbox }] = await Promise.all([
    import("./engine"),
    import("./outbox"),
  ]);
  return { SyncEngine, Outbox };
};

const okPush = () =>
  vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({ accepted: 1, duplicates: 0, cursor: 1 }),
  });

beforeEach(() => {
  vi.resetModules();
  localStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("sending", () => {
  it("empties the queue when the server takes the batch", async () => {
    signIn();
    const fetchMock = okPush();
    vi.stubGlobal("fetch", fetchMock);

    const { SyncEngine, Outbox } = await load();
    SyncEngine.record([event("e_1"), event("e_2")]);
    await vi.waitFor(() => expect(Outbox.size()).toBe(0));

    const [, init] = fetchMock.mock.calls[0];
    const body = JSON.parse(init.body);
    expect(body.events).toHaveLength(2);
    expect(init.headers.Authorization).toBe("Bearer access-token");
  });

  it("treats duplicates as delivered, so a replay cannot strand the queue", async () => {
    signIn();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ accepted: 0, duplicates: 2, cursor: 9 }),
      }),
    );

    const { SyncEngine, Outbox } = await load();
    SyncEngine.record([event("e_1"), event("e_2")]);
    await vi.waitFor(() => expect(Outbox.size()).toBe(0));
  });
});

describe("with no connection", () => {
  it("keeps every event and reports itself offline", async () => {
    signIn();
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));

    const { SyncEngine, Outbox } = await load();
    SyncEngine.record([event("e_1")]);

    await vi.waitFor(() => expect(SyncEngine.status().state).toBe("offline"));
    expect(Outbox.size()).toBe(1);
    expect(SyncEngine.status().pending).toBe(1);
  });

  it("survives a restart — the queue is on disk, not in memory", async () => {
    signIn();
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));

    const first = await load();
    first.SyncEngine.record([event("e_1"), event("e_2")]);
    await vi.waitFor(() => expect(first.Outbox.size()).toBe(2));

    // A new app load, same device.
    vi.resetModules();
    vi.stubGlobal("fetch", okPush());
    const second = await load();
    expect(second.Outbox.size()).toBe(2);

    await second.SyncEngine.flush();
    await vi.waitFor(() => expect(second.Outbox.size()).toBe(0));
  });

  it("keeps the queue when the server refuses the batch", async () => {
    signIn();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 422,
        json: async () => ({ error: { code: "unprocessable", message: "Bad batch." } }),
      }),
    );

    const { SyncEngine, Outbox } = await load();
    SyncEngine.record([event("e_1")]);

    await vi.waitFor(() => expect(SyncEngine.status().lastError).toBe("Bad batch."));
    expect(Outbox.size()).toBe(1);
  });
});

describe("signed out", () => {
  it("holds the work, and sends it once somebody signs in", async () => {
    // One mock for both routes: signing in has to go through SessionAPI, not
    // through localStorage, or the test proves something the app never does.
    const fetchMock = vi.fn(async (url: string) => {
      if (String(url).endsWith("/auth/login")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            accessToken: "access-token",
            refreshToken: "refresh-token",
            expiresIn: 900,
            deviceId: "d_1",
            familyId: "f_1",
            role: "owner",
          }),
        };
      }
      return { ok: true, status: 200, json: async () => ({ accepted: 1, duplicates: 0, cursor: 1 }) };
    });
    vi.stubGlobal("fetch", fetchMock);

    const { SyncEngine, Outbox } = await load();
    const { SessionAPI } = await import("./session");

    SyncEngine.record([event("e_1")]);
    await vi.waitFor(() => expect(SyncEngine.status().state).toBe("signed-out"));
    expect(Outbox.size()).toBe(1);
    expect(fetchMock).not.toHaveBeenCalled();

    await SessionAPI.signIn("parent@example.com", "123456");
    await SyncEngine.flush();
    await vi.waitFor(() => expect(Outbox.size()).toBe(0));
  });
});

describe("the stored queue", () => {
  it("is the same shape a later load can read", async () => {
    signIn();
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));

    const { SyncEngine } = await load();
    SyncEngine.record([event("e_1")]);

    await vi.waitFor(() => {
      const stored = JSON.parse(localStorage.getItem(OUTBOX_KEY) ?? "{}");
      expect(stored.events).toHaveLength(1);
      expect(stored.events[0].id).toBe("e_1");
    });
  });
});
