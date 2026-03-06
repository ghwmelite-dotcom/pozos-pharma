import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";

/* ------------------------------------------------------------------ */
/*  SVG ICON COMPONENTS                                                */
/* ------------------------------------------------------------------ */
function ChevronLeftIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function CheckCircleIcon({ className = "w-6 h-6" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function XCircleIcon({ className = "w-6 h-6" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function LightBulbIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
    </svg>
  );
}

function BookOpenIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  );
}

function ChevronDownIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function ScaleIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.97zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.97z" />
    </svg>
  );
}

function DropIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25c0 0-7.5 8.25-7.5 13.5a7.5 7.5 0 0015 0c0-5.25-7.5-13.5-7.5-13.5z" />
    </svg>
  );
}

function BeakerIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M5 14.5l-1.703 4.258A1.125 1.125 0 004.342 20.25h15.316a1.125 1.125 0 001.045-1.492L19 14.5m-14 0h14" />
    </svg>
  );
}

function BabyIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <circle cx="12" cy="8" r="4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 12c-3.5 0-6 2.5-6 5.5V20h12v-2.5c0-3-2.5-5.5-6-5.5z" />
    </svg>
  );
}

function FlaskIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 3h6v5l4 9H5l4-9V3zM9 3h6M7 21h10" />
    </svg>
  );
}

function TrophyIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-4.5A3.375 3.375 0 0019.875 10.875h.375a2.625 2.625 0 002.625-2.625V6.75a2.625 2.625 0 00-2.625-2.625h-.375M7.5 14.25v4.5m0-4.5A3.375 3.375 0 014.125 10.875H3.75A2.625 2.625 0 011.125 8.25V6.75A2.625 2.625 0 013.75 4.125h.375M7.5 14.25h9" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  CATEGORIES                                                         */
/* ------------------------------------------------------------------ */
const CATEGORIES = [
  { id: "dosage", label: "Dosage Calculations", Icon: ScaleIcon },
  { id: "iv", label: "IV Drip Rates", Icon: DropIcon },
  { id: "dilution", label: "Dilutions & Concentrations", Icon: BeakerIcon },
  { id: "pediatric", label: "Pediatric Dosing", Icon: BabyIcon },
  { id: "compounding", label: "Compounding Calculations", Icon: FlaskIcon },
];

const DIFFICULTIES = ["Easy", "Medium", "Hard"];

