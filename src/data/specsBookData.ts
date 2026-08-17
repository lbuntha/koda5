export interface SpecPage {
  id: string;
  chapterNumber: number;
  chapterTitle: string;
  pageNumber: number;
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: "emerald" | "cyan" | "purple" | "amber" | "rose" | "blue";
  executiveSummary: string;
  contentSections: {
    heading: string;
    body: string;
    calloutBox?: {
      type: "research" | "pedagogy" | "rubric" | "warning" | "formula";
      title: string;
      text: string;
    };
    bulletPoints?: string[];
    tableData?: {
      headers: string[];
      rows: string[][];
    };
  }[];
  interactiveWidgetType?:
    | "touch_counter_demo"
    | "subitize_flash_demo"
    | "ten_frame_demo"
    | "hundred_chart_demo"
    | "base_ten_demo"
    | "socratic_decision_tree";
  keyTakeaways: string[];
  citations?: string[];
}

export interface SpecChapter {
  chapterNumber: number;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  pages: SpecPage[];
}

export const SPECS_BOOK_CHAPTERS: SpecChapter[] = [
  // CHAPTER 1
  {
    chapterNumber: 1,
    title: "Executive Overview & Learning Philosophy",
    subtitle: "From Concrete Physical Quantities to Decimal Place-Value Intuition",
    icon: "🧭",
    color: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400",
    pages: [
      {
        id: "ch1_p1",
        chapterNumber: 1,
        chapterTitle: "Executive Overview & Learning Philosophy",
        pageNumber: 1,
        title: "Curriculum Philosophy & Theoretical Foundations",
        subtitle: "Why counting is the fundamental master bridge for all arithmetic reasoning",
        badge: "Philosophy & Rationale",
        badgeColor: "emerald",
        executiveSummary:
          "Counting is not a trivial rote recitation of words; it is the child's first profound abstraction of physical reality into mathematical structure. Without intuitive counting mechanics and landmark anchors, higher arithmetic degenerates into sluggish memory recall.",
        contentSections: [
          {
            heading: "1.1 The Master Bridge to Algebraic Thinking",
            body: "Early childhood mathematics education often treats counting as a preliminary memorization drill. Contemporary cognitive science demonstrates that counting is a complex synthesis of motor-vocal synchronization, spatial tracking, set partitioning, and perceptual unitizing. When a child masters cardinality and grouping, addition is transformed into intuitive combining and multiplication becomes skip-interval scaling.",
            calloutBox: {
              type: "research",
              title: "Clements & Sarama Learning Trajectory",
              text: "Children do not learn mathematical concepts in isolated fragments. They advance along developmental trajectories where each cognitive leap provides the mental scaffold for the subsequent arithmetic structure (Clements & Sarama, 2009).",
            },
          },
          {
            heading: "1.2 The Concrete-Representational-Abstract (CRA) Framework",
            body: "The Synthesis Tutor architecture strictly follows the CRA sequence. Children first physically touch virtual manipulatives (Concrete), transition to seeing dot patterns and ten-frames (Representational), and finally manipulate expanded notation numbers and equations (Abstract).",
            bulletPoints: [
              "Concrete Tier: Direct 1-to-1 touching with haptic & sound feedback",
              "Representational Tier: 5-and-10 landmark frames, domino matrices, and 100-charts",
              "Abstract Tier: Expanded place-value notations (100 + 40 + 5 = 145) and sequence rules",
            ],
          },
        ],
        keyTakeaways: [
          "Counting is the foundational cognitive gateway for addition, subtraction, and multiplication.",
          "CRA instructional sequencing prevents arithmetic rote memorization and develops spatial intuition.",
          "Every visual interaction in this app corresponds to a validated cognitive developmental milestone.",
        ],
        citations: [
          "Clements, D. H., & Sarama, J. (2009). Learning and Teaching Early Math: The Learning Trajectories Approach. Routledge.",
          "Dehaene, S. (2011). The Number Sense: How the Mind Creates Mathematics. Oxford University Press.",
        ],
      },
      {
        id: "ch1_p2",
        chapterNumber: 1,
        chapterTitle: "Executive Overview & Learning Philosophy",
        pageNumber: 2,
        title: "Target Learner Demographics & Cognitive Progression",
        subtitle: "Developmental mapping across Early Years, Kindergarten, and Grades 1–2",
        badge: "Learner Profiles",
        badgeColor: "cyan",
        executiveSummary:
          "The curriculum adapts dynamically across 3 primary age cohorts, matching motor coordination limits with appropriate cognitive demands and visual feedback speeds.",
        contentSections: [
          {
            heading: "1.3 Developmental Cohort Specifications",
            body: "A three-year-old struggles with unordered tracking due to developing spatial memory, whereas a seven-year-old requires rapid decimal unitizing. The table below specifies the target behaviors across cohorts:",
            tableData: {
              headers: ["Cohort / Age", "Core Counting Focus", "Target Manipulative", "Cognitive Milestone"],
              rows: [
                ["Early Pre-K (Ages 3–4)", "1-to-1 Sync & Small Cardinality (1–5)", "Linear Objects & Sounds", "Stable Order & One Touch per Item"],
                ["Kindergarten (Ages 5–6)", "Subitizing & 10-Frames (1–20)", "Flash Arena & Ten-Frames", "Part-Whole Decomposition & Teen Structure"],
                ["Grades 1–2 (Ages 6–8)", "100-Chart Leaps & Base-10 Bundling (1–100+)", "100-Grid & Place Value Blocks", "Decade Navigation & Unitizing 10 Tens ➔ 100"],
              ],
            },
          },
          {
            heading: "1.4 Socratic Guidance over Direct Correction",
            body: "When a child makes an error (e.g. double-tapping an item), the system does NOT display a discouraging red X. Instead, Koda asks targeted Socratic questions: 'Did each item receive exactly one touch?' or highlights uncounted items with a gentle glowing pulse.",
            calloutBox: {
              type: "pedagogy",
              title: "Zone of Proximal Development (ZPD)",
              text: "By providing visual scaffolding right at the threshold of a child's understanding, the learner experiences autonomous discovery and mathematical confidence (Vygotsky, 1978).",
            },
          },
        ],
        keyTakeaways: [
          "Curriculum scales smoothly across ages 3 to 8+ without jarring difficulty spikes.",
          "Feedback is non-punitive and relies on visual manipulatives and Socratic questions.",
          "Mastery is measured through motor accuracy, response latency, and conceptual transfer.",
        ],
        citations: [
          "Vygotsky, L. S. (1978). Mind in Society: The Development of Higher Psychological Processes. Harvard University Press.",
        ],
      },
    ],
  },

  // CHAPTER 2
  {
    chapterNumber: 2,
    title: "Gelman & Gallistel's 5 Counting Principles",
    subtitle: "The Mathematical Laws Governing Early Number Acquisition",
    icon: "⚖️",
    color: "from-cyan-500/20 to-blue-500/20 border-cyan-500/30 text-cyan-400",
    pages: [
      {
        id: "ch2_p1",
        chapterNumber: 2,
        chapterTitle: "Gelman & Gallistel's 5 Counting Principles",
        pageNumber: 3,
        title: "The How-to-Count Principles (Principles 1–3)",
        subtitle: "1-to-1 Correspondence, Stable Order, and the Cardinal Principle",
        badge: "Gelman Principles 1–3",
        badgeColor: "cyan",
        executiveSummary:
          "In 1978, Rochel Gelman and C.R. Gallistel identified the foundational cognitive rules that every child must master to achieve true numerical competence.",
        contentSections: [
          {
            heading: "2.1 Principle 1: One-to-One Correspondence",
            body: "Each item in a collection must receive exactly one unique number tag, and no tag can be assigned to multiple items. This requires partitioning the set into two mental buckets: 'Already Counted' and 'Yet to be Counted'.",
            calloutBox: {
              type: "formula",
              title: "Mathematical Definition",
              text: "Bijective mapping f: S ➔ {1, 2, ..., n} where S is the set of physical items and n is the final natural number.",
            },
          },
          {
            heading: "2.2 Principle 2: Stable-Order Principle",
            body: "The counting sequence must always follow a consistent, repeatable linguistic order ('one, two, three...', never 'one, three, two, five'). Even if a child uses an unconventional sequence ('1, 2, 4, 8'), as long as they apply it consistently, they have understood the stable-order rule.",
          },
          {
            heading: "2.3 Principle 3: Cardinal Principle",
            body: "The last number tag assigned during counting has a dual meaning: it tags the final element and names the total quantity of the entire set. A novice child who counts 5 objects and recounts when asked 'How many in all?' has not yet internalized cardinality.",
          },
        ],
        interactiveWidgetType: "touch_counter_demo",
        keyTakeaways: [
          "1-to-1 Correspondence requires precise motor-vocal coordination.",
          "Stable Order guarantees that counting is repeatable and predictable.",
          "Cardinality unites sequential counting with whole-set quantity representation.",
        ],
        citations: [
          "Gelman, R., & Gallistel, C. R. (1978). The Child's Understanding of Number. Harvard University Press.",
        ],
      },
      {
        id: "ch2_p2",
        chapterNumber: 2,
        chapterTitle: "Gelman & Gallistel's 5 Counting Principles",
        pageNumber: 4,
        title: "The What-to-Count Principles (Principles 4–5)",
        subtitle: "Abstraction and Order-Irrelevance in Spatial Reasoning",
        badge: "Gelman Principles 4–5",
        badgeColor: "blue",
        executiveSummary:
          "Principles 4 and 5 free the child from physical constraints, teaching them that mathematical counting applies universally regardless of item nature or spatial scanning path.",
        contentSections: [
          {
            heading: "2.4 Principle 4: Abstraction Principle",
            body: "Any collection of entities can be counted together, regardless of differences in size, shape, color, or whether they are tangible objects (apples), sounds (bell chimes), or abstract ideas (wishes). In Level 2 and 3, mixed sets prove this concept directly.",
          },
          {
            heading: "2.5 Principle 5: Order-Irrelevance Principle",
            body: "The counting order of a set does not affect its total count. Counting from left-to-right, right-to-left, or picking items at random always yields the exact same cardinal number n.",
            calloutBox: {
              type: "research",
              title: "Spatial Invariance & Conservation",
              text: "Jean Piaget's conservation experiments demonstrated that young children often judge spread-out rows as having 'more' items. Level 3 explicitly disproves this by comparing compact clusters with spread lines.",
            },
          },
          {
            heading: "2.6 Diagnostic Rubric for Common Misconceptions",
            body: "The table below outlines common errors detected by the Synthesis Tutor telemetry engine:",
            tableData: {
              headers: ["Error Pattern", "Root Cause", "Engine Remediation Action"],
              rows: [
                ["Double-Tapping", "Rote vocal chant outpacing finger taps", "Haptic lock on already tagged items with audio sync"],
                ["Recounting upon 'How Many?'", "Weak cardinality understanding", "Koda highlights the final number tag with glowing halo"],
                ["Spatial Skipping in Scatter", "Lack of systematic scanning path", "Visual trail line connecting previously tagged objects"],
              ],
            },
          },
        ],
        keyTakeaways: [
          "Abstraction allows counting across heterogeneous sets and sensory modalities.",
          "Order-irrelevance establishes that mathematical quantity is invariant to spatial sequence.",
          "Targeted visual cues remediate motor pacing and spatial scanning errors.",
        ],
        citations: [
          "Piaget, J. (1952). The Child's Conception of Number. Routledge & Kegan Paul.",
        ],
      },
    ],
  },

  // CHAPTER 3
  {
    chapterNumber: 3,
    title: "Subitizing, Ten-Frames & Landmark Benchmarks",
    subtitle: "Perceptual Fast-Paths and the Cognitive Power of 5 and 10",
    icon: "🎲",
    color: "from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-400",
    pages: [
      {
        id: "ch3_p1",
        chapterNumber: 3,
        chapterTitle: "Subitizing, Ten-Frames & Landmark Benchmarks",
        pageNumber: 5,
        title: "Perceptual & Conceptual Subitizing Mechanics",
        subtitle: "Instant visual quantity recognition without 1-by-1 counting",
        badge: "Subitizing Dynamics",
        badgeColor: "purple",
        executiveSummary:
          "Subitizing (from the Latin 'subitus' meaning sudden) is the brain's innate ability to recognize small quantities (1–4) instantly. Conceptual subitizing expands this by decomposing larger sets into rapid visual chunks (e.g., 3 + 3 = 6).",
        contentSections: [
          {
            heading: "3.1 Perceptual vs. Conceptual Subitizing",
            body: "Perceptual subitizing operates within milliseconds without conscious mathematical calculation (Stanislas Dehaene's Triple-Code Model). Conceptual subitizing bridges visual perception and arithmetic by recognizing geometric arrangements (dice pips, dominoes, pairs).",
            calloutBox: {
              type: "formula",
              title: "Flash Arena Timing Specifications",
              text: "Level 4 (Canonical Dice): 1200ms flash duration | Level 5 (Irregular Arrays): 900ms flash duration | Level 6 (Dual-Color Part-Whole): 1000ms flash duration.",
            },
          },
          {
            heading: "3.2 Part-Part-Whole Visual Decomposition",
            body: "In Level 6, the screen flashes two distinct colored clusters (e.g., 3 blue dots and 4 yellow dots). The child perceives both sub-groups and combines them mentally: '3 and 4 make 7'. This lays the physical groundwork for addition equations.",
          },
        ],
        interactiveWidgetType: "subitize_flash_demo",
        keyTakeaways: [
          "Subitizing eliminates reliance on slow finger counting.",
          "Geometric dot arrays stimulate right-hemisphere spatial quantity representations.",
          "Part-whole decomposition directly prepares the mind for mental addition.",
        ],
        citations: [
          "Dehaene, S. (2011). The Number Sense. Oxford University Press.",
          "Sarama, J., & Clements, D. H. (2009). Subitizing: What Is It? Why Teach It? Teaching Children Mathematics, 16(7).",
        ],
      },
      {
        id: "ch3_p2",
        chapterNumber: 3,
        chapterTitle: "Subitizing, Ten-Frames & Landmark Benchmarks",
        pageNumber: 6,
        title: "Ten-Frames & Landmark Anchoring (5 & 10)",
        subtitle: "Building mental structures for teen numbers and complements of 10",
        badge: "Ten-Frame Engine",
        badgeColor: "rose",
        executiveSummary:
          "The human mind naturally anchors to 5 (fingers on one hand) and 10 (both hands). Ten-frames organize quantities into 2x5 grids, turning numbers into tangible spatial patterns.",
        contentSections: [
          {
            heading: "3.3 The 5-Benchmark (Top Row Fill)",
            body: "In Level 7, students fill the top 5 cells first. To build the number 8, the child sees '5 on top and 3 on bottom'. Instead of seeing 8 as 8 isolated dots, they see 8 = 5 + 3. This landmark anchor makes mental arithmetic lightning fast.",
          },
          {
            heading: "3.4 Complements of 10 (A + ? = 10)",
            body: "In Level 8, students examine partially filled ten-frames to calculate the missing complement. Seeing 7 dots immediately reveals 3 empty spaces. Memorizing 'Friends of 10' (7+3, 6+4, 8+2) is essential for crossing decades in multi-digit addition.",
            calloutBox: {
              type: "pedagogy",
              title: "Teen Number Architecture (10 + Ones)",
              text: "In Level 9, Double Ten-Frames demonstrate that 14 is NOT just a '1' and a '4' placed next to each other; it is 1 full locked ten-frame (10) plus 4 individual ones. This prevents the classic place-value illusion.",
            },
          },
        ],
        interactiveWidgetType: "ten_frame_demo",
        keyTakeaways: [
          "Ten-frames provide a durable spatial mental model for the base-10 number system.",
          "5-anchors simplify numbers 6 through 9 into manageable composites.",
          "Double ten-frames make place value in teen numbers crystal clear.",
        ],
        citations: [
          "Van de Walle, J. A., et al. (2019). Elementary and Middle School Mathematics: Teaching Developmentally. Pearson.",
        ],
      },
    ],
  },

  // CHAPTER 4
  {
    chapterNumber: 4,
    title: "15-Level Interactive Game Specifications",
    subtitle: "Complete Mechanics, Invariants, Socratic Triggers & XP Calibration",
    icon: "🎮",
    color: "from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-400",
    pages: [
      {
        id: "ch4_p1",
        chapterNumber: 4,
        chapterTitle: "15-Level Interactive Game Specifications",
        pageNumber: 7,
        title: "Tiers 1 & 2: Foundations & Subitizing (Levels 1–6)",
        subtitle: "Detailed mechanical specifications and cognitive targets",
        badge: "Levels 1 to 6 Specs",
        badgeColor: "amber",
        executiveSummary:
          "Levels 1 through 6 establish the sensory and perceptual bedrock of counting, moving from 1-to-1 physical motor tapping to sub-second geometric flash perception.",
        contentSections: [
          {
            heading: "4.1 Level Matrix: Tiers 1 & 2",
            body: "The following specification table governs game state, audio synthesis, and error handling for Levels 1–6:",
            tableData: {
              headers: ["Level # & Title", "Manipulative UI", "Target Range", "Mathematical Invariant", "XP Reward"],
              rows: [
                ["L1: Linear Fleet Tagging", "Horizontal Row of Assets", "1 to 10 Items", "Bijective 1-to-1 Correspondence & Cardinality", "40 XP"],
                ["L2: Scattered Nebula Tracking", "Unordered 2D Field", "4 to 10 Items", "Partitioning Set into Counted vs. Uncounted", "50 XP"],
                ["L3: Conservation Lab", "Dual Clustered vs. Line Rows", "3 to 8 Items", "Spatial Arrangement Invariance (Piaget)", "45 XP"],
                ["L4: Quick Dice Patterns", "1.2s Canonical Flash Arena", "1 to 6 Dots", "Perceptual Subitizing (Geometric Dice)", "55 XP"],
                ["L5: Quick Dot Groups", "0.9s Irregular Scatter Arena", "3 to 7 Dots", "Holistic Density & Non-Standard Arrays", "60 XP"],
                ["L6: Two-Color Groups", "1.0s Dual Color Flash", "Sum 4 to 9", "Part-Part-Whole Mental Decomposition", "70 XP"],
              ],
            },
          },
          {
            heading: "4.2 Socratic Failure Handler for Subitizing",
            body: "If a student selects an incorrect count during a subitizing flash, the system does not fail the level. Instead, the 'Replay Flash' button activates with an expanded duration (+500ms) and voice coach clue: 'Look for two groups of dots and put them together!'",
          },
        ],
        keyTakeaways: [
          "Linear counting builds motor-speech rhythm; scattered tracking trains spatial planning.",
          "Subitizing flash limits force the brain to bypass linear 1-by-1 counting.",
          "Adaptive replay timings prevent student frustration while maintaining challenge.",
        ],
      },
      {
        id: "ch4_p2",
        chapterNumber: 4,
        chapterTitle: "15-Level Interactive Game Specifications",
        pageNumber: 8,
        title: "Tiers 3, 4 & 5: Ten-Frames, Paths & Base-10 (Levels 7–15)",
        subtitle: "Benchmarking, skip-counting rhythms, and decimal unitization",
        badge: "Levels 7 to 15 Specs",
        badgeColor: "amber",
        executiveSummary:
          "Levels 7 through 15 elevate the student from single-digit counting to decade navigation, sequence rule deduction, and multi-unit decimal bundling.",
        contentSections: [
          {
            heading: "4.3 Level Matrix: Tiers 3, 4 & 5",
            body: "The specification table governing advanced ten-frame, path traversal, and base-10 mechanics:",
            tableData: {
              headers: ["Level # & Title", "Interactive Mechanic", "Domain", "Core Mathematical Goal", "XP Reward"],
              rows: [
                ["L7: Ten-Frame 5-Anchor", "2x5 Interactive Grid", "Numbers 6–10", "Fill top 5 first, then bottom row (5+N)", "65 XP"],
                ["L8: Making 10 Complements", "Preloaded 10-Frame", "A + ? = 10", "Calculate empty spaces to make 10", "70 XP"],
                ["L9: Teen Numbers (10+Ones)", "Double 2x5 Grids", "Numbers 11–19", "1 full ten (10) + N extra ones", "80 XP"],
                ["L10: Skip Counting (+2, +5)", "River Lilypad Line", "Multiples of 2 & 5", "Equal-step jumps & multiplication readiness", "75 XP"],
                ["L11: Count by 10s up to 100", "Extended River Span", "Decades 10–100", "Decade traversal & place-value growth", "85 XP"],
                ["L12: Missing Number Detective", "Sequence with Blank Pad", "Algebraic Patterns", "Determine step rule (+2, +5, +10, -2)", "90 XP"],
                ["L13: Make a Ten (10 Ones = 1 Ten)", "Mining Bay & Welder", "Unitizing", "Group 10 loose ones into 1 solid Ten-Rod", "95 XP"],
                ["L14: Make a Hundred", "10 Tens = 1 Hundred", "Expanded Form", "Group 10 Ten-Rods into 1 Hundred-Flat", "100 XP"],
                ["L15: Build Target Numbers", "Hundreds, Tens, Ones", "Place Value Mastery", "Assemble 3-digit targets with unbundling", "120 XP"],
              ],
            },
          },
          {
            heading: "4.4 Unbundling Mechanics in Level 15",
            body: "Level 15 introduces the 'Decompose 1 Ten ➔ 10 Ones' toggle. This allows children to physically experience that 34 can be represented as '3 Tens and 4 Ones' OR '2 Tens and 14 Ones'—the concrete physical secret behind subtraction regrouping.",
          },
        ],
        keyTakeaways: [
          "Skip counting transforms addition into multiplication intuition.",
          "Missing number deduction fosters early algebraic sequence reasoning.",
          "Physical unbundling of Ten-Rods demystifies standard borrowing/regrouping algorithms.",
        ],
      },
    ],
  },

  // CHAPTER 5
  {
    chapterNumber: 5,
    title: "100-Chart Matrix & Decade Leaps Lab",
    subtitle: "Coordinate Geometry of the 10x10 Decimal Matrix",
    icon: "🗺️",
    color: "from-teal-500/20 to-emerald-500/20 border-teal-500/30 text-teal-400",
    pages: [
      {
        id: "ch5_p1",
        chapterNumber: 5,
        chapterTitle: "100-Chart Matrix & Decade Leaps Lab",
        pageNumber: 9,
        title: "The 100-Chart Matrix Navigation Architecture",
        subtitle: "Horizontal ones moves and vertical decade leaps on the 10x10 grid",
        badge: "Matrix Geometry",
        badgeColor: "emerald",
        executiveSummary:
          "The 100-chart is a 10x10 grid where spatial position directly encodes decimal place value: moving horizontally changes the ones digit, while moving vertically changes the tens digit.",
        contentSections: [
          {
            heading: "5.1 Coordinate Translation Rules",
            body: "The 100-chart matrix behaves as a discrete 2D mathematical coordinate space:",
            bulletPoints: [
              "Move Right (+1): Increments the ones digit by 1 (e.g. 34 ➔ 35)",
              "Move Left (-1): Decrements the ones digit by 1 (e.g. 34 ➔ 33)",
              "Move Down (+10): Jumps an entire decade row without recounting ones (e.g. 34 ➔ 44)",
              "Move Up (-10): Decrements the tens digit by 1 (e.g. 34 ➔ 24)",
            ],
            calloutBox: {
              type: "research",
              title: "Eliminating the 'Restart from 1' Trap",
              text: "Without matrix intuition, young children recount from 1 when adding 20 to 34. The 100-chart teaches them to leap 2 rows down (34 ➔ 44 ➔ 54) in seconds.",
            },
          },
          {
            heading: "5.2 Decade Bridging Transitions",
            body: "Crossing decade boundaries (e.g. 29 ➔ 30, 89 ➔ 90) is the most frequent point of failure in early arithmetic. The 100-chart visually shows that moving from 29 to 30 wraps around to the start of the next row.",
          },
        ],
        interactiveWidgetType: "hundred_chart_demo",
        keyTakeaways: [
          "The 100-chart converts place-value arithmetic into intuitive spatial navigation.",
          "Vertical moves (+10 / -10) cement tens place invariance.",
          "Compound jumps (e.g. +23 = 2 down, 3 right) build rapid mental math strategies.",
        ],
      },
      {
        id: "ch5_p2",
        chapterNumber: 5,
        chapterTitle: "100-Chart Matrix & Decade Leaps Lab",
        pageNumber: 10,
        title: "The 6 Core Counting-to-100 Techniques",
        subtitle: "From Counting On to 10s Pods and Base-10 100-Flat Assembly",
        badge: "Counting Techniques",
        badgeColor: "cyan",
        executiveSummary:
          "Counting to 100 is not linear; it is a multi-modal mastery of 6 distinct cognitive techniques that prepare the child for multiplication and multidigit arithmetic.",
        contentSections: [
          {
            heading: "5.3 Comprehensive Techniques Taxonomy",
            body: "The 6 techniques embedded in the dedicated Counting Techniques Lab:",
            tableData: {
              headers: ["Technique Name", "Visual Model", "Cognitive Rule", "Practical Benefit"],
              rows: [
                ["1. 100-Chart Matrix", "10x10 Grid", "Right +1, Left -1, Down +10, Up -10", "Visualizes decimal coordinate structure"],
                ["2. Counting On", "Linear Number Line", "Lock start in head, count up delta", "Eliminates recounting from 1"],
                ["3. Grouping by 10s", "10-Item Pod Bags", "Count tens first, then leftover ones", "Rapid counting of large messy sets"],
                ["4. Decade Bridging", "Decade Threshold Ring", "29 ➔ 30, 99 ➔ 100 transitions", "Prevents stumbling across decade leaps"],
                ["5. Skip Counting (+2, +5)", "River Lilypad Stepping", "Hop equal increments rhythmically", "Multiplication table fluency"],
                ["6. 100-Flat Assembly", "Base-10 Tens Rods", "10 Ten-Rods = 1 Hundred-Flat", "Connects place-value blocks to 100"],
              ],
            },
          },
        ],
        keyTakeaways: [
          "Multi-technique exposure ensures that children do not rely on a single rigid counting strategy.",
          "10-Pods turn scattered clutter into structured base-10 groups.",
          "Decade bridging strengthens verbal counting across century and decade barriers.",
        ],
      },
    ],
  },

  // CHAPTER 6
  {
    chapterNumber: 6,
    title: "Base-10 Unitizing & Place Value Engine",
    subtitle: "Hierarchical Grouping, Expanded Notation & Unbundling",
    icon: "💎",
    color: "from-rose-500/20 to-purple-500/20 border-rose-500/30 text-rose-400",
    pages: [
      {
        id: "ch6_p1",
        chapterNumber: 6,
        chapterTitle: "Base-10 Unitizing & Place Value Engine",
        pageNumber: 11,
        title: "Unitizing: Treating 10 Ones as 1 Single Ten",
        subtitle: "The profound cognitive leap from collection to higher-order unit",
        badge: "Unitizing & Bundling",
        badgeColor: "rose",
        executiveSummary:
          "Unitizing is the ability to simultaneously understand that ten individual units can be grouped and treated as one single collective unit called a 'Ten'.",
        contentSections: [
          {
            heading: "6.1 The Cognitive Hurdle of Unitizing",
            body: "To an adult, 10 is simply a number. To a young child, holding 1 Ten-Rod feels like holding 'one object', yet it represents ten units. In Level 13, the animation shows 10 loose floating ones physically fusing and welding together into a solid Ten-Rod.",
            calloutBox: {
              type: "pedagogy",
              title: "Concrete-to-Abstract Fusion",
              text: "When children see the individual ones fuse into a rod, they preserve the mental quantity while accepting the new single unit name (Fuson, 1990).",
            },
          },
          {
            heading: "6.2 Expanded Notation & Value Conservation",
            body: "Live expanded notation (Hundreds x 100 + Tens x 10 + Ones x 1) updates dynamically as blocks are added or fused. Regardless of whether a student holds 2 Tens + 15 Ones or 3 Tens + 5 Ones, the engine displays that both equal 35.",
          },
        ],
        interactiveWidgetType: "base_ten_demo",
        keyTakeaways: [
          "Unitizing is the cornerstone of the base-10 positional number system.",
          "Visual block fusing links physical items to the abstract numeral in the tens column.",
          "Dynamic expanded notation demonstrates that total value is conserved across regroupings.",
        ],
        citations: [
          "Fuson, K. C. (1990). Conceptual Structures for Multiunit Numbers. Cognition and Instruction, 7(4), 343-403.",
        ],
      },
    ],
  },

  // CHAPTER 7
  {
    chapterNumber: 7,
    title: "Socratic AI & Telemetry Diagnostics",
    subtitle: "Real-time Cognitive Telemetry & Socratic Hint Ladders",
    icon: "🧠",
    color: "from-blue-500/20 to-indigo-500/20 border-blue-500/30 text-blue-400",
    pages: [
      {
        id: "ch7_p1",
        chapterNumber: 7,
        chapterTitle: "Socratic AI & Telemetry Diagnostics",
        pageNumber: 12,
        title: "Socratic Hint Escalation & Telemetry Architecture",
        subtitle: "How Koda guides without giving away answers and logs cognitive metrics",
        badge: "Socratic Engine",
        badgeColor: "blue",
        executiveSummary:
          "The Synthesis Socratic AI Engine operates on a 3-tier escalation ladder: never revealing direct answers, but adjusting visual and verbal scaffolding in real time based on student interaction telemetry.",
        contentSections: [
          {
            heading: "7.1 Socratic 3-Tier Hint Ladder",
            body: "When a student requests assistance or hesitates, Koda provides scaffolded support:",
            tableData: {
              headers: ["Hint Level", "Scaffolding Type", "Example Socratic Intervention"],
              rows: [
                ["Tier 1: Visual Nudge", "Manipulative Highlight", "Gently pulses the uncounted items or empty frame slots"],
                ["Tier 2: Guiding Question", "Conceptual Prompt", "'How many dots do you see in the top row before looking at the bottom?'"],
                ["Tier 3: Concrete Anchor", "Step-by-Step Breakdown", "'Let's count the first 5 together: 1, 2, 3, 4, 5. Now how many more are left?'"],
              ],
            },
          },
          {
            heading: "7.2 Telemetry Tracking Parameters",
            body: "The engine logs student performance across five non-invasive telemetry vectors:",
            bulletPoints: [
              "Motor Pacing Index: Time interval between sequential taps (measures motor-vocal sync)",
              "Scanning Entropy: Spatial vector directionality in scattered counting (detects erratic scanning)",
              "Subitizing Latency: Milliseconds to keypad entry after visual flash",
              "Regrouping Fluidity: Frequency of unbundling/rebundling in place-value tasks",
              "Socratic Independence: Rate of solving problems without Tier 3 hint escalations",
            ],
          },
        ],
        interactiveWidgetType: "socratic_decision_tree",
        keyTakeaways: [
          "Socratic questioning builds autonomous problem-solving resilience.",
          "Telemetry captures the *how* of learning, not just binary correct/incorrect answers.",
          "Real-time diagnostic metrics feed directly into the Parent & Teacher Insights Dashboard.",
        ],
      },
    ],
  },

  // CHAPTER 8
  {
    chapterNumber: 8,
    title: "Teacher & Parent Facilitation Guide",
    subtitle: "Clinical Rubrics, Offline Tactile Activities & UDL Accommodations",
    icon: "📋",
    color: "from-purple-500/20 to-emerald-500/20 border-purple-500/30 text-purple-400",
    pages: [
      {
        id: "ch8_p1",
        chapterNumber: 8,
        chapterTitle: "Teacher & Parent Facilitation Guide",
        pageNumber: 13,
        title: "Clinical Mastery Rubrics & Classroom Implementation",
        subtitle: "Observational assessment criteria and offline tactile bridging exercises",
        badge: "Assessment Rubrics",
        badgeColor: "purple",
        executiveSummary:
          "Designed for classroom teachers and parents, this chapter provides concrete observational checklists, physical manipulative bridging activities, and Universal Design for Learning (UDL) accommodations.",
        contentSections: [
          {
            heading: "8.1 4-Level Mastery Scoring Rubric",
            body: "Use this rubric during one-on-one student clinical interviews:",
            tableData: {
              headers: ["Mastery Level", "Observable Behavior", "Remediation / Extension Action"],
              rows: [
                ["Level 1: Novice", "Recounts set upon 'How many?'; skips or double-counts scattered items", "Daily 1-to-1 linear touch practice with tactile counters"],
                ["Level 2: Developing", "Counts scattered sets accurately; subitizes up to 4; needs fingers for 5+", "Ten-frame card flashes and domino dot matching"],
                ["Level 3: Proficient", "Subitizes up to 6; uses 5-and-10 anchors; counts on from any start", "100-chart matrix navigation and river skip-counting"],
                ["Level 4: Master", "Decomposes base-10 blocks fluidly; unbundles tens for regrouping", "Challenge with 3-digit expanded notation and sequence mystery puzzles"],
              ],
            },
          },
          {
            heading: "8.2 Physical Offline Tactile Extensions",
            body: "Reinforce digital learning with hands-on physical manipulatives at home or in class:",
            bulletPoints: [
              "Egg Carton Ten-Frames: Place 10 plastic eggs or stones in a 2x5 carton to practice Friends of 10.",
              "Hopscotch Number Line: Draw an outdoor chalk line to physicalize skip-counting leaps by 2s and 5s.",
              "Bundle Sticks: Use craft sticks and rubber bands to bundle groups of 10 ones into tens rods.",
            ],
          },
        ],
        keyTakeaways: [
          "Clinical rubrics evaluate conceptual depth rather than speed.",
          "Combining digital interactive manipulatives with physical tactile materials yields optimal retention.",
          "Universal Design for Learning (UDL) ensures accessibility for diverse learning needs.",
        ],
      },
    ],
  },
];
