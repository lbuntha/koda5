import React from "react";
import { Trophy, Flame, Award, Crown, Sparkles, TrendingUp, Zap, UserCheck } from "lucide-react";
import { UserProgress } from "../types";

interface LeaderboardEntry {
  id: string;
  name: string;
  avatar: string;
  xp: number;
  level: number;
  streakDays: number;
  problemsSolved: number;
  badge: string;
  isCurrentUser?: boolean;
}

interface GlobalStudyLeadersProps {
  currentUserProgress: UserProgress;
  studentName?: string;
}

const PEER_STUDENTS: Omit<LeaderboardEntry, "isCurrentUser">[] = [
  {
    id: "peer_1",
    name: "Sophia Chen",
    avatar: "👩‍🔬",
    xp: 2850,
    level: 5,
    streakDays: 14,
    problemsSolved: 42,
    badge: "Algebra Wizard",
  },
  {
    id: "peer_2",
    name: "Marcus Vance",
    avatar: "👨‍💻",
    xp: 2100,
    level: 4,
    streakDays: 9,
    problemsSolved: 31,
    badge: "Geometry Master",
  },
  {
    id: "peer_3",
    name: "Aria Thorne",
    avatar: "🎨",
    xp: 1650,
    level: 3,
    streakDays: 7,
    problemsSolved: 24,
    badge: "Fraction Explorer",
  },
  {
    id: "peer_4",
    name: "Liam O'Connor",
    avatar: "🚀",
    xp: 1100,
    level: 2,
    streakDays: 4,
    problemsSolved: 16,
    badge: "Exponent Prodigy",
  },
];

export const GlobalStudyLeaders: React.FC<GlobalStudyLeadersProps> = ({
  currentUserProgress,
  studentName = "Alex (You)",
}) => {
  // Construct user entry from current progress
  const userEntry: LeaderboardEntry = {
    id: "current_user",
    name: studentName,
    avatar: "🧑‍🎓",
    xp: currentUserProgress.xp,
    level: currentUserProgress.level,
    streakDays: currentUserProgress.streakDays,
    problemsSolved: currentUserProgress.problemsSolved,
    badge: "Socratic Scholar",
    isCurrentUser: true,
  };

  // Combine user entry with peer list and sort descending by XP
  const allLeaderboard: LeaderboardEntry[] = [userEntry, ...PEER_STUDENTS]
    .sort((a, b) => b.xp - a.xp)
    .slice(0, 5);

  const currentUserRank =
    allLeaderboard.findIndex((entry) => entry.isCurrentUser) + 1;

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="flex items-center gap-1 text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/30 font-bold text-xs">
            <Crown className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>1st Rank</span>
          </div>
        );
      case 2:
        return (
          <div className="flex items-center gap-1 text-slate-300 bg-slate-300/10 px-2.5 py-1 rounded-lg border border-slate-300/30 font-bold text-xs">
            <Award className="w-4 h-4 text-slate-300" />
            <span>2nd Rank</span>
          </div>
        );
      case 3:
        return (
          <div className="flex items-center gap-1 text-amber-600 bg-amber-600/10 px-2.5 py-1 rounded-lg border border-amber-600/30 font-bold text-xs">
            <Trophy className="w-4 h-4 text-amber-600" />
            <span>3rd Rank</span>
          </div>
        );
      default:
        return (
          <div className="text-gray-400 font-mono text-xs font-bold px-2 py-1 bg-white/5 rounded border border-white/10">
            #{rank}
          </div>
        );
    }
  };

  return (
    <div className="p-6 bg-black/60 rounded-2xl border border-white/10 font-sans relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-white/10 gap-2 mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400">
              COMMUNITY HONORS
            </span>
          </div>
          <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
            Global <span className="text-amber-400">Study Leaders</span>
          </h3>
        </div>

        {currentUserRank > 0 && (
          <div className="flex items-center gap-2 bg-amber-400/10 border border-amber-400/30 px-3 py-1.5 rounded-xl font-mono text-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-gray-300">Your Leaderboard Stand:</span>
            <span className="font-bold text-amber-400">#{currentUserRank} Overall</span>
          </div>
        )}
      </div>

      {/* Leaders List */}
      <div className="space-y-3 font-mono">
        {allLeaderboard.map((student, index) => {
          const rank = index + 1;
          return (
            <div
              key={student.id}
              className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border transition-all ${
                student.isCurrentUser
                  ? "bg-cyan-500/10 border-cyan-400/50 shadow-[0_0_20px_rgba(34,211,238,0.15)] ring-1 ring-cyan-400/30"
                  : "bg-white/5 border-white/5 hover:border-white/20"
              }`}
            >
              {/* Left Student Info */}
              <div className="flex items-center gap-3.5 mb-2 sm:mb-0">
                {/* Rank Badge */}
                <div className="w-8 shrink-0 flex items-center justify-center">
                  {getRankBadge(rank)}
                </div>

                {/* Avatar */}
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-xl shrink-0 shadow-inner">
                  {student.avatar}
                </div>

                {/* Name & Badge */}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white font-sans">
                      {student.name}
                    </span>
                    {student.isCurrentUser && (
                      <span className="flex items-center gap-1 text-[9px] font-bold text-cyan-400 bg-cyan-400/20 px-2 py-0.5 rounded border border-cyan-400/40 uppercase tracking-wider">
                        <UserCheck className="w-2.5 h-2.5" /> YOU
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-0.5">
                    <span className="text-amber-400/90 font-semibold">
                      Level {student.level}
                    </span>
                    <span>•</span>
                    <span className="text-gray-400">{student.badge}</span>
                  </div>
                </div>
              </div>

              {/* Right Stats: XP, Streak, Solved */}
              <div className="flex items-center gap-4 sm:gap-6 self-end sm:self-auto text-xs">
                {/* Solved Problems */}
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-gray-400 uppercase font-bold">
                    Solved
                  </span>
                  <span className="font-bold text-gray-200">
                    {student.problemsSolved}
                  </span>
                </div>

                {/* Streak */}
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-orange-400/80 uppercase font-bold flex items-center gap-0.5">
                    <Flame className="w-3 h-3 text-orange-400" /> Streak
                  </span>
                  <span className="font-bold text-orange-300">
                    {student.streakDays}d
                  </span>
                </div>

                {/* Total XP */}
                <div className="flex flex-col items-end bg-amber-400/10 border border-amber-400/20 px-3 py-1.5 rounded-lg min-w-[80px]">
                  <span className="text-[9px] text-amber-400 uppercase font-bold tracking-wider">
                    Total XP
                  </span>
                  <span className="font-black text-amber-300 text-sm">
                    {student.xp}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Motivational Footer */}
      <div className="mt-5 p-3.5 bg-cyan-400/5 border border-cyan-400/20 rounded-xl flex items-center justify-between text-xs text-cyan-200 font-sans">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            Earn <strong className="text-amber-400">+50 XP</strong> on Challenge problems and <strong className="text-amber-400">+30 XP</strong> on Quick Math Drills to rise up the global ranks!
          </span>
        </div>
        <span className="text-[10px] font-mono font-bold uppercase text-gray-400 shrink-0 ml-2 hidden sm:inline">
          Live Updates
        </span>
      </div>
    </div>
  );
};
