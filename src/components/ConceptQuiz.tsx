import React, { useState } from "react";
import { TopicCategory, UserProgress } from "../types";
import { CONCEPT_QUIZZES, ConceptQuizQuestion } from "../data/conceptQuizData";
import {
  Award,
  CheckCircle,
  XCircle,
  HelpCircle,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Lightbulb,
  Brain,
  CircleDot,
  Layers,
  Clock,
  Scale,
  PieChart,
  Box,
  Zap,
  Compass,
  Cpu,
  ArrowRight,
  Bot,
} from "lucide-react";
import { playSound } from "../utils/audio";

interface ConceptQuizProps {
  userProgress: UserProgress;
  defaultTopic?: TopicCategory;
  onCompleteQuiz?: (topic: TopicCategory, score: number, total: number, earnedXp: number) => void;
  onBackToInsights?: () => void;
  onOpenCountingLab?: () => void;
}

const TOPIC_ICONS: Record<string, React.FC<{ className?: string }>> = {
  CircleDot: (props) => <CircleDot {...props} />,
  Layers: (props) => <Layers {...props} />,
  Clock: (props) => <Clock {...props} />,
  Scale: (props) => <Scale {...props} />,
  PieChart: (props) => <PieChart {...props} />,
  Box: (props) => <Box {...props} />,
  Zap: (props) => <Zap {...props} />,
  Compass: (props) => <Compass {...props} />,
  Cpu: (props) => <Cpu {...props} />,
};

