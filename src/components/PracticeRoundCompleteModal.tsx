import React, { useEffect } from "react";
import { Star, RotateCcw, ArrowRight, Trophy } from "lucide-react";
import { playSound } from "../utils/audio";

interface PracticeRoundCompleteModalProps {
  levelNumber: number;
  levelTitle: string;
  coinsWon: number;
  xpWon: number;
  nextLevelNumber: number;
  onNextLevel: () => void;
  onPracticeAgain: () => void;
}

export const PracticeRoundCompleteModal: React.FC<PracticeRoundCompleteModalProps> = ({
  levelNumber,
  levelTitle,
  coinsWon,
  xpWon,
  nextLevelNumber,
  onNextLevel,
  onPracticeAgain,
}) => {
  // Play dynamic complete/cheer audio when this modal renders
  useEffect(() => {
    try {
      playSound("levelup");
    } catch (e) {
      console.warn("Audio feedback error:", e);
    }
  }, []);

  return (
    <div
      id="practice-round-complete-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
    >
      <div
        id="practice-round-complete-container"
        className="relative bg-slate-900 border-2 border-amber-500/30 rounded-[32px] max-w-md w-full p-8 text-center shadow-2xl space-y-6 overflow-hidden md:max-w-lg"
      >
        {/* Soft background ambient glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/10 rounded-full filter blur-3xl pointer-events-none" />

        {/* 1. Golden Trophy Badge with Soft Glow */}
        <div className="relative mx-auto flex items-center justify-center w-24 h-24">
          {/* Pulsing Outer Glow Ring */}
          <div className="absolute inset-0 rounded-full bg-amber-500/20 animate-pulse scale-110 filter blur-md" />
          
          {/* Main Gold Trophy Circle Backdrop */}
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-b from-amber-400 to-orange-500 flex items-center justify-center shadow-[0_8px_30px_rgba(245,158,11,0.5)] border-2 border-amber-300">
            <Trophy className="w-10 h-10 text-slate-950 stroke-[2.5]" />
          </div>
        </div>

        {/* 2. Headline Information */}
        <div className="space-y-1">
          <span className="text-[11px] font-mono font-black text-amber-400 uppercase tracking-widest block">
            Round Complete
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Level {levelNumber} Mastered!
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-medium">
            {levelTitle}
          </p>
        </div>

        {/* 3. The 3 Glowing Golden Stars */}
        <div className="flex items-center justify-center gap-3 py-1">
          <Star className="w-8 h-8 text-amber-400 fill-amber-400 filter drop-shadow-[0_0_8px_rgba(245,158,11,0.6)] animate-bounce delay-75" />
          <Star className="w-10 h-10 text-amber-400 fill-amber-400 filter drop-shadow-[0_0_12px_rgba(245,158,11,0.8)] animate-bounce" />
          <Star className="w-8 h-8 text-amber-400 fill-amber-400 filter drop-shadow-[0_0_8px_rgba(245,158,11,0.6)] animate-bounce delay-150" />
        </div>

        {/* 4. Rewards Capsule Box */}
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-full px-6 py-3.5 flex items-center justify-between gap-4 max-w-xs mx-auto text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="text-amber-400 font-black">+{coinsWon}</span>
            <span className="text-slate-200">🪙</span>
            <span className="text-amber-400 font-bold uppercase tracking-wider">Coins</span>
          </div>
          <div className="w-[1px] h-4 bg-slate-800" />
          <div className="flex items-center gap-1.5">
            <span className="text-cyan-400 font-black">+{xpWon}</span>
            <span className="text-slate-200">⚡</span>
            <span className="text-cyan-400 font-bold uppercase tracking-wider">XP</span>
          </div>
        </div>

        {/* 5. Primary Next Level Action Button */}
        <div className="space-y-3 pt-2">
          <button
            onClick={onNextLevel}
            className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-mono font-black text-sm tracking-wide shadow-lg hover:shadow-orange-500/20 active:scale-[0.98] transition-all transform flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>NEXT LEVEL ({nextLevelNumber})</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>

          {/* Secondary Option: Practice Again */}
          <button
            onClick={onPracticeAgain}
            className="w-full py-3 rounded-full bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white font-mono font-bold text-xs transition-all active:scale-[0.97] flex items-center justify-center gap-1.5 border border-slate-700/50 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Practice Again</span>
          </button>
        </div>
      </div>
    </div>
  );
};
