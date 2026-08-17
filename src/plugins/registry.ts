import { PluginManagerAPI, type LearningPlugin } from "../lib/pluginStore";
import { plugin as counting } from "./counting";
import type { AnyActivityDefinition, Lesson, SkillPlugin } from "./types";
import type { Viewer } from "./viewer";

/**
 * Every skill in the build. Adding one is a single import and a single entry —
 * this is the only file outside a plugin folder that a new skill touches.
 */
export const PLUGINS: SkillPlugin[] = [counting];

/**
 * Publish every registered plugin into the settings store.
 *
 * The manifest is the single source of truth for a plugin's shape; the store
 * owns only persisted user choices. Before this, counting was declared twice —
 * once in the registry as "counting" and again in the store's hardcoded
 * DEFAULT_PLUGINS as "counting-mastery" — and the two disagreed about how many
 * features exist.
 *
 * Runs at import time so Plugin Lab and every feature check see the same list
 * regardless of which loads first.
 */
function publishToStore(): void {
  for (const p of PLUGINS) {
    const asLearningPlugin: LearningPlugin = {
      id: p.manifest.id,
      name: p.manifest.name,
      version: p.manifest.version,
      description: p.manifest.description,
      category: p.manifest.category,
      author: p.manifest.author,
      iconName: p.manifest.iconName,
      isEnabled: true,
      features: p.features,
      settings: p.settings,
    };
    PluginManagerAPI.registerPlugin(asLearningPlugin);
  }
}

publishToStore();

export const getPlugin = (id: string): SkillPlugin | undefined =>
  PLUGINS.find((p) => p.manifest.id === id);

/**
 * Resolve an activity reference of the form "pluginId/activityId".
 *
 * This flat namespace is the reuse surface: a lesson in any skill may point at
 * any activity, so overlapping pedagogy (counting teaching "making 10") reuses
 * one implementation instead of duplicating it. No cross-folder imports.
 */
export const resolveActivity = (ref: string): AnyActivityDefinition | undefined => {
  const [pluginId, activityId] = ref.split("/");
  if (!pluginId || !activityId) return undefined;
  return getPlugin(pluginId)?.activities[activityId];
};

/** Look up a lesson by "pluginId/lessonId". */
export const resolveLesson = (ref: string): Lesson | undefined => {
  const [pluginId, lessonId] = ref.split("/");
  return getPlugin(pluginId)?.lessons.find((l) => l.id === lessonId);
};

/** Why a skill is not reaching the learner. `null` means it is. */
export type HiddenReason =
  | "draft"
  | "beta-not-opted-in"
  | "outside-age-range"
  | "disabled-here"
  | null;

/**
 * The one gate. The sidebar, dashboard and course all resolve visibility here,
 * so a skill cannot be hidden in one place and showing in another.
 *
 *   draft      → developers only
 *   beta       → viewers who opted in
 *   published  → anyone in its audience
 *
 * On top of status, a parent's per-install choice can always switch a skill off.
 */
export function hiddenReason(p: SkillPlugin, viewer: Viewer): HiddenReason {
  if (p.manifest.status === "draft") {
    return viewer.isDeveloper ? null : "draft";
  }
  if (p.manifest.status === "beta" && !viewer.betaOptIn && !viewer.isDeveloper) {
    return "beta-not-opted-in";
  }

  const [minAge, maxAge] = p.manifest.audience.ages;
  if (viewer.age < minAge || viewer.age > maxAge) return "outside-age-range";

  return isEnabledHere(p) ? null : "disabled-here";
}

export const visibleTo = (p: SkillPlugin, viewer: Viewer): boolean =>
  hiddenReason(p, viewer) === null;

/**
 * A plugin the store has never seen is enabled by default: its manifest is the
 * source of truth until someone changes it in the plugin manager. Asking the
 * store about an unknown id returns `false`, which would silently hide a freshly
 * registered skill — and take its lessons out of the course with it.
 */
export function isEnabledHere(p: SkillPlugin): boolean {
  const known = PluginManagerAPI.getPlugin(p.manifest.id) !== undefined;
  return known ? PluginManagerAPI.isPluginEnabled(p.manifest.id) : true;
}

export const visiblePlugins = (viewer: Viewer): SkillPlugin[] =>
  PLUGINS.filter((p) => visibleTo(p, viewer));

/** All lessons from all visible skills, in registry order. */
export const allLessons = (viewer: Viewer): Lesson[] =>
  visiblePlugins(viewer).flatMap((p) => p.lessons);
