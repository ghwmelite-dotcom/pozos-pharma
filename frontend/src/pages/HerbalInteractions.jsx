import { useState } from "react";
import { useTranslation } from "../i18n/useTranslation";

/* ───────────────────── Mock Data ───────────────────── */

const MOCK_MEDICATIONS = [
  { id: "met", name: "Metformin", class: "Antidiabetic" },
  { id: "aml", name: "Amlodipine", class: "Antihypertensive" },
  { id: "war", name: "Warfarin", class: "Anticoagulant" },
  { id: "mtx", name: "Methotrexate", class: "Immunosuppressant" },
  { id: "efv", name: "Efavirenz (ARV)", class: "Antiretroviral" },
];

const MOCK_HERBS = [
  { id: "mor", name: "Moringa", localName: "Moringa" },
  { id: "nee", name: "Neem", localName: "Nim tree" },
  { id: "pre", name: "Prekese", localName: "Aidan fruit" },
  { id: "bit", name: "Bitter Leaf", localName: "Awonwono" },
  { id: "mah", name: "Mahogany bark", localName: "Khaya" },
  { id: "cry", name: "Cryptolepis", localName: "Nibima" },
  { id: "alo", name: "Aloe Vera", localName: "Aloe" },
  { id: "gin", name: "Ginger", localName: "Akakaduro" },
  { id: "gar", name: "Garlic", localName: "Gyene" },
  { id: "tur", name: "Turmeric", localName: "Atiko" },
  { id: "she", name: "Shea butter (oral)", localName: "Nkuto" },
  { id: "mis", name: "African Mistletoe", localName: "Nkranpan" },
];

