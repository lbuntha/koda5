import { SkillProgressionModel } from "../../../../types/skillProgression";

export const COUNTING_PROGRESSION_DATA: SkillProgressionModel = {
  id: "counting_foundations",
  skillName: "Counting & Cardinality Master Track",
  domain: "Foundational Number Sense",
  summary:
    "Counting is the master bridge to all arithmetic. A child moves from physical 1-to-1 touch counting, to subitizing flash perception, ten-frame benchmark structuring, skip-counting jump lines, and multi-unit decimal bundling.",
  accentColor: "emerald",
  foundationalRationale:
    "Without deep perceptual counting and anchoring to 5/10, addition is just slow finger counting and multiplication is rote memory. Mastering counting transforms numbers from abstract symbols into tangible mental quantities.",
  levels: [
    // LEVEL 1: 1-to-1 Touch Correspondence & Cardinality
    {
      levelNumber: 1,
      id: "cnt_lvl_1",
      title: "1-to-1 Touch Correspondence & Cardinality",
      tier: "novice",
      ageGuidance: "Ages 3–5 • Early Learner",
      cognitiveLeap:
        "Connecting physical objects to spoken number words in strict 1-to-1 sync, and recognizing that the final number spoken represents the entire set quantity (Cardinal Principle).",
      keyMilestones: [
        "One touch per object (no skipping or double-tapping)",
        "Stable counting order ('1, 2, 3, 4, 5...')",
        "Cardinality: answering 'how many in all?' without recounting",
        "Conservation of quantity when items are rearranged",
      ],
      visualizerType: "touch_counting",
      interactiveChallenge: {
        title: "Tag & Count the Orbit Objects",
        instructions:
          "Tap each floating space object one by one to attach a number tag. Notice how the last tagged number equals the total!",
        targetGoal: "Tag all 7 space objects without missing any",
        rewardXp: 40,
        initialConfig: { count: 7, emoji: "🚀" },
      },
      bridgeToNextSkills: {
        unlocksSkill: "Level 2 Subitizing & Stage 2 Sorting",
        whyItMatters:
          "Once a child understands that each physical item holds exactly 1 unit of value, they can group objects by attributes (color/shape) and compare collections.",
      },
      masteryQuiz: [
        {
          id: "q_lvl1_1",
          question: "A child counts 5 stars from left to right: '1, 2, 3, 4, 5'. When asked 'How many stars are there altogether?', what should the child answer?",
          visualDiagram: "⭐ ⭐ ⭐ ⭐ ⭐  ➔ Counted: '1, 2, 3, 4, 5'",
          options: ["5 stars (The last number named gives the total)", "1 star (Only the first one)", "15 stars", "You have to recount from 1 again"],
          correctIndex: 0,
          explanation: "The Cardinality Principle states that the last counting word used when tagging a set represents the total number of elements in that set.",
          coreConcept: "Cardinal Principle",
          optionalAiHint: {
            socraticClue: "Think about what the final number in a count tells you about the whole group.",
            guidingQuestion: "If you counted up to 5, how many items are in the whole collection?",
            visualTip: "The last tag #5 encompasses the entire set of 5 stars!",
          },
        },
        {
          id: "q_lvl1_2",
          question: "If 6 coins in a straight row are pushed into a messy pile, how many coins are in the pile now?",
          visualDiagram: "Row: 🪙 🪙 🪙 🪙 🪙 🪙 (6 coins) ──> Pile: 🪙🪙🪙🪙🪙🪙",
          options: ["Exactly 6 coins (Quantity is conserved)", "7 coins because a pile looks higher", "5 coins", "Zero coins"],
          correctIndex: 0,
          explanation: "Conservation of Number: Moving, scattering, or piling objects changes their spatial appearance, but does not alter the actual count.",
          coreConcept: "Conservation of Number",
          optionalAiHint: {
            socraticClue: "Did anyone add or remove any coins?",
            guidingQuestion: "Does shifting objects change how many exist?",
            visualTip: "Same items = same exact count, no matter the arrangement!",
          },
        },
        {
          id: "q_lvl1_3",
          question: "What is the common mistake in 'rote counting' that touch-counting fixes?",
          options: [
            "Saying numbers faster than hands can point, leading to mismatched counts",
            "Writing numbers backwards",
            "Counting only even numbers",
            "Forgetting the color of the objects",
          ],
          correctIndex: 0,
          explanation: "1-to-1 Correspondence requires matching one touch to one spoken word. Young children often recite '1-2-3-4-5' quickly while only touching 3 items.",
          coreConcept: "1-to-1 Motor-Vocal Sync",
          optionalAiHint: {
            socraticClue: "What happens if your mouth says 'four' while your finger is on item #2?",
            guidingQuestion: "Why is it important to touch exactly one item for each number word?",
            visualTip: "One touch = One number name!",
          },
        },
      ],
    },

    // LEVEL 2: Perceptual & Conceptual Subitizing (Pattern Seeing)
    {
      levelNumber: 2,
      id: "cnt_lvl_2",
      title: "Perceptual & Conceptual Subitizing",
      tier: "explorer",
      ageGuidance: "Ages 4–6 • Kindergarten",
      cognitiveLeap:
        "Perceiving small quantities (1–6) instantly without counting one-by-one, and chunking larger groups (e.g., 4 + 2 on a domino) into instant mental composites.",
      keyMilestones: [
        "Perceptual subitizing of 1–4 dots in under 1 second",
        "Dice face recognition (1 to 6)",
        "Conceptual subitizing (seeing 6 as 3 + 3 or 5 + 1)",
        "Freedom from unitary (+1) counting for small quantities",
      ],
      visualizerType: "subitizing_flash",
      interactiveChallenge: {
        title: "Flash Subitizing Challenge",
        instructions:
          "Watch the dot pattern flash for 1 second. Try to perceive the total quantity at a single glance without counting one-by-one!",
        targetGoal: "Score 3 correct instant flash guesses in a row",
        rewardXp: 50,
      },
      bridgeToNextSkills: {
        unlocksSkill: "Level 3 Ten-Frames & Stage 4 Number Bonds",
        whyItMatters:
          "Children who subitize see numbers as structured parts (e.g. 5 is 4 and 1), which directly powers fact fluency and mental addition without finger counting.",
      },
      masteryQuiz: [
        {
          id: "q_lvl2_1",
          question: "When you look at a standard die and instantly know it shows '5' without counting each dot, what skill are you using?",
          visualDiagram: "Die Face: [ : : . ] ➔ Instantly recognized as 5",
          options: ["Subitizing (Instant quantity recognition)", "Multiplication", "Estimation", "Long Division"],
          correctIndex: 0,
          explanation: "Subitizing is the rapid, accurate perceptual judgment of small numbers of items without counting one by one.",
          coreConcept: "Perceptual Subitizing",
          optionalAiHint: {
            socraticClue: "What do cognitive scientists call the instant seeing of small dot patterns?",
            guidingQuestion: "Are you counting '1, 2, 3, 4, 5' or seeing the whole 5-shape instantly?",
            visualTip: "The 4 corners + 1 center forms an iconic 5-pattern!",
          },
        },
        {
          id: "q_lvl2_2",
          question: "How does a child conceptually subitize a group of 7 dots arranged as a group of 4 and a group of 3?",
          visualDiagram: "Group A: 🔵🔵🔵🔵 (4)  +  Group B: 🔵🔵🔵 (3) ➔ Total: 7",
          options: [
            "Recognizes 4 and 3 instantly, then mentally combines them into 7",
            "Recounts all 7 dots from 1 one by one with their finger",
            "Guesses randomly between 6 and 8",
            "Multiplies 4 × 3",
          ],
          correctIndex: 0,
          explanation: "Conceptual subitizing is recognizing smaller subitized subgroups (4 and 3) and automatically synthesizing them into the total (7).",
          coreConcept: "Conceptual Subitizing (Part-Whole)",
          optionalAiHint: {
            socraticClue: "Break the image into two recognizable friendly chunks.",
            guidingQuestion: "If you see a cluster of 4 on the left and 3 on the right, what is 4 + 3?",
            visualTip: "See the parts (4 & 3) to know the whole (7)!",
          },
        },
        {
          id: "q_lvl2_3",
          question: "Why is subitizing more powerful than one-by-one counting for early mental math?",
          options: [
            "It builds mental imagery and part-whole relationships instead of slow mechanical counting",
            "It is required by the calculator",
            "It only works on computers",
            "It removes the need to ever learn numbers greater than 10",
          ],
          correctIndex: 0,
          explanation: "Subitizing trains the brain to visualize numbers as spatial compositions, laying the essential groundwork for addition and decomposition.",
          coreConcept: "Mental Representation",
          optionalAiHint: {
            socraticClue: "Think about speed and visualizing numbers as shapes vs touching fingers.",
            guidingQuestion: "Does seeing patterns help you add faster in your head?",
            visualTip: "Pattern seeing builds flexible mental math muscles!",
          },
        },
      ],
    },

    // LEVEL 3: Ten-Frame & Benchmark Anchoring (To 5 and 10)
    {
      levelNumber: 3,
      id: "cnt_lvl_3",
      title: "Ten-Frame & Landmark Anchoring (5 & 10)",
      tier: "practitioner",
      ageGuidance: "Ages 5–7 • Kindergarten & Grade 1",
      cognitiveLeap:
        "Using 5 and 10 as structural anchor landmarks. Seeing numbers not just as isolated quantities, but in relation to 5 and 10 (e.g. 8 is '5 and 3 more', or '2 away from 10').",
      keyMilestones: [
        "Filling 10-frames with automatic top-row (5) recognition",
        "Instant identification of complements to 10 (8 + 2 = 10)",
        "Counting on from 5 rather than restarting at 1",
        "Understanding 'teen' numbers as 10 and some ones (14 = 10 + 4)",
      ],
      visualizerType: "ten_frame_anchor",
      interactiveChallenge: {
        title: "10-Frame Anchor Workshop",
        instructions:
          "Fill the ten-frame to show 8. Notice how 8 fills the top 5 plus 3 in the bottom row, leaving 2 empty spaces to reach 10!",
        targetGoal: "Construct target quantities 6, 8, and 9 on the 10-frame",
        rewardXp: 60,
      },
      bridgeToNextSkills: {
        unlocksSkill: "Stage 5 Visual Addition & Stage 6 Subtraction",
        whyItMatters:
          "The 'Make 10' addition strategy (e.g., 8 + 5 = 8 + 2 + 3 = 10 + 3 = 13) is impossible without mastering ten-frame anchoring.",
      },
      masteryQuiz: [
        {
          id: "q_lvl3_1",
          question: "A ten-frame has its top row completely full (5 dots) and 3 dots in the bottom row. What number does this represent, and how many are needed to make 10?",
          visualDiagram: "Top: [ 🔵 🔵 🔵 🔵 🔵 ] (5)\nBottom: [ 🔵 🔵 🔵 ⬜ ⬜ ] (3)\nTotal = 8 | Empty = 2",
          options: ["Total is 8; needs 2 more to make 10", "Total is 7; needs 3 more", "Total is 9; needs 1 more", "Total is 6; needs 4 more"],
          correctIndex: 0,
          explanation: "5 (top row) + 3 (bottom row) = 8. Since a ten-frame has 10 total slots, 10 - 8 = 2 empty slots remain.",
          coreConcept: "10-Frame Complements",
          optionalAiHint: {
            socraticClue: "Top row is 5. Count on: 6, 7, 8. How many empty boxes are left in the bottom row?",
            guidingQuestion: "5 + 3 = 8. What plus 8 equals 10?",
            visualTip: "2 empty boxes mean you need 2 more to reach 10!",
          },
        },
        {
          id: "q_lvl3_2",
          question: "How does anchoring to 10 help a student solve '8 + 6' mentally?",
          visualDiagram: "8 + 6 ➔ (8 + 2) + 4 ➔ 10 + 4 = 14",
          options: [
            "Borrow 2 from 6 to make 8 into 10, then add the remaining 4 (10 + 4 = 14)",
            "Count on fingers 8 times then 6 times",
            "Subtract 6 from 8",
            "Guess 15 because it is close",
          ],
          correctIndex: 0,
          explanation: "The 'Make 10' bridge decomposes 6 into 2 + 4. 8 + 2 becomes 10, and 10 + 4 = 14 instantly without finger counting.",
          coreConcept: "Make 10 Decomposition",
          optionalAiHint: {
            socraticClue: "How many does 8 need to fill a complete 10-frame?",
            guidingQuestion: "If you take 2 from 6 to fill 8 to 10, how many are left of the 6?",
            visualTip: "8 + 2 = 10, plus 4 left over = 14!",
          },
        },
        {
          id: "q_lvl3_3",
          question: "What is the key idea behind the number 13 in a ten-frame model?",
          visualDiagram: "Frame 1: [ 10 filled (Full) ] + Frame 2: [ 3 filled ] = 13",
          options: [
            "13 is composed of 1 full Ten and 3 loose Ones (10 + 3)",
            "13 is three groups of four",
            "13 is smaller than 10",
            "13 cannot be represented on frames",
          ],
          correctIndex: 0,
          explanation: "Every teen number is structurally 1 full group of 10 plus extra ones. 13 = 10 + 3.",
          coreConcept: "Teen Numbers as Ten + Ones",
          optionalAiHint: {
            socraticClue: "Think about 1 full ten-frame and a second frame with 3 dots.",
            guidingQuestion: "What is 10 plus 3?",
            visualTip: "1 Ten + 3 Ones = 13!",
          },
        },
      ],
    },

    // LEVEL 4: Skip Counting & Linear Jump Lines (+2, +5, +10)
    {
      levelNumber: 4,
      id: "cnt_lvl_4",
      title: "Skip Counting & Linear Jump Lines (+2, +5, +10)",
      tier: "practitioner",
      ageGuidance: "Ages 6–8 • Grades 1–2",
      cognitiveLeap:
        "Transitioning from unitary (+1) counting to rhythmic equal-interval stepping. Perceiving numbers as continuous linear jumps on an open number line.",
      keyMilestones: [
        "Fluent skip-counting by 2s (even numbers), 5s, and 10s up to 100",
        "Counting on from arbitrary starting points (e.g. start at 24, count by 2s: 26, 28, 30...)",
        "Recognizing numerical rhythm and end-digit patterns (5s end in 0 or 5; 10s end in 0)",
        "Direct conceptual bridge to multiplication as repeated addition",
      ],
      visualizerType: "number_line_skip",
      interactiveChallenge: {
        title: "Number Line Jump Navigator",
        instructions:
          "Jump along the number line by steps of +5. Count the rhythm: 5, 10, 15, 20, 25, 30!",
        targetGoal: "Complete the +5 skip track to 30 and the +2 track to 16",
        rewardXp: 75,
      },
      bridgeToNextSkills: {
        unlocksSkill: "Stage 8 Multiplication & Area Models",
        whyItMatters:
          "Skip counting by 5 six times is literally 6 × 5 = 30. It transforms multiplication from abstract memorization into an intuitive spatial hop sequence.",
      },
      masteryQuiz: [
        {
          id: "q_lvl4_1",
          question: "If you skip count by 5s starting from 15, what are the next 3 numbers in the series?",
          visualDiagram: "15 ──(+5)──> [ ? ] ──(+5)──> [ ? ] ──(+5)──> [ ? ]",
          options: ["20, 25, 30", "16, 17, 18", "25, 35, 45", "19, 24, 29"],
          correctIndex: 0,
          explanation: "Adding 5 at each step yields: 15 + 5 = 20, 20 + 5 = 25, 25 + 5 = 30.",
          coreConcept: "Equal Interval Jumping (+5)",
          optionalAiHint: {
            socraticClue: "Notice the alternating ones digits: 5, 0, 5, 0...",
            guidingQuestion: "What is 15 + 5? What comes 5 after that?",
            visualTip: "15 ➔ 20 ➔ 25 ➔ 30!",
          },
        },
        {
          id: "q_lvl4_2",
          question: "A baker packs cookies in boxes of 2. There are 7 boxes. How does skip-counting help count all the cookies?",
          visualDiagram: "Boxes: [🍪🍪] [🍪🍪] [🍪🍪] [🍪🍪] [🍪🍪] [🍪🍪] [🍪🍪]\nSkip:    2      4      6      8     10     12     14",
          options: [
            "Skip count by 2s seven times: 2, 4, 6, 8, 10, 12, 14 cookies total",
            "Count by 10s to 70",
            "Add 7 + 2 = 9 cookies",
            "Subtract 2 from 7",
          ],
          correctIndex: 0,
          explanation: "Counting by 2s allows you to count groups of 2 efficiently. 7 hops of 2 = 14 cookies (7 × 2 = 14).",
          coreConcept: "Skip Counting as Group Multiplication",
          optionalAiHint: {
            socraticClue: "Each box has 2 cookies. You have 7 boxes.",
            guidingQuestion: "Count by 2s: 2, 4, 6, 8, 10, 12... what is the 7th number?",
            visualTip: "7 groups of 2 is 14!",
          },
        },
        {
          id: "q_lvl4_3",
          question: "When skip counting by 10s backward from 73, which digit changes and which stays the same?",
          visualDiagram: "73 ──(-10)──> 63 ──(-10)──> 53 ──(-10)──> 43",
          options: [
            "The tens digit decreases by 1 (7 ➔ 6 ➔ 5), while the ones digit stays 3",
            "Both digits decrease by 1",
            "The ones digit decreases by 1 while tens stays 7",
            "Neither digit changes",
          ],
          correctIndex: 0,
          explanation: "Subtracting 10 only modifies the tens column. 73 ➔ 63 ➔ 53 ➔ 43. The 3 ones remain untouched.",
          coreConcept: "Decade Place Value Shifts",
          optionalAiHint: {
            socraticClue: "Look at 73 minus 10. The ones place has 3 minus 0 = 3.",
            guidingQuestion: "Does subtracting 10 change the ones digit?",
            visualTip: "Tens drop down by 1: 73 ➔ 63 ➔ 53 ➔ 43.",
          },
        },
      ],
    },

    // LEVEL 5: Multi-Digit Place Value Bundling (Tens, Hundreds, 1-100+)
    {
      levelNumber: 5,
      id: "cnt_lvl_5",
      title: "Place Value Bundling & Hierarchical Regrouping",
      tier: "master",
      ageGuidance: "Ages 7–10 • Grades 2–4",
      cognitiveLeap:
        "Mastering multi-unit hierarchical counting. Understanding that 10 Ones bundle into 1 Ten, 10 Tens bundle into 1 Hundred, and manipulating multi-digit quantities with positional understanding.",
      keyMilestones: [
        "Hierarchical bundling: 10 Ones = 1 Ten; 10 Tens = 1 Hundred",
        "Counting mixed collections of Hundreds, Tens, and Ones",
        "Understanding zero as a critical positional placeholder (e.g., 305 vs 35)",
        "Decomposing multi-digit numbers into expanded form (400 + 70 + 2 = 472)",
      ],
      visualizerType: "base10_bundle",
      interactiveChallenge: {
        title: "Base-10 Regrouping Bank",
        instructions:
          "Group 10 loose units together to forge a Ten-Rod! Then trade 10 Ten-Rods to build a Hundred-Flat.",
        targetGoal: "Bundle 14 tens and 6 ones into 1 Hundred, 4 Tens, and 6 Ones (146)",
        rewardXp: 100,
      },
      bridgeToNextSkills: {
        unlocksSkill: "Stage 7 Base-10 Operations & Long Algorithms",
        whyItMatters:
          "Standard addition and subtraction algorithms ('carrying' and 'borrowing') are purely base-10 bundling and unbundling in action.",
      },
      masteryQuiz: [
        {
          id: "q_lvl5_1",
          question: "You have 2 Hundred-flats, 13 Ten-rods, and 4 Unit-cubes. After regrouping 10 tens into 1 hundred, what is the total number?",
          visualDiagram: "[ 2 Hundreds = 200 ]\n[ 13 Tens = 130 ] ──(Trade 10 Tens for 1 Hundred)──>\n[ 4 Ones = 4 ]\nTotal = 3 Hundreds + 3 Tens + 4 Ones = [ ? ]",
          options: ["334", "234", "2134", "304"],
          correctIndex: 0,
          explanation: "13 Tens = 1 Hundred + 3 Tens. Adding 1 Hundred to 2 Hundreds gives 3 Hundreds. Total = 3 Hundreds (300) + 3 Tens (30) + 4 Ones (4) = 334.",
          coreConcept: "Base-10 Multi-Unit Regrouping",
          optionalAiHint: {
            socraticClue: "Trade 10 of the 13 ten-rods for 1 new hundred-flat.",
            guidingQuestion: "2 Hundreds + 1 New Hundred = 3 Hundreds. How many tens are left from 13?",
            visualTip: "3 Hundreds (300) + 3 Tens (30) + 4 Ones (4) = 334!",
          },
        },
        {
          id: "q_lvl5_2",
          question: "Why is the number 408 different from 48 when counting collections?",
          visualDiagram: "408: 4 Hundreds, 0 Tens, 8 Ones\n 48: 0 Hundreds, 4 Tens, 8 Ones",
          options: [
            "The '0' in 408 holds the tens place so the '4' represents 400 instead of 40",
            "They are the same number written differently",
            "408 is an odd number",
            "48 is larger than 408",
          ],
          correctIndex: 0,
          explanation: "Zero is a vital positional placeholder. Without 0 in the tens place, the 4 would shift to the tens column, shrinking the value from 400 to 40.",
          coreConcept: "Zero as a Positional Placeholder",
          optionalAiHint: {
            socraticClue: "What does the digit 4 mean in 408 vs 48?",
            guidingQuestion: "Does 4 hundreds equal 4 tens?",
            visualTip: "408 = 400 + 0 + 8, while 48 = 40 + 8!",
          },
        },
        {
          id: "q_lvl5_3",
          question: "What number comes immediately after 399 when counting forward by ones?",
          visualDiagram: "399 ──(+1)──> [ 9 ones + 1 one = 1 ten; 9 tens + 1 ten = 1 hundred; 3 hundreds + 1 hundred = 4 hundreds ]",
          options: ["400 (Double cascade regrouping)", "3100", "390", "3991"],
          correctIndex: 0,
          explanation: "Adding 1 to 9 ones makes 10 ones (regroups to 1 ten). 9 tens + 1 ten = 10 tens (regroups to 1 hundred). 3 hundreds + 1 hundred = 400.",
          coreConcept: "Cascade Regrouping Boundary",
          optionalAiHint: {
            socraticClue: "Think about what happens when 99 turns over like an odometer in a car.",
            guidingQuestion: "What is 399 + 1?",
            visualTip: "399 rolls over to 400!",
          },
        },
      ],
    },
  ],
};

