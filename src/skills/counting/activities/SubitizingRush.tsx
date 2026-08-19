import React, { useCallback, useEffect, useRef, useState } from "react";
import type { ActivityProps } from "../../types";
import { SkillRound, useSkillRound, type RoundQuestion } from "../../kit";
import { themeSystem } from "../../../lib/themeSystem";
import { DUAL_COLOR_PAIRS } from "../internal/data/countingAssets";

/**
 * Subitizing: a set is flashed, then named — without counting.
 *
 * The first level extracted from the fifteen-level counting component. Its three
 * lessons differ only in how the set is drawn, so `display` is a lesson
 * parameter rather than a level number: the activity has no idea which level it
 * is, which is what lets a sixteenth lesson reuse it by writing JSON.
 */

export type SubitizingDisplay = "grid" | "scatter" | "twoColor";

export interface SubitizingSetup {
  /** How the flashed set is drawn. */
  display?: SubitizingDisplay;
  /** Total dots, for `grid` and `scatter`. */
  countRange?: [number, number];
  /** Size of each group, for `twoColor`. The total is the two added. */
  partRange?: [number, number];
  /** Percent bounds for scatter placement. */
  jitterRange?: [number, number];
  /** How long the set stays visible. Shorter forces a glance, not a count. */
  flashMs?: number;
  questionsPerRound?: number;
}

export interface SubitizingRushParams extends SubitizingSetup {
  /**
   * Counting nests a level's generator settings under `question`, beside its
   * `play` block. Read both so a lesson can write them either way — flat is
   * what a new skill would do, nested is what counting already has.
   */
  question?: SubitizingSetup;
}

interface SubitizingQuestion extends RoundQuestion {
  total: number;
  /** Set for `twoColor`: the two groups the total is made of. */
  parts?: { a: number; b: number; colors: (typeof DUAL_COLOR_PAIRS)[number] };
  /** Set for `scatter`: where each dot sits, in percent. */
  points?: { x: number; y: number }[];
}

const rangeOr = (range: [number, number] | undefined, lo: number, hi: number) => {
  const [min, max] = range ?? [lo, hi];
  return min + Math.floor(Math.random() * (max - min + 1));
};

const sample = <T,>(items: readonly T[]): T => items[Math.floor(Math.random() * items.length)];

const buildQuestion = (params: SubitizingSetup, index: number): SubitizingQuestion => {
  const display = params.display ?? "grid";
  const base = { id: `q${index}-${Date.now().toString(36)}`, taskKind: "subitize_set" };

  if (display === "twoColor") {
    const a = rangeOr(params.partRange, 2, 4);
    const b = rangeOr(params.partRange, 2, 4);
    const total = a + b;
    return {
      ...base,
      total,
      expected: String(total),
      itemCount: total,
      parts: { a, b, colors: sample(DUAL_COLOR_PAIRS) },
    };
  }

  const total = rangeOr(params.countRange, 2, 6);
  return {
    ...base,
    total,
    expected: String(total),
    itemCount: total,
    points:
      display === "scatter"
        ? Array.from({ length: total }, () => ({
            x: rangeOr(params.jitterRange, 15, 85),
            y: rangeOr(params.jitterRange, 15, 85),
          }))
        : undefined,
  };
};

/** Five choices centred on the answer, clamped to what this lesson generates. */
const choicesFor = (total: number, params: SubitizingSetup): number[] => {
  const [lo, hi] = params.countRange ?? [2, 8];
  const span = Math.max(0, Math.min(total - 2, hi - 4));
  const start = Math.max(lo, Math.min(span, total - 2));
  return Array.from({ length: 5 }, (_, i) => start + i).filter((n) => n >= lo && n <= hi + 1);
};

const Dot: React.FC<{ className: string }> = ({ className }) => (
  <div className={`w-8 h-8 rounded-full ${className}`} />
);

