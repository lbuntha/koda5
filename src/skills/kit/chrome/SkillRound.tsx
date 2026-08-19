import React from "react";
import type { ActivityLesson, KodaSDK } from "../../types";
import { UIKidMessage } from "../../../components/ui";
import { PracticeStepHeader, type StepTagLabels } from "./PracticeStepHeader";
import { PracticeRoundCompleteModal } from "./RoundCompleteModal";
import { SkillRoundTopBar, type SkillVoiceContext } from "./SkillRoundTopBar";
import type { RoundController } from "../round/useSkillRound";

export interface SkillRoundProps {
  koda: KodaSDK;
  /** Which lesson is running, for the bar and the completion modal. */
  lesson?: ActivityLesson;
  /** Fallback name when a mount supplied no lesson. */
  fallbackTitle: string;
  round: RoundController;
  totalQuestions: number;
  /** The question, in words. Read aloud and shown in the step header. */
  prompt: string;
  onExit(): void;
  onReadAloud(): void;
  onToggleTip(): void;
  showTip: boolean;
  /** What the child is answering. The only part a skill draws itself. */
  children: React.ReactNode;
  iconName?: string;
  iconTone?: string;
  voice?: SkillVoiceContext;
  tagLabels?: Partial<StepTagLabels>;
  contextTag?: React.ReactNode | null;
  /** Extra controls for the bar. Rarely needed. */
  extras?: React.ReactNode;
  /** What the log advises next, shown on the completion modal. */
  recommendation?: { kind: string; kidMessage: string };
  onNextLevel?(): void;
  onPracticeAgain?(): void;
}

/**
 * Everything around a question.
 *
 * The bar, the step header, the feedback message and the completion modal are
 * the same in every skill, so a skill should not be assembling them — it should
 * hand over what is being asked and draw the part a child touches. Before this,
 * each skill wired all four itself, which is how one ended up with a bespoke
 * top bar and a non-standard feedback message.
 */
export const SkillRound: React.FC<SkillRoundProps> = ({
  koda,
  lesson,
  fallbackTitle,
  round,
  totalQuestions,
  prompt,
  onExit,
  onReadAloud,
  onToggleTip,
  showTip,
  children,
  iconName,
  iconTone,
  voice,
  tagLabels,
  contextTag,
  extras,
  recommendation,
  onNextLevel,
  onPracticeAgain,
}) => {
  const title = lesson?.title ?? fallbackTitle;
  const levelNumber = lesson?.levelNumber ?? 1;

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <SkillRoundTopBar
        koda={koda}
        title={title}
        subtitle={lesson?.concept}
        levelNumber={lesson?.levelNumber}
        iconName={iconName}
        iconTone={iconTone}
        questionIndex={round.index}
        totalQuestions={totalQuestions}
        onExit={onExit}
        voice={voice}
        extras={extras}
      />

      <main className="flex-1 p-3 sm:p-6 pb-32 flex flex-col justify-center max-w-4xl mx-auto w-full">
        <div className="bg-surface/50 rounded-3xl p-4 sm:p-6 space-y-4">
          <PracticeStepHeader
            stepNumber={round.index}
            totalSteps={totalQuestions}
            title={prompt}
            showTip={showTip}
            onToggleTip={onToggleTip}
            onReadAloud={onReadAloud}
            levelNumber={levelNumber}
            contextTag={contextTag}
            tagLabels={tagLabels}
          />
          {children}
        </div>
      </main>

      {round.feedback && (
        <div className="sticky bottom-0 left-0 right-0 z-30 p-3 sm:p-4 bg-canvas/95 backdrop-blur-sm">
          <UIKidMessage
            tone={round.feedback.status === "correct" ? "correct" : "tryAgain"}
            title={round.feedback.title}
            message={round.feedback.message}
            actionLabel={round.feedback.status === "correct" ? "Next" : "Try again"}
            onAction={round.advance}
          />
        </div>
      )}

      {round.score && (
        <PracticeRoundCompleteModal
          levelNumber={levelNumber}
          levelTitle={title}
          stars={round.score.stars}
          coinsWon={round.score.coins}
          xpWon={round.score.xp}
          nextLevelNumber={levelNumber + 1}
          recommendation={recommendation}
          onNextLevel={onNextLevel ?? onExit}
          onPracticeAgain={onPracticeAgain ?? round.restart}
        />
      )}
    </div>
  );
};
