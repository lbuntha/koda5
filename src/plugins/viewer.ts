import { useEffect, useState } from "react";

/**
 * Who is looking at the app.
 *
 * There is no backend or accounts yet, so this lives in localStorage. It exists
 * as its own concept anyway because release gating needs to ask questions about
 * the person, not the plugin: how old they are, whether they opted into betas,
 * whether they are a developer.
 */
export interface Viewer {
  /** Learner age in years. Drives audience matching. */
  age: number;
  /** Opted into beta skills. */
  betaOptIn: boolean;
  /** Sees draft skills. Developer machines only. */
  isDeveloper: boolean;
}

const STORAGE_KEY = "koda_viewer_v1";

export const DEFAULT_VIEWER: Viewer = {
  age: 6,
  betaOptIn: false,
  isDeveloper: import.meta.env.DEV,
};

function read(): Viewer {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_VIEWER;
    return { ...DEFAULT_VIEWER, ...(JSON.parse(raw) as Partial<Viewer>) };
  } catch {
    return DEFAULT_VIEWER;
  }
}

let current: Viewer = read();
const subscribers = new Set<() => void>();

export const getViewer = (): Viewer => current;

export function setViewer(patch: Partial<Viewer>): void {
  current = { ...current, ...patch };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch {
    /* storage unavailable — keep the in-memory value */
  }
  subscribers.forEach((fn) => fn());
}

/** Reactive read, so gating updates the moment the viewer changes. */
export function useViewer(): Viewer {
  const [viewer, setLocal] = useState<Viewer>(current);

  useEffect(() => {
    const sync = () => setLocal(current);
    subscribers.add(sync);
    sync();
    return () => {
      subscribers.delete(sync);
    };
  }, []);

  return viewer;
}
