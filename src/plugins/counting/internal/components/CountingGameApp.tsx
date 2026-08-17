import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Volume2,
  VolumeX,
  Sparkles,
  CheckCircle2,
  Lock,
  Star,
  Coins,
  Heart,
  Flame,
  Lightbulb,
  Mic,
  Bot,
  RefreshCw,
  Rocket,
  ChevronDown,
  ChevronUp,
  Award,
  Play,
  RotateCcw,
  BookOpen,
  Sun,
  Moon,
  X,
  Target,
  Map,
  Scale,
  Dices,
  Zap,
  CircleDot,
  BatteryCharging,
  Boxes,
  Footprints,
  Waves,
  Search,
  Gem,
  Layers,
  Crown,
  Maximize2,
  Minimize2,
  Sliders,
} from "lucide-react";
import { useTheme } from "../../../../context/ThemeContext";
import type { CountingQuestionParamsByLevel } from "../data/questionParams";
import type { KodaSDK } from "../../../types";
import { themeSystem } from "../../../../lib/themeSystem";
import {
  FLOWING_LEVELS,
  FlowingLevelConfig,
  PREDEFINED_ASSETS,
  PredefinedAsset,
  DifficultyRating,
  getFlowingLevel,
  DUAL_COLOR_PAIRS,
  RIVER_THEMES,
} from "../data/countingAssets";

import { LiveVoiceCoachModal } from "../../../../components/LiveVoiceCoachModal";
import { UIKidMessage } from "../../../../components/ui";
import { PracticeStepHeader } from "../../../../components/PracticeStepHeader";
import { PracticeRoundCompleteModal } from "../../../../components/PracticeRoundCompleteModal";
import { PluginManagerPage } from "../../../../components/plugins/PluginManagerPage";
import { playSound, speakWebSpeech } from "../../../../utils/audio";
import { triggerHaptic, triggerTapPopHaptic } from "../../../../utils/haptics";

const LevelLucideIcon: React.FC<{ levelNumber: number; className?: string }> = ({ levelNumber, className = "w-5 h-5" }) => {
  switch (levelNumber) {
    case 1:
      return <Star className={`${className} text-slate-800 dark:text-amber-400 fill-amber-400/20`} />;
    case 2:
      return <Sparkles className={`${className} text-cyan-700 dark:text-cyan-400`} />;
    case 3:
      return <Scale className={`${className} text-indigo-600 dark:text-indigo-400`} />;
    case 4:
      return <Dices className={`${className} text-purple-600 dark:text-purple-400`} />;
    case 5:
      return <Zap className={`${className} text-slate-800 dark:text-amber-400`} />;
    case 6:
      return <CircleDot className={`${className} text-pink-400`} />;
    case 7:
      return <Rocket className={`${className} text-cyan-700 dark:text-cyan-400`} />;
    case 8:
      return <BatteryCharging className={`${className} text-emerald-700 dark:text-emerald-400`} />;
    case 9:
      return <Boxes className={`${className} text-indigo-600 dark:text-indigo-400`} />;
    case 10:
      return <Footprints className={`${className} text-emerald-700 dark:text-emerald-400`} />;
    case 11:
      return <Waves className={`${className} text-cyan-700 dark:text-cyan-400`} />;
    case 12:
      return <Search className={`${className} text-slate-800 dark:text-amber-400`} />;
    case 13:
      return <Gem className={`${className} text-purple-600 dark:text-purple-400`} />;
    case 14:
      return <Layers className={`${className} text-indigo-600 dark:text-indigo-400`} />;
    case 15:
      return <Crown className={`${className} text-slate-800 dark:text-amber-400 fill-amber-400/20`} />;
    default:
      return <Star className={`${className} text-indigo-600 dark:text-indigo-400`} />;
  }
};

interface CountingGameAppProps {
  initialLevel?: number;
  onLevelChange?: (levelNumber: number) => void;
  onBackToHome?: () => void;
  onBackToStore: () => void;
  onRewardOverallXp?: (xp: number) => void;
  onAskSoraHelp?: (context: string) => void;
  onOpenSpecsBook?: () => void;
  soundEnabled?: boolean;
  setSoundEnabled?: (enabled: boolean) => void;
  kidThemeMode?: "magical" | "cyber" | "candy" | "retro";
  /** Per-level question parameters, supplied by the plugin from lessons.json. */
  questionParams?: CountingQuestionParamsByLevel;
  /**
   * The plugin SDK. Optional so the component still renders standalone, but the
   * host always supplies it — routing feature checks and logs through `koda`
   * means the plugin id can never be passed by hand, and never be wrong.
   */
  koda?: KodaSDK;
}