/* ------------------------------------------------------------------ */
/*  PROBLEM BANK (18 problems, 3+ per category)                       */
/* ------------------------------------------------------------------ */
const PROBLEMS = [
  /* ---- DOSAGE ---- */
  {
    id: 1,
    category: "dosage",
    difficulty: "Easy",
    question:
      "A patient is prescribed Amoxicillin 500mg TDS (three times daily) for 7 days. The pharmacy stocks Amoxicillin 250mg capsules (Ghanapen brand). How many capsules are needed for the full course?",
    hint: "First calculate total daily capsules, then multiply by the number of days.",
    solution: [
      "Each dose = 500 mg, capsules available = 250 mg",
      "Capsules per dose = 500 / 250 = 2 capsules",
      "Doses per day = 3 (TDS)",
      "Capsules per day = 2 x 3 = 6",
      "Total capsules = 6 x 7 = 42 capsules",
    ],
    answer: 42,
    unit: "capsules",
  },
  {
    id: 2,
    category: "dosage",
    difficulty: "Medium",
    question:
      "Paracetamol syrup (Efpac brand, 120 mg/5 mL) is prescribed at 15 mg/kg for a 24 kg child. What volume should be administered per dose?",
    hint: "Calculate total dose in mg first, then convert to mL using the concentration.",
    solution: [
      "Total dose = 15 mg/kg x 24 kg = 360 mg",
      "Concentration = 120 mg per 5 mL",
      "Volume = (360 / 120) x 5 mL",
      "Volume = 3 x 5 = 15 mL",
    ],
    answer: 15,
    unit: "mL",
  },
  {
    id: 3,
    category: "dosage",
    difficulty: "Hard",
    question:
      "A diabetic patient requires Metformin 850 mg BD. The hospital pharmacy only has 500 mg tablets (Glucophage brand). How many 500 mg tablets does the patient need per day, assuming each dose must be rounded to the nearest whole tablet?",
    hint: "850 mg per dose with 500 mg tablets. Round each individual dose to the nearest whole tablet, then sum for the day.",
    solution: [
      "Each dose = 850 mg",
      "Tablets per dose = 850 / 500 = 1.7 tablets",
      "Rounded to nearest whole tablet = 2 tablets per dose",
      "BD = twice daily",
      "Total per day = 2 x 2 = 4 tablets",
    ],
    answer: 4,
    unit: "tablets",
  },
  {
    id: 16,
    category: "dosage",
    difficulty: "Medium",
    question:
      "A patient weighing 68 kg is prescribed Ciprofloxacin at 10 mg/kg/day in 2 divided doses. Each dose should be given in mL using 500 mg/5 mL oral suspension. How many mL per dose?",
    hint: "Find total daily dose, divide by 2 for each dose, then convert mg to mL.",
    solution: [
      "Total daily dose = 10 mg/kg x 68 kg = 680 mg/day",
      "Per dose = 680 / 2 = 340 mg",
      "Concentration = 500 mg per 5 mL = 100 mg/mL",
      "Volume per dose = 340 / 100 = 3.4 mL",
    ],
    answer: 3.4,
    unit: "mL",
  },

  /* ---- IV DRIP RATES ---- */
  {
    id: 4,
    category: "iv",
    difficulty: "Easy",
    question:
      "Infuse 1000 mL of Normal Saline over 8 hours using a standard 20 drops/mL giving set. Calculate the drip rate in drops per minute.",
    hint: "Use the formula: Drops/min = (Volume x Drop factor) / (Time in minutes).",
    solution: [
      "Time in minutes = 8 x 60 = 480 minutes",
      "Drops/min = (Volume x Drop factor) / Time",
      "Drops/min = (1000 x 20) / 480",
      "Drops/min = 20000 / 480 = 41.67",
      "Rounded to 42 drops/min",
    ],
    answer: 42,
    unit: "drops/min",
  },
  {
    id: 5,
    category: "iv",
    difficulty: "Medium",
    question:
      "A patient at Korle Bu Teaching Hospital needs 2 g of Ceftriaxone IV in 100 mL Normal Saline infused over 30 minutes. The giving set delivers 60 drops/mL (microdrip). What is the drip rate?",
    hint: "With a 60 drops/mL giving set, apply the standard drip rate formula.",
    solution: [
      "Drops/min = (Volume x Drop factor) / Time in minutes",
      "Drops/min = (100 x 60) / 30",
      "Drops/min = 6000 / 30",
      "Drops/min = 200 drops/min",
    ],
    answer: 200,
    unit: "drops/min",
  },
  {
    id: 6,
    category: "iv",
    difficulty: "Hard",
    question:
      "A doctor prescribes Dopamine 400 mg in 250 mL D5W at 5 mcg/kg/min for a 70 kg patient. The giving set is 60 drops/mL. Calculate the drip rate in drops per minute.",
    hint: "Find dose in mcg/min, convert to mg/min, then to mL/min using concentration, then to drops/min.",
    solution: [
      "Dose = 5 mcg/kg/min x 70 kg = 350 mcg/min",
      "Convert: 350 mcg/min = 0.35 mg/min",
      "Concentration = 400 mg / 250 mL = 1.6 mg/mL",
      "mL/min = 0.35 / 1.6 = 0.21875 mL/min",
      "Drops/min = 0.21875 x 60 = 13.125, approx 13 drops/min",
    ],
    answer: 13,
    unit: "drops/min",
  },
  {
    id: 17,
    category: "iv",
    difficulty: "Easy",
    question:
      "A patient at Ridge Hospital is to receive 500 mL of Ringer's Lactate over 4 hours. The giving set delivers 15 drops/mL. What is the drip rate?",
    hint: "Drops/min = (Volume x Drop factor) / (Time in minutes).",
    solution: [
      "Time = 4 hours = 240 minutes",
      "Drops/min = (500 x 15) / 240",
      "= 7500 / 240",
      "= 31.25, approximately 31 drops/min",
    ],
    answer: 31,
    unit: "drops/min",
  },

  /* ---- DILUTIONS & CONCENTRATIONS ---- */
  {
    id: 7,
    category: "dilution",
    difficulty: "Easy",
    question:
      "How many grams of glucose are in 500 mL of 5% w/v Dextrose solution?",
    hint: "5% w/v means 5 grams in every 100 mL. Scale up to 500 mL.",
    solution: [
      "5% w/v = 5 g per 100 mL",
      "In 500 mL: (5 g / 100 mL) x 500 mL",
      "= 25 g of glucose",
    ],
    answer: 25,
    unit: "g",
  },
  {
    id: 8,
    category: "dilution",
    difficulty: "Medium",
    question:
      "You need to dilute 50 mL of a 10% w/v Chlorhexidine stock solution to make a 2% w/v solution. What should the final volume be?",
    hint: "Use the dilution formula: C1 x V1 = C2 x V2.",
    solution: [
      "Using C1V1 = C2V2",
      "10% x 50 mL = 2% x V2",
      "500 = 2 x V2",
      "V2 = 500 / 2 = 250 mL",
      "Add 200 mL diluent to the 50 mL stock",
    ],
    answer: 250,
    unit: "mL",
  },
  {
    id: 9,
    category: "dilution",
    difficulty: "Hard",
    question:
      "Prepare 500 mL of 70% v/v ethanol from 95% v/v ethanol stock at the KNUST pharmacy lab. How many mL of 95% ethanol are needed?",
    hint: "Apply C1V1 = C2V2 and solve for V1.",
    solution: [
      "Using C1V1 = C2V2",
      "95 x V1 = 70 x 500",
      "95 x V1 = 35000",
      "V1 = 35000 / 95 = 368.42 mL",
      "Measure 368.4 mL of 95% ethanol, dilute to 500 mL with purified water",
    ],
    answer: 368.4,
    unit: "mL",
  },

  /* ---- PEDIATRIC DOSING ---- */
  {
    id: 10,
    category: "pediatric",
    difficulty: "Easy",
    question:
      "Calculate the Gentamicin dose for a 3.5 kg neonate at the Komfo Anokye Teaching Hospital. The recommended dose is 5 mg/kg/day given in 2 divided doses. What is each single dose?",
    hint: "Calculate the total daily dose first, then divide by the number of doses.",
    solution: [
      "Total daily dose = 5 mg/kg x 3.5 kg = 17.5 mg/day",
      "Divided into 2 doses: 17.5 / 2 = 8.75 mg per dose",
    ],
    answer: 8.75,
    unit: "mg",
  },
  {
    id: 11,
    category: "pediatric",
    difficulty: "Medium",
    question:
      "A 15 kg child needs Artemether-Lumefantrine (Coartem). The adult dose is 80 mg Artemether. Using Clark's rule (weight in lbs / 150 x adult dose), calculate the child's Artemether dose. (1 kg = 2.2 lbs)",
    hint: "Convert kg to lbs first (multiply by 2.2), then apply Clark's rule formula.",
    solution: [
      "Weight in lbs = 15 x 2.2 = 33 lbs",
      "Clark's rule: (33 / 150) x Adult dose",
      "Artemether dose = (33 / 150) x 80 mg",
      "= 0.22 x 80 = 17.6 mg",
    ],
    answer: 17.6,
    unit: "mg",
  },
  {
    id: 12,
    category: "pediatric",
    difficulty: "Hard",
    question:
      "A 6-year-old child (20 kg) needs a Phenytoin loading dose of 15 mg/kg IV. The injection available is 50 mg/mL. What volume in mL is needed?",
    hint: "Calculate total dose in mg, then convert to mL using the injection concentration.",
    solution: [
      "Total dose = 15 mg/kg x 20 kg = 300 mg",
      "Concentration = 50 mg/mL",
      "Volume = 300 mg / 50 mg/mL = 6 mL",
    ],
    answer: 6,
    unit: "mL",
  },
  {
    id: 18,
    category: "pediatric",
    difficulty: "Easy",
    question:
      "Calculate the Ibuprofen dose for a 30 kg child. Dose is 10 mg/kg. Available suspension is 100 mg/5 mL (Brufen brand). What volume per dose?",
    hint: "Calculate total mg dose, then use the concentration to convert to mL.",
    solution: [
      "Total dose = 10 mg/kg x 30 kg = 300 mg",
      "Volume = (300 / 100) x 5 mL",
      "= 3 x 5 = 15 mL",
    ],
    answer: 15,
    unit: "mL",
  },

  /* ---- COMPOUNDING ---- */
  {
    id: 13,
    category: "compounding",
    difficulty: "Easy",
    question:
      "Prepare 200 g of 5% salicylic acid ointment (Whitfield's-type preparation). How many grams of salicylic acid powder are needed?",
    hint: "5% means 5 g of active ingredient in every 100 g of preparation.",
    solution: [
      "5% w/w = 5 g per 100 g",
      "For 200 g: (5 / 100) x 200 = 10 g",
      "Salicylic acid needed = 10 g",
      "Ointment base needed = 200 - 10 = 190 g",
    ],
    answer: 10,
    unit: "g",
  },
  {
    id: 14,
    category: "compounding",
    difficulty: "Medium",
    question:
      "A prescription calls for 120 mL of a mixture containing Chlorpheniramine 2 mg/5 mL. You have Chlorpheniramine Maleate 10 mg/5 mL (Piriton) stock solution. How many mL of stock solution do you need?",
    hint: "Use C1V1 = C2V2 but make sure concentrations are in the same units.",
    solution: [
      "C1 = 10 mg/5 mL = 2 mg/mL",
      "C2 = 2 mg/5 mL = 0.4 mg/mL",
      "C1V1 = C2V2",
      "2 x V1 = 0.4 x 120",
      "V1 = 48 / 2 = 24 mL of stock solution",
    ],
    answer: 24,
    unit: "mL",
  },
  {
    id: 15,
    category: "compounding",
    difficulty: "Hard",
    question:
      "Compound 60 g of a cream containing 0.5% hydrocortisone and 2% miconazole (for a dermatology patient at Tamale Teaching Hospital). How many grams of hydrocortisone are needed?",
    hint: "Calculate each percentage of 60 g separately. The question asks for hydrocortisone only.",
    solution: [
      "Hydrocortisone = 0.5% of 60 g",
      "= (0.5 / 100) x 60 = 0.3 g",
      "Miconazole = 2% of 60 g = 1.2 g (for reference)",
      "Cream base = 60 - 0.3 - 1.2 = 58.5 g",
    ],
    answer: 0.3,
    unit: "g",
  },
];