export const SubitizingRush: React.FC<ActivityProps<SubitizingRushParams>> = ({
  params,
  koda,
  onComplete,
  lesson,
}) => {
  const setup: SubitizingSetup = { ...params, ...params.question };
  const total = setup.questionsPerRound ?? 5;
  const flashMs = setup.flashMs ?? 1000;

  const [showTip, setShowTip] = useState(false);
  const [nextStep, setNextStep] = useState<{ kind: string; kidMessage: string } | undefined>();
  /** The set is shown only after the child asks, so their eyes are on it. */
  const [phase, setPhase] = useState<"waiting" | "flashing" | "answering">("waiting");
  const timer = useRef<number | null>(null);

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

  const question = round.question as SubitizingQuestion;

  const flash = useCallback(() => {
    if (koda.config.isEnabled("sound_chimes", true)) koda.sound.play("pop");
    setPhase("flashing");
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setPhase("answering"), flashMs);
  }, [koda, flashMs]);

  // A new question starts hidden again, and a pending flash must not land on it.
  useEffect(() => {
    setPhase("waiting");
    setShowTip(false);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [question.id]);

  const guess = (choice: number) => {
    const correct = choice === question.total;
    if (koda.config.isEnabled("sound_chimes", true)) koda.sound.play(correct ? "success" : "error");
    correct ? koda.haptics.success() : koda.haptics.tap();

    round.submit({
      correct,
      given: String(choice),
      expected: String(question.total),
      title: correct ? "Great counting!" : "So close!",
      message: correct
        ? question.parts
          ? `${question.parts.a} and ${question.parts.b} makes ${question.total}.`
          : `Recognised instantly: ${question.total}!`
        : `You said ${choice}. There were ${question.total}. Have another look!`,
    });
  };

  return (
    <SkillRound
      koda={koda}
      lesson={lesson}
      fallbackTitle="Subitizing Rush"
      round={round}
      totalQuestions={total}
      prompt="Look fast! How many did you see?"
      iconName="dice"
      iconTone="purple"
      showTip={showTip}
      onExit={koda.ui.exit}
      onToggleTip={() => {
        if (!showTip) round.useSupport("hint", 1);
        setShowTip((v) => !v);
      }}
      onReadAloud={() => {
        round.useSupport("audio_replay");
        void koda.speech.say("Look fast! How many did you see?");
      }}
      recommendation={nextStep}
    >
      <div className="space-y-4 text-center">
        <div className="relative w-full h-[200px] bg-canvas rounded-2xl border border-line flex items-center justify-center overflow-hidden">
          {phase === "waiting" && (
            <div className="text-center space-y-3">
              <p className="text-base font-bold text-slate-700 dark:text-body">
                Ready? Watch closely!
              </p>
              <button onClick={flash} className={themeSystem.button("primary", "lg")} autoFocus>
                Show me
              </button>
            </div>
          )}

          {phase === "answering" && (
            <div className="text-center space-y-2.5">
              <span className="text-3xl" aria-hidden="true">
                ❓
              </span>
              <p className="text-sm font-bold text-slate-700 dark:text-body">
                How many dots did you see?
              </p>
              <button
                onClick={() => {
                  // Re-showing a flashed set is the strongest support here: the
                  // whole point is that the glance was enough.
                  round.useSupport("reveal");
                  flash();
                }}
                className={themeSystem.button("secondary", "sm")}
              >
                Show me again
              </button>
            </div>
          )}

          {phase === "flashing" && (
            <div className="flex items-center justify-center animate-scaleUp">
              {question.parts ? (
                <div className="flex items-center gap-6 p-4 bg-surface rounded-2xl border border-line">
                  <div className="flex gap-2">
                    {Array.from({ length: question.parts.a }, (_, i) => (
                      <Dot key={i} className={`${question.parts!.colors.colorA} shadow-md`} />
                    ))}
                  </div>
                  <span className="text-xl font-mono text-slate-500 font-bold">+</span>
                  <div className="flex gap-2">
                    {Array.from({ length: question.parts.b }, (_, i) => (
                      <Dot key={i} className={`${question.parts!.colors.colorB} shadow-md`} />
                    ))}
                  </div>
                </div>
              ) : question.points ? (
                <div className="relative w-64 h-36">
                  {question.points.map((pt, i) => (
                    <div
                      key={i}
                      style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
                      className="absolute w-7 h-7 rounded-full bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.9)] -translate-x-1/2 -translate-y-1/2"
                    />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3 p-4 bg-surface rounded-2xl border border-line shadow-2xl">
                  {Array.from({ length: question.total }, (_, i) => (
                    <Dot
                      key={i}
                      className="bg-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.9)]"
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {choicesFor(question.total, setup).map((num) => (
            <button
              key={num}
              onClick={() => guess(num)}
              disabled={phase !== "answering"}
              className={themeSystem.button("secondary", "choice")}
            >
              {num}
            </button>
          ))}
        </div>
      </div>
    </SkillRound>
  );
};