function sample<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Pick a value from a [min, max] tuple, falling back to the original literal. */
function rangeOr(range: [number, number] | undefined, min: number, max: number): number {
  const [lo, hi] = range ?? [min, max];
  return randomInt(lo, hi);
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const NUMBER_WORDS: Record<number, string> = {
  1: "ONE",
  2: "TWO",
  3: "THREE",
  4: "FOUR",
  5: "FIVE",
  6: "SIX",
  7: "SEVEN",
  8: "EIGHT",
  9: "NINE",
  10: "TEN",
  11: "ELEVEN",
  12: "TWELVE",
  13: "THIRTEEN",
  14: "FOURTEEN",
  15: "FIFTEEN",
  16: "SIXTEEN",
  17: "SEVENTEEN",
  18: "EIGHTEEN",
  19: "NINETEEN",
  20: "TWENTY",
};

export const CountingGameApp: React.FC<CountingGameAppProps> = ({
  initialLevel = 1,
  onLevelChange,
  onBackToHome,
  onBackToStore,
  onRewardOverallXp,
  onOpenSpecsBook,
  soundEnabled: propsSoundEnabled,
  setSoundEnabled: propsSetSoundEnabled,
  kidThemeMode = "magical",
  questionParams = {},
  koda,
}) => {
  const { theme, toggleTheme } = useTheme();
  // Navigation & View Modes
  const [currentLevelNumber, setCurrentLevelNumber] = useState<number>(initialLevel);
  const [viewMode, setViewMode] = useState<"quiz" | "map">("quiz");

  const prevInitialLevelRef = useRef(initialLevel);
  useEffect(() => {
    if (initialLevel && initialLevel !== prevInitialLevelRef.current) {
      prevInitialLevelRef.current = initialLevel;
      setCurrentLevelNumber(initialLevel);
      setCurrentQuestionIndex(1);
      setQuizFeedback(null);
      setRoundCompleteSummary(null);
      setUnlockedLevelMax((prev) => Math.max(prev, initialLevel));
      randomizeQuestion(initialLevel);
    }
  }, [initialLevel]);
  const [difficultyFilter, setDifficultyFilter] = useState<"All" | DifficultyRating>("All");

  // Quiz Session State (5 questions per level session)
  // Declared per lesson in lessons.json; 5 is the historical default.
  const TOTAL_QUESTIONS_PER_ROUND =
    questionParams[currentLevelNumber]?.questionsPerRound ?? 5;
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(1);
  const [streakCount, setStreakCount] = useState<number>(3);
  const [showTip, setShowTip] = useState<boolean>(false);
  const [showLevelPicker, setShowLevelPicker] = useState<boolean>(false);
  const [showSoraHintModal, setShowSoraHintModal] = useState<boolean>(false);
  const [showLiveVoiceModal, setShowLiveVoiceModal] = useState<boolean>(false);

  // Bottom Feedback Drawer state
  const [quizFeedback, setQuizFeedback] = useState<{
    status: "correct" | "incorrect";
    title: string;
    message: string;
    xpEarned?: number;
  } | null>(null);

  // Level Mastery Celebration Modal
  const [roundCompleteSummary, setRoundCompleteSummary] = useState<{
    levelNumber: number;
    title: string;
    stars: number;
    coins: number;
    xp: number;
  } | null>(null);

  // Player Stats
  const [playerCoins, setPlayerCoins] = useState<number>(350);
  const [playerStars, setPlayerStars] = useState<number>(18);
  const [playerHearts, setPlayerHearts] = useState<number>(5);
  const [playerXp, setPlayerXp] = useState<number>(450);
  const [localSoundEnabled, setLocalSoundEnabled] = useState<boolean>(true);
  const soundEnabled = propsSoundEnabled !== undefined ? propsSoundEnabled : localSoundEnabled;
  const setSoundEnabled = propsSetSoundEnabled !== undefined ? propsSetSoundEnabled : setLocalSoundEnabled;
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    const handleFsChange = () => {
      const doc = document as any;
      const fsElement = document.fullscreenElement || 
                        doc.webkitFullscreenElement || 
                        doc.mozFullScreenElement || 
                        doc.msFullscreenElement;
      setIsFullscreen(!!fsElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    document.addEventListener("webkitfullscreenchange", handleFsChange);
    document.addEventListener("mozfullscreenchange", handleFsChange);
    document.addEventListener("MSFullscreenChange", handleFsChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFsChange);
      document.removeEventListener("webkitfullscreenchange", handleFsChange);
      document.removeEventListener("mozfullscreenchange", handleFsChange);
      document.removeEventListener("MSFullscreenChange", handleFsChange);
    };
  }, []);

  const toggleFullscreen = () => {
    triggerSound("pop");
    const docEl = document.documentElement as any;
    const doc = document as any;

    const fsElement = document.fullscreenElement || 
                      doc.webkitFullscreenElement || 
                      doc.mozFullScreenElement || 
                      doc.msFullscreenElement;

    try {
      if (!fsElement) {
        if (docEl.requestFullscreen) {
          docEl.requestFullscreen().catch((err: any) => {
            console.warn("Fullscreen request rejected:", err);
          });
        } else if (docEl.webkitRequestFullscreen) {
          docEl.webkitRequestFullscreen();
        } else if (docEl.mozRequestFullScreen) {
          docEl.mozRequestFullScreen();
        } else if (docEl.msRequestFullscreen) {
          docEl.msRequestFullscreen();
        } else {
          console.warn("Fullscreen API is not supported on this browser/device.");
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch((err: any) => {
            console.warn("Fullscreen exit rejected:", err);
          });
        } else if (doc.webkitExitFullscreen) {
          doc.webkitExitFullscreen();
        } else if (doc.mozCancelFullScreen) {
          doc.mozCancelFullScreen();
        } else if (doc.msExitFullscreen) {
          doc.msExitFullscreen();
        } else {
          console.warn("Fullscreen exit is not supported on this browser/device.");
        }
      }
    } catch (error) {
      console.warn("Fullscreen operation failed:", error);
    }
  };

  // Completed Level tracking
  const [unlockedLevelMax, setUnlockedLevelMax] = useState<number>(() => Math.max(initialLevel, 2));
  const [teacherPreviewMode, setTeacherPreviewMode] = useState<boolean>(false);
  const [showPluginSettingsModal, setShowPluginSettingsModal] = useState<boolean>(false);
  const [completedLevels, setCompletedLevels] = useState<Record<number, { stars: number }>>({
    1: { stars: 3 },
  });

  // Current Level Config
  const activeLevelConfig: FlowingLevelConfig = useMemo(() => {
    return getFlowingLevel(currentLevelNumber);
  }, [currentLevelNumber]);

  // Audio & Haptic trigger helpers
  const triggerSound = useCallback(
    (type: "pop" | "clink" | "success" | "hint" | "levelup" | "error") => {
      if (soundEnabled && (koda?.config.isEnabled("sound_chimes", true) ?? true)) {
        playSound(type);
      }
      // Provide synchronized haptic tactile feedback via Navigator.vibrate
      if (koda?.config.isEnabled("haptic_feedback", true) ?? true) {
        if (type === "pop") {
          triggerTapPopHaptic();
        } else {
          triggerHaptic(type);
        }
      }
    },
    [soundEnabled, koda]
  );

  const speakAudio = useCallback(
    (text: string) => {
      if (soundEnabled && (koda?.config.isEnabled("audio_speech", true) ?? true)) {
        const rate = koda?.config.get("speechRate", 1.0) ?? 1.0;
        speakWebSpeech(text, rate);
      }
    },
    [soundEnabled]
  );

  const addReward = useCallback(
    (coins: number, xp: number, stars = 1) => {
      setPlayerCoins((c) => c + coins);
      setPlayerXp((x) => x + xp);
      setPlayerStars((s) => s + stars);
      if (onRewardOverallXp) onRewardOverallXp(xp);
    },
    [onRewardOverallXp]
  );

  // ============================================================
  // LEVEL 1-3 STATE (1-to-1 Touch & Tag Orbit)
  // ============================================================
  const [l1ActiveAsset, setL1ActiveAsset] = useState<PredefinedAsset>(PREDEFINED_ASSETS[0]);
  const [l1TargetCount, setL1TargetCount] = useState<number>(4);
  const [l1TappedList, setL1TappedList] = useState<number[]>([]);
  const [recentlyPoppedL1Index, setRecentlyPoppedL1Index] = useState<number | null>(null);
  const [recentlyPoppedL2Index, setRecentlyPoppedL2Index] = useState<number | null>(null);
  const [l2ScatterPositions, setL2ScatterPositions] = useState<{ top: string; left: string; rotate: string }[]>([]);
  type L3LayoutType = "cluster" | "line" | "circle" | "pairs" | "scattered" | "column";

  const [l3ConservationData, setL3ConservationData] = useState<{
    countA: number;
    countB: number;
    themeA: PredefinedAsset;
    themeB: PredefinedAsset;
    layoutA: { type: L3LayoutType; label: string };
    layoutB: { type: L3LayoutType; label: string };
    correctAnswer: "A" | "B" | "SAME";
    tappedA: number[];
    tappedB: number[];
  }>({
    countA: 6,
    countB: 6,
    themeA: PREDEFINED_ASSETS[5],
    themeB: PREDEFINED_ASSETS[5],
    layoutA: { type: "cluster", label: "Tight Cluster" },
    layoutB: { type: "line", label: "Spread Out Line" },
    correctAnswer: "SAME",
    tappedA: [],
    tappedB: [],
  });
  const [l3ConservationSelection, setL3ConservationSelection] = useState<string | null>(null);

  const randomizeOrbitLevel = useCallback((lvlNum = currentLevelNumber) => {
    const q = questionParams[lvlNum] ?? {};
    const randomAsset = sample(PREDEFINED_ASSETS);
    setL1ActiveAsset(randomAsset);
    setL1TappedList([]);
    setRecentlyPoppedL1Index(null);
    setRecentlyPoppedL2Index(null);
    setL3ConservationSelection(null);
    setQuizFeedback(null);

    if (lvlNum === 1) {
      const count = rangeOr(q.countRange, 3, 7);
      setL1TargetCount(count);
    } else if (lvlNum === 2) {
      const count = rangeOr(q.countRange, 5, 8);
      setL1TargetCount(count);
      const positions: { top: string; left: string; rotate: string }[] = [];
      const minDistance = q.scatter?.minDistance ?? 16; // % gap that avoids tight overlaps
      for (let i = 0; i < count; i++) {
        let top = 0;
        let left = 0;
        let attempts = 0;
        let ok = false;
        while (!ok && attempts < 100) {
          top = rangeOr(q.scatter?.top, 15, 70);
          left = rangeOr(q.scatter?.left, 12, 80);
          ok = true;
          for (const pos of positions) {
            const pTop = parseFloat(pos.top);
            const pLeft = parseFloat(pos.left);
            const dist = Math.sqrt(Math.pow(top - pTop, 2) + Math.pow(left - pLeft, 2));
            if (dist < minDistance) {
              ok = false;
              break;
            }
          }
          attempts++;
        }
        positions.push({
          top: `${top}%`,
          left: `${left}%`,
          rotate: `${rangeOr(q.scatter?.rotate, -18, 18)}deg`,
        });
      }
      setL2ScatterPositions(positions);
    } else if (lvlNum === 3) {
      // 3 randomized comparison modes: SAME (Conservation), A_MORE, B_MORE
      const mode = sample(q.compareModes ?? ["SAME", "SAME", "A_MORE", "B_MORE"]);
      let countA = rangeOr(q.countRange, 3, 8);
      let countB = countA;
      const [dLo, dHi] = q.diffRange ?? [1, 2];

      if (mode === "A_MORE") {
        countA = rangeOr(q.biasedRange, 4, 8);
        countB = countA - randomInt(dLo, Math.min(dHi, countA - 2));
      } else if (mode === "B_MORE") {
        countB = rangeOr(q.biasedRange, 4, 8);
        countA = countB - randomInt(dLo, Math.min(dHi, countB - 2));
      }

      const correctAnswer: "A" | "B" | "SAME" =
        countA === countB ? "SAME" : countA > countB ? "A" : "B";

      const themeA = sample(PREDEFINED_ASSETS);
      const themeB = Math.random() > 0.5 ? themeA : sample(PREDEFINED_ASSETS);

      const allLayouts: { type: L3LayoutType; label: string }[] = [
        { type: "cluster", label: "Tight Cluster" },
        { type: "line", label: "Spread Out Line" },
        { type: "circle", label: "Circular Ring" },
        { type: "pairs", label: "Paired Rows" },
        { type: "scattered", label: "Scattered Field" },
        { type: "column", label: "Vertical Stack" },
      ];

      const shuffledLayouts = [...allLayouts].sort(() => Math.random() - 0.5);
      const layoutA = shuffledLayouts[0];
      const layoutB = shuffledLayouts[1];

      setL3ConservationData({
        countA,
        countB,
        themeA,
        themeB,
        layoutA,
        layoutB,
        correctAnswer,
        tappedA: [],
        tappedB: [],
      });
    }
  }, [currentLevelNumber, questionParams]);

  // ============================================================
  // LEVEL 4-6 STATE (Flash Subitizing Rush)
  // ============================================================
  const [l4Target, setL4Target] = useState<number>(4);
  const [l6ConceptualData, setL6ConceptualData] = useState<{
    targetA: number;
    targetB: number;
    total: number;
    colorPair: typeof DUAL_COLOR_PAIRS[0];
  } | null>(null);
  const [l4FlashHidden, setL4FlashHidden] = useState<boolean>(false);
  /** True until the child has started the flash for this question. */
  const [l4AwaitingStart, setL4AwaitingStart] = useState<boolean>(true);
  const [l5IrregularPoints, setL5IrregularPoints] = useState<{ x: number; y: number }[]>([]);

  const startSubitizingFlash = useCallback((lvlNum = currentLevelNumber) => {
    triggerSound("pop");
    setQuizFeedback(null);
    setL4AwaitingStart(false);
    setL4FlashHidden(false);

    const flashDuration =
      questionParams[lvlNum]?.flashMs ?? (lvlNum === 4 ? 1200 : lvlNum === 5 ? 900 : 1000);
    setTimeout(() => {
      setL4FlashHidden(true);
    }, flashDuration);
  }, [currentLevelNumber, triggerSound, questionParams]);

  const randomizeSubitizingLevel = useCallback((lvlNum = currentLevelNumber) => {
    const q = questionParams[lvlNum] ?? {};
    setQuizFeedback(null);
    if (lvlNum === 4) {
      const count = rangeOr(q.countRange, 2, 6);
      setL4Target(count);
      setL6ConceptualData(null);
      setL4AwaitingStart(true);
    } else if (lvlNum === 5) {
      const count = rangeOr(q.countRange, 3, 7);
      setL4Target(count);
      setL6ConceptualData(null);
      const points = Array.from({ length: count }).map(() => ({
        x: rangeOr(q.jitterRange, 15, 85),
        y: rangeOr(q.jitterRange, 15, 85),
      }));
      setL5IrregularPoints(points);
      setL4AwaitingStart(true);
    } else if (lvlNum === 6) {
      const targetA = rangeOr(q.partRange, 2, 4);
      const targetB = rangeOr(q.partRange, 2, 4);
      const total = targetA + targetB;
      const colorPair = sample(DUAL_COLOR_PAIRS);
      setL4Target(total);
      setL6ConceptualData({ targetA, targetB, total, colorPair });
      setL4AwaitingStart(true);
    }
  }, [currentLevelNumber, startSubitizingFlash, questionParams]);

  // ============================================================
  // LEVEL 7-9 STATE (Ten-Frame Rocket Lab)
  // ============================================================
  const [l7SingleTarget, setL7SingleTarget] = useState<number>(7);
  const [l7SingleFrame, setL7SingleFrame] = useState<boolean[]>(Array(10).fill(false));
  const [l8ComplementInitial, setL8ComplementInitial] = useState<number>(6);
  const [l8ComplementGuess, setL8ComplementGuess] = useState<number | null>(null);
  const [l9TeenTarget, setL9TeenTarget] = useState<number>(14);
  const [l9DoubleFrameA] = useState<boolean[]>(Array(10).fill(true));
  const [l9DoubleFrameB, setL9DoubleFrameB] = useState<boolean[]>(Array(10).fill(false));

  const randomizeTenFrameLevel = useCallback((lvlNum = currentLevelNumber) => {
    const q = questionParams[lvlNum] ?? {};
    setQuizFeedback(null);
    setL8ComplementGuess(null);

    if (lvlNum === 7) {
      const target = rangeOr(q.targetRange, 5, 9);
      setL7SingleTarget(target);
      setL7SingleFrame(Array(10).fill(false));
    } else if (lvlNum === 8) {
      const initialLoaded = rangeOr(q.initialRange, 2, 8);
      setL8ComplementInitial(initialLoaded);
    } else if (lvlNum === 9) {
      const teen = rangeOr(q.teenRange, 11, 19);
      setL9TeenTarget(teen);
      setL9DoubleFrameB(Array(10).fill(false));
    }
  }, [currentLevelNumber, questionParams]);

  // ============================================================
  // LEVEL 10-12 STATE (Froggy Skip Jump Line)
  // ============================================================
  const [l10Track, setL10Track] = useState<{
    step: number;
    start: number;
    maxHops: number;
    targetNumber: number;
    padValues: number[];
    theme: typeof RIVER_THEMES[0];
  }>({
    step: 2,
    start: 0,
    maxHops: 6,
    targetNumber: 12,
    padValues: [0, 2, 4, 6, 8, 10, 12],
    theme: RIVER_THEMES[0],
  });
  const [l10FrogHopCount, setL10FrogHopCount] = useState<number>(0);
  const [l12MasterChallenge, setL12MasterChallenge] = useState<{
    sequence: (number | null)[];
    missingIndex: number;
    correctAnswer: number;
    options: number[];
    rule: string;
  }>({
    sequence: [10, 15, null, 25, 30],
    missingIndex: 2,
    correctAnswer: 20,
    options: [18, 20, 22, 24],
    rule: "Pattern steps forward by +5 each hop",
  });
  const [l12Guess, setL12Guess] = useState<number | null>(null);

  const randomizeFroggyLevel = useCallback((lvlNum = currentLevelNumber) => {
    const q = questionParams[lvlNum] ?? {};
    setL10FrogHopCount(0);
    setL12Guess(null);
    setQuizFeedback(null);
    const theme = sample(RIVER_THEMES);

    if (lvlNum === 10) {
      const step = sample(q.steps ?? [2, 5]);
      const perStep = q.hopRangeByStep?.[String(step)];
      const maxHops = perStep
        ? randomInt(perStep[0], perStep[1])
        : step === 2
          ? randomInt(4, 6)
          : randomInt(3, 5);
      const padValues = Array.from({ length: maxHops + 1 }).map((_, i) => i * step);
      setL10Track({ step, start: 0, maxHops, targetNumber: padValues[maxHops], padValues, theme });
    } else if (lvlNum === 11) {
      const step = (q.steps ?? [10])[0];
      const maxHops = rangeOr(q.hopRange, 4, 6);
      const padValues = Array.from({ length: maxHops + 1 }).map((_, i) => i * step);
      setL10Track({ step, start: 0, maxHops, targetNumber: padValues[maxHops], padValues, theme });
    } else if (lvlNum === 12) {
      const isReverse = Math.random() > 0.5;
      const step = sample(q.steps ?? [2, 5, 10]);
      const length = q.seqLength ?? 5;
      const start = isReverse
        ? rangeOr(q.reverseStartRange, 25, 45)
        : rangeOr(q.startRange, 5, 20);

      const rawSeq = Array.from({ length }).map((_, i) =>
        isReverse ? start - i * step : start + i * step
      );
      const missingIndex = rangeOr(q.missingIndexRange, 1, 3);
      const correctAnswer = rawSeq[missingIndex];

      const sequence: (number | null)[] = [...rawSeq];
      sequence[missingIndex] = null;

      const distractors = new Set<number>();
      distractors.add(correctAnswer + step);
      distractors.add(correctAnswer - step);
      distractors.add(correctAnswer + (isReverse ? -1 : 1));
      while (distractors.size < 3) {
        distractors.add(correctAnswer + rangeOr(q.distractorJitter, -4, 4));
      }
      distractors.delete(correctAnswer);

      const options = Array.from(distractors).slice(0, 3).concat(correctAnswer);
      options.sort(() => Math.random() - 0.5);

      setL12MasterChallenge({
        sequence,
        missingIndex,
        correctAnswer,
        options,
        rule: isReverse
          ? `Pattern steps backward by -${step} each jump`
          : `Pattern steps forward by +${step} each jump`,
      });
    }
  }, [currentLevelNumber, questionParams]);

  // ============================================================
  // LEVEL 13-15 STATE (Base-10 Galaxy Foundry)
  // ============================================================
  const [l13Ones, setL13Ones] = useState<number>(0);
  const [l13Tens, setL13Tens] = useState<number>(0);
  const [l13Hundreds, setL13Hundreds] = useState<number>(0);
  const [l13Target, setL13Target] = useState<number>(25);
  const [l14Target, setL14Target] = useState<number>(142);
  const [l15Target, setL15Target] = useState<number>(247);
  const [hoveredChamber, setHoveredChamber] = useState<"hundreds" | "tens" | "ones" | "recycle" | null>(null);
  const [isDraggingTemplate, setIsDraggingTemplate] = useState<"hundreds" | "tens" | "ones" | "block-remove" | null>(null);
  const [magneticPullBlock, setMagneticPullBlock] = useState<{type: "hundreds" | "tens" | "ones", index: number} | null>(null);

  const randomizeBase10Level = useCallback((lvlNum = currentLevelNumber) => {
    setQuizFeedback(null);
    if (lvlNum === 13) {
      const target = randomInt(11, 35);
      setL13Target(target);
      setL13Ones(0);
      setL13Tens(0);
      setL13Hundreds(0);
    } else if (lvlNum === 14) {
      const target = randomInt(105, 245);
      setL14Target(target);
      setL13Ones(0);
      setL13Tens(0);
      setL13Hundreds(0);
    } else if (lvlNum === 15) {
      const target = randomInt(115, 385);
      setL15Target(target);
      setL13Ones(0);
      setL13Tens(0);
      setL13Hundreds(0);
    }
  }, [currentLevelNumber]);

  // Randomize current question
  const randomizeQuestion = useCallback((lvlNum = currentLevelNumber) => {
    if (lvlNum >= 1 && lvlNum <= 3) randomizeOrbitLevel(lvlNum);
    else if (lvlNum >= 4 && lvlNum <= 6) randomizeSubitizingLevel(lvlNum);
    else if (lvlNum >= 7 && lvlNum <= 9) randomizeTenFrameLevel(lvlNum);
    else if (lvlNum >= 10 && lvlNum <= 12) randomizeFroggyLevel(lvlNum);
    else if (lvlNum >= 13 && lvlNum <= 15) randomizeBase10Level(lvlNum);
  }, [currentLevelNumber, randomizeOrbitLevel, randomizeSubitizingLevel, randomizeTenFrameLevel, randomizeFroggyLevel, randomizeBase10Level]);

  // Jump to specific Level
  const jumpToLevel = useCallback((targetLevel: number) => {
    setCurrentLevelNumber(targetLevel);
    setCurrentQuestionIndex(1);
    setQuizFeedback(null);
    setRoundCompleteSummary(null);
    setViewMode("quiz");
    setUnlockedLevelMax((prev) => Math.max(prev, targetLevel));
    randomizeQuestion(targetLevel);
    if (onLevelChange) {
      onLevelChange(targetLevel);
    }
  }, [randomizeQuestion, onLevelChange]);

  // On mount. Must seed the level we actually opened at — this was hardcoded to
  // 1, so entering any other level (from a lesson link or the plugin preview)
  // generated level 1's state and left that level's own play area empty.
  useEffect(() => {
    randomizeQuestion(initialLevel);
    koda?.log(
      "START_LEVEL",
      `Counting Quest initialised at level ${initialLevel}.`,
      initialLevel,
      1,
    );
  }, []);

  // ------------------------------------------------------------
  // QUESTION SUCCESS HANDLER (Advancing or completing round)
  // ------------------------------------------------------------
  const handleQuestionSuccess = (successMsg: string, xpReward = 20) => {
    triggerSound("success");
    addReward(5, xpReward, 0);
    setStreakCount((s) => s + 1);

    setQuizFeedback({
      status: "correct",
      title: "Great counting!",
      message: successMsg,
      xpEarned: xpReward,
    });

    koda?.log("CHECK_ANSWER", `Correct answer submitted: ${successMsg}`, currentLevelNumber, currentQuestionIndex);
    koda?.log("EARN_XP", `Gained +${xpReward} XP reward!`, currentLevelNumber, currentQuestionIndex);
  };

  const handleNextQuestionOrComplete = () => {
    triggerSound("pop");
    setQuizFeedback(null);

    if (currentQuestionIndex < TOTAL_QUESTIONS_PER_ROUND) {
      const nextStep = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextStep);
      randomizeQuestion(currentLevelNumber);
      koda?.log("NEXT_QUESTION", `Advancing to Step ${nextStep} task.`, currentLevelNumber, nextStep);
    } else {
      // Completed full 5-question round!
      triggerSound("levelup");
      const starsWon = 3;
      const coinsWon = 50;
      const xpWon = 100;

      setCompletedLevels((prev) => ({
        ...prev,
        [currentLevelNumber]: { stars: Math.max(prev[currentLevelNumber]?.stars || 0, starsWon) },
      }));
      setUnlockedLevelMax((prev) => Math.max(prev, currentLevelNumber + 1));
      addReward(coinsWon, xpWon, starsWon);

      setRoundCompleteSummary({
        levelNumber: currentLevelNumber,
        title: activeLevelConfig.title,
        stars: starsWon,
        coins: coinsWon,
        xp: xpWon,
      });

      koda?.log("NEXT_QUESTION", `Level ${currentLevelNumber} completed fully with 3 Stars and +${xpWon} XP!`, currentLevelNumber, currentQuestionIndex);
    }
  };

  // ------------------------------------------------------------
  // LEVEL 1: Linear 1-to-1 Counting
  // ------------------------------------------------------------
  const handleTouchL1Object = (index: number) => {
    if (l1TappedList.includes(index)) return;
    const newTapped = [...l1TappedList, index];
    setL1TappedList(newTapped);

    // Trigger synchronized haptic feedback & tactile pop scale animation on tapped manipulative
    triggerTapPopHaptic();
    setRecentlyPoppedL1Index(index);
    setTimeout(() => {
      setRecentlyPoppedL1Index((current) => (current === index ? null : current));
    }, 450);

    const currentCount = newTapped.length;
    const countWord = NUMBER_WORDS[currentCount] || String(currentCount);
    speakAudio(countWord);
    triggerSound("pop");

    if (currentCount === l1TargetCount) {
      handleQuestionSuccess(
        `You counted ${l1TargetCount} ${l1ActiveAsset.name.toLowerCase()}. The last number you said is how many!`
      );
    }
  };

  // ------------------------------------------------------------
  // LEVEL 2: Scattered Objects
  // ------------------------------------------------------------
  const handleTouchL2Object = (index: number) => {
    if (l1TappedList.includes(index)) return;
    const newTapped = [...l1TappedList, index];
    setL1TappedList(newTapped);

    // Trigger synchronized haptic feedback & tactile pop scale animation on tapped manipulative
    triggerTapPopHaptic();
    setRecentlyPoppedL2Index(index);
    setTimeout(() => {
      setRecentlyPoppedL2Index((current) => (current === index ? null : current));
    }, 450);

    const currentCount = newTapped.length;
    const countWord = NUMBER_WORDS[currentCount] || String(currentCount);
    speakAudio(countWord);
    triggerSound("clink");

    if (currentCount === l1TargetCount) {
      handleQuestionSuccess(
        `Terrific tracking! You tagged all ${l1TargetCount} scattered objects without missing any.`
      );
    }
  };

  // ------------------------------------------------------------
  // LEVEL 3: Conservation & Comparison
  // ------------------------------------------------------------
  const handleToggleL3Tap = (group: "A" | "B", index: number) => {
    triggerSound("pop");
    setL3ConservationData((prev) => {
      if (group === "A") {
        const isTapped = prev.tappedA.includes(index);
        const nextTapped = isTapped ? prev.tappedA.filter((i) => i !== index) : [...prev.tappedA, index];
        const countWord = NUMBER_WORDS[nextTapped.length] || String(nextTapped.length);
        if (!isTapped) speakAudio(countWord);
        return { ...prev, tappedA: nextTapped };
      } else {
        const isTapped = prev.tappedB.includes(index);
        const nextTapped = isTapped ? prev.tappedB.filter((i) => i !== index) : [...prev.tappedB, index];
        const countWord = NUMBER_WORDS[nextTapped.length] || String(nextTapped.length);
        if (!isTapped) speakAudio(countWord);
        return { ...prev, tappedB: nextTapped };
      }
    });
  };

  const handleConservationAnswer = (choice: "A" | "B" | "SAME") => {
    setL3ConservationSelection(choice);
    const { countA, countB, themeA, themeB, correctAnswer } = l3ConservationData;

    if (choice === correctAnswer) {
      let successMsg = "";
      if (correctAnswer === "SAME") {
        successMsg = `Both groups have ${countA}. Moving things around does not change how many!`;
      } else if (correctAnswer === "A") {
        successMsg = `The left group has ${countA}. The right group has ${countB}. Left has more!`;
      } else {
        successMsg = `The right group has ${countB}. The left group has ${countA}. Right has more!`;
      }
      handleQuestionSuccess(successMsg, 25);
    } else {
      triggerSound("error");
      setStreakCount(0);
      let hintMsg = "";
      if (correctAnswer === "SAME") {
        hintMsg = `Even though the groups look visually different, count them one-by-one! Both Left group (${countA}) and Right group (${countB}) have the exact same count (${countA}).`;
      } else if (correctAnswer === "A") {
        hintMsg = `Count each group carefully: Group A has ${countA} ${themeA.name.toLowerCase()} and Group B has ${countB} ${themeB.name.toLowerCase()}. ${countA} is greater than ${countB}!`;
      } else {
        hintMsg = `Count each group carefully: Group B has ${countB} ${themeB.name.toLowerCase()} and Group A has ${countA} ${themeA.name.toLowerCase()}. ${countB} is greater than ${countA}!`;
      }
      setQuizFeedback({
        status: "incorrect",
        title: "Count them again",
        message: hintMsg,
      });
    }
  };

  // ------------------------------------------------------------
  // LEVEL 4-6: Subitizing Guess
  // ------------------------------------------------------------
  const handleSubitizingGuess = (guess: number) => {
    if (guess === l4Target) {
      const desc =
        currentLevelNumber === 4
          ? `Standard dice pattern recognized instantly: ${l4Target}!`
          : currentLevelNumber === 5
          ? `Instant grouping subitizing unlocked: ${l4Target}!`
          : `Conceptual Subitizing: ${l6ConceptualData?.targetA} + ${l6ConceptualData?.targetB} = ${l4Target}!`;
      handleQuestionSuccess(desc);
    } else {
      triggerSound("error");
      setStreakCount(0);
      setQuizFeedback({
        status: "incorrect",
        title: "So close!",
        message: `You said ${guess}. There were ${l4Target} dots. Have another look!`,
      });
    }
  };

  // ------------------------------------------------------------
  // LEVEL 7: 5-Anchor Ten-Frame
  // ------------------------------------------------------------
  const handleToggleL7Cell = (idx: number) => {
    triggerSound("pop");
    setL7SingleFrame((prev) => {
      const next = [...prev];
      next[idx] = !next[idx];
      return next;
    });
  };

  const handleCheckL7Frame = () => {
    const filledCount = l7SingleFrame.filter(Boolean).length;
    if (filledCount === l7SingleTarget) {
      handleQuestionSuccess(
        `Rocket fueled! You filled 5 on top plus ${l7SingleTarget - 5} extra ones to make ${l7SingleTarget}.`
      );
    } else {
      triggerSound("error");
      setStreakCount(0);
      setQuizFeedback({
        status: "incorrect",
        title: "Try again",
        message: `Currently filled: ${filledCount}. We need exactly ${l7SingleTarget} filled spots.`,
      });
    }
  };

  // ------------------------------------------------------------
  // LEVEL 8: Making 10
  // ------------------------------------------------------------
  const handleComplementAnswer = (guess: number) => {
    setL8ComplementGuess(guess);
    const correctComplement = 10 - l8ComplementInitial;
    if (guess === correctComplement) {
      handleQuestionSuccess(
        `Number bond discovered! ${l8ComplementInitial} + ${guess} = 10. You completed the full ten-frame.`
      );
    } else {
      triggerSound("error");
      setStreakCount(0);
      setQuizFeedback({
        status: "incorrect",
        title: "Try another number",
        message: `There are ${l8ComplementInitial} filled spots. Count the empty ones: we need ${correctComplement} more to make 10.`,
      });
    }
  };

  // ------------------------------------------------------------
  // LEVEL 9: Teen Numbers (10 + Ones)
  // ------------------------------------------------------------
  const handleToggleL9Cell = (idx: number) => {
    triggerSound("pop");
    setL9DoubleFrameB((prev) => {
      const next = [...prev];
      next[idx] = !next[idx];
      return next;
    });
  };

  const handleCheckL9Teen = () => {
    const onesFilled = l9DoubleFrameB.filter(Boolean).length;
    const total = 10 + onesFilled;
    if (total === l9TeenTarget) {
      handleQuestionSuccess(
        `Teen number mastered! 10 (full frame) + ${onesFilled} (ones) = ${l9TeenTarget}.`
      );
    } else {
      triggerSound("error");
      setStreakCount(0);
      setQuizFeedback({
        status: "incorrect",
        title: "Try the second frame",
        message: `Currently 10 + ${onesFilled} = ${total}. We need ${l9TeenTarget - 10} extra ones in Frame 2.`,
      });
    }
  };

  // ------------------------------------------------------------
  // LEVEL 10-11: Frog Skip Counting
  // ------------------------------------------------------------
  const handleFrogHopForward = () => {
    if (l10FrogHopCount < l10Track.maxHops) {
      const nextHop = l10FrogHopCount + 1;
      setL10FrogHopCount(nextHop);
      triggerSound("clink");
      const currentVal = l10Track.padValues[nextHop];
      speakAudio(String(currentVal));

      if (nextHop === l10Track.maxHops) {
        handleQuestionSuccess(
          `Ribbit! The frog leaped by +${l10Track.step} each pad all the way to ${l10Track.targetNumber}!`
        );
      }
    }
  };

  // ------------------------------------------------------------
  // LEVEL 12: Missing Number
  // ------------------------------------------------------------
  const handleMysteryPadGuess = (choice: number) => {
    setL12Guess(choice);
    if (choice === l12MasterChallenge.correctAnswer) {
      handleQuestionSuccess(
        `Pattern cracked! ${choice} completes the sequence (${l12MasterChallenge.rule}).`
      );
    } else {
      triggerSound("error");
      setStreakCount(0);
      setQuizFeedback({
        status: "incorrect",
        title: "Check your hops",
        message: `Look at the jump between neighboring pads to find the missing number.`,
      });
    }
  };

  // ------------------------------------------------------------
  // LEVEL 13-15: Base-10 Blocks
  // ------------------------------------------------------------
  const handleAddHundred = () => {
    triggerSound("pop");
    setMagneticPullBlock({ type: "hundreds", index: l13Hundreds });
    setL13Hundreds((h) => Math.min(h + 1, 9));
    setTimeout(() => setMagneticPullBlock(null), 600);
  };

  const handleSubHundred = () => {
    triggerSound("pop");
    setL13Hundreds((h) => Math.max(h - 1, 0));
  };

  const handleAddTen = () => {
    triggerSound("pop");
    setMagneticPullBlock({ type: "tens", index: l13Tens });
    setL13Tens((t) => Math.min(t + 1, 19));
    setTimeout(() => setMagneticPullBlock(null), 600);
  };

  const handleSubTen = () => {
    triggerSound("pop");
    setL13Tens((t) => Math.max(t - 1, 0));
  };

  const handleAddOne = () => {
    triggerSound("pop");
    setMagneticPullBlock({ type: "ones", index: l13Ones });
    setL13Ones((o) => Math.min(o + 1, 19));
    setTimeout(() => setMagneticPullBlock(null), 600);
  };

  const handleSubOne = () => {
    triggerSound("pop");
    setL13Ones((o) => Math.max(o - 1, 0));
  };

  const handleFuseOnesToTen = () => {
    if (l13Ones >= 10) {
      triggerSound("clink");
      setL13Ones((o) => o - 10);
      setL13Tens((t) => t + 1);
      speakAudio("10 Ones fused into 1 Ten!");
    }
  };

  const handleFuseTensToHundred = () => {
    if (l13Tens >= 10) {
      triggerSound("clink");
      setL13Tens((t) => t - 10);
      setL13Hundreds((h) => h + 1);
      speakAudio("10 Tens fused into 1 Hundred!");
    }
  };

  const handleCheckBase10 = () => {
    const total = l13Hundreds * 100 + l13Tens * 10 + l13Ones;
    if (currentLevelNumber === 13) {
      if (total !== l13Target) {
        triggerSound("error");
        setQuizFeedback({
          status: "incorrect",
          title: "Try a different number",
          message: `Your current total is ${total} blocks, but you need to build exactly ${l13Target}.`,
        });
      } else if (l13Ones >= 10) {
        triggerSound("error");
        setQuizFeedback({
          status: "incorrect",
          title: "A few more ones",
          message: `Great total! But you have ${l13Ones} Ones. Can you group 10 of them into a Ten? Click "Make a Ten" below!`,
        });
      } else {
        handleQuestionSuccess(`All ones grouped beautifully! Built ${l13Target} with ${l13Tens} Tens and ${l13Ones} Ones.`);
      }
    } else if (currentLevelNumber === 14) {
      if (total !== l14Target) {
        triggerSound("error");
        setQuizFeedback({
          status: "incorrect",
          title: "Try a different number",
          message: `Your current total is ${total} blocks, but you need to build exactly ${l14Target}.`,
        });
      } else if (l13Tens >= 10) {
        triggerSound("error");
        setQuizFeedback({
          status: "incorrect",
          title: "A few more tens",
          message: `Great total! But you have ${l13Tens} Tens. Can you group 10 of them into a Hundred? Click "Fuse 10 Tens" below!`,
        });
      } else {
        handleQuestionSuccess(`All tens grouped beautifully! Built ${l14Target} with ${l13Hundreds} Hundreds, ${l13Tens} Tens, and ${l13Ones} Ones.`);
      }
    } else if (currentLevelNumber === 15) {
      if (total !== l15Target) {
        triggerSound("error");
        setQuizFeedback({
          status: "incorrect",
          title: "Try a different number",
          message: `Your current total is ${total} blocks, but you need to build exactly ${l15Target}.`,
        });
      } else if (l13Ones >= 10) {
        triggerSound("error");
        setQuizFeedback({
          status: "incorrect",
          title: "Group your ones",
          message: `Excellent sum! But you have ${l13Ones} Ones. Click "Make a Ten" to put them in standard place value form.`,
        });
      } else if (l13Tens >= 10) {
        triggerSound("error");
        setQuizFeedback({
          status: "incorrect",
          title: "Group your tens",
          message: `Excellent sum! But you have ${l13Tens} Tens. Click "Fuse 10 Tens" to put them in standard place value form.`,
        });
      } else {
        handleQuestionSuccess(`Perfect place value architecture! Built ${l15Target} in standard bundled form.`);
      }
    }
  };

  const currentTotalBlocks = l13Hundreds * 100 + l13Tens * 10 + l13Ones;
  const activeTarget = currentLevelNumber === 13 ? l13Target : (currentLevelNumber === 14 ? l14Target : l15Target);

  // Filtered levels for Map View
  const filteredLevels = useMemo(() => {
    if (difficultyFilter === "All") return FLOWING_LEVELS;
    return FLOWING_LEVELS.filter((lvl) => lvl.difficulty === difficultyFilter);
  }, [difficultyFilter]);

  const currentQuestionText = useMemo(() => {
    if (currentLevelNumber === 1) return `Touch each ${l1ActiveAsset.name.toLowerCase()}. Count as you go!`;
    if (currentLevelNumber === 2) return `Touch every ${l1ActiveAsset.name.toLowerCase()}. Do not miss any!`;
    if (currentLevelNumber === 3) {
      return l3ConservationData.countA === l3ConservationData.countB
        ? `Count both groups. Do they have the same?`
        : `Count both groups. Which one has more?`;
    }
    if (currentLevelNumber >= 4 && currentLevelNumber <= 6) return `Look fast! How many did you see?`;
    if (currentLevelNumber === 7) return `Make ${l7SingleTarget} dots. Fill the top row first.`;
    if (currentLevelNumber === 8) return `You have ${l8ComplementInitial}. How many more to make 10?`;
    if (currentLevelNumber === 9) return `Make ${l9TeenTarget}. Fill one frame with 10, then add more.`;
    if (currentLevelNumber === 10) return `Hop by ${l10Track.step} to get to ${l10Track.targetNumber}!`;
    if (currentLevelNumber === 11) return `Hop by 10 all the way to ${l10Track.targetNumber}!`;
    if (currentLevelNumber === 12) return `Which number is missing?`;
    if (currentLevelNumber === 13) {
      const diff = l13Target - currentTotalBlocks;
      if (diff > 0) {
        return `Make ${l13Target}. You have ${currentTotalBlocks}. Add ${diff} more!`;
      } else if (diff < 0) {
        return `Make ${l13Target}. You have ${currentTotalBlocks}. Take away ${Math.abs(diff)}!`;
      } else if (l13Ones >= 10) {
        return `You made ${l13Target}! Now put 10 ones together to make a ten.`;
      } else {
        return `You made ${l13Target}! Press Check.`;
      }
    }
    if (currentLevelNumber === 14) {
      const diff = l14Target - currentTotalBlocks;
      if (diff > 0) {
        return `Make ${l14Target}. You have ${currentTotalBlocks}. Add ${diff} more!`;
      } else if (diff < 0) {
        return `Make ${l14Target}. You have ${currentTotalBlocks}. Take away ${Math.abs(diff)}!`;
      } else if (l13Tens >= 10) {
        return `You reached ${l14Target}! Now fuse 10 Tens into a Hundred to bundle your numbers. Click "Fuse 10 Tens" below!`;
      } else {
        return `Excellent! You built ${l14Target} in the most bundled way. Click "Check" to complete this step!`;
      }
    }
    if (currentLevelNumber === 15) {
      const diff = l15Target - currentTotalBlocks;
      if (diff > 0) {
        return `Build ${l15Target}: You have ${currentTotalBlocks} blocks. Add ${diff} more using the (+) buttons!`;
      } else if (diff < 0) {
        return `Build ${l15Target}: You have ${currentTotalBlocks} blocks. Remove ${Math.abs(diff)} using the (-) buttons!`;
      } else if (l13Ones >= 10) {
        return `You reached ${l15Target}! Make a Ten into a Ten to bundle your numbers. Click "Make a Ten" below!`;
      } else if (l13Tens >= 10) {
        return `You reached ${l15Target}! Fuse 10 Tens into a Hundred to bundle your numbers. Click "Fuse 10 Tens" below!`;
      } else {
        return `Congratulations! You built exactly ${l15Target} in standard bundled form. Click "Check" to finish!`;
      }
    }
    return activeLevelConfig.targetObjective;
  }, [currentLevelNumber, l1ActiveAsset, l7SingleTarget, l8ComplementInitial, l9TeenTarget, l10Track, l13Target, l14Target, l15Target, activeLevelConfig, l13Ones, l13Tens, currentTotalBlocks]);

  // ============================================================
  // RENDER: LEVEL MAP / JOURNEY VIEW
  // ============================================================
  if (viewMode === "map") {
    return (
      <div className="flex-1 min-h-0 bg-canvas text-ink flex flex-col">
        {/* Map Header */}
        <header className="px-2.5 sm:px-4 py-2.5 sm:py-3 bg-canvas/90 flex items-center justify-between gap-2">
          <button
            onClick={() => setViewMode("quiz")}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-surface hover:bg-surface-muted text-xs font-bold text-body hover:text-ink transition shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Resume Level {currentLevelNumber}</span>
            <span className="sm:hidden">Level {currentLevelNumber}</span>
          </button>

          <div className="flex items-center gap-2 font-mono">
            <span className="text-xs sm:text-base font-black text-ink truncate">🗺️ Journey Map</span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Fullscreen / Zen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-2 min-w-[40px] min-h-[40px] rounded-xl text-muted hover:text-ink hover:bg-surface-muted transition shrink-0 flex items-center justify-center"
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullscreen ? (
                <Minimize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-800 dark:text-amber-400" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              )}
            </button>
          </div>
        </header>

        {/* Map Filter & Grid */}
        <main className="flex-1 p-3 sm:p-6 max-w-5xl mx-auto w-full space-y-4 sm:space-y-5">
          {/* Difficulty Filter Tabs */}
          <div className="flex items-center justify-between flex-wrap gap-2 pb-2">
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none max-w-full pb-1">
              {(["All", "Easy", "Medium", "Challenging", "Advanced", "Master"] as const).map(
                (diff) => (
                  <button
                    key={diff}
                    onClick={() => setDifficultyFilter(diff)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition shrink-0 ${
                      difficultyFilter === diff
                        ? "bg-amber-400 text-slate-950 shadow"
                        : "bg-surface text-muted hover:text-ink"
                    }`}
                  >
                    {diff}
                  </button>
                )
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Teacher Preview Toggle */}
              <button
                onClick={() => {
                  triggerSound("clink");
                  setTeacherPreviewMode(!teacherPreviewMode);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-[11px] font-bold border transition ${
                  teacherPreviewMode
                    ? "bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border-indigo-400/50 shadow-[0_0_15px_rgba(129,140,248,0.2)]"
                    : "bg-surface text-muted border-line hover:text-body"
                }`}
                title="Unlock all levels to inspect and preview their Socratic questions"
              aria-label="Unlock all levels to inspect and preview their Socratic questions"
              >
                <span>{teacherPreviewMode ? "🔓 Preview Mode: ON" : "🔒 Teacher Preview"}</span>
              </button>

              <span className="text-xs text-muted font-mono">
                {Object.keys(completedLevels).length} / 15 Mastered
              </span>
            </div>
          </div>

          {/* Grid of 15 Levels */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {filteredLevels.map((lvl) => {
              const isUnlocked = lvl.levelNumber <= unlockedLevelMax || teacherPreviewMode;
              const isDone = Boolean(completedLevels[lvl.levelNumber]);
              const isCurrent = currentLevelNumber === lvl.levelNumber;

              return (
                <div
                  key={lvl.levelNumber}
                  onClick={() => {
                    if (isUnlocked) {
                      triggerSound("pop");
                      jumpToLevel(lvl.levelNumber);
                    }
                  }}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    isCurrent
                      ? "bg-amber-500/10 border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.2)] ring-2 ring-amber-400/50"
                      : isDone
                      ? "bg-surface/80 border-emerald-500/40 hover:border-emerald-400 cursor-pointer"
                      : isUnlocked
                      ? "bg-surface/50 border-line hover:border-slate-500 cursor-pointer"
                      : "bg-canvas/40 border-line opacity-45 cursor-not-allowed"
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <LevelLucideIcon levelNumber={lvl.levelNumber} className="w-5 h-5 shrink-0" />
                        <span className="font-mono font-black text-xs text-ink">
                          Level {lvl.levelNumber}
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                          lvl.difficulty === "Easy"
                            ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                            : lvl.difficulty === "Medium"
                            ? "bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-500/30"
                            : lvl.difficulty === "Challenging"
                            ? "bg-purple-500/20 text-purple-600 dark:text-purple-300 border-purple-500/30"
                            : "bg-amber-500/20 text-slate-800 dark:text-amber-300 border-amber-500/30"
                        }`}
                      >
                        {lvl.difficulty}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-ink text-sm leading-snug">{lvl.title}</h4>
                      <p className="text-xs text-muted mt-1 line-clamp-2 leading-relaxed">
                        {lvl.shortDesc}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-line flex items-center justify-between mt-3 text-xs font-mono">
                    <span className="text-slate-500 text-[11px]">{lvl.category}</span>
                    {isDone ? (
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mastered</span>
                      </span>
                    ) : isUnlocked ? (
                      <span className="text-slate-800 dark:text-amber-400 font-bold flex items-center gap-1">
                        <span>Play Quiz</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="text-slate-600 flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        <span>Locked</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    );
  }

  // ============================================================
  // RENDER: PRIMARY PRACTICE QUIZ ARENA (Clean & Focused)
  // ============================================================
  // ============================================================
  // Dynamic Background Theme Classes depending on Kid Settings Page
  // ============================================================
  // Each kid theme is a tint over the canvas. Light gets a pale wash, dark the
  // deep original — the gradient stops used to be dark-only, so in light mode
  // the whole arena stayed near-black.
  const getThemeBgClass = () => {
    const tint: Record<string, string> = {
      magical: "from-teal-50 dark:from-teal-950/40",
      cyber: "from-indigo-50 dark:from-indigo-950/40",
      candy: "from-pink-50 dark:from-pink-950/40",
      retro: "from-amber-50 dark:from-amber-950/40",
    };
    const from = tint[kidThemeMode];
    if (!from) return "bg-canvas";
    return `bg-canvas bg-gradient-to-b ${from} via-canvas to-canvas`;
  };

  const progressPercent = (currentQuestionIndex / TOTAL_QUESTIONS_PER_ROUND) * 100;

  return (
    <div className={`flex-1 min-h-0 ${getThemeBgClass()} text-ink flex flex-col select-none`}>
      {/* ============================================================ */}
      {/* 1. SINGLE CLEAN RESPONSIVE QUIZ TOPBAR                        */}
      {/* ============================================================ */}
      <header className="px-2.5 sm:px-4 py-2 sm:py-2.5 bg-canvas/90 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-1.5 sm:gap-3">
          {/* Left: Level Identity & Switcher */}
          <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-initial shrink">
            <button
              onClick={() => {
                triggerSound("pop");
                setShowLevelPicker(true);
              }}
              className="flex items-center gap-2 bg-surface/90 hover:bg-surface-muted/90 px-3 py-1.5 rounded-2xl border border-line shadow-sm transition min-w-0 text-left cursor-pointer"
              title="Select Practice Level"
              aria-label="Select Practice Level"
            >
              <LevelLucideIcon levelNumber={currentLevelNumber} className="w-5 h-5 shrink-0" />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-ink font-mono truncate max-w-[100px] xs:max-w-[160px] sm:max-w-[280px]">
                    L{currentLevelNumber}: {activeLevelConfig.title}
                  </span>
                  <span className="hidden xs:inline-block text-[10px] font-mono font-bold text-slate-800 dark:text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded-md border border-amber-400/20 shrink-0">
                    {currentLevelNumber}/15
                  </span>
                </div>
                <span className="text-[10px] text-muted font-medium hidden md:block truncate max-w-[260px]">
                  {activeLevelConfig.skillConcept}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-muted shrink-0 ml-1 hidden xs:block" />
            </button>
          </div>

          {/* Center: Question Progress Bar */}
          <div className="flex flex-col items-center gap-0.5 sm:gap-1 min-w-[70px] xs:min-w-[100px] sm:min-w-[160px] shrink-0">
            <div className="flex items-center justify-between w-full text-[10px] sm:text-[11px] font-mono font-bold text-muted">
              <span><span className="hidden xs:inline">Q </span>{currentQuestionIndex}/{TOTAL_QUESTIONS_PER_ROUND}</span>
              <span className="text-slate-800 dark:text-amber-400 ml-1">{Math.round(progressPercent)}%</span>
            </div>
            <div className="w-full h-1.5 sm:h-2 bg-surface rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Right: Gamified Stats & Voice Assistant */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <div className="hidden lg:flex items-center gap-2 bg-surface/60 px-2 py-1 rounded-xl text-xs font-mono">
              <div className="flex items-center gap-1 text-orange-700 dark:text-orange-400" title="Current Streak">
                <Flame className="w-3.5 h-3.5 fill-orange-400" />
                <span className="font-bold">{streakCount}</span>
              </div>
              <div className="flex items-center gap-1 text-slate-800 dark:text-amber-400" title="Coins">
                <Coins className="w-3.5 h-3.5" />
                <span className="font-bold">{playerCoins}</span>
              </div>
              <div className="flex items-center gap-1 text-rose-700 dark:text-rose-400" title="Hearts">
                <Heart className="w-3.5 h-3.5 fill-rose-500" />
                <span className="font-bold">{playerHearts}</span>
              </div>
            </div>

            {/* Live Voice Coach Pill */}
            <button
              onClick={() => {
                triggerSound("pop");
                setShowLiveVoiceModal(true);
              }}
              className="flex items-center gap-1 px-3 py-2 min-h-[40px] rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition transform active:scale-95 shrink-0"
              title="Talk to Koda with Live Voice"
              aria-label="Talk to Koda with Live Voice"
            >
              <Mic className="w-3.5 h-3.5 text-slate-950 animate-pulse" />
              <span className="hidden sm:inline">Voice</span>
            </button>

            {/* Audio toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 min-w-[40px] min-h-[40px] rounded-xl text-muted hover:text-ink transition shrink-0"
              title={soundEnabled ? "Mute Sound" : "Unmute Sound"}
              aria-label={soundEnabled ? "Mute Sound" : "Unmute Sound"}
            >
              {soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-700 dark:text-emerald-400" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500" />
              )}
            </button>

            {/* Plugin & Feature Settings Button */}
            <button
              onClick={() => {
                triggerSound("pop");
                setShowPluginSettingsModal(true);
              }}
              className="p-2 min-w-[40px] min-h-[40px] rounded-xl text-muted hover:text-slate-800 dark:text-amber-300 hover:bg-surface-muted transition shrink-0 flex items-center justify-center cursor-pointer"
              title="Manage Counting Plugin & Features"
              aria-label="Manage Counting Plugin & Features"
            >
              <Sliders className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-800 dark:text-amber-400" />
            </button>

            {/* Fullscreen / Zen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-2 min-w-[40px] min-h-[40px] rounded-xl text-muted hover:text-ink hover:bg-surface-muted transition shrink-0 flex items-center justify-center"
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullscreen ? (
                <Minimize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-800 dark:text-amber-400" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              )}
            </button>

            {/* Exit Quiz Close Button */}
            <button
              onClick={() => {
                triggerSound("pop");
                koda?.log("EXIT_GAME", "User exited Learn quiz arena.", currentLevelNumber, currentQuestionIndex);
                onBackToHome();
              }}
              className="p-2 min-w-[40px] min-h-[40px] rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-700 dark:text-rose-400 hover:text-white transition shrink-0 flex items-center justify-center cursor-pointer border border-rose-500/20"
              title="Exit Learn"
              aria-label="Exit Learn"
            >
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ============================================================ */}
      {/* 2. CENTRAL QUIZ ARENA (Focused Canvas, No Heavy Borderlines) */}
      {/* ============================================================ */}
      <main className="flex-1 p-3 sm:p-6 pb-32 flex flex-col justify-center max-w-4xl mx-auto w-full">
        {/* Prominent Question Header */}
        <div className="bg-surface/50 rounded-3xl p-4 sm:p-6 space-y-4">
          <PracticeStepHeader
            stepNumber={currentQuestionIndex}
            totalSteps={TOTAL_QUESTIONS_PER_ROUND}
            title={currentQuestionText}
            showTip={showTip}
            onToggleTip={() => setShowTip(!showTip)}
            onReadAloud={() => {
              playSound("pop");
              const prompt =
                currentLevelNumber === 1
                  ? `Touch each ${l1ActiveAsset.name} from left to right to count the total.`
                  : activeLevelConfig.title;
              speakAudio(prompt);
            }}
            levelNumber={currentLevelNumber}
          />

          {/* Collapsible Socratic Math Tip Banner */}
          {showTip && (
            <div className="p-3.5 sm:p-4 bg-indigo-950/40 rounded-2xl text-xs sm:text-[13px] text-indigo-200 leading-relaxed space-y-1.5 animate-fadeIn">
              <div className="leading-snug">
                <span className="font-bold text-ink mr-1.5">💡 Pedagogical Concept:</span>
                <span className="font-bold text-slate-800 dark:text-amber-300">{activeLevelConfig.skillConcept}</span>
              </div>
              <p className="text-indigo-200/90">{activeLevelConfig.pedagogyTip}</p>
            </div>
          )}

          {/* ======================================================== */}
          {/* MANIPULATIVE WORKSPACE CONTAINER                        */}
          {/* ======================================================== */}
          <div className="pt-2">
            {/* LEVEL 1: Linear 1-to-1 Counting */}
            {currentLevelNumber === 1 && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-center gap-3.5 p-6 bg-canvas/60 rounded-2xl min-h-[160px]">
                  {Array.from({ length: l1TargetCount }).map((_, idx) => {
                    const isTapped = l1TappedList.includes(idx);
                    const tagNumber = isTapped ? l1TappedList.indexOf(idx) + 1 : null;
                    const isRecentlyPopped = recentlyPoppedL1Index === idx;

                    return (
                      <button
                        key={idx}
                        onClick={() => handleTouchL1Object(idx)}
                        disabled={isTapped}
                        aria-label={
                          isTapped
                            ? `Item ${idx + 1} of ${l1TargetCount}, counted as number ${tagNumber}`
                            : `Item ${idx + 1} of ${l1TargetCount}, not counted yet`
                        }
                        className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex flex-col items-center justify-center transition-all transform active:scale-95 ${
                          isRecentlyPopped
                            ? "tap-pop-anim bg-amber-400/30 text-slate-800 dark:text-amber-300 ring-4 ring-amber-400/70 shadow-xl shadow-amber-400/40 scale-125 z-20"
                            : isTapped
                            ? "bg-amber-400/20 text-slate-800 dark:text-amber-300 shadow-sm scale-105"
                            : "bg-surface hover:bg-surface-muted hover:scale-105"
                        }`}
                      >
                        <span className={`text-4xl filter drop-shadow transition-transform duration-300 ${isRecentlyPopped ? "scale-125" : ""}`}>
                          {l1ActiveAsset.emoji}
                        </span>
                        {isTapped && (
                          <span className={`absolute -top-2 -right-2 w-6 h-6 bg-amber-400 text-slate-950 font-mono font-black text-xs rounded-full flex items-center justify-center shadow transition-all duration-300 ${isRecentlyPopped ? "scale-125 animate-bounce" : ""}`}>
                            #{tagNumber}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="text-center">
                  <span className="text-xs font-mono text-muted" role="status" aria-live="polite">
                    Tapped: <strong className="text-slate-800 dark:text-amber-400 text-sm">{l1TappedList.length}</strong> / {l1TargetCount}
                  </span>
                </div>
              </div>
            )}

            {/* LEVEL 2: Scattered Objects */}
            {currentLevelNumber === 2 && (
              <div className="space-y-3">
                <div className="relative w-full h-[260px] bg-canvas/60 rounded-2xl overflow-hidden">
                  {l2ScatterPositions.map((pos, idx) => {
                    const isTapped = l1TappedList.includes(idx);
                    const tagNumber = isTapped ? l1TappedList.indexOf(idx) + 1 : null;
                    const isRecentlyPopped = recentlyPoppedL2Index === idx;

                    return (
                      <button
                        key={idx}
                        onClick={() => handleTouchL2Object(idx)}
                        disabled={isTapped}
                        aria-label={
                          isTapped
                            ? `Item ${idx + 1} of ${l2ScatterPositions.length}, counted as number ${tagNumber}`
                            : `Item ${idx + 1} of ${l2ScatterPositions.length}, not counted yet`
                        }
                        style={{
                          top: pos.top,
                          left: pos.left,
                          transform: `rotate(${pos.rotate}) ${isRecentlyPopped ? "scale(1.3)" : isTapped ? "scale(1.05)" : "scale(1)"}`,
                        }}
                        className={`absolute w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                          isRecentlyPopped
                            ? "tap-pop-anim bg-cyan-400/40 text-cyan-200 ring-4 ring-cyan-400/80 shadow-xl shadow-cyan-400/50 z-30 pointer-events-none"
                            : isTapped
                            ? "bg-cyan-500/25 text-cyan-700 dark:text-cyan-300 shadow-sm pointer-events-none"
                            : "bg-surface hover:scale-105 hover:bg-surface-muted"
                        }`}
                      >
                        <span className={`text-2xl transition-transform duration-300 ${isRecentlyPopped ? "scale-125" : ""}`}>
                          {l1ActiveAsset.emoji}
                        </span>
                        {isTapped && (
                          <span className={`absolute -top-1.5 -right-1.5 w-5 h-5 bg-cyan-400 text-slate-950 font-mono font-bold text-[10px] rounded-full flex items-center justify-center shadow transition-all duration-300 ${isRecentlyPopped ? "scale-125 animate-bounce" : ""}`}>
                            {tagNumber}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                <div className="text-center">
                  <span className="text-xs font-mono text-muted" role="status" aria-live="polite">
                    Counted: <strong className="text-cyan-700 dark:text-cyan-400 text-sm">{l1TappedList.length}</strong> / {l1TargetCount}
                  </span>
                </div>
              </div>
            )}

            {/* LEVEL 3: Conservation & Comparison */}
            {currentLevelNumber === 3 && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Group A */}
                  <div className="bg-canvas/60 p-4 sm:p-5 rounded-3xl border border-purple-500/30 flex flex-col items-center justify-between space-y-3 min-h-[170px] shadow-lg">
                    <div className="flex items-center justify-between w-full px-1">
                      <span className="font-mono text-xs font-bold text-purple-600 dark:text-purple-300">
                        Left group ({l3ConservationData.layoutA.label})
                      </span>
                      <span className="text-[11px] font-mono text-muted">
                        Counted: <strong className="text-purple-600 dark:text-purple-300">{l3ConservationData.tappedA.length}</strong>
                      </span>
                    </div>

                    <div className="flex-1 flex items-center justify-center w-full py-1">
                      {l3ConservationData.layoutA.type === "cluster" && (
                        <div className="grid grid-cols-3 gap-2.5 max-w-[170px] justify-items-center">
                          {Array.from({ length: l3ConservationData.countA }).map((_, i) => {
                            const isTapped = l3ConservationData.tappedA.includes(i);
                            return (
                              <button
                                key={i}
                                onClick={() => handleToggleL3Tap("A", i)}
                                className={`relative w-11 h-11 rounded-2xl flex items-center justify-center text-xl transition transform active:scale-90 select-none cursor-pointer ${
                                  isTapped
                                    ? "bg-purple-500/40 border-2 border-purple-400 scale-105 shadow-[0_0_12px_rgba(168,85,247,0.4)]"
                                    : "bg-purple-500/15 border border-purple-500/30 hover:bg-purple-500/25"
                                }`}
                              >
                                <span>{l3ConservationData.themeA.emoji}</span>
                                {isTapped && (
                                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-400 text-slate-950 font-mono font-black text-[9px] flex items-center justify-center shadow-sm">
                                    {l3ConservationData.tappedA.indexOf(i) + 1}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {l3ConservationData.layoutA.type === "line" && (
                        <div className="flex flex-wrap gap-2.5 sm:gap-3 justify-center w-full max-w-[280px]">
                          {Array.from({ length: l3ConservationData.countA }).map((_, i) => {
                            const isTapped = l3ConservationData.tappedA.includes(i);
                            return (
                              <button
                                key={i}
                                onClick={() => handleToggleL3Tap("A", i)}
                                className={`relative w-11 h-11 rounded-2xl flex items-center justify-center text-xl transition transform active:scale-90 select-none cursor-pointer ${
                                  isTapped
                                    ? "bg-purple-500/40 border-2 border-purple-400 scale-105 shadow-[0_0_12px_rgba(168,85,247,0.4)]"
                                    : "bg-purple-500/15 border border-purple-500/30 hover:bg-purple-500/25"
                                }`}
                              >
                                <span>{l3ConservationData.themeA.emoji}</span>
                                {isTapped && (
                                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-400 text-slate-950 font-mono font-black text-[9px] flex items-center justify-center shadow-sm">
                                    {l3ConservationData.tappedA.indexOf(i) + 1}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {l3ConservationData.layoutA.type === "circle" && (
                        <div className="relative w-36 h-36 flex items-center justify-center">
                          {Array.from({ length: l3ConservationData.countA }).map((_, i) => {
                            const angle = (2 * Math.PI * i) / l3ConservationData.countA - Math.PI / 2;
                            const radius = l3ConservationData.countA > 5 ? 52 : 44;
                            const x = Math.cos(angle) * radius;
                            const y = Math.sin(angle) * radius;
                            const isTapped = l3ConservationData.tappedA.includes(i);
                            return (
                              <button
                                key={i}
                                onClick={() => handleToggleL3Tap("A", i)}
                                style={{ transform: `translate(${x}px, ${y}px)` }}
                                className={`absolute w-10 h-10 rounded-2xl flex items-center justify-center text-lg transition active:scale-90 select-none cursor-pointer ${
                                  isTapped
                                    ? "bg-purple-500/40 border-2 border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.4)]"
                                    : "bg-purple-500/15 border border-purple-500/30 hover:bg-purple-500/25"
                                }`}
                              >
                                <span>{l3ConservationData.themeA.emoji}</span>
                                {isTapped && (
                                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-400 text-slate-950 font-mono font-black text-[9px] flex items-center justify-center shadow-sm">
                                    {l3ConservationData.tappedA.indexOf(i) + 1}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {l3ConservationData.layoutA.type === "pairs" && (
                        <div className="grid grid-cols-2 gap-2.5 max-w-[130px] justify-items-center">
                          {Array.from({ length: l3ConservationData.countA }).map((_, i) => {
                            const isTapped = l3ConservationData.tappedA.includes(i);
                            return (
                              <button
                                key={i}
                                onClick={() => handleToggleL3Tap("A", i)}
                                className={`relative w-11 h-11 rounded-2xl flex items-center justify-center text-xl transition transform active:scale-90 select-none cursor-pointer ${
                                  isTapped
                                    ? "bg-purple-500/40 border-2 border-purple-400 scale-105 shadow-[0_0_12px_rgba(168,85,247,0.4)]"
                                    : "bg-purple-500/15 border border-purple-500/30 hover:bg-purple-500/25"
                                }`}
                              >
                                <span>{l3ConservationData.themeA.emoji}</span>
                                {isTapped && (
                                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-400 text-slate-950 font-mono font-black text-[9px] flex items-center justify-center shadow-sm">
                                    {l3ConservationData.tappedA.indexOf(i) + 1}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {l3ConservationData.layoutA.type === "column" && (
                        <div className="flex flex-col gap-2 items-center justify-center">
                          {Array.from({ length: l3ConservationData.countA }).map((_, i) => {
                            const isTapped = l3ConservationData.tappedA.includes(i);
                            return (
                              <button
                                key={i}
                                onClick={() => handleToggleL3Tap("A", i)}
                                className={`relative w-10 h-10 rounded-2xl flex items-center justify-center text-lg transition transform active:scale-90 select-none cursor-pointer ${
                                  isTapped
                                    ? "bg-purple-500/40 border-2 border-purple-400 scale-105 shadow-[0_0_12px_rgba(168,85,247,0.4)]"
                                    : "bg-purple-500/15 border border-purple-500/30 hover:bg-purple-500/25"
                                }`}
                              >
                                <span>{l3ConservationData.themeA.emoji}</span>
                                {isTapped && (
                                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-400 text-slate-950 font-mono font-black text-[9px] flex items-center justify-center shadow-sm">
                                    {l3ConservationData.tappedA.indexOf(i) + 1}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {l3ConservationData.layoutA.type === "scattered" && (
                        <div className="flex flex-wrap gap-2.5 justify-center max-w-[210px]">
                          {Array.from({ length: l3ConservationData.countA }).map((_, i) => {
                            const isTapped = l3ConservationData.tappedA.includes(i);
                            const rot = ((i * 19) % 29) - 14;
                            return (
                              <button
                                key={i}
                                onClick={() => handleToggleL3Tap("A", i)}
                                style={{ transform: `rotate(${rot}deg)` }}
                                className={`relative w-11 h-11 rounded-2xl flex items-center justify-center text-xl transition active:scale-90 select-none cursor-pointer ${
                                  isTapped
                                    ? "bg-purple-500/40 border-2 border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.4)]"
                                    : "bg-purple-500/15 border border-purple-500/30 hover:bg-purple-500/25"
                                }`}
                              >
                                <span>{l3ConservationData.themeA.emoji}</span>
                                {isTapped && (
                                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-400 text-slate-950 font-mono font-black text-[9px] flex items-center justify-center shadow-sm">
                                    {l3ConservationData.tappedA.indexOf(i) + 1}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Group B */}
                  <div className="bg-canvas/60 p-4 sm:p-5 rounded-3xl border border-cyan-500/30 flex flex-col items-center justify-between space-y-3 min-h-[170px] shadow-lg">
                    <div className="flex items-center justify-between w-full px-1">
                      <span className="font-mono text-xs font-bold text-cyan-700 dark:text-cyan-300">
                        Right group ({l3ConservationData.layoutB.label})
                      </span>
                      <span className="text-[11px] font-mono text-muted">
                        Counted: <strong className="text-cyan-700 dark:text-cyan-300">{l3ConservationData.tappedB.length}</strong>
                      </span>
                    </div>

                    <div className="flex-1 flex items-center justify-center w-full py-1">
                      {l3ConservationData.layoutB.type === "cluster" && (
                        <div className="grid grid-cols-3 gap-2.5 max-w-[170px] justify-items-center">
                          {Array.from({ length: l3ConservationData.countB }).map((_, i) => {
                            const isTapped = l3ConservationData.tappedB.includes(i);
                            return (
                              <button
                                key={i}
                                onClick={() => handleToggleL3Tap("B", i)}
                                className={`relative w-11 h-11 rounded-2xl flex items-center justify-center text-xl transition transform active:scale-90 select-none cursor-pointer ${
                                  isTapped
                                    ? "bg-cyan-500/40 border-2 border-cyan-400 scale-105 shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                                    : "bg-cyan-500/15 border border-cyan-500/30 hover:bg-cyan-500/25"
                                }`}
                              >
                                <span>{l3ConservationData.themeB.emoji}</span>
                                {isTapped && (
                                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-400 text-slate-950 font-mono font-black text-[9px] flex items-center justify-center shadow-sm">
                                    {l3ConservationData.tappedB.indexOf(i) + 1}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {l3ConservationData.layoutB.type === "line" && (
                        <div className="flex flex-wrap gap-2.5 sm:gap-3 justify-center w-full max-w-[280px]">
                          {Array.from({ length: l3ConservationData.countB }).map((_, i) => {
                            const isTapped = l3ConservationData.tappedB.includes(i);
                            return (
                              <button
                                key={i}
                                onClick={() => handleToggleL3Tap("B", i)}
                                className={`relative w-11 h-11 rounded-2xl flex items-center justify-center text-xl transition transform active:scale-90 select-none cursor-pointer ${
                                  isTapped
                                    ? "bg-cyan-500/40 border-2 border-cyan-400 scale-105 shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                                    : "bg-cyan-500/15 border border-cyan-500/30 hover:bg-cyan-500/25"
                                }`}
                              >
                                <span>{l3ConservationData.themeB.emoji}</span>
                                {isTapped && (
                                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-400 text-slate-950 font-mono font-black text-[9px] flex items-center justify-center shadow-sm">
                                    {l3ConservationData.tappedB.indexOf(i) + 1}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {l3ConservationData.layoutB.type === "circle" && (
                        <div className="relative w-36 h-36 flex items-center justify-center">
                          {Array.from({ length: l3ConservationData.countB }).map((_, i) => {
                            const angle = (2 * Math.PI * i) / l3ConservationData.countB - Math.PI / 2;
                            const radius = l3ConservationData.countB > 5 ? 52 : 44;
                            const x = Math.cos(angle) * radius;
                            const y = Math.sin(angle) * radius;
                            const isTapped = l3ConservationData.tappedB.includes(i);
                            return (
                              <button
                                key={i}
                                onClick={() => handleToggleL3Tap("B", i)}
                                style={{ transform: `translate(${x}px, ${y}px)` }}
                                className={`absolute w-10 h-10 rounded-2xl flex items-center justify-center text-lg transition active:scale-90 select-none cursor-pointer ${
                                  isTapped
                                    ? "bg-cyan-500/40 border-2 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                                    : "bg-cyan-500/15 border border-cyan-500/30 hover:bg-cyan-500/25"
                                }`}
                              >
                                <span>{l3ConservationData.themeB.emoji}</span>
                                {isTapped && (
                                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-400 text-slate-950 font-mono font-black text-[9px] flex items-center justify-center shadow-sm">
                                    {l3ConservationData.tappedB.indexOf(i) + 1}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {l3ConservationData.layoutB.type === "pairs" && (
                        <div className="grid grid-cols-2 gap-2.5 max-w-[130px] justify-items-center">
                          {Array.from({ length: l3ConservationData.countB }).map((_, i) => {
                            const isTapped = l3ConservationData.tappedB.includes(i);
                            return (
                              <button
                                key={i}
                                onClick={() => handleToggleL3Tap("B", i)}
                                className={`relative w-11 h-11 rounded-2xl flex items-center justify-center text-xl transition transform active:scale-90 select-none cursor-pointer ${
                                  isTapped
                                    ? "bg-cyan-500/40 border-2 border-cyan-400 scale-105 shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                                    : "bg-cyan-500/15 border border-cyan-500/30 hover:bg-cyan-500/25"
                                }`}
                              >
                                <span>{l3ConservationData.themeB.emoji}</span>
                                {isTapped && (
                                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-400 text-slate-950 font-mono font-black text-[9px] flex items-center justify-center shadow-sm">
                                    {l3ConservationData.tappedB.indexOf(i) + 1}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {l3ConservationData.layoutB.type === "column" && (
                        <div className="flex flex-col gap-2 items-center justify-center">
                          {Array.from({ length: l3ConservationData.countB }).map((_, i) => {
                            const isTapped = l3ConservationData.tappedB.includes(i);
                            return (
                              <button
                                key={i}
                                onClick={() => handleToggleL3Tap("B", i)}
                                className={`relative w-10 h-10 rounded-2xl flex items-center justify-center text-lg transition transform active:scale-90 select-none cursor-pointer ${
                                  isTapped
                                    ? "bg-cyan-500/40 border-2 border-cyan-400 scale-105 shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                                    : "bg-cyan-500/15 border border-cyan-500/30 hover:bg-cyan-500/25"
                                }`}
                              >
                                <span>{l3ConservationData.themeB.emoji}</span>
                                {isTapped && (
                                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-400 text-slate-950 font-mono font-black text-[9px] flex items-center justify-center shadow-sm">
                                    {l3ConservationData.tappedB.indexOf(i) + 1}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {l3ConservationData.layoutB.type === "scattered" && (
                        <div className="flex flex-wrap gap-2.5 justify-center max-w-[210px]">
                          {Array.from({ length: l3ConservationData.countB }).map((_, i) => {
                            const isTapped = l3ConservationData.tappedB.includes(i);
                            const rot = ((i * 23) % 29) - 14;
                            return (
                              <button
                                key={i}
                                onClick={() => handleToggleL3Tap("B", i)}
                                style={{ transform: `rotate(${rot}deg)` }}
                                className={`relative w-11 h-11 rounded-2xl flex items-center justify-center text-xl transition active:scale-90 select-none cursor-pointer ${
                                  isTapped
                                    ? "bg-cyan-500/40 border-2 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                                    : "bg-cyan-500/15 border border-cyan-500/30 hover:bg-cyan-500/25"
                                }`}
                              >
                                <span>{l3ConservationData.themeB.emoji}</span>
                                {isTapped && (
                                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-400 text-slate-950 font-mono font-black text-[9px] flex items-center justify-center shadow-sm">
                                    {l3ConservationData.tappedB.indexOf(i) + 1}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3 Balanced Choice Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 max-w-xl mx-auto">
                  <button
                    onClick={() => handleConservationAnswer("A")}
                    className={`px-4 py-3 rounded-2xl border text-xs sm:text-sm font-mono font-bold transition transform active:scale-95 cursor-pointer ${
                      l3ConservationSelection === "A"
                        ? "bg-purple-500 text-white border-purple-300 ring-2 ring-purple-400 shadow-md"
                        : "bg-surface hover:bg-purple-950/40 border-line/80 text-slate-200"
                    }`}
                  >
                    Left has more
                  </button>

                  <button
                    onClick={() => handleConservationAnswer("SAME")}
                    className={`px-4 py-3 rounded-2xl border text-xs sm:text-sm font-mono font-bold transition transform active:scale-95 cursor-pointer ${
                      l3ConservationSelection === "SAME"
                        ? "bg-amber-400 text-slate-950 border-amber-300 ring-2 ring-amber-400 shadow-md font-black"
                        : "bg-surface hover:bg-amber-950/40 border-line/80 text-slate-200"
                    }`}
                  >
                    Same!
                  </button>

                  <button
                    onClick={() => handleConservationAnswer("B")}
                    className={`px-4 py-3 rounded-2xl border text-xs sm:text-sm font-mono font-bold transition transform active:scale-95 cursor-pointer ${
                      l3ConservationSelection === "B"
                        ? "bg-cyan-500 text-white border-cyan-300 ring-2 ring-cyan-400 shadow-md"
                        : "bg-surface hover:bg-cyan-950/40 border-line/80 text-slate-200"
                    }`}
                  >
                    Right has more
                  </button>
                </div>
              </div>
            )}

            {/* LEVEL 4-6: Subitizing */}
            {currentLevelNumber >= 4 && currentLevelNumber <= 6 && (
              <div className="space-y-4 text-center">
                <div className="relative w-full h-[200px] bg-canvas rounded-2xl border border-line flex items-center justify-center overflow-hidden">
                  {l4AwaitingStart ? (
                    /* The child starts the flash, so their attention is on the
                       screen when the dots appear. */
                    <div className="text-center space-y-3">
                      <p className="text-base font-bold text-slate-700 dark:text-slate-200">
                        Ready? Watch closely!
                      </p>
                      <button
                        onClick={() => startSubitizingFlash(currentLevelNumber)}
                        className={themeSystem.button("primary", "lg")}
                        autoFocus
                      >
                        Show me
                      </button>
                    </div>
                  ) : l4FlashHidden ? (
                    <div className="text-center space-y-2.5">
                      <span className="text-3xl">❓</span>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                        How many dots did you see?
                      </p>
                      <button
                        onClick={() => startSubitizingFlash(currentLevelNumber)}
                        className={themeSystem.button("secondary", "sm")}
                      >
                        Show me again
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center animate-scaleUp">
                      {currentLevelNumber === 4 && (
                        <div className="grid grid-cols-3 gap-3 p-4 bg-surface rounded-2xl border border-line shadow-2xl">
                          {Array.from({ length: l4Target }).map((_, i) => (
                            <div key={i} className="w-8 h-8 rounded-full bg-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.9)]" />
                          ))}
                        </div>
                      )}

                      {currentLevelNumber === 5 && (
                        <div className="relative w-64 h-36">
                          {l5IrregularPoints.map((pt, i) => (
                            <div
                              key={i}
                              style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
                              className="absolute w-7 h-7 rounded-full bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.9)] -translate-x-1/2 -translate-y-1/2"
                            />
                          ))}
                        </div>
                      )}

                      {currentLevelNumber === 6 && l6ConceptualData && (
                        <div className="flex items-center gap-6 p-4 bg-surface rounded-2xl border border-line">
                          <div className="flex gap-2">
                            {Array.from({ length: l6ConceptualData.targetA }).map((_, i) => (
                              <div key={i} className={`w-8 h-8 rounded-full ${l6ConceptualData.colorPair.colorA} shadow-md`} />
                            ))}
                          </div>
                          <span className="text-xl font-mono text-slate-500 font-bold">+</span>
                          <div className="flex gap-2">
                            {Array.from({ length: l6ConceptualData.targetB }).map((_, i) => (
                              <div key={i} className={`w-8 h-8 rounded-full ${l6ConceptualData.colorPair.colorB} shadow-md`} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Keypad */}
                <div className="flex flex-wrap items-center justify-center gap-2.5">
                  {[2, 3, 4, 5, 6, 7, 8].map((num) => (
                    <button
                      key={num}
                      onClick={() => handleSubitizingGuess(num)}
                      className="w-12 h-12 rounded-2xl bg-surface hover:bg-amber-400 hover:text-slate-950 border border-line font-mono font-black text-base transition transform active:scale-95 shadow"
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* LEVEL 7: 5-Anchor Ten-Frame */}
            {currentLevelNumber === 7 && (
              <div className="space-y-4">
                <div className="max-w-md mx-auto bg-canvas p-4 rounded-3xl border-2 border-purple-500/40 space-y-2.5 shadow-2xl">
                  {/* Top Row (5 Anchor) */}
                  <div className="grid grid-cols-5 gap-2">
                    {l7SingleFrame.slice(0, 5).map((filled, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleToggleL7Cell(idx)}
                        className={`h-16 rounded-2xl border-2 flex items-center justify-center transition-all ${
                          filled
                            ? "bg-purple-500 border-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.5)] scale-95"
                            : "bg-surface border-line hover:border-purple-400"
                        }`}
                      >
                        {filled && <span className="text-2xl">⚡</span>}
                      </button>
                    ))}
                  </div>

                  {/* Bottom Row */}
                  <div className="grid grid-cols-5 gap-2">
                    {l7SingleFrame.slice(5, 10).map((filled, idx) => (
                      <button
                        key={idx + 5}
                        onClick={() => handleToggleL7Cell(idx + 5)}
                        className={`h-16 rounded-2xl border-2 flex items-center justify-center transition-all ${
                          filled
                            ? "bg-cyan-500 border-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.5)] scale-95"
                            : "bg-surface border-line hover:border-cyan-400"
                        }`}
                      >
                        {filled && <span className="text-2xl">⚡</span>}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-center gap-4">
                  <span className="font-mono text-xs text-muted">
                    Filled: <strong>{l7SingleFrame.filter(Boolean).length}</strong> / {l7SingleTarget}
                  </span>
                  <button
                    onClick={handleCheckL7Frame}
                    className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-ink font-mono font-black text-xs shadow-lg transition active:scale-95 flex items-center gap-2"
                  >
                    <Rocket className="w-4 h-4" />
                    <span>Check Ten-Frame</span>
                  </button>
                </div>
              </div>
            )}

            {/* LEVEL 8: Making 10 */}
            {currentLevelNumber === 8 && (
              <div className="space-y-4">
                <div className="max-w-md mx-auto bg-canvas p-4 rounded-3xl border-2 border-purple-500/40 space-y-2">
                  <div className="grid grid-cols-5 gap-2">
                    {Array.from({ length: 10 }).map((_, idx) => {
                      const isLoaded = idx < l8ComplementInitial;
                      return (
                        <div
                          key={idx}
                          className={`h-14 rounded-2xl border-2 flex items-center justify-center ${
                            isLoaded
                              ? "bg-purple-500 border-purple-300"
                              : "bg-surface border-dashed border-line"
                          }`}
                        >
                          {isLoaded ? <span className="text-xl">🔋</span> : <span className="text-slate-600 font-mono">?</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="text-center space-y-2">
                  <p className="text-xs text-muted font-mono">
                    Select how many empty spots are needed to make 10:
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2.5">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                      <button
                        key={num}
                        onClick={() => handleComplementAnswer(num)}
                        className="w-12 h-12 rounded-2xl bg-surface hover:bg-purple-400 hover:text-slate-950 border border-line font-mono font-black text-sm transition transform active:scale-95"
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* LEVEL 9: Teen Numbers */}
            {currentLevelNumber === 9 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                  {/* Frame 1 */}
                  <div className="bg-canvas p-3.5 rounded-2xl border border-purple-500/40 space-y-2">
                    <span className="font-mono text-xs text-purple-600 dark:text-purple-300 font-bold">Frame 1: 10 (Locked Full)</span>
                    <div className="grid grid-cols-5 gap-2">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} className="h-10 rounded-xl bg-purple-500/40 border border-purple-400 flex items-center justify-center text-sm">
                          ⚡
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Frame 2 */}
                  <div className="bg-canvas p-3.5 rounded-2xl border border-cyan-500/40 space-y-2">
                    <span className="font-mono text-xs text-cyan-700 dark:text-cyan-300 font-bold">Frame 2: Extra Ones</span>
                    <div className="grid grid-cols-5 gap-2">
                      {l9DoubleFrameB.map((filled, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleToggleL9Cell(idx)}
                          className={`h-10 rounded-xl border flex items-center justify-center transition ${
                            filled
                              ? "bg-cyan-500 border-cyan-300 text-sm shadow-[0_0_10px_rgba(6,182,212,0.4)]"
                              : "bg-surface border-line"
                          }`}
                        >
                          {filled && "⚡"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-4">
                  <span className="font-mono text-xs text-muted">
                    Total: 10 + {l9DoubleFrameB.filter(Boolean).length} ={" "}
                    <strong>{10 + l9DoubleFrameB.filter(Boolean).length}</strong>
                  </span>
                  <button
                    onClick={handleCheckL9Teen}
                    className="px-6 py-2 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-mono font-black text-xs shadow-lg transition active:scale-95"
                  >
                    Check Teen Number
                  </button>
                </div>
              </div>
            )}

            {/* LEVEL 10-11: Skip Counting Frog */}
            {(currentLevelNumber === 10 || currentLevelNumber === 11) && (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3 overflow-x-auto py-6 bg-canvas rounded-2xl border border-amber-500/30">
                  {l10Track.padValues.map((val, idx) => {
                    const isReached = idx <= l10FrogHopCount;
                    const isFrogHere = idx === l10FrogHopCount;

                    return (
                      <div key={idx} className="flex flex-col items-center gap-2 shrink-0">
                        {isFrogHere ? (
                          <div className="w-14 h-14 rounded-2xl bg-emerald-400 text-slate-950 flex items-center justify-center text-3xl shadow-lg animate-bounce">
                            🐸
                          </div>
                        ) : (
                          <div
                            className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center font-mono font-bold text-sm ${
                              isReached
                                ? "bg-amber-500/20 border-amber-400 text-slate-800 dark:text-amber-300"
                                : "bg-surface border-line text-slate-600"
                            }`}
                          >
                            🪷
                          </div>
                        )}
                        <span className="font-mono font-bold text-xs text-ink">{val}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-center">
                  <button
                    onClick={handleFrogHopForward}
                    disabled={l10FrogHopCount >= l10Track.maxHops}
                    className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-slate-950 font-mono font-black text-xs shadow-lg transition active:scale-95 flex items-center gap-2"
                  >
                    <span>Hop Forward (+{l10Track.step})</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* LEVEL 12: Missing Number */}
            {currentLevelNumber === 12 && (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3 py-6 bg-canvas rounded-2xl border border-amber-500/30 overflow-x-auto">
                  {l12MasterChallenge.sequence.map((val, idx) => (
                    <div
                      key={idx}
                      className={`w-16 h-16 rounded-2xl border-2 flex flex-col items-center justify-center font-mono font-black text-sm ${
                        val === null
                          ? "bg-amber-400/20 border-amber-400 text-slate-800 dark:text-amber-300 animate-pulse"
                          : "bg-surface border-line text-ink"
                      }`}
                    >
                      <span className="text-lg">{val === null ? "❓" : "🪷"}</span>
                      <span>{val === null ? (l12Guess !== null ? l12Guess : "___") : val}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3">
                  {l12MasterChallenge.options.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => handleMysteryPadGuess(opt)}
                      className="px-6 py-2.5 rounded-2xl bg-surface hover:bg-amber-400 hover:text-slate-950 border border-line font-mono font-black text-sm transition transform active:scale-95 shadow"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* LEVEL 13-15: Base-10 Blocks */}
            {currentLevelNumber >= 13 && currentLevelNumber <= 15 && (
              <div className="space-y-6">
                {/* Visual Level Guidance Badge */}
                <div className="p-4 rounded-2xl bg-surface/80 border border-line flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="text-left space-y-1">
                    <span className="text-[10px] font-mono font-bold tracking-wider text-teal-700 dark:text-teal-400 uppercase">
                      Your job
                    </span>
                    <h3 className="text-sm font-bold text-ink">
                      {currentLevelNumber === 13 && `Make this number: ${l13Target}`}
                      {currentLevelNumber === 14 && `Make this number: ${l14Target}`}
                      {currentLevelNumber === 15 && `Make this number: ${l15Target}`}
                    </h3>
                    <p className="text-xs text-muted">
                      {currentLevelNumber === 13 && "Make the number. Put 10 ones together to make a ten."}
                      {currentLevelNumber === 14 && "Make the number. Put 10 tens together to make a hundred."}
                      {currentLevelNumber === 15 && "Add or take away blocks until you get the number."}
                    </p>
                  </div>
                  {(currentLevelNumber === 13 || currentLevelNumber === 14 || currentLevelNumber === 15) && (
                    <div className="px-4 py-2 bg-gradient-to-r from-teal-500/10 to-emerald-500/10 border border-teal-500/30 rounded-xl flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-[9px] font-mono font-bold text-teal-700 dark:text-teal-400">MAKE</div>
                        <div className="text-xl font-black text-ink tracking-tight">{activeTarget}</div>
                      </div>
                      <div className="h-8 w-[1px] bg-teal-500/20" />
                      <div>
                        <div className="text-[9px] font-mono font-bold text-muted">YOU HAVE</div>
                        <div className={`text-xl font-black tracking-tight ${currentTotalBlocks === activeTarget ? "text-emerald-700 dark:text-emerald-400 animate-pulse" : "text-slate-200"}`}>
                          {currentTotalBlocks}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* YOUR BLOCKS (DRAG & DROP PALETTE) */}
                <div 
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (isDraggingTemplate === "block-remove") {
                      setHoveredChamber("recycle");
                    }
                  }}
                  onDragLeave={() => setHoveredChamber(null)}
                  onDrop={(e) => {
                    const removeType = e.dataTransfer.getData("remove-type");
                    if (removeType === "hundreds") {
                      handleSubHundred();
                    } else if (removeType === "tens") {
                      handleSubTen();
                    } else if (removeType === "ones") {
                      handleSubOne();
                    }
                    setHoveredChamber(null);
                    setIsDraggingTemplate(null);
                  }}
                  className={`p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden bg-surface/45 backdrop-blur-md ${
                    hoveredChamber === "recycle"
                      ? "border-rose-400 bg-rose-500/10 ring-4 ring-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.15)]"
                      : isDraggingTemplate === "block-remove"
                        ? "border-rose-500/50 bg-rose-950/10 border-dashed animate-pulse"
                        : "border-line"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div>
                      <h4 className="font-mono text-xs font-black text-body tracking-wider flex items-center gap-1.5 uppercase">
                        <span className="inline-block animate-bounce">🌌</span> Your blocks
                      </h4>
                      <p className="text-[11px] text-muted">
                        Drag blocks down to build your number. Drag them back to take them away.
                      </p>
                    </div>
                    {isDraggingTemplate === "block-remove" && (
                      <span className="px-2 py-1 rounded bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30 font-mono text-[10px] font-bold animate-pulse shrink-0">
                        🌀 DROP ANY BLOCK HERE TO REMOVE IT
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {/* HUNDREDS FLAT TEMPLATE */}
                    {currentLevelNumber !== 13 ? (
                      <div className="bg-canvas/80 rounded-xl border border-dashed border-rose-500/30 p-2.5 flex flex-col items-center justify-center space-y-2 select-none relative group">
                        <span className="font-mono text-[10px] font-bold text-rose-700 dark:text-rose-300">Hundreds Flat</span>
                        <div
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData("type", "hundreds");
                            setIsDraggingTemplate("hundreds");
                            triggerSound("pop");
                          }}
                          onTouchStart={() => triggerSound("pop")}
                          onDragEnd={() => {
                            setIsDraggingTemplate(null);
                            setHoveredChamber(null);
                          }}
                          className="block-draggable w-14 h-14 grid grid-cols-10 bg-gradient-to-br from-rose-500 to-rose-600 rounded border border-rose-400 shadow"
                          title="Click & Drag Me!"
                        >
                          {Array.from({ length: 100 }).map((_, c) => (
                            <div key={c} className="aspect-square border-[0.1px] border-rose-700/20" />
                          ))}
                        </div>
                        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">DRAG</span>
                      </div>
                    ) : (
                      <div className="hidden sm:flex bg-canvas/20 rounded-xl border border-line/40 p-2.5 flex-col items-center justify-center text-center opacity-25">
                        <span className="text-xs">🔒</span>
                        <span className="text-[9px] font-mono mt-1 text-slate-600">Tens and ones only</span>
                      </div>
                    )}

                    {/* TEN-ROD TEMPLATE */}
                    <div className="bg-canvas/80 rounded-xl border border-dashed border-amber-500/30 p-2.5 flex flex-col items-center justify-center space-y-2 select-none relative group">
                      <span className="font-mono text-[10px] font-bold text-slate-800 dark:text-amber-300">Ten</span>
                      <div
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData("type", "tens");
                          setIsDraggingTemplate("tens");
                          triggerSound("pop");
                        }}
                        onTouchStart={() => triggerSound("pop")}
                        onDragEnd={() => {
                          setIsDraggingTemplate(null);
                          setHoveredChamber(null);
                        }}
                        className="block-draggable w-3.5 h-14 flex flex-col bg-gradient-to-b from-amber-400 to-amber-500 rounded border border-amber-300 shadow"
                        title="Click & Drag Me!"
                      >
                        {Array.from({ length: 10 }).map((_, s) => (
                          <div key={s} className="flex-1 border-b border-amber-700/20 last:border-b-0" />
                        ))}
                      </div>
                      <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">DRAG</span>
                    </div>

                    {/* ONES UNIT TEMPLATE */}
                    <div className="bg-canvas/80 rounded-xl border border-dashed border-cyan-500/30 p-2.5 flex flex-col items-center justify-center space-y-2 select-none relative group">
                      <span className="font-mono text-[10px] font-bold text-cyan-700 dark:text-cyan-300">One</span>
                      <div
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData("type", "ones");
                          setIsDraggingTemplate("ones");
                          triggerSound("pop");
                        }}
                        onTouchStart={() => triggerSound("pop")}
                        onDragEnd={() => {
                          setIsDraggingTemplate(null);
                          setHoveredChamber(null);
                        }}
                        className="block-draggable w-5 h-5 rounded bg-gradient-to-br from-cyan-400 to-cyan-500 border border-cyan-300 shadow"
                        title="Click & Drag Me!"
                      />
                      <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">DRAG</span>
                    </div>

                    {/* RECYCLE ZONE / VORTEX */}
                    <div 
                      className={`rounded-xl border p-2.5 flex flex-col items-center justify-center space-y-1.5 transition-all duration-300 text-center ${
                        hoveredChamber === "recycle"
                          ? "bg-rose-500/20 border-rose-400 border-solid text-rose-700 dark:text-rose-300 animate-pulse scale-105 shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                          : isDraggingTemplate === "block-remove"
                            ? "bg-rose-950/20 border-rose-500/40 border-dashed text-rose-700 dark:text-rose-400 animate-bounce"
                            : "bg-canvas/40 border-line/60 text-slate-500"
                      }`}
                    >
                      <span className="text-xl">{hoveredChamber === "recycle" ? "🌀" : "🗑️"}</span>
                      <span className="font-mono text-[10px] font-bold block">Put Back</span>
                      <span className="text-[9px] text-muted block max-w-[120px] leading-tight">
                        {isDraggingTemplate === "block-remove" ? "Drop block here!" : "Drag here to take away"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* The Three Chambers */}
                <div className={`grid grid-cols-1 ${currentLevelNumber === 13 ? "md:grid-cols-2" : "md:grid-cols-3"} gap-4`}>
                  {/* HUNDREDS FLAT CHAMBER */}
                  {currentLevelNumber !== 13 && (
                    <div 
                      onDragOver={(e) => {
                        e.preventDefault();
                        if (isDraggingTemplate === "hundreds") {
                          setHoveredChamber("hundreds");
                        }
                      }}
                      onDragLeave={() => setHoveredChamber(null)}
                      onDrop={(e) => {
                        const type = e.dataTransfer.getData("type");
                        if (type === "hundreds") {
                          handleAddHundred();
                          triggerSound("pop");
                        }
                        setHoveredChamber(null);
                      }}
                      className={`bg-canvas p-4 rounded-2xl border shadow-inner flex flex-col justify-between space-y-3 transition-all duration-250 ${
                        hoveredChamber === "hundreds"
                          ? "chamber-snap-hundreds scale-[1.03] ring-4 ring-rose-400/20"
                          : isDraggingTemplate === "hundreds"
                            ? "border-rose-500/50 border-dashed animate-pulse bg-rose-500/2"
                            : "border-rose-500/20"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                          Hundreds Flats (x100)
                        </span>
                        <span className="px-2 py-0.5 rounded-lg bg-rose-500/10 border border-rose-500/25 font-mono text-xs font-bold text-rose-700 dark:text-rose-300">
                          How many: {l13Hundreds}
                        </span>
                      </div>

                      {/* Hundreds Visual Block Area */}
                      <div className="h-44 bg-surface/60 rounded-xl border border-line flex items-center justify-center p-3 relative overflow-hidden group">
                        {l13Hundreds > 0 ? (
                          <div className="flex flex-wrap justify-center items-center gap-2 max-h-full overflow-y-auto w-full custom-scrollbar">
                            {Array.from({ length: l13Hundreds }).map((_, idx) => (
                              <div 
                                key={idx} 
                                draggable
                                onDragStart={(e) => {
                                  e.dataTransfer.setData("remove-type", "hundreds");
                                  setIsDraggingTemplate("block-remove");
                                  triggerSound("pop");
                                }}
                                onTouchStart={() => triggerSound("pop")}
                                onDragEnd={() => {
                                  setIsDraggingTemplate(null);
                                  setHoveredChamber(null);
                                }}
                                className={`block-draggable w-16 h-16 grid grid-cols-10 bg-gradient-to-br from-rose-500 to-rose-700 rounded border border-rose-300/80 shadow-md relative overflow-hidden shrink-0 ${
                                  magneticPullBlock?.type === "hundreds" && magneticPullBlock?.index === idx
                                    ? "block-snap-pull"
                                    : ""
                                }`} 
                                title="Drag back up to take this away"
                        aria-label="Drag back up to take this away"
                              >
                                {Array.from({ length: 100 }).map((_, c) => (
                                  <div key={c} className="aspect-square border-[0.2px] border-rose-800/30 relative">
                                    <div className="absolute inset-[0.2px] bg-rose-400/5 rounded-[0.5px]" />
                                  </div>
                                ))}
                                {/* Overlay glare */}
                                <div className="absolute top-0 left-0 w-full h-[50%] bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center text-slate-600 font-mono text-[10px] uppercase tracking-wide">
                            Drag Flat Here
                          </div>
                        )}
                      </div>

                      {/* Builder Controls */}
                      {(currentLevelNumber === 14 || currentLevelNumber === 15) && (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={handleSubHundred}
                            disabled={l13Hundreds <= 0}
                            className="w-10 h-10 rounded-xl bg-surface hover:bg-surface-muted active:scale-90 text-rose-700 dark:text-rose-400 font-black border border-line hover:border-rose-500/30 flex items-center justify-center transition disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            -100
                          </button>
                          <button
                            onClick={handleAddHundred}
                            disabled={l13Hundreds >= 9}
                            className="w-10 h-10 rounded-xl bg-surface hover:bg-surface-muted active:scale-90 text-rose-700 dark:text-rose-400 font-black border border-line hover:border-rose-500/30 flex items-center justify-center transition disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            +100
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TEN-RODS CHAMBER */}
                  <div 
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (isDraggingTemplate === "tens") {
                        setHoveredChamber("tens");
                      }
                    }}
                    onDragLeave={() => setHoveredChamber(null)}
                    onDrop={(e) => {
                      const type = e.dataTransfer.getData("type");
                      if (type === "tens") {
                        handleAddTen();
                        triggerSound("pop");
                      }
                      setHoveredChamber(null);
                    }}
                    className={`bg-canvas p-4 rounded-2xl border shadow-inner flex flex-col justify-between space-y-3 transition-all duration-250 ${
                      hoveredChamber === "tens"
                        ? "chamber-snap-tens scale-[1.03] ring-4 ring-amber-400/20"
                        : isDraggingTemplate === "tens"
                          ? "border-amber-500/50 border-dashed animate-pulse bg-amber-500/2"
                          : "border-amber-500/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-slate-800 dark:text-amber-300 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                        Tens (x10)
                      </span>
                      <span className="px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/25 font-mono text-xs font-bold text-slate-800 dark:text-amber-300">
                        How many: {l13Tens}
                      </span>
                    </div>

                    {/* Tens Visual Block Area */}
                    <div className="h-44 bg-surface/60 rounded-xl border border-line flex items-center justify-center p-3 relative overflow-hidden group">
                      {l13Tens > 0 ? (
                        <div className="flex flex-wrap justify-center items-center gap-1.5 max-h-full overflow-y-auto w-full custom-scrollbar">
                          {Array.from({ length: l13Tens }).map((_, idx) => (
                            <div 
                              key={idx} 
                              draggable
                              onDragStart={(e) => {
                                e.dataTransfer.setData("remove-type", "tens");
                                setIsDraggingTemplate("block-remove");
                                triggerSound("pop");
                              }}
                              onTouchStart={() => triggerSound("pop")}
                              onDragEnd={() => {
                                setIsDraggingTemplate(null);
                                setHoveredChamber(null);
                              }}
                              className={`block-draggable w-3.5 h-24 flex flex-col bg-gradient-to-b from-amber-400 to-amber-600 rounded border border-amber-300/80 shadow-md relative overflow-hidden shrink-0 ${
                                magneticPullBlock?.type === "tens" && magneticPullBlock?.index === idx
                                  ? "block-snap-pull"
                                  : ""
                              }`} 
                              title="Drag back up to take this away"
                        aria-label="Drag back up to take this away"
                            >
                              {Array.from({ length: 10 }).map((_, s) => (
                                <div key={s} className="flex-1 border-b border-amber-800/30 last:border-b-0 relative">
                                  <div className="absolute inset-[0.2px] bg-amber-300/10 rounded-sm" />
                                </div>
                              ))}
                              {/* Glare reflection */}
                              <div className="absolute top-0 bottom-0 left-0 w-[30%] bg-white/10 pointer-events-none" />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-slate-600 font-mono text-[10px] uppercase tracking-wide">
                          Drag Rod Here
                        </div>
                      )}
                    </div>

                    {/* Builder Controls */}
                    {(currentLevelNumber === 13 || currentLevelNumber === 14 || currentLevelNumber === 15) && (
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={handleSubTen}
                          disabled={l13Tens <= 0}
                          className="w-10 h-10 rounded-xl bg-surface hover:bg-surface-muted active:scale-90 text-slate-800 dark:text-amber-400 font-black border border-line hover:border-amber-500/30 flex items-center justify-center transition disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          -10
                        </button>
                        <button
                          onClick={handleAddTen}
                          disabled={l13Tens >= 19}
                          className="w-10 h-10 rounded-xl bg-surface hover:bg-surface-muted active:scale-90 text-slate-800 dark:text-amber-400 font-black border border-line hover:border-amber-500/30 flex items-center justify-center transition disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          +10
                        </button>
                      </div>
                    )}
                  </div>

                  {/* ONES UNITS CHAMBER */}
                  <div 
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (isDraggingTemplate === "ones") {
                        setHoveredChamber("ones");
                      }
                    }}
                    onDragLeave={() => setHoveredChamber(null)}
                    onDrop={(e) => {
                      const type = e.dataTransfer.getData("type");
                      if (type === "ones") {
                        handleAddOne();
                        triggerSound("pop");
                      }
                      setHoveredChamber(null);
                    }}
                    className={`bg-canvas p-4 rounded-2xl border shadow-inner flex flex-col justify-between space-y-3 transition-all duration-250 ${
                      hoveredChamber === "ones"
                        ? "chamber-snap-ones scale-[1.03] ring-4 ring-cyan-400/20"
                        : isDraggingTemplate === "ones"
                          ? "border-cyan-500/50 border-dashed animate-pulse bg-cyan-500/2"
                          : "border-cyan-500/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-cyan-700 dark:text-cyan-300 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse" />
                        Ones (x1)
                      </span>
                      <span className="px-2 py-0.5 rounded-lg bg-cyan-500/10 border border-cyan-500/25 font-mono text-xs font-bold text-cyan-700 dark:text-cyan-300">
                        How many: {l13Ones}
                      </span>
                    </div>

                    {/* Ones Visual Block Area */}
                    <div className="h-44 bg-surface/60 rounded-xl border border-line flex items-center justify-center p-3 relative overflow-hidden group">
                      {l13Ones > 0 ? (
                        <div className="flex flex-wrap justify-center items-center gap-1.5 max-h-full overflow-y-auto w-full custom-scrollbar">
                          {Array.from({ length: l13Ones }).map((_, idx) => (
                            <div 
                              key={idx} 
                              draggable
                              onDragStart={(e) => {
                                e.dataTransfer.setData("remove-type", "ones");
                                setIsDraggingTemplate("block-remove");
                                triggerSound("pop");
                              }}
                              onTouchStart={() => triggerSound("pop")}
                              onDragEnd={() => {
                                setIsDraggingTemplate(null);
                                setHoveredChamber(null);
                              }}
                              className={`block-draggable w-4 h-4 rounded bg-gradient-to-br from-cyan-400 to-cyan-600 border border-cyan-300 shadow-sm relative shrink-0 ${
                                magneticPullBlock?.type === "ones" && magneticPullBlock?.index === idx
                                  ? "block-snap-pull"
                                  : ""
                              }`} 
                              title="Drag back up to take this away"
                        aria-label="Drag back up to take this away"
                            >
                              <div className="absolute top-0 left-0 right-0 h-[40%] bg-white/20 rounded-t pointer-events-none" />
                              <div className="absolute inset-[1.5px] rounded-[1px] bg-cyan-500/10 border border-cyan-400/20 pointer-events-none" />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-slate-600 font-mono text-[10px] uppercase tracking-wide">
                          Drag Unit Here
                        </div>
                      )}
                    </div>

                    {/* Builder Controls */}
                    {(currentLevelNumber === 13 || currentLevelNumber === 14 || currentLevelNumber === 15) && (
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={handleSubOne}
                          disabled={l13Ones <= 0}
                          className="w-10 h-10 rounded-xl bg-surface hover:bg-surface-muted active:scale-90 text-cyan-700 dark:text-cyan-400 font-black border border-line hover:border-cyan-500/30 flex items-center justify-center transition disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          -1
                        </button>
                        <button
                          onClick={handleAddOne}
                          disabled={l13Ones >= 19}
                          className="w-10 h-10 rounded-xl bg-surface hover:bg-surface-muted active:scale-90 text-cyan-700 dark:text-cyan-400 font-black border border-line hover:border-cyan-500/30 flex items-center justify-center transition disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          +1
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Info Board */}
                <div className="p-3 bg-canvas rounded-2xl border border-line font-mono text-xs text-center text-muted flex flex-wrap items-center justify-center gap-2">
                  <span>🚀 Galaxy Foundry Total:</span>
                  <span className="text-ink font-bold text-sm">
                    {l13Hundreds} Hundreds + {l13Tens} Tens + {l13Ones} Ones =
                  </span>
                  <strong className="text-emerald-700 dark:text-emerald-400 text-base font-black px-2 py-0.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                    {currentTotalBlocks}
                  </strong>
                </div>

                {/* Operations & Validation Console */}
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {(currentLevelNumber === 13 || currentLevelNumber === 15) && (
                    <button
                      onClick={handleFuseOnesToTen}
                      disabled={l13Ones < 10}
                      className={`px-4 py-2.5 rounded-2xl border text-xs font-mono font-bold transition flex items-center gap-1.5 ${
                        l13Ones >= 10
                          ? "bg-amber-400 text-slate-950 border-amber-300 shadow shadow-amber-400/20 active:scale-95 animate-pulse"
                          : "bg-surface text-slate-600 border-line cursor-not-allowed"
                      }`}
                    >
                      ⚡ Make a Ten ➔ 1 Ten
                    </button>
                  )}
                  
                  {(currentLevelNumber === 14 || currentLevelNumber === 15) && (
                    <button
                      onClick={handleFuseTensToHundred}
                      disabled={l13Tens < 10}
                      className={`px-4 py-2.5 rounded-2xl border text-xs font-mono font-bold transition flex items-center gap-1.5 ${
                        l13Tens >= 10
                          ? "bg-rose-400 text-slate-950 border-rose-300 shadow shadow-rose-400/20 active:scale-95 animate-pulse"
                          : "bg-surface text-slate-600 border-line cursor-not-allowed"
                      }`}
                    >
                      🌌 Fuse 10 Tens ➔ 1 Hundred
                    </button>
                  )}

                  <button
                    onClick={handleCheckBase10}
                    className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 font-mono font-black text-xs shadow-md shadow-emerald-400/10 transition active:scale-95 hover:brightness-110"
                  >
                    Check
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ============================================================ */}
      {/* 3. INSTANT BOTTOM ACTION & FEEDBACK DRAWER                   */}
      {/* ============================================================ */}
      {/* Feedback uses the shared kid message, so every skill speaks the same
          way: one icon, one short line, one action. */}
      {quizFeedback && (
        <div className="sticky bottom-0 left-0 right-0 z-30 p-3 sm:p-4 bg-canvas/95 backdrop-blur-sm">
          <UIKidMessage
            tone={quizFeedback.status === "correct" ? "correct" : "tryAgain"}
            title={quizFeedback.title}
            message={quizFeedback.message}
            xpEarned={quizFeedback.xpEarned}
            actionLabel={quizFeedback.status === "correct" ? "Next" : "Try again"}
            onAction={handleNextQuestionOrComplete}
          />
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. LEVEL ROUND MASTERY / CELEBRATION MODAL                   */}
      {/* ============================================================ */}
      {roundCompleteSummary && (
        <PracticeRoundCompleteModal
          levelNumber={roundCompleteSummary.levelNumber}
          levelTitle={roundCompleteSummary.title}
          coinsWon={roundCompleteSummary.coins}
          xpWon={roundCompleteSummary.xp}
          nextLevelNumber={currentLevelNumber < 15 ? currentLevelNumber + 1 : 1}
          onNextLevel={() => {
            const nextLvl = currentLevelNumber < 15 ? currentLevelNumber + 1 : 1;
            jumpToLevel(nextLvl);
          }}
          onPracticeAgain={() => {
            jumpToLevel(currentLevelNumber);
          }}
        />
      )}

      {/* SELECT LEVEL POPOVER MODAL */}
      {showLevelPicker && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-surface border border-line rounded-3xl p-5 max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-line gap-3">
              <div>
                <h3 className="font-mono font-black text-lg text-ink flex items-center gap-2">
                  <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>Select Practice Level</span>
                </h3>
                <p className="text-xs text-muted">Choose any of the 15 Socratic counting progression levels</p>
              </div>
              
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    triggerSound("clink");
                    setTeacherPreviewMode(!teacherPreviewMode);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-[11px] font-bold border transition ${
                    teacherPreviewMode
                      ? "bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border-indigo-400/50 shadow-[0_0_15px_rgba(129,140,248,0.2)]"
                      : "bg-surface-muted text-muted border-line hover:text-slate-200"
                  }`}
                  title="Unlock all levels to inspect and preview their Socratic questions"
              aria-label="Unlock all levels to inspect and preview their Socratic questions"
                >
                  <span>{teacherPreviewMode ? "🔓 Preview Mode: ON" : "🔒 Teacher Preview"}</span>
                </button>
                
                <button
                  onClick={() => setShowLevelPicker(false)}
                  className="p-1.5 rounded-xl bg-surface-muted text-muted hover:text-ink transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2.5 pr-1">
              {FLOWING_LEVELS.map((lvl) => {
                const isCurrent = currentLevelNumber === lvl.levelNumber;
                const isDone = Boolean(completedLevels[lvl.levelNumber]);
                const isUnlocked = lvl.levelNumber <= unlockedLevelMax || teacherPreviewMode;

                return (
                  <button
                    key={lvl.levelNumber}
                    onClick={() => {
                      if (isUnlocked) {
                        triggerSound("pop");
                        jumpToLevel(lvl.levelNumber);
                        setShowLevelPicker(false);
                      }
                    }}
                    disabled={!isUnlocked}
                    className={`p-3 rounded-2xl border text-left transition flex items-center justify-between gap-3 ${
                      isCurrent
                        ? "bg-amber-500/15 border-amber-400 ring-1 ring-amber-400/50"
                        : isDone
                        ? "bg-surface-muted/80 border-line hover:border-emerald-500/50 cursor-pointer"
                        : isUnlocked
                        ? "bg-surface-muted/50 border-line/80 hover:border-slate-500 cursor-pointer"
                        : "bg-canvas/40 border-line/50 opacity-50 cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-surface-muted border border-line/80 flex items-center justify-center shrink-0">
                        <LevelLucideIcon levelNumber={lvl.levelNumber} className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black font-mono text-ink">
                            L{lvl.levelNumber}
                          </span>
                          <span className="text-[10px] text-muted font-mono truncate">
                            {lvl.category}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-200 truncate">{lvl.title}</h4>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                      ) : isCurrent ? (
                        <span className="text-[10px] font-mono font-bold text-slate-800 dark:text-amber-400 bg-amber-400/15 px-2 py-0.5 rounded-full border border-amber-400/30">Active</span>
                      ) : isUnlocked ? (
                        <span className="text-[10px] font-mono text-muted">Play</span>
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-slate-600" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-line flex items-center justify-between">
              <button
                onClick={() => {
                  setShowLevelPicker(false);
                  setViewMode("map");
                }}
                className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-600 dark:text-indigo-300 flex items-center gap-1.5 cursor-pointer"
              >
                <Map className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>View Full Journey Map</span>
              </button>

              <button
                onClick={() => setShowLevelPicker(false)}
                className="px-4 py-1.5 rounded-xl bg-surface-muted hover:bg-slate-700 text-slate-200 text-xs font-bold font-mono cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COUNTING & LEARNING PLUGIN SETTINGS MODAL */}
      {showPluginSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn">
          <div className="bg-surface border-2 border-line rounded-3xl max-w-4xl w-full p-4 sm:p-6 max-h-[92vh] overflow-y-auto custom-scrollbar shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-line sticky top-0 bg-surface/95 z-20 backdrop-blur-md">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center">
                  <Sliders className="w-4 h-4 text-slate-800 dark:text-amber-400" />
                </div>
                <h3 className="text-sm sm:text-base font-black text-ink font-mono">
                  Counting Plugin & Feature Settings
                </h3>
              </div>
              <button
                onClick={() => setShowPluginSettingsModal(false)}
                className="p-1.5 rounded-xl bg-surface-muted text-muted hover:text-ink cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <PluginManagerPage />
          </div>
        </div>
      )}

      {/* GEMINI REAL-TIME LIVE VOICE COACH MODAL */}
      <LiveVoiceCoachModal
        isOpen={showLiveVoiceModal}
        onClose={() => setShowLiveVoiceModal(false)}
        currentLevel={currentLevelNumber}
        currentTopic={activeLevelConfig.title}
        currentQuestionText={currentQuestionText}
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={TOTAL_QUESTIONS_PER_ROUND}
        currentProblemContext={`Student is practicing Level ${currentLevelNumber} (${activeLevelConfig.title}) - Question ${currentQuestionIndex} of ${TOTAL_QUESTIONS_PER_ROUND}. Active Question Prompt: "${currentQuestionText}". Concept: ${activeLevelConfig.skillConcept}. Target Objective: ${activeLevelConfig.targetObjective}. Steps: ${activeLevelConfig.stepByStep.join(" ")}`}
        studentName="Math Explorer"
        onAwardXp={(xp) => addReward(Math.floor(xp / 2), xp, 1)}
        onNextQuestion={handleNextQuestionOrComplete}
      />
    </div>
  );
};
