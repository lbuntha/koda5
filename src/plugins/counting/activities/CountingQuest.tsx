import React from "react";
import { CountingGameApp } from "../internal/components/CountingGameApp";
import type { ActivityProps } from "../../types";

export interface CountingQuestParams {
  level: number;
}

/**
 * Adapter around the existing counting game.
 *
 * Deliberately thin: the 3,053-line `CountingGameApp` is not rewritten here, only
 * given the plugin's inputs and pointed at the SDK for its outputs. Splitting its
 * internals is a separate job — doing both at once would make any regression
 * impossible to attribute.
 */
export const CountingQuest: React.FC<ActivityProps<CountingQuestParams>> = ({
  params,
  level,
  koda,
  onComplete,
}) => {
  const startLevel = params?.level ?? level ?? 1;

  return (
    <CountingGameApp
      initialLevel={startLevel}
      onBackToHome={koda.ui.exit}
      onBackToStore={koda.ui.exit}
      onOpenSpecsBook={koda.ui.exit}
      soundEnabled={koda.config.isEnabled("sound_chimes", true)}
      setSoundEnabled={() => {
        /* owned by Settings; a skill does not toggle global preferences */
      }}
      onRewardOverallXp={(earnedXp: number) => {
        void koda.progress.awardXp(earnedXp);
        onComplete({ levelNumber: startLevel, stars: 3, xpEarned: earnedXp });
      }}
      onAskSoraHelp={(helpPrompt: string) => {
        void koda.ai.tutor(helpPrompt, { topic: "counting", level: startLevel });
      }}
    />
  );
};
