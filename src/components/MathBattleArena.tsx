import React, { useState, useEffect, useRef } from "react";
import {
  Swords,
  Bot,
  Users,
  Zap,
  Flame,
  Timer,
  Trophy,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Shield,
  Radio,
  Copy,
  Check,
  Award,
  ChevronRight,
  TrendingUp,
  Brain,
  HelpCircle,
} from "lucide-react";
import { playSound } from "../utils/audio";
import { TopicCategory, UserProgress } from "../types";

export interface BattleProblem {
  id: string;
  topic: TopicCategory;
  topicLabel: string;
  question: string;
  answer: string;
  acceptableAnswers: string[];
  visualClue?: string;
  difficulty: "easy" | "medium" | "hard";
  hint: string;
}

interface OpponentProfile {
  id: string;
  name: string;
  avatar: string;
  type: "ai" | "peer";
  difficultyLabel: string;
  avgSpeedSec: number; // Seconds per problem
  accuracy: number; // 0-1
  bio: string;
}

const AI_OPPONENTS: OpponentProfile[] = [
  {
    id: "ai_adaptive",
    name: "Koda Adaptive AI",
    avatar: "🤖",
    type: "ai",
    difficultyLabel: "Dynamic (Matched to Your Skill Mastery)",
    avgSpeedSec: 4.5,
    accuracy: 0.9,
    bio: "Calibrates question difficulty and speed directly to your highest & lowest mastery topics.",
  },
  {
    id: "ai_speedy",
    name: "Nova Speedster",
    avatar: "⚡",
    type: "ai",
    difficultyLabel: "Fast Calculation Blitz",
    avgSpeedSec: 3.2,
    accuracy: 0.85,
    bio: "Lightning fast mental calculator. Punishes hesitation!",
  },
  {
    id: "ai_master",
    name: "Grandmaster Gauss",
    avatar: "🧙‍♂️",
    type: "ai",
    difficultyLabel: "Grandmaster Precision",
    avgSpeedSec: 3.8,
    accuracy: 0.96,
    bio: "Unshakeable precision across algebra, exponents, and logic matrix problems.",
  },
  {
    id: "ai_apprentice",
    name: "Sparky Bot",
    avatar: "🌱",
    type: "ai",
    difficultyLabel: "Apprentice Pace",
    avgSpeedSec: 6.5,
    accuracy: 0.75,
    bio: "Great for warm-ups and building calculation confidence.",
  },
];

