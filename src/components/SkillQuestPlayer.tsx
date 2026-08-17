import React, { useState } from "react";
import {
  Sparkles,
  Star,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  Trophy,
  Award,
  Zap,
  Lightbulb,
  Bot,
} from "lucide-react";
import { SkillQuestStage } from "../data/skillTreeRoadmap";
import { playSound } from "../utils/audio";

interface SkillQuestPlayerProps {
  stage: SkillQuestStage;
  currentStars: number;
  onCompleteQuest: (stageId: string, starsEarned: number, xpEarned: number) => void;
  onOpenSandbox: () => void;
  onBackToMap: () => void;
  onAskSoraHint?: (hintText: string) => void;
}

export const SkillQuestPlayer: React.FC<SkillQuestPlayerProps> = ({
  stage,
  currentStars,
  onCompleteQuest,
  onOpenSandbox,
  onBackToMap,
  onAskSoraHint,
}) => {
  const [currentLevelIdx, setCurrentLevelIdx] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [userStars, setUserStars] = useState<number>(0);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [isQuestFinished, setIsQuestFinished] = useState<boolean>(false);

  const level = stage.questLevels[currentLevelIdx];
  const totalLevels = stage.questLevels.length;

  const handleSelectOption = (opt: string) => {
    if (isAnswered) return;
    playSound("pop");
    setSelectedOption(opt);
  };

  const handleCheckAnswer = () => {
    if (!selectedOption || isAnswered) return;

    const correct = selectedOption === level.targetAnswer;
    setIsAnswered(true);
    setIsCorrect(correct);

    if (correct) {
      playSound("success");
      setUserStars((prev) => prev + 1);
    } else {
      playSound("pop");
    }
  };

  const handleNextTask = () => {
    playSound("pop");
    setShowHint(false);

    if (currentLevelIdx < totalLevels - 1) {
      setCurrentLevelIdx((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setIsCorrect(false);
    } else {
      // Finished all tasks
      setIsQuestFinished(true);
      playSound("levelup");
      const earnedXp = (userStars + (isCorrect ? 1 : 0)) * 25 + 20;
      const finalStars = Math.max(currentStars, userStars + (isCorrect ? 1 : 0));
      onCompleteQuest(stage.id, finalStars, earnedXp);
    }
  };

  const handleRestart = () => {
    playSound("pop");
    setCurrentLevelIdx(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setIsCorrect(false);
    setUserStars(0);
    setShowHint(false);
    setIsQuestFinished(false);
  };

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto space-y-6">
      {/* Header with Navigation and Stage Info */}
      <div className="flex items-center justify-between bg-[#0a0a0a] border border-white/10 rounded-2xl p-4 font-mono">
        <button
          onClick={() => {
            playSound("pop");
            onBackToMap();
          }}
          className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
        >
          ← World Map
        </button>

        <div className="text-center">
          <span className="text-[10px] text-gray-400 uppercase tracking-widest block">
            Stage {stage.stageNumber} Quest
          </span>
          <span className="text-xs font-bold text-white">{stage.skillTitle}</span>
        </div>

        <button
          onClick={() => {
            playSound("pop");
            onOpenSandbox();
          }}
          className="px-3 py-1.5 bg-cyan-400/20 hover:bg-cyan-400/30 text-cyan-300 border border-cyan-400/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Manipulatives Studio
        </button>
      </div>

      {!isQuestFinished ? (
        /* Active Task Card */
        <div className={`p-6 sm:p-8 bg-[#0a0a0a] rounded-3xl border ${stage.colorTheme.border} ${stage.colorTheme.glow} shadow-2xl space-y-6`}>
          {/* Level Progress Indicator */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2 font-mono text-xs text-gray-400">
              <span className={`px-2.5 py-1 rounded-lg ${stage.colorTheme.badgeBg} font-bold`}>
                Task {currentLevelIdx + 1} of {totalLevels}
              </span>
              <span>•</span>
              <span className="text-white font-bold">{level.title}</span>
            </div>

            {/* Stars Collector Tracker */}
            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalLevels }).map((_, idx) => {
                const earned = idx < userStars;
                return (
                  <Star
                    key={idx}
                    className={`w-5 h-5 ${
                      earned
                        ? "text-amber-400 fill-current drop-shadow-[0_0_8px_rgba(251,191,36,0.6)] animate-scaleUp"
                        : "text-gray-700"
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* Prompt & Story Box */}
          <div className="space-y-3">
            <h3 className="text-base sm:text-lg font-bold text-white leading-relaxed">
              {level.instruction}
            </h3>

            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 font-mono text-sm text-cyan-200">
              {level.prompt}
            </div>
          </div>

          {/* Socratic Hint Drawer */}
          {showHint && (
            <div className="p-4 bg-purple-950/30 rounded-2xl border border-purple-500/40 space-y-1.5 animate-fadeIn">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-purple-300">
                <Bot className="w-4 h-4 text-purple-400" />
                <span>Koda's Guiding Socratic Clue:</span>
              </div>
              <p className="text-xs text-gray-200 leading-relaxed font-sans">{level.hint}</p>
            </div>
          )}

          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {level.options?.map((opt) => {
              const isSelected = selectedOption === opt;
              const showCorrect = isAnswered && opt === level.targetAnswer;
              const showWrong = isAnswered && isSelected && !isCorrect;

              return (
                <button
                  key={opt}
                  onClick={() => handleSelectOption(opt)}
                  disabled={isAnswered}
                  className={`p-4 rounded-2xl border text-sm font-mono font-bold transition-all text-left flex items-center justify-between ${
                    showCorrect
                      ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                      : showWrong
                      ? "bg-rose-500/20 border-rose-400 text-rose-300"
                      : isSelected
                      ? "bg-white/15 border-white/40 text-white scale-[1.02]"
                      : "bg-white/5 hover:bg-white/10 border-white/10 text-gray-300 hover:text-white"
                  }`}
                >
                  <span>{opt}</span>
                  {showCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                  {showWrong && <XCircle className="w-5 h-5 text-rose-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Bottom Action Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/10">
            <button
              onClick={() => {
                playSound("pop");
                setShowHint(!showHint);
                if (onAskSoraHint && !showHint) {
                  onAskSoraHint(level.hint);
                }
              }}
              className="px-3.5 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5"
            >
              <Lightbulb className="w-4 h-4 text-purple-400" />
              {showHint ? "Hide Socratic Hint" : "Ask Koda for Hint"}
            </button>

            {!isAnswered ? (
              <button
                onClick={handleCheckAnswer}
                disabled={!selectedOption}
                className={`px-6 py-3 rounded-xl font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-md ${
                  selectedOption
                    ? "bg-emerald-400 hover:bg-emerald-300 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                    : "bg-white/10 text-gray-500 cursor-not-allowed"
                }`}
              >
                Verify Answer ✓
              </button>
            ) : (
              <button
                onClick={handleNextTask}
                className="px-6 py-3 bg-cyan-400 hover:bg-cyan-300 text-black font-mono font-black text-xs uppercase tracking-wider rounded-xl transition shadow-[0_0_15px_rgba(6,182,212,0.4)] flex items-center gap-2"
              >
                <span>{currentLevelIdx < totalLevels - 1 ? "Next Task →" : "Claim Victory Rewards 🏆"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Victory Screen */
        <div className="p-8 bg-[#0a0a0a] rounded-3xl border border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.2)] text-center space-y-6 animate-scaleUp">
          <div className="w-20 h-20 mx-auto rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)]">
            <Trophy className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              Stage Quest Complete!
            </h3>
            <p className="text-sm text-gray-300 max-w-md mx-auto">
              You conquered all tasks in <strong>{stage.skillTitle}</strong>! Your intuitive mental model is growing stronger.
            </p>
          </div>

          {/* Stars Earned */}
          <div className="flex items-center justify-center gap-3 py-2">
            {[1, 2, 3].map((starIdx) => (
              <Star
                key={starIdx}
                className={`w-10 h-10 ${
                  starIdx <= userStars
                    ? "text-amber-400 fill-current drop-shadow-[0_0_12px_rgba(251,191,36,0.8)] animate-bounce"
                    : "text-gray-700"
                }`}
              />
            ))}
          </div>

          {/* XP & Rewards */}
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 max-w-sm mx-auto flex items-center justify-around font-mono">
            <div>
              <span className="text-[10px] text-gray-400 uppercase block">XP Earned</span>
              <span className="text-lg font-bold text-amber-300">+{userStars * 25 + 20} XP</span>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div>
              <span className="text-[10px] text-gray-400 uppercase block">Stars Added</span>
              <span className="text-lg font-bold text-amber-300">+{userStars} ⭐</span>
            </div>
          </div>

          {/* Navigation Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              onClick={() => {
                playSound("pop");
                onBackToMap();
              }}
              className="w-full sm:w-auto px-6 py-3 bg-cyan-400 hover:bg-cyan-300 text-black font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition shadow"
            >
              Continue on World Map →
            </button>

            <button
              onClick={handleRestart}
              className="w-full sm:w-auto px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-mono text-xs rounded-xl border border-white/10 transition flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Replay Quest
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
