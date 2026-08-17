import React, { useState } from "react";
import {
  Sparkles,
  Star,
  Lock,
  Unlock,
  CheckCircle2,
  ArrowRight,
  Play,
  RotateCcw,
  Zap,
  CircleDot,
  Layers,
  Clock,
  Scale,
  PieChart,
  Box,
  Compass,
  Cpu,
  Trophy,
  Flame,
  Award,
} from "lucide-react";
import { SKILL_GROWTH_ROADMAP, SkillQuestStage } from "../data/skillTreeRoadmap";
import { TopicCategory, UserProgress } from "../types";
import { playSound } from "../utils/audio";

interface SkillAdventureMapProps {
  userProgress: UserProgress;
  stageStars: Record<string, number>; // stageId -> stars (0-3)
  onSelectSandbox: (stage: SkillQuestStage) => void;
  onLaunchQuest: (stage: SkillQuestStage) => void;
  onLaunchQuiz: (topic: TopicCategory) => void;
}

export const SkillAdventureMap: React.FC<SkillAdventureMapProps> = ({
  userProgress,
  stageStars,
  onSelectSandbox,
  onLaunchQuest,
  onLaunchQuiz,
}) => {
  const [selectedStage, setSelectedStage] = useState<SkillQuestStage>(SKILL_GROWTH_ROADMAP[0]);
  const [filter, setFilter] = useState<"all" | "early" | "growing">("all");

  const totalStarsEarned = Object.values(stageStars).reduce((a: number, b: number) => a + (b || 0), 0);
  const maxPossibleStars = SKILL_GROWTH_ROADMAP.length * 3;

  const isStageUnlocked = (stageIndex: number): boolean => {
    if (stageIndex === 0) return true;
    const prevStage = SKILL_GROWTH_ROADMAP[stageIndex - 1];
    const prevStars = stageStars[prevStage.id] || 0;
    // Stage is unlocked if previous stage has at least 1 star or user level >= stageNumber
    return prevStars >= 1 || userProgress.level >= SKILL_GROWTH_ROADMAP[stageIndex].stageNumber;
  };

  const getStageIcon = (iconName: string) => {
    switch (iconName) {
      case "CircleDot":
        return <CircleDot className="w-6 h-6" />;
      case "Box":
        return <Box className="w-6 h-6" />;
      case "Scale":
        return <Scale className="w-6 h-6" />;
      case "Zap":
        return <Zap className="w-6 h-6" />;
      case "Compass":
        return <Compass className="w-6 h-6" />;
      case "Layers":
        return <Layers className="w-6 h-6" />;
      case "Cpu":
        return <Cpu className="w-6 h-6" />;
      case "PieChart":
        return <PieChart className="w-6 h-6" />;
      default:
        return <Sparkles className="w-6 h-6" />;
    }
  };

  const filteredStages = SKILL_GROWTH_ROADMAP.filter((stage) => {
    if (filter === "early") return stage.stageNumber <= 4;
    if (filter === "growing") return stage.stageNumber >= 5;
    return true;
  });

  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto space-y-6">
      {/* Adventure Header Banner */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-purple-950/40 via-[#0a0a0a] to-cyan-950/40 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-gradient-to-r from-amber-500/20 to-purple-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 shadow">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                Kid Skill Growth Odyssey
              </span>
              <span className="text-xs font-mono text-gray-400">Step-by-Step Natural Progression</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Math Explorer World Map
            </h2>
            <p className="text-sm text-gray-300 max-w-xl leading-relaxed">
              Grow by real mathematical skills! Master intuitive hands-on sandboxes, beat quest challenges, and collect stars to unlock new worlds.
            </p>
          </div>

          {/* Gamified Stats Pill Container */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Stars Count */}
            <div className="p-3.5 bg-black/60 border border-amber-500/30 rounded-2xl flex items-center gap-3 shadow-lg">
              <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
                <Star className="w-5 h-5 fill-current" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-gray-400 uppercase block">Total Stars</span>
                <span className="text-lg font-mono font-black text-amber-300">
                  {totalStarsEarned} / {maxPossibleStars}
                </span>
              </div>
            </div>

            {/* Player Level */}
            <div className="p-3.5 bg-black/60 border border-cyan-500/30 rounded-2xl flex items-center gap-3 shadow-lg">
              <div className="p-2 bg-cyan-500/20 text-cyan-400 rounded-xl">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-gray-400 uppercase block">Player Rank</span>
                <span className="text-lg font-mono font-black text-cyan-300">
                  Level {userProgress.level}
                </span>
              </div>
            </div>

            {/* Streak */}
            <div className="p-3.5 bg-black/60 border border-rose-500/30 rounded-2xl flex items-center gap-3 shadow-lg">
              <div className="p-2 bg-rose-500/20 text-rose-400 rounded-xl">
                <Flame className="w-5 h-5 fill-current" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-gray-400 uppercase block">Streak</span>
                <span className="text-lg font-mono font-black text-rose-300">
                  {userProgress.streakDays} Days
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between bg-[#0a0a0a] border border-white/10 rounded-2xl p-2 font-mono gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              playSound("pop");
              setFilter("all");
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === "all" ? "bg-white text-black font-black" : "text-gray-400 hover:text-white bg-white/5"
            }`}
          >
            All 9 Stages
          </button>
          <button
            onClick={() => {
              playSound("pop");
              setFilter("early");
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === "early" ? "bg-emerald-400 text-black font-black" : "text-gray-400 hover:text-white bg-white/5"
            }`}
          >
            Foundations (Stage 1–4)
          </button>
          <button
            onClick={() => {
              playSound("pop");
              setFilter("growing");
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === "growing" ? "bg-purple-400 text-black font-black" : "text-gray-400 hover:text-white bg-white/5"
            }`}
          >
            Operations & Value (Stage 5–9)
          </button>
        </div>

        <span className="text-xs font-mono text-gray-400 px-3 py-1">
          Click any realm node to preview & play
        </span>
      </div>

      {/* 2-Column Layout: World Map Path & Realm Spotlight Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 7 Cols: Interactive Adventure Path */}
        <div className="lg:col-span-7 space-y-4">
          <div className="space-y-3">
            {filteredStages.map((stage, idx) => {
              const originalIndex = SKILL_GROWTH_ROADMAP.findIndex((s) => s.id === stage.id);
              const unlocked = isStageUnlocked(originalIndex);
              const isSelected = selectedStage.id === stage.id;
              const stars = stageStars[stage.id] || 0;

              return (
                <div
                  key={stage.id}
                  onClick={() => {
                    playSound("pop");
                    setSelectedStage(stage);
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex items-center justify-between gap-4 ${
                    isSelected
                      ? `bg-black ${stage.colorTheme.border} ${stage.colorTheme.glow} scale-[1.02] border-2`
                      : unlocked
                      ? "bg-[#0a0a0a] hover:bg-white/5 border-white/10"
                      : "bg-[#080808]/60 border-white/5 opacity-60"
                  }`}
                >
                  {/* Left Stage Icon & Titles */}
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-transform ${
                        unlocked
                          ? `${stage.colorTheme.badgeBg} ${stage.colorTheme.textAccent}`
                          : "bg-white/5 text-gray-500 border border-white/10"
                      }`}
                    >
                      {unlocked ? getStageIcon(stage.iconName) : <Lock className="w-5 h-5 text-gray-500" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-gray-400 uppercase">
                          Stage {stage.stageNumber}
                        </span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${stage.colorTheme.badgeBg}`}>
                          {stage.realmName}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-white tracking-tight mt-0.5">
                        {stage.skillTitle}
                      </h4>
                      <p className="text-xs text-gray-400 truncate max-w-[220px] sm:max-w-xs">
                        {stage.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Right Stars & Status */}
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    {unlocked ? (
                      <div className="flex items-center gap-1">
                        {[1, 2, 3].map((starNum) => (
                          <Star
                            key={starNum}
                            className={`w-4 h-4 ${
                              starNum <= stars
                                ? "text-amber-400 fill-current drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                                : "text-gray-700"
                            }`}
                          />
                        ))}
                      </div>
                    ) : (
                      <span className="text-[10px] font-mono text-gray-500 flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Locked
                      </span>
                    )}

                    <span
                      className={`text-[10px] font-mono font-bold ${
                        isSelected ? stage.colorTheme.textAccent : "text-gray-500"
                      }`}
                    >
                      {isSelected ? "● Selected" : "Inspect →"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 5 Cols: Realm Inspector & Launch Controls */}
        <div className="lg:col-span-5 sticky top-6 space-y-4">
          <div className={`p-6 bg-[#0a0a0a] rounded-3xl border ${selectedStage.colorTheme.border} ${selectedStage.colorTheme.glow} space-y-5 shadow-2xl`}>
            <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${selectedStage.colorTheme.badgeBg}`}>
                    Stage {selectedStage.stageNumber} Realm
                  </span>
                  <span className="text-[10px] font-mono text-gray-400">{selectedStage.ageGuide}</span>
                </div>
                <h3 className="text-xl font-black text-white mt-1">{selectedStage.skillTitle}</h3>
                <p className="text-xs text-gray-300 mt-1">{selectedStage.subtitle}</p>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-amber-400">
                <div className="flex items-center gap-1">
                  {[1, 2, 3].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${
                        s <= (stageStars[selectedStage.id] || 0)
                          ? "text-amber-400 fill-current drop-shadow"
                          : "text-gray-700"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Cognitive Goal & Key Insights */}
            <div className="space-y-3">
              <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 space-y-1">
                <span className="text-[10px] font-mono font-bold text-gray-400 uppercase">
                  Growth Target & Mental Model
                </span>
                <p className="text-xs text-gray-200 leading-relaxed font-sans">
                  {selectedStage.cognitiveGoal}
                </p>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-mono font-bold text-gray-400 uppercase">
                  Key Skills Explored:
                </span>
                <ul className="space-y-1">
                  {selectedStage.keyConcepts.map((concept, idx) => (
                    <li key={idx} className="text-xs text-gray-300 flex items-start gap-2">
                      <span className={`text-xs ${selectedStage.colorTheme.textAccent}`}>✓</span>
                      <span>{concept}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="space-y-2.5 pt-2 border-t border-white/10">
              {/* Play Mini-Game Quest */}
              <button
                onClick={() => {
                  playSound("pop");
                  onLaunchQuest(selectedStage);
                }}
                className={`w-full py-3.5 px-4 bg-gradient-to-r ${selectedStage.colorTheme.primary} hover:opacity-90 text-black font-black font-mono text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-2`}
                style={{ backgroundColor: selectedStage.colorTheme.primary }}
              >
                <Play className="w-4 h-4 fill-current" />
                Play Quest Mini-Game ({selectedStage.questLevels.length} Tasks)
              </button>

              {/* Open Manipulatives Sandbox */}
              <button
                onClick={() => {
                  playSound("pop");
                  onSelectSandbox(selectedStage);
                }}
                className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white font-bold font-mono text-xs rounded-xl border border-white/10 transition flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Open Hands-On Manipulative Studio
              </button>

              {/* Take Concept Quiz */}
              <button
                onClick={() => {
                  playSound("pop");
                  onLaunchQuiz(selectedStage.topic);
                }}
                className="w-full py-2.5 px-4 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-gray-200 font-mono text-[11px] rounded-xl border border-white/5 transition flex items-center justify-center gap-2"
              >
                Take 3-Question Concept Check →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
