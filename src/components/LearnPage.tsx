import React, { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Play } from "lucide-react";
import { getCourseUnits, isUnlocked, type ResolvedLesson } from "../curriculum";
import { getSkill } from "../skills/registry";
import { useInstalledSkills } from "../lib/skillStore";
import { useViewer } from "../skills/viewer";
import { playSound } from "../utils/audio";
import { ScoringAPI } from "../lib/scoring";
import { themeSystem } from "../lib/themeSystem";
import {
  UIPathGrid,
  UIPathNode,
  UISectionHeader,
  UISkillThumbnail,
  skillArtFor,
} from "./ui";

export interface LearnPageProps {
  activeLevelNumber: number;
  /** levelNumber -> stars. */
  completedLevels: Record<number, number>;
  onStartLesson(levelNumber: number): void;
}

interface SkillGroup {
  skillId: string;
  name: string;
  description: string;
  ages?: [number, number];
  category?: string;
  version?: string;
  author?: string;
  /** Store listing — the installed value, which may differ from the manifest. */
  tagline: string;
  thumbnail?: string;
  lessons: ResolvedLesson[];
  done: number;
  /** Where this skill resumes: first unfinished lesson, or the last one. */
  next: ResolvedLesson;
}

const starsOf = (completed: Record<number, number>, lesson: ResolvedLesson) =>
  completed[lesson.levelNumber] ?? 0;

/**
 * Where a learner chooses what to practise, across every installed skill.
 *
 * One card per skill, not one list of every lesson: with two skills the flat
 * path was already eighteen stones long, and the second skill's lessons sat
 * past any sensible "next" cutoff so nothing ever offered them. A card says
 * where that skill stands and resumes it in one tap; the stones stay folded
 * away until someone wants to jump around.
 *
 * Order still comes from the course — this page groups it, it does not reorder
 * it — so sequencing stays in one place, and a disabled or age-gated lesson is
 * already gone before it arrives here.
 */
