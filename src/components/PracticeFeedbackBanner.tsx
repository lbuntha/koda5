import React from "react";
import { Check, AlertTriangle, ArrowRight, Mic } from "lucide-react";

interface PracticeFeedbackBannerProps {
  status: "correct" | "incorrect";
  title: string;
  message: string;
  xpEarned?: number;
  onNext: () => void;
  onAskVoice?: () => void;
}

export const PracticeFeedbackBanner: React.FC<PracticeFeedbackBannerProps> = ({
  status,
  title,
  message,
  xpEarned,
  onNext,
  onAskVoice,
}) => {
  const isCorrect = status === "correct";

  return (
    <div
      id="practice-feedback-banner"
      className={`fixed bottom-0 left-0 right-0 p-4 sm:p-5 border-t z-40 shadow-2xl animate-slideUp backdrop-blur-md transition-colors duration-200 ${
        isCorrect
          ? "bg-emerald-950/95 border-emerald-500/50"
          : "bg-rose-950/95 border-rose-500/50"
      }`}
    >
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left: Feedback Info */}
        <div className="flex items-center gap-3 text-left w-full sm:w-auto">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
              isCorrect
                ? "bg-emerald-400 text-slate-950"
                : "bg-rose-500 text-white"
            }`}
          >
            {isCorrect ? (
              <Check className="w-5.5 h-5.5 stroke-[3]" />
            ) : (
              <AlertTriangle className="w-5.5 h-5.5 stroke-[2.5]" />
            )}
          </div>
          <div>
            <h4
              className={`font-black text-sm font-mono uppercase tracking-wide ${
                isCorrect ? "text-emerald-300" : "text-rose-300"
              }`}
            >
              {title} {xpEarned && `(+${xpEarned} XP)`}
            </h4>
            <p className="text-xs text-slate-200 mt-0.5 max-w-xl leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          {!isCorrect && onAskVoice && (
            <button
              onClick={onAskVoice}
              className="px-3.5 py-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-amber-300 hover:text-white transition flex items-center gap-1.5 cursor-pointer"
            >
              <Mic className="w-3.5 h-3.5 text-amber-400" />
              <span>Ask Koda Live</span>
            </button>
          )}

          <button
            onClick={onNext}
            className={`px-6 py-2.5 rounded-2xl font-mono font-black text-xs shadow-xl transition transform hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer ${
              isCorrect
                ? "bg-emerald-400 hover:bg-emerald-300 text-slate-950"
                : "bg-rose-500 hover:bg-rose-400 text-white"
            }`}
          >
            <span>{isCorrect ? "CONTINUE" : "TRY AGAIN"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
