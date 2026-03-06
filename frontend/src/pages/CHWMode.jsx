import { useState, useEffect } from "react";
import { useTranslation } from "../i18n/useTranslation";

/* ─── Drug Reference Data ─── */
const DRUG_DATA = [
  {
    id: "ors",
    name: "ORS (Oral Rehydration Salts)",
    treats: "Dehydration from diarrhea, vomiting",
    preparation: "Dissolve 1 sachet in 1 litre of clean drinking water. Stir until fully dissolved. Use within 24 hours.",
    dosages: {
      "0-2mo": "50-100 mL after each loose stool",
      "2-12mo": "100-200 mL after each loose stool",
      "1-5yr": "200-300 mL after each loose stool",
      "5-12yr": "300-400 mL after each loose stool",
      adult: "200-400 mL after each loose stool",
    },
    frequency: "After each loose stool",
    duration: "Until diarrhea stops",
    warnings: ["Do NOT add sugar or salt to the solution", "Discard after 24 hours", "Seek medical help if no improvement in 2 days"],
    storage: "Store sachets in a cool, dry place away from moisture. Keep sealed until use.",
    unit: "mL",
    perKg: 20,
    form: "solution",
  },
  {
    id: "zinc",
    name: "Zinc Tablets (20 mg)",
    treats: "Diarrhea (alongside ORS to reduce duration and severity)",
    preparation: "Dissolve tablet in breast milk, ORS, or clean water for infants. Older children can chew or swallow.",
    dosages: {
      "0-2mo": "Not recommended under 2 months",
      "2-12mo": "10 mg (half tablet) once daily",
      "1-5yr": "20 mg (1 tablet) once daily",
      "5-12yr": "20 mg (1 tablet) once daily",
      adult: "20 mg (1 tablet) once daily",
    },
    frequency: "Once daily",
    duration: "10-14 days (continue even after diarrhea stops)",
    warnings: ["May cause vomiting if taken on empty stomach", "Do NOT exceed recommended dose", "Not for infants under 2 months"],
    storage: "Store below 30 degrees C in a dry place. Keep away from children.",
    unit: "mg",
    perKg: null,
    tabletMg: 20,
    form: "tablet",
    fixedDose: { "0-6mo": 10, "6mo+": 20 },
  },
  {
    id: "paracetamol",
    name: "Paracetamol",
    treats: "Fever, mild to moderate pain",
    preparation: "Tablets: swallow with water. Syrup: use measuring cup provided.",
    dosages: {
      "0-2mo": "10 mg/kg per dose (use syrup 120 mg/5 mL)",
      "2-12mo": "60-120 mg per dose (2.5-5 mL syrup)",
      "1-5yr": "120-250 mg per dose (5-10 mL syrup)",
      "5-12yr": "250-500 mg per dose (1/2 to 1 tablet)",
      adult: "500-1000 mg per dose (1-2 tablets)",
    },
    frequency: "Every 4-6 hours as needed",
    duration: "Up to 3 days. See pharmacist if fever persists.",
    warnings: ["Do NOT exceed 4 doses in 24 hours", "Do NOT give with other paracetamol-containing medicines", "Liver damage risk with overdose"],
    storage: "Store below 25 degrees C. Keep out of reach of children.",
    unit: "mg",
    perKg: 15,
    tabletMg: 500,
    form: "tablet/syrup",
  },
  {
    id: "amoxicillin",
    name: "Amoxicillin",
    treats: "Pneumonia, chest infections, ear infections",
    preparation: "Suspension: shake well before each dose. Add clean water to the marked line. Capsules: swallow whole.",
    dosages: {
      "0-2mo": "Refer to health facility",
      "2-12mo": "125 mg twice daily (use suspension)",
      "1-5yr": "250 mg twice daily",
      "5-12yr": "500 mg twice daily",
      adult: "500 mg three times daily",
    },
    frequency: "2-3 times daily (see dosage)",
    duration: "5 days minimum. Complete the full course.",
    warnings: ["Complete FULL course even if feeling better", "Check for penicillin allergy first", "May cause diarrhea or rash — stop if rash appears"],
    storage: "Store suspension in fridge, use within 7 days. Capsules below 25 degrees C.",
    unit: "mg",
    perKg: 25,
    tabletMg: 250,
    form: "capsule/suspension",
  },
  {
    id: "act",
    name: "Artemether-Lumefantrine (ACT)",
    treats: "Uncomplicated malaria (P. falciparum)",
    preparation: "Take with fatty food or milk to improve absorption. Complete all doses.",
    dosages: {
      "0-2mo": "Do NOT use. Refer immediately.",
      "2-12mo": "1 tablet per dose (5-14 kg)",
      "1-5yr": "1-2 tablets per dose (15-24 kg)",
      "5-12yr": "2-3 tablets per dose (25-34 kg)",
      adult: "4 tablets per dose (35+ kg)",
    },
    frequency: "Twice daily (at 0, 8, 24, 36, 48, 60 hours — 6 doses total)",
    duration: "3 days (6 doses total)",
    warnings: ["NOT for severe malaria — refer immediately", "NOT for infants under 5 kg", "Take with food", "Complete ALL 6 doses"],
    storage: "Store below 30 degrees C. Protect from moisture and light.",
    unit: "tablets",
    perKg: null,
    form: "tablet",
    weightBased: [
      { min: 5, max: 14, dose: 1 },
      { min: 15, max: 24, dose: 2 },
      { min: 25, max: 34, dose: 3 },
      { min: 35, max: 999, dose: 4 },
    ],
  },
  {
    id: "misoprostol",
    name: "Misoprostol",
    treats: "Prevention of postpartum hemorrhage (PPH)",
    preparation: "Administer immediately after delivery of the baby. Sublingual (under tongue) for fastest action.",
    dosages: {
      "0-2mo": "N/A",
      "2-12mo": "N/A",
      "1-5yr": "N/A",
      "5-12yr": "N/A",
      adult: "600 mcg (3 tablets of 200 mcg) sublingual, single dose",
    },
    frequency: "Single dose only",
    duration: "One-time use immediately after delivery",
    warnings: ["ONLY for postpartum use", "Do NOT give before delivery", "Do NOT use for abortion — dangerous", "Monitor for shivering and fever (common side effects)"],
    storage: "Store below 25 degrees C. Protect from moisture. Keep sealed in blister pack.",
    unit: "mcg",
    perKg: null,
    form: "tablet",
    fixedAdultDose: 600,
  },
];

