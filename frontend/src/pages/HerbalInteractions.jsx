import { useEffect, useMemo, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "";

/**
 * Herbal–Drug Interaction Checker.
 *
 * Fully data-driven: herbs come from /api/herbs/all and medicines from
 * /api/drugs/all. Interaction flags are derived from each herb's
 * `herb_drug_interactions` text (matched against the selected medicine's
 * generic name / drug class) — NOT from a hardcoded, uncited table.
 *
 * Every herb shows its `evidence_level`, and the page carries a prominent
 * "not clinically verified — confirm with a pharmacist" disclaimer, because
 * the herbs data is AI-drafted and pending expert review.
 */

const EVIDENCE_STYLES = {
  "well established": "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-500/30",
  "moderate evidence": "bg-teal-500/10 text-teal-600 dark:text-teal-400 ring-teal-500/30",
  "limited clinical evidence": "bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-amber-500/30",
  "traditional use only": "bg-rose-500/10 text-rose-600 dark:text-rose-400 ring-rose-500/30",
};

const SEVERE_HINTS = ["serious", "avoid", "do not", "danger", "fatal", "bleeding", "serotonin", "toxic", "reduce"];

function evidenceBadge(level) {
  const key = (level || "").toLowerCase();
  const cls = EVIDENCE_STYLES[key] || "bg-gray-500/10 text-gray-500 ring-gray-500/30";
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ${cls}`}>
      {level || "unknown evidence"}
    </span>
  );
}

/** Tokenise a drug class into meaningful words for loose matching. */
function classTokens(drugClass) {
  return (drugClass || "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= 4);
}

export default function HerbalInteractions() {
  const [herbs, setHerbs] = useState([]);
  const [meds, setMeds] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);

  const [medQuery, setMedQuery] = useState("");
  const [herbQuery, setHerbQuery] = useState("");
  const [selectedMeds, setSelectedMeds] = useState([]);
  const [selectedHerbs, setSelectedHerbs] = useState([]);
  const [results, setResults] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [hRes, dRes] = await Promise.all([
          fetch(`${API_URL}/api/herbs/all`),
          fetch(`${API_URL}/api/drugs/all`),
        ]);
        const hData = await hRes.json();
        const dData = await dRes.json();
        if (!active) return;
        if (!hRes.ok) throw new Error(hData.error || "Failed to load herbs");
        setHerbs(hData.herbs || []);
        setMeds(dData.drugs || []);
      } catch (err) {
        if (active) setLoadError(err.message || "Failed to load data.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const filteredMeds = useMemo(() => {
    const q = medQuery.trim().toLowerCase();
    if (!q) return [];
    return meds
      .filter(
        (m) =>
          (m.generic_name?.toLowerCase().includes(q) ||
            m.brand_names?.toLowerCase().includes(q)) &&
          !selectedMeds.some((s) => s.id === m.id)
      )
      .slice(0, 8);
  }, [medQuery, meds, selectedMeds]);

  const filteredHerbs = useMemo(() => {
    const q = herbQuery.trim().toLowerCase();
    if (!q) return [];
    return herbs
      .filter(
        (h) =>
          (h.common_name?.toLowerCase().includes(q) ||
            h.local_names?.toLowerCase().includes(q)) &&
          !selectedHerbs.some((s) => s.id === h.id)
      )
      .slice(0, 8);
  }, [herbQuery, herbs, selectedHerbs]);

  const checkInteractions = () => {
    if (selectedMeds.length === 0 || selectedHerbs.length === 0) return;
    const found = [];
    for (const herb of selectedHerbs) {
      const text = (herb.herb_drug_interactions || "").toLowerCase();
      for (const med of selectedMeds) {
        const name = (med.generic_name || "").toLowerCase();
        const tokens = classTokens(med.drug_class);
        const nameHit = name && text.includes(name);
        const classHit = tokens.some((tok) => text.includes(tok));
        if (nameHit || classHit) {
          const severe = SEVERE_HINTS.some((k) => text.includes(k));
          found.push({
            herb: herb.common_name,
            med: med.generic_name,
            severity: severe ? "high concern" : "possible",
            detail: herb.herb_drug_interactions,
            evidence: herb.evidence_level,
          });
        }
      }
    }
    setResults({ found, checkedHerbs: [...selectedHerbs] });
  };

  const addMed = (m) => { setSelectedMeds((p) => [...p, m]); setMedQuery(""); setResults(null); };
  const addHerb = (h) => { setSelectedHerbs((p) => [...p, h]); setHerbQuery(""); setResults(null); };
  const removeMed = (id) => { setSelectedMeds((p) => p.filter((m) => m.id !== id)); setResults(null); };
  const removeHerb = (id) => { setSelectedHerbs((p) => p.filter((h) => h.id !== id)); setResults(null); };

  return (
    <div className="space-y-8 pb-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl dark-glass p-8 sm:p-10 text-center">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent" />
        <div className="relative">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#C9A84C]/10 ring-1 ring-[#C9A84C]/20 mb-4">
            <svg className="w-9 h-9 text-[#C9A84C]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 3c-4 4-6 7-6 10a6 6 0 0012 0c0-3-2-6-6-10z" />
              <path d="M12 21V11" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display gold-text">Herbal–Drug Interactions</h1>
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 max-w-xl mx-auto font-body leading-relaxed">
            Many people use traditional herbal remedies alongside modern medicine.
            Some combinations are risky. Add your medicines and herbs to check for
            possible interactions.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[3px] flex">
          <div className="flex-1 bg-ghana-red/50" />
          <div className="flex-1 bg-ghana-gold/50" />
          <div className="flex-1 bg-ghana-green/50" />
        </div>
      </div>

      {/* Data-quality disclaimer */}
      <div role="note" className="max-w-4xl mx-auto rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-200 font-body">
        <p className="font-semibold">⚠️ Not a substitute for professional advice</p>
        <p className="mt-1">
          This herbal information is compiled from published literature and is
          <span className="font-semibold"> not yet verified by a pharmacist</span>.
          Herbal ≠ safe. Always tell your pharmacist or doctor about every herb you
          take, especially in pregnancy or with chronic conditions.
        </p>
      </div>

      {loadError && (
        <div className="max-w-4xl mx-auto px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300">
          {loadError}
        </div>
      )}

      {/* Inputs */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Medications */}
        <div className="rounded-xl dark-glass border border-[#C9A84C]/20 p-5">
          <h2 className="text-[11px] font-body font-semibold text-[#C9A84C]/70 uppercase tracking-[0.15em] mb-3">Your Medicines</h2>
          <input
            type="text"
            value={medQuery}
            onChange={(e) => setMedQuery(e.target.value)}
            placeholder={loading ? "Loading medicines…" : "Search a medicine…"}
            disabled={loading}
            className="w-full rounded-lg bg-warm-50 dark:bg-gray-900/60 border border-warm-200 dark:border-gray-700 px-3 py-2.5 text-sm font-body focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40"
          />
          {filteredMeds.length > 0 && (
            <div className="mt-2 rounded-lg border border-warm-200 dark:border-gray-700 divide-y divide-warm-200 dark:divide-gray-800 overflow-hidden">
              {filteredMeds.map((m) => (
                <button key={m.id} type="button" onClick={() => addMed(m)} className="w-full text-left px-3 py-2 text-sm font-body hover:bg-[#C9A84C]/10 transition-colors">
                  <span className="font-medium">{m.generic_name}</span>
                  {m.drug_class && <span className="text-xs text-gray-500 dark:text-gray-400"> · {m.drug_class}</span>}
                </button>
              ))}
            </div>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            {selectedMeds.map((m) => (
              <span key={m.id} className="inline-flex items-center gap-1.5 rounded-full bg-[#C9A84C]/10 ring-1 ring-[#C9A84C]/30 px-2.5 py-1 text-xs font-body">
                {m.generic_name}
                <button type="button" onClick={() => removeMed(m.id)} aria-label={`Remove ${m.generic_name}`} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">×</button>
              </span>
            ))}
          </div>
        </div>

        {/* Herbs */}
        <div className="rounded-xl dark-glass border border-[#C9A84C]/20 p-5">
          <h2 className="text-[11px] font-body font-semibold text-[#C9A84C]/70 uppercase tracking-[0.15em] mb-3">Your Herbs</h2>
          <input
            type="text"
            value={herbQuery}
            onChange={(e) => setHerbQuery(e.target.value)}
            placeholder={loading ? "Loading herbs…" : "Search a herb (e.g. sobolo, moringa)…"}
            disabled={loading}
            className="w-full rounded-lg bg-warm-50 dark:bg-gray-900/60 border border-warm-200 dark:border-gray-700 px-3 py-2.5 text-sm font-body focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40"
          />
          {filteredHerbs.length > 0 && (
            <div className="mt-2 rounded-lg border border-warm-200 dark:border-gray-700 divide-y divide-warm-200 dark:divide-gray-800 overflow-hidden">
              {filteredHerbs.map((h) => (
                <button key={h.id} type="button" onClick={() => addHerb(h)} className="w-full text-left px-3 py-2 text-sm font-body hover:bg-[#C9A84C]/10 transition-colors">
                  <span className="font-medium">{h.common_name}</span>
                  {h.local_names && <span className="text-xs text-gray-500 dark:text-gray-400"> · {h.local_names}</span>}
                </button>
              ))}
            </div>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            {selectedHerbs.map((h) => (
              <span key={h.id} className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/30 px-2.5 py-1 text-xs font-body">
                {h.common_name}
                <button type="button" onClick={() => removeHerb(h.id)} aria-label={`Remove ${h.common_name}`} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">×</button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Check button */}
      <div className="max-w-4xl mx-auto">
        <button
          type="button"
          onClick={checkInteractions}
          disabled={selectedMeds.length === 0 || selectedHerbs.length === 0}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[#C9A84C] to-[#A8893A] text-white font-body font-semibold text-sm shadow-lg shadow-[#C9A84C]/20 hover:shadow-[#C9A84C]/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Check Interactions
        </button>
      </div>

      {/* Results */}
      {results && (
        <div className="max-w-4xl mx-auto space-y-4">
          {results.found.length === 0 ? (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-sm font-body text-emerald-800 dark:text-emerald-200">
              <p className="font-semibold">No specific interaction found in our data.</p>
              <p className="mt-1">
                This does not guarantee the combination is safe — our herbal data is
                limited and unverified. Still confirm with your pharmacist.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.found.map((r, i) => (
                <div key={i} className={`rounded-xl p-5 border ${r.severity === "high concern" ? "border-rose-500/40 bg-rose-500/10" : "border-amber-500/30 bg-amber-500/10"}`}>
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <h3 className="text-sm font-display font-semibold text-gray-900 dark:text-gray-100">
                      {r.herb} + {r.med}
                    </h3>
                    <span className={`text-[10px] font-semibold uppercase tracking-wide rounded-full px-2 py-0.5 ring-1 ${r.severity === "high concern" ? "text-rose-600 dark:text-rose-400 ring-rose-500/40" : "text-amber-600 dark:text-amber-400 ring-amber-500/40"}`}>
                      {r.severity}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-body leading-relaxed">{r.detail}</p>
                  <div className="mt-2">{evidenceBadge(r.evidence)}</div>
                </div>
              ))}
            </div>
          )}

          {/* Full safety profile of every selected herb, regardless of a matched pair */}
          <div className="rounded-xl dark-glass p-5">
            <h3 className="text-sm font-display gold-text mb-3">Safety profile of your herbs</h3>
            <div className="space-y-3">
              {results.checkedHerbs.map((h) => (
                <div key={h.id} className="rounded-lg border border-warm-200 dark:border-gray-700/60 p-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold">{h.common_name}</span>
                    {evidenceBadge(h.evidence_level)}
                  </div>
                  {h.herb_drug_interactions && <p className="mt-1.5 text-xs text-gray-600 dark:text-gray-400"><span className="font-semibold">Interactions:</span> {h.herb_drug_interactions}</p>}
                  {h.safety_concerns && <p className="mt-1 text-xs text-gray-600 dark:text-gray-400"><span className="font-semibold">Safety:</span> {h.safety_concerns}</p>}
                  {h.pregnancy_caution && <p className="mt-1 text-xs text-gray-600 dark:text-gray-400"><span className="font-semibold">Pregnancy:</span> {h.pregnancy_caution}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Herb reference catalogue (from the database) */}
      <div className="max-w-4xl mx-auto rounded-2xl dark-glass p-6 sm:p-8">
        <h2 className="text-lg font-display gold-text mb-1">Herbal Reference</h2>
        <p className="text-xs text-gray-500 dark:text-gray-500 font-body mb-5">
          Common Ghanaian &amp; West African herbs. Evidence level shows how well
          each use is actually supported — traditional use is not proof of effect.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {herbs.map((h) => (
            <div key={h.id} className="rounded-lg border border-warm-200 dark:border-gray-800 bg-warm-50 dark:bg-gray-900/60 p-3.5">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-sm font-display font-bold text-[#C9A84C]">{h.common_name}</span>
                {evidenceBadge(h.evidence_level)}
              </div>
              {h.local_names && <p className="text-[11px] text-gray-500 dark:text-gray-400 italic">{h.local_names}{h.scientific_name ? ` · ${h.scientific_name}` : ""}</p>}
              {h.traditional_uses && <p className="mt-1.5 text-xs text-gray-600 dark:text-gray-400"><span className="font-semibold">Traditional use:</span> {h.traditional_uses}</p>}
              {h.herb_drug_interactions && <p className="mt-1 text-xs text-gray-600 dark:text-gray-400"><span className="font-semibold">Interactions:</span> {h.herb_drug_interactions}</p>}
            </div>
          ))}
          {herbs.length === 0 && !loading && (
            <p className="text-sm text-gray-500 dark:text-gray-400 font-body">No herbs loaded.</p>
          )}
        </div>
      </div>
    </div>
  );
}
