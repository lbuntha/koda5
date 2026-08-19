/**
 * What is waiting to reach the server.
 *
 * A queue in `localStorage`, capped. Deliberately not IndexedDB yet: the whole
 * queue is parsed on append, which is fine at this size and would not be once
 * art moves into Mongo or a tablet is shared by a class. That is the signal to
 * move this one file — not before.
 *
 * Events never coalesce. They are the record, and two taps are two facts.
 * (Document mutations will coalesce by key when P2 adds them, because only the
 * latest body of a setting matters.)
 */

import type { LearningEvent } from "../learning/events";

const STORAGE_KEY = "koda_outbox_v1";

/**
 * Roughly 65 rounds of full detail — comfortably more than a child produces
 * between connections, and small enough to stay inside a storage quota next to
 * everything else the app keeps.
 */
const MAX_EVENTS = 2000;

interface Outbox {
  events: LearningEvent[];
}

const listeners = new Set<() => void>();
let queue: Outbox = load();

function load(): Outbox {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Outbox) : null;
    return parsed && Array.isArray(parsed.events) ? parsed : { events: [] };
  } catch {
    return { events: [] };
  }
}

function save(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  } catch {
    // A full or blocked store must not take a round down. The local learning
    // log is still the record; this copy is what is *pending upload*.
  }
  listeners.forEach((fn) => fn());
}

export const Outbox = {
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  size: (): number => queue.events.length,

  peek: (limit: number): LearningEvent[] => queue.events.slice(0, limit),

  add(events: LearningEvent[]): void {
    if (!events.length) return;
    queue.events.push(...events);
    // Oldest first when trimming: recent work is what a recommendation reads,
    // and the server's rollup already has whatever arrived earlier.
    if (queue.events.length > MAX_EVENTS) {
      queue.events = queue.events.slice(-MAX_EVENTS);
    }
    save();
  },

  /** Drop what the server accepted, by id. Duplicates count as accepted. */
  ack(ids: string[]): void {
    if (!ids.length) return;
    const done = new Set(ids);
    queue.events = queue.events.filter((event) => !done.has(event.id));
    save();
  },

  clear(): void {
    queue = { events: [] };
    save();
  },
};
