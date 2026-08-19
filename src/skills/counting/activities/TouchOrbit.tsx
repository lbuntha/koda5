import React, { useCallback, useEffect, useState } from "react";
import type { ActivityProps } from "../../types";
import { SkillRound, useSkillRound, type RoundQuestion } from "../../kit";
import { themeSystem } from "../../../lib/themeSystem";
import { PREDEFINED_ASSETS, type PredefinedAsset } from "../internal/data/countingAssets";

/**
 * Touch each thing and count as you go.
 *
 * The one-to-one lessons: a row, a scatter, or two groups to compare. Tapping is
 * the point — a child who counts by pointing is doing the thing the concept is
 * named after, and the tag numbers stop them counting one twice.
 */

export type OrbitMode = "row" | "scatter" | "compare";
type Layout = "cluster" | "line" | "circle" | "pairs" | "scattered" | "column";

export interface OrbitSetup {
  mode?: OrbitMode;
  countRange?: [number, number];
  /** `scatter`: bounds and spacing, in percent. */
  scatter?: {
    top?: [number, number];
    left?: [number, number];
    rotate?: [number, number];
    minDistance?: number;
  };
  /** `compare`: which outcomes may come up, and by how much they differ. */
  compareModes?: ("SAME" | "A_MORE" | "B_MORE")[];
  biasedRange?: [number, number];
  diffRange?: [number, number];
  questionsPerRound?: number;
}

export interface TouchOrbitParams extends OrbitSetup {
  /** Counting nests a level's generator settings under `question`. */
  question?: OrbitSetup;
}

interface Placement {
  top: string;
  left: string;
  rotate: string;
}

interface OrbitQuestion extends RoundQuestion {
  mode: OrbitMode;
  asset: PredefinedAsset;
  count: number;
  /** `scatter` only. */
  places?: Placement[];
  /** `compare` only. */
  compare?: {
    countA: number;
    countB: number;
    assetA: PredefinedAsset;
    assetB: PredefinedAsset;
    layoutA: Layout;
    layoutB: Layout;
    answer: "A" | "B" | "SAME";
  };
}

const NUMBER_WORDS = [
  "",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
];

const LAYOUTS: Layout[] = ["cluster", "line", "circle", "pairs", "scattered", "column"];

const randomInt = (lo: number, hi: number) => lo + Math.floor(Math.random() * (hi - lo + 1));
const rangeOr = (range: [number, number] | undefined, lo: number, hi: number) =>
  randomInt(range?.[0] ?? lo, range?.[1] ?? hi);
const sample = <T,>(items: readonly T[]): T => items[Math.floor(Math.random() * items.length)];

/** "Rockets" → "rocket". Asset names are plural; the prompt says "each". */
const singular = (name: string): string => {
  const n = name.toLowerCase();
  if (n.endsWith("ies")) return `${n.slice(0, -3)}y`;
  if (/(ch|sh|s|x|z)es$/.test(n)) return n.slice(0, -2);
  return n.endsWith("s") ? n.slice(0, -1) : n;
};

/** Placements that do not overlap, so nothing hides behind anything else. */
const scatterPlaces = (count: number, setup: OrbitSetup["scatter"]): Placement[] => {
  const gap = setup?.minDistance ?? 16;
  const places: { top: number; left: number; rotate: number }[] = [];

  for (let i = 0; i < count; i++) {
    let top = 0;
    let left = 0;
    for (let attempt = 0; attempt < 100; attempt++) {
      top = rangeOr(setup?.top, 15, 70);
      left = rangeOr(setup?.left, 12, 80);
      if (places.every((p) => Math.hypot(top - p.top, left - p.left) >= gap)) break;
    }
    places.push({ top, left, rotate: rangeOr(setup?.rotate, -18, 18) });
  }

  return places.map((p) => ({ top: `${p.top}%`, left: `${p.left}%`, rotate: `${p.rotate}deg` }));
};

