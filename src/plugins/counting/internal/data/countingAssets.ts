import { GameMode, TierLevel } from "../../../../types/storeApp";

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

export interface RiverTrackTheme {
  name: string;
  icon: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
}

export const RIVER_THEMES: RiverTrackTheme[] = [
  { name: "Pond Path", icon: "🪷", bgColor: "bg-emerald-950/40", borderColor: "border-emerald-500/40", textColor: "text-emerald-300" },
  { name: "Star Path", icon: "⭐", bgColor: "bg-cyan-950/40", borderColor: "border-cyan-500/40", textColor: "text-cyan-300" },
  { name: "Crystal Path", icon: "💎", bgColor: "bg-purple-950/40", borderColor: "border-purple-500/40", textColor: "text-purple-300" },
  { name: "Sunny Path", icon: "☀️", bgColor: "bg-amber-950/40", borderColor: "border-amber-500/40", textColor: "text-amber-300" },
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

export type DifficultyRating = "Easy" | "Medium" | "Challenging" | "Advanced" | "Master";

export interface FlowingLevelConfig {
  levelNumber: number;
  mode: GameMode;
  tier: TierLevel;
  difficulty: DifficultyRating;
  difficultyColor: string;
  category: string;
  title: string;
  shortDesc: string;
  icon: string;
  skillConcept: string;
  targetObjective: string;
  stepByStep: string[];
  pedagogyTip: string;
  /** The tip a child reads when they ask for help. Plain words, one sentence. */
  kidTip?: string;
  audioPrompt: string;
}

export const FLOWING_LEVELS: FlowingLevelConfig[] = [
  {
    levelNumber: 1,
    mode: "touch_orbit",
    tier: "beginner",
    difficulty: "Easy",
    difficultyColor: "emerald",
    category: "1-to-1 Counting",
    title: "Count in a Row (1 to 10)",
    shortDesc: "Tap objects in a straight line from left to right to find the total count",
    icon: "⭐",
    skillConcept: "One-to-One Correspondence & Total Amount",
    targetObjective: "Touch each one. The last number tells how many.",
    stepByStep: [
      "Touch each item once from left to right in order.",
      "Listen as the numbers count up: 1, 2, 3...",
      "The last number tells you how many there are in all.",
    ],
    pedagogyTip: "The last number named represents the whole group (cardinality). Keep your finger taps in sync with the numbers!",
    kidTip: "Say one number for each one you touch.",
    audioPrompt: "Level 1: Count in a row! Touch each item in order to find the total.",
  },
  {
    levelNumber: 2,
    mode: "touch_orbit",
    tier: "intermediate",
    difficulty: "Easy",
    difficultyColor: "emerald",
    category: "Scattered Counting",
    title: "Count Scattered Objects (1 to 10)",
    shortDesc: "Touch all scattered objects across the screen without skipping or double-counting",
    icon: "✨",
    skillConcept: "Tracking Scattered Objects",
    targetObjective: "Touch every one. Do not miss any!",
    stepByStep: [
      "Look across the screen from top to bottom.",
      "Tap each uncounted item once to give it a number tag.",
      "Make sure every item is counted without skipping any.",
    ],
    pedagogyTip: "Scanning in an orderly way (like top to bottom) helps count scattered items accurately.",
    kidTip: "Go in order so you do not miss any.",
    audioPrompt: "Level 2: Count scattered objects! Tap each one once until all are counted.",
  },
  {
    levelNumber: 3,
    mode: "touch_orbit",
    tier: "master",
    difficulty: "Easy",
    difficultyColor: "emerald",
    category: "Comparing Amounts",
    title: "Comparing Two Groups (Conservation)",
    shortDesc: "See that spreading items out or grouping them does not change the total count",
    icon: "⚖️",
    skillConcept: "Conservation of Quantity",
    targetObjective: "Count both groups. Which one has more?",
    stepByStep: [
      "Look at Group A (clustered) and Group B (spread out in a line).",
      "Count the items in both groups.",
      "Confirm that both groups have the exact same count.",
    ],
    pedagogyTip: "Spreading items out might make a group look bigger, but the actual count stays exactly the same!",
    kidTip: "Spreading things out does not make more!",
    audioPrompt: "Level 3: Compare both groups! Do they have the same number of items?",
  },
  {
    levelNumber: 4,
    mode: "subitizing_rush",
    tier: "beginner",
    difficulty: "Medium",
    difficultyColor: "cyan",
    category: "Quick Dot Patterns",
    title: "Quick Dice Patterns (1 to 6)",
    shortDesc: "Recognize dice dot patterns in a quick flash without counting one by one",
    icon: "🎲",
    skillConcept: "Instant Recognition of Dot Patterns",
    targetObjective: "Look fast! How many dots did you see?",
    stepByStep: [
      "Look at the center when the dots flash.",
      "Recognize the dot pattern right away.",
      "Tap the matching number on the keypad.",
    ],
    pedagogyTip: "Recognizing dot patterns right away (subitizing) builds strong mental number pictures.",
    kidTip: "Try to see the pattern without counting.",
    audioPrompt: "Level 4: Quick Dice Flash! Look at the dots and tap the number right away.",
  },
  {
    levelNumber: 5,
    mode: "subitizing_rush",
    tier: "intermediate",
    difficulty: "Medium",
    difficultyColor: "cyan",
    category: "Quick Dot Groups",
    title: "Quick Dot Groups (3 to 7)",
    shortDesc: "Recognize scattered dot amounts in a fast flash without one-by-one counting",
    icon: "⚡",
    skillConcept: "Seeing Amounts at a Glance",
    targetObjective: "Look fast! How many dots?",
    stepByStep: [
      "Look at the dot group as a whole.",
      "Feel how many dots are there without counting each one.",
      "Tap your answer on the number pad.",
    ],
    pedagogyTip: "Seeing dot groups at a glance helps you think of numbers as solid quantities.",
    kidTip: "Look for small groups inside the big group.",
    audioPrompt: "Level 5: Quick Dot Groups! Look quickly and tap the count.",
  },
  {
    levelNumber: 6,
    mode: "subitizing_rush",
    tier: "master",
    difficulty: "Medium",
    difficultyColor: "cyan",
    category: "Combining Groups",
    title: "Two-Color Groups (Part-Whole)",
    shortDesc: "See two colored groups in a flash and combine them together (e.g. 3 + 4 = 7)",
    icon: "🔮",
    skillConcept: "Seeing Parts and Total Amount",
    targetObjective: "Two colours. How many all together?",
    stepByStep: [
      "Look at the two different color groups in the flash.",
      "Notice how many in Color 1 and how many in Color 2.",
      "Add both parts together in your head to find the total.",
    ],
    pedagogyTip: "Seeing numbers as two parts (like 5 is 3 and 2) makes mental addition fast and easy.",
    kidTip: "Count one colour, then keep going with the other.",
    audioPrompt: "Level 6: Combine Two Colors! Add both color groups in your head and tap the total.",
  },
  {
    levelNumber: 7,
    mode: "tenframe_rocket",
    tier: "beginner",
    difficulty: "Challenging",
    difficultyColor: "purple",
    category: "Ten-Frame Anchors",
    title: "Ten-Frame: 5 and More",
    shortDesc: "Fill the top 5 first as your anchor, then add more on the bottom row",
    icon: "🛸",
    skillConcept: "Using 5 as an Anchor Benchmark",
    targetObjective: "Fill the top row first. Then add more.",
    stepByStep: [
      "Look at your target number (like 7 or 8).",
      "Fill all 5 cells in the top row first.",
      "Add the remaining dots in the bottom row (7 is 5 + 2).",
      "Tap Launch when your ten-frame is complete.",
    ],
    pedagogyTip: "Seeing numbers using 5 (like 8 is 5 + 3) makes mental math simple.",
    kidTip: "Fill the top row to 5 first. That makes it easy!",
    audioPrompt: "Level 7: Ten-Frame! Fill 5 on top first, then add the rest on the bottom.",
  },
  {
    levelNumber: 8,
    mode: "tenframe_rocket",
    tier: "intermediate",
    difficulty: "Challenging",
    difficultyColor: "purple",
    category: "Making 10",
    title: "Making 10 (Friends of 10)",
    shortDesc: "Find how many empty spaces are needed to make a full ten-frame of 10",
    icon: "🔋",
    skillConcept: "Number Pairs that Make 10",
    targetObjective: "How many more to make 10?",
    stepByStep: [
      "Look at the dots already placed in the ten-frame.",
      "Count the empty spaces needed to reach 10.",
      "Select the missing number that makes 10 with the dots.",
    ],
    pedagogyTip: "Pairs that make 10 (like 7 + 3 and 6 + 4) are key building blocks for all math!",
    kidTip: "Count the empty boxes. That is how many more.",
    audioPrompt: "Level 8: Making 10! Find how many more dots are needed to reach 10.",
  },
  {
    levelNumber: 9,
    mode: "tenframe_rocket",
    tier: "master",
    difficulty: "Challenging",
    difficultyColor: "purple",
    category: "Teen Numbers",
    title: "Teen Numbers (10 + Ones)",
    shortDesc: "Build numbers from 11 to 19 using 1 full ten-frame plus extra ones",
    icon: "🛰️",
    skillConcept: "Place Value for Numbers 11 to 19",
    targetObjective: "Fill one frame to make 10. Then add more.",
    stepByStep: [
      "Notice the first ten-frame is full with 10.",
      "Add dots to the second frame for the ones digit.",
      "See that 10 and ones make the teen number (10 + 4 = 14).",
    ],
    pedagogyTip: "Every teen number is simply 'one ten and some ones'. Double ten-frames show this clearly.",
    kidTip: "One full frame is 10. Then count the extra ones.",
    audioPrompt: "Level 9: Teen Numbers! Combine one full ten with extra ones.",
  },
  {
    levelNumber: 10,
    mode: "froggy_skip",
    tier: "beginner",
    difficulty: "Advanced",
    difficultyColor: "amber",
    category: "Skip Counting",
    title: "Skip Counting by 2s and 5s",
    shortDesc: "Hop along the path by equal steps of 2 or 5 to reach the goal",
    icon: "🐸",
    skillConcept: "Equal-Step Linear Counting",
    targetObjective: "Hop the same size steps. Count as you go!",
    stepByStep: [
      "Check the step size (+2 or +5) on the path.",
      "Tap Hop to jump forward by equal amounts.",
      "Chant the numbers aloud as you hop all the way to the goal.",
    ],
    pedagogyTip: "Skip counting creates equal steps in your mind and prepares you for multiplication.",
    kidTip: "Say the numbers out loud as you hop.",
    audioPrompt: "Level 10: Skip Counting! Hop forward by equal steps of 2 or 5.",
  },
  {
    levelNumber: 11,
    mode: "froggy_skip",
    tier: "intermediate",
    difficulty: "Advanced",
    difficultyColor: "amber",
    category: "Counting by 10s",
    title: "Count by 10s up to 100",
    shortDesc: "Take big leaps of 10 to move smoothly along the path up to 100",
    icon: "🌊",
    skillConcept: "Decade Jumps and Patterns up to 100",
    targetObjective: "Big hops of 10! Count up to 100.",
    stepByStep: [
      "Check the starting number and the +10 step size.",
      "Notice how the tens digit increases with every hop.",
      "Hop all the way across the path to the target.",
    ],
    pedagogyTip: "Counting by 10s (10, 20, 30... 100) helps you navigate place value with ease.",
    kidTip: "Every hop adds 10. Listen to the pattern!",
    audioPrompt: "Level 11: Count by 10s! Take leaps of 10 to move across the path.",
  },
  {
    levelNumber: 12,
    mode: "froggy_skip",
    tier: "master",
    difficulty: "Advanced",
    difficultyColor: "amber",
    category: "Pattern Detective",
    title: "Find the Missing Number",
    shortDesc: "Discover the step rule in the sequence and fill in the missing number",
    icon: "🔍",
    skillConcept: "Number Sequences & Pattern Rules",
    targetObjective: "Which number is missing?",
    stepByStep: [
      "Check the difference between the numbers shown.",
      "See if the numbers are counting up (+) or down (-).",
      "Choose the correct missing number to complete the line.",
    ],
    pedagogyTip: "Finding missing numbers in a line helps you understand how all numbers connect.",
    kidTip: "Look at how much it grows each hop.",
    audioPrompt: "Level 12: Missing Number! Look at the pattern and pick the missing step.",
  },
  {
    levelNumber: 13,
    mode: "base10_foundry",
    tier: "beginner",
    difficulty: "Master",
    difficultyColor: "rose",
    category: "Making Tens",
    title: "Make a Ten (10 Ones = 1 Ten)",
    shortDesc: "Gather 10 loose single blocks and group them into 1 solid Ten-Rod",
    icon: "💎",
    skillConcept: "Grouping: 10 Ones Become 1 Ten",
    targetObjective: "Put 10 ones together. They make 1 ten!",
    stepByStep: [
      "Look at your loose single blocks.",
      "Gather 10 single blocks together.",
      "Group 10 ones into 1 solid Ten-Rod.",
    ],
    pedagogyTip: "10 loose ones can be grouped together and treated as 1 single 'Ten'.",
    kidTip: "10 ones make 1 ten. Put them together!",
    audioPrompt: "Level 13: Make a Ten! Gather 10 single blocks and group them into 1 Ten-Rod.",
  },
  {
    levelNumber: 14,
    mode: "base10_foundry",
    tier: "intermediate",
    difficulty: "Master",
    difficultyColor: "rose",
    category: "Making Hundreds",
    title: "Make a Hundred (10 Tens = 1 Hundred)",
    shortDesc: "Group 10 Ten-Rods into 1 Hundred-Flat and see numbers in expanded form",
    icon: "🌌",
    skillConcept: "Place Value: Hundreds, Tens, and Ones",
    targetObjective: "Put 10 tens together. They make 100!",
    stepByStep: [
      "Group Ten-Rods into a 100-Flat whenever you have 10 tens.",
      "Watch the place value counter show Hundreds, Tens, and Ones.",
      "See that the total amount stays the same when grouped.",
    ],
    pedagogyTip: "Expanded form (100 + 30 + 5 = 135) connects physical blocks directly to written numbers.",
    kidTip: "10 tens make 1 hundred. Put them together!",
    audioPrompt: "Level 14: Make a Hundred! Group 10 Ten-Rods into 100-Flats.",
  },
  {
    levelNumber: 15,
    mode: "base10_foundry",
    tier: "master",
    difficulty: "Master",
    difficultyColor: "rose",
    category: "Place Value Master",
    title: "Build Numbers with Hundreds, Tens & Ones",
    shortDesc: "Build any given number using hundreds, tens, and single ones blocks",
    icon: "👑",
    skillConcept: "Building Numbers up to 100 and Beyond",
    targetObjective: "Build the number with the blocks.",
    stepByStep: [
      "Look at your target number.",
      "Use blocks (+), group (⚡), and break apart (🔄) to make the exact amount.",
      "Tap Check Number to test your build.",
    ],
    pedagogyTip: "Breaking a Ten into 10 Ones is the physical secret behind subtraction regrouping.",
    kidTip: "Use big blocks first, then the small ones.",
    audioPrompt: "Level 15: Place Value Master! Build the target number using hundreds, tens, and ones.",
  },
];

export function getFlowingLevel(levelNum: number): FlowingLevelConfig {
  const found = FLOWING_LEVELS.find((l) => l.levelNumber === levelNum);
  return found || FLOWING_LEVELS[0];
}

export function getLevelInstructionsByLevel(levelNum: number): FlowingLevelConfig {
  return getFlowingLevel(levelNum);
}
