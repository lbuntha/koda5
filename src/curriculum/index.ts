import { getSkill, visibleTo } from "../skills/registry";
import { getViewer } from "../skills/viewer";
import type { Viewer } from "../skills/viewer";
import type { Lesson } from "../skills/types";
import courseJson from "./course.json";
import { withLessonEdits } from "../lib/lessonContent";

/**
 * The course — what is taught, in what order.
 *
 * Sequencing lives here and nowhere else, so two skills can never fight over a
 * lesson's position and reordering a unit never touches a skill folder. A unit
 * may freely mix lessons from different skills: `lessons` holds
 * "skillId/lessonId" references, not imports.
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
  /** "skillId/lessonId" — how the course names it. */
  ref: string;
  skillId: string;
  /** Position within the whole course, 1-based. What the learner calls "level N". */
  levelNumber: number;
}

const config = courseJson.units as CourseUnitConfig[];

/**
 * Resolve one reference. Returns undefined when the owning skill is missing or
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
  const [skillId, lessonId] = ref.split("/");
  const owner = getSkill(skillId);
  if (!owner || !visibleTo(owner, viewer)) return undefined;

  const lesson = owner.lessons.find((l) => l.id === lessonId);
  if (!lesson) return undefined;

  // A lesson carries the age band of the standard it teaches. Anything more
  // than a year beyond the learner is held back rather than shown and failed.
  if (lesson.ageBand && lesson.ageBand[0] > viewer.age + STRETCH_YEARS) return undefined;

  // A teacher's wording edit applies here, once, rather than at each display.
  return { ...withLessonEdits(skillId, lesson), ref, skillId, levelNumber };
}

/**
 * The course as the dashboard should render it: units in order, each holding
 * only lessons whose skill is present and visible. Empty units are dropped.
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

/** Every lesson one skill contributes, in course order. */
export function getSkillLessons(skillId: string, viewer?: Viewer): ResolvedLesson[] {
  return getCourseLessons(viewer).filter((l) => l.skillId === skillId);
}

/**
 * Whether a lesson is open to this learner yet.
 *
 * Progression runs per skill, not across the whole course: a global "one past
 * your current level" cutoff locked every lesson of the second skill behind the
 * whole of the first, which is not what "next" means when two skills teach
 * different things.
 *
 * Lives here rather than in the page that draws the padlock, so the learning
 * path and anything else asking "can they do this yet?" cannot disagree.
 */
export function isUnlocked(
  lesson: ResolvedLesson,
  completed: Record<number, number>,
  viewer?: Viewer,
): boolean {
  if ((completed[lesson.levelNumber] ?? 0) > 0) return true;

  const siblings = getSkillLessons(lesson.skillId, viewer);
  const index = siblings.findIndex((l) => l.levelNumber === lesson.levelNumber);
  if (index <= 0) return true;

  return (completed[siblings[index - 1].levelNumber] ?? 0) > 0;
}