const buildQuestion = (setup: OrbitSetup, index: number): OrbitQuestion => {
  const mode = setup.mode ?? "row";
  const asset = sample(PREDEFINED_ASSETS);
  const base = { id: `q${index}-${Date.now().toString(36)}`, taskKind: "count_objects", asset };

  if (mode === "compare") {
    const outcome = sample(setup.compareModes ?? ["SAME", "SAME", "A_MORE", "B_MORE"]);
    const [dLo, dHi] = setup.diffRange ?? [1, 2];
    let countA = rangeOr(setup.countRange, 3, 8);
    let countB = countA;

    if (outcome === "A_MORE") {
      countA = rangeOr(setup.biasedRange, 4, 8);
      countB = countA - randomInt(dLo, Math.min(dHi, countA - 2));
    } else if (outcome === "B_MORE") {
      countB = rangeOr(setup.biasedRange, 4, 8);
      countA = countB - randomInt(dLo, Math.min(dHi, countB - 2));
    }

    // Different arrangements on purpose: conservation is the idea that moving
    // things around does not change how many there are.
    const [layoutA, layoutB] = [...LAYOUTS].sort(() => Math.random() - 0.5);
    const assetB = Math.random() > 0.5 ? asset : sample(PREDEFINED_ASSETS);
    const answer = countA === countB ? "SAME" : countA > countB ? "A" : "B";

    return {
      ...base,
      mode,
      count: countA,
      expected: answer,
      compare: { countA, countB, assetA: asset, assetB, layoutA, layoutB, answer },
    };
  }

  const count = rangeOr(setup.countRange, mode === "scatter" ? 5 : 3, mode === "scatter" ? 8 : 7);
  return {
    ...base,
    mode,
    count,
    expected: String(count),
    itemCount: count,
    places: mode === "scatter" ? scatterPlaces(count, setup.scatter) : undefined,
  };
};

const LAYOUT_CLASS: Record<Layout, string> = {
  cluster: "flex flex-wrap gap-1.5 justify-center max-w-[180px]",
  line: "flex gap-2 items-center justify-center flex-wrap",
  circle: "flex flex-wrap gap-3 justify-center max-w-[190px]",
  pairs: "grid grid-cols-2 gap-2 justify-center",
  scattered: "flex flex-wrap gap-2.5 justify-center max-w-[210px]",
  column: "flex flex-col gap-2 items-center justify-center",
};

/** One group of things to tap, in whichever arrangement the question chose. */
const TapGroup: React.FC<{
  count: number;
  emoji: string;
  layout: Layout;
  tapped: number[];
  onTap: (index: number) => void;
  tone: "amber" | "cyan";
}> = ({ count, emoji, layout, tapped, onTap, tone }) => (
  <div className={LAYOUT_CLASS[layout]}>
    {Array.from({ length: count }, (_, i) => {
      const on = tapped.includes(i);
      return (
        <button
          key={i}
          onClick={() => onTap(i)}
          className={`relative w-10 h-10 rounded-2xl flex items-center justify-center text-lg transition active:scale-90 ${
            on
              ? `${tone === "amber" ? "bg-amber-500/40 border-amber-400" : "bg-cyan-500/40 border-cyan-400"} border-2 scale-105`
              : `${tone === "amber" ? "bg-amber-500/15 border-amber-500/30" : "bg-cyan-500/15 border-cyan-500/30"} border`
          }`}
        >
          <span>{emoji}</span>
          {on && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-400 text-slate-950 font-mono font-black text-[9px] flex items-center justify-center">
              {tapped.indexOf(i) + 1}
            </span>
          )}
        </button>
      );
    })}
  </div>
);

