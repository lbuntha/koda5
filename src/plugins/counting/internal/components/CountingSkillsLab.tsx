import React, { useState, useEffect } from "react";
import {
  CountingTier,
  COUNTING_STAGES,
  COUNTING_QUIZ_QUESTIONS,
  CountingQuizQuestion,
} from "../data/countingSkillsData";
import { TopicCategory, UserProgress } from "../../../../types";
import {
  Sparkles,
  Award,
  CheckCircle,
  XCircle,
  HelpCircle,
  RotateCcw,
  ChevronRight,
  Lightbulb,
  Brain,
  Zap,
  Layers,
  Cpu,
  CircleDot,
  ArrowRight,
  Eye,
  EyeOff,
  Play,
  Volume2,
  Plus,
  Minus,
  Shuffle,
  Compass,
  Flame,
  Check,
  Bot,
  UserCheck,
} from "lucide-react";
import { playSound } from "../../../../utils/audio";

interface CountingSkillsLabProps {
  userProgress?: UserProgress;
  onRewardXp?: (xp: number, leveledUp: boolean) => void;
  onBackToInsights?: () => void;
  onUpdateTopicMastery?: (topic: TopicCategory, score: number, total: number, earnedXp: number) => void;
}

export const CountingSkillsLab: React.FC<CountingSkillsLabProps> = ({
  userProgress,
  onRewardXp,
  onBackToInsights,
  onUpdateTopicMastery,
}) => {
  // Tab state: "visualizer" | "quiz" | "roadmap"
  const [activeTab, setActiveTab] = useState<"visualizer" | "quiz" | "roadmap">("visualizer");
  const [selectedTier, setSelectedTier] = useState<CountingTier>("beginner");

  // Optional AI Tutor state (user controlled)
  const [aiAssistantEnabled, setAiAssistantEnabled] = useState<boolean>(false);
  const [showAiHintForCurrentQ, setShowAiHintForCurrentQ] = useState<boolean>(false);

  // --- Visualizer Sandbox States ---
  // Tier 1 (Beginner: Subitizing / Ten-Frame)
  const [tenFrameCount, setTenFrameCount] = useState<number>(7);
  const [isFiveGrouped, setIsFiveGrouped] = useState<boolean>(true);
  const [isFlashHidden, setIsFlashHidden] = useState<boolean>(false);

  // Tier 2 (Intermediate: Skip Counting)
  const [skipStepSize, setSkipStepSize] = useState<number>(5);
  const [skipCurrentIndex, setSkipCurrentIndex] = useState<number>(0);
  const [isSkipPlaying, setIsSkipPlaying] = useState<boolean>(false);

  // Tier 3 (Advanced: Place Value Bundler)
  const [hundredsCount, setHundredsCount] = useState<number>(2);
  const [tensCount, setTensCount] = useState<number>(13);
  const [onesCount, setOnesCount] = useState<number>(8);

  // Tier 4 (Master: Combinatorics Tree)
  const [itemACount, setItemACount] = useState<number>(3); // e.g. 3 Flavors
  const [itemBCount, setItemBCount] = useState<number>(4); // e.g. 4 Toppings

  // --- Quiz Engine States ---
  const [quizQuestionIdx, setQuizQuestionIdx] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);
  const [earnedXp, setEarnedXp] = useState<number>(0);

  // Filter questions for active tier
  const tierQuestions = COUNTING_QUIZ_QUESTIONS.filter((q) => q.tier === selectedTier);
  const currentQuestion: CountingQuizQuestion = tierQuestions[quizQuestionIdx] || tierQuestions[0];

  const stageInfo = COUNTING_STAGES[selectedTier];

  // Auto skip runner animation
  useEffect(() => {
    let timer: any;
    if (isSkipPlaying) {
      timer = setInterval(() => {
        setSkipCurrentIndex((prev) => {
          if (prev >= 8) {
            setIsSkipPlaying(false);
            return prev;
          }
          playSound("pop");
          return prev + 1;
        });
      }, 700);
    }
    return () => clearInterval(timer);
  }, [isSkipPlaying]);

  // Flash Subitize effect
  const handleFlashSubitize = () => {
    playSound("pop");
    setIsFlashHidden(true);
    setTimeout(() => {
      setIsFlashHidden(false);
      setTimeout(() => {
        setIsFlashHidden(true);
      }, 750);
    }, 200);
  };

  // Auto bundle base-10
  const handleAutoBundle = () => {
    playSound("levelup");
    let newOnes = onesCount;
    let newTens = tensCount;
    let newHundreds = hundredsCount;

    if (newOnes >= 10) {
      const extraTens = Math.floor(newOnes / 10);
      newTens += extraTens;
      newOnes = newOnes % 10;
    }

    if (newTens >= 10) {
      const extraHundreds = Math.floor(newTens / 10);
      newHundreds += extraHundreds;
      newTens = newTens % 10;
    }

    setOnesCount(newOnes);
    setTensCount(newTens);
    setHundredsCount(newHundreds);
  };

  // Quiz Handlers
  const handleSelectQuizOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    playSound("pop");
    setSelectedOption(idx);
    setIsAnswerSubmitted(true);

    const isCorrect = idx === currentQuestion.correctIndex;
    if (isCorrect) {
      playSound("success");
    } else {
      playSound("error");
    }

    const nextAnswers = [...quizAnswers, idx];
    setQuizAnswers(nextAnswers);
  };

  const handleNextQuizQuestion = () => {
    playSound("pop");
    setShowAiHintForCurrentQ(false);
    if (quizQuestionIdx < tierQuestions.length - 1) {
      setQuizQuestionIdx((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      // Completed Quiz
      const finalScore = quizAnswers.reduce((acc, ansIdx, qIdx) => {
        return ansIdx === tierQuestions[qIdx].correctIndex ? acc + 1 : acc;
      }, 0);

      const totalXp = finalScore * 15 + (finalScore === tierQuestions.length ? 25 : 0);
      setEarnedXp(totalXp);
      setQuizCompleted(true);
      playSound("levelup");

      if (onRewardXp) {
        onRewardXp(totalXp, finalScore === tierQuestions.length);
      }

      if (onUpdateTopicMastery) {
        const topicMap: Record<CountingTier, TopicCategory> = {
          beginner: "number_bonds",
          intermediate: "number_bonds",
          advanced: "base_ten_blocks",
          master: "balance_equations",
        };
        onUpdateTopicMastery(topicMap[selectedTier], finalScore, tierQuestions.length, totalXp);
      }
    }
  };

  const handleResetQuizForTier = (tier: CountingTier) => {
    playSound("pop");
    setSelectedTier(tier);
    setQuizQuestionIdx(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setQuizAnswers([]);
    setQuizCompleted(false);
    setEarnedXp(0);
    setShowAiHintForCurrentQ(false);
  };

  const totalCalculatedBaseTen = hundredsCount * 100 + tensCount * 10 + onesCount;

  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto space-y-6">
      {/* Top Header Card */}
      <div className="p-6 sm:p-7 bg-[#0a0a0a] rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-400/10 text-cyan-400 border border-cyan-400/30 text-[10px] font-mono font-bold uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" />
              Counting Mastery Track • Level 1 to 4
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight flex items-center gap-2.5">
            <Brain className="w-7 h-7 text-cyan-400" />
            Counting Skills: <span className="text-cyan-400">Beginner to Master</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-2xl">
            Experience the full cognitive progression of counting—from early subitizing dots to linear skip-stepping, multi-unit place value bundling, and advanced combinatorics.
          </p>
        </div>

        {/* AI Tutor Mode Toggle Banner (AI is strictly optional on demand) */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className="flex items-center gap-2 bg-black/60 p-1.5 rounded-2xl border border-white/10">
            <button
              onClick={() => {
                playSound("pop");
                setAiAssistantEnabled((prev) => !prev);
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition ${
                aiAssistantEnabled
                  ? "bg-purple-500/20 text-purple-300 border border-purple-400/40 shadow-[0_0_12px_rgba(168,85,247,0.3)]"
                  : "bg-white/5 text-gray-400 hover:text-gray-200 border border-white/5"
              }`}
            >
              <Bot className="w-4 h-4 text-purple-400" />
              <span>AI Koda Tutor: {aiAssistantEnabled ? "Active" : "Optional / On-Demand"}</span>
            </button>
          </div>

          {onBackToInsights && (
            <button
              onClick={onBackToInsights}
              className="text-[11px] font-mono text-gray-400 hover:text-white transition"
            >
              ← Back to Insights
            </button>
          )}
        </div>
      </div>

      {/* Main Navigation Tabs: Visualizer, Complete Quiz, Roadmap */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0a0a0a] border border-white/10 p-2 rounded-2xl">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              playSound("pop");
              setActiveTab("visualizer");
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
              activeTab === "visualizer"
                ? "bg-cyan-400 text-black shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                : "text-gray-400 hover:text-white bg-white/5"
            }`}
          >
            <Eye className="w-4 h-4" />
            1. Visualizer Sandbox
          </button>

          <button
            onClick={() => {
              playSound("pop");
              setActiveTab("quiz");
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
              activeTab === "quiz"
                ? "bg-emerald-400 text-black shadow-[0_0_15px_rgba(52,211,153,0.3)]"
                : "text-gray-400 hover:text-white bg-white/5"
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            2. Complete Quiz Check
          </button>

          <button
            onClick={() => {
              playSound("pop");
              setActiveTab("roadmap");
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
              activeTab === "roadmap"
                ? "bg-purple-400 text-black shadow-[0_0_15px_rgba(192,132,252,0.3)]"
                : "text-gray-400 hover:text-white bg-white/5"
            }`}
          >
            <Compass className="w-4 h-4" />
            3. Progression Roadmap
          </button>
        </div>

        <span className="text-[11px] font-mono text-gray-400 px-3 hidden md:inline">
          {activeTab === "visualizer"
            ? "Interact with live visual mental models"
            : activeTab === "quiz"
            ? "Validate counting skills from Level 1 to 4"
            : "See how brain mental models evolve"}
        </span>
      </div>

      {/* 4 Tier Switcher Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {(["beginner", "intermediate", "advanced", "master"] as CountingTier[]).map((tierKey) => {
          const stage = COUNTING_STAGES[tierKey];
          const isSelected = selectedTier === tierKey;

          return (
            <button
              key={tierKey}
              onClick={() => {
                playSound("pop");
                setSelectedTier(tierKey);
                if (activeTab === "quiz") {
                  handleResetQuizForTier(tierKey);
                }
              }}
              className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden ${
                isSelected
                  ? `${stage.colorTheme.bg} ${stage.colorTheme.border} ${stage.colorTheme.glow}`
                  : "bg-black/40 border-white/5 hover:border-white/20 text-gray-400 hover:text-gray-200"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${stage.colorTheme.primary}`}>
                  Level {stage.levelNumber}
                </span>
                <span className="text-[9px] font-mono text-gray-500">{stage.targetAudience}</span>
              </div>
              <h4 className={`text-xs sm:text-sm font-bold truncate ${isSelected ? "text-white" : "text-gray-300"}`}>
                {stage.title}
              </h4>
              <p className="text-[10px] text-gray-400 mt-1 line-clamp-1">
                {stage.subtitle}
              </p>
            </button>
          );
        })}
      </div>

      {/* TAB 1: INTERACTIVE VISUALIZER SANDBOX */}
      {activeTab === "visualizer" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Active Tier Overview Banner */}
          <div className="p-5 bg-black/60 rounded-3xl border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-mono font-bold uppercase px-2.5 py-1 rounded-lg ${stageInfo.colorTheme.badge}`}>
                  Level {stageInfo.levelNumber}: {stageInfo.title}
                </span>
                <span className="text-xs text-gray-400 font-mono hidden sm:inline">
                  {stageInfo.targetAudience}
                </span>
              </div>
              <span className="text-[10px] font-mono text-cyan-400">Interactive Mental Model Lab</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-300 font-sans leading-relaxed">
              <strong>Cognitive Core:</strong> {stageInfo.cognitiveShift}
            </p>
          </div>

          {/* --- TIER 1 VISUALIZER: 1-to-1 & Subitizing Ten-Frame --- */}
          {selectedTier === "beginner" && (
            <div className="p-6 sm:p-8 bg-[#0a0a0a] rounded-3xl border border-emerald-500/30 space-y-6 shadow-2xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <CircleDot className="w-5 h-5 text-emerald-400" />
                    Subitizing & 10-Frame Quantity Visualizer
                  </h3>
                  <p className="text-xs text-gray-400">
                    See how numbers are anchored around 5 and 10 to instantly recognize quantities without one-by-one counting.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      playSound("pop");
                      setIsFiveGrouped(!isFiveGrouped);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition ${
                      isFiveGrouped
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                        : "bg-white/5 text-gray-400 border-white/10"
                    }`}
                  >
                    5-Anchor Grouping: {isFiveGrouped ? "ON" : "OFF"}
                  </button>

                  <button
                    onClick={handleFlashSubitize}
                    className="px-3 py-1.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" /> Flash Subitize Test
                  </button>
                </div>
              </div>

              {/* Ten-Frame Interactive Grid */}
              <div className="flex flex-col items-center justify-center p-6 bg-black/80 rounded-2xl border border-white/10 space-y-6">
                <div className="text-center space-y-1">
                  <span className="text-xs font-mono text-gray-400">Current Quantity:</span>
                  <div className="text-4xl font-black font-mono text-emerald-400">
                    {isFlashHidden ? "❓ Guess!" : `${tenFrameCount} Units`}
                  </div>
                  <span className="text-[11px] font-mono text-gray-400">
                    {tenFrameCount <= 5
                      ? `${tenFrameCount} on top row`
                      : `5 on top + ${tenFrameCount - 5} below = ${tenFrameCount}`}
                  </span>
                </div>

                {/* The 10-Frame Visual Box */}
                {!isFlashHidden ? (
                  <div className="grid grid-rows-2 grid-cols-5 gap-2.5 p-4 bg-slate-950 rounded-2xl border-2 border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                    {Array.from({ length: 10 }).map((_, index) => {
                      const isFilled = index < tenFrameCount;
                      const isTopRow = index < 5;

                      return (
                        <button
                          key={index}
                          onClick={() => {
                            playSound("pop");
                            setTenFrameCount(index + 1);
                          }}
                          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl border flex items-center justify-center transition-all ${
                            isFilled
                              ? isTopRow && isFiveGrouped
                                ? "bg-emerald-500 text-black border-emerald-400 shadow-md scale-100 font-black text-sm"
                                : "bg-cyan-500 text-black border-cyan-400 shadow-md scale-100 font-black text-sm"
                              : "bg-white/5 border-dashed border-white/20 text-gray-600 hover:border-white/40"
                          }`}
                        >
                          {isFilled ? index + 1 : ""}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="h-32 w-64 bg-slate-950/80 rounded-2xl border border-dashed border-white/20 flex flex-col items-center justify-center text-gray-400 font-mono text-xs animate-pulse">
                    <span>⚡ Quick Flash Memory Test!</span>
                    <span className="text-[10px] text-gray-500 mt-1">How many dots did you spot?</span>
                  </div>
                )}

                {/* Slider / Controls */}
                <div className="flex items-center gap-4 w-full max-w-md">
                  <span className="text-xs font-mono text-gray-400">1</span>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={tenFrameCount}
                    onChange={(e) => {
                      playSound("pop");
                      setTenFrameCount(parseInt(e.target.value));
                    }}
                    className="flex-1 accent-emerald-400 h-2 bg-white/10 rounded-lg cursor-pointer"
                  />
                  <span className="text-xs font-mono text-gray-400">10</span>

                  <button
                    onClick={() => {
                      playSound("pop");
                      const rand = Math.floor(Math.random() * 10) + 1;
                      setTenFrameCount(rand);
                    }}
                    className="px-3 py-1 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg text-xs font-mono border border-white/10 flex items-center gap-1"
                  >
                    <Shuffle className="w-3 h-3" /> Random
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* --- TIER 2 VISUALIZER: Skip Counting Number Line --- */}
          {selectedTier === "intermediate" && (
            <div className="p-6 sm:p-8 bg-[#0a0a0a] rounded-3xl border border-cyan-500/30 space-y-6 shadow-2xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-cyan-400" />
                    Skip-Counting Trail & Rhythmic Interval Line
                  </h3>
                  <p className="text-xs text-gray-400">
                    Observe how stepping by +2, +3, +5, or +10 accelerates counting and forms the foundation for multiplication.
                  </p>
                </div>

                {/* Step selector */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-mono text-gray-400 mr-1">Interval:</span>
                  {[2, 3, 5, 10].map((step) => (
                    <button
                      key={step}
                      onClick={() => {
                        playSound("pop");
                        setSkipStepSize(step);
                        setSkipCurrentIndex(0);
                      }}
                      className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition ${
                        skipStepSize === step
                          ? "bg-cyan-400 text-black shadow-[0_0_10px_rgba(34,211,238,0.4)]"
                          : "bg-white/5 text-gray-400 hover:text-white"
                      }`}
                    >
                      +{step}
                    </button>
                  ))}
                </div>
              </div>

              {/* Number Line Visual Display */}
              <div className="p-6 bg-black/80 rounded-2xl border border-white/10 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-gray-400">Current Position:</span>
                    <span className="text-2xl font-black font-mono text-cyan-400">
                      {skipCurrentIndex * skipStepSize}
                    </span>
                    <span className="text-xs font-mono text-gray-500">
                      ({skipCurrentIndex} jumps of +{skipStepSize})
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      playSound("pop");
                      setSkipCurrentIndex(0);
                      setIsSkipPlaying(true);
                    }}
                    disabled={isSkipPlaying}
                    className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-black font-bold font-mono text-xs rounded-xl transition flex items-center gap-2 shadow-[0_0_12px_rgba(34,211,238,0.3)] disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    {isSkipPlaying ? "Hopping..." : "Play Step Animation"}
                  </button>
                </div>

                {/* Interactive Jump Trail Strip */}
                <div className="overflow-x-auto py-4">
                  <div className="flex items-center gap-2 min-w-[650px] pb-2">
                    {Array.from({ length: 9 }).map((_, stepIdx) => {
                      const numVal = stepIdx * skipStepSize;
                      const isReached = stepIdx <= skipCurrentIndex;
                      const isCurrent = stepIdx === skipCurrentIndex;

                      return (
                        <div key={stepIdx} className="flex-1 flex flex-col items-center relative">
                          {/* Arc indicator above */}
                          {stepIdx > 0 && (
                            <div
                              className={`text-[9px] font-mono font-bold mb-1 transition ${
                                isReached ? "text-cyan-300" : "text-gray-600"
                              }`}
                            >
                              +{skipStepSize}
                            </div>
                          )}

                          {/* Node pill */}
                          <button
                            onClick={() => {
                              playSound("pop");
                              setSkipCurrentIndex(stepIdx);
                            }}
                            className={`w-12 h-12 rounded-2xl border flex flex-col items-center justify-center transition-all ${
                              isCurrent
                                ? "bg-cyan-400 text-black border-cyan-300 scale-110 shadow-[0_0_15px_rgba(34,211,238,0.5)] font-black"
                                : isReached
                                ? "bg-cyan-950/60 text-cyan-300 border-cyan-500/40"
                                : "bg-white/5 text-gray-500 border-white/10 hover:border-white/20"
                            }`}
                          >
                            <span className="text-xs font-mono font-bold">{numVal}</span>
                            <span className="text-[8px] font-mono opacity-70">Hop {stepIdx}</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="p-3 bg-black/40 rounded-xl border border-white/5 text-xs font-mono text-gray-400 flex items-center justify-between">
                  <span>💡 Multiplicative Equation: {skipCurrentIndex} × {skipStepSize} = {skipCurrentIndex * skipStepSize}</span>
                  <span className="text-cyan-400 font-bold">Rhythmic Pattern</span>
                </div>
              </div>
            </div>
          )}

          {/* --- TIER 3 VISUALIZER: Place Value Bundler --- */}
          {selectedTier === "advanced" && (
            <div className="p-6 sm:p-8 bg-[#0a0a0a] rounded-3xl border border-purple-500/30 space-y-6 shadow-2xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-purple-400" />
                    Place Value Bundling & Multi-Unit Regrouping Lab
                  </h3>
                  <p className="text-xs text-gray-400">
                    Watch loose ones bundle into 10-rods, and 10-rods bundle into 100-flats to compose multi-digit numbers.
                  </p>
                </div>

                <button
                  onClick={handleAutoBundle}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-400 text-white font-bold font-mono text-xs rounded-xl transition flex items-center gap-2 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Auto-Bundle Regroup
                </button>
              </div>

              {/* Place Value Three Columns */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Hundreds Flat Column */}
                <div className="p-5 bg-black/70 rounded-2xl border border-purple-500/30 space-y-3">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="text-xs font-mono font-bold text-purple-300 uppercase">Hundreds Flats (100)</span>
                    <span className="text-lg font-mono font-black text-purple-400">{hundredsCount}</span>
                  </div>
                  <div className="h-28 flex flex-wrap items-center justify-center gap-2 overflow-y-auto p-2 bg-black/40 rounded-xl">
                    {Array.from({ length: Math.min(hundredsCount, 12) }).map((_, i) => (
                      <div key={i} className="w-10 h-10 bg-purple-600/30 border border-purple-400 rounded flex items-center justify-center text-[9px] font-mono text-purple-200 shadow-sm">
                        100
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => setHundredsCount(Math.max(0, hundredsCount - 1))}
                      className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-gray-300"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-mono text-gray-400">= {hundredsCount * 100}</span>
                    <button
                      onClick={() => setHundredsCount(hundredsCount + 1)}
                      className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-gray-300"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Tens Rod Column */}
                <div className="p-5 bg-black/70 rounded-2xl border border-cyan-500/30 space-y-3">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="text-xs font-mono font-bold text-cyan-300 uppercase">Tens Rods (10)</span>
                    <span className={`text-lg font-mono font-black ${tensCount >= 10 ? "text-amber-400" : "text-cyan-400"}`}>
                      {tensCount} {tensCount >= 10 && "⚠️ (Can Regroup)"}
                    </span>
                  </div>
                  <div className="h-28 flex flex-wrap items-center justify-center gap-1.5 overflow-y-auto p-2 bg-black/40 rounded-xl">
                    {Array.from({ length: Math.min(tensCount, 20) }).map((_, i) => (
                      <div key={i} className="w-3 h-10 bg-cyan-600/30 border border-cyan-400 rounded-sm flex items-center justify-center text-[7px] font-mono text-cyan-200">
                        10
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => setTensCount(Math.max(0, tensCount - 1))}
                      className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-gray-300"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-mono text-gray-400">= {tensCount * 10}</span>
                    <button
                      onClick={() => setTensCount(tensCount + 1)}
                      className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-gray-300"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Ones Units Column */}
                <div className="p-5 bg-black/70 rounded-2xl border border-emerald-500/30 space-y-3">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="text-xs font-mono font-bold text-emerald-300 uppercase">Ones Units (1)</span>
                    <span className={`text-lg font-mono font-black ${onesCount >= 10 ? "text-amber-400" : "text-emerald-400"}`}>
                      {onesCount} {onesCount >= 10 && "⚠️ (Can Regroup)"}
                    </span>
                  </div>
                  <div className="h-28 flex flex-wrap items-center justify-center gap-1 overflow-y-auto p-2 bg-black/40 rounded-xl">
                    {Array.from({ length: Math.min(onesCount, 24) }).map((_, i) => (
                      <div key={i} className="w-3 h-3 bg-emerald-500 border border-emerald-300 rounded-sm shadow-sm" />
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => setOnesCount(Math.max(0, onesCount - 1))}
                      className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-gray-300"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-mono text-gray-400">= {onesCount}</span>
                    <button
                      onClick={() => setOnesCount(onesCount + 1)}
                      className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-gray-300"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Total Summary Formula Box */}
              <div className="p-4 bg-gradient-to-r from-purple-950/40 via-cyan-950/30 to-black rounded-2xl border border-purple-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono">
                <div className="text-xs text-gray-300">
                  Decomposition: <strong className="text-purple-300">{hundredsCount * 100}</strong> + <strong className="text-cyan-300">{tensCount * 10}</strong> + <strong className="text-emerald-300">{onesCount}</strong>
                </div>
                <div className="text-base sm:text-lg font-black text-white">
                  Total Value = <span className="text-emerald-400">{totalCalculatedBaseTen}</span>
                </div>
              </div>
            </div>
          )}

          {/* --- TIER 4 VISUALIZER: Combinatorics Tree & Matrix --- */}
          {selectedTier === "master" && (
            <div className="p-6 sm:p-8 bg-[#0a0a0a] rounded-3xl border border-amber-500/30 space-y-6 shadow-2xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-amber-400" />
                    Combinatorics Decision Tree & Cartesian Matrix
                  </h3>
                  <p className="text-xs text-gray-400">
                    Calculate total outcomes systematically without counting each element one-by-one using the multiplication principle ($m \times n$).
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right font-mono">
                    <span className="text-[10px] text-gray-400 uppercase block">Total Combinations:</span>
                    <span className="text-xl font-black text-amber-400">{itemACount * itemBCount} Outcomes</span>
                  </div>
                </div>
              </div>

              {/* Interactive Multipliers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-black/60 rounded-2xl border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-gray-300">Category A (e.g. Ice Cream Flavors):</span>
                    <span className="font-bold text-amber-400">{itemACount} options</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="5"
                    value={itemACount}
                    onChange={(e) => {
                      playSound("pop");
                      setItemACount(parseInt(e.target.value));
                    }}
                    className="w-full accent-amber-400 h-2 bg-white/10 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="p-4 bg-black/60 rounded-2xl border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-gray-300">Category B (e.g. Dessert Toppings):</span>
                    <span className="font-bold text-cyan-400">{itemBCount} options</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="5"
                    value={itemBCount}
                    onChange={(e) => {
                      playSound("pop");
                      setItemBCount(parseInt(e.target.value));
                    }}
                    className="w-full accent-cyan-400 h-2 bg-white/10 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Visual Cartesian Grid representation */}
              <div className="p-6 bg-black/80 rounded-2xl border border-white/10 space-y-4">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400">
                  Cartesian Combination Grid ({itemACount} × {itemBCount} = {itemACount * itemBCount})
                </h4>

                <div className="overflow-x-auto">
                  <div
                    className="grid gap-2"
                    style={{
                      gridTemplateColumns: `repeat(${itemBCount}, minmax(80px, 1fr))`,
                    }}
                  >
                    {Array.from({ length: itemACount }).map((_, aIdx) =>
                      Array.from({ length: itemBCount }).map((_, bIdx) => (
                        <div
                          key={`${aIdx}-${bIdx}`}
                          className="p-3 bg-white/5 hover:bg-amber-400/20 border border-white/10 hover:border-amber-400/50 rounded-xl transition text-center cursor-default group"
                        >
                          <span className="text-[10px] font-mono text-gray-400 block group-hover:text-amber-300">
                            Flavor {aIdx + 1}
                          </span>
                          <span className="text-xs font-mono font-bold text-white">
                            + Topping {bIdx + 1}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="p-3 bg-amber-950/20 rounded-xl border border-amber-500/20 text-xs font-mono text-amber-200">
                  📐 <strong>Fundamental Counting Law:</strong> If Event A has {itemACount} choices and Event B has {itemBCount} choices, total combinations = {itemACount} × {itemBCount} = {itemACount * itemBCount}.
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: COMPLETE COUNTING SKILLS QUIZ */}
      {activeTab === "quiz" && (
        <div className="space-y-6 animate-fadeIn">
          {!quizCompleted ? (
            <div className="p-6 sm:p-8 bg-[#0a0a0a] rounded-3xl border border-white/10 shadow-2xl space-y-6">
              {/* Quiz Header & AI Hint Toggle */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase tracking-wider ${stageInfo.colorTheme.badge}`}>
                    Question {quizQuestionIdx + 1} of {tierQuestions.length}
                  </span>
                  <span className="text-xs text-gray-400 font-mono">
                    Tier: <strong className="text-white">{stageInfo.title}</strong>
                  </span>
                </div>

                {/* Optional On-Demand AI Hint Button */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      playSound("pop");
                      setShowAiHintForCurrentQ(!showAiHintForCurrentQ);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 ${
                      showAiHintForCurrentQ
                        ? "bg-purple-500/30 text-purple-300 border border-purple-400"
                        : "bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10"
                    }`}
                  >
                    <Bot className="w-3.5 h-3.5 text-purple-400" />
                    <span>{showAiHintForCurrentQ ? "Hide AI Hint" : "Ask Koda (AI Hint)"}</span>
                  </button>

                  {/* Progress dots */}
                  <div className="flex items-center gap-1 ml-2">
                    {tierQuestions.map((_, idx) => {
                      const isAnswered = idx < quizAnswers.length;
                      const isCorrect = isAnswered && quizAnswers[idx] === tierQuestions[idx].correctIndex;
                      const isCurrent = idx === quizQuestionIdx;

                      return (
                        <div
                          key={idx}
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                            isCurrent
                              ? "border-2 border-cyan-400 text-cyan-300 bg-cyan-950 scale-110"
                              : isAnswered
                              ? isCorrect
                                ? "bg-emerald-500/30 text-emerald-400 border border-emerald-500/50"
                                : "bg-rose-500/30 text-rose-400 border border-rose-500/50"
                              : "bg-white/5 text-gray-500 border border-white/10"
                          }`}
                        >
                          {idx + 1}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Question Text & Visual Diagram */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-px w-6 bg-cyan-400" />
                  <span className="text-cyan-400 uppercase tracking-[0.2em] text-[10px] font-bold font-mono">
                    {currentQuestion.coreConcept}
                  </span>
                </div>

                <h3 className="text-base sm:text-xl font-bold text-white leading-relaxed">
                  {currentQuestion.question}
                </h3>

                {/* Monospace Visual Diagram Box */}
                {currentQuestion.visualDiagram && (
                  <div className="p-4 bg-black/70 rounded-2xl border border-cyan-400/20 font-mono text-xs sm:text-sm text-cyan-300 whitespace-pre-wrap shadow-inner leading-relaxed">
                    {currentQuestion.visualDiagram}
                  </div>
                )}
              </div>

              {/* Optional Socratic AI Hint Drawer (Only shown on demand!) */}
              {showAiHintForCurrentQ && currentQuestion.optionalAiHint && (
                <div className="p-4 bg-purple-950/20 rounded-2xl border border-purple-500/30 space-y-2 animate-fadeIn">
                  <div className="flex items-center gap-2 text-purple-300 font-mono text-xs font-bold uppercase">
                    <Lightbulb className="w-4 h-4 text-purple-400" />
                    <span>Koda's Optional Socratic Thinking Clue:</span>
                  </div>
                  <p className="text-xs text-gray-200 font-sans">
                    {currentQuestion.optionalAiHint.socraticClue}
                  </p>
                  <p className="text-xs text-purple-200/90 font-mono bg-black/40 p-2 rounded-xl border border-white/5">
                    💭 <strong>Thinking Question:</strong> {currentQuestion.optionalAiHint.guidingQuestion}
                  </p>
                </div>
              )}

              {/* Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {currentQuestion.options.map((optText, optIdx) => {
                  const isSelected = selectedOption === optIdx;
                  const isCorrect = optIdx === currentQuestion.correctIndex;
                  const showResult = isAnswerSubmitted;

                  let btnStyle = "bg-white/5 border-white/10 hover:border-cyan-400/40 hover:bg-white/10 text-gray-200";

                  if (showResult) {
                    if (isCorrect) {
                      btnStyle = "bg-emerald-500/20 border-emerald-500/80 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.3)] font-bold";
                    } else if (isSelected && !isCorrect) {
                      btnStyle = "bg-rose-500/20 border-rose-500/80 text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.3)]";
                    } else {
                      btnStyle = "bg-black/40 border-white/5 text-gray-500 opacity-60";
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectQuizOption(optIdx)}
                      disabled={isAnswerSubmitted}
                      className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3 relative ${btnStyle}`}
                    >
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-mono font-bold shrink-0 transition ${
                          showResult
                            ? isCorrect
                              ? "bg-emerald-400 text-black"
                              : isSelected
                              ? "bg-rose-500 text-white"
                              : "bg-white/10 text-gray-400"
                            : "bg-white/10 text-gray-300"
                        }`}
                      >
                        {String.fromCharCode(65 + optIdx)}
                      </span>

                      <span className="text-xs sm:text-sm font-medium leading-normal flex-1">
                        {optText}
                      </span>

                      {showResult && isCorrect && (
                        <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      )}
                      {showResult && isSelected && !isCorrect && (
                        <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation & Next Button */}
              {isAnswerSubmitted && (
                <div className="p-5 bg-gradient-to-r from-cyan-950/40 via-cyan-900/20 to-black rounded-2xl border border-cyan-400/30 space-y-3 animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-cyan-400" />
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300">
                      Pedagogical Takeaway & Mathematical Principle:
                    </h4>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
                    {currentQuestion.explanation}
                  </p>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={handleNextQuizQuestion}
                      className="px-6 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-black font-bold font-mono text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-2 shadow-[0_0_15px_rgba(34,211,238,0.4)]"
                    >
                      {quizQuestionIdx < tierQuestions.length - 1 ? "Next Question" : "See Final Score"}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Quiz Completed Screen */
            <div className="p-6 sm:p-8 bg-[#0a0a0a] rounded-3xl border border-white/10 shadow-2xl text-center space-y-6 animate-fadeIn">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-400/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.3)]">
                <Award className="w-8 h-8" />
              </div>

              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400 block mb-1">
                  Stage Assessment Complete • {stageInfo.title}
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                  Mastery Verified!
                </h3>
                <p className="text-xs sm:text-sm text-gray-400 mt-2 max-w-md mx-auto">
                  You solved {quizAnswers.filter((ans, i) => ans === tierQuestions[i].correctIndex).length} of {tierQuestions.length} counting questions correctly.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto font-mono">
                <div className="p-4 bg-black/60 rounded-2xl border border-amber-400/30">
                  <span className="text-[10px] uppercase text-gray-400 block">XP Earned</span>
                  <span className="text-2xl font-bold text-amber-400">+{earnedXp} XP</span>
                </div>
                <div className="p-4 bg-black/60 rounded-2xl border border-emerald-400/30">
                  <span className="text-[10px] uppercase text-gray-400 block">Tier Level</span>
                  <span className="text-2xl font-bold text-emerald-400">Level {stageInfo.levelNumber}</span>
                </div>
                <div className="p-4 bg-black/60 rounded-2xl border border-cyan-400/30">
                  <span className="text-[10px] uppercase text-gray-400 block">Next Milestone</span>
                  <span className="text-2xl font-bold text-cyan-400">
                    {stageInfo.levelNumber < 4 ? `Level ${stageInfo.levelNumber + 1}` : "Master"}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                <button
                  onClick={() => handleResetQuizForTier(selectedTier)}
                  className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-xl border border-white/10 transition flex items-center gap-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Retake Tier Quiz
                </button>

                <button
                  onClick={() => {
                    const tiers: CountingTier[] = ["beginner", "intermediate", "advanced", "master"];
                    const currIdx = tiers.indexOf(selectedTier);
                    const nextTier = tiers[(currIdx + 1) % tiers.length];
                    handleResetQuizForTier(nextTier);
                  }}
                  className="px-6 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-black font-bold font-mono text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-2 shadow-[0_0_15px_rgba(52,211,153,0.4)]"
                >
                  Advance to Next Tier <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PROGRESSION ROADMAP (Beginner to Master Cognitive Leap Matrix) */}
      {activeTab === "roadmap" && (
        <div className="p-6 sm:p-8 bg-[#0a0a0a] rounded-3xl border border-white/10 shadow-2xl space-y-8 animate-fadeIn">
          <div className="border-b border-white/10 pb-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Compass className="w-6 h-6 text-purple-400" />
              The 4-Stage Counting Evolution Matrix
            </h3>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              How human mathematical cognition evolves from tactile 1-to-1 touching to abstract combinatorics.
            </p>
          </div>

          <div className="space-y-6">
            {(["beginner", "intermediate", "advanced", "master"] as CountingTier[]).map((tierKey, index) => {
              const stage = COUNTING_STAGES[tierKey];

              return (
                <div
                  key={tierKey}
                  className={`p-6 rounded-3xl border ${stage.colorTheme.border} ${stage.colorTheme.bg} space-y-4 transition hover:scale-[1.01]`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono font-black text-sm ${stage.colorTheme.badge}`}>
                        {stage.levelNumber}
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white">{stage.title}</h4>
                        <span className="text-xs text-gray-400 font-mono">{stage.subtitle}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        playSound("pop");
                        setSelectedTier(tierKey);
                        setActiveTab("visualizer");
                      }}
                      className="px-3.5 py-1.5 bg-black/60 hover:bg-black text-white text-xs font-mono font-bold rounded-xl border border-white/10 transition flex items-center gap-1.5"
                    >
                      Launch Sandbox <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-sans">
                    <strong>Cognitive Leap:</strong> {stage.cognitiveShift}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-xs">
                    {stage.keySkills.map((skill, skIdx) => (
                      <div key={skIdx} className="flex items-center gap-2 p-2 rounded-xl bg-black/40 border border-white/5 text-gray-300">
                        <Check className={`w-3.5 h-3.5 ${stage.colorTheme.primary} shrink-0`} />
                        <span>{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
