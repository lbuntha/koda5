import React, { useCallback, useEffect, useState } from "react";
import { Rocket } from "lucide-react";
import type { ActivityProps } from "../../types";
import { SkillRound, useSkillRound, type RoundQuestion } from "../../kit";
import { themeSystem } from "../../../lib/themeSystem";

/**
 * Ten-frames: build a number in a frame of ten.
 *
 * Three lessons, three jobs — fill a frame to a target, name what is missing
 * from ten, or build a teen out of a full frame plus ones. Which one is a lesson
 * parameter, so the activity never asks what level it is.
 */

export type TenFrameMode = "fill" | "complement" | "teen";

export interface TenFrameSetup {
  mode?: TenFrameMode;
  /** `fill`: how many cells to light. */
  targetRange?: [number, number];
  /** `complement`: how many arrive already filled. */
  initialRange?: [number, number];
  /** `teen`: the number to build, 11–19. */
  teenRange?: [number, number];
  questionsPerRound?: number;
}

export interface TenFrameRocketParams extends TenFrameSetup {
  /** Counting nests a level's generator settings under `question`. */
  question?: TenFrameSetup;
}

interface FrameQuestion extends RoundQuestion {
  mode: TenFrameMode;
  /** What the child is aiming for: cells to fill, ones to add, or the total. */
  target: number;
  /** `complement` only: how many cells arrive filled. */
  initial?: number;
}

const rangeOr = (range: [number, number] | undefined, lo: number, hi: number) => {
  const [min, max] = range ?? [lo, hi];
  return min + Math.floor(Math.random() * (max - min + 1));
};

const buildQuestion = (setup: TenFrameSetup, index: number): FrameQuestion => {
  const mode = setup.mode ?? "fill";
  const base = { id: `q${index}-${Date.now().toString(36)}`, taskKind: `tenframe_${mode}` };

  if (mode === "complement") {
    const initial = rangeOr(setup.initialRange, 2, 8);
    return { ...base, mode, initial, target: 10 - initial, expected: String(10 - initial) };
  }
  if (mode === "teen") {
    const teen = rangeOr(setup.teenRange, 11, 19);
    return { ...base, mode, target: teen, expected: String(teen), itemCount: teen };
  }
  const target = rangeOr(setup.targetRange, 5, 9);
  return { ...base, mode, target, expected: String(target), itemCount: target };
};

const EMPTY_FRAME = () => Array<boolean>(10).fill(false);

const Cell: React.FC<{
  filled: boolean;
  tone: "purple" | "cyan";
  onClick?: () => void;
  height?: string;
}> = ({ filled, tone, onClick, height = "h-16" }) => {
  const on =
    tone === "purple"
      ? "bg-purple-500 border-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.5)] scale-95"
      : "bg-cyan-500 border-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.5)] scale-95";
  const off = `bg-surface border-line ${onClick ? (tone === "purple" ? "hover:border-purple-400" : "hover:border-cyan-400") : ""}`;
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`${height} rounded-2xl border-2 flex items-center justify-center transition-all ${filled ? on : off}`}
    >
      {filled && <span className="text-2xl">⚡</span>}
    </button>
  );
};