export const ConceptQuiz: React.FC<ConceptQuizProps> = ({
  userProgress,
  defaultTopic = "balance_equations",
  onCompleteQuiz,
  onBackToInsights,
  onOpenCountingLab,
}) => {
  const [selectedTopic, setSelectedTopic] = useState<TopicCategory>(defaultTopic);
  const [gradeFilter, setGradeFilter] = useState<"all" | "g1_2" | "upper">("all");
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);
  const [awardedXp, setAwardedXp] = useState<number>(0);
  const [aiAssistantEnabled, setAiAssistantEnabled] = useState<boolean>(false);
  const [showAiHint, setShowAiHint] = useState<boolean>(false);

  const topicQuiz = CONCEPT_QUIZZES[selectedTopic];
  const questions = topicQuiz.questions;
  const currentQuestion: ConceptQuizQuestion = questions[currentQuestionIdx];

  // Calculate score
  const correctCount = userAnswers.reduce((acc, ansIdx, qIdx) => {
    return ansIdx === questions[qIdx].correctIndex ? acc + 1 : acc;
  }, 0);

  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    playSound("pop");
    setSelectedOption(idx);
    setIsAnswerSubmitted(true);

    const isCorrect = idx === currentQuestion.correctIndex;
    if (isCorrect) {
      playSound("success");
    } else {
      playSound("error");
    }

    const nextAnswers = [...userAnswers, idx];
    setUserAnswers(nextAnswers);
  };

  const handleNextQuestion = () => {
    playSound("pop");
    setShowAiHint(false);
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      // Finished all 3 questions
      const finalScore = userAnswers.reduce((acc, ansIdx, qIdx) => {
        return ansIdx === questions[qIdx].correctIndex ? acc + 1 : acc;
      }, 0);

      // XP calculation: 10 XP per correct question + 15 bonus for 3/3
      const totalEarnedXp = finalScore * 10 + (finalScore === questions.length ? 15 : 0);
      setAwardedXp(totalEarnedXp);
      setQuizFinished(true);
      playSound("levelup");

      if (onCompleteQuiz) {
        onCompleteQuiz(selectedTopic, finalScore, questions.length, totalEarnedXp);
      }
    }
  };

  const handleRestartTopic = (topic: TopicCategory) => {
    playSound("pop");
    setSelectedTopic(topic);
    setCurrentQuestionIdx(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setUserAnswers([]);
    setQuizFinished(false);
    setAwardedXp(0);
    setShowAiHint(false);
  };

  const allTopics = Object.keys(CONCEPT_QUIZZES) as TopicCategory[];
  const filteredTopics = allTopics.filter((t) => {
    const quiz = CONCEPT_QUIZZES[t];
    if (gradeFilter === "all") return true;
    if (gradeFilter === "g1_2") {
      return quiz.gradeLevel.includes("Grade 1") || quiz.gradeLevel.includes("Grade 2");
    }
    if (gradeFilter === "upper") {
      return quiz.gradeLevel.includes("Grades 3") || quiz.gradeLevel.includes("Grades 4") || quiz.gradeLevel.includes("Grades 5");
    }
    return true;
  });

  const currentTopicMastery = userProgress.masteryByTopic[selectedTopic] || 0;

  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 bg-[#0a0a0a] rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-400">
              Socratic Concept Mastery Check
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight flex items-center gap-2.5">
            <Brain className="w-7 h-7 text-cyan-400" />
            Concept <span className="text-cyan-400">Quiz</span> Mode
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Answer 3 targeted conceptual questions after completing a topic to reinforce mathematical principles & earn mastery XP.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 shrink-0">
          <button
            onClick={() => {
              playSound("pop");
              setAiAssistantEnabled(!aiAssistantEnabled);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold border transition flex items-center gap-2 ${
              aiAssistantEnabled
                ? "bg-purple-500/20 text-purple-300 border-purple-400/40 shadow-[0_0_12px_rgba(168,85,247,0.3)]"
                : "bg-white/5 text-gray-400 hover:text-gray-200 border-white/10"
            }`}
          >
            <Bot className="w-4 h-4 text-purple-400" />
            <span>AI Tutor: {aiAssistantEnabled ? "Active" : "Optional / On-Demand"}</span>
          </button>

          {onBackToInsights && (
            <button
              onClick={onBackToInsights}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl text-xs font-mono font-bold border border-white/10 transition"
            >
              ← Back to Telemetry
            </button>
          )}
        </div>
      </div>

      {/* Counting Skills Progression Lab Spotlight Banner */}
      {onOpenCountingLab && (
        <div className="p-4 bg-gradient-to-r from-cyan-950/60 via-purple-950/40 to-black rounded-2xl border border-cyan-400/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-[0_0_20px_rgba(34,211,238,0.15)]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-400 text-black rounded-xl font-mono font-black text-sm shrink-0 shadow-md">
              1➔4
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                Counting Skills: Beginner to Master Suite <span className="text-[10px] font-mono text-cyan-300 bg-cyan-400/20 px-2 py-0.5 rounded border border-cyan-400/30">NEW</span>
              </h4>
              <p className="text-xs text-gray-300 mt-0.5">
                Explore the complete 4-tier counting continuum: Subitizing ➔ Skip Trails ➔ Base-10 Bundling ➔ Combinatorics.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playSound("pop");
              onOpenCountingLab();
            }}
            className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-black font-bold font-mono text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-1.5 shadow-[0_0_12px_rgba(34,211,238,0.3)] shrink-0"
          >
            Launch Counting Lab <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Topic Curriculum Switcher Bar */}
      <div className="p-4 bg-[#0a0a0a] rounded-2xl border border-white/10 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-2.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono uppercase tracking-wider text-gray-400 mr-2">
              Select Topic:
            </span>
            <button
              onClick={() => setGradeFilter("all")}
              className={`px-2.5 py-1 text-xs font-mono font-semibold rounded-lg transition ${
                gradeFilter === "all" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40" : "text-gray-400 hover:text-white"
              }`}
            >
              All Grades
            </button>
            <button
              onClick={() => setGradeFilter("g1_2")}
              className={`px-2.5 py-1 text-xs font-mono font-semibold rounded-lg transition ${
                gradeFilter === "g1_2" ? "bg-purple-500/20 text-purple-300 border border-purple-500/40" : "text-gray-400 hover:text-white"
              }`}
            >
              Grades 1 & 2
            </button>
            <button
              onClick={() => setGradeFilter("upper")}
              className={`px-2.5 py-1 text-xs font-mono font-semibold rounded-lg transition ${
                gradeFilter === "upper" ? "bg-blue-500/20 text-blue-300 border border-blue-500/40" : "text-gray-400 hover:text-white"
              }`}
            >
              Grades 3–6
            </button>
          </div>

          <div className="text-[11px] font-mono text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/30 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5" />
            <span>Up to +45 XP per Quiz</span>
          </div>
        </div>

        {/* Topic Pills Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {filteredTopics.map((topicKey) => {
            const quiz = CONCEPT_QUIZZES[topicKey];
            const isSelected = selectedTopic === topicKey;
            const mastery = userProgress.masteryByTopic[topicKey] || 0;
            const IconComp = TOPIC_ICONS[quiz.iconName] || CircleDot;

            return (
              <button
                key={topicKey}
                onClick={() => handleRestartTopic(topicKey)}
                className={`p-3 rounded-xl border text-left transition flex items-center justify-between gap-3 ${
                  isSelected
                    ? "bg-cyan-500/15 border-cyan-400/60 shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                    : "bg-black/40 border-white/5 hover:border-white/20 text-gray-400 hover:text-gray-200"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`p-2 rounded-lg ${
                      isSelected ? "bg-cyan-400 text-black" : "bg-white/5 text-gray-300"
                    }`}
                  >
                    <IconComp className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className={`text-xs font-bold truncate ${isSelected ? "text-white" : "text-gray-300"}`}>
                      {quiz.topicName}
                    </h4>
                    <span className="text-[10px] font-mono text-gray-500">{quiz.gradeLevel}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end shrink-0">
                  <span className="text-[10px] font-mono font-bold text-emerald-400">{mastery}%</span>
                  <span className="text-[9px] text-gray-500 uppercase">Mastery</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Quiz Card */}
      {!quizFinished ? (
        <div className="p-6 sm:p-8 bg-[#0a0a0a] rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl space-y-6">
          {/* Quiz Top Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-cyan-400/10 text-cyan-400 border border-cyan-400/30 rounded-lg text-xs font-mono font-bold uppercase tracking-wider">
                Question {currentQuestionIdx + 1} of {questions.length}
              </span>
              <span className="text-xs text-gray-400 font-mono">
                Topic: <strong className="text-white">{topicQuiz.topicName}</strong>
              </span>
            </div>

            {/* Progress Dots & Optional AI Hint */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  playSound("pop");
                  setShowAiHint(!showAiHint);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 ${
                  showAiHint
                    ? "bg-purple-500/30 text-purple-300 border border-purple-400"
                    : "bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10"
                }`}
              >
                <Bot className="w-3.5 h-3.5 text-purple-400" />
                <span>{showAiHint ? "Hide Hint" : "Ask Koda"}</span>
              </button>

              <div className="flex items-center gap-1.5">
                {questions.map((_, idx) => {
                  const isAnswered = idx < userAnswers.length;
                  const isCorrect = isAnswered && userAnswers[idx] === questions[idx].correctIndex;
                  const isCurrent = idx === currentQuestionIdx;

                  return (
                    <div
                      key={idx}
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all ${
                        isCurrent
                          ? "border-2 border-cyan-400 text-cyan-300 bg-cyan-950/60 scale-110"
                          : isAnswered
                          ? isCorrect
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                            : "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                          : "bg-white/5 text-gray-500 border border-white/10"
                      }`}
                    >
                      {isAnswered ? (
                        isCorrect ? (
                          <CheckCircle className="w-3.5 h-3.5" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5" />
                        )
                      ) : (
                        idx + 1
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Socratic Hint Drawer (When requested) */}
          {showAiHint && (
            <div className="p-4 bg-purple-950/30 rounded-2xl border border-purple-500/40 space-y-1.5 animate-fadeIn">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-purple-300 uppercase">
                <Lightbulb className="w-3.5 h-3.5 text-purple-400" />
                <span>Koda's Guiding Socratic Hint:</span>
              </div>
              <p className="text-xs text-gray-200 leading-relaxed font-sans">
                Think carefully about the foundational principle behind <strong>{currentQuestion.conceptKey}</strong>. What happens when you decompose or anchor to a friendly benchmark like 10?
              </p>
            </div>
          )}

          {/* Question Focus & Prompt */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-px w-6 bg-cyan-400" />
              <span className="text-cyan-400 uppercase tracking-[0.2em] text-[10px] font-bold font-mono">
                {currentQuestion.conceptKey}
              </span>
            </div>

            <h3 className="text-base sm:text-xl font-bold text-white leading-relaxed font-sans">
              {currentQuestion.question}
            </h3>

            {/* Visual Clue Box (if provided) */}
            {currentQuestion.visualClue && (
              <div className="p-4 bg-black/60 rounded-2xl border border-cyan-400/20 font-mono text-xs sm:text-sm text-cyan-300 whitespace-pre-wrap shadow-inner">
                <div className="flex items-center gap-1.5 text-[10px] text-gray-400 uppercase tracking-widest mb-1.5 font-bold">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> Visual Representation Clue:
                </div>
                {currentQuestion.visualClue}
              </div>
            )}
          </div>

          {/* 4 Interactive Multiple-Choice Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {currentQuestion.options.map((optionText, optIdx) => {
              const isSelected = selectedOption === optIdx;
              const isCorrect = optIdx === currentQuestion.correctIndex;
              const showResult = isAnswerSubmitted;

              let btnStyle = "bg-white/5 border-white/10 hover:border-cyan-400/40 hover:bg-white/10 text-gray-200";

              if (showResult) {
                if (isCorrect) {
                  btnStyle = "bg-emerald-500/20 border-emerald-500/80 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.3)] font-bold";
                } else if (isSelected && !isCorrect) {
                  btnStyle = "bg-rose-500/20 border-rose-500/80 text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.3)]";
                } else {
                  btnStyle = "bg-black/40 border-white/5 text-gray-500 opacity-60";
                }
              }

              return (
                <button
                  key={optIdx}
                  onClick={() => handleSelectOption(optIdx)}
                  disabled={isAnswerSubmitted}
                  className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3 relative group ${btnStyle}`}
                >
                  <span
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-mono font-bold shrink-0 transition ${
                      showResult
                        ? isCorrect
                          ? "bg-emerald-400 text-black"
                          : isSelected
                          ? "bg-rose-500 text-white"
                          : "bg-white/10 text-gray-400"
                        : "bg-white/10 text-gray-300 group-hover:bg-cyan-400 group-hover:text-black"
                    }`}
                  >
                    {String.fromCharCode(65 + optIdx)}
                  </span>

                  <span className="text-xs sm:text-sm font-medium leading-normal flex-1">
                    {optionText}
                  </span>

                  {showResult && isCorrect && (
                    <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  )}
                  {showResult && isSelected && !isCorrect && (
                    <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Socratic Explanation Box (Revealed after answering) */}
          {isAnswerSubmitted && (
            <div className="p-5 bg-gradient-to-r from-cyan-950/40 via-cyan-900/20 to-black rounded-2xl border border-cyan-400/30 space-y-3 animate-fadeIn">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300">
                  Koda's Concept Diagnostic & Explanation:
                </h4>
              </div>
              <p className="text-xs sm:text-sm text-gray-200 leading-relaxed font-sans">
                {currentQuestion.explanation}
              </p>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleNextQuestion}
                  className="px-6 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-black font-bold font-mono text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-2 shadow-[0_0_15px_rgba(34,211,238,0.4)]"
                >
                  {currentQuestionIdx < questions.length - 1 ? "Next Question" : "See Quiz Results"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Completed Quiz Results Screen */
        <div className="p-6 sm:p-8 bg-[#0a0a0a] rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl space-y-6 text-center animate-fadeIn">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-cyan-400/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.3)]">
            <Award className="w-8 h-8" />
          </div>

          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-400 block mb-1">
              Quiz Completed • {topicQuiz.topicName}
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              {correctCount === 3
                ? "🌟 Concept Mastered!"
                : correctCount === 2
                ? "💡 Proficient Understanding"
                : "🚀 Keep Exploring & Practicing"}
            </h3>
            <p className="text-xs sm:text-sm text-gray-400 mt-2 max-w-md mx-auto">
              You scored <strong className="text-white">{correctCount} of 3</strong> correct on the conceptual check.
            </p>
          </div>

          {/* XP & Mastery Rewards Box */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto font-mono">
            <div className="p-4 bg-black/60 rounded-2xl border border-amber-400/30">
              <span className="text-[10px] uppercase text-gray-400 block">XP Earned</span>
              <span className="text-2xl font-bold text-amber-400">+{awardedXp} XP</span>
            </div>

            <div className="p-4 bg-black/60 rounded-2xl border border-emerald-400/30">
              <span className="text-[10px] uppercase text-gray-400 block">Mastery Score</span>
              <span className="text-2xl font-bold text-emerald-400">
                {Math.min(100, currentTopicMastery + (correctCount === 3 ? 10 : correctCount === 2 ? 5 : 2))}%
              </span>
            </div>

            <div className="p-4 bg-black/60 rounded-2xl border border-cyan-400/30">
              <span className="text-[10px] uppercase text-gray-400 block">Accuracy</span>
              <span className="text-2xl font-bold text-cyan-400">
                {Math.round((correctCount / questions.length) * 100)}%
              </span>
            </div>
          </div>

          {/* Question Review Accordion / Cards */}
          <div className="text-left space-y-3 pt-4 border-t border-white/10 max-w-2xl mx-auto">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400" /> Concept Review & Key Takeaways:
            </h4>

            {questions.map((q, idx) => {
              const isCorrect = userAnswers[idx] === q.correctIndex;
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border text-xs space-y-2 ${
                    isCorrect ? "bg-emerald-950/20 border-emerald-500/30" : "bg-rose-950/20 border-rose-500/30"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold font-mono text-white flex items-center gap-1.5">
                      {isCorrect ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                      Question {idx + 1}: {q.conceptKey}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                        isCorrect
                          ? "bg-emerald-400/20 text-emerald-300"
                          : "bg-rose-400/20 text-rose-300"
                      }`}
                    >
                      {isCorrect ? "Correct" : "Review"}
                    </span>
                  </div>

                  <p className="text-gray-300 font-sans">{q.question}</p>
                  <p className="text-cyan-200/90 font-mono text-[11px] bg-black/40 p-2.5 rounded-xl border border-white/5">
                    💡 <strong>Takeaway:</strong> {q.explanation}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              onClick={() => handleRestartTopic(selectedTopic)}
              className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-xl border border-white/10 transition flex items-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Retake Quiz
            </button>

            <button
              onClick={() => {
                // Advance to next topic
                const currentIdx = allTopics.indexOf(selectedTopic);
                const nextTopic = allTopics[(currentIdx + 1) % allTopics.length];
                handleRestartTopic(nextTopic);
              }}
              className="px-6 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-black font-bold font-mono text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-2 shadow-[0_0_15px_rgba(34,211,238,0.4)]"
            >
              Try Next Topic Quiz <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
