import type { TopicCategory, UserProgress } from "../types";

/**
 * The learner's own progress, kept on this device.
 *
 * Everything else already survived a reload — skill settings, the scoring
 * rates, store listings — while the child's XP and stars did not, because they
 * were plain React state seeded with demo values. So a round played yesterday
 * left no trace, which is the one thing that makes testing a change confusing.
 *
 * One learner per device for now. A real account moves this to the server; the
 * shape does not have to change for that.
 */

const PROGRESS_KEY = "koda_learner_progress_v1";
const LEVELS_KEY = "koda_completed_levels_v1";

/** A learner who has done nothing yet. */
export const EMPTY_PROGRESS: UserProgress = {
  xp: 0,
  level: 1,
  streakDays: 0,
  problemsSolved: 0,
  dailyGoal: 5,
  dailySolved: 0,
  unlockedSkills: [],
  // Every topic at zero: the type is a closed set, so a fresh learner is
  // "no mastery anywhere", not "no topics".
  masteryByTopic: Object.fromEntries(
    (
      [
        "balance_equations",
        "fraction_lab",
        "spatial_puzzles",
        "exponent_growth",
        "coordinate_quest",
        "logic_matrix",
        "number_bonds",
        "base_ten_blocks",
        "time_and_money",
      ] as TopicCategory[]
    ).map((t) => [t, 0]),
  ) as Record<TopicCategory, number>,
  recentBadges: [],
};

const read = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? ({ ...fallback, ...JSON.parse(raw) } as T) : fallback;
  } catch {
    return fallback;
  }
};

const write = (key: string, value: unknown): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // A blocked or full store must not take the app down. The session still
    // works; it just will not be there next time.
  }
};

export const loadProgress = (): UserProgress => read(PROGRESS_KEY, EMPTY_PROGRESS);
export const saveProgress = (p: UserProgress): void => write(PROGRESS_KEY, p);

/** levelNumber -> best stars earned. */
export const loadCompletedLevels = (): Record<number, number> => read(LEVELS_KEY, {});
export const saveCompletedLevels = (levels: Record<number, number>): void =>
  write(LEVELS_KEY, levels);

/** Back to a learner who has done nothing. Used by Settings. */
export const clearProgress = (): void => {
  try {
    localStorage.removeItem(PROGRESS_KEY);
    localStorage.removeItem(LEVELS_KEY);
  } catch {
    /* see write() */
  }
};