/* ------------------------------------------------------------------ */
/*  FORMULA REFERENCE DATA                                             */
/* ------------------------------------------------------------------ */
const FORMULAS = [
  {
    name: "Dose Calculation",
    formula: "Dose = (Weight x Dose per kg) / Frequency",
    example: "e.g. (70 kg x 10 mg/kg) / 2 doses = 350 mg per dose",
  },
  {
    name: "IV Drip Rate",
    formula: "Drip Rate = (Volume x Drop Factor) / Time in minutes",
    example: "e.g. (1000 mL x 20 drops/mL) / 480 min = 41.7 drops/min",
  },
  {
    name: "Dilution (C1V1 = C2V2)",
    formula: "C1 x V1 = C2 x V2",
    example: "e.g. 10% x 50 mL = 2% x V2, so V2 = 250 mL",
  },
  {
    name: "Body Surface Area (BSA)",
    formula: "BSA (m2) = sqrt[(Height cm x Weight kg) / 3600]",
    example: "e.g. sqrt[(170 x 70) / 3600] = 1.82 m2",
  },
  {
    name: "Creatinine Clearance (Cockcroft-Gault)",
    formula: "CrCl = [(140 - Age) x Weight] / (72 x Serum Creatinine) [x 0.85 if female]",
    example: "e.g. [(140 - 60) x 70] / (72 x 1.2) = 64.8 mL/min",
  },
];

