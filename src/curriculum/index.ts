import { getPlugin, visibleTo } from "../plugins/registry";
import { getViewer } from "../plugins/viewer";
import type { Viewer } from "../plugins/viewer";
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
/**
 * How far above a learner's age a lesson may still be offered.
 *
 * Zero would wall a child off from anything slightly ahead, which is where
 * learning happens; unlimited is what produced the current problem, where a
 * five-year-old meets Grade 2 place value inside a skill labelled for ages 5-7.
 * One year is the stretch band.
 */
const STRETCH_YEARS = 1;

function resolve(ref: string, levelNumber: number, viewer: Viewer): ResolvedLesson | undefined {
  const [pluginId, lessonId] = ref.split("/");
  const owner = getPlugin(pluginId);
  if (!owner || !visibleTo(owner, viewer)) return undefined;

  const lesson = owner.lessons.find((l) => l.id === lessonId);
  if (!lesson) return undefined;

  // A lesson carries the age band of the standard it teaches. Anything more
  // than a year beyond the learner is held back rather than shown and failed.
  if (lesson.ageBand && lesson.ageBand[0] > viewer.age + STRETCH_YEARS) return undefined;

  return { ...lesson, ref, pluginId, levelNumber };
}

/**
 * The course as the dashboard should render it: units in order, each holding
 * only lessons whose plugin is present and visible. Empty units are dropped.
 */
export function getCourseUnits(viewer: Viewer = getViewer()): CourseUnit[] {
  let level = 0;
  return config
    .map((unit) => ({
      ...unit,
      lessons: unit.lessons
        .map((ref) => resolve(ref, ++level, viewer))
        .filter((l): l is ResolvedLesson => l !== undefined),
    }))
    .filter((unit) => unit.lessons.length > 0);
}

/** Every lesson in course order, flattened. */
export function getCourseLessons(viewer?: Viewer): ResolvedLesson[] {
  return getCourseUnits(viewer).flatMap((u) => u.lessons);
}

/** The lesson a given level number refers to. */
export function getLessonByLevel(
  levelNumber: number,
  viewer?: Viewer,
): ResolvedLesson | undefined {
  return getCourseLessons(viewer).find((l) => l.levelNumber === levelNumber);
}

export const totalLessonCount = (): number => getCourseLessons().length;
