import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * What a lost connection may and may not do to a signed-in device.
 *
 * The gate in App.tsx means "no session" now equals "no app", so the rules that
 * used to be a nicety are load-bearing: offline must never clear a session, and
 * a server that says the session is gone must.
 */

const STORAGE_KEY = "koda_session_v1";

const storedSession = (overrides: Record<string, unknown> = {}) => ({
  accessToken: "access-token",
  refreshToken: "refresh-token",
  // Comfortably valid, so nothing refreshes unless a test wants it to.
  expiresAt: Date.now() + 10 * 60 * 1000,
  deviceId: "d_1",
  familyId: "f_1",
  role: "owner",
  email: "parent@example.com",
  ...overrides,
});

const loadSession = async () => {
  const module = await import("./session");
  return module.SessionAPI;
};

beforeEach(() => {
  vi.resetModules();
  localStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("a signed-in device that loses the network", () => {
  it("keeps the session when the fetch itself fails", async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storedSession()));
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));

    const SessionAPI = await loadSession();
    await expect(SessionAPI.verify()).resolves.toBe(true);
    expect(SessionAPI.current()).not.toBeNull();
  });

  it("keeps the session when the data service is down behind the proxy", async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storedSession()));
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        json: async () => ({ error: { code: "api_unreachable", message: "not running" } }),
      }),
    );

    const SessionAPI = await loadSession();
    await expect(SessionAPI.verify()).resolves.toBe(true);
    expect(SessionAPI.current()).not.toBeNull();
  });

  it("keeps the session when the token is stale and refresh cannot reach anyone", async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(storedSession({ expiresAt: Date.now() - 1000 })),
    );
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));

    const SessionAPI = await loadSession();
    await SessionAPI.verify();
    expect(SessionAPI.current()?.email).toBe("parent@example.com");
  });
});

describe("a session the server no longer honours", () => {
  it("is cleared when /auth/me rejects it", async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storedSession()));
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: { code: "unauthorized", message: "Sign in to continue." } }),
      }),
    );

    const SessionAPI = await loadSession();
    await expect(SessionAPI.verify()).resolves.toBe(false);
    expect(SessionAPI.current()).toBeNull();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("is cleared when a refresh is refused — the device was revoked", async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(storedSession({ expiresAt: Date.now() - 1000 })),
    );
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: { code: "refresh_invalid", message: "Please sign in again." } }),
      }),
    );

    const SessionAPI = await loadSession();
    await SessionAPI.verify();
    expect(SessionAPI.current()).toBeNull();
  });
});

describe("signing out", () => {
  it("clears this device even when the server cannot be told", async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storedSession()));
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));

    const SessionAPI = await loadSession();
    await SessionAPI.signOut();
    expect(SessionAPI.current()).toBeNull();
  });
});
