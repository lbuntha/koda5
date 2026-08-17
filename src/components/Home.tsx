import React, { useState } from "react";
import { Activity, ArrowRight, Compass, Flame, Lightbulb, Star, Target, Zap } from "lucide-react";
import { UserProgress } from "../types";
import { FLOWING_LEVELS } from "../plugins/counting/internal/data/countingAssets";
import { playSound } from "../utils/audio";
import { themeSystem } from "../lib/themeSystem";
import {
  UIFeatureCard,
  UIFeatureCardAction,
  UISectionHeader,
  UIStatGrid,
  UIStatTile,
  UIPathGrid,
  UIPathNode,
  UIUnitBanner,
  UIUnitCard,
} from "./ui";

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

  // Group levels into Duolingo-style "Sections" / Units
  const sections = [
    {
      unitNumber: 1,
      title: "Unit 1: Subitizing & Dot Matrix",
      description: "Master instant sight counting, 1-to-1 correspondence & 5-anchor arrays",
      color: "from-indigo-600 to-indigo-700",
      accentBg: "bg-indigo-600",
      accentBorder: "border-indigo-600",
      icon: "🌱",
      levels: FLOWING_LEVELS.slice(0, 4), // Levels 1 to 4
    },
    {
      unitNumber: 2,
      title: "Unit 2: Ten-Frames & Place Value",
      description: "Build mental anchors of 5 and 10 with interactive frames & grouped rods",
      color: "from-indigo-600 to-indigo-700",
      accentBg: "bg-indigo-600",
      accentBorder: "border-indigo-600",
      icon: "⚡",
      levels: FLOWING_LEVELS.slice(4, 8), // Levels 5 to 8
    },
    {
      unitNumber: 3,
      title: "Unit 3: Quantity Comparison & Number Line",
      description: "Compare sets, estimate spatial magnitudes, and explore sequences",
      color: "from-indigo-600 to-indigo-700",
      accentBg: "bg-indigo-600",
      accentBorder: "border-indigo-600",
      icon: "🔮",
      levels: FLOWING_LEVELS.slice(8, 12), // Levels 9 to 12
    },
    {
      unitNumber: 4,
      title: "Unit 4: 100-Chart & Skip Counting",
      description: "Pattern recognition in 2s, 5s, and 10s up to 100 with master speed drills",
      color: "from-indigo-600 to-indigo-700",
      accentBg: "bg-indigo-600",
      accentBorder: "border-indigo-600",
      icon: "👑",
      levels: FLOWING_LEVELS.slice(12, 15), // Levels 13 to 15
    },
  ];

  // Calculate current active level details
  const currentActiveLevel =
    FLOWING_LEVELS.find((l) => l.levelNumber === activeLevelNumber) || FLOWING_LEVELS[0];

  const totalMasteredCount = Object.keys(completedLevels).length;
  const totalStarsCount = Object.values(completedLevels).reduce((a: number, b: number) => a + (Number(b) || 0), 0);

  return (
    <div className={`w-full ${themeSystem.spacing.section} animate-fadeIn pb-6`}>
      {/* ============================================================ */}
      {/* 1. HEADER STATUS STRIP - SIMPLE SLATE CARDS                   */}
      {/* ============================================================ */}
      <UIStatGrid>
        <UIStatTile
          icon={<Flame className="fill-current" />}
          value={`${userProgress.streakDays || 5} DAYS`}
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
          value={`${totalMasteredCount} / 15`}
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
              {currentActiveLevel.skillConcept}
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
            label: "+50 XP",
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

      {/* ============================================================ */}
      {/* 3. WINDING LEARNING PATH (ROADMAP / UNITS)                      */}
      {/* ============================================================ */}
      <div className={themeSystem.spacing.section}>
        <UISectionHeader
          icon="🔮"
          title="Your Math Learning Journey"
          subtitle="Step through structured skill stepping stones to earn crowns & master number sense"
        />

        {/* Units List */}
        <div className={themeSystem.spacing.section}>
          {sections.map((sec, unitIdx) => (
            <UIUnitCard key={sec.unitNumber}>
              <UIUnitBanner
                icon={sec.icon}
                title={sec.title}
                description={sec.description}
                badge={`${sec.levels.length} Stepping Stones`}
              />

              {/* Stepping Stone Nodes */}
              <UIPathGrid>
                {sec.levels.map((lvl) => {
                  const stars = completedLevels[lvl.levelNumber] || 0;
                  const isCompleted = stars > 0;
                  const isCurrent = lvl.levelNumber === activeLevelNumber;
                  const isLocked = lvl.levelNumber > activeLevelNumber + 1 && !isCompleted;

                  const state = isCurrent
                    ? "current"
                    : isCompleted
                      ? "completed"
                      : isLocked
                        ? "locked"
                        : "available";

                  return (
                    <UIPathNode
                      key={lvl.levelNumber}
                      state={state}
                      icon={lvl.icon}
                      stars={stars}
                      startLabel="Start"
                      title={`L${lvl.levelNumber}: ${lvl.title}`}
                      subtitle={lvl.skillConcept}
                      onClick={() => {
                        playSound("pop");
                        onStartLearning(lvl.levelNumber);
                      }}
                    />
                  );
                })}
              </UIPathGrid>
            </UIUnitCard>
          ))}
        </div>
      </div>
    </div>
  );
};
