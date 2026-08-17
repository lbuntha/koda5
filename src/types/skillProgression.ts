export type SkillTierLevel = "novice" | "explorer" | "practitioner" | "master";

export interface ProgressionQuizQuestion {
  id: string;
  question: string;
  visualDiagram?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  coreConcept: string;
  optionalAiHint?: {
    socraticClue: string;
    guidingQuestion: string;
    visualTip: string;
  };
}

export interface SkillProgressionLevel {
  levelNumber: number;
  id: string;
  title: string;
  tier: SkillTierLevel;
  ageGuidance: string;
  cognitiveLeap: string;
  keyMilestones: string[];
  visualizerType: 
    | "touch_counting" 
    | "subitizing_flash" 
    | "ten_frame_anchor" 
    | "number_line_skip" 
    | "base10_bundle"
    | "sorting_patterns"
    | "visual_addition"
    | "visual_subtraction";
  interactiveChallenge: {
    title: string;
    instructions: string;
    targetGoal: string;
    rewardXp: number;
    initialConfig?: Record<string, any>;
  };
  bridgeToNextSkills: {
    unlocksSkill: string;
    whyItMatters: string;
  };
  masteryQuiz: ProgressionQuizQuestion[];
}

export interface SkillProgressionModel {
  id: string;
  skillName: string;
  domain: string;
  summary: string;
  accentColor: "emerald" | "cyan" | "purple" | "amber" | "blue" | "rose";
  foundationalRationale: string;
  levels: SkillProgressionLevel[];
}