// Curated pool of battle problems mapped across mastery topics
function generateBattleQuestions(mastery: Record<TopicCategory, number>): BattleProblem[] {
  const basePool: BattleProblem[] = [
    // Balance Equations / Algebra
    {
      id: "b_eq_1",
      topic: "balance_equations",
      topicLabel: "Algebra Balance",
      question: "2x + 6 = 20. Find x.",
      answer: "7",
      acceptableAnswers: ["7", "x=7", "x = 7"],
      visualClue: "2x + 6 ===⚖️=== 20",
      difficulty: "easy",
      hint: "Subtract 6 from both sides (2x = 14), then divide by 2.",
    },
    {
      id: "b_eq_2",
      topic: "balance_equations",
      topicLabel: "Algebra Balance",
      question: "4x - 5 = 19. Find x.",
      answer: "6",
      acceptableAnswers: ["6", "x=6", "x = 6"],
      visualClue: "4x - 5 ===⚖️=== 19",
      difficulty: "medium",
      hint: "Add 5 to both sides (4x = 24), then divide by 4.",
    },
    {
      id: "b_eq_3",
      topic: "balance_equations",
      topicLabel: "Algebra Balance",
      question: "5x + 3 = 3x + 15. Find x.",
      answer: "6",
      acceptableAnswers: ["6", "x=6", "x = 6"],
      visualClue: "5x + 3 ===⚖️=== 3x + 15",
      difficulty: "hard",
      hint: "Subtract 3x from both sides (2x + 3 = 15), then subtract 3 and divide by 2.",
    },

    // Fraction Lab
    {
      id: "b_frac_1",
      topic: "fraction_lab",
      topicLabel: "Fraction Lab",
      question: "3/8 + 2/8 in simplest form?",
      answer: "5/8",
      acceptableAnswers: ["5/8", "5 / 8"],
      visualClue: "[🥧 3/8] + [🥧 2/8]",
      difficulty: "easy",
      hint: "Same denominator: add numerators 3 + 2 = 5.",
    },
    {
      id: "b_frac_2",
      topic: "fraction_lab",
      topicLabel: "Fraction Lab",
      question: "Simplify: 15 / 20",
      answer: "3/4",
      acceptableAnswers: ["3/4", "3 / 4"],
      visualClue: "Divide top & bottom by 5",
      difficulty: "easy",
      hint: "Both divide evenly by 5.",
    },
    {
      id: "b_frac_3",
      topic: "fraction_lab",
      topicLabel: "Fraction Lab",
      question: "1/2 + 1/4 = ?",
      answer: "3/4",
      acceptableAnswers: ["3/4", "3 / 4", "0.75"],
      visualClue: "2/4 + 1/4",
      difficulty: "medium",
      hint: "Convert 1/2 to 2/4, then add 1/4.",
    },

    // Exponent Growth
    {
      id: "b_exp_1",
      topic: "exponent_growth",
      topicLabel: "Exponents",
      question: "Evaluate: 3³",
      answer: "27",
      acceptableAnswers: ["27"],
      visualClue: "3 × 3 × 3",
      difficulty: "easy",
      hint: "3 × 3 = 9, and 9 × 3 = 27.",
    },
    {
      id: "b_exp_2",
      topic: "exponent_growth",
      topicLabel: "Exponents",
      question: "Evaluate: 4³ - 2⁴",
      answer: "48",
      acceptableAnswers: ["48"],
      visualClue: "(64) - (16)",
      difficulty: "hard",
      hint: "4³ = 64, 2⁴ = 16. 64 - 16 = 48.",
    },
    {
      id: "b_exp_3",
      topic: "exponent_growth",
      topicLabel: "Exponents",
      question: "What is 2⁶?",
      answer: "64",
      acceptableAnswers: ["64"],
      visualClue: "2⁵ = 32, double it again",
      difficulty: "medium",
      hint: "Double 32.",
    },

    // Spatial Puzzles / Geometry
    {
      id: "b_spat_1",
      topic: "spatial_puzzles",
      topicLabel: "Geometry & Area",
      question: "Rectangle with Length = 9, Width = 7. Area = ?",
      answer: "63",
      acceptableAnswers: ["63", "63 sq units"],
      visualClue: "Area = 9 × 7",
      difficulty: "easy",
      hint: "Multiply 9 by 7.",
    },
    {
      id: "b_spat_2",
      topic: "spatial_puzzles",
      topicLabel: "Geometry & Area",
      question: "Perimeter of square with area 36?",
      answer: "24",
      acceptableAnswers: ["24", "24 units"],
      visualClue: "Side = √36 = 6. Perimeter = 4 × Side",
      difficulty: "medium",
      hint: "Side length is √36 = 6. Perimeter = 6 + 6 + 6 + 6.",
    },

    // Coordinate Quest
    {
      id: "b_coord_1",
      topic: "coordinate_quest",
      topicLabel: "Coordinates",
      question: "From (3, 5), move 4 left and 2 down. New point?",
      answer: "(-1, 3)",
      acceptableAnswers: ["(-1, 3)", "(-1,3)", "-1, 3", "-1,3"],
      visualClue: "(3 - 4, 5 - 2)",
      difficulty: "medium",
      hint: "X: 3 - 4 = -1; Y: 5 - 2 = 3.",
    },

    // Logic Matrix
    {
      id: "b_log_1",
      topic: "logic_matrix",
      topicLabel: "Logic Matrix",
      question: "If NOT (A AND B) is FALSE, what must A and B both be?",
      answer: "true",
      acceptableAnswers: ["true", "True", "TRUE", "1"],
      visualClue: "NOT (A AND B) = FALSE ➔ (A AND B) = TRUE",
      difficulty: "hard",
      hint: "If the NOT of something is FALSE, the inside must be TRUE. So A AND B must be true.",
    },
    {
      id: "b_log_2",
      topic: "logic_matrix",
      topicLabel: "Logic Matrix",
      question: "Evaluate: (10 > 5) AND (8 < 3)",
      answer: "false",
      acceptableAnswers: ["false", "False", "FALSE", "0"],
      visualClue: "TRUE AND FALSE",
      difficulty: "easy",
      hint: "10 > 5 is true, but 8 < 3 is false. TRUE AND FALSE = FALSE.",
    },
  ];

  // Shuffle and balance based on mastery levels
  return basePool.sort(() => Math.random() - 0.5);
}

