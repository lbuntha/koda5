import React, { useState } from "react";
import { Activity, ArrowRight, Compass, Flame, Lightbulb, Star, Target, Zap } from "lucide-react";
import { UserProgress } from "../types";
import { getCourseUnits, getLessonByLevel, totalLessonCount } from "../curriculum";
import { playSound } from "../utils/audio";
import { themeSystem } from "../lib/themeSystem";
import { ScoringAPI } from "../lib/scoring";
import { UIFeatureCard, UIFeatureCardAction, UIStatGrid, UIStatTile } from "./ui";

interface HomeProps {
  userProgress: UserProgress;
  activeLevelNumber: number;
  completedLevels: Record<number, number>; // levelNumber -> stars
  onStartLearning: (levelNumber?: number) => void;
}

export const Home: React.FC<HomeProps> = ({
  userProgress,
  activeLevelNumber,
  completedLevels,
  onStartLearning,
}) => {
  const [selectedSection, setSelectedSection] = useState<number>(1);

  // Units come from the course, which resolves each "skillId/lessonId"
  // reference through the registry. Adding a skill needs no edit here.
  const sections = getCourseUnits();

  // Calculate current active level details
  const sectionsList = sections;
  const currentActiveLevel =
    getLessonByLevel(activeLevelNumber) ?? sectionsList[0]?.lessons[0];

  const totalMasteredCount = Object.keys(completedLevels).length;
  const totalStarsCount = Object.values(completedLevels).reduce((a: number, b: number) => a + (Number(b) || 0), 0);

  // Every skill can be disabled from the Skill Manager, which empties the course. Say so
  // rather than rendering a dashboard with nothing behind it.
  if (!currentActiveLevel) {
    return (
      <div className="w-full flex-1 min-h-[50vh] flex items-center justify-center text-center">
        <div className="max-w-sm">
          <p className="font-mono font-black text-slate-900 dark:text-white">No skills enabled</p>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Turn a skill back on in Settings to see the learning path.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${themeSystem.spacing.section} animate-fadeIn pb-6`}>
      {/* ============================================================ */}
      {/* 1. HEADER STATUS STRIP - SIMPLE SLATE CARDS                   */}
      {/* ============================================================ */}
      <UIStatGrid>
        <UIStatTile
          icon={<Flame className="fill-current" />}
          // `|| 5` dressed an empty learner up as a five-day streak.
          value={`${userProgress.streakDays} DAYS`}
          label="Learning Streak"
          tone="streak"
        />
        <UIStatTile
          icon={<Zap className="fill-current" />}
          value={`${userProgress.xp} XP`}
          label="Total Points"
        />
        <UIStatTile
          icon={<Star className="fill-current" />}
          value={`${totalMasteredCount} / ${totalLessonCount()}`}
          label="Skills Mastered"
        />
        <UIStatTile
          icon={<Target />}
          value={`${userProgress.dailySolved} / ${userProgress.dailyGoal}`}
          label="Daily Target"
        />
      </UIStatGrid>

      {/* ============================================================ */}
      {/* 2. HERO BANNER - SIMPLE SLATE & INDIGO CARD STYLE             */}
      {/* ============================================================ */}
      <UIFeatureCard
        icon={<Compass className="animate-spin-slow" />}
        eyebrow={`LVL ${currentActiveLevel.levelNumber} Recommended`}
        title={currentActiveLevel.title}
        noteIcon={<Lightbulb className="w-4 h-4 text-amber-500 dark:text-amber-400" />}
        note={
          <>
            <strong className={themeSystem.featureCard.noteStrong}>
              {currentActiveLevel.concept}
            </strong>{" "}
            — {currentActiveLevel.pedagogyTip}
          </>
        }
        metaLead="Visualizer & Quiz Mode"
        meta={[
          {
            icon: <Activity className="text-indigo-600 dark:text-indigo-400" />,
            label: currentActiveLevel.difficulty,
          },
          {
            icon: <Star className="text-amber-500 dark:text-amber-400 fill-current" />,
            // Was a hardcoded "+50 XP"; the rate is one setting now.
            label: `up to +${ScoringAPI.current().xpPerLevel} XP`,
          },
        ]}
        action={
          <UIFeatureCardAction
            onClick={() => {
              playSound("pop");
              onStartLearning(activeLevelNumber);
            }}
          >
            <span>EXPLORE LAB</span>
            <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition" />
          </UIFeatureCardAction>
        }
      />

    </div>
  );
};
