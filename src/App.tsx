/**
 * Synthesis Tutor - AI Math & Problem Solving Socratic Tutor
 */

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Scale,
  PieChart,
  Box,
  Zap,
  Compass,
  Cpu,
  Award,
  Flame,
  PenTool,
  Brain,
  Map,
  Volume2,
  VolumeX,
  BookOpen,
  ChevronRight,
  RefreshCw,
  CircleDot,
  Layers,
  Clock,
  GraduationCap,
  Mic,
  Sun,
  Moon,
} from "lucide-react";

import { TopicCategory, GradeLevel, ProblemItem, ChatMessage, UserProgress, ParentDiagnosticReport, SkillNode } from "./types";
import { INITIAL_SKILL_NODES, SAMPLE_PROBLEMS } from "./data/sampleProblems";
import { SKILL_GROWTH_ROADMAP, SkillQuestStage } from "./data/skillTreeRoadmap";
import { KodaAvatar } from "./components/KodaAvatar";
import { SocraticChatPanel } from "./components/SocraticChatPanel";
import { SkillAdventureMap } from "./components/SkillAdventureMap";
import { SkillQuestPlayer } from "./components/SkillQuestPlayer";
import { SkillProgressionLab } from "./components/SkillProgressionLab";
import { Home } from "./components/Home";
import { SidebarNav } from "./components/SidebarNav";
import { MainLayout } from "./components/layout/MainLayout";
import { PluginHost } from "./plugins/host/PluginHost";
import { PluginManagerPage } from "./components/plugins/PluginManagerPage";
import { SettingsPage } from "./components/SettingsPage";
import { WhiteboardModal } from "./components/WhiteboardModal";
import { SkillMap } from "./components/SkillMap";
import { MathConceptsModal } from "./components/MathConceptsModal";
import { DailyStudyGoal } from "./components/DailyStudyGoal";
import { QuickMathPanel } from "./components/QuickMathPanel";
import { LiveVoiceCoachModal } from "./components/LiveVoiceCoachModal";
import { playSound, playBase64Pcm, speakWebSpeech } from "./utils/audio";
import { generateLocalSocraticResponse } from "./utils/socraticEngine";

