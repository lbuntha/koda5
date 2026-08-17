import { TopicCategory } from "../types";

export interface ConceptQuizQuestion {
  id: string;
  topic: TopicCategory;
  question: string;
  visualClue?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  conceptKey: string;
}

export const CONCEPT_QUIZZES: Record<TopicCategory, {
  topicName: string;
  description: string;
  iconName: string;
  gradeLevel: string;
  questions: ConceptQuizQuestion[];
}> = {
  number_bonds: {
    topicName: "Number Bonds & Ten-Frames",
    description: "Part-part-whole relationships, making 10, and visual addition.",
    iconName: "CircleDot",
    gradeLevel: "Grade 1",
    questions: [
      {
        id: "nb_1",
        topic: "number_bonds",
        question: "In a number bond where the Whole is 10 and one Part is 7, what is the missing Part?",
        visualClue: "[ Whole: 10 ] ─── ( Part: 7 ) + ( Part: ? )",
        options: ["2", "3", "4", "17"],
        correctIndex: 1,
        explanation: "In a number bond, Whole = Part + Part. Since 7 + 3 = 10, the missing part must be 3.",
        conceptKey: "Part-Part-Whole Relationship",
      },
      {
        id: "nb_2",
        topic: "number_bonds",
        question: "A ten-frame has 6 counters placed inside. How many empty spots remain to complete the full ten?",
        visualClue: "Ten-Frame: [🔵🔵🔵🔵🔵 | 🔵⬜⬜⬜⬜]",
        options: ["3 counters", "4 counters", "5 counters", "6 counters"],
        correctIndex: 1,
        explanation: "A full ten-frame holds 10 items. With 6 filled, 10 - 6 = 4 empty spots remain to make 10.",
        conceptKey: "Making 10 Anchor Strategy",
      },
      {
        id: "nb_3",
        topic: "number_bonds",
        question: "When mentally calculating 8 + 5, which strategy uses 'Making 10' by decomposing the 5?",
        visualClue: "8 + 5 = 8 + (2 + 3) = (8 + 2) + 3",
        options: [
          "Take 2 from 5 to make 8 + 2 = 10, then add the remaining 3 to get 13",
          "Subtract 5 from 8 to get 3, then add 10",
          "Multiply 8 by 5 and divide by 10",
          "Count forward on your fingers 13 times"
        ],
        correctIndex: 0,
        explanation: "Decomposing 5 into 2 + 3 allows you to combine 8 + 2 = 10 (a friendly ten), and then 10 + 3 = 13 effortlessly!",
        conceptKey: "Decomposition & Making 10",
      },
    ],
  },

  base_ten_blocks: {
    topicName: "Base-10 Place Value",
    description: "Units, ten-rods, hundred-flats, and regrouping mechanics.",
    iconName: "Layers",
    gradeLevel: "Grades 1 & 2",
    questions: [
      {
        id: "bt_1",
        topic: "base_ten_blocks",
        question: "You have 14 single unit-cubes on your workspace. What is the equivalent regrouped base-10 value?",
        visualClue: "▪▪▪▪▪▪▪▪▪▪ + ▪▪▪▪  ➔  [ ▮ ] + ▪▪▪▪",
        options: [
          "1 Ten-rod and 4 Unit-cubes",
          "14 Ten-rods",
          "2 Ten-rods and 4 Unit-cubes",
          "1 Hundred-flat and 4 Unit-cubes"
        ],
        correctIndex: 0,
        explanation: "10 individual unit cubes combine (regroup) into exactly 1 ten-rod. So 14 ones = 1 ten and 4 loose ones (14).",
        conceptKey: "Regrouping Ones into Tens",
      },
      {
        id: "bt_2",
        topic: "base_ten_blocks",
        question: "In the 2-digit number 73, what is the actual numerical value represented by the digit '7'?",
        visualClue: "Tens (7) | Ones (3) ➔ [▮▮▮▮▮▮▮] + [▪▪▪]",
        options: ["7", "70", "700", "73"],
        correctIndex: 1,
        explanation: "The digit 7 is positioned in the tens place, meaning it represents 7 groups of ten: 7 × 10 = 70.",
        conceptKey: "Place Value Weight",
      },
      {
        id: "bt_3",
        topic: "base_ten_blocks",
        question: "To subtract 7 ones from 32 (3 tens and 2 ones), what must you do first?",
        visualClue: "32 = 3 Tens + 2 Ones  ──[ Regroup 1 Ten ]──>  2 Tens + 12 Ones",
        options: [
          "Unbundle 1 ten-rod into 10 ones, leaving 2 tens and 12 ones",
          "Subtract 2 from 7 to get 5",
          "Add another ten-rod to make 42",
          "Erase the tens digit completely"
        ],
        correctIndex: 0,
        explanation: "Since you cannot subtract 7 ones from 2 ones directly, you unbundle/borrow 1 ten (10 ones) to make 12 ones. Then 12 - 7 = 5 ones, leaving 25!",
        conceptKey: "Subtractive Regrouping / Borrowing",
      },
    ],
  },

  time_and_money: {
    topicName: "Clocks & Coin Currency",
    description: "Analog clock dials, hours vs. minutes, and coin value totals.",
    iconName: "Clock",
    gradeLevel: "Grade 2",
    questions: [
      {
        id: "tm_1",
        topic: "time_and_money",
        question: "On an analog clock, the short hand points past 4 and the long hand points directly at the 6. What time is displayed?",
        visualClue: "Short Hand: past 4 | Long Hand: 6 (6 × 5 mins)",
        options: ["4:30 (Half-past 4)", "6:20", "5:30", "4:06"],
        correctIndex: 0,
        explanation: "The short hour hand indicates the hour is 4, and the long minute hand pointing to 6 represents 6 × 5 = 30 minutes (4:30).",
        conceptKey: "Analog Clock Face & 5-Minute Increments",
      },
      {
        id: "tm_2",
        topic: "time_and_money",
        question: "Maya has 2 quarters (25¢ each), 1 dime (10¢), and 3 pennies (1¢ each). What is her total balance in cents?",
        visualClue: "🪙 25¢ + 🪙 25¢ + 🪙 10¢ + 🪙 1¢ + 🪙 1¢ + 🪙 1¢",
        options: ["63¢", "58¢", "68¢", "73¢"],
        correctIndex: 0,
        explanation: "2 quarters = 50¢. 50¢ + 10¢ (dime) = 60¢. 60¢ + 3¢ (3 pennies) = 63¢ in total.",
        conceptKey: "Multi-Coin Summation",
      },
      {
        id: "tm_3",
        topic: "time_and_money",
        question: "How many dimes (10¢ each) are required to make exactly $1.00 (100 cents)?",
        visualClue: "10¢ × ? = 100¢ ($1.00)",
        options: ["10 dimes", "4 dimes", "20 dimes", "5 dimes"],
        correctIndex: 0,
        explanation: "Since $1.00 equals 100 cents, 100 ÷ 10 = 10 dimes make one whole dollar.",
        conceptKey: "Dollar & Cent Conversions",
      },
    ],
  },

  balance_equations: {
    topicName: "Algebraic Balance Scale",
    description: "Subtractive equality, inverse operations, and isolating variables.",
    iconName: "Scale",
    gradeLevel: "Grades 3–5",
    questions: [
      {
        id: "be_1",
        topic: "balance_equations",
        question: "A balance scale has (Box X + 5kg) on the left pan and 12kg on the right pan. How do you isolate Box X while keeping the scale level?",
        visualClue: "Left: [ Box X ] + 5kg  ===⚖️===  Right: 12kg",
        options: [
          "Subtract 5kg from BOTH the left pan and right pan",
          "Add 5kg to the right pan only",
          "Divide only the left pan by 5",
          "Multiply both pans by 12"
        ],
        correctIndex: 0,
        explanation: "The Golden Rule of Algebra: whatever you do to one side of a balanced scale, you must do to the other. Subtracting 5kg from both sides isolates Box X = 7kg.",
        conceptKey: "Subtractive Equality",
      },
      {
        id: "be_2",
        topic: "balance_equations",
        question: "If 3 identical mystery boxes (3x) weigh 18kg in total on a balanced scale, what is the weight of ONE mystery box (x)?",
        visualClue: "[ Box X ] [ Box X ] [ Box X ]  ===⚖️===  18kg",
        options: [
          "6kg (Divide both sides by 3)",
          "15kg (Subtract 3 from 18)",
          "21kg (Add 3 to 18)",
          "54kg (Multiply 18 by 3)"
        ],
        correctIndex: 0,
        explanation: "To undo multiplying by 3, perform the inverse operation: divide both sides by 3. 18 ÷ 3 = 6kg per box.",
        conceptKey: "Inverse Operations (Division undoes Multiplication)",
      },
      {
        id: "be_3",
        topic: "balance_equations",
        question: "What does the equals sign '=' fundamentally mean in a mathematical equation?",
        visualClue: "Left Expression  <==[ EQUALS (=) ]==>  Right Expression",
        options: [
          "Both sides have the exact same mathematical value or weight",
          "The answer is always on the right-hand side",
          "You must immediately perform a calculation",
          "The left side is always greater than the right side"
        ],
        correctIndex: 0,
        explanation: "The '=' symbol denotes relational equivalence—the value of everything on the left is identical to the value of everything on the right.",
        conceptKey: "Relational Equivalence",
      },
    ],
  },

  fraction_lab: {
    topicName: "Fraction Architect",
    description: "Equivalent fractions, parts of a whole, and mixed numbers.",
    iconName: "PieChart",
    gradeLevel: "Grades 3–5",
    questions: [
      {
        id: "fl_1",
        topic: "fraction_lab",
        question: "In the fraction 3/8, what does the denominator (8) specifically represent?",
        visualClue: "Numerator (3) / Denominator (8)",
        options: [
          "The total number of equal pieces the whole unit is divided into",
          "The number of shaded pieces you have selected",
          "The size of the whole plate",
          "How many pizzas you need to order"
        ],
        correctIndex: 0,
        explanation: "The denominator (bottom number) defines how many equal parts make up 1 whole unit. The numerator (top) counts how many parts are chosen.",
        conceptKey: "Numerator vs Denominator Roles",
      },
      {
        id: "fl_2",
        topic: "fraction_lab",
        question: "Which of the following fractions is equivalent (equal in value) to 2/4?",
        visualClue: "🥧 2/4 (Half)  =  🥧 ?/8",
        options: ["4/8", "2/8", "3/4", "1/4"],
        correctIndex: 0,
        explanation: "Multiplying both the numerator and denominator by 2 gives (2 × 2) / (4 × 2) = 4/8. Both 2/4 and 4/8 simplify to 1/2 of the whole!",
        conceptKey: "Equivalent Fractions",
      },
      {
        id: "fl_3",
        topic: "fraction_lab",
        question: "If you have 7 quarter-slices of pizza (7/4), what is this written as a mixed number?",
        visualClue: "7/4  =  [ 4/4 (1 Whole) ] + [ 3/4 remaining ]",
        options: ["1 3/4", "2 1/4", "1 1/4", "7.4"],
        correctIndex: 0,
        explanation: "4 fourths (4/4) equals 1 complete pizza. 7/4 minus 4/4 leaves 3/4, making 1 whole and 3/4 (1 3/4).",
        conceptKey: "Improper Fractions & Mixed Numbers",
      },
    ],
  },

  spatial_puzzles: {
    topicName: "Spatial Puzzles & Geometry",
    description: "Area vs. perimeter, 2D dimensions, and spatial conservation.",
    iconName: "Box",
    gradeLevel: "Grades 3–5",
    questions: [
      {
        id: "sp_1",
        topic: "spatial_puzzles",
        question: "A rectangular playground is 4 meters wide and 3 meters long. What are its Area and Perimeter?",
        visualClue: "┌────────4m────────┐\n3m                 3m\n└────────4m────────┘",
        options: [
          "Area = 12 m², Perimeter = 14 m",
          "Area = 14 m², Perimeter = 12 m",
          "Area = 7 m², Perimeter = 12 m",
          "Area = 12 m², Perimeter = 7 m"
        ],
        correctIndex: 0,
        explanation: "Area = Width × Length = 4 × 3 = 12 m² (interior space). Perimeter = 4 + 3 + 4 + 3 = 14 m (distance around the border).",
        conceptKey: "Area vs Perimeter Distinction",
      },
      {
        id: "sp_2",
        topic: "spatial_puzzles",
        question: "If you cut a rectangular card into two triangles along its diagonal and rearrange them into a new shape without overlapping, what happens to the total Area?",
        visualClue: "Rectangle ──[ Cut & Rearrange ]──> Parallelogram",
        options: [
          "The total area stays exactly the same",
          "The area doubles",
          "The area decreases by half",
          "The area depends on the orientation"
        ],
        correctIndex: 0,
        explanation: "Spatial Conservation Principle: Rearranging pieces without overlapping or discarding any parts preserves the exact same total area.",
        conceptKey: "Conservation of Area",
      },
      {
        id: "sp_3",
        topic: "spatial_puzzles",
        question: "If you double BOTH the width and the height of a 2×3 rectangle (making it 4×6), how many times larger is the new Area?",
        visualClue: "Original: 2 × 3 = 6  ──[ Double both sides ]──>  4 × 6 = 24",
        options: [
          "4 times larger (quadruples)",
          "2 times larger (doubles)",
          "3 times larger (triples)",
          "8 times larger"
        ],
        correctIndex: 0,
        explanation: "Doubling both linear dimensions multiplies 2D area by 2 × 2 = 4 (from 6 to 24 sq units)!",
        conceptKey: "2D Area Scaling Factor",
      },
    ],
  },

  exponent_growth: {
    topicName: "Exponential Growth & Powers",
    description: "Bases, exponents, rapid doubling, and non-linear patterns.",
    iconName: "Zap",
    gradeLevel: "Grades 5 & 6",
    questions: [
      {
        id: "eg_1",
        topic: "exponent_growth",
        question: "What does the exponential expression 2⁴ mathematically represent?",
        visualClue: "2⁴  =  2 multiplied by itself 4 times",
        options: [
          "2 × 2 × 2 × 2 = 16",
          "2 × 4 = 8",
          "2 + 2 + 2 + 2 = 8",
          "4 × 4 = 16"
        ],
        correctIndex: 0,
        explanation: "The base is 2 and the exponent is 4, which means multiplying 2 by itself 4 times: 2 × 2 × 2 × 2 = 16 (not 2 × 4).",
        conceptKey: "Base vs Exponent Notation",
      },
      {
        id: "eg_2",
        topic: "exponent_growth",
        question: "A colony of bacteria doubles every hour (Step 0: 1, Step 1: 2, Step 2: 4). How many bacteria are present after 4 doubling steps (2⁴)?",
        visualClue: "Step 0: 1 ➔ Step 1: 2 ➔ Step 2: 4 ➔ Step 3: 8 ➔ Step 4: ?",
        options: ["16 bacteria", "8 bacteria", "12 bacteria", "32 bacteria"],
        correctIndex: 0,
        explanation: "With each step doubling: 1 ➔ 2 ➔ 4 ➔ 8 ➔ 16 bacteria after 4 steps.",
        conceptKey: "Geometric Growth Rate",
      },
      {
        id: "eg_3",
        topic: "exponent_growth",
        question: "What is the value of any non-zero number raised to the power of 0 (for example, 5⁰ or 100⁰)?",
        visualClue: "5³ = 125, 5² = 25, 5¹ = 5, 5⁰ = ?",
        options: ["1", "0", "5", "Undefined"],
        correctIndex: 0,
        explanation: "Following the exponent pattern of dividing by the base at each step (125 ÷ 5 = 25, 25 ÷ 5 = 5, 5 ÷ 5 = 1), any non-zero number to the 0th power equals 1.",
        conceptKey: "Zero Exponent Property",
      },
    ],
  },

  coordinate_quest: {
    topicName: "Coordinate Navigator",
    description: "2D Cartesian grids, ordered pairs (X, Y), and directions.",
    iconName: "Compass",
    gradeLevel: "Grades 4–6",
    questions: [
      {
        id: "cq_1",
        topic: "coordinate_quest",
        question: "When locating the coordinate point (4, 7) on a Cartesian grid starting from (0,0), what order of movement do you follow?",
        visualClue: "Coordinate (X, Y) = (Horizontal, Vertical)",
        options: [
          "Move 4 steps right along the horizontal X-axis, then 7 steps up along the vertical Y-axis",
          "Move 7 steps right along X, then 4 steps up along Y",
          "Move 4 steps up along Y, then 7 steps right along X",
          "Move diagonally 11 steps"
        ],
        correctIndex: 0,
        explanation: "Coordinates are always written as (X, Y)—move horizontally along the X-axis first, then vertically along the Y-axis second.",
        conceptKey: "Ordered Pair Directionality (X then Y)",
      },
      {
        id: "cq_2",
        topic: "coordinate_quest",
        question: "What are the coordinates of the Origin point where the X-axis and Y-axis intersect?",
        visualClue: "Intersecting Axes Center ➔ ( ? , ? )",
        options: ["(0, 0)", "(1, 1)", "(0, 1)", "(10, 10)"],
        correctIndex: 0,
        explanation: "The origin is the starting benchmark point (0, 0) where both X and Y values are zero.",
        conceptKey: "Cartesian Origin Benchmark",
      },
      {
        id: "cq_3",
        topic: "coordinate_quest",
        question: "Starting at point (2, 3), if you move 3 steps to the right and 2 steps down, what are your new coordinates?",
        visualClue: "Start: (2, 3) ➔ X + 3, Y - 2 ➔ ( ? , ? )",
        options: ["(5, 1)", "(5, 5)", "(-1, 1)", "(1, 5)"],
        correctIndex: 0,
        explanation: "Moving right adds to X: 2 + 3 = 5. Moving down subtracts from Y: 3 - 2 = 1. The final coordinate is (5, 1).",
        conceptKey: "Coordinate Vector Translation",
      },
    ],
  },

  logic_matrix: {
    topicName: "Logic Switches & Truth Gates",
    description: "Boolean logic (AND, OR, NOT), conditions, and truth tables.",
    iconName: "Cpu",
    gradeLevel: "Grades 4–6",
    questions: [
      {
        id: "lm_1",
        topic: "logic_matrix",
        question: "In Boolean logic, what condition is required for a 2-input AND gate to output TRUE (1)?",
        visualClue: "Input A ──┐\n          ├─[ AND ]──> Output\nInput B ──┘",
        options: [
          "Both Input A AND Input B must be TRUE",
          "At least one input must be TRUE",
          "Both inputs must be FALSE",
          "Input A must be TRUE and Input B must be FALSE"
        ],
        correctIndex: 0,
        explanation: "An AND gate strictly requires ALL of its connected inputs to be TRUE for the output to activate as TRUE.",
        conceptKey: "AND Gate Truth Condition",
      },
      {
        id: "lm_2",
        topic: "logic_matrix",
        question: "If Switch A is ON (True) and Switch B is OFF (False), what will an OR gate connected to both output?",
        visualClue: "A (True)  ──┐\n            ├─[ OR ]──> Output: ?\nB (False) ──┘",
        options: ["TRUE (ON)", "FALSE (OFF)", "Null / Empty", "Short Circuit"],
        correctIndex: 0,
        explanation: "An OR gate evaluates to TRUE if at least ONE of its inputs is TRUE. Since Switch A is ON, the OR output is TRUE.",
        conceptKey: "OR Gate Inclusive Truth",
      },
      {
        id: "lm_3",
        topic: "logic_matrix",
        question: "What is the function of a NOT gate (inverter) in a logic circuit?",
        visualClue: "Input [TRUE] ──[ NOT ]──> Output [ ? ]",
        options: [
          "Inverts the input: turns TRUE into FALSE, and FALSE into TRUE",
          "Always forces the output to be TRUE",
          "Doubles the electric signal strength",
          "Connects two parallel wires together"
        ],
        correctIndex: 0,
        explanation: "A NOT gate is an inverter—it negates whatever signal enters it, flipping TRUE to FALSE and FALSE to TRUE.",
        conceptKey: "NOT Gate Inversion",
      },
    ],
  },
};
