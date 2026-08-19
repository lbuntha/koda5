/**
 * Counting's visual palette: the objects and colour pairs its activities draw
 * with. Curriculum lives in lessons.json; this file is only how it looks.
 */
export interface PredefinedAsset {
  id: string;
  name: string;
  emoji: string;
  color: string;
  bgColor: string;
  category: "objects" | "nature" | "gems" | "creatures";
}

export const PREDEFINED_ASSETS: PredefinedAsset[] = [
  { id: "star", name: "Stars", emoji: "⭐", color: "text-amber-400", bgColor: "bg-amber-500/20", category: "objects" },
  { id: "rocket", name: "Rockets", emoji: "🚀", color: "text-emerald-400", bgColor: "bg-emerald-500/20", category: "objects" },
  { id: "apple", name: "Apples", emoji: "🍎", color: "text-rose-400", bgColor: "bg-rose-500/20", category: "nature" },
  { id: "gem", name: "Gems", emoji: "💎", color: "text-blue-400", bgColor: "bg-blue-500/20", category: "gems" },
  { id: "flower", name: "Flowers", emoji: "🌸", color: "text-pink-400", bgColor: "bg-nature" as any, category: "nature" },
  { id: "butterfly", name: "Butterflies", emoji: "🦋", color: "text-cyan-400", bgColor: "bg-cyan-500/20", category: "creatures" },
  { id: "heart", name: "Hearts", emoji: "💖", color: "text-rose-400", bgColor: "bg-rose-500/20", category: "objects" },
  { id: "sun", name: "Suns", emoji: "☀️", color: "text-yellow-400", bgColor: "bg-yellow-500/20", category: "nature" },
];

export interface DualColorPair {
  name: string;
  colorA: string;
  colorB: string;
  labelA: string;
  labelB: string;
}

export const DUAL_COLOR_PAIRS: DualColorPair[] = [
  { name: "Blue & Yellow", colorA: "bg-cyan-400 shadow-cyan-400/60", colorB: "bg-amber-400 shadow-amber-400/60", labelA: "Blue Dots", labelB: "Yellow Dots" },
  { name: "Purple & Green", colorA: "bg-purple-400 shadow-purple-400/60", colorB: "bg-emerald-400 shadow-emerald-400/60", labelA: "Purple Dots", labelB: "Green Dots" },
  { name: "Red & Sky Blue", colorA: "bg-rose-400 shadow-rose-400/60", colorB: "bg-sky-400 shadow-sky-400/60", labelA: "Red Dots", labelB: "Sky Blue Dots" },
  { name: "Teal & Orange", colorA: "bg-teal-400 shadow-teal-400/60", colorB: "bg-orange-400 shadow-orange-400/60", labelA: "Teal Dots", labelB: "Orange Dots" },
];
