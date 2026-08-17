export interface AppReview {
  id: string;
  userName: string;
  userRole: "Parent" | "Kindergarten Teacher" | "Math Specialist" | "Homeschooler";
  rating: number;
  date: string;
  title: string;
  comment: string;
  helpfulCount: number;
}

export interface AppScreenshot {
  id: string;
  title: string;
  caption: string;
  tag: string;
  gradient: string;
  icon: string;
}

export interface StoreAppItem {
  id: string;
  title: string;
  developer: string;
  developerVerified: boolean;
  category: string;
  ageRating: string;
  starRating: number;
  reviewCount: string;
  downloadCount: string;
  iconBg: string;
  iconEmoji: string;
  badge?: "Editor's Choice" | "#1 Top Math" | "Teacher Approved" | "New Update";
  tagline: string;
  description: string;
  whatsNew: string;
  size: string;
  inAppPurchases: string;
  screenshots: AppScreenshot[];
  reviews: AppReview[];
  features: string[];
  cognitivePillars: {
    levelNumber: number;
    title: string;
    description: string;
  }[];
}

export interface PlayerTrophy {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
}

export type GameMode =
  | "map"
  | "touch_orbit"
  | "subitizing_rush"
  | "tenframe_rocket"
  | "froggy_skip"
  | "base10_foundry"
  | "trophy_room";

export type TierLevel = "beginner" | "intermediate" | "master";
