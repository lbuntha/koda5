import React, { useCallback, useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import type { ActivityProps } from "../../types";
import { SkillRound, useSkillRound, type RoundQuestion } from "../../kit";
import { themeSystem } from "../../../lib/themeSystem";

/**
 * A number line the child moves along.
 *
 * Two jobs: hop a fixed step to a target, or spot the number missing from a
 * sequence. Both are the same idea — equal steps — seen from opposite ends, so
 * they share an activity and differ by a lesson parameter.
 */

export type NumberLineMode = "hop" | "missing";

export interface FroggySetup {
  mode?: NumberLineMode;
  /** Step sizes to choose from, e.g. [2, 5]. */
  steps?: number[];
  /** `hop`: how many pads, overall or per step size. */
  hopRange?: [number, number];
  hopRangeByStep?: Record<string, [number, number]>;
  /** `missing`: how long the sequence is and where it can start. */
  seqLength?: number;
  startRange?: [number, number];
  reverseStartRange?: [number, number];
  missingIndexRange?: [number, number];
  distractorJitter?: [number, number];
  questionsPerRound?: number;
}

export interface FroggySkipParams extends FroggySetup {
  /** Counting nests a level's generator settings under `question`. */
  question?: FroggySetup;
}

interface LineQuestion extends RoundQuestion {
  mode: NumberLineMode;
  step: number;
  /** `hop`: the pads to land on, in order. */
  pads?: number[];
  /** `missing`: the sequence with one hole, and what fills it. */
  sequence?: (number | null)[];
  answer?: number;
  options?: number[];
  rule?: string;
}

const randomInt = (lo: number, hi: number) => lo + Math.floor(Math.random() * (hi - lo + 1));
const rangeOr = (range: [number, number] | undefined, lo: number, hi: number) =>
  randomInt(range?.[0] ?? lo, range?.[1] ?? hi);
const sample = <T,>(items: readonly T[]): T => items[Math.floor(Math.random() * items.length)];

const buildQuestion = (setup: FroggySetup, index: number): LineQuestion => {
  const mode = setup.mode ?? "hop";
  const step = sample(setup.steps ?? [2, 5]);
  const base = { id: `q${index}-${Date.now().toString(36)}`, taskKind: `numberline_${mode}` };

  if (mode === "missing") {
    // Half the sequences run backwards, so the rule has to be read rather than
    // assumed — a child who only ever counts up never notices they are.
    const reverse = Math.random() > 0.5;
    const length = setup.seqLength ?? 5;
    const start = reverse
      ? rangeOr(setup.reverseStartRange, 25, 45)
      : rangeOr(setup.startRange, 5, 20);

    const full = Array.from({ length }, (_, i) => (reverse ? start - i * step : start + i * step));
    const missingIndex = rangeOr(setup.missingIndexRange, 1, 3);
    const answer = full[missingIndex];
    const sequence: (number | null)[] = [...full];
    sequence[missingIndex] = null;

    const distractors = new Set<number>([
      answer + step,
      answer - step,
      answer + (reverse ? -1 : 1),
    ]);
    while (distractors.size < 3) distractors.add(answer + rangeOr(setup.distractorJitter, -4, 4));
    distractors.delete(answer);

    return {
      ...base,
      mode,
      step,
      sequence,
      answer,
      options: [...Array.from(distractors).slice(0, 3), answer].sort(() => Math.random() - 0.5),
      expected: String(answer),
      rule: reverse
        ? `Pattern steps backward by -${step} each jump`
        : `Pattern steps forward by +${step} each jump`,
    };
  }

  const perStep = setup.hopRangeByStep?.[String(step)];
  const hops = perStep
    ? randomInt(perStep[0], perStep[1])
    : setup.hopRange
      ? rangeOr(setup.hopRange, 4, 6)
      : step === 2
        ? randomInt(4, 6)
        : randomInt(3, 5);
  const pads = Array.from({ length: hops + 1 }, (_, i) => i * step);
  return { ...base, mode, step, pads, expected: String(pads[hops]) };
};

export const FroggySkip: React.FC<ActivityProps<FroggySkipParams>> = ({
  params,
  koda,
  onComplete,
  lesson,
}) => {
  const setup: FroggySetup = { ...params, ...params.question };
  const total = setup.questionsPerRound ?? 5;

  const [hop, setHop] = useState(0);
  const [guess, setGuess] = useState<number | null>(null);
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

  const question = round.question as LineQuestion;

  useEffect(() => {
    setHop(0);
    setGuess(null);
    setShowTip(false);
  }, [question.id]);

  const chime = (type: Parameters<typeof koda.sound.play>[0]) => {
    if (koda.config.isEnabled("sound_chimes", true)) koda.sound.play(type);
  };

  const hopForward = () => {
    const pads = question.pads ?? [];
    if (hop >= pads.length - 1) return;

    const next = hop + 1;
    setHop(next);
    chime("clink");
    koda.haptics.tap();
    if (koda.config.isEnabled("audio_speech", true)) {
      void koda.speech.say(String(pads[next]), { rate: koda.config.get("speechRate", 1.0) });
    }

    if (next === pads.length - 1) {
      chime("success");
      koda.haptics.success();
      round.submit({
        correct: true,
        given: String(pads[next]),
        expected: String(pads[next]),
        title: "Great counting!",
        message: `Ribbit! The frog leaped by +${question.step} each pad all the way to ${pads[next]}!`,
      });
    }
  };

  const answerMissing = (choice: number) => {
    setGuess(choice);
    const correct = choice === question.answer;
    chime(correct ? "success" : "error");
    correct ? koda.haptics.success() : koda.haptics.tap();
    round.submit({
      correct,
      given: String(choice),
      expected: String(question.answer),
      errorKind: correct ? undefined : "sequence_slip",
      title: correct ? "Great counting!" : "Check your hops",
      message: correct
        ? `Pattern cracked! ${choice} completes the sequence (${question.rule}).`
        : "Look at the jump between neighboring pads to find the missing number.",
    });
  };

  const prompt =
    question.mode === "missing"
      ? "Which number is missing?"
      : `Hop by ${question.step} to get to ${question.pads?.[question.pads.length - 1]}!`;

  return (
    <SkillRound
      koda={koda}
      lesson={lesson}
      fallbackTitle="Froggy Skip"
      round={round}
      totalQuestions={total}
      prompt={prompt}
      iconName="footprints"
      iconTone="emerald"
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
      {question.mode === "hop" ? (
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-3 overflow-x-auto py-6 bg-canvas rounded-2xl border border-amber-500/30">
            {(question.pads ?? []).map((val, idx) => {
              const reached = idx <= hop;
              const here = idx === hop;
              return (
                <div key={idx} className="flex flex-col items-center gap-2 shrink-0">
                  {here ? (
                    <motion.div
                      key="froggy"
                      initial={{ scale: 0.6, y: -16 }}
                      animate={{ scale: 1, y: [0, -10, 0] }}
                      transition={{
                        scale: { type: "spring", stiffness: 400, damping: 12 },
                        y: { duration: 1.2, ease: "easeInOut", repeat: Infinity, repeatDelay: 0.5 },
                      }}
                      className="w-14 h-14 rounded-2xl bg-emerald-400 text-slate-950 flex items-center justify-center text-3xl shadow-lg"
                    >
                      🐸
                    </motion.div>
                  ) : (
                    <div
                      className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center font-mono font-bold text-sm ${
                        reached
                          ? "bg-amber-500/20 border-amber-400 text-slate-800 dark:text-amber-300"
                          : "bg-surface border-line text-slate-600"
                      }`}
                    >
                      🪷
                    </div>
                  )}
                  <span className="font-mono font-bold text-xs text-ink">{val}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-center">
            <motion.button
              onClick={hopForward}
              disabled={hop >= (question.pads?.length ?? 1) - 1}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9, x: 4 }}
              transition={{ type: "spring", stiffness: 450, damping: 16 }}
              className={themeSystem.button("primary", "sm")}
            >
              Hop Forward (+{question.step})
              <ArrowRight />
            </motion.button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-3 py-6 bg-canvas rounded-2xl border border-amber-500/30 overflow-x-auto">
            {(question.sequence ?? []).map((val, idx) => (
              <motion.div
                key={idx}
                animate={val === null ? { scale: [1, 1.04, 1] } : {}}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                className={`w-16 h-16 rounded-2xl border-2 flex flex-col items-center justify-center font-mono font-black text-sm shrink-0 ${
                  val === null
                    ? "bg-amber-400/20 border-amber-400 text-slate-800 dark:text-amber-300"
                    : "bg-surface border-line text-ink"
                }`}
              >
                <span className="text-lg">{val === null ? "❓" : "🪷"}</span>
                <span>{val === null ? (guess ?? "___") : val}</span>
              </motion.div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {(question.options ?? []).map((opt) => (
              <motion.button
                key={opt}
                onClick={() => answerMissing(opt)}
                whileHover={{ scale: 1.08, y: -2 }}
                whileTap={{ scale: 0.88, y: 2 }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
                className={themeSystem.button("secondary", "choice")}
              >
                {opt}
              </motion.button>
            ))}
          </div>
        </div>
      )}
    </SkillRound>
  );
};