const INTERACTION_DATABASE = [
  {
    herbId: "mor",
    drugId: "met",
    severity: "MODERATE",
    description:
      "Moringa has demonstrated hypoglycaemic properties in multiple studies. When combined with Metformin, the additive blood-sugar-lowering effect may lead to hypoglycaemia (dangerously low blood sugar), especially if meals are skipped.",
    recommendation:
      "Monitor blood glucose closely. Do not adjust Metformin dosage without consulting your pharmacist. Take Moringa supplements at least 2 hours apart from Metformin.",
  },
  {
    herbId: "nee",
    drugId: "war",
    severity: "SEVERE",
    description:
      "Neem contains compounds that inhibit platelet aggregation and may potentiate the anticoagulant effect of Warfarin. This significantly increases the risk of uncontrolled bleeding, including internal haemorrhage.",
    recommendation:
      "AVOID this combination. If you have been using Neem products, inform your doctor immediately and request an INR test. Do not stop Warfarin without medical supervision.",
  },
  {
    herbId: "pre",
    drugId: "aml",
    severity: "MILD",
    description:
      "Prekese (Tetrapleura tetraptera) has mild vasodilatory properties. When taken alongside Amlodipine, it may slightly enhance the blood-pressure-lowering effect, potentially causing dizziness or lightheadedness.",
    recommendation:
      "Generally safe in small culinary amounts. If using concentrated Prekese extracts, monitor blood pressure regularly and report any persistent dizziness to your pharmacist.",
  },
  {
    herbId: "gar",
    drugId: "efv",
    severity: "MODERATE",
    description:
      "Garlic supplements (particularly allicin-rich extracts) can induce CYP3A4 and CYP2B6 liver enzymes, potentially reducing plasma concentrations of Efavirenz by 40-50%. This may lead to subtherapeutic ARV levels and risk of HIV treatment failure.",
    recommendation:
      "Avoid high-dose garlic supplements while on ARV therapy. Small culinary amounts in food are generally acceptable. Discuss any herbal supplement use with your HIV clinician.",
  },
  {
    herbId: "cry",
    drugId: "met",
    severity: "MODERATE",
    description:
      "Cryptolepis (Nibima) is traditionally used for malaria and diabetes in Ghana. Its blood-sugar-lowering properties may compound with Metformin, increasing hypoglycaemia risk.",
    recommendation:
      "If using Nibima for malaria treatment, inform your pharmacist about your Metformin use. Blood glucose monitoring is essential during concurrent use.",
  },
  {
    herbId: "gin",
    drugId: "war",
    severity: "MODERATE",
    description:
      "Ginger contains gingerols that inhibit thromboxane synthetase, which may enhance Warfarin's anticoagulant effect and increase bleeding risk.",
    recommendation:
      "Limit ginger intake to small culinary amounts. Avoid concentrated ginger supplements or ginger teas in large quantities while on Warfarin. Have INR checked regularly.",
  },
  {
    herbId: "tur",
    drugId: "war",
    severity: "MODERATE",
    description:
      "Turmeric (curcumin) has antiplatelet activity and may potentiate Warfarin's blood-thinning effect. High doses increase bleeding risk.",
    recommendation:
      "Avoid concentrated turmeric/curcumin supplements. Small amounts in cooking are generally safe. Monitor for unusual bruising or bleeding.",
  },
  {
    herbId: "alo",
    drugId: "met",
    severity: "MILD",
    description:
      "Aloe Vera juice taken orally may have mild hypoglycaemic effects. Combined with Metformin, there is a slight additive risk of low blood sugar.",
    recommendation:
      "If consuming Aloe Vera juice regularly, monitor blood sugar levels and be alert for signs of hypoglycaemia (shakiness, sweating, confusion).",
  },
  {
    herbId: "mis",
    drugId: "aml",
    severity: "MODERATE",
    description:
      "African Mistletoe (Tapinanthus spp.) is used traditionally for hypertension. Combined with Amlodipine, the dual blood-pressure-lowering effect may cause excessive hypotension.",
    recommendation:
      "Do not self-medicate with both. If you wish to use African Mistletoe, consult your pharmacist about adjusting your Amlodipine dose. Monitor blood pressure regularly.",
  },
  {
    herbId: "bit",
    drugId: "mtx",
    severity: "SEVERE",
    description:
      "Bitter Leaf (Vernonia amygdalina) has hepatoprotective claims but may also stress liver metabolism. Methotrexate is hepatotoxic; combining them may worsen liver damage or alter drug clearance unpredictably.",
    recommendation:
      "AVOID this combination. Methotrexate requires careful liver function monitoring. Inform your oncologist or rheumatologist about any herbal remedy use immediately.",
  },
  {
    herbId: "mah",
    drugId: "efv",
    severity: "MODERATE",
    description:
      "Mahogany bark (Khaya senegalensis) is used traditionally for fevers. It may affect CYP450 enzyme activity, potentially altering Efavirenz metabolism and leading to unpredictable drug levels.",
    recommendation:
      "Avoid concurrent use. If using mahogany bark preparations, inform your HIV clinician so they can monitor viral load and drug levels.",
  },
];