/* ------------------------------------------------------------------ */
/*  HELPERS                                                            */
/* ------------------------------------------------------------------ */
function getFilteredProblems(category, difficultyFilter) {
  return PROBLEMS.filter(
    (p) =>
      p.category === category &&
      (difficultyFilter === "All" || p.difficulty === difficultyFilter)
  );
}

function getDifficultyColor(d) {
  if (d === "Easy") return "bg-green-500/10 text-green-600 dark:text-green-400 ring-green-500/30";
  if (d === "Medium") return "bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-amber-500/30";
  return "bg-red-500/10 text-red-600 dark:text-red-400 ring-red-500/30";
}

/* ------------------------------------------------------------------ */
/*  CIRCULAR PROGRESS (CSS-only)                                       */
/* ------------------------------------------------------------------ */
function CircularProgress({ percentage, size = 96, strokeWidth = 8 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-warm-200 dark:text-gray-800"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#goldGrad)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
        <defs>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#C9A84C" />
            <stop offset="100%" stopColor="#E8D48B" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-display font-bold gold-text">{percentage}%</span>
        <span className="text-[10px] font-body text-gray-500 dark:text-gray-400">accuracy</span>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  MAIN COMPONENT                                                     */
/* ================================================================== */
export default function DrugCalcTrainer() {
  /* ---- state ---- */
  const [activeCategory, setActiveCategory] = useState("dosage");
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [problemIndex, setProblemIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState(null); // null | "correct" | "incorrect"
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [showFormulas, setShowFormulas] = useState(false);

  /* progress tracking */
  const [stats, setStats] = useState({
    attempted: 0,
    correct: 0,
    incorrect: 0,
    byCategory: {
      dosage: { attempted: 0, correct: 0 },
      iv: { attempted: 0, correct: 0 },
      dilution: { attempted: 0, correct: 0 },
      pediatric: { attempted: 0, correct: 0 },
      compounding: { attempted: 0, correct: 0 },
    },
  });

  /* ---- derived ---- */
  const filtered = getFilteredProblems(activeCategory, difficultyFilter);
  const currentProblem = filtered.length > 0 ? filtered[problemIndex % filtered.length] : null;
  const accuracy = stats.attempted > 0 ? Math.round((stats.correct / stats.attempted) * 100) : 0;
  const totalProblems = PROBLEMS.length;

  /* ---- reset on category/difficulty change ---- */
  useEffect(() => {
    setProblemIndex(0);
    setUserAnswer("");
    setFeedback(null);
    setShowHint(false);
    setShowSolution(false);
  }, [activeCategory, difficultyFilter]);

  /* ---- check answer ---- */
  const checkAnswer = useCallback(() => {
    if (!currentProblem || feedback) return;
    const parsed = parseFloat(userAnswer);
    if (isNaN(parsed)) return;

    const tolerance = Math.abs(currentProblem.answer) * 0.02; // 2% tolerance
    const isCorrect = Math.abs(parsed - currentProblem.answer) <= Math.max(tolerance, 0.1);

    setFeedback(isCorrect ? "correct" : "incorrect");

    setStats((prev) => {
      const cat = { ...prev.byCategory[currentProblem.category] };
      cat.attempted += 1;
      if (isCorrect) cat.correct += 1;
      return {
        attempted: prev.attempted + 1,
        correct: prev.correct + (isCorrect ? 1 : 0),
        incorrect: prev.incorrect + (isCorrect ? 0 : 1),
        byCategory: { ...prev.byCategory, [currentProblem.category]: cat },
      };
    });
  }, [currentProblem, userAnswer, feedback]);

  /* ---- next problem ---- */
  const nextProblem = useCallback(() => {
    setProblemIndex((i) => i + 1);
    setUserAnswer("");
    setFeedback(null);
    setShowHint(false);
    setShowSolution(false);
  }, []);

  /* ---- keyboard ---- */
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (feedback) nextProblem();
      else checkAnswer();
    }
  };

  /* ---- category badge completion ---- */
  const isCategoryComplete = (catId) => {
    const catProblems = PROBLEMS.filter((p) => p.category === catId);
    const catStats = stats.byCategory[catId];
    return catStats.attempted >= catProblems.length && catStats.correct >= catProblems.length;
  };

  /* ================================================================ */
  /*  RENDER                                                           */
  /* ================================================================ */
  return (
    <div className="min-h-screen bg-warm-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 pb-20">
      <div className="noise-overlay" />

      {/* ---- HERO / HEADER ---- */}
      <section className="relative overflow-hidden rounded-b-3xl dark-glass mb-8">
        <div className="kente-weave absolute inset-0 opacity-10 pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-4 py-10 sm:py-14">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm font-body mb-6">
            <Link
              to="/learn"
              className="inline-flex items-center gap-1.5 text-[#A8893A] dark:text-[#E8D48B] hover:underline transition-colors"
            >
              <ChevronLeftIcon className="w-4 h-4" />
              Academy
            </Link>
            <span className="text-gray-400 dark:text-gray-600">/</span>
            <span className="text-gray-600 dark:text-gray-400">Calc Trainer</span>
          </nav>

          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-display gold-text leading-tight">
              Drug Calculation Trainer
            </h1>
            <p className="mt-3 text-base sm:text-lg text-gray-600 dark:text-gray-400 font-body max-w-2xl mx-auto">
              Master pharmaceutical calculations with step-by-step solutions
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ============================================================ */}
          {/*  MAIN CONTENT (2/3 width on lg)                               */}
          {/* ============================================================ */}
          <div className="lg:col-span-2 space-y-6">

            {/* ---- CATEGORY TABS ---- */}
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const CatIcon = cat.Icon;
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-body font-medium transition-all duration-200 border ${
                      isActive
                        ? "bg-[#C9A84C] text-white border-[#C9A84C] shadow-lg shadow-[#C9A84C]/20"
                        : "dark-glass border-warm-200 dark:border-[#C9A84C]/20 text-gray-700 dark:text-gray-300 hover:border-[#C9A84C]/40"
                    }`}
                  >
                    <CatIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">{cat.label}</span>
                    <span className="sm:hidden">{cat.label.split(" ")[0]}</span>
                    {isCategoryComplete(cat.id) && (
                      <TrophyIcon className="w-3.5 h-3.5 text-yellow-300" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* ---- DIFFICULTY FILTER ---- */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-body text-gray-500 dark:text-gray-400 uppercase tracking-wider mr-1">Difficulty:</span>
              {["All", ...DIFFICULTIES].map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficultyFilter(d)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-body font-medium transition-all duration-200 ${
                    difficultyFilter === d
                      ? "bg-[#C9A84C] text-white shadow-sm"
                      : "bg-warm-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-warm-200 dark:hover:bg-gray-800"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>

            {/* ---- PROBLEM CARD ---- */}
            {currentProblem ? (
              <div className="rounded-2xl dark-glass border border-warm-200 dark:border-[#C9A84C]/20 p-6 sm:p-8 space-y-6">
                {/* Problem header */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="text-sm font-body text-gray-500 dark:text-gray-400">
                    Problem {(problemIndex % filtered.length) + 1} of {filtered.length}
                  </span>
                  <span
                    className={`px-3 py-0.5 rounded-full text-xs font-body font-medium ring-1 ${getDifficultyColor(
                      currentProblem.difficulty
                    )}`}
                  >
                    {currentProblem.difficulty}
                  </span>
                </div>

                {/* Question text */}
                <p className="text-lg sm:text-xl font-body leading-relaxed text-gray-800 dark:text-gray-200">
                  {currentProblem.question}
                </p>

                {/* Hint toggle */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowHint(!showHint)}
                    className="inline-flex items-center gap-1.5 text-sm font-body text-[#A8893A] dark:text-[#E8D48B] hover:underline transition-colors"
                  >
                    <LightBulbIcon className="w-4 h-4" />
                    {showHint ? "Hide Hint" : "Show Hint"}
                  </button>
                </div>

                {/* Hint panel */}
                {showHint && (
                  <div className="rounded-xl gold-glass border border-[#C9A84C]/30 p-4 animate-in slide-in-from-top-2">
                    <div className="flex items-start gap-2">
                      <LightBulbIcon className="w-5 h-5 text-[#C9A84C] flex-shrink-0 mt-0.5" />
                      <p className="text-sm font-body text-gray-700 dark:text-gray-300">{currentProblem.hint}</p>
                    </div>
                  </div>
                )}

                {/* Answer input row */}
                <div className="flex flex-wrap items-end gap-3">
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-body text-gray-500 dark:text-gray-400 mb-1.5">
                      Your Answer
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="any"
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={!!feedback}
                        placeholder="Enter value..."
                        className={`w-full px-4 py-3 rounded-xl text-lg font-body bg-white dark:bg-gray-900 border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50 disabled:opacity-60 ${
                          feedback === "correct"
                            ? "border-green-500 ring-2 ring-green-500/30"
                            : feedback === "incorrect"
                            ? "border-red-500 ring-2 ring-red-500/30"
                            : "border-warm-200 dark:border-gray-700"
                        }`}
                      />
                      <span className="text-sm font-body font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap min-w-[60px]">
                        {currentProblem.unit}
                      </span>
                    </div>
                  </div>

                  {!feedback ? (
                    <button
                      onClick={checkAnswer}
                      disabled={!userAnswer}
                      className="px-6 py-3 rounded-xl text-sm font-body font-semibold bg-[#C9A84C] hover:bg-[#A8893A] text-white shadow-lg shadow-[#C9A84C]/20 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Check Answer
                    </button>
                  ) : (
                    <button
                      onClick={nextProblem}
                      className="px-6 py-3 rounded-xl text-sm font-body font-semibold bg-[#C9A84C] hover:bg-[#A8893A] text-white shadow-lg shadow-[#C9A84C]/20 transition-all duration-200"
                    >
                      Next Problem
                    </button>
                  )}
                </div>

                {/* Feedback panel */}
                {feedback && (
                  <div
                    className={`rounded-xl p-5 border transition-all duration-300 ${
                      feedback === "correct"
                        ? "bg-green-500/10 dark:bg-green-500/[0.08] border-green-500/30"
                        : "bg-red-500/10 dark:bg-red-500/[0.08] border-red-500/30"
                    }`}
                  >
                    {feedback === "correct" ? (
                      <div className="flex items-start gap-3">
                        <CheckCircleIcon className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-lg font-display text-green-600 dark:text-green-400 font-semibold">
                            Excellent! Correct!
                          </p>
                          <p className="text-sm font-body text-green-700 dark:text-green-300 mt-1">
                            The answer is {currentProblem.answer} {currentProblem.unit}. Well done!
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3">
                        <XCircleIcon className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-lg font-display text-red-600 dark:text-red-400 font-semibold">
                            Not quite right
                          </p>
                          <p className="text-sm font-body text-red-700 dark:text-red-300 mt-1">
                            The correct answer is{" "}
                            <strong>
                              {currentProblem.answer} {currentProblem.unit}
                            </strong>
                            . Review the solution below.
                          </p>
                          {!showSolution && (
                            <button
                              onClick={() => setShowSolution(true)}
                              className="mt-2 text-sm font-body text-red-600 dark:text-red-400 hover:underline"
                            >
                              Show Solution
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Step-by-step solution */}
                {showSolution && (
                  <div className="rounded-xl dark-glass border border-warm-200 dark:border-[#C9A84C]/20 p-5 space-y-3 transition-all duration-500">
                    <div className="flex items-center gap-2">
                      <BookOpenIcon className="w-5 h-5 text-[#C9A84C]" />
                      <p className="text-xs font-body font-semibold text-[#A8893A] dark:text-[#E8D48B] uppercase tracking-wider">
                        Step-by-Step Solution
                      </p>
                    </div>
                    <ol className="space-y-3">
                      {currentProblem.solution.map((step, i) => (
                        <li key={i} className="flex gap-3 text-sm font-body text-gray-700 dark:text-gray-300">
                          <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#C9A84C]/15 text-[#C9A84C] text-xs font-bold flex items-center justify-center">
                            {i + 1}
                          </span>
                          <span className="pt-1 font-mono text-[13px] leading-relaxed">{step}</span>
                        </li>
                      ))}
                    </ol>
                    <div className="pt-2 border-t border-warm-200 dark:border-gray-800">
                      <p className="text-sm font-body font-semibold text-[#C9A84C]">
                        Answer: {currentProblem.answer} {currentProblem.unit}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-2xl dark-glass border border-warm-200 dark:border-[#C9A84C]/20 p-8 text-center">
                <p className="text-lg font-body text-gray-500 dark:text-gray-400">
                  No problems available for{" "}
                  <span className="font-semibold text-[#C9A84C]">
                    {CATEGORIES.find((c) => c.id === activeCategory)?.label}
                  </span>{" "}
                  at <span className="font-semibold">{difficultyFilter}</span> difficulty.
                </p>
                <p className="text-sm font-body text-gray-400 dark:text-gray-500 mt-2">
                  Try a different category or difficulty level.
                </p>
              </div>
            )}

            {/* ---- FORMULA REFERENCE ---- */}
            <div className="rounded-2xl dark-glass border border-warm-200 dark:border-[#C9A84C]/20 overflow-hidden">
              <button
                onClick={() => setShowFormulas(!showFormulas)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-warm-100/50 dark:hover:bg-gray-900/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <ScaleIcon className="w-5 h-5 text-[#C9A84C]" />
                  <span className="text-base font-display font-semibold gold-text">Formula Reference</span>
                </div>
                <ChevronDownIcon
                  className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
                    showFormulas ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showFormulas && (
                <div className="px-5 pb-5 space-y-4 border-t border-warm-200 dark:border-gray-800 pt-4">
                  {FORMULAS.map((f, i) => (
                    <div
                      key={i}
                      className="rounded-xl bg-warm-100 dark:bg-gray-900/50 border border-warm-200 dark:border-gray-800 p-4"
                    >
                      <p className="text-sm font-body font-semibold text-[#A8893A] dark:text-[#E8D48B] mb-1">
                        {f.name}
                      </p>
                      <p className="text-base font-mono text-gray-800 dark:text-gray-200 mb-1.5">{f.formula}</p>
                      <p className="text-xs font-body text-gray-500 dark:text-gray-500 italic">{f.example}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ============================================================ */}
          {/*  SIDEBAR: PROGRESS PANEL (1/3 width on lg)                    */}
          {/* ============================================================ */}
          <div className="space-y-6">
            {/* Progress card */}
            <div className="rounded-2xl dark-glass border border-warm-200 dark:border-[#C9A84C]/20 p-6 space-y-6 lg:sticky lg:top-6">
              <h2 className="text-xl font-display gold-text">Session Progress</h2>

              {/* Circular progress */}
              <div className="flex justify-center">
                <CircularProgress percentage={accuracy} />
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-warm-100 dark:bg-gray-900/50 border border-warm-200 dark:border-gray-800 p-3 text-center">
                  <p className="text-xl font-display font-bold text-gray-800 dark:text-gray-100">
                    {stats.attempted}
                  </p>
                  <p className="text-[10px] font-body text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-0.5">
                    Attempted
                  </p>
                </div>
                <div className="rounded-xl bg-warm-100 dark:bg-gray-900/50 border border-warm-200 dark:border-gray-800 p-3 text-center">
                  <p className="text-xl font-display font-bold text-green-600 dark:text-green-400">
                    {stats.correct}
                  </p>
                  <p className="text-[10px] font-body text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-0.5">
                    Correct
                  </p>
                </div>
                <div className="rounded-xl bg-warm-100 dark:bg-gray-900/50 border border-warm-200 dark:border-gray-800 p-3 text-center">
                  <p className="text-xl font-display font-bold text-red-500 dark:text-red-400">
                    {stats.incorrect}
                  </p>
                  <p className="text-[10px] font-body text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-0.5">
                    Incorrect
                  </p>
                </div>
              </div>

              {/* Problems attempted vs total */}
              <div className="rounded-xl bg-warm-100 dark:bg-gray-900/50 border border-warm-200 dark:border-gray-800 p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-body text-gray-500 dark:text-gray-400">Overall Progress</span>
                  <span className="text-xs font-body font-semibold text-[#C9A84C]">
                    {stats.attempted} / {totalProblems}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-warm-200 dark:bg-gray-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#C9A84C] to-[#E8D48B] transition-all duration-500"
                    style={{ width: `${Math.min((stats.attempted / totalProblems) * 100, 100)}%` }}
                  />
                </div>
              </div>

              {/* Category completion badges */}
              <div>
                <p className="text-xs font-body font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-3">
                  Category Badges
                </p>
                <div className="space-y-2.5">
                  {CATEGORIES.map((cat) => {
                    const catStats = stats.byCategory[cat.id];
                    const catTotal = PROBLEMS.filter((p) => p.category === cat.id).length;
                    const catPct = catStats.attempted > 0 ? Math.round((catStats.correct / catStats.attempted) * 100) : 0;
                    const complete = isCategoryComplete(cat.id);
                    const CatIcon = cat.Icon;

                    return (
                      <div
                        key={cat.id}
                        className={`flex items-center gap-3 rounded-xl p-2.5 transition-colors ${
                          complete
                            ? "bg-[#C9A84C]/10 border border-[#C9A84C]/30"
                            : "bg-warm-100 dark:bg-gray-900/50 border border-warm-200 dark:border-gray-800"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            complete
                              ? "bg-[#C9A84C] text-white"
                              : "bg-warm-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                          }`}
                        >
                          {complete ? (
                            <TrophyIcon className="w-4 h-4" />
                          ) : (
                            <CatIcon className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-body font-medium text-gray-700 dark:text-gray-300 truncate">
                            {cat.label}
                          </p>
                          <p className="text-[10px] font-body text-gray-500 dark:text-gray-500">
                            {catStats.correct}/{catTotal} correct ({catPct}%)
                          </p>
                        </div>
                        {complete && (
                          <span className="text-[10px] font-body font-bold text-[#C9A84C] uppercase">
                            Done
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Difficulty filter in sidebar */}
              <div>
                <p className="text-xs font-body font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Filter by Difficulty
                </p>
                <div className="flex gap-2">
                  {DIFFICULTIES.map((d) => {
                    const count = PROBLEMS.filter(
                      (p) => p.category === activeCategory && p.difficulty === d
                    ).length;
                    return (
                      <button
                        key={d}
                        onClick={() => setDifficultyFilter(difficultyFilter === d ? "All" : d)}
                        className={`flex-1 px-2 py-2 rounded-lg text-xs font-body font-medium transition-all duration-200 text-center ${
                          difficultyFilter === d
                            ? "bg-[#C9A84C] text-white shadow-sm"
                            : "bg-warm-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-warm-200 dark:hover:bg-gray-800"
                        }`}
                      >
                        <div>{d}</div>
                        <div className="text-[10px] opacity-70">{count}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}