export default function App() {
  const [skillNodes, setSkillNodes] = useState<SkillNode[]>(INITIAL_SKILL_NODES);
  const [activeTab, setActiveTab] = useState<"home" | "game" | "plugins" | "settings">("home");
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [kidThemeMode, setKidThemeMode] = useState<"magical" | "cyber" | "candy" | "retro">("magical");
  const [selectedAvatar, setSelectedAvatar] = useState<string>("dino");
  const [gameSpeed, setGameSpeed] = useState<"gentle" | "brave" | "speedster">("brave");
  const [activeLevelNumber, setActiveLevelNumber] = useState<number>(1);
  const [completedGameLevels, setCompletedGameLevels] = useState<Record<number, number>>({
    1: 3,
    2: 2,
    3: 1,
  });
  const [activeSkillId, setActiveSkillId] = useState<string>("stage_counting");
  const [studioMode, setStudioMode] = useState<"manipulatives" | "quickmath">("manipulatives");
  const [activeTopic, setActiveTopic] = useState<TopicCategory>("number_bonds");
  const [problemIndex, setProblemIndex] = useState(0);

  const [stageStars, setStageStars] = useState<Record<string, number>>({
    stage_counting: 3,
    stage_sorting: 2,
    stage_comparing: 2,
    stage_number_bonds: 3,
    stage_addition: 2,
    stage_subtraction: 1,
    stage_baseten: 2,
    stage_multiplication: 0,
    stage_fractions: 0,
  });

  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isLiveVoiceOpen, setIsLiveVoiceOpen] = useState(false);
  const [soraState, setSoraState] = useState<"thinking" | "speaking" | "listening" | "cheering" | "idle">("idle");
  const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);
  const [isConceptsOpen, setIsConceptsOpen] = useState(false);
  const [whiteboardLoading, setWhiteboardLoading] = useState(false);
  const [whiteboardFeedback, setWhiteboardFeedback] = useState<string | null>(null);

  const [userProgress, setUserProgress] = useState<UserProgress>({
    xp: 420,
    level: 3,
    streakDays: 5,
    problemsSolved: 12,
    dailyGoal: 5,
    dailySolved: 3,
    unlockedSkills: ["number_bonds", "base_ten_blocks", "time_and_money", "balance_equations", "fraction_lab", "spatial_puzzles"],
    masteryByTopic: {
      number_bonds: 90,
      base_ten_blocks: 80,
      time_and_money: 75,
      balance_equations: 85,
      fraction_lab: 60,
      spatial_puzzles: 40,
      exponent_growth: 10,
      coordinate_quest: 0,
      logic_matrix: 0,
    },
    recentBadges: ["Scale Master", "Socratic Thinker", "Fraction Architect", "Number Bond Champion"],
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "m_1",
      sender: "koda",
      text: "Welcome to Synthesis Tutor! I'm Koda, your AI math coach. Let's build intuitive visual mental models together. Take a look at the interactive manipulative on screen!",
      timestamp: new Date(),
    },
  ]);

  const [isLoadingChat, setIsLoadingChat] = useState(false);

  // Get active problem
  const currentProblemsList = SAMPLE_PROBLEMS[activeTopic] || SAMPLE_PROBLEMS.number_bonds || SAMPLE_PROBLEMS.balance_equations;
  const currentProblem: ProblemItem = currentProblemsList[problemIndex] || currentProblemsList[0];

  // Helper: Call Gemini TTS voice audio with browser speech fallback
  const speakText = async (text: string) => {
    if (!voiceEnabled || !text) return;
    try {
      setSoraState("speaking");
      const customApiKey = localStorage.getItem("custom_gemini_api_key") || "";
      const res = await fetch("/api/tutor/speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice: "Kore", customApiKey }),
      });
      const data = await res.json();
      if (data && data.audio) {
        playBase64Pcm(data.audio);
      } else {
        speakWebSpeech(text);
      }
    } catch {
      speakWebSpeech(text);
    } finally {
      setTimeout(() => setSoraState("idle"), 2500);
    }
  };

  // Helper: Call Socratic Tutor API Endpoint with full graceful fallback
  const sendToSora = async (userMessage: string, currentState?: any) => {
    setIsLoadingChat(true);
    setSoraState("thinking");

    // Add user message to feed
    const studentMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: "student",
      text: userMessage,
      timestamp: new Date(),
    };
    setChatMessages((prev) => [...prev, studentMsg]);

    try {
      const customApiKey = localStorage.getItem("custom_gemini_api_key") || "";
      const res = await fetch("/api/tutor/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problem: currentProblem,
          state: currentState || {},
          userMessage,
          history: chatMessages.slice(-4),
          topic: activeTopic,
          customApiKey,
        }),
      });

      let data: any = null;
      if (res.ok) {
        data = await res.json();
      } else {
        data = generateLocalSocraticResponse(currentProblem, userMessage, currentState, activeTopic);
      }

      if (!data || !data.replyText) {
        data = generateLocalSocraticResponse(currentProblem, userMessage, currentState, activeTopic);
      }

      const soraMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: "sora",
        text: data.replyText || "Let's explore this step carefully together!",
        timestamp: new Date(),
        hintType: data.hintType,
        xpEarned: data.xpEarned || 0,
      };

      setChatMessages((prev) => [...prev, soraMsg]);

      if (data.isCorrect) {
        setSoraState("cheering");
        playSound("levelup");
        // Award XP & Increment Daily Solved
        setUserProgress((prev) => ({
          ...prev,
          xp: prev.xp + (data.xpEarned || 50),
          problemsSolved: prev.problemsSolved + 1,
          dailySolved: prev.dailySolved + 1,
        }));
      } else {
        setSoraState("speaking");
      }

      if (data.audioSpeechText) {
        speakText(data.audioSpeechText);
      } else {
        speakText(data.replyText);
      }
    } catch {
      // Local fallback on any network error
      const fallbackData = generateLocalSocraticResponse(currentProblem, userMessage, currentState, activeTopic);
      const soraMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: "sora",
        text: fallbackData.replyText,
        timestamp: new Date(),
        hintType: fallbackData.hintType,
        xpEarned: fallbackData.xpEarned,
      };
      setChatMessages((prev) => [...prev, soraMsg]);

      if (fallbackData.isCorrect) {
        setSoraState("cheering");
        playSound("levelup");
        setUserProgress((prev) => ({
          ...prev,
          xp: prev.xp + (fallbackData.xpEarned || 50),
          problemsSolved: prev.problemsSolved + 1,
          dailySolved: prev.dailySolved + 1,
        }));
      } else {
        setSoraState("speaking");
      }

      speakText(fallbackData.audioSpeechText || fallbackData.replyText);
    } finally {
      setIsLoadingChat(false);
    }
  };

  // Action: Request Socratic hint
  const handleRequestHint = () => {
    const hint =
      currentProblem.socraticHints[
        Math.floor(Math.random() * currentProblem.socraticHints.length)
      ] || "Look closely at how changing one part affects the whole visual model!";
    sendToSora(`Koda, can you give me a Socratic hint about ${currentProblem.title}?`);
  };

  // Action: Manipulative solve attempt
  const handleSolveAttempt = (attemptValue: any) => {
    sendToSora(
      `I tested a configuration on the visual manipulative: ${JSON.stringify(attemptValue)}. Does this balance or solve the problem?`
    );
  };

  // Action: Whiteboard Drawing Analysis
  const handleAnalyzeDrawing = async (imageBase64: string) => {
    setWhiteboardLoading(true);
    try {
      const customApiKey = localStorage.getItem("custom_gemini_api_key") || "";
      const res = await fetch("/api/tutor/analyze-drawing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64,
          currentProblem,
          customApiKey,
        }),
      });
      const data = await res.json();
      setWhiteboardFeedback(data.feedback);

      // Add feedback to chat as well
      const soraMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: "sora",
        text: `🎨 Whiteboard Work Analysis:\n${data.feedback}`,
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, soraMsg]);
      speakText("I reviewed your scratchpad drawing!");
    } catch (e) {
      setWhiteboardFeedback("Could not analyze drawing. Try drawing clearly with the pen!");
    } finally {
      setWhiteboardLoading(false);
    }
  };

  const parentReport: ParentDiagnosticReport = {
    studentName: "Alex",
    totalTimeMinutes: 42,
    conceptMasteryScore: 78,
    topStrengths: [
      "Subtractive equality on algebraic balance scales",
      "Converting improper fraction slices to mixed numbers",
      "Spatial area scaling and perimeter constraints",
    ],
    growthAreas: [
      "Combining fractions with non-common denominators",
      "Exponential growth rates with fractional powers",
    ],
    aiCoachSummary:
      "Alex shows high engagement and physical intuition when interacting with the balance scale. When presented with 2x + 2 = 6, Alex immediately removed equal weights from both pans before dividing. Recommended focus: practice non-unit fraction additions in Fraction Lab.",
    sessionLog: [
      {
        date: "Today, 20:10",
        topic: "balance_equations",
        problemTitle: "The Mystery Weight of Box X",
        status: "Mastered",
        soraInsights: "Solved in 2 steps via subtractive balance reasoning.",
      },
      {
        date: "Today, 19:45",
        topic: "fraction_lab",
        problemTitle: "The Great Pizza Slice Challenge",
        status: "In Progress",
        soraInsights: "Recognized 2/8 = 1/4 equivalency visually.",
      },
    ],
  };

  const countingHost = (
    <PluginHost
      activityRef="counting/quest"
      params={{ level: activeLevelNumber }}
      level={activeLevelNumber}
      snapshot={userProgress}
      onExit={() => setActiveTab("home")}
      onAwardXp={(earnedXp) =>
        setUserProgress((prev) => ({ ...prev, xp: prev.xp + earnedXp }))
      }
      onComplete={(result) => {
        setUserProgress((prev) => ({
          ...prev,
          problemsSolved: prev.problemsSolved + 1,
          dailySolved: prev.dailySolved + 1,
        }));
        setCompletedGameLevels((prev) => ({
          ...prev,
          [result.levelNumber]: result.stars,
        }));
      }}
    />
  );

  return (
    <MainLayout
      contained={activeTab !== "game"}
      sidebar={
        <SidebarNav
          activeTab={activeTab}
          onSelectTab={(tab) => setActiveTab(tab)}
          userProgress={userProgress}
          voiceEnabled={voiceEnabled}
          onToggleVoice={() => setVoiceEnabled(!voiceEnabled)}
          onOpenLiveVoice={() => setIsLiveVoiceOpen(true)}
          onOpenWhiteboard={() => setIsWhiteboardOpen(true)}
          onOpenLexicon={() => setIsConceptsOpen(true)}
        />
      }
    >
      <>
        {/* TAB 1: THE COUNTING SKILL — inside the shell, so the sidebar stays
            reachable mid-lesson. contained={false} lets it use the full width. */}
        {activeTab === "game" && countingHost}

        {/* TAB 0: CREATIVE LEARNING PATHWAY HOME HUB */}
          {activeTab === "home" && (
            <Home
              userProgress={userProgress}
              activeLevelNumber={activeLevelNumber}
              completedLevels={completedGameLevels}
              onStartLearning={(targetLevel) => {
                if (targetLevel) {
                  setActiveLevelNumber(targetLevel);
                }
                setActiveTab("game");
              }}
            />
          )}

          {/* TAB: PLUGIN MANAGER — its own destination, not buried in Settings */}
          {activeTab === "plugins" && <PluginManagerPage />}

          {/* TAB 2: CLUBHOUSE SETTINGS PAGE FOR KIDS */}
          {activeTab === "settings" && (
            <SettingsPage
              soundEnabled={soundEnabled}
              onToggleSound={() => setSoundEnabled(!soundEnabled)}
              voiceEnabled={voiceEnabled}
              onToggleVoice={() => setVoiceEnabled(!voiceEnabled)}
              kidThemeMode={kidThemeMode}
              onSelectKidTheme={setKidThemeMode}
              selectedAvatar={selectedAvatar}
              onSelectAvatar={setSelectedAvatar}
              gameSpeed={gameSpeed}
              onSelectGameSpeed={setGameSpeed}
              userProgress={userProgress}
            />
          )}
      </>

      {/* Whiteboard Modal Scratchpad */}
      <WhiteboardModal
        isOpen={isWhiteboardOpen}
        onClose={() => setIsWhiteboardOpen(false)}
        currentProblemTitle={currentProblem.title}
        onAnalyzeDrawing={handleAnalyzeDrawing}
        isLoading={whiteboardLoading}
        aiFeedback={whiteboardFeedback}
      />

      {/* Math Concepts Lexicon Modal */}
      <MathConceptsModal
        isOpen={isConceptsOpen}
        onClose={() => setIsConceptsOpen(false)}
      />

      {/* Global Gemini Live Voice Coach Modal */}
      <LiveVoiceCoachModal
        isOpen={isLiveVoiceOpen}
        onClose={() => setIsLiveVoiceOpen(false)}
        currentLevel={userProgress.level}
        currentTopic="Creative Learning Pathway Home Hub"
        currentQuestionText={currentProblem.title}
        currentProblemContext={`Student is exploring the ${activeTab} section of Synthesis Tutor. Active topic: ${activeTopic}. Current problem: ${currentProblem.title}.`}
        studentName="Student"
        onAwardXp={(earnedXp) => {
          setUserProgress((prev) => ({
            ...prev,
            xp: prev.xp + earnedXp,
          }));
        }}
      />
    </MainLayout>
  );
}
