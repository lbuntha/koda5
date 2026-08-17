export type CountingTier = "beginner" | "intermediate" | "advanced" | "master";

export interface CountingStageInfo {
  id: CountingTier;
  levelNumber: number;
  title: string;
  subtitle: string;
  targetAudience: string;
  iconName: string;
  colorTheme: {
    primary: string;
    border: string;
    bg: string;
    glow: string;
    badge: string;
  };
  cognitiveShift: string;
  keySkills: string[];
  visualizerDescription: string;
}

export interface CountingQuizQuestion {
  id: string;
  tier: CountingTier;
  question: string;
  visualDiagram: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  coreConcept: string;
  optionalAiHint: {
    socraticClue: string;
    guidingQuestion: string;
    visualTip: string;
  };
}

export const COUNTING_STAGES: Record<CountingTier, CountingStageInfo> = {
  beginner: {
    id: "beginner",
    levelNumber: 1,
    title: "1-to-1 Correspondence & Subitizing",
    subtitle: "Level 1: Foundational Perceptual Counting",
    targetAudience: "Ages 4–6 • Early Elementary",
    iconName: "CircleDot",
    colorTheme: {
      primary: "text-emerald-400",
      border: "border-emerald-500/40",
      bg: "bg-emerald-950/30",
      glow: "shadow-[0_0_20px_rgba(16,185,129,0.25)]",
      badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    },
    cognitiveShift:
      "Moving from reciting number words by rote memory to physically matching each spoken number to one object (one-to-one correspondence) and instantly recognizing quantities of 1–6 without counting one-by-one (perceptual and conceptual subitizing).",
    keySkills: [
      "1-to-1 Tagging (every item receives exactly one count)",
      "Cardinal Principle (last count represents the total quantity)",
      "Subitizing (instant pattern recognition on dice & 10-frames)",
      "Conservation of quantity regardless of spatial arrangement",
    ],
    visualizerDescription:
      "Interactive 10-frame dot matrix and scatter clusters with instant subitizing recognition groups.",
  },

  intermediate: {
    id: "intermediate",
    levelNumber: 2,
    title: "Skip Counting & Rhythmic Patterns",
    subtitle: "Level 2: Relational & Linear Stepping",
    targetAudience: "Ages 6–8 • Grades 1–2",
    iconName: "Zap",
    colorTheme: {
      primary: "text-cyan-400",
      border: "border-cyan-500/40",
      bg: "bg-cyan-950/30",
      glow: "shadow-[0_0_20px_rgba(34,211,238,0.25)]",
      badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
    },
    cognitiveShift:
      "Transitioning from unitary (+1) counting to grouping in uniform equal steps (+2, +5, +10, +3). Learners perceive numbers as positions along an open number line and master 'counting on' from any arbitrary start point rather than restarting at 1.",
    keySkills: [
      "Skip counting forward & backward by 2s, 5s, 10s, and 3s",
      "Counting on from any arbitrary starting number (e.g. 37 + 4)",
      "Bridging decade barriers (e.g. crossing 29 ➔ 30)",
      "Foundational bridge to multiplication as repeated grouping",
    ],
    visualizerDescription:
      "Interactive animated number line with hop trails, configurable step intervals, and rhythm pulse.",
  },

  advanced: {
    id: "advanced",
    levelNumber: 3,
    title: "Place Value Bundling & Regrouping",
    subtitle: "Level 3: Positional Multi-Unit Counting",
    targetAudience: "Ages 8–10 • Grades 3–4",
    iconName: "Layers",
    colorTheme: {
      primary: "text-purple-400",
      border: "border-purple-500/40",
      bg: "bg-purple-950/30",
      glow: "shadow-[0_0_20px_rgba(168,85,247,0.25)]",
      badge: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    },
    cognitiveShift:
      "Understanding that the same digit has vastly different values based on its spatial column. Learners bundle 10 single units into one ten-rod, and 10 ten-rods into one hundred-flat, mastering multi-digit hierarchical counting and mental regrouping.",
    keySkills: [
      "Hierarchical bundling: 10 Ones = 1 Ten, 10 Tens = 1 Hundred",
      "Counting mixed collections of Hundreds, Tens, and loose Ones",
      "Zero as a critical place-holding counter (e.g. 408 vs 48)",
      "Decomposing numbers into expanded notation (300 + 40 + 7 = 347)",
    ],
    visualizerDescription:
      "Interactive Base-10 Bundling Bank with live unit combination and unbundling animations.",
  },

  master: {
    id: "master",
    levelNumber: 4,
    title: "Combinatorics & Systematic Counting",
    subtitle: "Level 4: Abstract & Structural Enumeration",
    targetAudience: "Ages 10+ • Grades 5–8 & Math Olympiad",
    iconName: "Cpu",
    colorTheme: {
      primary: "text-amber-400",
      border: "border-amber-500/40",
      bg: "bg-amber-950/30",
      glow: "shadow-[0_0_20px_rgba(251,191,36,0.25)]",
      badge: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    },
    cognitiveShift:
      "Evolving from physical and sequential counting to mathematical combinatorics. Counting complex sets without listing every element one by one using the Fundamental Counting Principle (m × n), permutations, combinations, tree branching, and grid pathways.",
    keySkills: [
      "Fundamental Counting Principle (Multiplication rule of choices)",
      "Systematic tree diagram & Cartesian coordinate enumeration",
      "Permutations (ordered arrangements: n!)",
      "Combinations (unordered subsets: n choose k) & Grid path counts",
    ],
    visualizerDescription:
      "Interactive Combinatorics Decision Tree & Cartesian matrix visualizer calculating dynamic combinations.",
  },
};

