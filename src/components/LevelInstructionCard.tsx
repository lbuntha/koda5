import React, { useState } from "react";
import {
  Volume2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Target,
  ListOrdered,
  Lightbulb,
} from "lucide-react";
import { FlowingLevelConfig, PredefinedAsset } from "../plugins/counting/internal/data/countingAssets";
import { speakWebSpeech, playSound } from "../utils/audio";

interface LevelInstructionCardProps {
  levelConfig: FlowingLevelConfig;
  activeAsset?: PredefinedAsset | null;
  onRandomizeExercise: () => void;
  soundEnabled?: boolean;
}

export const LevelInstructionCard: React.FC<LevelInstructionCardProps> = ({
  levelConfig,
  onRandomizeExercise,
  soundEnabled = true,
}) => {
  const [showTip, setShowTip] = useState<boolean>(false);
  const [isReading, setIsReading] = useState<boolean>(false);

  const handleSpeakInstructions = () => {
    if (!soundEnabled) return;
    setIsReading(true);
    playSound("pop");
    const fullText = `Level ${levelConfig.levelNumber}: ${levelConfig.title}. Goal: ${levelConfig.targetObjective}. Steps: ${levelConfig.stepByStep.join(". ")}. ${levelConfig.pedagogyTip}`;
    speakWebSpeech(fullText);
    setTimeout(() => setIsReading(false), 5000);
  };

  const handleRandomizeClick = () => {
    playSound("pop");
    onRandomizeExercise();
  };

  const getDifficultyBadge = () => {
    switch (levelConfig.difficulty) {
      case "Easy":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
      case "Medium":
        return "bg-cyan-500/20 text-cyan-300 border-cyan-500/40";
      case "Challenging":
        return "bg-purple-500/20 text-purple-300 border-purple-500/40";
      case "Advanced":
        return "bg-amber-500/20 text-amber-300 border-amber-500/40";
      case "Master":
        return "bg-rose-500/20 text-rose-300 border-rose-500/40";
      default:
        return "bg-white/10 text-white border-white/20";
    }
  };

  return (
    <div className="w-full bg-gradient-to-r from-black/85 via-[#0c1522]/90 to-black/85 border border-white/15 rounded-2xl p-3.5 shadow-xl space-y-2.5">
      {/* Top Header: Level Number + Title + Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-white/10">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-base">{levelConfig.icon}</span>
            <span className="text-xs font-mono font-black text-white">
              Level {levelConfig.levelNumber}: {levelConfig.title}
            </span>
          </div>

          <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-md border uppercase tracking-wider ${getDifficultyBadge()}`}>
            {levelConfig.difficulty}
          </span>

          <span className="text-[11px] text-gray-400 font-mono hidden md:inline">
            • {levelConfig.category}
          </span>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={handleSpeakInstructions}
            className={`px-2.5 py-1 rounded-lg border text-xs font-mono font-bold flex items-center gap-1.5 transition ${
              isReading
                ? "bg-emerald-500/30 text-emerald-300 border-emerald-400 animate-pulse"
                : "bg-white/10 text-gray-300 border-white/15 hover:bg-white/20 hover:text-white"
            }`}
            title="Read Level Instructions"
          >
            <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">{isReading ? "Reading..." : "Read Aloud"}</span>
          </button>

          <button
            onClick={handleRandomizeClick}
            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-gray-200 text-xs font-mono font-bold flex items-center gap-1.5 shadow-sm transition active:scale-95"
            title="Generate a new practice problem for this level"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            <span>New Problem</span>
          </button>
        </div>
      </div>

      {/* Main Instructional Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 text-xs">
        {/* Left: Skill Focus & Objective */}
        <div className="md:col-span-5 space-y-1 bg-black/40 p-2.5 rounded-xl border border-white/5">
          <div className="flex items-center gap-1.5 text-emerald-400 font-mono font-bold text-[11px]">
            <Target className="w-3 h-3" />
            <span>Skill Concept:</span>
          </div>
          <p className="font-bold text-white text-xs leading-snug">{levelConfig.skillConcept}</p>

          <div className="pt-0.5 text-gray-300 leading-relaxed font-sans text-[11px]">
            <strong className="text-emerald-400">Goal:</strong> {levelConfig.targetObjective}
          </div>
        </div>

        {/* Right: Step-by-Step Instructions & Math Tip */}
        <div className="md:col-span-7 space-y-1 bg-black/40 p-2.5 rounded-xl border border-white/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-1">
              <span className="flex items-center gap-1.5 text-cyan-400 font-mono font-bold text-[11px]">
                <ListOrdered className="w-3 h-3" />
                <span>How to Count:</span>
              </span>
              <button
                onClick={() => setShowTip(!showTip)}
                className="text-[11px] font-mono text-amber-300 hover:text-amber-200 flex items-center gap-1"
              >
                <Lightbulb className="w-3 h-3 text-amber-400" />
                <span>{showTip ? "Hide Hint" : "Hint"}</span>
                {showTip ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>

            <ol className="space-y-1 text-gray-200 text-[11px] font-sans">
              {levelConfig.stepByStep.map((step, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="font-mono font-bold text-cyan-400 bg-cyan-950/80 px-1.5 rounded text-[10px] mt-0.5 shrink-0">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Expandable Pedagogical Math Insight */}
          {showTip && (
            <div className="mt-1.5 p-2 bg-amber-950/40 border border-amber-500/30 rounded-lg text-amber-200 text-[11px] font-sans leading-relaxed animate-fadeIn">
              <strong className="font-mono text-amber-300 block mb-0.5">💡 Hint:</strong>
              {levelConfig.pedagogyTip}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