// Lightweight Template Demonstrator: How other skills connect to Counting
export const OTHER_SKILL_PROGRESSION_TEMPLATES: SkillProgressionModel[] = [
  {
    id: "sorting_progression",
    skillName: "Sorting & Pattern Classification Track",
    domain: "Pre-Algebra & Logic",
    summary:
      "Sorting groups objects by single attributes, multiple Venn intersections, and repeating AB/AAB patterns using counting as the quantity validator.",
    accentColor: "purple",
    foundationalRationale: "Built directly upon Level 1 1-to-1 Correspondence and Level 2 Subitizing.",
    levels: [
      {
        levelNumber: 1,
        id: "sort_lvl_1",
        title: "Single-Attribute Color & Shape Sorting",
        tier: "novice",
        ageGuidance: "Ages 4–6",
        cognitiveLeap: "Filtering noise to categorize items by a single invariant property.",
        keyMilestones: ["Sorting by color", "Sorting by geometric shape", "Counting items in each sorted bin"],
        visualizerType: "sorting_patterns",
        interactiveChallenge: {
          title: "Sort into Matching Bins",
          instructions: "Place triangles in the blue bin and circles in the yellow bin, then verify counts!",
          targetGoal: "Sort all 6 items correctly",
          rewardXp: 40,
        },
        bridgeToNextSkills: {
          unlocksSkill: "Venn Intersections & Multi-Criteria Logic",
          whyItMatters: "Sets the stage for relational databases, logic, and algebra.",
        },
        masteryQuiz: [
          {
            id: "sort_q1",
            question: "You sort 4 red stars and 3 blue stars into color bins. How many total stars are there?",
            options: ["7 stars (4 + 3)", "4 stars", "3 stars", "12 stars"],
            correctIndex: 0,
            explanation: "Sorting partitions a set into subsets; the sum of the subsets (4 + 3) equals the whole (7).",
            coreConcept: "Partitioning & Summation",
          },
        ],
      },
    ],
  },
  {
    id: "addition_progression",
    skillName: "Visual Addition & Composition Track",
    domain: "Arithmetic Operations",
    summary:
      "Addition evolves from 'count all' to 'count on' using ten-frames, number bonds, and visual decomposition.",
    accentColor: "cyan",
    foundationalRationale: "Directly extends Level 3 Ten-Frame Anchoring and Level 4 Skip Counting.",
    levels: [
      {
        levelNumber: 1,
        id: "add_lvl_1",
        title: "Combining Sets & Counting On",
        tier: "explorer",
        ageGuidance: "Ages 5–7",
        cognitiveLeap: "Holding the first addend in mind and counting on rather than recounting from 1.",
        keyMilestones: ["Combining two visual sets", "Counting on from the larger number", "Commutative property (3 + 5 = 5 + 3)"],
        visualizerType: "visual_addition",
        interactiveChallenge: {
          title: "Combine & Count On",
          instructions: "Start with 6 stars, add 3 more by counting on: '6 ... 7, 8, 9!'",
          targetGoal: "Solve 6 + 3 using the count-on strategy",
          rewardXp: 50,
        },
        bridgeToNextSkills: {
          unlocksSkill: "Make 10 Bridging & Multi-digit Addition",
          whyItMatters: "Eliminates finger counting and builds instant mental fluency.",
        },
        masteryQuiz: [
          {
            id: "add_q1",
            question: "To solve 7 + 3 most efficiently, what should a student do?",
            options: [
              "Start at 7 and count on 3 steps: '8, 9, 10'",
              "Count 1, 2, 3, 4, 5, 6, 7 from the beginning, then count 3 more",
              "Subtract 3 from 7",
              "Guess 11",
            ],
            correctIndex: 0,
            explanation: "Counting on from the largest number (7 ➔ 8, 9, 10) is twice as fast as recounting from 1.",
            coreConcept: "Counting On Strategy",
          },
        ],
      },
    ],
  },
];
