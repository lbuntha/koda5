import type { Lesson, SkillFeature, SkillManifest, Skill } from "../types";
import manifestJson from "./manifest.json";
import lessonsJson from "./lessons.json";
import { TouchOrbit } from "./activities/TouchOrbit";
import { SubitizingRush } from "./activities/SubitizingRush";
import { TenFrameRocket } from "./activities/TenFrameRocket";
import { FroggySkip } from "./activities/FroggySkip";
import { Base10Foundry } from "./activities/Base10Foundry";

/**
 * Counting — the reference skill.
 *
 * Metadata and curriculum are JSON so they can be edited, exported and (later)
 * served without a rebuild. Only the activities are code.
 *
 * Five activities, not one: each is a way of counting rather than a level
 * number, so a lesson picks the one it wants and the activity never asks which
 * level it is. This replaced a single fifteen-level component whose state, judge
 * and render for level 15 were in scope while level 1 played.
 */
const { features, settings, settingsSchema, ...manifestFields } = manifestJson;

export const skill: Skill = {
  manifest: manifestFields as SkillManifest,
  features: features as SkillFeature[],
  settings: settings as Record<string, unknown>,
  settingsSchema: settingsSchema as Skill["settingsSchema"],
  lessons: lessonsJson.lessons as unknown as Lesson[],

  activities: {
    orbit: {
      id: "orbit",
      name: "Touch and Count",
      defaultParams: { mode: "row", questionsPerRound: 5 },
      component: TouchOrbit,
    },
    subitize: {
      id: "subitize",
      name: "Subitizing Rush",
      defaultParams: { display: "grid", questionsPerRound: 5 },
      component: SubitizingRush,
    },
    tenframe: {
      id: "tenframe",
      name: "Ten-Frame Rocket",
      defaultParams: { mode: "fill", questionsPerRound: 5 },
      component: TenFrameRocket,
    },
    numberline: {
      id: "numberline",
      name: "Froggy Skip",
      defaultParams: { mode: "hop", questionsPerRound: 5 },
      component: FroggySkip,
    },
    base10: {
      id: "base10",
      name: "Base-10 Foundry",
      defaultParams: { targetRange: [11, 35], bundleOnes: true, questionsPerRound: 5 },
      component: Base10Foundry,
    },
  },
};
