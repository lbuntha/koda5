import React, { useState } from "react";
import {
  Sparkles,
  CircleDot,
  Eye,
  Zap,
  Layers,
  ChevronRight,
  CheckCircle2,
  HelpCircle,
  Award,
  ArrowRight,
  RefreshCw,
  BookOpen,
  Bot,
  Brain,
  Star,
  Compass,
} from "lucide-react";
import {
  SkillProgressionModel,
  SkillProgressionLevel,
  ProgressionQuizQuestion,
} from "../types/skillProgression";
import {
  COUNTING_PROGRESSION_DATA,
  OTHER_SKILL_PROGRESSION_TEMPLATES,
} from "../plugins/counting/internal/data/countingProgressionData";
import { playSound } from "../utils/audio";

interface SkillProgressionLabProps {
  onRewardXp?: (xp: number) => void;
  onAskSoraHint?: (hintText: string) => void;
}

export const SkillProgressionLab: React.FC<SkillProgressionLabProps> = ({
  onRewardXp,
  onAskSoraHint,
}) => {
  // Skill selection (Counting is primary, with lightweight templates for others)
  const allSkills: SkillProgressionModel[] = [
    COUNTING_PROGRESSION_DATA,
    ...OTHER_SKILL_PROGRESSION_TEMPLATES,
  ];
  const [selectedSkillId, setSelectedSkillId] = useState<string>("counting_foundations");
  const activeSkill = allSkills.find((s) => s.id === selectedSkillId) || COUNTING_PROGRESSION_DATA;

  // Active level within selected skill
  const [activeLevelNumber, setActiveLevelNumber] = useState<number>(1);
  const activeLevel: SkillProgressionLevel =
    activeSkill.levels.find((l) => l.levelNumber === activeLevelNumber) || activeSkill.levels[0];

  // User Interactive Sandbox States
  // Mode 1: 1-to-1 Touch Counting
  const [touchItemsCount, setTouchItemsCount] = useState<number>(7);
  const [tappedIndices, setTappedIndices] = useState<number[]>([]);
  const [objectEmoji, setObjectEmoji] = useState<"🚀" | "⭐" | "🍎" | "🐱">("🚀");

  // Mode 2: Flash Subitizing
  const [subitizingCount, setSubitizingCount] = useState<number>(5);
  const [flashHidden, setFlashHidden] = useState<boolean>(false);
  const [userGuess, setUserGuess] = useState<number | null>(null);
  const [flashStreak, setFlashStreak] = useState<number>(0);

  // Mode 3: Ten Frame Anchor
  const [tenFrameCells, setTenFrameCells] = useState<boolean[]>(
    Array(10)
      .fill(false)
      .map((_, i) => i < 8)
  );

  // Mode 4: Skip Counting Number Line
  const [skipInterval, setSkipInterval] = useState<2 | 5 | 10>(5);
  const [activeSkipSteps, setActiveSkipSteps] = useState<number>(3);

  // Mode 5: Base 10 Bundling
  const [looseOnes, setLooseOnes] = useState<number>(14);
  const [tenRods, setTenRods] = useState<number>(3);
  const [hundredFlats, setHundredFlats] = useState<number>(1);

  // Quiz State
  const [quizQuestionIndex, setQuizQuestionIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [isQuizCompleted, setIsQuizCompleted] = useState<boolean>(false);
  const [showAiHint, setShowAiHint] = useState<boolean>(false);

  // Completed levels tracking
  const [completedLevels, setCompletedLevels] = useState<Record<string, boolean>>({
    cnt_lvl_1: true,
  });

  // Handlers for Sandbox
  const handleTouchItem = (index: number) => {
    playSound("pop");
    if (!tappedIndices.includes(index)) {
      const next = [...tappedIndices, index];
      setTappedIndices(next);
      if (next.length === touchItemsCount) {
        playSound("success");
        if (onRewardXp) onRewardXp(20);
      }
    }
  };

  const handleFlashRandom = () => {
    playSound("pop");
    const nextCount = Math.floor(Math.random() * 6) + 1;
    setSubitizingCount(nextCount);
    setUserGuess(null);
    setFlashHidden(false);
    setTimeout(() => {
      setFlashHidden(true);
    }, 1200);
  };

  const handleGuessSubitizing = (guess: number) => {
    playSound("pop");
    setUserGuess(guess);
    setFlashHidden(false);
    if (guess === subitizingCount) {
      playSound("success");
      setFlashStreak((prev) => prev + 1);
      if (onRewardXp) onRewardXp(15);
    } else {
      playSound("error");
      setFlashStreak(0);
    }
  };

  const handleToggleTenFrame = (index: number) => {
    playSound("pop");
    setTenFrameCells((prev) => {
      const copy = [...prev];
      copy[index] = !copy[index];
      return copy;
    });
  };

  const handleBundleOnesToTen = () => {
    if (looseOnes >= 10) {
      playSound("success");
      setLooseOnes((prev) => prev - 10);
      setTenRods((prev) => prev + 1);
      if (onRewardXp) onRewardXp(25);
    }
  };

  const handleBundleTensToHundred = () => {
    if (tenRods >= 10) {
      playSound("success");
      setTenRods((prev) => prev - 10);
      setHundredFlats((prev) => prev + 1);
      if (onRewardXp) onRewardXp(35);
    }
  };

  // Quiz Handlers
  const currentQuizList = activeLevel.masteryQuiz || [];
  const currentQuiz = currentQuizList[quizQuestionIndex] || currentQuizList[0];

  const handleOptionSelect = (index: number) => {
    if (isAnswerSubmitted) return;
    playSound("pop");
    setSelectedOption(index);
  };

  const handleSubmitQuizAnswer = () => {
    if (selectedOption === null) return;
    setIsAnswerSubmitted(true);
    const isCorrect = selectedOption === currentQuiz.correctIndex;
    if (isCorrect) {
      playSound("success");
      setQuizScore((prev) => prev + 1);
      if (onRewardXp) onRewardXp(15);
    } else {
      playSound("error");
    }
  };

  const handleNextQuizQuestion = () => {
    playSound("pop");
    if (quizQuestionIndex + 1 < currentQuizList.length) {
      setQuizQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      setShowAiHint(false);
    } else {
      setIsQuizCompleted(true);
      setCompletedLevels((prev) => ({ ...prev, [activeLevel.id]: true }));
      if (onRewardXp) onRewardXp(50);
    }
  };

  const handleResetQuiz = () => {
    playSound("pop");
    setQuizQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setQuizScore(0);
    setIsQuizCompleted(false);
    setShowAiHint(false);
  };

  const tenFrameFilledCount = tenFrameCells.filter(Boolean).length;
  const base10CalculatedValue = hundredFlats * 100 + tenRods * 10 + looseOnes;

  return (
    <div className="flex flex-col w-full max-w-6xl mx-auto space-y-6">
      {/* HEADER: Domain & Skill Framework Architecture */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-[#0d131a] via-[#091016] to-[#0a0a0a] rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Foundational Skill Growth Blueprint
              </span>
              <span className="text-xs text-gray-400 font-mono">
                {activeSkill.domain}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {activeSkill.skillName}
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              {activeSkill.summary}
            </p>
          </div>

          {/* Skill Switcher Tabs (Proves this is a clean template for other skills) */}
          <div className="flex flex-col items-end gap-1.5 w-full md:w-auto shrink-0">
            <span className="text-[11px] font-mono text-gray-400">
              Progression Template Engine:
            </span>
            <div className="flex items-center gap-1.5 bg-black/60 p-1.5 rounded-2xl border border-white/10">
              {allSkills.map((sk) => (
                <button
                  key={sk.id}
                  onClick={() => {
                    playSound("pop");
                    setSelectedSkillId(sk.id);
                    setActiveLevelNumber(1);
                    handleResetQuiz();
                  }}
                  className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition flex items-center gap-1.5 ${
                    selectedSkillId === sk.id
                      ? "bg-white text-black shadow-md"
                      : "text-gray-400 hover:text-white bg-white/5"
                  }`}
                >
                  <span>{sk.skillName.split(" ")[0]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Foundational Pedagogy Callout */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2 text-xs font-mono text-emerald-300/90">
          <Brain className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong>Growth Principle:</strong> {activeSkill.foundationalRationale}
          </span>
        </div>
      </div>

      {/* LEVEL PROGRESSION LADDER TRACK */}
      <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-3 sm:p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-emerald-400" />
              Hierarchical Skill Ladder:
            </span>
            <span className="text-xs text-emerald-400 font-mono">
              Level {activeLevel.levelNumber} of {activeSkill.levels.length}
            </span>
          </div>

          <div className="text-xs font-mono text-gray-400 flex items-center gap-2">
            <span>Tier:</span>
            <span className="text-xs uppercase font-bold text-amber-400 px-2 py-0.5 bg-amber-500/10 rounded-md border border-amber-500/20">
              {activeLevel.tier}
            </span>
            <span>({activeLevel.ageGuidance})</span>
          </div>
        </div>

        {/* Horizontal Stepper */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {activeSkill.levels.map((lvl) => {
            const isCurrent = lvl.levelNumber === activeLevelNumber;
            const isDone = completedLevels[lvl.id];

            return (
              <button
                key={lvl.id}
                onClick={() => {
                  playSound("pop");
                  setActiveLevelNumber(lvl.levelNumber);
                  handleResetQuiz();
                }}
                className={`p-3 rounded-2xl text-left font-mono transition-all border flex flex-col justify-between space-y-2 ${
                  isCurrent
                    ? "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.25)] scale-[1.02]"
                    : isDone
                    ? "bg-emerald-950/20 border-emerald-500/40 text-gray-200 hover:bg-emerald-950/40"
                    : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      isCurrent
                        ? "bg-black text-white"
                        : "bg-white/10 text-gray-300"
                    }`}
                  >
                    Level {lvl.levelNumber}
                  </span>
                  {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </div>

                <div className="text-xs font-bold leading-tight truncate">
                  {lvl.title.split("&")[0]}
                </div>

                <div className="text-[10px] opacity-75 truncate">
                  {lvl.tier.toUpperCase()} • {lvl.visualizerType.replace("_", " ")}
                </div>
              </button>
            );
          })}
        </div>

        {/* Cognitive Leap Banner for the selected level */}
        <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-start gap-2.5 text-xs text-gray-300">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-white">Cognitive Shift in Level {activeLevel.levelNumber}: </strong>
            <span>{activeLevel.cognitiveLeap}</span>
          </div>
        </div>
      </div>

      {/* DUAL WORKSPACE: INTERACTIVE VISUAL LAB & LEVEL MASTERY QUIZ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT 7 COLS: HANDS-ON VISUAL MANIPULATIVE LAB */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 sm:p-6 bg-[#0a0a0a] rounded-3xl border border-white/10 shadow-xl space-y-5">
            {/* Lab Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <CircleDot className="w-5 h-5 text-emerald-400" />
                  {activeLevel.title} Lab
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {activeLevel.interactiveChallenge.instructions}
                </p>
              </div>

              <div className="px-2.5 py-1 bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-mono font-bold flex items-center gap-1">
                <Award className="w-3.5 h-3.5" />
                +{activeLevel.interactiveChallenge.rewardXp} XP
              </div>
            </div>

            {/* LEVEL 1: TOUCH & TAGGING LAB */}
            {activeLevel.visualizerType === "touch_counting" && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Object Type:</span>
                    {(["🚀", "⭐", "🍎", "🐱"] as const).map((sym) => (
                      <button
                        key={sym}
                        onClick={() => {
                          playSound("pop");
                          setObjectEmoji(sym);
                        }}
                        className={`w-8 h-8 rounded-lg text-base flex items-center justify-center border transition ${
                          objectEmoji === sym
                            ? "bg-emerald-500/20 border-emerald-400"
                            : "bg-white/5 border-white/10"
                        }`}
                      >
                        {sym}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-1">
                    {[5, 7, 9, 12].map((cnt) => (
                      <button
                        key={cnt}
                        onClick={() => {
                          playSound("pop");
                          setTouchItemsCount(cnt);
                          setTappedIndices([]);
                        }}
                        className={`px-2.5 py-1 rounded-lg border font-mono text-xs ${
                          touchItemsCount === cnt
                            ? "bg-emerald-400 text-black border-emerald-300 font-bold"
                            : "bg-white/5 text-gray-300 border-white/10"
                        }`}
                      >
                        {cnt} Items
                      </button>
                    ))}
                  </div>
                </div>

                {/* Touch Arena */}
                <div className="p-6 bg-gradient-to-b from-black/80 to-emerald-950/20 rounded-2xl border border-emerald-500/30 min-h-[220px] flex flex-wrap items-center justify-center gap-4">
                  {Array.from({ length: touchItemsCount }).map((_, idx) => {
                    const isTapped = tappedIndices.includes(idx);
                    const tagNumber = isTapped ? tappedIndices.indexOf(idx) + 1 : null;

                    return (
                      <button
                        key={idx}
                        onClick={() => handleTouchItem(idx)}
                        className={`w-18 h-18 sm:w-20 sm:h-20 rounded-2xl flex flex-col items-center justify-center transition-all transform ${
                          isTapped
                            ? "bg-emerald-500/20 border-2 border-emerald-400 scale-105 shadow-[0_0_20px_rgba(52,211,153,0.35)]"
                            : "bg-white/5 hover:bg-white/10 border border-white/20 hover:scale-105"
                        }`}
                      >
                        <span className="text-3xl">{objectEmoji}</span>
                        {tagNumber ? (
                          <span className="text-xs font-mono font-black text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded-md mt-1 border border-emerald-500/40">
                            #{tagNumber}
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-gray-500 mt-1">Tap me</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between text-xs font-mono">
                  <div className="text-emerald-300 font-bold">
                    Tagged: {tappedIndices.length} / {touchItemsCount}
                  </div>
                  {tappedIndices.length === touchItemsCount && (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Cardinality Mastered! Total = {touchItemsCount}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* LEVEL 2: FLASH SUBITIZING LAB */}
            {activeLevel.visualizerType === "subitizing_flash" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-cyan-300">
                    Perceptual Flash Box (1.2s instant exposure)
                  </span>
                  <button
                    onClick={handleFlashRandom}
                    className="px-3 py-1.5 bg-cyan-400 hover:bg-cyan-300 text-black font-mono font-bold text-xs rounded-xl transition"
                  >
                    Flash New Pattern ⚡
                  </button>
                </div>

                <div className="p-8 bg-gradient-to-b from-black/80 to-cyan-950/20 rounded-2xl border border-cyan-500/30 min-h-[200px] flex items-center justify-center relative">
                  {!flashHidden ? (
                    <div className="grid grid-cols-3 gap-3 p-5 bg-black/80 border border-cyan-400/50 rounded-2xl shadow-[0_0_25px_rgba(6,182,212,0.3)]">
                      {Array.from({ length: subitizingCount }).map((_, i) => (
                        <div
                          key={i}
                          className="w-10 h-10 rounded-full bg-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.8)] animate-scaleUp"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center space-y-2">
                      <span className="text-4xl">❓</span>
                      <p className="text-sm font-mono text-cyan-300 font-bold">
                        How many dots were in that flash?
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-mono text-gray-400 block text-center">
                    Instant Perception Guess:
                  </span>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <button
                        key={n}
                        onClick={() => handleGuessSubitizing(n)}
                        className={`w-12 h-12 rounded-xl font-mono text-base font-black border transition ${
                          userGuess === n && n === subitizingCount
                            ? "bg-emerald-400 text-black border-emerald-300"
                            : userGuess === n && n !== subitizingCount
                            ? "bg-rose-500 text-white border-rose-400"
                            : "bg-white/5 text-white border-white/10 hover:bg-white/10"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* LEVEL 3: TEN FRAME ANCHOR LAB */}
            {activeLevel.visualizerType === "ten_frame_anchor" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-purple-300">
                    Filled Dots: <strong>{tenFrameFilledCount}</strong> | Empty to Make 10:{" "}
                    <strong>{10 - tenFrameFilledCount}</strong>
                  </span>
                  <button
                    onClick={() => setTenFrameCells(Array(10).fill(false))}
                    className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg border border-white/10"
                  >
                    Clear
                  </button>
                </div>

                <div className="p-6 bg-gradient-to-b from-black to-purple-950/20 rounded-2xl border border-purple-500/30 flex flex-col items-center justify-center">
                  <div className="grid grid-cols-5 gap-3 bg-black/90 p-4 rounded-2xl border border-purple-500/40">
                    {tenFrameCells.map((filled, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleToggleTenFrame(idx)}
                        className={`w-16 h-16 rounded-2xl border flex items-center justify-center transition-all ${
                          filled
                            ? "bg-purple-500 border-purple-300 text-black shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                            : "bg-white/5 hover:bg-white/10 border-white/15"
                        }`}
                      >
                        {filled && <div className="w-7 h-7 rounded-full bg-white shadow" />}
                      </button>
                    ))}
                  </div>

                  <div className="mt-4 p-2.5 bg-purple-950/40 rounded-xl border border-purple-500/30 text-xs font-mono text-purple-200">
                    Anchor Relation: {tenFrameFilledCount} + {10 - tenFrameFilledCount} = 10
                  </div>
                </div>
              </div>
            )}

            {/* LEVEL 4: SKIP COUNTING NUMBER LINE */}
            {activeLevel.visualizerType === "number_line_skip" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Step Jump:</span>
                    {([2, 5, 10] as const).map((st) => (
                      <button
                        key={st}
                        onClick={() => {
                          playSound("pop");
                          setSkipInterval(st);
                          setActiveSkipSteps(2);
                        }}
                        className={`px-3 py-1 rounded-lg border ${
                          skipInterval === st
                            ? "bg-amber-400 text-black border-amber-300 font-bold"
                            : "bg-white/5 text-gray-300 border-white/10"
                        }`}
                      >
                        +{st}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      playSound("pop");
                      setActiveSkipSteps((s) => Math.min(8, s + 1));
                    }}
                    className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-black font-bold rounded-lg transition"
                  >
                    Hop Forward →
                  </button>
                </div>

                <div className="p-6 bg-gradient-to-b from-black to-amber-950/20 rounded-2xl border border-amber-500/30 space-y-4">
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    {Array.from({ length: 8 }).map((_, idx) => {
                      const val = (idx + 1) * skipInterval;
                      const isReached = idx < activeSkipSteps;

                      return (
                        <div
                          key={idx}
                          className={`w-14 h-14 rounded-2xl font-mono flex flex-col items-center justify-center border transition-all ${
                            isReached
                              ? "bg-amber-400/20 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)] scale-105"
                              : "bg-white/5 border-white/10 text-gray-600"
                          }`}
                        >
                          <span className="text-base font-black">{isReached ? val : "?"}</span>
                          <span className="text-[9px] text-gray-400">Hop {idx + 1}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="text-center text-xs font-mono text-amber-300">
                    Repeated Addition Pattern: {activeSkipSteps} hops of {skipInterval} ={" "}
                    {activeSkipSteps * skipInterval}
                  </div>
                </div>
              </div>
            )}

            {/* LEVEL 5: BASE-10 BUNDLING LAB */}
            {activeLevel.visualizerType === "base10_bundle" && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                  <span className="text-purple-300">
                    Total Decimal Value: <strong className="text-base">{base10CalculatedValue}</strong>
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleBundleOnesToTen}
                      disabled={looseOnes < 10}
                      className={`px-3 py-1.5 rounded-xl font-bold transition ${
                        looseOnes >= 10
                          ? "bg-purple-400 text-black hover:bg-purple-300 shadow"
                          : "bg-white/5 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      Bundle 10 Ones ➔ 1 Ten
                    </button>

                    <button
                      onClick={handleBundleTensToHundred}
                      disabled={tenRods < 10}
                      className={`px-3 py-1.5 rounded-xl font-bold transition ${
                        tenRods >= 10
                          ? "bg-amber-400 text-black hover:bg-amber-300 shadow"
                          : "bg-white/5 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      Bundle 10 Tens ➔ 1 Hundred
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 p-4 bg-black/80 rounded-2xl border border-white/10 text-center font-mono">
                  <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-xl space-y-1">
                    <span className="text-xs text-amber-400 font-bold block">Hundreds (100)</span>
                    <span className="text-2xl font-black text-white">{hundredFlats}</span>
                    <span className="text-[10px] text-gray-400 block">= {hundredFlats * 100}</span>
                  </div>

                  <div className="p-3 bg-purple-950/30 border border-purple-500/30 rounded-xl space-y-1">
                    <span className="text-xs text-purple-400 font-bold block">Tens (10)</span>
                    <span className="text-2xl font-black text-white">{tenRods}</span>
                    <span className="text-[10px] text-gray-400 block">= {tenRods * 10}</span>
                  </div>

                  <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl space-y-1">
                    <span className="text-xs text-emerald-400 font-bold block">Loose Ones (1)</span>
                    <span className="text-2xl font-black text-white">{looseOnes}</span>
                    <span className="text-[10px] text-gray-400 block">= {looseOnes}</span>
                  </div>
                </div>
              </div>
            )}

            {/* KEY MILESTONES CHECKLIST */}
            <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 space-y-2">
              <span className="text-xs font-mono font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Key Mastery Competencies for Level {activeLevel.levelNumber}:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-gray-300">
                {activeLevel.keyMilestones.map((m, idx) => (
                  <div key={idx} className="flex items-start gap-1.5">
                    <span className="text-emerald-400">✓</span>
                    <span>{m}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT 5 COLS: CONCEPT QUIZ & SKILL BRIDGE */}
        <div className="lg:col-span-5 space-y-4">
          {/* LEVEL MASTERY CONCEPT QUIZ CARD */}
          <div className="p-5 sm:p-6 bg-[#0a0a0a] rounded-3xl border border-white/10 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  Level {activeLevel.levelNumber} Concept Quiz
                </span>
              </div>

              <span className="text-xs font-mono text-gray-400">
                Question {quizQuestionIndex + 1} of {currentQuizList.length}
              </span>
            </div>

            {!isQuizCompleted ? (
              <div className="space-y-4">
                {/* Question Text */}
                <h4 className="text-sm sm:text-base font-bold text-white leading-snug">
                  {currentQuiz.question}
                </h4>

                {/* Visual Diagram if present */}
                {currentQuiz.visualDiagram && (
                  <pre className="p-3 bg-black/90 rounded-xl border border-white/10 font-mono text-xs text-emerald-300 overflow-x-auto whitespace-pre-wrap">
                    {currentQuiz.visualDiagram}
                  </pre>
                )}

                {/* Multiple Choice Options */}
                <div className="space-y-2">
                  {currentQuiz.options.map((opt, idx) => {
                    const isSelected = selectedOption === idx;
                    const isCorrect = idx === currentQuiz.correctIndex;

                    let btnStyle = "bg-white/5 text-gray-200 border-white/10 hover:bg-white/10";
                    if (isAnswerSubmitted) {
                      if (isCorrect) {
                        btnStyle = "bg-emerald-500/20 text-emerald-200 border-emerald-400 font-bold";
                      } else if (isSelected && !isCorrect) {
                        btnStyle = "bg-rose-500/20 text-rose-200 border-rose-500";
                      } else {
                        btnStyle = "bg-black/40 text-gray-500 border-white/5 opacity-50";
                      }
                    } else if (isSelected) {
                      btnStyle = "bg-white text-black border-white font-bold shadow-md";
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleOptionSelect(idx)}
                        disabled={isAnswerSubmitted}
                        className={`w-full p-3 rounded-xl border text-left font-mono text-xs transition flex items-center justify-between ${btnStyle}`}
                      >
                        <span>{opt}</span>
                        {isAnswerSubmitted && isCorrect && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Socratic Hint / AI Explanation */}
                {currentQuiz.optionalAiHint && !isAnswerSubmitted && (
                  <div>
                    {!showAiHint ? (
                      <button
                        onClick={() => {
                          playSound("pop");
                          setShowAiHint(true);
                          if (onAskSoraHint && currentQuiz.optionalAiHint) {
                            onAskSoraHint(currentQuiz.optionalAiHint.socraticClue);
                          }
                        }}
                        className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition"
                      >
                        <Bot className="w-3.5 h-3.5" />
                        <span>Need a Socratic Hint? (AI Optional)</span>
                      </button>
                    ) : (
                      <div className="p-3 bg-cyan-950/30 rounded-xl border border-cyan-500/30 space-y-1 text-xs font-mono text-cyan-200 animate-fadeIn">
                        <div className="font-bold flex items-center gap-1 text-cyan-300">
                          <Bot className="w-3.5 h-3.5" /> Socratic Coach:
                        </div>
                        <p>{currentQuiz.optionalAiHint.socraticClue}</p>
                        <p className="text-[11px] text-cyan-400/80 italic">
                          "{currentQuiz.optionalAiHint.guidingQuestion}"
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Explanation Card after submission */}
                {isAnswerSubmitted && (
                  <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 space-y-2 text-xs font-mono animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">
                        Concept: {currentQuiz.coreConcept}
                      </span>
                    </div>
                    <p className="text-gray-300 leading-relaxed">{currentQuiz.explanation}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-2 flex items-center justify-end gap-2">
                  {!isAnswerSubmitted ? (
                    <button
                      onClick={handleSubmitQuizAnswer}
                      disabled={selectedOption === null}
                      className={`px-4 py-2 rounded-xl font-mono text-xs font-bold transition ${
                        selectedOption !== null
                          ? "bg-emerald-400 hover:bg-emerald-300 text-black shadow"
                          : "bg-white/10 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      Check Answer
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuizQuestion}
                      className="px-4 py-2 bg-white hover:bg-gray-200 text-black font-mono text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow"
                    >
                      {quizQuestionIndex + 1 < currentQuizList.length ? "Next Question" : "Complete Level"}
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Quiz Completion Summary */
              <div className="text-center py-6 space-y-4 animate-scaleUp">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center mx-auto text-2xl">
                  🏆
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">Level {activeLevel.levelNumber} Mastered!</h4>
                  <p className="text-xs font-mono text-emerald-300 mt-1">
                    Quiz Score: {quizScore} / {currentQuizList.length} Correct • +50 Mastery XP Earned
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={handleResetQuiz}
                    className="px-3.5 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl font-mono text-xs border border-white/10 transition flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Retake Quiz
                  </button>
                  {activeLevel.levelNumber < activeSkill.levels.length && (
                    <button
                      onClick={() => {
                        playSound("pop");
                        setActiveLevelNumber((prev) => prev + 1);
                        handleResetQuiz();
                      }}
                      className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-black font-mono font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow"
                    >
                      Advance to Level {activeLevel.levelNumber + 1} <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* BRIDGE TO NEXT SKILL SHOWCASE CARD */}
          <div className="p-4 bg-gradient-to-r from-purple-950/30 to-cyan-950/30 rounded-2xl border border-purple-500/30 space-y-2 font-mono text-xs">
            <div className="flex items-center gap-2 text-purple-300 font-bold">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Bridge Forward: How This Powers Next Skills</span>
            </div>
            <p className="text-gray-300 leading-relaxed">
              <strong className="text-white">Unlocks: </strong>
              {activeLevel.bridgeToNextSkills.unlocksSkill}
            </p>
            <p className="text-gray-400 leading-relaxed text-[11px]">
              {activeLevel.bridgeToNextSkills.whyItMatters}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
