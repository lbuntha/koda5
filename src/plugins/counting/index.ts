import type { Lesson, PluginManifest, SkillPlugin } from "../types";
import type { PluginFeature } from "../../lib/pluginStore";
import manifestJson from "./manifest.json";
import lessonsJson from "./lessons.json";
import { CountingQuest } from "./activities/CountingQuest";

/**
 * Counting — the reference plugin.
 *
 * Metadata and curriculum are JSON so they can be edited, exported and (later)
 * served without a rebuild. Only the activity components are code.
 */
const { features, settings, ...manifestFields } = manifestJson;

export const plugin: SkillPlugin = {
  manifest: manifestFields as PluginManifest,
  features: features as PluginFeature[],
  settings: settings as Record<string, unknown>,
  lessons: lessonsJson.lessons as Lesson[],

  activities: {
    quest: {
      id: "quest",
      name: "Counting Quest",
      defaultParams: { level: 1 },
      component: CountingQuest,
    },
  },
};
