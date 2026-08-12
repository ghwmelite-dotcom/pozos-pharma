import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import {
  countQueuedInterventions,
  getQueuedInterventions,
  queueIntervention,
  removeQueuedIntervention,
} from "../utils/practiceOffline";

const API_URL = import.meta.env.VITE_API_URL || "";

const CONDITION_OPTIONS = [
  ["cardiovascular", "Cardiovascular"],
  ["diabetes", "Diabetes"],
  ["infectious_disease", "Infectious disease"],
  ["malaria", "Malaria"],
  ["maternal_health", "Maternal health"],
  ["mental_health", "Mental health"],
  ["pain_management", "Pain management"],
  ["respiratory", "Respiratory"],
  ["other", "Other"],
];

const ISSUE_OPTIONS = [
  ["contraindication", "Contraindication"],
  ["dose_adjustment", "Dose adjustment"],
  ["duplicate_therapy", "Duplicate therapy"],
  ["interaction", "Drug interaction"],
  ["non_adherence", "Non-adherence"],
  ["prescribing_error", "Prescribing error"],
  ["other", "Other"],
];

const SEVERITY_OPTIONS = [
  ["low", "Low"],
  ["moderate", "Moderate"],
  ["high", "High"],
  ["critical", "Critical"],
];

const OUTCOME_OPTIONS = [
  ["accepted", "Recommendation accepted"],
  ["partially_accepted", "Partially accepted"],
  ["referred", "Patient referred"],
  ["resolved", "Resolved"],
  ["pending", "Pending follow-up"],
];

function localDateTime() {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

const EMPTY_FORM = {
  conditionCategory: "malaria",
  drugNames: "",
  issueType: "interaction",
  severity: "moderate",
  actionTaken: "",
  outcome: "accepted",
  reportable: false,
  notes: "",
  occurredAt: localDateTime(),
};

function Icon({ name, className = "w-5 h-5" }) {
  const paths = {
    shield: "M9 12.75L11.25 15 15 9.75M12 2.25c-2.172 1.95-5.344 3-8.25 3v5.25c0 5.535 3.84 10.74 8.25 12 4.41-1.26 8.25-6.465 8.25-12V5.25c-2.906 0-6.078-1.05-8.25-3z",
    document: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5V5.625a3.375 3.375 0 00-3.375-3.375H8.25m0 11.625h4.5m-4.5 3h4.5m2.25 3H6.375A1.875 1.875 0 014.5 18.75V5.625c0-1.036.84-1.875 1.875-1.875h4.007c.498 0 .974.198 1.326.55l4.442 4.442c.352.351.55.828.55 1.326v8.682A1.875 1.875 0 0114.825 20.625z",
    chart: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zm6.75-4.5c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zm6.75-4.5C16.5 3.504 17.004 3 17.625 3h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z",
    download: "M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-4.5-6L12 15m0 0l-4.5-4.5M12 15V3",
    cloud: "M9.75 17L9 20l-.75-3m1.5 0h-1.5m1.5 0H12m-3.75 0H6a4.5 4.5 0 01-.75-8.937 6.002 6.002 0 0111.498-1.5A3.75 3.75 0 0118 17.812",
    plus: "M12 4.5v15m7.5-7.5h-15",
    arrow: "M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3",
    check: "M4.5 12.75l6 6 9-13.5",
  };

  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={paths[name]} />
    </svg>
  );
}

