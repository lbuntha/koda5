import React, { useCallback, useEffect, useState } from "react";
import type { ActivityProps } from "../../types";
import { SkillRound, useSkillRound, type RoundQuestion } from "../../kit";
import { themeSystem } from "../../../lib/themeSystem";

/**
 * Build a number out of hundreds, tens and ones — then bundle it.
 *
 * Getting the total right is only half of it: ten ones have to become a ten, and
 * ten tens a hundred, or the number is right and the place value is not. Which
 * bundling a lesson asks for is a parameter, so the three lessons differ by data
 * rather than by level number.
 */

export interface Base10Setup {
  /** Smallest and largest number to build. */
  targetRange?: [number, number];
  /** Whether ten ones must be bundled into a ten before the answer counts. */
  bundleOnes?: boolean;
  /** Whether ten tens must be bundled into a hundred. */
  bundleTens?: boolean;
  /** Show the hundreds column. Off for lessons that stay under 100. */
  hundreds?: boolean;
  questionsPerRound?: number;
}

export interface Base10FoundryParams extends Base10Setup {
  /** Counting nests a level's generator settings under `question`. */
  question?: Base10Setup;
}

interface BuildQuestion extends RoundQuestion {
  target: number;
}

const randomInt = (lo: number, hi: number) => lo + Math.floor(Math.random() * (hi - lo + 1));

const buildQuestion = (setup: Base10Setup, index: number): BuildQuestion => {
  const [lo, hi] = setup.targetRange ?? [11, 35];
  const target = randomInt(lo, hi);
  return {
    id: `q${index}-${Date.now().toString(36)}`,
    taskKind: "place_value_build",
    target,
    expected: String(target),
    itemCount: target,
  };
};

interface Place {
  key: "hundreds" | "tens" | "ones";
  label: string;
  worth: number;
  max: number;
  tone: string;
}

const PLACES: Place[] = [
  { key: "hundreds", label: "Hundreds", worth: 100, max: 9, tone: "text-rose-700 dark:text-rose-400" },
  { key: "tens", label: "Tens", worth: 10, max: 19, tone: "text-amber-700 dark:text-amber-400" },
  { key: "ones", label: "Ones", worth: 1, max: 19, tone: "text-cyan-700 dark:text-cyan-400" },
];

