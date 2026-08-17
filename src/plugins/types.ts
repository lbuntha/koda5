import type React from "react";
import type { PluginFeature, PluginActionLog } from "../lib/pluginStore";

export type SoundType = "pop" | "clink" | "success" | "hint" | "levelup" | "error";
export type PluginAction = PluginActionLog["actionType"];

/** Read-only copy of learner state. A copy, never live app state — live state
 *  cannot cross a process boundary if a plugin is ever sandboxed. */
export interface LearnerSnapshot {
  xp: number;
  level: number;
  streakDays: number;
  problemsSolved: number;
  dailyGoal: number;
  dailySolved: number;
}

export interface SkillResult {
  levelNumber: number;
  stars: number;
  xpEarned: number;
  accuracy?: number;
}

/**
 * The global API every skill is handed.
 *
 * Injected, never a `window` global: injection can be versioned, mocked in tests,
 * scoped per plugin, and survives the move to an iframe — a `window.Koda` does
 * none of those.
 *
 * Every call that could ever cross a process boundary returns a Promise, even
 * where today's implementation is synchronous. That keeps a later RPC/iframe
 * swap a drop-in instead of a rewrite of every skill.
 */
export interface KodaSDK {
  readonly pluginId: string;

  /* Fire-and-forget feedback — safe to stay synchronous. */
  sound: {
    play(type: SoundType): void;
  };

  haptics: {
    tap(): void;
    success(): void;
  };

  speech: {
    say(text: string, opts?: { rate?: number }): Promise<void>;
    stop(): void;
  };

  /* Learner progress. XP is a host API — a skill reports what was earned and
     never owns the running total, because it is shared across all skills. */
  progress: {
    awardXp(amount: number): Promise<void>;
    complete(result: SkillResult): Promise<void>;
    snapshot(): Promise<LearnerSnapshot>;
  };

  /* Server-backed AI. Already async; the host proxies so no key reaches a skill. */
  ai: {
    tutor(userMessage: string, context?: Record<string, unknown>): Promise<string>;
    generateProblem(spec: Record<string, unknown>): Promise<unknown>;
    analyzeDrawing(imageBase64: string, prompt?: string): Promise<string>;
  };

  /* Settings and feature flags, pre-bound to this plugin's id — a skill cannot
     read another plugin's configuration by accident. */
  config: {
    get<T>(key: string, fallback: T): T;
    isEnabled(featureId: string, fallback?: boolean): boolean;
  };

  log(action: PluginAction, detail: string, level?: number, step?: number): void;

  ui: {
    readonly theme: "light" | "dark";
    exit(): void;
  };
}

/* -------------------------------------------------------------------------- */
/* Activities — what a skill can DO. The unit of reuse.                        */
/* -------------------------------------------------------------------------- */

export interface ActivityProps<P = Record<string, unknown>> {
  /** Lesson-supplied configuration, merged over the activity's defaults. */
  params: P;
  level: number;
  koda: KodaSDK;
  onComplete(result: SkillResult): void;
}

export interface ActivityDefinition<P = Record<string, unknown>> {
  id: string;
  name: string;
  defaultParams: P;
  component: React.ComponentType<ActivityProps<P>>;
}

/**
 * Type-erased activity, as stored in a registry.
 *
 * Each activity has its own params type, so a map holding several of them cannot
 * name one concrete `P`. The erasure stops here: `ActivityProps<P>` keeps full
 * typing inside the component that declares it.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyActivityDefinition = ActivityDefinition<any>;

/* -------------------------------------------------------------------------- */
/* Lessons — what is taught. Curriculum, not capability.                       */
/* -------------------------------------------------------------------------- */

export interface Lesson {
  id: string;
  title: string;
  /** What mastery is tracked against, independent of which skill hosts it. */
  concept: string;
  /** Activity reference, "pluginId/activityId". May point at another plugin. */
  activity: string;
  params?: Record<string, unknown>;
  xpReward: number;
  icon?: string;
  difficulty?: "Easy" | "Medium" | "Hard";
}

/* -------------------------------------------------------------------------- */
/* The plugin                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Learning domain. Groups skills by what they teach, independent of any national
 * grade system. The nine roadmap stages map onto these.
 */
export type LearningCategory =
  | "number-sense" // counting, subitizing, comparing, conservation
  | "patterns" // sorting, sequencing, rules
  | "operations" // addition, subtraction, multiplication
  | "place-value" // ten-frames, base ten, teen numbers
  | "fractions" // partitioning, equivalence
  | "measurement" // time, money, length
  | "geometry"; // shape, space, position

/**
 * Who a skill is for.
 *
 * Ages, not grades: grade labels differ by country (US grade 1, UK year 2,
 * different cutoffs again elsewhere), so a grade field cannot be compared across
 * learners. An age range is universal and maps onto any local system.
 */
export interface Audience {
  /** Inclusive age range in years, e.g. [5, 7]. */
  ages: [number, number];
  category: LearningCategory;
}

/** Release state. Lets a skill ship in the bundle while staying invisible to learners. */
export type ReleaseStatus = "draft" | "beta" | "published";

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  /** Technical kind, as carried by the existing `LearningPlugin` in pluginStore. */
  category: "core" | "utility" | "assistant" | "visualizer" | "manipulative";
  author: string;
  iconName: string;
  status: ReleaseStatus;
  audience: Audience;
}

/**
 * One complete skill, built and owned by one developer in one folder.
 *
 * It declares what it can do (`activities`) and what it teaches (`lessons`).
 * It deliberately does not decide where its lessons sit in the global order —
 * that belongs to the course, so two skills can never fight over a lesson.
 */
export interface SkillPlugin {
  manifest: PluginManifest;
  features: PluginFeature[];
  settings: Record<string, unknown>;
  activities: Record<string, AnyActivityDefinition>;
  lessons: Lesson[];
}