function formatLabel(value) {
  return String(value || "").replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function SeverityBadge({ severity }) {
  const styles = {
    low: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20",
    moderate: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
    high: "bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/20",
    critical: "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20",
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[severity] || styles.low}`}>
      {formatLabel(severity)}
    </span>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-warm-300 dark:border-gray-700 px-5 py-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#C9A84C]/10 text-[#C9A84C]">
        <Icon name="document" className="h-6 w-6" />
      </div>
      <h3 className="mt-4 font-display text-lg text-warm-900 dark:text-white">No interventions recorded yet</h3>
      <p className="mx-auto mt-1 max-w-md text-sm text-warm-500 dark:text-gray-400">
        Record the first de-identified clinical intervention to begin building your practice evidence trail.
      </p>
    </div>
  );
}

export default function PracticeHub() {
  const { token, isAuthenticated, isPharmacist } = useAuth();
  const [activeView, setActiveView] = useState("overview");
  const [overview, setOverview] = useState(null);
  const [interventions, setInterventions] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const authHeaders = useMemo(() => ({
    Authorization: `Bearer ${token}`,
  }), [token]);

  const loadDashboard = useCallback(async () => {
    if (!token || !isPharmacist) {
      setLoading(false);
      return;
    }

    setError("");
    try {
      const [overviewResponse, interventionsResponse] = await Promise.all([
        fetch(`${API_URL}/api/practice/overview`, { headers: authHeaders }),
        fetch(`${API_URL}/api/practice/interventions?limit=25`, { headers: authHeaders }),
      ]);

      if (!overviewResponse.ok || !interventionsResponse.ok) {
        const failedResponse = !overviewResponse.ok ? overviewResponse : interventionsResponse;
        const payload = await failedResponse.json().catch(() => ({}));
        throw new Error(payload.error || "Unable to load the practice workspace");
      }

      const [overviewData, interventionsData] = await Promise.all([
        overviewResponse.json(),
        interventionsResponse.json(),
      ]);
      setOverview(overviewData);
      setInterventions(interventionsData.interventions || []);
    } catch (loadError) {
      setError(loadError.message || "Unable to load the practice workspace");
    } finally {
      setLoading(false);
    }
  }, [authHeaders, isPharmacist, token]);

  const refreshPendingCount = useCallback(async () => {
    if (!("indexedDB" in window)) return;
    try {
      setPendingCount(await countQueuedInterventions());
    } catch {
      setPendingCount(0);
    }
  }, []);

  const syncOfflineQueue = useCallback(async () => {
    if (!token || !navigator.onLine || !("indexedDB" in window)) return;

    const queued = await getQueuedInterventions().catch(() => []);
    let synced = 0;

    for (const item of queued.sort((a, b) => a.queuedAt - b.queuedAt)) {
      try {
        const response = await fetch(`${API_URL}/api/practice/interventions`, {
          method: "POST",
          headers: { ...authHeaders, "Content-Type": "application/json" },
          body: JSON.stringify(item),
        });
        if (!response.ok) break;
        await removeQueuedIntervention(item.clientRequestId);
        synced += 1;
      } catch {
        break;
      }
    }

    await refreshPendingCount();
    if (synced > 0) {
      setNotice(`${synced} offline intervention${synced === 1 ? "" : "s"} synced securely.`);
      await loadDashboard();
    }
  }, [authHeaders, loadDashboard, refreshPendingCount, token]);

  useEffect(() => {
    loadDashboard();
    refreshPendingCount();
  }, [loadDashboard, refreshPendingCount]);

  useEffect(() => {
    const handleOnline = () => syncOfflineQueue();
    window.addEventListener("online", handleOnline);
    syncOfflineQueue();
    return () => window.removeEventListener("online", handleOnline);
  }, [syncOfflineQueue]);

  const updateForm = (field) => (event) => {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setNotice("");

    const payload = {
      ...form,
      occurredAt: new Date(form.occurredAt).toISOString(),
      clientRequestId: crypto.randomUUID(),
    };

    try {
      if (!navigator.onLine) throw new TypeError("Offline");

      const response = await fetch(`${API_URL}/api/practice/interventions`, {
        method: "POST",
        headers: { ...authHeaders, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Unable to save intervention");

      setNotice(`Intervention ${result.intervention.reference_code} recorded.`);
      setForm({ ...EMPTY_FORM, occurredAt: localDateTime() });
      setActiveView("overview");
      await loadDashboard();
    } catch (submitError) {
      if (submitError instanceof TypeError && "indexedDB" in window) {
        await queueIntervention(payload);
        await refreshPendingCount();
        setNotice("Connection unavailable. The de-identified record is queued on this device and will sync when online.");
        setForm({ ...EMPTY_FORM, occurredAt: localDateTime() });
        setActiveView("overview");
      } else {
        setError(submitError.message || "Unable to save intervention");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}/api/practice/interventions/export.csv`, { headers: authHeaders });
      if (!response.ok) throw new Error("Unable to export intervention log");
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = downloadUrl;
      anchor.download = `pharmacy-interventions-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(downloadUrl);
    } catch (exportError) {
      setError(exportError.message || "Unable to export intervention log");
    } finally {
      setExporting(false);
    }
  };

  if (!isAuthenticated || !isPharmacist) {
    return (
      <section className="mx-auto max-w-xl py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#C9A84C]/10 text-[#C9A84C] ring-1 ring-[#C9A84C]/20">
          <Icon name="shield" className="h-7 w-7" />
        </div>
        <h1 className="mt-5 font-display text-2xl text-warm-900 dark:text-white">Verified pharmacist access</h1>
        <p className="mt-2 text-sm leading-6 text-warm-500 dark:text-gray-400">
          The Practice Hub contains professional clinical documentation tools and is available to verified pharmacists.
        </p>
        <Link to="/pharmacist-portal" className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-[#C9A84C] px-5 py-3 text-sm font-semibold text-gray-950 transition-colors hover:bg-[#E8D48B]">
          Open pharmacist portal
        </Link>
      </section>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-transparent border-t-[#C9A84C]" aria-label="Loading practice workspace" />
      </div>
    );
  }

  const summary = overview?.summary || {};
  const metrics = [
    ["document", "Interventions", summary.total_interventions || 0, "Documented in the last 30 days"],
    ["shield", "High-priority safety", summary.safety_critical || 0, "High or critical interventions"],
    ["chart", "Accepted or resolved", `${summary.acceptance_rate || 0}%`, `${summary.accepted_or_resolved || 0} recorded outcomes`],
    ["check", "Reportable flags", summary.reportable || 0, "Marked for professional review"],
  ];

  return (
    <div className="space-y-6 pb-12">
      <section className="relative overflow-hidden rounded-3xl bg-[#0D0B12] px-5 py-7 text-white shadow-2xl shadow-black/20 sm:px-8 sm:py-9">
        <div className="absolute inset-0 kente-weave opacity-40" />
        <div className="absolute inset-x-0 top-0 flex h-1">
          <span className="flex-1 bg-ghana-red" />
          <span className="flex-1 bg-ghana-gold" />
          <span className="flex-1 bg-ghana-green" />
        </div>
        <div className="relative grid gap-7 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#C9A84C]/25 bg-[#C9A84C]/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-[#E8D48B]">
              <Icon name="shield" className="h-4 w-4" />
              PSGH-aligned practice workspace
            </div>
            <h1 className="mt-4 max-w-3xl font-display text-3xl leading-tight text-white sm:text-4xl">
              Clinical evidence for better pharmacy practice.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-300 sm:text-base">
              Document de-identified interventions, monitor safety outcomes, and export a professional evidence trail from one low-bandwidth workspace.
            </p>
            <p className="mt-3 text-xs text-gray-500">
              Alignment workspace only. This is not an official PSGH, NHIA, FDA, or Pharmacy Council submission portal.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setActiveView("log")}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#C9A84C] px-4 py-3 text-sm font-semibold text-gray-950 transition hover:bg-[#E8D48B] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E8D48B]"
            >
              <Icon name="plus" className="h-4 w-4" />
              Record intervention
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={exporting}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-50"
            >
              <Icon name="download" className="h-4 w-4" />
              {exporting ? "Preparing..." : "Export CSV"}
            </button>
          </div>
        </div>
      </section>

      {(notice || error || pendingCount > 0) && (
        <div className="space-y-3" aria-live="polite">
          {notice && <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-300">{notice}</div>}
          {error && <div role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-800 dark:text-red-300">{error}</div>}
          {pendingCount > 0 && (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
              <span className="flex items-center gap-2"><Icon name="cloud" className="h-4 w-4" /> {pendingCount} intervention{pendingCount === 1 ? "" : "s"} waiting to sync</span>
              <button type="button" onClick={syncOfflineQueue} className="min-h-11 rounded-lg px-3 font-semibold hover:bg-amber-500/10">Sync now</button>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto border-b border-warm-300/60 pb-px dark:border-gray-800" role="tablist" aria-label="Practice Hub views">
        {[["overview", "Overview"], ["log", "New intervention"], ["records", "Records"]].map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={activeView === value}
            onClick={() => setActiveView(value)}
            className={`min-h-11 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${activeView === value ? "border-[#C9A84C] text-[#9A772D] dark:text-[#E8D48B]" : "border-transparent text-warm-500 hover:text-warm-900 dark:text-gray-400 dark:hover:text-white"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeView === "overview" && (
        <div className="space-y-6">
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Thirty-day impact metrics">
            {metrics.map(([icon, label, value, detail]) => (
              <article key={label} className="rounded-2xl border border-warm-300/50 bg-warm-50 p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-warm-500 dark:text-gray-400">{label}</p>
                    <p className="mt-2 font-display text-3xl text-warm-900 dark:text-white">{value}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#C9A84C]/10 text-[#A8893A] dark:text-[#E8D48B]"><Icon name={icon} /></div>
                </div>
                <p className="mt-3 text-xs leading-5 text-warm-500 dark:text-gray-400">{detail}</p>
              </article>
            ))}
          </section>

          <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-2xl border border-warm-300/50 bg-warm-50 p-5 dark:border-gray-800 dark:bg-gray-900 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#A8893A] dark:text-[#E8D48B]">PSGH impact metrics</p>
                  <h2 className="mt-1 font-display text-xl text-warm-900 dark:text-white">De-identified condition trends</h2>
                </div>
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">30 days</span>
              </div>
              <div className="mt-5 space-y-4">
                {(overview?.condition_trends || []).length === 0 ? (
                  <p className="rounded-xl bg-warm-100 px-4 py-5 text-sm text-warm-500 dark:bg-gray-950 dark:text-gray-400">Trend data appears after interventions are recorded.</p>
                ) : overview.condition_trends.map((item) => {
                  const max = Math.max(...overview.condition_trends.map((trend) => Number(trend.count)), 1);
                  const width = Math.max((Number(item.count) / max) * 100, 8);
                  return (
                    <div key={item.category}>
                      <div className="mb-1.5 flex items-center justify-between text-sm"><span className="font-medium text-warm-700 dark:text-gray-200">{formatLabel(item.category)}</span><span className="text-warm-500 dark:text-gray-400">{item.count}</span></div>
                      <div className="h-2 overflow-hidden rounded-full bg-warm-200 dark:bg-gray-800"><div className="h-full rounded-full bg-gradient-to-r from-ghana-green to-[#C9A84C]" style={{ width: `${width}%` }} /></div>
                    </div>
                  );
                })}
              </div>
              <p className="mt-5 text-xs leading-5 text-warm-500 dark:text-gray-400">Categories only. Patient names, contact details, addresses, and NHIS identifiers are not collected.</p>
            </div>

            <div className="rounded-2xl border border-warm-300/50 bg-warm-50 p-5 dark:border-gray-800 dark:bg-gray-900 sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#A8893A] dark:text-[#E8D48B]">Practice shortcuts</p>
              <h2 className="mt-1 font-display text-xl text-warm-900 dark:text-white">Clinical safety</h2>
              <div className="mt-4 space-y-2">
                {[
                  ["/interactions", "Interaction checker", "Review known medicine interactions"],
                  ["/prescription-scanner", "Prescription scanner", "Extract a prescription for pharmacist review"],
                  ["/nhis", "NHIS coverage", "Check medicine coverage information"],
                  ["/shortage-radar", "Shortage radar", "Monitor medicine availability signals"],
                ].map(([to, title, detail]) => (
                  <Link key={to} to={to} className="group flex min-h-14 items-center justify-between gap-4 rounded-xl border border-transparent px-3 py-3 transition hover:border-[#C9A84C]/20 hover:bg-[#C9A84C]/5">
                    <span><span className="block text-sm font-semibold text-warm-800 group-hover:text-[#9A772D] dark:text-gray-100 dark:group-hover:text-[#E8D48B]">{title}</span><span className="mt-0.5 block text-xs text-warm-500 dark:text-gray-400">{detail}</span></span>
                    <Icon name="arrow" className="h-4 w-4 shrink-0 text-warm-400 transition-transform group-hover:translate-x-1 group-hover:text-[#C9A84C]" />
                  </Link>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-warm-300/50 bg-warm-50 p-5 dark:border-gray-800 dark:bg-gray-900 sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div><p className="text-xs font-semibold uppercase tracking-wider text-[#A8893A] dark:text-[#E8D48B]">Recent activity</p><h2 className="mt-1 font-display text-xl text-warm-900 dark:text-white">Latest interventions</h2></div>
              <button type="button" onClick={() => setActiveView("records")} className="min-h-11 rounded-lg px-3 text-sm font-semibold text-[#9A772D] hover:bg-[#C9A84C]/10 dark:text-[#E8D48B]">View all records</button>
            </div>
            <div className="mt-5">{interventions.length === 0 ? <EmptyState /> : <InterventionList interventions={interventions.slice(0, 6)} />}</div>
          </section>
        </div>
      )}

      {activeView === "log" && (
        <section className="mx-auto max-w-3xl rounded-2xl border border-warm-300/50 bg-warm-50 p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-7">
          <div className="border-b border-warm-200 pb-5 dark:border-gray-800">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#A8893A] dark:text-[#E8D48B]">Clinical documentation</p>
            <h2 className="mt-1 font-display text-2xl text-warm-900 dark:text-white">Record an intervention</h2>
            <p className="mt-2 text-sm leading-6 text-warm-500 dark:text-gray-400">Do not enter a patient name, phone number, address, NHIS number, or any other direct identifier.</p>
          </div>
          <form onSubmit={handleSubmit} className="mt-6 grid gap-5 sm:grid-cols-2">
            <Field label="Condition category" htmlFor="condition"><select id="condition" required value={form.conditionCategory} onChange={updateForm("conditionCategory")} className="admin-select min-h-11 w-full">{CONDITION_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field>
            <Field label="Issue type" htmlFor="issue"><select id="issue" required value={form.issueType} onChange={updateForm("issueType")} className="admin-select min-h-11 w-full">{ISSUE_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field>
            <Field label="Medicine name(s)" htmlFor="medicines" className="sm:col-span-2"><input id="medicines" required maxLength={300} value={form.drugNames} onChange={updateForm("drugNames")} placeholder="e.g. Warfarin, ibuprofen" className="admin-input min-h-11 w-full" /></Field>
            <Field label="Severity" htmlFor="severity"><select id="severity" required value={form.severity} onChange={updateForm("severity")} className="admin-select min-h-11 w-full">{SEVERITY_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field>
            <Field label="Outcome" htmlFor="outcome"><select id="outcome" required value={form.outcome} onChange={updateForm("outcome")} className="admin-select min-h-11 w-full">{OUTCOME_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field>
            <Field label="Occurred at" htmlFor="occurred"><input id="occurred" type="datetime-local" required value={form.occurredAt} max={localDateTime()} onChange={updateForm("occurredAt")} className="admin-input min-h-11 w-full" /></Field>
            <Field label="Professional review flag" htmlFor="reportable"><label htmlFor="reportable" className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-warm-300/60 px-3 text-sm text-warm-700 dark:border-gray-700 dark:text-gray-200"><input id="reportable" type="checkbox" checked={form.reportable} onChange={updateForm("reportable")} className="h-4 w-4 accent-[#C9A84C]" /> Mark for PSGH/FDA/NHIA review assessment</label></Field>
            <Field label="Action taken" htmlFor="action" className="sm:col-span-2"><textarea id="action" required maxLength={1000} rows={4} value={form.actionTaken} onChange={updateForm("actionTaken")} placeholder="Describe the recommendation, counseling, dose adjustment, referral, or prescriber contact." className="admin-input w-full resize-y" /></Field>
            <Field label="Optional de-identified notes" htmlFor="notes" className="sm:col-span-2"><textarea id="notes" maxLength={1500} rows={3} value={form.notes} onChange={updateForm("notes")} placeholder="No names, phone numbers, addresses, or membership identifiers." className="admin-input w-full resize-y" /></Field>
            <div className="flex flex-col-reverse gap-3 border-t border-warm-200 pt-5 dark:border-gray-800 sm:col-span-2 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setActiveView("overview")} className="min-h-11 rounded-xl border border-warm-300 px-5 py-3 text-sm font-semibold text-warm-700 hover:bg-warm-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800">Cancel</button>
              <button type="submit" disabled={submitting} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#C9A84C] px-5 py-3 text-sm font-semibold text-gray-950 transition hover:bg-[#E8D48B] disabled:cursor-not-allowed disabled:opacity-50"><Icon name="document" className="h-4 w-4" />{submitting ? "Saving..." : "Save intervention"}</button>
            </div>
          </form>
        </section>
      )}

      {activeView === "records" && (
        <section className="rounded-2xl border border-warm-300/50 bg-warm-50 p-5 dark:border-gray-800 dark:bg-gray-900 sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-wider text-[#A8893A] dark:text-[#E8D48B]">Audit trail</p><h2 className="mt-1 font-display text-2xl text-warm-900 dark:text-white">Intervention records</h2></div><button type="button" onClick={handleExport} disabled={exporting} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#C9A84C]/30 px-4 py-3 text-sm font-semibold text-[#9A772D] hover:bg-[#C9A84C]/10 disabled:opacity-50 dark:text-[#E8D48B]"><Icon name="download" className="h-4 w-4" />Export CSV</button></div>
          <div className="mt-6">{interventions.length === 0 ? <EmptyState /> : <InterventionList interventions={interventions} showNotes />}</div>
        </section>
      )}
    </div>
  );
}

function Field({ label, htmlFor, className = "", children }) {
  return <div className={className}><label htmlFor={htmlFor} className="mb-1.5 block text-sm font-semibold text-warm-700 dark:text-gray-200">{label}</label>{children}</div>;
}

function InterventionList({ interventions, showNotes = false }) {
  return (
    <div className="divide-y divide-warm-200 dark:divide-gray-800">
      {interventions.map((item) => (
        <article key={item.id} className="grid gap-3 py-4 first:pt-0 last:pb-0 md:grid-cols-[1fr_auto] md:items-start">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2"><span className="font-mono text-xs font-semibold text-[#9A772D] dark:text-[#E8D48B]">{item.reference_code}</span><SeverityBadge severity={item.severity} />{Boolean(item.reportable) && <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-2.5 py-1 text-xs font-semibold text-violet-700 dark:text-violet-300">Review flagged</span>}</div>
            <h3 className="mt-2 text-sm font-semibold text-warm-900 dark:text-white">{item.drug_names}</h3>
            <p className="mt-1 text-sm text-warm-500 dark:text-gray-400">{formatLabel(item.issue_type)} · {formatLabel(item.condition_category)} · {formatLabel(item.outcome)}</p>
            <p className="mt-2 text-sm leading-6 text-warm-700 dark:text-gray-300">{item.action_taken}</p>
            {showNotes && item.notes && <p className="mt-2 rounded-lg bg-warm-100 px-3 py-2 text-xs leading-5 text-warm-500 dark:bg-gray-950 dark:text-gray-400">{item.notes}</p>}
          </div>
          <time className="whitespace-nowrap text-xs text-warm-400 dark:text-gray-500" dateTime={new Date(item.occurred_at * 1000).toISOString()}>{new Intl.DateTimeFormat("en-GH", { dateStyle: "medium", timeStyle: "short" }).format(item.occurred_at * 1000)}</time>
        </article>
      ))}
    </div>
  );
}
