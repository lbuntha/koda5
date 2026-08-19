/**
 * When the outbox drains, and what happens when it cannot.
 *
 * The rules are the offline ones, applied to sending rather than to sessions:
 * a failure that means "no connection" keeps the queue and backs off; a failure
 * that means "the server refused this" also keeps the queue, because dropping a
 * child's record on a 400 would be worse than sending it again later.
 *
 * Single-flight: a flush in progress swallows further triggers rather than
 * queueing three copies of the same batch behind a slow network.
 */

import { ApiError, request } from "./api";
import { Outbox } from "./outbox";
import { SessionAPI, accessToken } from "./session";

/** One request's worth. The server's own limit is 500. */
const BATCH_SIZE = 200;

/** While the queue is non-empty and the network is up. */
const IDLE_INTERVAL_MS = 30_000;

const BACKOFF_MIN_MS = 2_000;
const BACKOFF_MAX_MS = 60_000;

export type SyncState = "idle" | "sending" | "offline" | "signed-out";

export interface SyncStatus {
  state: SyncState;
  pending: number;
  lastSentAt: number | null;
  lastError: string | null;
}

interface PushOut {
  accepted: number;
  duplicates: number;
  cursor: number;
}

let status: SyncStatus = { state: "idle", pending: Outbox.size(), lastSentAt: null, lastError: null };
let inFlight = false;
let backoffMs = BACKOFF_MIN_MS;
let timer: ReturnType<typeof setTimeout> | null = null;
let started = false;

const listeners = new Set<() => void>();

function setStatus(patch: Partial<SyncStatus>): void {
  status = { ...status, ...patch, pending: Outbox.size() };
  listeners.forEach((fn) => fn());
}

function scheduleRetry(): void {
  if (timer) clearTimeout(timer);
  // Full jitter: twenty tablets in one classroom coming back at once should not
  // arrive as one spike.
  const wait = Math.random() * backoffMs;
  timer = setTimeout(() => void flush(), wait);
  backoffMs = Math.min(backoffMs * 2, BACKOFF_MAX_MS);
}

/**
 * Send what is queued, oldest first.
 *
 * Returns quietly rather than throwing: nothing in the app is waiting on this,
 * and a failed upload is not something a child should ever be told about.
 */
export async function flush(): Promise<void> {
  if (inFlight) return;
  if (!Outbox.size()) {
    setStatus({ state: "idle", lastError: null });
    return;
  }

  const session = SessionAPI.current();
  if (!session) {
    // Signed out with work still queued. Keep it: signing back in on this
    // device should send it, not discard it.
    setStatus({ state: "signed-out" });
    return;
  }

  inFlight = true;
  setStatus({ state: "sending" });

  try {
    while (Outbox.size()) {
      const batch = Outbox.peek(BATCH_SIZE);
      const token = await accessToken();
      if (!token) {
        setStatus({ state: "signed-out" });
        return;
      }

      await request<PushOut>("/sync/push", {
        method: "POST",
        token,
        body: {
          schemaVersion: 1,
          deviceId: session.deviceId,
          sentAt: new Date().toISOString(),
          events: batch,
        },
      });

      // Accepted *and* duplicate both mean the server has them — a replayed
      // batch is a no-op there, so anything else would strand the queue.
      Outbox.ack(batch.map((event) => event.id));
    }

    backoffMs = BACKOFF_MIN_MS;
    setStatus({ state: "idle", lastSentAt: Date.now(), lastError: null });
  } catch (error) {
    const problem = error as ApiError;
    if (problem.isOffline) {
      setStatus({ state: "offline", lastError: null });
    } else {
      // A refusal is kept, not dropped: better a stuck queue somebody can see
      // than a silently discarded record.
      setStatus({ state: "idle", lastError: problem.message });
    }
    scheduleRetry();
  } finally {
    inFlight = false;
  }
}

/** Queue events for upload. Called by the learning log's sink. */
export function record(events: readonly unknown[]): void {
  Outbox.add(events as never[]);
  setStatus({});
  void flush();
}

/**
 * Start the loop. Idempotent, so a hot reload does not stack listeners.
 *
 * Five triggers, each for a real moment: the app opening, the network coming
 * back, a tablet being closed mid-round, a periodic sweep while work is
 * waiting, and anything newly recorded.
 */
export function start(): () => void {
  if (started) return () => undefined;
  started = true;

  const onOnline = () => {
    backoffMs = BACKOFF_MIN_MS;
    void flush();
  };
  const onHidden = () => {
    if (document.visibilityState === "hidden") void flush();
  };

  window.addEventListener("online", onOnline);
  document.addEventListener("visibilitychange", onHidden);
  const interval = setInterval(() => {
    if (Outbox.size()) void flush();
  }, IDLE_INTERVAL_MS);

  const unsubscribe = Outbox.subscribe(() => setStatus({}));
  void flush();

  return () => {
    window.removeEventListener("online", onOnline);
    document.removeEventListener("visibilitychange", onHidden);
    clearInterval(interval);
    unsubscribe();
    started = false;
  };
}

export const SyncEngine = {
  status: (): SyncStatus => status,
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  flush,
  record,
  start,
};
