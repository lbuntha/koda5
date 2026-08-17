/**
 * Per-lesson question parameters.
 *
 * These values used to be literals inside `randomize*Level` in
 * `CountingGameApp.tsx`, branched on `lvlNum === n`. Moving them here means a
 * lesson can be retuned — or a new one added — by editing `lessons.json`, with
 * no React change.
 *
 * Every field is optional and every reader supplies the original literal as a
 * fallback, so a lesson that declares nothing behaves exactly as before.
 */
export interface CountingQuestionParams {
  /** How many countable items to show. */
  countRange?: [number, number];

  /** Scatter placement, as percentages of the play area. */
  scatter?: {
    top: [number, number];
    left: [number, number];
    rotate: [number, number];
    /** Minimum gap between items, in percent, to avoid overlap. */
    minDistance: number;
  };

  /** Comparison levels: the outcomes to draw from. Repeat a value to weight it. */
  compareModes?: string[];
  /** Count range used when one side must be larger. */
  biasedRange?: [number, number];
  /** How much larger the winning side may be. */
  diffRange?: [number, number];

  /** Flash levels: how long the set stays visible, in ms. */
  flashMs?: number;
  /** Irregular scatter for flash levels, as percentages. */
  jitterRange?: [number, number];
  /** Part-whole levels: size of each colour group. */
  partRange?: [number, number];

  /** Ten-frame: how many cells to fill. */
  targetRange?: [number, number];
  /** Ten-frame complement: how many start filled. */
  initialRange?: [number, number];
  /** Teen numbers: the target. */
  teenRange?: [number, number];

  /** Skip counting: allowed step sizes. */
  steps?: number[];
  /** Number of hops along the track. */
  hopRange?: [number, number];
  /** Hop count per step size, when they differ. Keys are step sizes. */
  hopRangeByStep?: Record<string, [number, number]>;

  /** Sequence puzzles. */
  seqLength?: number;
  startRange?: [number, number];
  reverseStartRange?: [number, number];
  missingIndexRange?: [number, number];
  distractorJitter?: [number, number];
}

/** level number -> its question parameters. */
export type CountingQuestionParamsByLevel = Record<number, CountingQuestionParams>;
