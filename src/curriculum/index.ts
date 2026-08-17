import { getPlugin, isVisible } from "../plugins/registry";
import type { Lesson } from "../plugins/types";
import courseJson from "./course.json";

/**
 * The course — what is taught, in what order.
 *
 * Sequencing lives here and nowhere else, so two skills can never fight over a
 * lesson's position and reordering a unit never touches a plugin folder. A unit
 * may freely mix lessons from different skills: `lessons` holds
 * "pluginId/lessonId" references, not imports.
 */
export interface CourseUnitConfig {
  id: string;
  unitNumber: number;
  title: string;
  description: string;
  icon: string;
  lessons: string[];
}

/** A unit with its references resolved to real lessons. */
export interface CourseUnit extends Omit<CourseUnitConfig, "lessons"> {
  lessons: ResolvedLesson[];
}

export interface ResolvedLesson extends Lesson {
  /** "pluginId/lessonId" — how the course names it. */
  ref: string;
  pluginId: string;
  /** Position within the whole course, 1-based. What the learner calls "level N". */
  levelNumber: number;
}

const config = courseJson.units as CourseUnitConfig[];

/**
 * Resolve one reference. Returns undefined when the owning plugin is missing or
 * not visible, so disabling a skill removes its lessons from the course rather
 * than leaving a broken entry behind.
 */
function resolve(ref: string, levelNumber: number): ResolvedLesson | undefined {
  const [pluginId, lessonId] = ref.split("/");
  const owner = getPlugin(pluginId);
  if (!owner || !isVisible(owner)) return undefined;

  const lesson = owner.lessons.find((l) => l.id === lessonId);
  if (!lesson) return undefined;

  return { ...lesson, ref, pluginId, levelNumber };
}

/**
 * The course as the dashboard should render it: units in order, each holding
 * only lessons whose plugin is present and visible. Empty units are dropped.
 */
export function getCourseUnits(): CourseUnit[] {
  let level = 0;
  return config
    .map((unit) => ({
      ...unit,
      lessons: unit.lessons
        .map((ref) => resolve(ref, ++level))
        .filter((l): l is ResolvedLesson => l !== undefined),
    }))
    .filter((unit) => unit.lessons.length > 0);
}

/** Every lesson in course order, flattened. */
export function getCourseLessons(): ResolvedLesson[] {
  return getCourseUnits().flatMap((u) => u.lessons);
}

/** The lesson a given level number refers to. */
export function getLessonByLevel(levelNumber: number): ResolvedLesson | undefined {
  return getCourseLessons().find((l) => l.levelNumber === levelNumber);
}

export const totalLessonCount = (): number => getCourseLessons().length;