export const TouchOrbit: React.FC<ActivityProps<TouchOrbitParams>> = ({
  params,
  koda,
  onComplete,
  lesson,
}) => {
  const setup: OrbitSetup = { ...params, ...params.question };
  const total = setup.questionsPerRound ?? 5;

  const [tapped, setTapped] = useState<number[]>([]);
  const [tappedA, setTappedA] = useState<number[]>([]);
  const [tappedB, setTappedB] = useState<number[]>([]);
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

  const question = round.question as OrbitQuestion;

  useEffect(() => {
    setTapped([]);
    setTappedA([]);
    setTappedB([]);
    setShowTip(false);
  }, [question.id]);

  const chime = (type: Parameters<typeof koda.sound.play>[0]) => {
    if (koda.config.isEnabled("sound_chimes", true)) koda.sound.play(type);
  };

  /** Say the running count aloud — the number word is the point of the tap. */
  const countAloud = (n: number) => {
    if (koda.config.isEnabled("audio_speech", true)) {
      void koda.speech.say(NUMBER_WORDS[n] ?? String(n), {
        rate: koda.config.get("speechRate", 1.0),
      });
    }
  };

  const tap = (index: number) => {
    if (tapped.includes(index)) return;
    const next = [...tapped, index];
    setTapped(next);
    koda.haptics.tap();
    chime(question.mode === "scatter" ? "clink" : "pop");
    countAloud(next.length);

    if (next.length === question.count) {
      chime("success");
      koda.haptics.success();
      round.submit({
        correct: true,
        given: String(next.length),
        expected: String(question.count),
        title: "Great counting!",
        message:
          question.mode === "scatter"
            ? `Terrific tracking! You tagged all ${question.count} scattered objects without missing any.`
            : `You counted ${question.count} ${question.asset.name.toLowerCase()}. The last number you said is how many!`,
      });
    }
  };

  const tapGroup = (group: "A" | "B", index: number) => {
    const [list, set] = group === "A" ? [tappedA, setTappedA] : [tappedB, setTappedB];
    const on = list.includes(index);
    const next = on ? list.filter((i) => i !== index) : [...list, index];
    set(next);
    chime("pop");
    if (!on) countAloud(next.length);
  };

  const answerCompare = (choice: "A" | "B" | "SAME") => {
    const c = question.compare!;
    const correct = choice === c.answer;
    chime(correct ? "success" : "error");
    correct ? koda.haptics.success() : koda.haptics.tap();

    // Said the way the screen says it — the buttons are left and right, so the
    // hint is too. "Group A is greater" is the grown-up version.
    const message = correct
      ? c.answer === "SAME"
        ? `Both groups have ${c.countA}. Moving things around does not change how many!`
        : c.answer === "A"
          ? `The left group has ${c.countA}. The right group has ${c.countB}. Left has more!`
          : `The right group has ${c.countB}. The left group has ${c.countA}. Right has more!`
      : c.answer === "SAME"
        ? `They look different, but count one by one. Left has ${c.countA} and right has ${c.countB}. The same!`
        : `Count one by one. Left has ${c.countA} ${c.assetA.name.toLowerCase()} and right has ${c.countB} ${c.assetB.name.toLowerCase()}.`;

    round.submit({
      correct,
      given: choice,
      expected: c.answer,
      // Picking the wrong side is a direction error, not an arithmetic slip.
      errorKind: correct ? undefined : "reversed",
      title: correct ? "Great counting!" : "Count them again",
      message,
    });
  };

  const prompt =
    question.mode === "compare"
      ? question.compare!.answer === "SAME"
        ? "Count both groups. Do they have the same?"
        : "Count both groups. Which one has more?"
      : question.mode === "scatter"
        ? `Touch every ${singular(question.asset.name)}. Do not miss any!`
        : `Touch each ${singular(question.asset.name)}. Count as you go!`;

  return (
    <SkillRound
      koda={koda}
      lesson={lesson}
      fallbackTitle="Touch and Count"
      round={round}
      totalQuestions={total}
      prompt={prompt}
      iconName={question.mode === "compare" ? "scale" : "star"}
      iconTone="amber"
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
      {question.mode === "compare" ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {(["A", "B"] as const).map((side) => {
              const c = question.compare!;
              const isA = side === "A";
              return (
                <div
                  key={side}
                  className="bg-canvas rounded-2xl border border-line p-4 min-h-[180px] flex flex-col items-center justify-center gap-3"
                >
                  <span className="font-mono text-[11px] font-bold text-muted">
                    {isA ? "Left group" : "Right group"}
                  </span>
                  <TapGroup
                    count={isA ? c.countA : c.countB}
                    emoji={(isA ? c.assetA : c.assetB).emoji}
                    layout={isA ? c.layoutA : c.layoutB}
                    tapped={isA ? tappedA : tappedB}
                    onTap={(i) => tapGroup(side, i)}
                    tone={isA ? "amber" : "cyan"}
                  />
                  <span className="font-mono text-[11px] text-muted">
                    Counted: <strong>{(isA ? tappedA : tappedB).length}</strong>
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {(
              [
                ["A", "Left has more"],
                ["SAME", "Same!"],
                ["B", "Right has more"],
              ] as const
            ).map(([choice, label]) => (
              <button
                key={choice}
                onClick={() => answerCompare(choice)}
                className={themeSystem.button("secondary", "sm")}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div
            className={`bg-canvas rounded-2xl border border-line ${
              question.mode === "scatter"
                ? "relative h-[260px]"
                : "flex flex-wrap items-center justify-center gap-3 p-6"
            }`}
          >
            {Array.from({ length: question.count }, (_, i) => {
              const on = tapped.includes(i);
              const place = question.places?.[i];
              return (
                <button
                  key={i}
                  onClick={() => tap(i)}
                  style={
                    place
                      ? {
                          position: "absolute",
                          top: place.top,
                          left: place.left,
                          transform: `rotate(${place.rotate})`,
                        }
                      : undefined
                  }
                  className={`relative w-16 h-16 rounded-2xl border-2 flex items-center justify-center text-3xl transition active:scale-90 ${
                    on
                      ? "bg-amber-100 dark:bg-amber-500/25 border-amber-400"
                      : "bg-surface border-line hover:border-amber-300"
                  }`}
                >
                  <span>{question.asset.emoji}</span>
                  {on && koda.config.isEnabled("counting_badges", true) && (
                    <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-mono font-black text-[10px] flex items-center justify-center">
                      {tapped.indexOf(i) + 1}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <p className="text-center font-mono text-xs text-muted">
            Tapped: <strong className="text-ink">{tapped.length}</strong> / {question.count}
          </p>
        </div>
      )}
    </SkillRound>
  );
};