const AGE_GROUPS = [
  { key: "0-2mo", label: "0 - 2 months" },
  { key: "2-12mo", label: "2 - 12 months" },
  { key: "1-5yr", label: "1 - 5 years" },
  { key: "5-12yr", label: "5 - 12 years" },
  { key: "adult", label: "Adult (12+)" },
];

const SECTIONS = [
  { id: "drugs", label: "Drug Reference" },
  { id: "calculator", label: "Dosage Calc" },
  { id: "emergency", label: "Emergency" },
  { id: "log", label: "Patient Log" },
];

const CHILD_DANGER_SIGNS = [
  "Not eating or drinking",
  "Convulsions / seizures",
  "Severe dehydration (sunken eyes, dry mouth, no tears)",
  "Chest indrawing (difficulty breathing)",
  "Unconscious or very sleepy",
  "Blood in stool",
  "Persistent vomiting (cannot keep anything down)",
  "High fever unresponsive to paracetamol",
];

const ADULT_DANGER_SIGNS = [
  "Severe bleeding (especially postpartum)",
  "High fever > 39 degrees C unresponsive to treatment",
  "Chest pain or pressure",
  "Difficulty breathing / rapid breathing",
  "Confusion or loss of consciousness",
  "Severe abdominal pain",
  "Inability to drink or eat for > 24 hours",
  "Signs of severe malaria (jaundice, dark urine)",
];

/* ─── Helper: get today's date key ─── */
function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/* ─── Icons (inline SVG, no external deps) ─── */
function StethoscopeIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.8 2.655A2 2 0 006 5v1a4 4 0 008 0V5a2 2 0 001.2-2.345" />
      <path d="M14 5a4 4 0 01-8 0" />
      <path d="M10 10v3a4 4 0 004 4h1a2 2 0 002-2v-1a2 2 0 114 0v1a6 6 0 01-6 6h-1a8 8 0 01-8-8v-3" />
    </svg>
  );
}

function PillIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6V3z" />
    </svg>
  );
}

function CalculatorIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <line x1="8" y1="6" x2="16" y2="6" />
      <line x1="8" y1="10" x2="10" y2="10" />
      <line x1="14" y1="10" x2="16" y2="10" />
      <line x1="8" y1="14" x2="10" y2="14" />
      <line x1="14" y1="14" x2="16" y2="14" />
      <line x1="8" y1="18" x2="16" y2="18" />
    </svg>
  );
}

function AlertIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
    </svg>
  );
}

function ClipboardIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <line x1="9" y1="12" x2="15" y2="12" />
      <line x1="9" y1="16" x2="15" y2="16" />
    </svg>
  );
}

function WifiOffIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="1" y1="1" x2="23" y2="23" />
      <path d="M16.72 11.06A10.94 10.94 0 0119 12.55" />
      <path d="M5 12.55a10.94 10.94 0 015.17-2.39" />
      <path d="M10.71 5.05A16 16 0 0122.56 9" />
      <path d="M1.42 9a15.91 15.91 0 014.7-2.88" />
      <path d="M8.53 16.11a6 6 0 016.95 0" />
      <line x1="12" y1="20" x2="12.01" y2="20" />
    </svg>
  );
}

function WifiIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.55a11 11 0 0114.08 0" />
      <path d="M1.42 9a16 16 0 0121.16 0" />
      <path d="M8.53 16.11a6 6 0 016.95 0" />
      <line x1="12" y1="20" x2="12.01" y2="20" />
    </svg>
  );
}

function ChevronDownIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  );
}

function ChevronUpIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
    </svg>
  );
}

/* ─── Drug Reference Card ─── */
function DrugCard({ drug }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setExpanded((p) => !p)}
      className="w-full text-left rounded-2xl dark-glass border border-warm-200 dark:border-[#C9A84C]/20 p-5 sm:p-6 transition-all duration-200 hover:border-[#C9A84C]/40 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50 min-h-[48px]"
    >
      {/* Card header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-xl sm:text-2xl font-display gold-text leading-tight">{drug.name}</h3>
          <p className="mt-1 text-lg font-body text-gray-700 dark:text-gray-300">{drug.treats}</p>
        </div>
        <div className="flex-shrink-0 mt-1">
          {expanded ? (
            <ChevronUpIcon className="w-7 h-7 text-[#C9A84C]" />
          ) : (
            <ChevronDownIcon className="w-7 h-7 text-[#C9A84C]" />
          )}
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="mt-5 space-y-5" onClick={(e) => e.stopPropagation()}>
          {/* Preparation */}
          {drug.preparation && (
            <div className="rounded-xl bg-[#C9A84C]/5 dark:bg-[#C9A84C]/10 border border-[#C9A84C]/20 p-4">
              <p className="text-lg font-body font-semibold text-[#A8893A] dark:text-[#E8D48B] mb-1">Preparation</p>
              <p className="text-lg font-body text-gray-700 dark:text-gray-300">{drug.preparation}</p>
            </div>
          )}

          {/* Dosage table */}
          <div>
            <p className="text-lg font-body font-semibold text-gray-800 dark:text-gray-200 mb-3">Dosage by Age Group</p>
            <div className="overflow-x-auto rounded-xl border border-warm-200 dark:border-gray-700">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-warm-100 dark:bg-gray-800/60">
                    <th className="px-4 py-3 text-lg font-body font-semibold text-gray-800 dark:text-gray-200">Age Group</th>
                    <th className="px-4 py-3 text-lg font-body font-semibold text-gray-800 dark:text-gray-200">Dosage</th>
                  </tr>
                </thead>
                <tbody>
                  {AGE_GROUPS.map((ag) => (
                    <tr key={ag.key} className="border-t border-warm-200 dark:border-gray-700">
                      <td className="px-4 py-3 text-lg font-body font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">{ag.label}</td>
                      <td className="px-4 py-3 text-lg font-body text-gray-700 dark:text-gray-300">{drug.dosages[ag.key]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Frequency & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl bg-warm-50 dark:bg-gray-800/40 border border-warm-200 dark:border-gray-700 p-4">
              <p className="text-base font-body font-semibold text-gray-500 dark:text-gray-400">Frequency</p>
              <p className="text-lg font-body text-gray-800 dark:text-gray-200 mt-1">{drug.frequency}</p>
            </div>
            <div className="rounded-xl bg-warm-50 dark:bg-gray-800/40 border border-warm-200 dark:border-gray-700 p-4">
              <p className="text-base font-body font-semibold text-gray-500 dark:text-gray-400">Duration</p>
              <p className="text-lg font-body text-gray-800 dark:text-gray-200 mt-1">{drug.duration}</p>
            </div>
          </div>

          {/* Warnings */}
          <div className="rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 p-4">
            <p className="text-lg font-body font-bold text-red-700 dark:text-red-400 mb-2">Warnings</p>
            <ul className="space-y-1">
              {drug.warnings.map((w, i) => (
                <li key={i} className="flex items-start gap-2 text-lg font-body text-red-700 dark:text-red-400">
                  <span className="flex-shrink-0 mt-1 w-2 h-2 rounded-full bg-red-500" />
                  {w}
                </li>
              ))}
            </ul>
          </div>

          {/* Storage */}
          <div className="rounded-xl bg-warm-50 dark:bg-gray-800/40 border border-warm-200 dark:border-gray-700 p-4">
            <p className="text-base font-body font-semibold text-gray-500 dark:text-gray-400">Storage</p>
            <p className="text-lg font-body text-gray-700 dark:text-gray-300 mt-1">{drug.storage}</p>
          </div>
        </div>
      )}
    </button>
  );
}

