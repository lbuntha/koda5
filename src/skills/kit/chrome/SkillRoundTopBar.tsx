import React, { Suspense, lazy, useEffect, useState } from "react";
import {
  Coins,
  Flame,
  Maximize2,
  Mic,
  Minimize2,
  ScrollText,
  X,
} from "lucide-react";
import { UILessonIcon, UISpinner } from "../../../components/ui";
import { LiveVoiceCoachModal } from "../../../components/LiveVoiceCoachModal";
import type { KodaSDK } from "../../types";

/**
 * This skill's activity log, opened from inside its round.
 *
 * The trail alone, not the whole skill page: mid-round the question is "what
 * did this skill just do?", and features, settings and lessons all live on the
 * Skills page where there is room for them.
 *
 * Loaded lazily because that module imports the skill registry — which imports
 * the skills, which import this bar. Deferring keeps the cycle off the
 * module-eval path instead of relying on hoisting order.
 */
const ActivityTrail = lazy(() =>
  import("../../../components/skills/SkillManagerPage").then((m) => ({
    default: m.ActivityTrail,
  })),
);

/** Round context the voice coach needs to talk about the current question. */
export interface SkillVoiceContext {
  topic: string;
  questionText: string;
  problemContext: string;
  onAwardXp(xp: number): void;
  onNextQuestion(): void;
}

export interface SkillRoundTopBarProps {
  /** Bound SDK. The bar reads the learner's standing and the skill's name from it. */
  koda: KodaSDK;
  /** Lesson identity, as the learner sees it. */
  title: string;
  subtitle?: string;
  levelNumber?: number;
  /** Lesson icon name, resolved through the shared `lessonIcons` registry. */
  iconName?: string;
  iconTone?: string;
  /** 1-based. */
  questionIndex: number;
  totalQuestions: number;
  onExit(): void;
  /**
   * Replaces the identity pill. For a skill whose title is also a control —
   * counting's opens its level picker — rather than plain text.
   */
  identity?: React.ReactNode;
  /** Supply it and the round gets the voice coach. Omit it and the pill is hidden. */
  voice?: SkillVoiceContext;
  /** Extra controls, placed before the sound toggle. Rarely needed. */
  extras?: React.ReactNode;
}

/**
 * The bar every round wears.
 *
 * Everything standard is built in — the learner's standing, the voice coach,
 * skill settings, fullscreen and the way out — so a skill gets the whole
 * toolbar by rendering this, not by wiring the buttons itself.
 *
 * No mute here: every question already carries its own read-aloud button, and
 * the app-wide Sound FX switch lives in Settings, which `playSound` honours on
 * its own. A third control for the same thing was one a child could hit by
 * accident and not understand. That is the
 * point: when each skill assembled its own, counting showed invented coins and
 * addition showed none, and the two rounds stopped looking like one product.
 *
 * A skill supplies only what is genuinely its own: which lesson is running, how
 * far through it is, and — if its title is a control — the identity pill.
 */