export const LearnPage: React.FC<LearnPageProps> = ({
  activeLevelNumber,
  completedLevels,
  onStartLesson,
}) => {
  const viewer = useViewer();
  // Listings are edited in the Skill Manager, so the page reads them from the store
  // rather than the manifest — an edit shows up here without a reload.
  const installed = useInstalledSkills();
  const [expanded, setExpanded] = useState<string | null>(null);

  const groups = useMemo<SkillGroup[]>(() => {
    const bySkill = new Map<string, ResolvedLesson[]>();
    for (const unit of getCourseUnits(viewer)) {
      for (const lesson of unit.lessons) {
        bySkill.set(lesson.skillId, [...(bySkill.get(lesson.skillId) ?? []), lesson]);
      }
    }

    return [...bySkill.entries()].map(([skillId, lessons]) => {
      const manifest = getSkill(skillId)?.manifest;
      const listing = installed.find((p) => p.id === skillId);
      return {
        skillId,
        name: manifest?.name ?? skillId,
        description: manifest?.description ?? "",
        ages: manifest?.audience.ages,
        category: manifest?.audience.category,
        version: manifest?.version,
        author: manifest?.author,
        tagline:
          listing?.tagline ?? manifest?.tagline ?? manifest?.description ?? "",
        thumbnail: listing?.thumbnail ?? manifest?.thumbnail,
        lessons,
        done: lessons.filter((l) => starsOf(completedLevels, l) > 0).length,
        next: lessons.find((l) => starsOf(completedLevels, l) === 0) ?? lessons[lessons.length - 1],
      };
    });
  }, [viewer, completedLevels, installed]);

  // The lead card resumes whatever the learner was last on, whichever skill
  // that belongs to — the one question this page has to answer immediately.
  const resume =
    groups.flatMap((g) => g.lessons).find((l) => l.levelNumber === activeLevelNumber) ??
    groups[0]?.next;
  const resumeSkill = groups.find((g) => g.skillId === resume?.skillId);

  if (groups.length === 0) {
    return (
      <div className="w-full flex-1 min-h-[50vh] flex items-center justify-center text-center">
        <div className="max-w-sm">
          <p className="font-mono font-black text-slate-900 dark:text-white">Nothing to learn yet</p>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Every skill is switched off, or none suits this learner's age. Turn one back on in
            Skills.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={themeSystem.spacing.section}>
      {resume && resumeSkill && (
        <section
          className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${
            skillArtFor(resumeSkill.category).art
          } p-5 sm:p-7 text-white`}
        >
          <span className="text-[11px] font-mono font-black uppercase tracking-widest text-white/80">
            Continue · {resumeSkill.name}
          </span>
          <h2 className="mt-1 font-mono font-black text-2xl sm:text-3xl leading-tight">
            {resume.title}
          </h2>
          <p className="mt-1 text-sm text-white/85 max-w-xl">{resume.concept}</p>

          <div className="mt-4 flex items-center gap-3 flex-wrap">
            <button
              onClick={() => {
                playSound("pop");
                onStartLesson(resume.levelNumber);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-slate-900 font-mono font-black text-xs uppercase tracking-wider hover:bg-white/90 active:scale-95 transition cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-slate-900" />
              Continue
            </button>
            <span className="text-[11px] font-mono font-bold text-white/80">
              L{resume.levelNumber} · up to +{ScoringAPI.current().xpPerLevel} XP
            </span>
          </div>
        </section>
      )}

      <div className={themeSystem.spacing.section}>
        <UISectionHeader
          title="Skills"
          subtitle={`${groups.length} installed. Open one to jump to any stepping stone.`}
        />

        {/* One list, hairline-divided: the App Store row — artwork, what it is,
            and a single pill that says what tapping does. */}
        <div className={themeSystem.card("default", "divide-y-2 divide-slate-100 dark:divide-slate-800")}>
          {groups.map((group) => {
            const isOpen = expanded === group.skillId;
            const percent = Math.round((group.done / Math.max(1, group.lessons.length)) * 100);
            const complete = group.done === group.lessons.length;
            const art = skillArtFor(group.category);

            return (
              <div key={group.skillId}>
                <div className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
                  <UISkillThumbnail
                    thumbnail={group.thumbnail}
                    fallbackIconName={group.lessons[0]?.iconName}
                    category={group.category}
                    size="md"
                  />

                  <div className="min-w-0 flex-1">
                    <h3 className="font-mono font-black text-sm sm:text-base text-ink truncate">
                      {group.name}
                    </h3>
                    <p className="text-xs text-muted truncate">{group.tagline}</p>
                    <p className="mt-0.5 text-[11px] font-mono text-muted truncate">
                      {art.label}
                      {group.ages ? ` · ages ${group.ages[0]}–${group.ages[1]}` : ""}
                      {group.author ? ` · ${group.author}` : ""}
                      {group.version ? ` · v${group.version}` : ""}
                      {` · ${group.done}/${group.lessons.length} done`}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <button
                      onClick={() => {
                        playSound("pop");
                        onStartLesson(group.next.levelNumber);
                      }}
                      className="px-4 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-black text-[11px] uppercase tracking-wider active:scale-95 transition cursor-pointer"
                    >
                      {complete ? "Replay" : group.done > 0 ? "Continue" : "Start"}
                    </button>
                    <button
                      onClick={() => {
                        playSound("pop");
                        setExpanded(isOpen ? null : group.skillId);
                      }}
                      aria-expanded={isOpen}
                      aria-label={`${isOpen ? "Hide" : "Show"} ${group.name} lessons`}
                      className="flex items-center gap-1 text-[11px] font-mono font-bold text-muted hover:text-ink transition cursor-pointer"
                    >
                      {group.lessons.length} lessons
                      {isOpen ? (
                        <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Progress hairline, the width of the row */}
                <div className="px-3 sm:px-4 pb-3">
                  <div className="h-1 bg-surface-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${art.art} rounded-full transition-all duration-300`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                {isOpen && (
                  <div className="px-3 sm:px-4 pb-4">
                    <UIPathGrid>
                      {group.lessons.map((lesson) => {
                        const stars = starsOf(completedLevels, lesson);
                        const isCompleted = stars > 0;
                        const isCurrent = lesson.levelNumber === activeLevelNumber;
                        // The rule itself belongs to the course, not to the page
                        // that draws the padlock.
                        const isLocked = !isCurrent && !isUnlocked(lesson, completedLevels, viewer);

                        return (
                          <UIPathNode
                            key={lesson.levelNumber}
                            state={
                              isCurrent
                                ? "current"
                                : isCompleted
                                  ? "completed"
                                  : isLocked
                                    ? "locked"
                                    : "available"
                            }
                            icon={lesson.icon}
                            stars={stars}
                            startLabel="Start"
                            title={`L${lesson.levelNumber}: ${lesson.title}`}
                            subtitle={lesson.concept}
                            onClick={() => {
                              playSound("pop");
                              onStartLesson(lesson.levelNumber);
                            }}
                          />
                        );
                      })}
                    </UIPathGrid>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
