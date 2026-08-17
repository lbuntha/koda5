import React from "react";
import { Volume2, Lightbulb } from "lucide-react";

interface PracticeStepHeaderProps {
  stepNumber: number;
  totalSteps: number;
  title: string;
  showTip: boolean;
  onToggleTip: () => void;
  onReadAloud: () => void;
  levelNumber?: number;
}

export const PracticeStepHeader: React.FC<PracticeStepHeaderProps> = ({
  stepNumber,
  totalSteps,
  title,
  showTip,
  onToggleTip,
  onReadAloud,
  levelNumber,
}) => {
  // Determine an inviting contextual tag instead of a dry "CHALLENGE"
  const getContextTag = () => {
    if (stepNumber === totalSteps) return "Final Milestone 🏆";
    if (stepNumber === 1) return "Warm-up Exercise 🌱";
    if (stepNumber % 2 === 0) return "Interactive Activity 🚀";
    return "Guided Challenge 🌟";
  };

  return (
    <div
      id="practice-step-header"
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-muted/60 rounded-2xl p-4 sm:p-5 border border-line/40"
    >
      <div className="space-y-1.5 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-mono font-black text-slate-800 dark:text-amber-400 uppercase tracking-wider bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
            Step {stepNumber} of {totalSteps}
          </span>
          <span className="text-[10px] font-mono font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
            {getContextTag()}
          </span>
        </div>
        <h2 className="text-sm sm:text-base md:text-lg font-bold text-ink leading-relaxed font-sans">
          {title}
        </h2>
      </div>

      {/* Socratic Assistant Controls */}
      <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
        <button
          onClick={onReadAloud}
          className="p-2.5 rounded-xl bg-surface hover:bg-surface text-slate-800 dark:text-amber-400 hover:text-amber-300 transition border border-line active:scale-95 cursor-pointer"
          title="Read question aloud"
        >
          <Volume2 className="w-4 h-4" />
        </button>

        <button
          onClick={onToggleTip}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-50 dark:bg-indigo-900/40 border border-indigo-500/20 text-xs font-mono font-bold text-indigo-700 dark:text-indigo-300 transition active:scale-95 cursor-pointer"
        >
          <Lightbulb className="w-3.5 h-3.5 text-slate-800 dark:text-amber-400" />
          <span>{showTip ? "Hide Hint" : "Hint"}</span>
        </button>
      </div>
    </div>
  );
};