/* ─── Dosage Calculator ─── */
function DosageCalculator() {
  const [selectedDrug, setSelectedDrug] = useState("");
  const [weight, setWeight] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [result, setResult] = useState(null);

  function calculate() {
    const drug = DRUG_DATA.find((d) => d.id === selectedDrug);
    if (!drug) return;

    const w = parseFloat(weight);
    const hasWeight = !isNaN(w) && w > 0;

    let dose = "";
    let tablets = "";
    let frequency = drug.frequency;
    let duration = drug.duration;

    if (drug.id === "misoprostol") {
      dose = "600 mcg (3 tablets of 200 mcg)";
      tablets = "3 tablets";
      frequency = "Single dose only";
      duration = "One-time use after delivery";
    } else if (drug.id === "act" && drug.weightBased) {
      if (hasWeight) {
        const match = drug.weightBased.find((r) => w >= r.min && w <= r.max);
        if (match) {
          dose = `${match.dose} tablet(s) per dose`;
          tablets = `${match.dose} tablet(s)`;
        } else {
          dose = "Weight out of range. Please refer.";
        }
      } else if (ageGroup) {
        dose = drug.dosages[ageGroup];
        tablets = dose;
      } else {
        setResult({ error: "Please enter weight or select an age group." });
        return;
      }
    } else if (drug.id === "zinc") {
      if (ageGroup === "0-2mo") {
        dose = "Not recommended under 2 months";
      } else if (ageGroup === "2-12mo" || (hasWeight && w < 10)) {
        dose = "10 mg (half tablet) once daily";
        tablets = "Half tablet";
      } else {
        dose = "20 mg (1 tablet) once daily";
        tablets = "1 tablet";
      }
    } else if (hasWeight && drug.perKg) {
      const doseValue = Math.round(w * drug.perKg);
      dose = `${doseValue} ${drug.unit}`;
      if (drug.tabletMg) {
        const numTablets = (doseValue / drug.tabletMg).toFixed(1);
        tablets = `${numTablets} tablet(s) or ${doseValue} mg`;
      }
      if (drug.id === "ors") {
        dose = `${doseValue} mL per dose`;
        tablets = `${doseValue} mL`;
      }
    } else if (ageGroup && drug.dosages[ageGroup]) {
      dose = drug.dosages[ageGroup];
      tablets = dose;
    } else {
      setResult({ error: "Please enter weight or select an age group." });
      return;
    }

    setResult({ drug: drug.name, dose, tablets, frequency, duration, error: null });
  }

  return (
    <div className="space-y-5">
      {/* Drug selector */}
      <div>
        <label className="block text-lg font-body font-semibold text-gray-800 dark:text-gray-200 mb-2">
          Select Medicine
        </label>
        <div className="relative">
          <select
            value={selectedDrug}
            onChange={(e) => { setSelectedDrug(e.target.value); setResult(null); }}
            className="admin-select w-full appearance-none rounded-xl border border-warm-200 dark:border-gray-700 bg-warm-50 dark:bg-gray-800 text-lg font-body text-gray-800 dark:text-gray-200 px-4 py-4 pr-10 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50 focus:border-[#C9A84C] min-h-[48px]"
          >
            <option value="">-- Choose a drug --</option>
            {DRUG_DATA.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Weight input */}
      <div>
        <label className="block text-lg font-body font-semibold text-gray-800 dark:text-gray-200 mb-2">
          Patient Weight (kg)
        </label>
        <input
          type="number"
          inputMode="decimal"
          value={weight}
          onChange={(e) => { setWeight(e.target.value); setResult(null); }}
          placeholder="Enter weight in kg"
          className="w-full rounded-xl border border-warm-200 dark:border-gray-700 bg-warm-50 dark:bg-gray-800 text-lg font-body text-gray-800 dark:text-gray-200 px-4 py-4 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50 focus:border-[#C9A84C] min-h-[48px] placeholder:text-gray-400"
        />
      </div>

      {/* OR divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-warm-200 dark:bg-gray-700" />
        <span className="text-lg font-body font-semibold text-gray-500 dark:text-gray-400">OR</span>
        <div className="flex-1 h-px bg-warm-200 dark:bg-gray-700" />
      </div>

      {/* Age group selector */}
      <div>
        <label className="block text-lg font-body font-semibold text-gray-800 dark:text-gray-200 mb-2">
          Select Age Range
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {AGE_GROUPS.map((ag) => (
            <button
              key={ag.key}
              type="button"
              onClick={() => { setAgeGroup(ag.key === ageGroup ? "" : ag.key); setResult(null); }}
              className={`rounded-xl px-4 py-3 text-lg font-body font-medium transition-all min-h-[48px] border ${
                ageGroup === ag.key
                  ? "bg-[#C9A84C] text-white border-[#C9A84C] shadow-md"
                  : "bg-warm-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-warm-200 dark:border-gray-700 hover:border-[#C9A84C]/40"
              }`}
            >
              {ag.label}
            </button>
          ))}
        </div>
      </div>

      {/* Calculate button */}
      <button
        type="button"
        onClick={calculate}
        disabled={!selectedDrug}
        className="w-full rounded-xl bg-gradient-to-r from-[#C9A84C] to-[#A8893A] text-white text-xl font-body font-bold py-4 px-6 min-h-[56px] transition-all hover:shadow-lg hover:shadow-[#C9A84C]/20 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50"
      >
        Calculate Dosage
      </button>

      {/* Result */}
      {result && (
        <div className={`rounded-2xl p-6 border ${
          result.error
            ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/40"
            : "bg-[#C9A84C]/5 dark:bg-[#C9A84C]/10 border-[#C9A84C]/30"
        }`}>
          {result.error ? (
            <p className="text-xl font-body font-bold text-red-600 dark:text-red-400">{result.error}</p>
          ) : (
            <div className="space-y-4">
              <h4 className="text-xl font-display gold-text">{result.drug}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-base font-body font-semibold text-gray-500 dark:text-gray-400">Dose</p>
                  <p className="text-2xl font-body font-bold text-gray-900 dark:text-white mt-1">{result.dose}</p>
                </div>
                {result.tablets && (
                  <div>
                    <p className="text-base font-body font-semibold text-gray-500 dark:text-gray-400">Amount</p>
                    <p className="text-2xl font-body font-bold text-gray-900 dark:text-white mt-1">{result.tablets}</p>
                  </div>
                )}
                <div>
                  <p className="text-base font-body font-semibold text-gray-500 dark:text-gray-400">Frequency</p>
                  <p className="text-xl font-body font-bold text-gray-800 dark:text-gray-200 mt-1">{result.frequency}</p>
                </div>
                <div>
                  <p className="text-base font-body font-semibold text-gray-500 dark:text-gray-400">Duration</p>
                  <p className="text-xl font-body font-bold text-gray-800 dark:text-gray-200 mt-1">{result.duration}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Emergency Escalation ─── */
function EmergencyEscalation() {
  const [checkedChild, setCheckedChild] = useState([]);
  const [checkedAdult, setCheckedAdult] = useState([]);

  const toggleChild = (idx) => {
    setCheckedChild((prev) => prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]);
  };
  const toggleAdult = (idx) => {
    setCheckedAdult((prev) => prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]);
  };

  const anyChecked = checkedChild.length > 0 || checkedAdult.length > 0;

  return (
    <div className="space-y-6">
      {/* Big escalation button */}
      <a
        href="/chat"
        className="block w-full rounded-2xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-center text-2xl font-body font-bold py-6 px-6 min-h-[64px] shadow-lg shadow-red-500/20 transition-all focus:outline-none focus:ring-2 focus:ring-red-500/50"
      >
        <div className="flex items-center justify-center gap-3">
          <AlertIcon className="w-8 h-8" />
          <span>Escalate to Pharmacist</span>
        </div>
      </a>

      {anyChecked && (
        <div className="rounded-2xl bg-red-50 dark:bg-red-950/40 border-2 border-red-400 dark:border-red-600 p-5 animate-pulse">
          <p className="text-xl font-body font-bold text-red-700 dark:text-red-400 text-center">
            DANGER SIGN DETECTED — REFER IMMEDIATELY
          </p>
        </div>
      )}

      {/* Danger signs instructions */}
      <div className="rounded-2xl dark-glass border border-warm-200 dark:border-red-800/30 p-5 sm:p-6">
        <p className="text-xl font-body font-bold text-gray-900 dark:text-white mb-1">
          Danger Signs Checklist
        </p>
        <p className="text-lg font-body text-gray-600 dark:text-gray-400 mb-5">
          Check these — if ANY are present, refer the patient immediately.
        </p>

        {/* Child danger signs */}
        <div className="mb-6">
          <h4 className="text-lg font-body font-bold text-[#A8893A] dark:text-[#E8D48B] mb-3 uppercase tracking-wide">
            Child Danger Signs
          </h4>
          <div className="space-y-2">
            {CHILD_DANGER_SIGNS.map((sign, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => toggleChild(idx)}
                className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left text-lg font-body transition-all min-h-[48px] border ${
                  checkedChild.includes(idx)
                    ? "bg-red-100 dark:bg-red-950/50 border-red-400 dark:border-red-600 text-red-800 dark:text-red-300"
                    : "bg-warm-50 dark:bg-gray-800/40 border-warm-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-red-300"
                }`}
              >
                <span className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                  checkedChild.includes(idx) ? "bg-red-500 border-red-500" : "border-gray-400 dark:border-gray-600"
                }`}>
                  {checkedChild.includes(idx) && (
                    <svg className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </span>
                <span>{sign}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Adult danger signs */}
        <div>
          <h4 className="text-lg font-body font-bold text-[#A8893A] dark:text-[#E8D48B] mb-3 uppercase tracking-wide">
            Adult Danger Signs
          </h4>
          <div className="space-y-2">
            {ADULT_DANGER_SIGNS.map((sign, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => toggleAdult(idx)}
                className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left text-lg font-body transition-all min-h-[48px] border ${
                  checkedAdult.includes(idx)
                    ? "bg-red-100 dark:bg-red-950/50 border-red-400 dark:border-red-600 text-red-800 dark:text-red-300"
                    : "bg-warm-50 dark:bg-gray-800/40 border-warm-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-red-300"
                }`}
              >
                <span className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                  checkedAdult.includes(idx) ? "bg-red-500 border-red-500" : "border-gray-400 dark:border-gray-600"
                }`}>
                  {checkedAdult.includes(idx) && (
                    <svg className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </span>
                <span>{sign}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Direct link to pharmacist chat */}
      <a
        href="/chat"
        className="block w-full rounded-xl bg-[#C9A84C]/10 hover:bg-[#C9A84C]/20 border border-[#C9A84C]/30 text-center text-xl font-body font-semibold text-[#A8893A] dark:text-[#E8D48B] py-4 px-6 min-h-[56px] transition-all focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50"
      >
        Open Pharmacist Chat
      </a>
    </div>
  );
}

/* ─── Patient Log ─── */
function PatientLog() {
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({ initials: "", age: "", drug: "", quantity: "" });
  const [exportMsg, setExportMsg] = useState("");

  const storageKey = `chw-log-${todayKey()}`;

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setEntries(JSON.parse(saved));
    } catch { /* silent */ }
  }, [storageKey]);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(entries));
    } catch { /* silent */ }
  }, [entries, storageKey]);

  function addEntry(e) {
    e.preventDefault();
    if (!form.initials.trim() || !form.drug) return;
    const newEntry = {
      id: Date.now(),
      initials: form.initials.trim().toUpperCase(),
      age: form.age,
      drug: form.drug,
      quantity: form.quantity,
      time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
    };
    setEntries((prev) => [newEntry, ...prev]);
    setForm({ initials: "", age: "", drug: "", quantity: "" });
  }

  function removeEntry(id) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  function exportLog() {
    const today = todayKey();
    const lines = [`CHW Patient Log — ${today}`, `Total entries: ${entries.length}`, "---"];
    entries.forEach((e, i) => {
      lines.push(`${i + 1}. [${e.time}] ${e.initials} | Age: ${e.age} | Drug: ${e.drug} | Qty: ${e.quantity}`);
    });
    lines.push("---", "End of log");
    const text = lines.join("\n");

    // Try clipboard, fallback to download
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        () => setExportMsg("Log copied to clipboard!"),
        () => downloadText(text, today)
      );
    } else {
      downloadText(text, today);
    }
  }

  function downloadText(text, today) {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chw-log-${today}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setExportMsg("Log downloaded!");
  }

  // Clear export message after 3 seconds
  useEffect(() => {
    if (!exportMsg) return;
    const t = setTimeout(() => setExportMsg(""), 3000);
    return () => clearTimeout(t);
  }, [exportMsg]);

  return (
    <div className="space-y-6">
      {/* Entry form */}
      <form onSubmit={addEntry} className="rounded-2xl dark-glass border border-warm-200 dark:border-[#C9A84C]/20 p-5 sm:p-6 space-y-4">
        <h4 className="text-xl font-display gold-text">New Patient Entry</h4>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-base font-body font-semibold text-gray-700 dark:text-gray-300 mb-1">Patient Initials</label>
            <input
              type="text"
              maxLength={4}
              value={form.initials}
              onChange={(e) => setForm({ ...form, initials: e.target.value })}
              placeholder="e.g. AK"
              required
              className="w-full rounded-xl border border-warm-200 dark:border-gray-700 bg-warm-50 dark:bg-gray-800 text-lg font-body text-gray-800 dark:text-gray-200 px-4 py-3 min-h-[48px] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50 placeholder:text-gray-400"
            />
          </div>
          <div>
            <label className="block text-base font-body font-semibold text-gray-700 dark:text-gray-300 mb-1">Age</label>
            <input
              type="text"
              value={form.age}
              onChange={(e) => setForm({ ...form, age: e.target.value })}
              placeholder="e.g. 3yr"
              className="w-full rounded-xl border border-warm-200 dark:border-gray-700 bg-warm-50 dark:bg-gray-800 text-lg font-body text-gray-800 dark:text-gray-200 px-4 py-3 min-h-[48px] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50 placeholder:text-gray-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-base font-body font-semibold text-gray-700 dark:text-gray-300 mb-1">Drug Dispensed</label>
            <div className="relative">
              <select
                value={form.drug}
                onChange={(e) => setForm({ ...form, drug: e.target.value })}
                required
                className="admin-select w-full appearance-none rounded-xl border border-warm-200 dark:border-gray-700 bg-warm-50 dark:bg-gray-800 text-lg font-body text-gray-800 dark:text-gray-200 px-4 py-3 pr-10 min-h-[48px] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50"
              >
                <option value="">-- Drug --</option>
                {DRUG_DATA.map((d) => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>
              <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-base font-body font-semibold text-gray-700 dark:text-gray-300 mb-1">Quantity</label>
            <input
              type="text"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              placeholder="e.g. 6 tabs"
              className="w-full rounded-xl border border-warm-200 dark:border-gray-700 bg-warm-50 dark:bg-gray-800 text-lg font-body text-gray-800 dark:text-gray-200 px-4 py-3 min-h-[48px] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50 placeholder:text-gray-400"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full rounded-xl bg-gradient-to-r from-[#C9A84C] to-[#A8893A] text-white text-xl font-body font-bold py-4 px-6 min-h-[56px] transition-all hover:shadow-lg hover:shadow-[#C9A84C]/20 focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50"
        >
          Add Entry
        </button>
      </form>

      {/* Today's entries */}
      <div className="rounded-2xl dark-glass border border-warm-200 dark:border-[#C9A84C]/20 p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xl font-display gold-text">
            Today&apos;s Log ({entries.length})
          </h4>
          {entries.length > 0 && (
            <button
              type="button"
              onClick={exportLog}
              className="rounded-xl bg-[#C9A84C]/10 hover:bg-[#C9A84C]/20 border border-[#C9A84C]/30 text-lg font-body font-semibold text-[#A8893A] dark:text-[#E8D48B] px-4 py-2 min-h-[48px] transition-all focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/50"
            >
              Export Today&apos;s Log
            </button>
          )}
        </div>

        {exportMsg && (
          <div className="rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-400 text-lg font-body font-semibold px-4 py-3 mb-4 text-center">
            {exportMsg}
          </div>
        )}

        {entries.length === 0 ? (
          <p className="text-lg font-body text-gray-500 dark:text-gray-400 text-center py-8">
            No entries yet today. Add your first patient above.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-warm-200 dark:border-gray-700">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-warm-100 dark:bg-gray-800/60">
                  <th className="px-3 py-3 text-base font-body font-semibold text-gray-700 dark:text-gray-300">Time</th>
                  <th className="px-3 py-3 text-base font-body font-semibold text-gray-700 dark:text-gray-300">Patient</th>
                  <th className="px-3 py-3 text-base font-body font-semibold text-gray-700 dark:text-gray-300">Age</th>
                  <th className="px-3 py-3 text-base font-body font-semibold text-gray-700 dark:text-gray-300">Drug</th>
                  <th className="px-3 py-3 text-base font-body font-semibold text-gray-700 dark:text-gray-300">Qty</th>
                  <th className="px-3 py-3 text-base font-body font-semibold text-gray-700 dark:text-gray-300 sr-only">Remove</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id} className="border-t border-warm-200 dark:border-gray-700">
                    <td className="px-3 py-3 text-lg font-body text-gray-600 dark:text-gray-400 whitespace-nowrap">{entry.time}</td>
                    <td className="px-3 py-3 text-lg font-body font-bold text-gray-800 dark:text-gray-200">{entry.initials}</td>
                    <td className="px-3 py-3 text-lg font-body text-gray-700 dark:text-gray-300">{entry.age}</td>
                    <td className="px-3 py-3 text-lg font-body text-gray-700 dark:text-gray-300">{entry.drug}</td>
                    <td className="px-3 py-3 text-lg font-body text-gray-700 dark:text-gray-300">{entry.quantity}</td>
                    <td className="px-3 py-3">
                      <button
                        type="button"
                        onClick={() => removeEntry(entry.id)}
                        className="rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 p-2 min-w-[48px] min-h-[48px] flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-red-500/50"
                        aria-label="Remove entry"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.519.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Offline Banner ─── */
function OfflineBanner() {
  const [online, setOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);

  useEffect(() => {
    function handleOnline() { setOnline(true); }
    function handleOffline() { setOnline(false); }
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (online) {
    return (
      <div className="rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-300 dark:border-green-700 px-4 py-3 flex items-center gap-3">
        <WifiIcon className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0" />
        <span className="text-lg font-body font-semibold text-green-700 dark:text-green-400">Online — Connected</span>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-400 dark:border-amber-700 px-4 py-3 flex items-center gap-3 animate-pulse">
      <WifiOffIcon className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0" />
      <span className="text-lg font-body font-bold text-amber-700 dark:text-amber-400">Offline — No internet connection. Data saved locally.</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════════════ */
export default function CHWMode() {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState("drugs");

  return (
    <div className="space-y-6 pb-8 max-w-4xl mx-auto">
      {/* ─── Offline Indicator ─── */}
      <OfflineBanner />

      {/* ─── Header ─── */}
      <div className="relative overflow-hidden rounded-2xl dark-glass p-6 sm:p-8 text-center">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent" />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-60 h-60 rounded-full bg-[#C9A84C]/5 blur-[80px]" />

        <div className="relative">
          {/* Badge */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#C9A84C]/10 ring-2 ring-[#C9A84C]/30 mb-4">
            <StethoscopeIcon className="w-9 h-9 text-[#C9A84C]" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-display gold-text">
            CHW Field Mode
          </h1>
          <p className="mt-2 text-lg font-body text-gray-600 dark:text-gray-400 max-w-lg mx-auto">
            Quick reference for Community Health Workers
          </p>
        </div>

        {/* Ghana flag accent */}
        <div className="absolute bottom-0 left-0 right-0 h-[3px] flex">
          <div className="flex-1 bg-ghana-red/50" />
          <div className="flex-1 bg-ghana-gold/50" />
          <div className="flex-1 bg-ghana-green/50" />
        </div>
      </div>

      {/* ─── Section Toggle ─── */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {SECTIONS.map((section) => {
          const isActive = activeSection === section.id;
          const Icon = section.id === "drugs" ? PillIcon
            : section.id === "calculator" ? CalculatorIcon
            : section.id === "emergency" ? AlertIcon
            : ClipboardIcon;
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-2 rounded-xl px-5 py-3 text-lg font-body font-semibold whitespace-nowrap transition-all min-h-[48px] border ${
                isActive
                  ? "bg-[#C9A84C] text-white border-[#C9A84C] shadow-md shadow-[#C9A84C]/20"
                  : "bg-warm-50 dark:bg-gray-800/60 text-gray-600 dark:text-gray-400 border-warm-200 dark:border-gray-700 hover:border-[#C9A84C]/40 hover:text-[#C9A84C]"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-white" : ""}`} />
              <span>{section.label}</span>
            </button>
          );
        })}
      </div>

      {/* ─── Active Section Content ─── */}
      <div className="animate-stagger">
        {/* Drug Reference */}
        {activeSection === "drugs" && (
          <div className="space-y-4">
            <div className="rounded-2xl dark-glass border border-warm-200 dark:border-[#C9A84C]/20 p-5 sm:p-6">
              <h2 className="text-2xl font-display gold-text mb-1">Quick Drug Reference</h2>
              <p className="text-lg font-body text-gray-600 dark:text-gray-400">
                Tap a card to expand dosage details, warnings, and storage info.
              </p>
            </div>
            {DRUG_DATA.map((drug) => (
              <DrugCard key={drug.id} drug={drug} />
            ))}
          </div>
        )}

        {/* Dosage Calculator */}
        {activeSection === "calculator" && (
          <div className="rounded-2xl dark-glass border border-warm-200 dark:border-[#C9A84C]/20 p-5 sm:p-6">
            <h2 className="text-2xl font-display gold-text mb-1">Weight-Based Dosage Calculator</h2>
            <p className="text-lg font-body text-gray-600 dark:text-gray-400 mb-6">
              Enter patient weight or select age range to calculate the correct dose.
            </p>
            <DosageCalculator />
          </div>
        )}

        {/* Emergency Escalation */}
        {activeSection === "emergency" && (
          <div>
            <EmergencyEscalation />
          </div>
        )}

        {/* Patient Log */}
        {activeSection === "log" && (
          <div>
            <PatientLog />
          </div>
        )}
      </div>
    </div>
  );
}