export const COUNTING_QUIZ_QUESTIONS: CountingQuizQuestion[] = [
  // --- TIER 1: BEGINNER (1-to-1 & Subitizing) ---
  {
    id: "cnt_beg_1",
    tier: "beginner",
    question: "Without counting each dot individually, what total quantity is represented on this standard ten-frame?",
    visualDiagram:
      "Ten-Frame Array:\n┌───┬───┬───┬───┬───┐\n│ 🔵│ 🔵│ 🔵│ 🔵│ 🔵│  (Top row full = 5)\n├───┼───┼───┼───┼───┤\n│ 🔵│ 🔵│ ⬜│ ⬜│ ⬜│  (Bottom row = 2)\n└───┴───┴───┴───┴───┘",
    options: ["6 dots", "7 dots", "8 dots", "9 dots"],
    correctIndex: 1,
    explanation:
      "A standard ten-frame uses the '5-anchor' structure: a full top row is instantly recognized as 5 (subitized). Adding the 2 bottom dots gives 5 + 2 = 7 dots immediately.",
    coreConcept: "5-Anchor Subitizing Structure",
    optionalAiHint: {
      socraticClue: "Look at the top row first. In a ten-frame, five dots completely fill the top half.",
      guidingQuestion: "If the top row is full (5) and there are 2 more below it, what is 5 + 2?",
      visualTip: "Group the top 5 together, then count on: 5 ... 6, 7!",
    },
  },
  {
    id: "cnt_beg_2",
    tier: "beginner",
    question: "A child counts a row of 6 apples from left to right: '1, 2, 3, 4, 5, 6'. If the apples are rearranged in a circle, how many apples are there?",
    visualDiagram:
      "Row:    🍎 🍎 🍎 🍎 🍎 🍎   (Count = 6)\n              ▼ Rearranged ▼\nCircle:     🍎   🍎\n          🍎       🍎\n            🍎   🍎",
    options: [
      "Exactly 6 apples (Quantity is conserved)",
      "7 apples because a circle looks bigger",
      "5 apples because circles take less length",
      "It cannot be determined without recounting",
    ],
    correctIndex: 0,
    explanation:
      "Conservation of Number Principle: The total quantity (cardinality) of objects remains identical regardless of how they are spread out, grouped, or rearranged.",
    coreConcept: "Conservation of Quantity",
    optionalAiHint: {
      socraticClue: "Did any apples get added or taken away when they were moved into a circle?",
      guidingQuestion: "Does moving toys around a rug change how many toys exist?",
      visualTip: "Spatial shape changes, but the set elements remain 100% unchanged!",
    },
  },
  {
    id: "cnt_beg_3",
    tier: "beginner",
    question: "When you roll a standard six-sided die and instantly know the dots show '5' without counting one by one, what cognitive math skill are you using?",
    visualDiagram:
      "Die Face:\n┌─────────┐\n│ ⚫     ⚫│\n│    ⚫   │  ➔ Instantly seen as '5'\n│ ⚫     ⚫│\n└─────────┘",
    options: [
      "Subitizing (Instant perceptual pattern recognition)",
      "Multiplication",
      "Long division",
      "Geometric angle measurement",
    ],
    correctIndex: 0,
    explanation:
      "Subitizing is the ability to instantly perceive the exact number of items in a small group without counting one by one. Our brains recognize familiar spatial configurations (like the 4 corners + 1 center on a die).",
    coreConcept: "Perceptual Subitizing",
    optionalAiHint: {
      socraticClue: "Think about the special word math educators use for 'instant seeing of quantities'.",
      guidingQuestion: "Are you counting '1, 2, 3, 4, 5' or seeing the whole 5-pattern at once?",
      visualTip: "The classic dice face with 4 corners and 1 middle forms an iconic 'X' pattern.",
    },
  },

  // --- TIER 2: INTERMEDIATE (Skip Counting & Number Line) ---
  {
    id: "cnt_int_1",
    tier: "intermediate",
    question: "What is the missing value in this skip-counting sequence: 15, 20, 25, [ ? ], 35, 40?",
    visualDiagram:
      "Number Line:\n 15 ────(+5)────> 20 ────(+5)────> 25 ────(+5)────> [ ? ] ────(+5)────> 35 ────(+5)────> 40",
    options: ["28", "30", "32", "33"],
    correctIndex: 1,
    explanation:
      "The sequence is skip-counting by +5 at each step. Adding 5 to 25 gives 25 + 5 = 30.",
    coreConcept: "Equal Step Intervals (+5)",
    optionalAiHint: {
      socraticClue: "Check the difference between consecutive numbers: 20 - 15 = 5, and 25 - 20 = 5.",
      guidingQuestion: "What number comes 5 steps after 25?",
      visualTip: "Notice the pattern in the ones digit: 5, 0, 5, [ ? ], 5, 0.",
    },
  },
  {
    id: "cnt_int_2",
    tier: "intermediate",
    question: "You have 8 pairs of socks. To count the total number of individual socks efficiently, which skip-counting strategy is best?",
    visualDiagram:
      "8 Pairs: 🧦🧦 | 🧦🧦 | 🧦🧦 | 🧦🧦 | 🧦🧦 | 🧦🧦 | 🧦🧦 | 🧦🧦\nSkip:     2     4     6     8    10    12    14    [ ? ]",
    options: [
      "Skip-count by 2s eight times to reach 16",
      "Count by 10s to reach 80",
      "Subtract 2 from 8 to get 6",
      "Count by 5s to reach 40",
    ],
    correctIndex: 0,
    explanation:
      "Since socks come in pairs of 2, skip-counting by 2s (2, 4, 6, 8, 10, 12, 14, 16) is the most direct strategy. 8 pairs × 2 socks/pair = 16 individual socks.",
    coreConcept: "Grouping in Pairs (+2)",
    optionalAiHint: {
      socraticClue: "Each pair contains exactly 2 socks. You have 8 such groups.",
      guidingQuestion: "If you count 2, 4, 6, 8... what is the 8th number in the sequence?",
      visualTip: "Double 8 is 16!",
    },
  },
  {
    id: "cnt_int_3",
    tier: "intermediate",
    question: "When counting backwards by 10s starting from 84, what are the next three numbers in the countdown?",
    visualDiagram:
      "Countdown Strip:\n[ 84 ] ──(-10)──> [ ? ] ──(-10)──> [ ? ] ──(-10)──> [ ? ]",
    options: [
      "74, 64, 54",
      "83, 82, 81",
      "74, 73, 72",
      "94, 104, 114",
    ],
    correctIndex: 0,
    explanation:
      "When subtracting 10, the tens digit decreases by 1 while the ones digit stays constant (4). Starting at 84: 84 - 10 = 74, 74 - 10 = 64, 64 - 10 = 54.",
    coreConcept: "Place Value Decade Shifts (-10)",
    optionalAiHint: {
      socraticClue: "Notice that counting backwards by 10 only alters the tens column; the ones digit remains 4.",
      guidingQuestion: "What is 8 tens minus 1 ten? 7 tens minus 1 ten?",
      visualTip: "Watch the leading digit step down: 84 ➔ 74 ➔ 64 ➔ 54.",
    },
  },

  // --- TIER 3: ADVANCED (Place Value Bundling & Regrouping) ---
  {
    id: "cnt_adv_1",
    tier: "advanced",
    question: "A bank teller has 3 Hundred-flats, 14 Ten-rods, and 6 Unit-cubes on the counter. What is the total numerical value after full base-10 regrouping?",
    visualDiagram:
      "Workspace Blocks:\n[ 3 Hundreds = 300 ]\n[ 14 Tens = 140 ] ───(Regroup 10 Tens into 1 Hundred)───>\n[ 6 Ones = 6 ]\nTotal = [ ? ]",
    options: ["446", "346", "3146", "416"],
    correctIndex: 0,
    explanation:
      "14 Tens equals 140, which is 1 Hundred and 4 Tens. Adding this 1 Hundred to the 3 Hundreds gives 4 Hundreds. Combining 4 Hundreds (400) + 4 Tens (40) + 6 Ones (6) yields exactly 446.",
    coreConcept: "Multi-Tier Base-10 Regrouping",
    optionalAiHint: {
      socraticClue: "10 ten-rods equal 1 hundred-flat. You can trade 10 of the 14 tens for 1 extra hundred.",
      guidingQuestion: "3 Hundreds + 1 New Hundred = 4 Hundreds. How many tens remain from the 14?",
      visualTip: "4 Hundreds (400) + 4 Tens (40) + 6 Ones (6) = 446.",
    },
  },
  {
    id: "cnt_adv_2",
    tier: "advanced",
    question: "Why does the digit '0' in the number 5,082 play a crucial role when counting or writing numbers?",
    visualDiagram:
      "Place Value Columns:\n Thousands (5) | Hundreds (0) | Tens (8) | Ones (2)\n      5,000    +      0       +    80    +    2    =  5,082",
    options: [
      "It acts as a placeholder to keep the '5' in the thousands column",
      "It increases the total value by multiplying everything by zero",
      "It has no purpose and can be deleted to write 582",
      "It indicates the number is an odd integer",
    ],
    correctIndex: 0,
    explanation:
      "Zero serves as an indispensable placeholder. Without the 0 in the hundreds column, writing '582' would mean 5 hundreds, 8 tens, and 2 ones—a completely different value than 5,082.",
    coreConcept: "Zero as a Positional Placeholder",
    optionalAiHint: {
      socraticClue: "Compare 5082 with 582. What happens to the digit 5 if you remove the 0?",
      guidingQuestion: "Does 582 have the same magnitude as five-thousand and eighty-two?",
      visualTip: "The 0 holds the empty Hundreds room open so the 5 stays in the Thousands room.",
    },
  },
  {
    id: "cnt_adv_3",
    tier: "advanced",
    question: "If you count upward by Hundreds starting from the number 850, what are the next three numbers in the counting sequence?",
    visualDiagram:
      "Counting Track:\n[ 850 ] ──(+100)──> [ ? ] ──(+100)──> [ ? ] ──(+100)──> [ ? ]",
    options: [
      "950, 1,050, 1,150",
      "860, 870, 880",
      "900, 1000, 1100",
      "950, 960, 970",
    ],
    correctIndex: 0,
    explanation:
      "Counting by +100 increments the hundreds digit: 850 + 100 = 950. Adding another 100 bridges to 1,050 (regrouping 10 hundreds into 1 thousand), then 1,150. The '50' remainder stays untouched.",
    coreConcept: "Bridging the Thousand Boundary",
    optionalAiHint: {
      socraticClue: "Notice 850 + 100 = 950. When you add 100 to 950, 9 hundreds + 1 hundred = 10 hundreds (1,000).",
      guidingQuestion: "What is 1,000 + 50?",
      visualTip: "850 ➔ 950 ➔ 1050 ➔ 1150.",
    },
  },

  // --- TIER 4: MASTER (Combinatorics & Systematic Counting) ---
  {
    id: "cnt_mst_1",
    tier: "master",
    question: "An ice cream parlor offers 4 flavors of ice cream (Vanilla, Chocolate, Strawberry, Mint) and 3 toppings (Sprinkles, Fudge, Caramel). Using the Fundamental Counting Principle, how many distinct 1-flavor + 1-topping sundaes can be created?",
    visualDiagram:
      "Decision Tree:\nFlavors (4) ──┬──> Vanilla   ───(3 toppings)───> 3 Sundaes\n              ├──> Chocolate ───(3 toppings)───> 3 Sundaes\n              ├──> Strawberry───(3 toppings)───> 3 Sundaes\n              └──> Mint      ───(3 toppings)───> 3 Sundaes\nTotal Sundaes = 4 × 3 = [ ? ]",
    options: ["12 sundaes", "7 sundaes", "16 sundaes", "9 sundaes"],
    correctIndex: 0,
    explanation:
      "The Fundamental Counting Principle states that if one event has 'm' outcomes and a second independent event has 'n' outcomes, the total number of combinations is m × n. Here: 4 flavors × 3 toppings = 12 distinct sundae combinations.",
    coreConcept: "Fundamental Counting Principle (m × n)",
    optionalAiHint: {
      socraticClue: "For EACH of the 4 flavors, there are 3 possible topping branches.",
      guidingQuestion: "If you have 4 groups with 3 choices in each group, what is 4 multiplied by 3?",
      visualTip: "Vanilla(3) + Choc(3) + Straw(3) + Mint(3) = 12.",
    },
  },
  {
    id: "cnt_mst_2",
    tier: "master",
    question: "Four runners (A, B, C, D) compete in a sprint race. How many different 1st, 2nd, 3rd, and 4th place finishing orders (permutations) are possible if there are no ties?",
    visualDiagram:
      "Permutation Slots:\n[ 1st Place ]  ×  [ 2nd Place ]  ×  [ 3rd Place ]  ×  [ 4th Place ]\n (4 choices)       (3 choices)       (2 choices)       (1 choice)\n Total Orders = 4! = 4 × 3 × 2 × 1 = [ ? ]",
    options: ["24 orders (4!)", "16 orders", "10 orders", "12 orders"],
    correctIndex: 0,
    explanation:
      "To count permutations (ordered arrangements), fill each position sequentially: 4 choices for 1st place × 3 remaining choices for 2nd × 2 choices for 3rd × 1 choice for 4th. 4! = 4 × 3 × 2 × 1 = 24 total finishing orders.",
    coreConcept: "Factorial Permutations (n!)",
    optionalAiHint: {
      socraticClue: "Any of the 4 runners can win 1st. Once 1st is chosen, only 3 runners can get 2nd.",
      guidingQuestion: "What is 4 × 3 × 2 × 1?",
      visualTip: "4 × 3 = 12; 12 × 2 = 24; 24 × 1 = 24.",
    },
  },
  {
    id: "cnt_mst_3",
    tier: "master",
    question: "At a math club meeting, 5 students meet and each person shakes hands exactly once with every other person. How many total handshakes occur?",
    visualDiagram:
      "Handshake Network (5 Nodes):\nStudent 1 shakes with: S2, S3, S4, S5 (4 shakes)\nStudent 2 shakes with: S3, S4, S5     (3 new shakes)\nStudent 3 shakes with: S4, S5         (2 new shakes)\nStudent 4 shakes with: S5             (1 new shake)\nTotal = 4 + 3 + 2 + 1 = [ ? ]  OR  (5 × 4) / 2 = [ ? ]",
    options: [
      "10 handshakes",
      "20 handshakes",
      "25 handshakes",
      "15 handshakes",
    ],
    correctIndex: 0,
    explanation:
      "This is an unordered combination of 5 choose 2 (n(n-1)/2). Each of the 5 students shakes hands with 4 others (5 × 4 = 20), but because a handshake between A & B is the same event as B & A, we divide by 2: 20 ÷ 2 = 10 handshakes.",
    coreConcept: "Combinations (n choose 2) & Triangular Sums",
    optionalAiHint: {
      socraticClue: "If Alice shakes Bob's hand, does Bob need to shake Alice's hand again? No, it's 1 shared handshake!",
      guidingQuestion: "Add the new handshakes: 4 + 3 + 2 + 1 = ?",
      visualTip: "Sum of integers from 1 to 4: 4 + 3 + 2 + 1 = 10.",
    },
  },
];
