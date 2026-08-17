import React, { useState } from "react";
import { SkillNode, TopicCategory } from "../types";
import {
  Scale,
  PieChart,
  Box,
  Zap,
  Compass,
  Cpu,
  Lock,
  Unlock,
  CheckCircle2,
  Sparkles,
  CircleDot,
  Layers,
  Clock,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { playSound } from "../utils/audio";

interface SkillMapProps {
  skills: SkillNode[];
  onSelectTopic: (topic: TopicCategory) => void;
  activeTopic: TopicCategory;
  userLevel?: number;
  onUnlockSkill?: (skillId: string, topic: TopicCategory) => void;
}

export const SkillMap: React.FC<SkillMapProps> = ({
  skills,
  onSelectTopic,
  activeTopic,
  userLevel = 3,
  onUnlockSkill,
}) => {
  const [filter, setFilter] = useState<"all" | "unlocked" | "ready" | "locked">("all");

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "CircleDot":
        return <CircleDot className="w-5 h-5 sm:w-6 sm:h-6" />;
      case "Layers":
        return <Layers className="w-5 h-5 sm:w-6 sm:h-6" />;
      case "Clock":
        return <Clock className="w-5 h-5 sm:w-6 sm:h-6" />;
      case "Scale":
        return <Scale className="w-5 h-5 sm:w-6 sm:h-6" />;
      case "PieChart":
        return <PieChart className="w-5 h-5 sm:w-6 sm:h-6" />;
      case "Box":
        return <Box className="w-5 h-5 sm:w-6 sm:h-6" />;
      case "Zap":
        return <Zap className="w-5 h-5 sm:w-6 sm:h-6" />;
      case "Compass":
        return <Compass className="w-5 h-5 sm:w-6 sm:h-6" />;
      case "Cpu":
        return <Cpu className="w-5 h-5 sm:w-6 sm:h-6" />;
      default:
        return <Scale className="w-5 h-5 sm:w-6 sm:h-6" />;
    }
  };

  // Helper: check if all prerequisites for a skill node are unlocked
  const arePrerequisitesMet = (node: SkillNode): boolean => {
    if (!node.prerequisites || node.prerequisites.length === 0) return true;
    return node.prerequisites.every((prereqId) => {
      const prereqNode = skills.find((s) => s.id === prereqId);
      return prereqNode?.unlocked;
    });
  };

  // Helper: check if a node is ready to be unlocked right now
  const isReadyToUnlock = (node: SkillNode): boolean => {
    if (node.unlocked) return false;
    const levelMet = userLevel >= node.levelRequired;
    const prereqsMet = arePrerequisitesMet(node);
    return levelMet && prereqsMet;
  };

  // Get names of prerequisite skills for a node
  const getPrerequisiteNames = (node: SkillNode): string[] => {
    if (!node.prerequisites || node.prerequisites.length === 0) return [];
    return node.prerequisites
      .map((id) => skills.find((s) => s.id === id)?.name)
      .filter(Boolean) as string[];
  };

  const unlockedCount = skills.filter((s) => s.unlocked).length;
  const readyCount = skills.filter((s) => isReadyToUnlock(s)).length;
  const lockedCount = skills.filter((s) => !s.unlocked && !isReadyToUnlock(s)).length;

  const filteredSkills = skills.filter((node) => {
    if (filter === "unlocked") return node.unlocked;
    if (filter === "ready") return isReadyToUnlock(node);
    if (filter === "locked") return !node.unlocked && !isReadyToUnlock(node);
    return true;
  });

  const handleNodeClick = (node: SkillNode) => {
    if (node.unlocked) {
      playSound("pop");
      onSelectTopic(node.topic);
    } else if (isReadyToUnlock(node)) {
      playSound("levelup");
      if (onUnlockSkill) {
        onUnlockSkill(node.id, node.topic);
      } else {
        onSelectTopic(node.topic);
      }
    } else {
      playSound("hint");
    }
  };

  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto p-6 sm:p-8 bg-[#0a0a0a] rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl">
      {/* Header & Progression Overview */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-5 border-b border-white/10 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-px w-6 bg-cyan-400" />
            <span className="text-cyan-400 uppercase tracking-[0.3em] text-[10px] font-bold">
              SYNTHESIS PROGRESSION MATRIX
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3">
            Skill <span className="text-cyan-400">Map</span>
            {readyCount > 0 && (
              <span className="ready-to-unlock-badge text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-400/40 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> {readyCount} Ready to Unlock!
              </span>
            )}
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Master visual mental models, foundational bonds, and spatial intuition step-by-step.
          </p>
        </div>

        {/* Level & Readiness Stat Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-black px-3 py-1.5 rounded-xl border border-white/10 font-mono text-xs">
            <span className="text-cyan-400 font-bold">LVL {userLevel}</span>
            <span className="text-gray-400">STUDENT</span>
          </div>
          <div className="flex items-center gap-1.5 bg-black px-3 py-1.5 rounded-xl border border-white/10 font-mono text-xs">
            <span className="text-emerald-400 font-bold">{unlockedCount}/{skills.length}</span>
            <span className="text-gray-400">UNLOCKED</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto no-scrollbar font-mono text-xs">
        <button
          onClick={() => {
            playSound("pop");
            setFilter("all");
          }}
          className={`px-3 py-1.5 rounded-xl border transition ${
            filter === "all"
              ? "bg-white/15 text-white border-white/30 font-bold"
              : "bg-black/40 text-gray-400 border-white/10 hover:text-white"
          }`}
        >
          All Skills ({skills.length})
        </button>
        <button
          onClick={() => {
            playSound("pop");
            setFilter("unlocked");
          }}
          className={`px-3 py-1.5 rounded-xl border transition flex items-center gap-1.5 ${
            filter === "unlocked"
              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold"
              : "bg-black/40 text-gray-400 border-white/10 hover:text-emerald-300"
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" /> Unlocked ({unlockedCount})
        </button>
        <button
          onClick={() => {
            playSound("pop");
            setFilter("ready");
          }}
          className={`px-3 py-1.5 rounded-xl border transition flex items-center gap-1.5 ${
            filter === "ready"
              ? "ready-to-unlock-badge bg-amber-500/20 text-amber-300 border-amber-400/50 font-bold"
              : readyCount > 0
              ? "bg-amber-500/10 text-amber-400 border-amber-400/30 hover:bg-amber-500/20"
              : "bg-black/40 text-gray-400 border-white/10 hover:text-amber-300"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" /> Ready to Unlock ({readyCount})
        </button>
        <button
          onClick={() => {
            playSound("pop");
            setFilter("locked");
          }}
          className={`px-3 py-1.5 rounded-xl border transition flex items-center gap-1.5 ${
            filter === "locked"
              ? "bg-white/15 text-gray-300 border-white/30 font-bold"
              : "bg-black/40 text-gray-400 border-white/10 hover:text-white"
          }`}
        >
          <Lock className="w-3.5 h-3.5" /> Locked ({lockedCount})
        </button>
      </div>

      {/* Grid of Skill Nodes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSkills.map((node) => {
          const isActive = node.topic === activeTopic;
          const unlockReady = isReadyToUnlock(node);
          const prereqNames = getPrerequisiteNames(node);

          return (
            <div
              key={node.id}
              onClick={() => handleNodeClick(node)}
              className={`relative p-6 rounded-2xl border transition-all transform hover:-translate-y-1 cursor-pointer flex flex-col justify-between overflow-hidden shadow-2xl ${
                isActive
                  ? "bg-cyan-950/40 border-cyan-400 shadow-[0_0_24px_rgba(34,211,238,0.25)] ring-1 ring-cyan-400/50"
                  : unlockReady
                  ? "ready-to-unlock-node bg-gradient-to-b from-[#181309] to-[#0c0a05] border-amber-400/70 hover:border-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.2)]"
                  : node.unlocked
                  ? "bg-black/60 border-white/10 hover:border-cyan-400/50"
                  : "bg-black/30 border-white/5 opacity-55 cursor-not-allowed"
              }`}
            >
              {/* Subtle top indicator highlight */}
              {unlockReady && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 animate-pulse" />
              )}

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                      isActive
                        ? "bg-cyan-400 text-black shadow-[0_0_15px_rgba(34,211,238,0.5)]"
                        : unlockReady
                        ? "ready-to-unlock-icon bg-amber-400/20 text-amber-300 border border-amber-400/50 shadow-[0_0_12px_rgba(251,191,36,0.4)]"
                        : node.unlocked
                        ? "bg-white/5 text-cyan-400 border border-white/10"
                        : "bg-white/5 text-gray-600"
                    }`}
                  >
                    {getIcon(node.iconName)}
                  </div>

                  {/* Status Badge */}
                  {node.unlocked ? (
                    <span className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                      <CheckCircle2 className="w-3.5 h-3.5" /> UNLOCKED
                    </span>
                  ) : unlockReady ? (
                    <span className="ready-to-unlock-badge flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider font-bold text-amber-300 bg-amber-500/20 px-2.5 py-1 rounded-full border border-amber-400/60">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" /> READY TO UNLOCK
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider font-bold text-gray-500 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
                      <Lock className="w-3.5 h-3.5" /> LVL {node.levelRequired} REQ
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-1">
                  <h3 className={`text-base font-bold uppercase tracking-wide ${
                    unlockReady ? "text-amber-200" : "text-white"
                  }`}>
                    {node.name}
                  </h3>
                </div>

                <p className="text-xs text-gray-400 leading-relaxed mb-4">{node.description}</p>

                {/* Prerequisite Footnote */}
                {prereqNames.length > 0 && (
                  <div className="mb-4">
                    {node.unlocked ? (
                      <div className="flex items-center gap-1 text-[10px] font-mono text-gray-500">
                        <ShieldCheck className="w-3 h-3 text-emerald-400/70" />
                        <span>Prerequisite: {prereqNames.join(", ")} (Completed ✓)</span>
                      </div>
                    ) : unlockReady ? (
                      <div className="flex items-center gap-1 text-[10px] font-mono text-amber-300/90 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span>Prerequisites Met! ({prereqNames.join(", ")})</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-[10px] font-mono text-gray-500">
                        <Lock className="w-3 h-3 text-gray-600" />
                        <span>Requires: {prereqNames.join(", ")} & Level {node.levelRequired}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                {/* Mastery Bar for Unlocked Nodes or Interactive Unlock Button for Ready Nodes */}
                {node.unlocked ? (
                  <>
                    <div className="w-full bg-white/5 rounded-full h-2 mb-2 overflow-hidden border border-white/10">
                      <div
                        className="bg-cyan-400 h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(34,211,238,0.6)]"
                        style={{ width: `${node.masteryPercentage}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-gray-400">
                      <span>{node.masteryPercentage}% MASTERY</span>
                      <span>{node.totalProblemsSolved} SOLVED</span>
                    </div>
                  </>
                ) : unlockReady ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNodeClick(node);
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02]"
                  >
                    <Unlock className="w-3.5 h-3.5" /> Unlock & Practice <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <div className="w-full py-2 px-3 rounded-xl bg-white/5 text-gray-500 font-mono text-[11px] flex items-center justify-center gap-1.5 border border-white/5">
                    <Lock className="w-3.5 h-3.5" /> Reach Level {node.levelRequired} to Unlock
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

