import React from "react";
import { Volume2, Lightbulb } from "lucide-react";

/**
 * The four rungs of the step ladder, named rather than positional so a skill can
 * reword one without knowing which step index it lands on.
 */
export interface StepTagLabels {
  warmup: string;
  activity: string;
  guided: string;
  milestone: string;
}

export const DEFAULT_STEP_TAGS: StepTagLabels = {
  warmup: "Warm-up Exercise 🌱",
  activity: "Interactive Activity 🚀",
  guided: "Guided Challenge 🌟",
  milestone: "Final Milestone 🏆",
};

interface PracticeStepHeaderProps {
  stepNumber: number;
  totalSteps: number;
  title: string;
  showTip: boolean;
  onToggleTip: () => void;
  onReadAloud: () => void;
  levelNumber?: number;
  /**
   * The chip beside "Step n of m", owned by the skill rather than by this
   * header. Left undefined, the default ladder below applies; passed `null`,
   * the chip is dropped entirely — a skill (or a teacher, via a skill toggle)
   * can decide the framing is noise for its learners.
   */
  contextTag?: React.ReactNode | null;
  /**
   * Same ladder, the skill's own words. Partial on purpose: a skill that only
   * cares about the warm-up wording overrides that rung and inherits the rest.
   * Ignored when `contextTag` is given, which is the blunter instrument.
   */
  tagLabels?: Partial<StepTagLabels>;
}

export const PracticeStepHeader: React.FC<PracticeStepHeaderProps> = ({
  stepNumber,
  totalSteps,
  title,
  showTip,
  onToggleTip,
  onReadAloud,
  levelNumber,
  contextTag,
  tagLabels,
}) => {
  // Determine an inviting contextual tag instead of a dry "CHALLENGE"
  const getContextTag = () => {
    const t = { ...DEFAULT_STEP_TAGS, ...tagLabels };
    if (stepNumber === totalSteps) return t.milestone;
    if (stepNumber === 1) return t.warmup;
    if (stepNumber % 2 === 0) return t.activity;
    return t.guided;
  };

  // `undefined` means "no opinion, use the default"; `null` means "no chip".
  const tag = contextTag === undefined ? getContextTag() : contextTag;

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
          {tag && (
            <span className="text-[10px] font-mono font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
              {tag}
            </span>
          )}
        </div>
        <h2 className="text-sm sm:text-base md:text-lg font-bold text-ink leading-relaxed font-sans">
          {title}
        </h2>
      </div>

      {/* Socratic Assistant Controls */}
      <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
        <button
          onClick={onReadAloud}
          className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-surface hover:bg-surface text-slate-800 dark:text-amber-400 hover:text-amber-300 transition border border-line active:scale-95 cursor-pointer"
          title="Read question aloud"
            aria-label="Read question aloud"
        >
          <Volume2 className="w-4 h-4" />
        </button>

        <button
          onClick={onToggleTip}
          className="flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-50 dark:bg-indigo-900/40 border border-indigo-500/20 text-xs font-mono font-bold text-indigo-700 dark:text-indigo-300 transition active:scale-95 cursor-pointer"
        >
          <Lightbulb className="w-3.5 h-3.5 text-slate-800 dark:text-amber-400" />
          <span>{showTip ? "Hide Hint" : "Hint"}</span>
        </button>
      </div>
    </div>
  );
};
