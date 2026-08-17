import React, { useState } from "react";
import {
  Sparkles,
  CircleDot,
  RefreshCw,
  Zap,
  Eye,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  Flame,
} from "lucide-react";
import { playSound } from "../../../../utils/audio";
import { triggerHaptic, triggerTapPopHaptic } from "../../../../utils/haptics";

export const CountingSkillsLab: React.FC = () => {
  const [activeMode, setActiveMode] = useState<"touch" | "subitizing" | "tenframe" | "skip">("touch");

  // Mode 1: 1-to-1 Touch Counting
  const [touchItemsCount, setTouchItemsCount] = useState<number>(7);
  const [tappedIndices, setTappedIndices] = useState<number[]>([]);
  const [recentlyPoppedIndex, setRecentlyPoppedIndex] = useState<number | null>(null);
  const [objectEmoji, setObjectEmoji] = useState<"⭐" | "🚀" | "🍎" | "🐱">("⭐");

  // Mode 2: Instant Subitizing Flash
  const [subitizingCount, setSubitizingCount] = useState<number>(4);
  const [subitizingPattern, setSubitizingPattern] = useState<"dice" | "scatter" | "circle">("dice");
  const [flashHidden, setFlashHidden] = useState<boolean>(false);
  const [userGuess, setUserGuess] = useState<number | null>(null);

  // Mode 3: Ten Frame Interactive Fill
  const [tenFrameFilled, setTenFrameFilled] = useState<boolean[]>(
    Array(10)
      .fill(false)
      .map((_, i) => i < 6)
  );

  // Mode 4: Skip Counting
  const [skipStep, setSkipStep] = useState<2 | 5 | 10>(2);
  const [revealedSkip, setRevealedSkip] = useState<number>(3); // How many steps revealed

  // Handlers
  const handleTapItem = (index: number) => {
    playSound("pop");
    triggerTapPopHaptic();
    setRecentlyPoppedIndex(index);
    setTimeout(() => {
      setRecentlyPoppedIndex((cur) => (cur === index ? null : cur));
    }, 450);

    if (!tappedIndices.includes(index)) {
      const next = [...tappedIndices, index];
      setTappedIndices(next);
      if (next.length === touchItemsCount) {
        playSound("success");
        triggerHaptic("success");
      }
    }
  };

  const handleResetTouch = (count: number) => {
    playSound("pop");
    triggerTapPopHaptic();
    setTouchItemsCount(count);
    setTappedIndices([]);
  };

  const handleFlashPattern = (count: number) => {
    playSound("pop");
    triggerTapPopHaptic();
    setSubitizingCount(count);
    setUserGuess(null);
    setFlashHidden(false);
    // Flash pattern for 1.2 seconds then hide
    setTimeout(() => {
      setFlashHidden(true);
    }, 1400);
  };

  const handleToggleTenFrame = (index: number) => {
    playSound("pop");
    triggerTapPopHaptic();
    setTenFrameFilled((prev) => {
      const copy = [...prev];
      copy[index] = !copy[index];
      return copy;
    });
  };

  const tenFrameCount = tenFrameFilled.filter(Boolean).length;

  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto space-y-6">
      {/* Mode Switcher Tabs */}
      <div className="flex flex-wrap items-center justify-between bg-[#0a0a0a] border border-white/10 rounded-2xl p-2 font-mono gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              playSound("pop");
              setActiveMode("touch");
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeMode === "touch"
                ? "bg-emerald-400 text-black shadow-[0_0_15px_rgba(52,211,153,0.4)]"
                : "text-gray-400 hover:text-white bg-white/5"
            }`}
          >
            <CircleDot className="w-4 h-4" />
            1. Touch & Tag Counting (1-to-1)
          </button>

          <button
            onClick={() => {
              playSound("pop");
              setActiveMode("subitizing");
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeMode === "subitizing"
                ? "bg-cyan-400 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                : "text-gray-400 hover:text-white bg-white/5"
            }`}
          >
            <Eye className="w-4 h-4" />
            2. Flash Subitizing (Instant Perception)
          </button>

          <button
            onClick={() => {
              playSound("pop");
              setActiveMode("tenframe");
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeMode === "tenframe"
                ? "bg-purple-400 text-black shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                : "text-gray-400 hover:text-white bg-white/5"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            3. Ten-Frame Anchor Studio
          </button>

          <button
            onClick={() => {
              playSound("pop");
              setActiveMode("skip");
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeMode === "skip"
                ? "bg-amber-400 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                : "text-gray-400 hover:text-white bg-white/5"
            }`}
          >
            <Zap className="w-4 h-4" />
            4. Skip Counting Stepper
          </button>
        </div>

        <span className="text-[11px] text-gray-400 px-3 py-1 bg-white/5 rounded-lg border border-white/5">
          Stage 1: Counting Mastery
        </span>
      </div>

      {/* MODE 1: TOUCH & TAG COUNTING */}
      {activeMode === "touch" && (
        <div className="p-6 bg-[#0a0a0a] rounded-3xl border border-white/10 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CircleDot className="w-5 h-5 text-emerald-400" />
                1-to-1 Touch & Number Tagging Lab
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Practice cardinal counting! Tap each item one by one to attach a counted number tag.
              </p>
            </div>

            {/* Emoji Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-gray-400">Object:</span>
              {(["⭐", "🚀", "🍎", "🐱"] as const).map((sym) => (
                <button
                  key={sym}
                  onClick={() => {
                    playSound("pop");
                    setObjectEmoji(sym);
                  }}
                  className={`w-8 h-8 rounded-lg text-base flex items-center justify-center border transition ${
                    objectEmoji === sym ? "bg-emerald-500/20 border-emerald-400" : "bg-white/5 border-white/10"
                  }`}
                >
                  {sym}
                </button>
              ))}
            </div>
          </div>

          {/* Amount Presets */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-gray-400">Set Quantity:</span>
            {[3, 5, 7, 9, 12, 15].map((cnt) => (
              <button
                key={cnt}
                onClick={() => handleResetTouch(cnt)}
                className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold border transition ${
                  touchItemsCount === cnt
                    ? "bg-emerald-400 text-black border-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.4)]"
                    : "bg-white/5 text-gray-300 border-white/10 hover:bg-white/10"
                }`}
              >
                {cnt} Items
              </button>
            ))}

            <button
              onClick={() => handleResetTouch(touchItemsCount)}
              className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl border border-white/10 transition ml-auto flex items-center gap-1.5 text-xs font-mono"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset Count
            </button>
          </div>

          {/* Interactive Touch Arena */}
          <div className="p-8 bg-gradient-to-b from-black/80 to-emerald-950/20 rounded-2xl border border-emerald-500/30 flex flex-wrap items-center justify-center gap-5 min-h-[220px]">
            {Array.from({ length: touchItemsCount }).map((_, idx) => {
              const isTapped = tappedIndices.includes(idx);
              const isRecentlyPopped = recentlyPoppedIndex === idx;
              const tagNumber = isTapped ? tappedIndices.indexOf(idx) + 1 : null;

              return (
                <button
                  key={idx}
                  onClick={() => handleTapItem(idx)}
                  className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center transition-all transform cursor-pointer ${
                    isRecentlyPopped
                      ? "tap-pop-anim bg-emerald-500/30 border-2 border-emerald-300 scale-125 shadow-[0_0_25px_rgba(52,211,153,0.6)] z-20"
                      : isTapped
                      ? "bg-emerald-500/20 border-2 border-emerald-400 scale-105 shadow-[0_0_20px_rgba(52,211,153,0.35)]"
                      : "bg-white/5 hover:bg-white/10 border border-white/20 hover:scale-105"
                  }`}
                >
                  <span className="text-3xl">{objectEmoji}</span>
                  {tagNumber ? (
                    <span className="text-xs font-mono font-black text-emerald-300 bg-emerald-950/90 px-2 py-0.5 rounded-md mt-1 border border-emerald-500/40 animate-scaleUp">
                      #{tagNumber}
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-gray-500 mt-1">Tap me</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Progress Tracker and Cardinality Notice */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-white/5 rounded-2xl border border-white/10 font-mono text-xs">
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Tagged Count:</span>
              <span className="text-base font-black text-emerald-400">
                {tappedIndices.length} / {touchItemsCount}
              </span>
            </div>

            {tappedIndices.length === touchItemsCount ? (
              <div className="text-emerald-300 font-bold flex items-center gap-1.5 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Cardinal Principle: The last number named ({touchItemsCount}) tells the total count!
              </div>
            ) : (
              <div className="text-gray-400">
                Keep tapping until every item has a number tag!
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODE 2: INSTANT SUBITIZING FLASH */}
      {activeMode === "subitizing" && (
        <div className="p-6 bg-[#0a0a0a] rounded-3xl border border-white/10 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Eye className="w-5 h-5 text-cyan-400" />
                Flash Subitizing (Recognize Without Counting)
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Train your brain to recognize patterns of 1 to 6 dots instantly like dice!
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleFlashPattern(Math.floor(Math.random() * 6) + 1)}
                className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-black font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-[0_0_15px_rgba(6,182,212,0.3)]"
              >
                Flash Random Pattern ⚡
              </button>
            </div>
          </div>

          {/* Flash Box Container */}
          <div className="p-8 bg-gradient-to-b from-black/80 to-cyan-950/20 rounded-2xl border border-cyan-500/30 min-h-[220px] flex items-center justify-center relative">
            {!flashHidden ? (
              <div className="grid grid-cols-3 gap-3 p-6 bg-black/70 border border-cyan-400/40 rounded-2xl shadow-[0_0_30px_rgba(6,182,212,0.2)]">
                {Array.from({ length: subitizingCount }).map((_, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.8)] animate-scaleUp"
                  />
                ))}
              </div>
            ) : (
              <div className="text-center space-y-3">
                <span className="text-3xl">❓</span>
                <p className="text-sm font-mono text-cyan-300 font-bold">
                  How many dots did you see in the flash?
                </p>
              </div>
            )}
          </div>

          {/* User Guess Buttons */}
          <div className="space-y-2">
            <span className="text-xs font-mono text-gray-400 block text-center">
              Tap your guess instantly:
            </span>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => {
                const isSelected = userGuess === num;
                const isCorrect = userGuess !== null && num === subitizingCount;

                return (
                  <button
                    key={num}
                    onClick={() => {
                      playSound("pop");
                      setUserGuess(num);
                      setFlashHidden(false);
                      if (num === subitizingCount) {
                        playSound("success");
                      }
                    }}
                    className={`w-12 h-12 rounded-2xl font-mono text-base font-black border transition ${
                      isSelected && isCorrect
                        ? "bg-emerald-400 text-black border-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.6)]"
                        : isSelected && !isCorrect
                        ? "bg-rose-500 text-white border-rose-400"
                        : "bg-white/5 text-white border-white/10 hover:bg-white/10"
                    }`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODE 3: TEN-FRAME ANCHOR */}
      {activeMode === "tenframe" && (
        <div className="p-6 bg-[#0a0a0a] rounded-3xl border border-white/10 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                Ten-Frame Benchmark Studio
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                A 10-frame organizes numbers relative to 5 and 10. Tap any cell to fill or clear!
              </p>
            </div>

            <button
              onClick={() => setTenFrameFilled(Array(10).fill(false))}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl text-xs font-mono transition border border-white/10 flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Clear Frame
            </button>
          </div>

          {/* 2x5 Ten-Frame Grid */}
          <div className="p-6 bg-gradient-to-b from-black to-purple-950/20 rounded-2xl border border-purple-500/30 flex flex-col items-center justify-center space-y-3">
            <div className="grid grid-cols-5 gap-3 bg-black/80 p-4 rounded-2xl border border-purple-500/40 shadow-[0_0_25px_rgba(168,85,247,0.2)]">
              {tenFrameFilled.map((filled, idx) => (
                <button
                  key={idx}
                  onClick={() => handleToggleTenFrame(idx)}
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border flex items-center justify-center transition-all ${
                    filled
                      ? "bg-purple-500 border-purple-300 text-black shadow-[0_0_15px_rgba(168,85,247,0.5)] scale-95"
                      : "bg-white/5 hover:bg-white/10 border-white/15"
                  }`}
                >
                  {filled && <div className="w-8 h-8 rounded-full bg-white shadow" />}
                </button>
              ))}
            </div>

            {/* Quick Mental Breakdown */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-3 text-xs font-mono">
              <div className="p-2 bg-purple-950/40 rounded-xl border border-purple-500/30 text-purple-300">
                Filled: <strong>{tenFrameCount}</strong>
              </div>
              <div className="p-2 bg-gray-900 rounded-xl border border-gray-800 text-gray-300">
                Empty (Need to make 10): <strong>{10 - tenFrameCount}</strong>
              </div>
              <div className="p-2 bg-cyan-950/40 rounded-xl border border-cyan-500/30 text-cyan-300">
                Anchor Equation: {tenFrameCount} + {10 - tenFrameCount} = 10
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 4: SKIP COUNTING STEPPER */}
      {activeMode === "skip" && (
        <div className="p-6 bg-[#0a0a0a] rounded-3xl border border-white/10 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                Skip Counting Rhythm Stepper
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Skip counting builds the direct mental foundation for multiplication!
              </p>
            </div>

            <div className="flex items-center gap-2">
              {([2, 5, 10] as const).map((step) => (
                <button
                  key={step}
                  onClick={() => {
                    playSound("pop");
                    setSkipStep(step);
                    setRevealedSkip(2);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold border transition ${
                    skipStep === step
                      ? "bg-amber-400 text-black border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.4)]"
                      : "bg-white/5 text-gray-300 border-white/10 hover:bg-white/10"
                  }`}
                >
                  Count by {step}s
                </button>
              ))}
            </div>
          </div>

          {/* Stepper Track */}
          <div className="p-6 bg-gradient-to-b from-black to-amber-950/20 rounded-2xl border border-amber-500/30 space-y-6">
            <div className="flex flex-wrap items-center justify-center gap-3">
              {Array.from({ length: 8 }).map((_, idx) => {
                const value = (idx + 1) * skipStep;
                const isRevealed = idx < revealedSkip;

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      if (!isRevealed) {
                        playSound("pop");
                        setRevealedSkip(idx + 1);
                      }
                    }}
                    className={`w-16 h-16 rounded-2xl font-mono flex flex-col items-center justify-center border transition-all ${
                      isRevealed
                        ? "bg-amber-400/20 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)] scale-105"
                        : "bg-white/5 border-white/10 text-gray-600 hover:border-amber-500/40"
                    }`}
                  >
                    <span className="text-lg font-black">{isRevealed ? value : "?"}</span>
                    <span className="text-[10px] text-gray-400">Step {idx + 1}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/10 font-mono text-xs">
              <span className="text-gray-400">
                Pattern: +{skipStep} every jump
              </span>

              {revealedSkip < 8 && (
                <button
                  onClick={() => {
                    playSound("pop");
                    setRevealedSkip((s) => Math.min(8, s + 1));
                  }}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black font-bold rounded-xl transition flex items-center gap-1.5"
                >
                  Reveal Next Step (+{skipStep}) <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
