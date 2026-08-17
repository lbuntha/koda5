import { PluginManagerAPI, type LearningPlugin } from "../lib/pluginStore";
import { plugin as counting } from "./counting";
import type { AnyActivityDefinition, Lesson, SkillPlugin } from "./types";

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

/**
 * A skill is visible when it is published AND enabled for this install.
 * `draft` and `beta` stay out of the learner-facing UI while still shipping in
 * the bundle, so deploying and launching are separate decisions.
 */
export const isVisible = (p: SkillPlugin): boolean => {
  if (p.manifest.status !== "published") return false;
  // A plugin the store has never seen is enabled by default: its manifest is the
  // source of truth until someone changes it in Plugin Lab. Asking the store about
  // an unknown id returns `false`, which would silently hide a freshly registered
  // skill — and take its lessons out of the course with it.
  const known = PluginManagerAPI.getPlugin(p.manifest.id) !== undefined;
  return known ? PluginManagerAPI.isPluginEnabled(p.manifest.id) : true;
};

export const visiblePlugins = (): SkillPlugin[] => PLUGINS.filter(isVisible);

/** All lessons from all visible skills, in registry order. */
export const allLessons = (): Lesson[] => visiblePlugins().flatMap((p) => p.lessons);