export const Base10Foundry: React.FC<ActivityProps<Base10FoundryParams>> = ({
  params,
  koda,
  onComplete,
  lesson,
}) => {
  const setup: Base10Setup = { ...params, ...params.question };
  const total = setup.questionsPerRound ?? 5;
  const places = PLACES.filter((p) => p.key !== "hundreds" || setup.hundreds);

  const [built, setBuilt] = useState({ hundreds: 0, tens: 0, ones: 0 });
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

  const question = round.question as BuildQuestion;
  const value = built.hundreds * 100 + built.tens * 10 + built.ones;

  useEffect(() => {
    setBuilt({ hundreds: 0, tens: 0, ones: 0 });
    setShowTip(false);
  }, [question.id]);

  const chime = (type: Parameters<typeof koda.sound.play>[0]) => {
    if (koda.config.isEnabled("sound_chimes", true)) koda.sound.play(type);
  };

  const adjust = (key: Place["key"], delta: number, max: number) => {
    chime("pop");
    koda.haptics.tap();
    setBuilt((prev) => ({ ...prev, [key]: Math.max(0, Math.min(max, prev[key] + delta)) }));
  };

  const bundle = (from: "ones" | "tens") => {
    chime("clink");
    setBuilt((prev) =>
      from === "ones"
        ? { ...prev, ones: prev.ones - 10, tens: prev.tens + 1 }
        : { ...prev, tens: prev.tens - 10, hundreds: prev.hundreds + 1 },
    );
    if (koda.config.isEnabled("audio_speech", true)) {
      void koda.speech.say(from === "ones" ? "10 ones make 1 ten" : "10 tens make 1 hundred");
    }
  };

  const check = () => {
    const say = (correct: boolean, title: string, message: string, place = false) => {
      chime(correct ? "success" : "error");
      correct ? koda.haptics.success() : koda.haptics.tap();
      round.submit({
        correct,
        given: String(value),
        expected: String(question.target),
        errorKind: correct ? undefined : place ? "place_value" : undefined,
        title,
        message,
      });
    };

    if (value !== question.target) {
      return say(
        false,
        "Try a different number",
        `Your current total is ${value} blocks, but you need to build exactly ${question.target}.`,
      );
    }
    if (setup.bundleOnes && built.ones >= 10) {
      return say(
        false,
        "Group your ones",
        `Great total! But you have ${built.ones} Ones. Put 10 of them together to make a Ten.`,
        true,
      );
    }
    if (setup.bundleTens && built.tens >= 10) {
      return say(
        false,
        "Group your tens",
        `Great total! But you have ${built.tens} Tens. Put 10 of them together to make a Hundred.`,
        true,
      );
    }
    // Name only the columns this lesson actually shows, so a lesson without a
    // hundreds column never reports "0 Hundreds".
    const parts = [
      setup.hundreds ? `${built.hundreds} Hundreds` : null,
      `${built.tens} Tens`,
      `${built.ones} Ones`,
    ].filter(Boolean) as string[];
    const built_as = parts.length > 2
      ? `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`
      : parts.join(" and ");
    return say(true, "Great counting!", `Built ${question.target} as ${built_as}.`);
  };

  const short = question.target - value;
  const prompt =
    short > 0
      ? `Make ${question.target}. You have ${value}. Add ${short} more!`
      : short < 0
        ? `Make ${question.target}. You have ${value}. Take away ${Math.abs(short)}!`
        : `You made ${question.target}! Press Check.`;

  return (
    <SkillRound
      koda={koda}
      lesson={lesson}
      fallbackTitle="Base-10 Foundry"
      round={round}
      totalQuestions={total}
      prompt={prompt}
      iconName="boxes"
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
      <div className="space-y-5">
        <div className="p-4 rounded-2xl bg-surface/80 border border-line flex items-center justify-between gap-4 flex-wrap">
          <div>
            <span className="text-[10px] font-mono font-bold tracking-wider text-teal-700 dark:text-teal-400 uppercase">
              Your job
            </span>
            <h3 className="text-sm font-bold text-ink">Make this number: {question.target}</h3>
          </div>
          <div className="px-4 py-2 bg-teal-500/10 border border-teal-500/30 rounded-xl flex items-center gap-3">
            <div className="text-right">
              <div className="text-[9px] font-mono font-bold text-teal-700 dark:text-teal-400">
                MAKE
              </div>
              <div className="text-xl font-black text-ink tabular-nums">{question.target}</div>
            </div>
            <div className="h-8 w-px bg-teal-500/20" />
            <div>
              <div className="text-[9px] font-mono font-bold text-muted">YOU HAVE</div>
              <div
                className={`text-xl font-black tabular-nums ${
                  value === question.target
                    ? "text-emerald-700 dark:text-emerald-400"
                    : "text-body"
                }`}
              >
                {value}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {places.map((place) => (
            <div
              key={place.key}
              className="bg-canvas rounded-2xl border border-line p-4 space-y-3 text-center"
            >
              <div className={`font-mono text-xs font-black ${place.tone}`}>{place.label}</div>
              <div className="text-3xl font-black text-ink tabular-nums">{built[place.key]}</div>
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => adjust(place.key, -1, place.max)}
                  disabled={built[place.key] === 0}
                  aria-label={`One fewer ${place.label}`}
                  className={themeSystem.button("secondary", "icon")}
                >
                  −
                </button>
                <button
                  onClick={() => adjust(place.key, 1, place.max)}
                  disabled={built[place.key] >= place.max}
                  aria-label={`One more ${place.label}`}
                  className={themeSystem.button("secondary", "icon")}
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 bg-canvas rounded-2xl border border-line font-mono text-xs text-center text-muted">
          {setup.hundreds && `${built.hundreds} Hundreds + `}
          {built.tens} Tens + {built.ones} Ones ={" "}
          <strong className="text-emerald-700 dark:text-emerald-400 text-base">{value}</strong>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {setup.bundleOnes && (
            <button
              onClick={() => bundle("ones")}
              disabled={built.ones < 10}
              className={themeSystem.button("secondary", "sm")}
            >
              Make a Ten
            </button>
          )}
          {setup.bundleTens && (
            <button
              onClick={() => bundle("tens")}
              disabled={built.tens < 10}
              className={themeSystem.button("secondary", "sm")}
            >
              Make a Hundred
            </button>
          )}
          <button onClick={check} className={themeSystem.button("primary", "sm")}>
            Check
          </button>
        </div>
      </div>
    </SkillRound>
  );
};