const HERB_REFERENCE = [
  {
    name: "Moringa",
    localName: "Moringa oleifera",
    uses: "Nutritional supplement, blood sugar regulation, anti-inflammatory",
    warnings: "May lower blood sugar and blood pressure. Can interact with diabetes and thyroid medications.",
  },
  {
    name: "Neem",
    localName: "Nim tree (Azadirachta indica)",
    uses: "Antimalarial, skin conditions, dental hygiene, fever reduction",
    warnings: "Increases bleeding risk with anticoagulants. May cause liver damage in high doses. Unsafe in pregnancy.",
  },
  {
    name: "Prekese",
    localName: "Aidan fruit (Tetrapleura tetraptera)",
    uses: "Postpartum recovery, flavouring soups, blood pressure, inflammation",
    warnings: "May enhance blood pressure medications. Use caution with antihypertensives.",
  },
  {
    name: "Bitter Leaf",
    localName: "Awonwono (Vernonia amygdalina)",
    uses: "Malaria, stomach pain, diabetes management, wound healing",
    warnings: "May stress the liver. Avoid with hepatotoxic drugs (Methotrexate, some antibiotics).",
  },
  {
    name: "Cryptolepis",
    localName: "Nibima (Cryptolepis sanguinolenta)",
    uses: "Malaria treatment, fever, urinary infections, stomach ailments",
    warnings: "Strong hypoglycaemic effect. May interact with diabetes drugs. Antimalarial — do not combine with pharmaceutical antimalarials without guidance.",
  },
  {
    name: "Mahogany Bark",
    localName: "Khaya (Khaya senegalensis)",
    uses: "Fever, malaria, diarrhoea, pain relief",
    warnings: "May affect liver enzyme activity and alter drug metabolism. Avoid with ARVs and other CYP450-metabolised drugs.",
  },
  {
    name: "Garlic",
    localName: "Gyene (Allium sativum)",
    uses: "Cardiovascular health, immune support, antimicrobial",
    warnings: "Induces CYP3A4 enzymes. Can reduce ARV levels. Increases bleeding risk with anticoagulants.",
  },
  {
    name: "Ginger",
    localName: "Akakaduro (Zingiber officinale)",
    uses: "Nausea, digestive aid, anti-inflammatory, cold remedy",
    warnings: "Antiplatelet activity — caution with blood thinners. May affect blood sugar levels.",
  },
  {
    name: "Turmeric",
    localName: "Atiko (Curcuma longa)",
    uses: "Anti-inflammatory, joint pain, digestive health, skin conditions",
    warnings: "Antiplatelet effect in high doses. May interact with blood thinners and diabetes medications.",
  },
  {
    name: "Aloe Vera",
    localName: "Aloe (Aloe barbadensis)",
    uses: "Digestive health, skin healing, blood sugar support",
    warnings: "Oral use may lower blood sugar. Laxative effect in large amounts. May reduce absorption of oral medications.",
  },
  {
    name: "Shea Butter (oral)",
    localName: "Nkuto (Vitellaria paradoxa)",
    uses: "Anti-inflammatory (oral), nasal congestion, joint pain",
    warnings: "Generally well-tolerated. Limited interaction data — use caution with anti-inflammatory drugs.",
  },
  {
    name: "African Mistletoe",
    localName: "Nkranpan (Tapinanthus spp.)",
    uses: "Hypertension, diabetes, epilepsy, cancer (traditional claims)",
    warnings: "Strong blood pressure and blood sugar effects. Avoid with antihypertensives and antidiabetics without supervision.",
  },
];

const SEVERITY_CONFIG = {
  SEVERE: {
    bg: "bg-red-500/5 dark:bg-red-500/[0.03]",
    border: "border-red-500/30",
    text: "text-red-600 dark:text-red-400",
    badge: "bg-red-500/10 text-red-600 dark:text-red-400 ring-1 ring-red-500/20",
    dot: "bg-red-500",
    label: "Severe",
  },
  MODERATE: {
    bg: "bg-[#C9A84C]/5 dark:bg-[#C9A84C]/[0.03]",
    border: "border-[#C9A84C]/30",
    text: "text-[#A8893A] dark:text-[#E8D48B]",
    badge: "bg-[#C9A84C]/10 text-[#A8893A] dark:text-[#E8D48B] ring-1 ring-[#C9A84C]/20",
    dot: "bg-[#C9A84C]",
    label: "Moderate",
  },
  MILD: {
    bg: "bg-emerald-500/5 dark:bg-emerald-500/[0.03]",
    border: "border-emerald-500/30",
    text: "text-emerald-600 dark:text-emerald-400",
    badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20",
    dot: "bg-emerald-500",
    label: "Mild",
  },
};

/* ───────────────────── Icons (inline SVG) ───────────────────── */

function LeafPillIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      {/* Leaf */}
      <path
        d="M12 36C12 36 8 24 16 16C24 8 36 12 36 12C36 12 40 24 32 32C24 40 12 36 12 36Z"
        fill="currentColor"
        fillOpacity={0.15}
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M12 36L24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
      <path d="M20 28L28 20" stroke="currentColor" strokeWidth={1} strokeLinecap="round" opacity={0.5} />
      <path d="M16 32L24 24" stroke="currentColor" strokeWidth={1} strokeLinecap="round" opacity={0.5} />
      {/* Pill capsule */}
      <rect
        x="28"
        y="28"
        width="14"
        height="7"
        rx="3.5"
        transform="rotate(-45 28 28)"
        fill="currentColor"
        fillOpacity={0.3}
        stroke="currentColor"
        strokeWidth={1.5}
      />
      <line x1="33" y1="23" x2="37" y2="27" stroke="currentColor" strokeWidth={1} opacity={0.4} />
    </svg>
  );
}

function SearchIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
    </svg>
  );
}

function CloseIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  );
}

function WarningIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  );
}

function ShieldIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

/* ───────────────────── Component ───────────────────── */

export default function HerbalInteractions() {
  const { t } = useTranslation();

  // Medication state
  const [medQuery, setMedQuery] = useState("");
  const [selectedMeds, setSelectedMeds] = useState([]);
  const [medDropdownOpen, setMedDropdownOpen] = useState(false);

  // Herb state
  const [herbQuery, setHerbQuery] = useState("");
  const [selectedHerbs, setSelectedHerbs] = useState([]);
  const [herbDropdownOpen, setHerbDropdownOpen] = useState(false);

  // Results
  const [results, setResults] = useState(null);
  const [checking, setChecking] = useState(false);

  /* ── Medication helpers ── */
  const filteredMeds = MOCK_MEDICATIONS.filter(
    (m) =>
      m.name.toLowerCase().includes(medQuery.toLowerCase()) &&
      !selectedMeds.some((s) => s.id === m.id)
  );

  const addMed = (med) => {
    setSelectedMeds((prev) => [...prev, med]);
    setMedQuery("");
    setMedDropdownOpen(false);
  };

  const removeMed = (id) => {
    setSelectedMeds((prev) => prev.filter((m) => m.id !== id));
    setResults(null);
  };

  /* ── Herb helpers ── */
  const filteredHerbs = MOCK_HERBS.filter(
    (h) =>
      (h.name.toLowerCase().includes(herbQuery.toLowerCase()) ||
        h.localName.toLowerCase().includes(herbQuery.toLowerCase())) &&
      !selectedHerbs.some((s) => s.id === h.id)
  );

  const addHerb = (herb) => {
    setSelectedHerbs((prev) => [...prev, herb]);
    setHerbQuery("");
    setHerbDropdownOpen(false);
  };

  const removeHerb = (id) => {
    setSelectedHerbs((prev) => prev.filter((h) => h.id !== id));
    setResults(null);
  };

  /* ── Check interactions ── */
  const checkInteractions = () => {
    if (selectedMeds.length === 0 || selectedHerbs.length === 0) return;

    setChecking(true);
    setResults(null);

    // Simulate network delay
    setTimeout(() => {
      const found = INTERACTION_DATABASE.filter(
        (inter) =>
          selectedHerbs.some((h) => h.id === inter.herbId) &&
          selectedMeds.some((m) => m.id === inter.drugId)
      );

      // Sort by severity: SEVERE first, then MODERATE, then MILD
      const order = { SEVERE: 0, MODERATE: 1, MILD: 2 };
      found.sort((a, b) => order[a.severity] - order[b.severity]);

      setResults(found);
      setChecking(false);
    }, 1200);
  };

  const getHerbName = (id) => MOCK_HERBS.find((h) => h.id === id)?.name || id;
  const getDrugName = (id) => MOCK_MEDICATIONS.find((m) => m.id === id)?.name || id;

  return (
    <div className="space-y-8 pb-8">
      {/* ── Hero Section ── */}
      <div className="relative overflow-hidden rounded-2xl dark-glass p-8 sm:p-10 text-center">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent" />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-60 h-60 rounded-full bg-[#C9A84C]/5 blur-[80px]" />
        <div className="noise-overlay absolute inset-0 rounded-2xl pointer-events-none" />

        <div className="relative">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#C9A84C]/10 ring-1 ring-[#C9A84C]/20 mb-4">
            <LeafPillIcon className="w-9 h-9 text-[#C9A84C]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-display gold-text">
            Herbal-Drug Interactions
          </h1>
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 max-w-xl mx-auto font-body leading-relaxed">
            Many Ghanaians use traditional herbal remedies alongside modern medicine. While herbal remedies can be beneficial, some combinations with pharmaceutical drugs can be dangerous. Check your medications and herbs for potential interactions.
          </p>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-[3px] flex">
          <div className="flex-1 bg-ghana-red/50" />
          <div className="flex-1 bg-ghana-gold/50" />
          <div className="flex-1 bg-ghana-green/50" />
        </div>
      </div>

      {/* ── Two-Column Input Section ── */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LEFT: Medications */}
        <div className="rounded-xl dark-glass border border-[#C9A84C]/20 p-5">
          <h2 className="text-[11px] font-body font-semibold text-[#C9A84C]/70 uppercase tracking-[0.15em] mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-[#C9A84C]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
            Your Medications
          </h2>

          <div className="relative">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={medQuery}
                onChange={(e) => {
                  setMedQuery(e.target.value);
                  setMedDropdownOpen(e.target.value.length > 0);
                }}
                onFocus={() => {
                  if (medQuery.length > 0) setMedDropdownOpen(true);
                }}
                onBlur={() => setTimeout(() => setMedDropdownOpen(false), 200)}
                placeholder="Search medications..."
                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-warm-200/60 dark:border-white/10 bg-warm-50 dark:bg-white/[0.03] text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C]/50 transition-all text-sm font-body"
              />
            </div>

            {medDropdownOpen && filteredMeds.length > 0 && (
              <div className="absolute z-30 mt-1 w-full dark-glass border border-white/10 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {filteredMeds.map((med) => (
                  <button
                    key={med.id}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => addMed(med)}
                    className="w-full text-left px-4 py-2.5 hover:bg-[#C9A84C]/5 transition-colors border-b border-white/5 last:border-b-0"
                  >
                    <span className="text-sm font-body font-medium text-gray-900 dark:text-gray-100">
                      {med.name}
                    </span>
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 font-body">
                      {med.class}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected medication chips */}
          <div className="flex flex-wrap gap-2 mt-3 min-h-[2.5rem]">
            {selectedMeds.length === 0 && (
              <span className="text-xs text-gray-400 dark:text-gray-500 font-body italic py-1">
                No medications added yet
              </span>
            )}
            {selectedMeds.map((med) => (
              <span
                key={med.id}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-body font-medium bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/30"
              >
                {med.name}
                <button
                  onClick={() => removeMed(med.id)}
                  className="ml-0.5 w-4 h-4 rounded-full inline-flex items-center justify-center hover:bg-[#C9A84C]/20 transition-colors"
                  aria-label={`Remove ${med.name}`}
                >
                  <CloseIcon className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* RIGHT: Herbal Remedies */}
        <div className="rounded-xl dark-glass border border-emerald-500/20 p-5">
          <h2 className="text-[11px] font-body font-semibold text-emerald-500/70 dark:text-emerald-400/70 uppercase tracking-[0.15em] mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-500 dark:text-emerald-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M5.5 2A3.5 3.5 0 002 5.5v2.879a2.5 2.5 0 00.732 1.767l7.5 7.5a2.5 2.5 0 003.536 0l2.878-2.878a2.5 2.5 0 000-3.536l-7.5-7.5A2.5 2.5 0 007.38 2H5.5zM6 7a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            Your Herbal Remedies
          </h2>

          <div className="relative">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={herbQuery}
                onChange={(e) => {
                  setHerbQuery(e.target.value);
                  setHerbDropdownOpen(e.target.value.length > 0);
                }}
                onFocus={() => {
                  if (herbQuery.length > 0) setHerbDropdownOpen(true);
                }}
                onBlur={() => setTimeout(() => setHerbDropdownOpen(false), 200)}
                placeholder="Search herbs (English or local name)..."
                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-warm-200/60 dark:border-white/10 bg-warm-50 dark:bg-white/[0.03] text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all text-sm font-body"
              />
            </div>

            {herbDropdownOpen && filteredHerbs.length > 0 && (
              <div className="absolute z-30 mt-1 w-full dark-glass border border-white/10 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {filteredHerbs.map((herb) => (
                  <button
                    key={herb.id}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => addHerb(herb)}
                    className="w-full text-left px-4 py-2.5 hover:bg-emerald-500/5 transition-colors border-b border-white/5 last:border-b-0"
                  >
                    <span className="text-sm font-body font-medium text-gray-900 dark:text-gray-100">
                      {herb.name}
                    </span>
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 font-body">
                      ({herb.localName})
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected herb chips */}
          <div className="flex flex-wrap gap-2 mt-3 min-h-[2.5rem]">
            {selectedHerbs.length === 0 && (
              <span className="text-xs text-gray-400 dark:text-gray-500 font-body italic py-1">
                No herbal remedies added yet
              </span>
            )}
            {selectedHerbs.map((herb) => (
              <span
                key={herb.id}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-body font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
              >
                {herb.name}
                <button
                  onClick={() => removeHerb(herb.id)}
                  className="ml-0.5 w-4 h-4 rounded-full inline-flex items-center justify-center hover:bg-emerald-500/20 transition-colors"
                  aria-label={`Remove ${herb.name}`}
                >
                  <CloseIcon className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Check Interactions Button ── */}
      <div className="max-w-4xl mx-auto flex justify-center">
        <button
          onClick={checkInteractions}
          disabled={selectedMeds.length === 0 || selectedHerbs.length === 0 || checking}
          className="px-8 py-3 rounded-xl text-sm font-body font-semibold text-gray-900 bg-[#C9A84C] hover:bg-[#E8D48B] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm shadow-[#C9A84C]/20 flex items-center gap-2"
        >
          {checking ? (
            <>
              <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
              Analyzing Interactions...
            </>
          ) : (
            <>
              <ShieldIcon className="w-5 h-5" />
              Check Interactions
            </>
          )}
        </button>
      </div>

      {/* ── Results Panel ── */}
      {results !== null && (
        <div className="max-w-4xl mx-auto space-y-4">
          <h2 className="text-[11px] font-body font-semibold text-[#C9A84C]/70 uppercase tracking-[0.15em] flex items-center gap-2">
            <WarningIcon className="w-4 h-4 text-[#C9A84C]" />
            Interaction Results
            <span className="ml-auto text-xs font-body font-normal text-gray-500 dark:text-gray-400 normal-case tracking-normal">
              {results.length} interaction{results.length !== 1 ? "s" : ""} found
            </span>
          </h2>

          {results.length === 0 ? (
            <div className="rounded-xl dark-glass border border-emerald-500/20 p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/20 mb-3">
                <svg className="w-6 h-6 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <p className="text-sm font-body font-medium text-emerald-600 dark:text-emerald-400">
                No known interactions found
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 font-body">
                No interactions were detected between your selected medications and herbs. However, always inform your pharmacist about all remedies you are taking.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((inter, idx) => {
                const style = SEVERITY_CONFIG[inter.severity];
                const herbName = getHerbName(inter.herbId);
                const drugName = getDrugName(inter.drugId);

                return (
                  <div
                    key={idx}
                    className={`rounded-xl border p-5 ${style.bg} ${style.border} transition-all`}
                  >
                    {/* Header row */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${style.dot}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center flex-wrap gap-2">
                          <span className="text-sm font-display text-gray-900 dark:text-gray-100">
                            {herbName}
                            <span className="text-gray-400 dark:text-gray-500 mx-1.5">+</span>
                            {drugName}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-body font-bold uppercase tracking-wider ${style.badge}`}>
                            {style.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="pl-5 space-y-2">
                      <p className="text-sm text-gray-700 dark:text-gray-300 font-body leading-relaxed">
                        {inter.description}
                      </p>

                      {/* Recommendation */}
                      <div className="mt-3 rounded-lg bg-warm-50/50 dark:bg-white/[0.02] border border-warm-200/40 dark:border-white/5 p-3">
                        <p className="text-[11px] font-body font-semibold text-[#C9A84C]/70 uppercase tracking-[0.1em] mb-1">
                          Recommendation
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 font-body leading-relaxed">
                          {inter.recommendation}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Common Ghanaian Herbs Reference ── */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-[11px] font-body font-semibold text-[#C9A84C]/70 uppercase tracking-[0.15em] mb-4 flex items-center gap-2">
          <svg className="w-4 h-4 text-[#C9A84C]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
          </svg>
          Common Ghanaian Herbs Reference
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 animate-stagger">
          {HERB_REFERENCE.map((herb, idx) => (
            <div
              key={idx}
              className="rounded-xl dark-glass border border-white/5 p-4 hover:border-[#C9A84C]/20 transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-emerald-500 dark:text-emerald-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path d="M10 2a.75.75 0 01.75.75v.258a33.186 33.186 0 016.668.83.75.75 0 01-.336 1.461 31.695 31.695 0 00-1.37-.266 15.785 15.785 0 01-4.712 7.07.75.75 0 01-1 0 15.785 15.785 0 01-4.712-7.07 31.695 31.695 0 00-1.37.266.75.75 0 11-.336-1.462 33.186 33.186 0 016.668-.829V2.75A.75.75 0 0110 2z" />
                    <path d="M4.636 9.457c-.32.906-.547 1.856-.672 2.843a.75.75 0 001.484.212c.1-.702.28-1.375.534-2.008l-1.346-1.047zM15.364 9.457c.32.906.547 1.856.672 2.843a.75.75 0 01-1.484.212 11.345 11.345 0 00-.534-2.008l1.346-1.047z" />
                    <path d="M10 12a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 12z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-display text-gray-900 dark:text-gray-100 group-hover:text-[#C9A84C] transition-colors">
                    {herb.name}
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 font-body italic">
                    {herb.localName}
                  </p>
                </div>
              </div>

              <div className="mt-3 space-y-2">
                <div>
                  <p className="text-[10px] font-body font-semibold text-emerald-500/60 dark:text-emerald-400/60 uppercase tracking-wider mb-0.5">
                    Common Uses
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-body leading-relaxed">
                    {herb.uses}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-body font-semibold text-red-400/60 uppercase tracking-wider mb-0.5">
                    Interaction Warnings
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-body leading-relaxed">
                    {herb.warnings}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Disclaimer ── */}
      <div className="max-w-4xl mx-auto">
        <div className="rounded-xl bg-[#C9A84C]/5 dark:bg-[#C9A84C]/[0.03] border border-[#C9A84C]/20 p-4 flex items-start gap-3">
          <WarningIcon className="w-5 h-5 text-[#C9A84C] shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-display text-[#C9A84C]">
              Important Disclaimer
            </p>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-body">
              This tool supplements but does not replace professional pharmacist consultation. Interaction data is based on available research and traditional knowledge, but may not cover all possible interactions. Always inform your pharmacist or healthcare provider about all medications, herbs, and supplements you are taking. If you experience any adverse effects, seek medical attention immediately.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
