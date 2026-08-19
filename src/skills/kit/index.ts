/**
 * Shared skill furniture.
 *
 * Anything two skills would otherwise each build: round chrome first, with the
 * round loop and manipulatives to follow. Importing from here is allowed from
 * any skill — it is the sanctioned alternative to a cross-folder import.
 */
export {
  SkillRoundTopBar,
  type SkillRoundTopBarProps,
  type SkillVoiceContext,
} from "./chrome/SkillRoundTopBar";

export { SkillRound, type SkillRoundProps } from "./chrome/SkillRound";
export { PracticeStepHeader, DEFAULT_STEP_TAGS, type StepTagLabels } from "./chrome/PracticeStepHeader";
export { PracticeRoundCompleteModal } from "./chrome/RoundCompleteModal";
export { scoreRound, type RoundOutcome, type RoundScore } from "./round/scoreRound";
export {
  useSkillRound,
  type AnswerOutcome,
  type RoundFeedback,
  type RoundQuestion,
  type RoundController,
  type UseSkillRoundOptions,
} from "./round/useSkillRound";