interface MathBattleArenaProps {
  userProgress: UserProgress;
  studentName?: string;
  onRewardXp?: (earnedXp: number, isWin: boolean) => void;
}

export const MathBattleArena: React.FC<MathBattleArenaProps> = ({
  userProgress,
  studentName = "Alex",
  onRewardXp,
}) => {
  const [battleState, setBattleState] = useState<"lobby" | "countdown" | "battling" | "results">("lobby");
  const [matchType, setMatchType] = useState<"ai" | "p2p">("ai");
  const [selectedAi, setSelectedAi] = useState<OpponentProfile>(AI_OPPONENTS[0]);
  
  // P2P Room State
  const [roomCode, setRoomCode] = useState<string>("");
  const [inputRoomCode, setInputRoomCode] = useState<string>("");
  const [p2pRole, setP2pRole] = useState<"host" | "guest" | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [peerConnected, setPeerConnected] = useState(false);
  const [peerName, setPeerName] = useState("Peer Challenger");
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  // Battle Match State
  const TARGET_SCORE = 5;
  const [questions, setQuestions] = useState<BattleProblem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userScore, setUserScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [userCombo, setUserCombo] = useState(0);
  const [maxUserCombo, setMaxUserCombo] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [countdown, setCountdown] = useState(3);
  const [battleTimer, setBattleTimer] = useState(0);
  const [userAnswersRecord, setUserAnswersRecord] = useState<{ isRight: boolean; timeMs: number; topic: string }[]>([]);
  const [lastEventMessage, setLastEventMessage] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [battleLogs, setBattleLogs] = useState<{ wins: number; losses: number; matches: number }>({
    wins: 3,
    losses: 1,
    matches: 4,
  });

  const questionStartTimeRef = useRef<number>(Date.now());
  const aiSimTimeoutRef = useRef<any>(null);

  // Setup BroadcastChannel for P2P Multi-tab / Same-origin real-time sync
  useEffect(() => {
    try {
      const channel = new BroadcastChannel("math_battle_channel");
      broadcastChannelRef.current = channel;

      channel.onmessage = (event) => {
        const { type, payload } = event.data || {};
        if (type === "ROOM_JOINED" && payload?.roomCode === roomCode) {
          setPeerConnected(true);
          setPeerName(payload.guestName || "Online Peer");
          playSound("clink");
        } else if (type === "BATTLE_START" && payload?.roomCode === roomCode) {
          startBattleSession(payload.questions);
        } else if (type === "PEER_POINT" && payload?.roomCode === roomCode) {
          setOpponentScore((prev) => {
            const next = prev + 1;
            playSound("clink");
            setLastEventMessage(`${peerName} scored a point!`);
            return next;
          });
        }
      };

      return () => {
        channel.close();
      };
    } catch (e) {
      console.warn("BroadcastChannel not supported", e);
    }
  }, [roomCode, peerName]);

  // Start P2P Host Room
  const handleCreateRoom = () => {
    playSound("pop");
    const code = `MATH-${Math.floor(1000 + Math.random() * 9000)}`;
    setRoomCode(code);
    setP2pRole("host");
    setPeerConnected(false);
    setMatchType("p2p");
  };

  // Join P2P Room
  const handleJoinRoom = () => {
    if (!inputRoomCode.trim()) return;
    playSound("pop");
    const formatted = inputRoomCode.trim().toUpperCase();
    setRoomCode(formatted);
    setP2pRole("guest");
    setPeerConnected(true);
    setPeerName("Host Challenger");

    broadcastChannelRef.current?.postMessage({
      type: "ROOM_JOINED",
      payload: { roomCode: formatted, guestName: studentName },
    });
  };

  const copyRoomCode = () => {
    playSound("pop");
    navigator.clipboard?.writeText(roomCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Trigger Battle
  const handleInitiateBattle = () => {
    playSound("pop");
    const generated = generateBattleQuestions(userProgress.masteryByTopic);
    setQuestions(generated);

    if (matchType === "p2p" && p2pRole === "host") {
      broadcastChannelRef.current?.postMessage({
        type: "BATTLE_START",
        payload: { roomCode, questions: generated },
      });
    }

    startBattleSession(generated);
  };

  const startBattleSession = (battleQuestions: BattleProblem[]) => {
    setQuestions(battleQuestions);
    setCurrentIndex(0);
    setUserScore(0);
    setOpponentScore(0);
    setUserCombo(0);
    setMaxUserCombo(0);
    setUserAnswer("");
    setUserAnswersRecord([]);
    setBattleTimer(0);
    setShowHint(false);
    setLastEventMessage(null);

    setBattleState("countdown");
    setCountdown(3);

    let count = 3;
    playSound("pop");
    const countInterval = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
        playSound("pop");
      } else {
        clearInterval(countInterval);
        setBattleState("battling");
        playSound("success");
        questionStartTimeRef.current = Date.now();
      }
    }, 1000);
  };

  // Main Battle Timer
  useEffect(() => {
    let timer: any = null;
    if (battleState === "battling") {
      timer = setInterval(() => {
        setBattleTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [battleState]);

  // AI Opponent Simulation Logic
  useEffect(() => {
    if (battleState !== "battling") return;

    // Check game over
    if (userScore >= TARGET_SCORE || opponentScore >= TARGET_SCORE) {
      endBattle();
      return;
    }

    if (matchType === "ai") {
      // Calculate speed based on selected AI opponent & student mastery
      const currentQ = questions[currentIndex % (questions.length || 1)];
      const topicMastery = userProgress.masteryByTopic[currentQ?.topic] || 50;

      // Adaptive opponent adjusts to topic
      let speedVariance = (Math.random() * 2 - 1) * 1.2;
      let targetSeconds = selectedAi.avgSpeedSec + speedVariance;

      if (selectedAi.id === "ai_adaptive") {
        // If student is strong in this topic (>70%), AI is faster to challenge them
        if (topicMastery > 70) targetSeconds *= 0.85;
        else targetSeconds *= 1.2;
      }

      const delayMs = Math.max(2200, targetSeconds * 1000);

      aiSimTimeoutRef.current = setTimeout(() => {
        const willHit = Math.random() < selectedAi.accuracy;
        if (willHit && battleState === "battling") {
          setOpponentScore((prev) => {
            const next = prev + 1;
            playSound("clink");
            setLastEventMessage(`⚡ ${selectedAi.name} answered correctly! (+1 Point)`);
            return next;
          });
        }
      }, delayMs);

      return () => {
        if (aiSimTimeoutRef.current) clearTimeout(aiSimTimeoutRef.current);
      };
    }
  }, [battleState, currentIndex, userScore, opponentScore, matchType, selectedAi]);

  // User submits answer
  const handleSubmitAnswer = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userAnswer.trim() || battleState !== "battling") return;

    const currentQ = questions[currentIndex % (questions.length || 1)];
    const cleanUser = userAnswer.trim().toLowerCase();
    const isCorrect = currentQ.acceptableAnswers.some(
      (a) => a.trim().toLowerCase() === cleanUser
    );

    const timeSpent = Date.now() - questionStartTimeRef.current;

    if (isCorrect) {
      playSound("levelup");
      const nextScore = userScore + 1;
      const nextCombo = userCombo + 1;
      setUserScore(nextScore);
      setUserCombo(nextCombo);
      setMaxUserCombo((prev) => Math.max(prev, nextCombo));
      setLastEventMessage(`🔥 Critical speed hit! Streak: ${nextCombo}x (+1 Point)`);

      setUserAnswersRecord((prev) => [
        ...prev,
        { isRight: true, timeMs: timeSpent, topic: currentQ.topicLabel },
      ]);

      if (matchType === "p2p") {
        broadcastChannelRef.current?.postMessage({
          type: "PEER_POINT",
          payload: { roomCode },
        });
      }

      if (nextScore >= TARGET_SCORE) {
        endBattle(true);
        return;
      }
    } else {
      playSound("error");
      setUserCombo(0);
      setLastEventMessage(`❌ Missed! ${currentQ.hint}`);
      setUserAnswersRecord((prev) => [
        ...prev,
        { isRight: false, timeMs: timeSpent, topic: currentQ.topicLabel },
      ]);
    }

    // Move to next problem
    setUserAnswer("");
    setShowHint(false);
    setCurrentIndex((prev) => prev + 1);
    questionStartTimeRef.current = Date.now();
  };

  const endBattle = (userWonOverride?: boolean) => {
    const isWin = userWonOverride !== undefined ? userWonOverride : userScore > opponentScore;
    setBattleState("results");
    if (isWin) {
      playSound("levelup");
      setBattleLogs((prev) => ({
        ...prev,
        wins: prev.wins + 1,
        matches: prev.matches + 1,
      }));
      if (onRewardXp) onRewardXp(75, true);
    } else {
      playSound("pop");
      setBattleLogs((prev) => ({
        ...prev,
        losses: prev.losses + 1,
        matches: prev.matches + 1,
      }));
      if (onRewardXp) onRewardXp(35, false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const currentQ = questions[currentIndex % (questions.length || 1)] || {
    id: "default",
    topic: "balance_equations",
    topicLabel: "Algebra Balance",
    question: "3x + 4 = 19",
    answer: "5",
    acceptableAnswers: ["5"],
    hint: "Subtract 4 then divide by 3.",
    difficulty: "medium",
  };

  const opponentDisplayName =
    matchType === "ai" ? selectedAi.name : peerName;
  const opponentDisplayAvatar =
    matchType === "ai" ? selectedAi.avatar : "🧑‍🚀";

  return (
    <div className="flex flex-col w-full bg-[#0a0a0a] rounded-3xl border border-white/10 p-6 sm:p-8 shadow-2xl backdrop-blur-xl font-sans relative overflow-hidden">
      {/* Background Neon Accent Auras */}
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Arena Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-5 border-b border-white/10 gap-3 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg border border-amber-500/40">
              <Swords className="w-4 h-4" />
            </span>
            <span className="text-amber-400 font-mono uppercase tracking-[0.25em] text-[10px] font-bold">
              COMPETITIVE ARENA
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight flex items-center gap-2">
            Math <span className="text-amber-400">Battle</span> Duel
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            High-velocity calculation race calibrated to real-time skill mastery telemetry.
          </p>
        </div>

        {/* Win/Loss Record Badge */}
        <div className="flex items-center gap-3 font-mono">
          <div className="flex items-center gap-2 bg-black/60 border border-white/10 px-3.5 py-1.5 rounded-xl text-xs">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="text-gray-300">
              Record: <strong className="text-emerald-400">{battleLogs.wins}W</strong> -{" "}
              <strong className="text-red-400">{battleLogs.losses}L</strong>
            </span>
          </div>
        </div>
      </div>

      {/* LOBBY VIEW */}
      {battleState === "lobby" && (
        <div className="space-y-6 pt-6 relative z-10">
          {/* Match Type Tabs: AI Match vs Peer-to-Peer */}
          <div className="flex items-center gap-2 p-1.5 bg-black/60 border border-white/10 rounded-2xl w-fit font-mono text-xs">
            <button
              onClick={() => {
                playSound("pop");
                setMatchType("ai");
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${
                matchType === "ai"
                  ? "bg-amber-400 text-black shadow-[0_0_12px_rgba(251,191,36,0.4)]"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Bot className="w-4 h-4" />
              AI Opponents
            </button>

            <button
              onClick={() => {
                playSound("pop");
                setMatchType("p2p");
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${
                matchType === "p2p"
                  ? "bg-cyan-400 text-black shadow-[0_0_12px_rgba(34,211,238,0.4)]"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Users className="w-4 h-4" />
              Peer-to-Peer (P2P)
            </button>
          </div>

          {/* AI MATCHMAKING SELECTION */}
          {matchType === "ai" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-gray-400">
                  Select Opponent AI Bot
                </span>
                <span className="text-[11px] text-cyan-400 font-mono flex items-center gap-1">
                  <Brain className="w-3.5 h-3.5" /> Target: First to {TARGET_SCORE} Points
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {AI_OPPONENTS.map((opp) => (
                  <div
                    key={opp.id}
                    onClick={() => {
                      playSound("pop");
                      setSelectedAi(opp);
                    }}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all relative ${
                      selectedAi.id === opp.id
                        ? "bg-amber-500/10 border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.15)] ring-1 ring-amber-400/40"
                        : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/[0.07]"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl p-2 bg-white/5 rounded-xl border border-white/10">
                          {opp.avatar}
                        </span>
                        <div>
                          <h4 className="text-sm font-bold text-white">{opp.name}</h4>
                          <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider block mt-0.5">
                            {opp.difficultyLabel}
                          </span>
                        </div>
                      </div>

                      {selectedAi.id === opp.id && (
                        <span className="p-1 bg-amber-400 rounded-full text-black">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-gray-400 leading-relaxed mb-3">
                      {opp.bio}
                    </p>

                    <div className="flex items-center gap-4 text-[10px] font-mono text-gray-400 pt-2 border-t border-white/5">
                      <span>Speed: ~{opp.avgSpeedSec}s/prob</span>
                      <span>•</span>
                      <span>Accuracy: {Math.round(opp.accuracy * 100)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PEER-TO-PEER LOBBY */}
          {matchType === "p2p" && (
            <div className="p-6 bg-black/60 rounded-2xl border border-white/10 space-y-6">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
                  <Radio className="w-4 h-4 text-cyan-400 animate-pulse" /> Live Peer Duel Connection
                </h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Challenge classmates or peers across live tabs using direct synchronized room codes.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Host Room Option */}
                <div className="p-5 bg-white/5 rounded-xl border border-white/10 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase text-cyan-400 tracking-wider block mb-1">
                      Host a Battle
                    </span>
                    <h5 className="text-sm font-bold text-white">Create Challenge Room</h5>
                    <p className="text-xs text-gray-400 mt-1">
                      Generate a room code to invite a study partner.
                    </p>
                  </div>

                  {roomCode && p2pRole === "host" ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-black/80 rounded-xl border border-cyan-400/30 font-mono">
                        <span className="text-lg font-black text-cyan-300 tracking-widest">
                          {roomCode}
                        </span>
                        <button
                          onClick={copyRoomCode}
                          className="px-3 py-1.5 bg-cyan-400/20 text-cyan-300 hover:bg-cyan-400/30 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          {isCopied ? "Copied" : "Copy Code"}
                        </button>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-mono text-gray-300">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                        {peerConnected ? (
                          <span className="text-emerald-400 font-bold">
                            Challenger Connected: {peerName}!
                          </span>
                        ) : (
                          <span>Waiting for peer to enter code...</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={handleCreateRoom}
                      className="w-full py-2.5 bg-cyan-400 hover:bg-cyan-300 text-black font-bold font-mono text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_0_12px_rgba(34,211,238,0.3)]"
                    >
                      Generate Room Code
                    </button>
                  )}
                </div>

                {/* Join Room Option */}
                <div className="p-5 bg-white/5 rounded-xl border border-white/10 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase text-amber-400 tracking-wider block mb-1">
                      Join a Battle
                    </span>
                    <h5 className="text-sm font-bold text-white">Enter Friend's Code</h5>
                    <p className="text-xs text-gray-400 mt-1">
                      Paste the 4-digit code provided by your study partner.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="e.g. MATH-7421"
                        value={inputRoomCode}
                        onChange={(e) => setInputRoomCode(e.target.value)}
                        className="flex-1 bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-mono uppercase focus:outline-none focus:border-amber-400"
                      />
                      <button
                        onClick={handleJoinRoom}
                        disabled={!inputRoomCode.trim()}
                        className="px-4 py-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-black font-bold font-mono text-xs uppercase rounded-xl transition-all"
                      >
                        Join
                      </button>
                    </div>

                    {peerConnected && p2pRole === "guest" && (
                      <span className="text-xs text-emerald-400 font-mono block">
                        ✓ Connected to room {roomCode}! Ready for host to launch.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Launch Button */}
          <div className="pt-2">
            <button
              onClick={handleInitiateBattle}
              disabled={matchType === "p2p" && !peerConnected}
              className="w-full py-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 disabled:opacity-40 text-black font-black font-mono text-sm uppercase tracking-widest rounded-2xl shadow-[0_0_25px_rgba(251,191,36,0.4)] transition-all flex items-center justify-center gap-3"
            >
              <Swords className="w-5 h-5 fill-black" />
              Launch Math Battle
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* COUNTDOWN VIEW */}
      {battleState === "countdown" && (
        <div className="py-20 flex flex-col items-center justify-center relative z-10 space-y-4 font-mono">
          <span className="text-xs uppercase tracking-[0.3em] text-amber-400 font-bold">
            GET READY TO CALCULATE
          </span>
          <div className="text-8xl font-black text-white animate-pulse drop-shadow-[0_0_30px_rgba(251,191,36,0.6)]">
            {countdown}
          </div>
          <span className="text-xs text-gray-400">
            First to {TARGET_SCORE} Points Wins!
          </span>
        </div>
      )}

      {/* ACTIVE BATTLING VIEW */}
      {battleState === "battling" && (
        <div className="space-y-6 pt-6 relative z-10">
          {/* Dual Duel HUD / Race Track */}
          <div className="p-5 bg-black/80 rounded-2xl border border-white/10 font-mono space-y-4">
            {/* Top Stat Indicators */}
            <div className="flex items-center justify-between text-xs text-gray-400 pb-2 border-b border-white/10">
              <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
                🧑‍🎓 {studentName} (You)
              </span>

              <div className="flex items-center gap-1.5 text-amber-400">
                <Timer className="w-4 h-4" />
                <span>{formatTime(battleTimer)}</span>
              </div>

              <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                {opponentDisplayAvatar} {opponentDisplayName}
              </span>
            </div>

            {/* Live Visual Race Track */}
            <div className="space-y-3">
              {/* User Progress Bar */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-cyan-300 font-bold flex items-center gap-1">
                    Your Points: {userScore} / {TARGET_SCORE}
                  </span>
                  {userCombo > 1 && (
                    <span className="text-[10px] text-orange-400 font-bold flex items-center gap-0.5 animate-bounce">
                      <Flame className="w-3 h-3 text-orange-400" /> {userCombo}x Streak!
                    </span>
                  )}
                </div>
                <div className="w-full h-3.5 bg-white/5 rounded-full overflow-hidden border border-white/10 p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(34,211,238,0.5)]"
                    style={{ width: `${(userScore / TARGET_SCORE) * 100}%` }}
                  />
                </div>
              </div>

              {/* Opponent Progress Bar */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-amber-400 font-bold">
                    Opponent Points: {opponentScore} / {TARGET_SCORE}
                  </span>
                  <span className="text-[10px] text-gray-500">
                    Target: {TARGET_SCORE}
                  </span>
                </div>
                <div className="w-full h-3.5 bg-white/5 rounded-full overflow-hidden border border-white/10 p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-red-500 rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(251,191,36,0.5)]"
                    style={{ width: `${(opponentScore / TARGET_SCORE) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Event Notification Message */}
            {lastEventMessage && (
              <div className="p-2.5 bg-white/5 rounded-xl text-xs text-center text-gray-200 border border-white/5 animate-fadeIn">
                {lastEventMessage}
              </div>
            )}
          </div>

          {/* Active Battle Problem Card */}
          <div className="p-6 bg-black/60 rounded-2xl border border-white/10 flex flex-col justify-between min-h-[220px]">
            <div>
              <div className="flex items-center justify-between mb-3 font-mono">
                <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 bg-cyan-400/10 px-2.5 py-1 rounded border border-cyan-400/30">
                  {currentQ.topicLabel}
                </span>
                <span className="text-xs text-gray-400 font-mono">
                  Round #{currentIndex + 1}
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-3">
                {currentQ.question}
              </h3>

              {currentQ.visualClue && (
                <div className="bg-[#050505] border border-white/10 rounded-xl p-3 font-mono text-xs text-cyan-300 w-fit mb-4">
                  <span className="text-[10px] text-gray-500 uppercase block mb-0.5">Clue:</span>
                  {currentQ.visualClue}
                </div>
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmitAnswer} className="flex items-center gap-3 mt-4">
              <input
                type="text"
                autoFocus
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Type answer & press Enter..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-base text-white placeholder-gray-500 focus:outline-none focus:border-amber-400/60 font-mono transition-all"
              />

              <button
                type="submit"
                disabled={!userAnswer.trim()}
                className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-black font-bold font-mono text-xs uppercase tracking-wider rounded-xl shadow-[0_0_15px_rgba(251,191,36,0.4)] disabled:opacity-40 transition-all flex items-center gap-1.5 shrink-0"
              >
                <Zap className="w-4 h-4 fill-black" />
                Fire
              </button>

              <button
                type="button"
                onClick={() => setShowHint(!showHint)}
                className="p-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl border border-white/10 transition-all shrink-0"
                title="Socratic Hint"
              >
                <HelpCircle className="w-5 h-5 text-amber-400" />
              </button>
            </form>

            {/* Socratic Hint Box */}
            {showHint && (
              <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-200 font-sans">
                💡 <strong>Hint:</strong> {currentQ.hint}
              </div>
            )}
          </div>
        </div>
      )}

      {/* RESULTS VIEW */}
      {battleState === "results" && (
        <div className="space-y-6 pt-6 relative z-10">
          <div
            className={`p-8 rounded-2xl border text-center space-y-4 ${
              userScore >= opponentScore
                ? "bg-gradient-to-b from-amber-500/20 to-emerald-500/10 border-amber-400/40 shadow-[0_0_30px_rgba(251,191,36,0.2)]"
                : "bg-gradient-to-b from-red-500/20 to-black border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.2)]"
            }`}
          >
            <div className="inline-flex p-4 rounded-2xl bg-black/60 border border-white/10 mb-2">
              {userScore >= opponentScore ? (
                <Trophy className="w-12 h-12 text-amber-400 animate-bounce" />
              ) : (
                <Shield className="w-12 h-12 text-gray-400" />
              )}
            </div>

            <h3 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
              {userScore >= opponentScore ? "VICTORY ACHIEVED!" : "DEFEAT — VALIANT EFFORT"}
            </h3>

            <p className="text-xs sm:text-sm text-gray-300 font-mono max-w-lg mx-auto">
              {userScore >= opponentScore
                ? `Outstanding calculation velocity! You defeated ${opponentDisplayName} ${userScore} to ${opponentScore}.`
                : `Good battle! ${opponentDisplayName} edged out a win ${opponentScore} to ${userScore}. Review the topics below to counter next match.`}
            </p>

            {/* Rewards Card */}
            <div className="inline-flex items-center gap-4 bg-black/80 border border-white/10 px-6 py-2.5 rounded-xl font-mono text-xs">
              <span className="text-gray-400">Battle Reward:</span>
              <span className="font-bold text-amber-400 text-sm">
                {userScore >= opponentScore ? "+75 XP Awarded" : "+35 Effort XP"}
              </span>
              <span>•</span>
              <span className="text-cyan-300">
                Max Combo: {maxUserCombo}x
              </span>
            </div>
          </div>

          {/* Performance Breakdown by Topic */}
          <div className="p-6 bg-black/60 rounded-2xl border border-white/10 font-mono space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" /> Performance Analysis
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                <span className="text-[10px] text-gray-400 uppercase block">Total Duration</span>
                <span className="text-base font-bold text-white">{formatTime(battleTimer)}</span>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                <span className="text-[10px] text-gray-400 uppercase block">Accuracy Rate</span>
                <span className="text-base font-bold text-emerald-400">
                  {userAnswersRecord.length > 0
                    ? Math.round(
                        (userAnswersRecord.filter((r) => r.isRight).length /
                          userAnswersRecord.length) *
                          100
                      )
                    : 100}
                  %
                </span>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                <span className="text-[10px] text-gray-400 uppercase block">Avg Speed</span>
                <span className="text-base font-bold text-amber-400">
                  {userAnswersRecord.length > 0
                    ? (
                        userAnswersRecord.reduce((acc, r) => acc + r.timeMs, 0) /
                        userAnswersRecord.length /
                        1000
                      ).toFixed(1)
                    : "0"}
                  s / question
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => {
                playSound("pop");
                setBattleState("lobby");
              }}
              className="w-full sm:flex-1 py-3.5 bg-amber-400 hover:bg-amber-300 text-black font-bold font-mono text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(251,191,36,0.3)]"
            >
              <RotateCcw className="w-4 h-4" /> Rematch / Return to Lobby
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