export const SkillRoundTopBar: React.FC<SkillRoundTopBarProps> = ({
  koda,
  title,
  subtitle,
  levelNumber,
  iconName,
  iconTone,
  questionIndex,
  totalQuestions,
  onExit,
  identity,
  voice,
  extras,
}) => {
  const percent = Math.min(100, Math.round((questionIndex / Math.max(1, totalQuestions)) * 100));

  const [standing, setStanding] = useState<{ streakDays: number; xp: number } | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showVoice, setShowVoice] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Read once per round: the numbers move when a round ends, not mid-question.
  useEffect(() => {
    void koda.progress.snapshot().then((s) => setStanding({ streakDays: s.streakDays, xp: s.xp }));
  }, [koda]);

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen().catch(() => undefined);
  };

  const iconButton =
    "p-2 min-w-[40px] min-h-[40px] rounded-xl text-muted hover:text-ink hover:bg-surface-muted transition shrink-0 flex items-center justify-center cursor-pointer";
  /** Bigger target, because on a phone a child is aiming with a thumb. */
  const compactButton =
    "p-2 min-w-[44px] min-h-[44px] rounded-xl bg-surface border border-line text-muted flex items-center justify-center shrink-0 cursor-pointer";

  return (
    <>
      {/*
        Two shapes, one bar.

        Narrow: identity on top with only the controls a child needs mid-round
        (sound, leave), and the progress bar spanning the full width below it,
        where a thumb is not covering it. Wide: everything on one row, with the
        adult controls — settings, fullscreen — appearing only once there is
        room for them. A five-year-old on a phone should not be one mis-tap from
        the Skill Manager.
      */}
      <header className="px-2.5 sm:px-4 py-2 sm:py-2.5 bg-canvas/90 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-5xl mx-auto flex flex-col gap-1.5 sm:gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Top row on narrow screens: which lesson, and the way out */}
          <div className="flex items-center justify-between gap-2 min-w-0 sm:flex-initial sm:justify-start">
            {identity ?? (
              <div className="flex items-center gap-2 min-w-0">
                <UILessonIcon name={iconName} tone={iconTone} variant="bare" size="sm" />
                <div className="min-w-0">
                  <span className="block text-xs font-black text-ink font-mono truncate max-w-[160px] xs:max-w-[220px] sm:max-w-[280px]">
                    {levelNumber ? `L${levelNumber}: ` : ""}
                    {title}
                  </span>
                  {subtitle && (
                    <span className="hidden md:block text-[10px] text-muted font-medium truncate max-w-[260px]">
                      {subtitle}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* The controls a child uses, kept reachable on every width */}
            <div className="flex items-center gap-1 shrink-0 sm:hidden">
              {voice && (
                <button
                  onClick={() => {
                    koda.sound.play("pop");
                    setShowVoice(true);
                  }}
                  className="p-2 min-w-[44px] min-h-[44px] rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 cursor-pointer"
                  title="Talk to Koda with Live Voice"
                  aria-label="Talk to Koda with Live Voice"
                >
                  <Mic className="w-4 h-4 animate-pulse" />
                </button>
              )}
              <button
                onClick={onExit}
                className="p-2 min-w-[44px] min-h-[44px] rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 cursor-pointer"
                title="Leave this round"
                aria-label="Leave this round"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Progress: full width underneath on narrow, centred on wide */}
          <div className="flex items-center gap-2 w-full sm:w-auto sm:flex-col sm:gap-1 sm:min-w-[160px] shrink-0">
            <div className="flex items-center justify-between gap-2 sm:w-full text-[10px] sm:text-[11px] font-mono font-bold text-muted shrink-0">
              <span className="whitespace-nowrap">
                <span className="hidden xs:inline">Q </span>
                {questionIndex}/{totalQuestions}
              </span>
              <span className="text-slate-800 dark:text-amber-400 sm:ml-1">{percent}%</span>
            </div>
            <div
              // `sm:flex-none` matters: the row becomes a column at sm, where
              // `flex-1` would set flex-basis on the height and collapse the bar
              // to nothing.
              className="flex-1 sm:flex-none sm:w-full h-1.5 sm:h-2 bg-surface-muted rounded-full overflow-hidden"
              role="progressbar"
              aria-valuenow={percent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Round progress"
            >
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-300"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>

          {/* Wide only: standing, then every control */}
          <div className="hidden sm:flex items-center gap-1 sm:gap-2 shrink-0">
            <div className="hidden lg:flex items-center gap-2 bg-surface/60 px-2 py-1 rounded-xl text-xs font-mono">
              <div
                className="flex items-center gap-1 text-orange-700 dark:text-orange-400"
                title="Day streak"
              >
                <Flame className="w-3.5 h-3.5 fill-orange-400" />
                <span className="font-bold tabular-nums">{standing?.streakDays ?? 0}</span>
              </div>
              <div className="flex items-center gap-1 text-slate-800 dark:text-amber-400" title="XP">
                <Coins className="w-3.5 h-3.5" />
                <span className="font-bold tabular-nums">{standing?.xp ?? 0}</span>
              </div>
            </div>

            {voice && (
              <button
                onClick={() => {
                  koda.sound.play("pop");
                  setShowVoice(true);
                }}
                className="flex items-center gap-1 px-3 py-2 min-h-[40px] rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition transform active:scale-95 shrink-0 cursor-pointer"
                title="Talk to Koda with Live Voice"
                aria-label="Talk to Koda with Live Voice"
              >
                <Mic className="w-3.5 h-3.5 text-slate-950 animate-pulse" />
                <span className="hidden md:inline">Voice</span>
              </button>
            )}

            {extras}

            <button
              onClick={() => {
                koda.sound.play("pop");
                setShowSettings(true);
              }}
              className={iconButton}
              title="Activity log"
              aria-label="Activity log"
            >
              <ScrollText className="w-4 h-4 text-slate-800 dark:text-amber-400" />
            </button>

            <button
              onClick={toggleFullscreen}
              className={`${iconButton} hidden md:flex`}
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4 text-slate-800 dark:text-amber-400" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={onExit}
              className="p-2 min-w-[40px] min-h-[40px] rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition shrink-0 flex items-center justify-center cursor-pointer"
              title="Leave this round"
              aria-label="Leave this round"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {showSettings && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-start justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn">
          <div className="bg-surface border-2 border-line rounded-3xl max-w-4xl w-full p-4 sm:p-6 max-h-[92vh] overflow-y-auto custom-scrollbar shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-line">
              <h3 className="text-sm sm:text-base font-black text-ink font-mono">
                Activity log
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                className={iconButton}
                aria-label="Close settings"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <Suspense fallback={<UISpinner />}>
              <ActivityTrail skillId={koda.skillId} />
            </Suspense>
          </div>
        </div>
      )}

      {voice && (
        <LiveVoiceCoachModal
          isOpen={showVoice}
          onClose={() => setShowVoice(false)}
          currentLevel={levelNumber ?? 1}
          currentTopic={voice.topic}
          currentQuestionText={voice.questionText}
          currentQuestionIndex={questionIndex}
          totalQuestions={totalQuestions}
          currentProblemContext={voice.problemContext}
          studentName="Math Explorer"
          onAwardXp={voice.onAwardXp}
          onNextQuestion={voice.onNextQuestion}
        />
      )}
    </>
  );
};