export const TenFrameRocket: React.FC<ActivityProps<TenFrameRocketParams>> = ({
  params,
  koda,
  onComplete,
  lesson,
}) => {
  const setup: TenFrameSetup = { ...params, ...params.question };
  const total = setup.questionsPerRound ?? 5;

  const [frame, setFrame] = useState<boolean[]>(EMPTY_FRAME);
  const [showTip, setShowTip] = useState(false);
  const [nextStep, setNextStep] = useState<{ kind: string; kidMessage: string } | undefined>();

  const round = useSkillRound({
    koda,
    totalQuestions: total,
    levelNumber: lesson?.levelNumber ?? 1,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    nextQuestion: useCallback((index: number) => buildQuestion(setup, index), [params]),
    onComplete: (result) => {
      void koda.progress.nextStep().then((r) => setNextStep(r ?? undefined));
      onComplete(result);
    },
  });

  const question = round.question as FrameQuestion;
  const filled = frame.filter(Boolean).length;

  // Each question starts from an empty frame.
  useEffect(() => {
    setFrame(EMPTY_FRAME());
    setShowTip(false);
  }, [question.id]);

  const chime = (type: Parameters<typeof koda.sound.play>[0]) => {
    if (koda.config.isEnabled("sound_chimes", true)) koda.sound.play(type);
  };

  const toggle = (idx: number) => {
    chime("pop");
    koda.haptics.tap();
    setFrame((prev) => prev.map((v, i) => (i === idx ? !v : v)));
  };

  const submit = (given: number, correct: boolean, title: string, message: string) => {
    chime(correct ? "success" : "error");
    correct ? koda.haptics.success() : koda.haptics.tap();
    round.submit({
      correct,
      given: String(given),
      expected: String(question.mode === "teen" ? question.target : question.target),
      errorKind: correct ? undefined : question.mode === "teen" ? "place_value" : "miscounted_items",
      title,
      message,
    });
  };

  const checkFill = () =>
    filled === question.target
      ? submit(
          filled,
          true,
          "Great counting!",
          `Rocket fueled! You filled 5 on top plus ${question.target - 5} extra ones to make ${question.target}.`,
        )
      : submit(
          filled,
          false,
          "Try again",
          `Currently filled: ${filled}. We need exactly ${question.target} filled spots.`,
        );

  const answerComplement = (guess: number) =>
    guess === question.target
      ? submit(
          guess,
          true,
          "Great counting!",
          `Number bond discovered! ${question.initial} + ${guess} = 10. You completed the full ten-frame.`,
        )
      : submit(
          guess,
          false,
          "Try another number",
          `There are ${question.initial} filled spots. Count the empty ones: we need ${question.target} more to make 10.`,
        );

  const checkTeen = () => {
    const built = 10 + filled;
    return built === question.target
      ? submit(
          built,
          true,
          "Great counting!",
          `Teen number mastered! 10 (full frame) + ${filled} (ones) = ${question.target}.`,
        )
      : submit(
          built,
          false,
          "Try the second frame",
          `Currently 10 + ${filled} = ${built}. We need ${question.target - 10} extra ones in Frame 2.`,
        );
  };

  const prompt =
    question.mode === "complement"
      ? `You have ${question.initial}. How many more to make 10?`
      : question.mode === "teen"
        ? `Make ${question.target}. Fill one frame with 10, then add more.`
        : `Make ${question.target} dots. Fill the top row first.`;

  return (
    <SkillRound
      koda={koda}
      lesson={lesson}
      fallbackTitle="Ten-Frame Rocket"
      round={round}
      totalQuestions={total}
      prompt={prompt}
      iconName="rocket"
      iconTone="purple"
      showTip={showTip}
      onExit={koda.ui.exit}
      onToggleTip={() => {
        if (!showTip) round.useSupport("hint", 1);
        setShowTip((v) => !v);
      }}
      onReadAloud={() => {
        round.useSupport("audio_replay");
        void koda.speech.say(prompt);
      }}
      recommendation={nextStep}
    >
      {question.mode === "fill" && (
        <div className="space-y-4">
          <div className="max-w-md mx-auto bg-canvas p-4 rounded-3xl border-2 border-purple-500/40 space-y-2.5 shadow-2xl">
            <div className="grid grid-cols-5 gap-2">
              {frame.slice(0, 5).map((on, idx) => (
                <Cell key={idx} filled={on} tone="purple" onClick={() => toggle(idx)} />
              ))}
            </div>
            <div className="grid grid-cols-5 gap-2">
              {frame.slice(5).map((on, idx) => (
                <Cell key={idx + 5} filled={on} tone="cyan" onClick={() => toggle(idx + 5)} />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            <span className="font-mono text-xs text-muted">
              Filled: <strong>{filled}</strong> / {question.target}
            </span>
            <button onClick={checkFill} className={themeSystem.button("primary", "sm")}>
              <Rocket />
              Check Ten-Frame
            </button>
          </div>
        </div>
      )}

      {question.mode === "complement" && (
        <div className="space-y-4">
          <div className="max-w-md mx-auto bg-canvas p-4 rounded-3xl border-2 border-purple-500/40">
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: 10 }, (_, idx) => {
                const loaded = idx < (question.initial ?? 0);
                return (
                  <div
                    key={idx}
                    className={`h-14 rounded-2xl border-2 flex items-center justify-center ${
                      loaded
                        ? "bg-purple-500 border-purple-300"
                        : "bg-surface border-dashed border-line"
                    }`}
                  >
                    {loaded ? (
                      <span className="text-xl">🔋</span>
                    ) : (
                      <span className="text-slate-500 font-mono">?</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-center space-y-2">
            <p className="text-xs text-muted font-mono">
              Select how many empty spots are needed to make 10:
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                <button
                  key={num}
                  onClick={() => answerComplement(num)}
                  className={themeSystem.button("secondary", "choice")}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {question.mode === "teen" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <div className="bg-canvas p-3.5 rounded-2xl border border-purple-500/40 space-y-2">
              <span className="font-mono text-xs text-purple-600 dark:text-purple-300 font-bold">
                Frame 1: 10 (Locked Full)
              </span>
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: 10 }, (_, i) => (
                  <div
                    key={i}
                    className="h-10 rounded-xl bg-purple-500/40 border border-purple-400 flex items-center justify-center text-sm"
                  >
                    ⚡
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-canvas p-3.5 rounded-2xl border border-cyan-500/40 space-y-2">
              <span className="font-mono text-xs text-cyan-700 dark:text-cyan-300 font-bold">
                Frame 2: Extra Ones
              </span>
              <div className="grid grid-cols-5 gap-2">
                {frame.map((on, idx) => (
                  <Cell
                    key={idx}
                    filled={on}
                    tone="cyan"
                    height="h-10"
                    onClick={() => toggle(idx)}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            <span className="font-mono text-xs text-muted">
              Total: 10 + {filled} = <strong>{10 + filled}</strong>
            </span>
            <button onClick={checkTeen} className={themeSystem.button("primary", "sm")}>
              Check Teen Number
            </button>
          </div>
        </div>
      )}
    </SkillRound>
  );
};
