import { PluginManagerAPI } from "../lib/pluginStore";
import { plugin as counting } from "./counting";
import type { AnyActivityDefinition, Lesson, SkillPlugin } from "./types";

/**
 * Every skill in the build. Adding one is a single import and a single entry —
 * this is the only file outside a plugin folder that a new skill touches.
 */
export const PLUGINS: SkillPlugin[] = [counting];

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

/**
 * A skill is visible when it is published AND enabled for this install.
 * `draft` and `beta` stay out of the learner-facing UI while still shipping in
 * the bundle, so deploying and launching are separate decisions.
 */
export const isVisible = (p: SkillPlugin): boolean =>
  p.manifest.status === "published" && PluginManagerAPI.isPluginEnabled(p.manifest.id) !== false;

export const visiblePlugins = (): SkillPlugin[] => PLUGINS.filter(isVisible);

/** All lessons from all visible skills, in registry order. */
export const allLessons = (): Lesson[] => visiblePlugins().flatMap((p) => p.lessons);
