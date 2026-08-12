import { useState, useEffect, useRef, useCallback } from "react";

const API_URL = import.meta.env.VITE_API_URL || "";

/* ── Tab definitions ──────────────────────────────────────────── */
const PHARMACIST_TABS = [
  { id: "patient", label: "Patient Info" },
  { id: "vitals", label: "Vitals" },
  { id: "symptoms", label: "Symptoms" },
  { id: "medications", label: "Meds Review" },
  { id: "prescription", label: "Rx Pad" },
  { id: "notes", label: "Notes" },
];

const PATIENT_TABS = [
  { id: "patient", label: "My Info" },
  { id: "vitals", label: "Vitals" },
  { id: "prescription", label: "Prescription" },
];

/* ── Severity helpers ─────────────────────────────────────────── */
const SEVERITY_LABELS = ["", "Mild", "Moderate", "Noticeable", "Severe", "Critical"];
const SEVERITY_COLORS = {
  1: "bg-green-500/20 text-green-300 border-green-500/30",
  2: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  3: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  4: "bg-red-500/20 text-red-300 border-red-500/30",
  5: "bg-red-500/20 text-red-300 border-red-500/30",
};

/* ── Toast notification ───────────────────────────────────────── */
function Toast({ message, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-green-500/20 border border-green-500/30 text-green-300 text-sm font-medium backdrop-blur shadow-lg">
        <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        {message}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ClinicalToolkit — Tabbed sidebar for the virtual consultation
   ═══════════════════════════════════════════════════════════════ */
export default function ClinicalToolkit({ consultationId, session, isPharmacist, token }) {
  const [activeTab, setActiveTab] = useState("patient");
  const [toast, setToast] = useState("");

  /* ── Vitals state ───────────────────────────────────────── */
  const [vitalsForm, setVitalsForm] = useState({
    blood_pressure: "",
    temperature: "",
    pulse: "",
    blood_sugar: "",
    weight: "",
    spo2: "",
  });
  const [vitalsList, setVitalsList] = useState([]);
  const [vitalsLoading, setVitalsLoading] = useState(false);

  /* ── Symptoms state ─────────────────────────────────────── */
  const [symptomForm, setSymptomForm] = useState({
    symptom: "",
    onset: "",
    duration: "",
    severity: 3,
    location: "",
    aggravating: "",
    relieving: "",
  });
  const [symptomsList, setSymptomsList] = useState([]);
  const [symptomsLoading, setSymptomsLoading] = useState(false);

  /* ── Prescription state ─────────────────────────────────── */
  const [rxForm, setRxForm] = useState({
    recommendations: "",
    referral_notes: "",
    lifestyle_advice: "",
  });
  const [savedRx, setSavedRx] = useState(null);
  const [rxLoading, setRxLoading] = useState(false);

  /* ── Notes state ────────────────────────────────────────── */
  const [notes, setNotes] = useState("");
  const [notesSaveStatus, setNotesSaveStatus] = useState(""); // "" | "Saving..." | "Saved"
  const notesTimerRef = useRef(null);

  /* ── Medication review state ────────────────────────────── */
  const [interactionResults, setInteractionResults] = useState(null);
  const [checkingInteractions, setCheckingInteractions] = useState(false);

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const tabs = isPharmacist ? PHARMACIST_TABS : PATIENT_TABS;

  /* ── Fetch vitals on tab open / polling for patient ──────── */
  const fetchVitals = useCallback(async () => {
    if (!consultationId || !token) return;
    try {
      const res = await fetch(
        `${API_URL}/api/clinic/vitals?consultationId=${consultationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        const data = await res.json();
        setVitalsList(data.vitals || data || []);
      }
    } catch {
      /* silent */
    }
  }, [consultationId, token]);

  const fetchSymptoms = useCallback(async () => {
    if (!consultationId || !token) return;
    try {
      const res = await fetch(
        `${API_URL}/api/clinic/symptoms?consultationId=${consultationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        const data = await res.json();
        setSymptomsList(data.symptoms || data || []);
      }
    } catch {
      /* silent */
    }
  }, [consultationId, token]);

  const fetchPrescription = useCallback(async () => {
    if (!consultationId || !token) return;
    try {
      const res = await fetch(
        `${API_URL}/api/clinic/prescription?consultationId=${consultationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        const data = await res.json();
        const rx = data.prescription || data;
        if (rx && (rx.recommendations || rx.referral_notes || rx.lifestyle_advice)) {
          setSavedRx(rx);
          if (isPharmacist) {
            setRxForm({
              recommendations: rx.recommendations || "",
              referral_notes: rx.referral_notes || "",
              lifestyle_advice: rx.lifestyle_advice || "",
            });
          }
        }
      }
    } catch {
      /* silent */
    }
  }, [consultationId, token, isPharmacist]);

  const fetchNotes = useCallback(async () => {
    if (!consultationId || !token || !isPharmacist) return;
    try {
      const res = await fetch(
        `${API_URL}/api/clinic/notes?consultationId=${consultationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.notes || data.content) {
          setNotes(data.notes || data.content || "");
        }
      }
    } catch {
      /* silent */
    }
  }, [consultationId, token, isPharmacist]);

  /* ── Load data on mount / tab switch ────────────────────── */
  useEffect(() => {
    if (activeTab === "vitals") fetchVitals();
    if (activeTab === "symptoms") fetchSymptoms();
    if (activeTab === "prescription") fetchPrescription();
    if (activeTab === "notes") fetchNotes();
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Patient polling for vitals & prescription ──────────── */
  useEffect(() => {
    if (isPharmacist) return;
    const interval = setInterval(() => {
      if (activeTab === "vitals") fetchVitals();
      if (activeTab === "prescription") fetchPrescription();
    }, 10000);
    return () => clearInterval(interval);
  }, [isPharmacist, activeTab, fetchVitals, fetchPrescription]);

  /* ── Record vitals ──────────────────────────────────────── */
  const handleRecordVitals = async () => {
    setVitalsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/clinic/vitals`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          consultationId,
          ...vitalsForm,
        }),
      });
      if (!res.ok) throw new Error("Failed to record vitals");
      setVitalsForm({
        blood_pressure: "",
        temperature: "",
        pulse: "",
        blood_sugar: "",
        weight: "",
        spo2: "",
      });
      setToast("Vitals recorded successfully");
      fetchVitals();
    } catch (e) {
      console.error("[ClinicalToolkit] Vitals error:", e);
    } finally {
      setVitalsLoading(false);
    }
  };

  /* ── Add symptom ────────────────────────────────────────── */
  const handleAddSymptom = async () => {
    if (!symptomForm.symptom.trim()) return;
    setSymptomsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/clinic/symptoms`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          consultationId,
          ...symptomForm,
        }),
      });
      if (!res.ok) throw new Error("Failed to add symptom");
      setSymptomForm({
        symptom: "",
        onset: "",
        duration: "",
        severity: 3,
        location: "",
        aggravating: "",
        relieving: "",
      });
      setToast("Symptom recorded");
      fetchSymptoms();
    } catch (e) {
      console.error("[ClinicalToolkit] Symptom error:", e);
    } finally {
      setSymptomsLoading(false);
    }
  };

  /* ── Save prescription ──────────────────────────────────── */
  const handleSavePrescription = async () => {
    setRxLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/clinic/prescription`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          consultationId,
          ...rxForm,
        }),
      });
      if (!res.ok) throw new Error("Failed to save prescription");
      const data = await res.json();
      setSavedRx(data.prescription || { ...rxForm });
      setToast("Recommendation saved");
    } catch (e) {
      console.error("[ClinicalToolkit] Prescription error:", e);
    } finally {
      setRxLoading(false);
    }
  };

  /* ── Auto-save notes (debounced) ────────────────────────── */
  const saveNotes = useCallback(
    async (content) => {
      setNotesSaveStatus("Saving...");
      try {
        await fetch(`${API_URL}/api/clinic/notes`, {
          method: "POST",
          headers,
          body: JSON.stringify({ consultationId, notes: content }),
        });
        setNotesSaveStatus("Saved");
      } catch {
        setNotesSaveStatus("");
      }
    },
    [consultationId, token] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const handleNotesChange = (e) => {
    const val = e.target.value;
    setNotes(val);
    setNotesSaveStatus("");
    if (notesTimerRef.current) clearTimeout(notesTimerRef.current);
    notesTimerRef.current = setTimeout(() => saveNotes(val), 1500);
  };

  useEffect(() => {
    return () => {
      if (notesTimerRef.current) clearTimeout(notesTimerRef.current);
    };
  }, []);

  /* ── Check drug interactions ────────────────────────────── */
  const handleCheckInteractions = async () => {
    if (!session?.pre_consult_meds) return;
    setCheckingInteractions(true);
    try {
      const res = await fetch(`${API_URL}/api/clinic/interactions`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          consultationId,
          medications: session.pre_consult_meds,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setInteractionResults(data.interactions || data || []);
      }
    } catch (e) {
      console.error("[ClinicalToolkit] Interaction check error:", e);
    } finally {
      setCheckingInteractions(false);
    }
  };

  /* ── Parse medications into list ────────────────────────── */
  const parseMedsList = (medsStr) => {
    if (!medsStr) return [];
    return medsStr
      .split(/[,;\n]+/)
      .map((m) => m.trim())
      .filter(Boolean);
  };

  /* ═══════════════════ RENDER ═══════════════════════════════ */
  return (
    <div className="flex flex-col h-full">
      {/* ── Tab bar ────────────────────────────────────────── */}
      <div className="flex overflow-x-auto border-b border-gray-700 px-2 flex-shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap px-3 py-3 text-xs font-semibold transition-colors border-b-2 flex-shrink-0 ${
              activeTab === tab.id
                ? "border-[#C9A84C] text-[#C9A84C]"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab content ────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* ─────────── Patient Info ─────────────────────────── */}
        {activeTab === "patient" && (
          <div className="space-y-4">
            <h3 className="font-display text-lg text-[#E8D48B]">
              {isPharmacist ? "Patient Information" : "My Information"}
            </h3>

            {/* Reason for visit */}
            <div className="bg-gray-900/80 border border-gray-700/50 rounded-xl p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Reason for Visit</p>
              <p className="text-gray-200 text-sm leading-relaxed">
                {session?.reason || session?.pre_consult_reason || "Not provided"}
              </p>
            </div>

            {/* Current medications */}
            <div className="bg-gray-900/80 border border-gray-700/50 rounded-xl p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Current Medications</p>
              <p className="text-gray-200 text-sm leading-relaxed">
                {session?.medications || session?.pre_consult_meds || "None listed"}
              </p>
            </div>

            {/* Allergies */}
            {(session?.allergies || session?.pre_consult_allergies) && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                <p className="text-xs text-red-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Known Allergies
                </p>
                <p className="text-red-300 text-sm font-medium">
                  {session?.allergies || session?.pre_consult_allergies}
                </p>
              </div>
            )}

            {!session?.allergies && !session?.pre_consult_allergies && (
              <div className="bg-gray-900/80 border border-gray-700/50 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Known Allergies</p>
                <p className="text-gray-400 text-sm">No known allergies</p>
              </div>
            )}

            {/* Session info */}
            <div className="bg-gray-900/80 border border-gray-700/50 rounded-xl p-4 space-y-2">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Session Details</p>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Tier</span>
                <span className="text-white capitalize">{session?.tier || "standard"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Status</span>
                <span className="text-white capitalize">{session?.status || "active"}</span>
              </div>
              {session?.patient_name && isPharmacist && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Patient</span>
                  <span className="text-white">{session.patient_name}</span>
                </div>
              )}
              {session?.pharmacist_name && !isPharmacist && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Pharmacist</span>
                  <span className="text-white">{session.pharmacist_name}</span>
                </div>
              )}
              {session?.past_consultations > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Past Consultations</span>
                  <span className="text-[#C9A84C] font-semibold">{session.past_consultations}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─────────── Vitals Logger ───────────────────────── */}
        {activeTab === "vitals" && (
          <div className="space-y-4">
            <h3 className="font-display text-lg text-[#E8D48B]">
              {isPharmacist ? "Vitals Logger" : "Recorded Vitals"}
            </h3>

            {/* Form (pharmacist only) */}
            {isPharmacist && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Blood Pressure</label>
                    <input
                      type="text"
                      placeholder="120/80"
                      value={vitalsForm.blood_pressure}
                      onChange={(e) => setVitalsForm((f) => ({ ...f, blood_pressure: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#C9A84C]/50 focus:ring-1 focus:ring-[#C9A84C]/30 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Temperature (C)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="37.0"
                      value={vitalsForm.temperature}
                      onChange={(e) => setVitalsForm((f) => ({ ...f, temperature: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#C9A84C]/50 focus:ring-1 focus:ring-[#C9A84C]/30 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Pulse (bpm)</label>
                    <input
                      type="number"
                      placeholder="72"
                      value={vitalsForm.pulse}
                      onChange={(e) => setVitalsForm((f) => ({ ...f, pulse: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#C9A84C]/50 focus:ring-1 focus:ring-[#C9A84C]/30 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Blood Sugar (mmol/L)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="5.5"
                      value={vitalsForm.blood_sugar}
                      onChange={(e) => setVitalsForm((f) => ({ ...f, blood_sugar: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#C9A84C]/50 focus:ring-1 focus:ring-[#C9A84C]/30 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="70"
                      value={vitalsForm.weight}
                      onChange={(e) => setVitalsForm((f) => ({ ...f, weight: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#C9A84C]/50 focus:ring-1 focus:ring-[#C9A84C]/30 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">SpO2 (%)</label>
                    <input
                      type="number"
                      placeholder="98"
                      value={vitalsForm.spo2}
                      onChange={(e) => setVitalsForm((f) => ({ ...f, spo2: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#C9A84C]/50 focus:ring-1 focus:ring-[#C9A84C]/30 transition-colors"
                    />
                  </div>
                </div>

                <button
                  onClick={handleRecordVitals}
                  disabled={vitalsLoading}
                  className="w-full py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#C9A84C] to-[#E8D48B] text-gray-900 hover:shadow-lg hover:shadow-[#C9A84C]/20 transition-all disabled:opacity-50"
                >
                  {vitalsLoading ? "Recording..." : "Record Vitals"}
                </button>
              </div>
            )}

            {/* Vitals table */}
            {vitalsList.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Recorded Vitals</p>
                {vitalsList.map((v, idx) => (
                  <div
                    key={v.id || idx}
                    className="bg-gray-900/80 border border-gray-700/50 rounded-xl p-3 space-y-1.5"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-500">
                        {v.created_at
                          ? new Date(v.created_at).toLocaleTimeString("en-GH", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : `Entry ${idx + 1}`}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                      {v.blood_pressure && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">BP</span>
                          <span className="text-white font-medium">{v.blood_pressure}</span>
                        </div>
                      )}
                      {v.temperature && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Temp</span>
                          <span className="text-white font-medium">{v.temperature} C</span>
                        </div>
                      )}
                      {v.pulse && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Pulse</span>
                          <span className="text-white font-medium">{v.pulse} bpm</span>
                        </div>
                      )}
                      {v.blood_sugar && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Sugar</span>
                          <span className="text-white font-medium">{v.blood_sugar} mmol/L</span>
                        </div>
                      )}
                      {v.weight && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Weight</span>
                          <span className="text-white font-medium">{v.weight} kg</span>
                        </div>
                      )}
                      {v.spo2 && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">SpO2</span>
                          <span className="text-white font-medium">{v.spo2}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500 text-sm">No vitals recorded yet</p>
              </div>
            )}
          </div>
        )}

        {/* ─────────── Symptom Checker ─────────────────────── */}
        {activeTab === "symptoms" && isPharmacist && (
          <div className="space-y-4">
            <h3 className="font-display text-lg text-[#E8D48B]">Symptom Checker</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Symptom *</label>
                <input
                  type="text"
                  placeholder="e.g. Headache"
                  value={symptomForm.symptom}
                  onChange={(e) => setSymptomForm((f) => ({ ...f, symptom: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#C9A84C]/50 focus:ring-1 focus:ring-[#C9A84C]/30 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Onset</label>
                  <input
                    type="text"
                    placeholder="e.g. 2 days ago"
                    value={symptomForm.onset}
                    onChange={(e) => setSymptomForm((f) => ({ ...f, onset: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#C9A84C]/50 focus:ring-1 focus:ring-[#C9A84C]/30 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Duration</label>
                  <input
                    type="text"
                    placeholder="e.g. Constant"
                    value={symptomForm.duration}
                    onChange={(e) => setSymptomForm((f) => ({ ...f, duration: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#C9A84C]/50 focus:ring-1 focus:ring-[#C9A84C]/30 transition-colors"
                  />
                </div>
              </div>

              {/* Severity slider */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Severity: <span className="text-white font-medium">{SEVERITY_LABELS[symptomForm.severity]}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={symptomForm.severity}
                  onChange={(e) => setSymptomForm((f) => ({ ...f, severity: Number(e.target.value) }))}
                  className="w-full accent-[#C9A84C]"
                />
                <div className="flex justify-between text-[10px] text-gray-500 px-0.5">
                  <span>Mild</span>
                  <span>Moderate</span>
                  <span>Severe</span>
                  <span>Critical</span>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Location</label>
                <input
                  type="text"
                  placeholder="e.g. Frontal, bilateral"
                  value={symptomForm.location}
                  onChange={(e) => setSymptomForm((f) => ({ ...f, location: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#C9A84C]/50 focus:ring-1 focus:ring-[#C9A84C]/30 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Aggravating</label>
                  <input
                    type="text"
                    placeholder="e.g. Light, noise"
                    value={symptomForm.aggravating}
                    onChange={(e) => setSymptomForm((f) => ({ ...f, aggravating: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#C9A84C]/50 focus:ring-1 focus:ring-[#C9A84C]/30 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Relieving</label>
                  <input
                    type="text"
                    placeholder="e.g. Rest, dark room"
                    value={symptomForm.relieving}
                    onChange={(e) => setSymptomForm((f) => ({ ...f, relieving: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#C9A84C]/50 focus:ring-1 focus:ring-[#C9A84C]/30 transition-colors"
                  />
                </div>
              </div>

              <button
                onClick={handleAddSymptom}
                disabled={symptomsLoading || !symptomForm.symptom.trim()}
                className="w-full py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#C9A84C] to-[#E8D48B] text-gray-900 hover:shadow-lg hover:shadow-[#C9A84C]/20 transition-all disabled:opacity-50"
              >
                {symptomsLoading ? "Adding..." : "Add Symptom"}
              </button>
            </div>

            {/* Symptom cards */}
            {symptomsList.length > 0 && (
              <div className="space-y-2 pt-2">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Recorded Symptoms</p>
                {symptomsList.map((s, idx) => (
                  <div
                    key={s.id || idx}
                    className="bg-gray-900/80 border border-gray-700/50 rounded-xl p-3"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-white text-sm font-semibold">{s.symptom}</span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          SEVERITY_COLORS[s.severity] || "bg-gray-500/20 text-gray-300 border-gray-500/30"
                        }`}
                      >
                        {SEVERITY_LABELS[s.severity] || `Level ${s.severity}`}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-xs text-gray-400">
                      {s.onset && <span>Onset: {s.onset}</span>}
                      {s.duration && <span>Duration: {s.duration}</span>}
                      {s.location && <span>Location: {s.location}</span>}
                      {s.aggravating && <span>Worse: {s.aggravating}</span>}
                      {s.relieving && <span>Better: {s.relieving}</span>}
                    </div>
                    {/* AI suggestion badges */}
                    {s.ai_suggestions && Array.isArray(s.ai_suggestions) && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {s.ai_suggestions.map((sug, si) => (
                          <span
                            key={si}
                            className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                              sug.level === "high"
                                ? "bg-red-500/20 text-red-300"
                                : sug.level === "medium"
                                ? "bg-yellow-500/20 text-yellow-300"
                                : "bg-green-500/20 text-green-300"
                            }`}
                          >
                            {sug.label || sug.text || sug}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─────────── Medication Review ───────────────────── */}
        {activeTab === "medications" && isPharmacist && (
          <div className="space-y-4">
            <h3 className="font-display text-lg text-[#E8D48B]">Medication Review</h3>

            {/* Patient's meds */}
            <div className="bg-gray-900/80 border border-gray-700/50 rounded-xl p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Pre-Consultation Medications</p>
              {parseMedsList(session?.medications || session?.pre_consult_meds).length > 0 ? (
                <ul className="space-y-1.5">
                  {parseMedsList(session?.medications || session?.pre_consult_meds).map((med, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <svg className="w-3.5 h-3.5 text-[#C9A84C] flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-200">{med}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">No medications listed</p>
              )}
            </div>

            <button
              onClick={handleCheckInteractions}
              disabled={checkingInteractions || !session?.medications && !session?.pre_consult_meds}
              className="w-full py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#C9A84C] to-[#E8D48B] text-gray-900 hover:shadow-lg hover:shadow-[#C9A84C]/20 transition-all disabled:opacity-50"
            >
              {checkingInteractions ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                  Checking...
                </span>
              ) : (
                "Check Interactions"
              )}
            </button>

            {/* Interaction results */}
            {interactionResults && (
              <div className="space-y-2">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Interaction Results</p>
                {Array.isArray(interactionResults) && interactionResults.length > 0 ? (
                  interactionResults.map((interaction, idx) => {
                    const severity = interaction.severity || interaction.level || "low";
                    const severityClass =
                      severity === "high" || severity === "major"
                        ? "border-red-500/30 bg-red-500/10"
                        : severity === "medium" || severity === "moderate"
                        ? "border-yellow-500/30 bg-yellow-500/10"
                        : "border-green-500/30 bg-green-500/10";
                    const textClass =
                      severity === "high" || severity === "major"
                        ? "text-red-300"
                        : severity === "medium" || severity === "moderate"
                        ? "text-yellow-300"
                        : "text-green-300";

                    return (
                      <div key={idx} className={`border rounded-xl p-3 ${severityClass}`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-semibold uppercase ${textClass}`}>
                            {severity}
                          </span>
                        </div>
                        <p className="text-sm text-gray-200">
                          {interaction.description || interaction.message || interaction.drug_pair || JSON.stringify(interaction)}
                        </p>
                        {interaction.drugs && (
                          <p className="text-xs text-gray-400 mt-1">{interaction.drugs}</p>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3">
                    <p className="text-green-300 text-sm">No significant interactions found.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ─────────── Prescription Pad ────────────────────── */}
        {activeTab === "prescription" && (
          <div className="space-y-4">
            <h3 className="font-display text-lg text-[#E8D48B]">
              {isPharmacist ? "Prescription Pad" : "Prescription"}
            </h3>

            {/* Form (pharmacist only) */}
            {isPharmacist && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Recommendations (OTC meds & dosages)</label>
                  <textarea
                    value={rxForm.recommendations}
                    onChange={(e) => setRxForm((f) => ({ ...f, recommendations: e.target.value }))}
                    placeholder="e.g. Paracetamol 500mg, 2 tablets every 6 hours..."
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#C9A84C]/50 focus:ring-1 focus:ring-[#C9A84C]/30 transition-colors resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Referral Notes</label>
                  <textarea
                    value={rxForm.referral_notes}
                    onChange={(e) => setRxForm((f) => ({ ...f, referral_notes: e.target.value }))}
                    placeholder="Any referral recommendations..."
                    rows={2}
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#C9A84C]/50 focus:ring-1 focus:ring-[#C9A84C]/30 transition-colors resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Lifestyle Advice</label>
                  <textarea
                    value={rxForm.lifestyle_advice}
                    onChange={(e) => setRxForm((f) => ({ ...f, lifestyle_advice: e.target.value }))}
                    placeholder="Diet, exercise, hydration tips..."
                    rows={2}
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#C9A84C]/50 focus:ring-1 focus:ring-[#C9A84C]/30 transition-colors resize-none"
                  />
                </div>
                <button
                  onClick={handleSavePrescription}
                  disabled={rxLoading}
                  className="w-full py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#C9A84C] to-[#E8D48B] text-gray-900 hover:shadow-lg hover:shadow-[#C9A84C]/20 transition-all disabled:opacity-50"
                >
                  {rxLoading ? "Saving..." : "Save Recommendation"}
                </button>
              </div>
            )}

            {/* Preview card */}
            {savedRx && (
              <div className="border-2 border-[#C9A84C]/30 bg-[#C9A84C]/5 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-[#C9A84C]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                    <rect x="9" y="3" width="6" height="4" rx="1" />
                    <path d="M9 14l2 2 4-4" />
                  </svg>
                  <span className="font-display text-[#E8D48B] text-sm">Pharmacist Recommendation</span>
                </div>

                {savedRx.recommendations && (
                  <div>
                    <p className="text-xs text-[#C9A84C] uppercase tracking-wider mb-0.5">Medications</p>
                    <p className="text-gray-200 text-sm whitespace-pre-wrap">{savedRx.recommendations}</p>
                  </div>
                )}
                {savedRx.referral_notes && (
                  <div>
                    <p className="text-xs text-[#C9A84C] uppercase tracking-wider mb-0.5">Referral Notes</p>
                    <p className="text-gray-200 text-sm whitespace-pre-wrap">{savedRx.referral_notes}</p>
                  </div>
                )}
                {savedRx.lifestyle_advice && (
                  <div>
                    <p className="text-xs text-[#C9A84C] uppercase tracking-wider mb-0.5">Lifestyle Advice</p>
                    <p className="text-gray-200 text-sm whitespace-pre-wrap">{savedRx.lifestyle_advice}</p>
                  </div>
                )}
              </div>
            )}

            {/* Patient: empty state */}
            {!isPharmacist && !savedRx && (
              <div className="text-center py-8">
                <svg className="w-10 h-10 mx-auto text-gray-700 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                  <rect x="9" y="3" width="6" height="4" rx="1" />
                </svg>
                <p className="text-gray-500 text-sm">No prescription yet</p>
                <p className="text-gray-600 text-xs mt-1">
                  Your pharmacist will add recommendations during the session
                </p>
              </div>
            )}
          </div>
        )}

        {/* ─────────── Session Notes ───────────────────────── */}
        {activeTab === "notes" && isPharmacist && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg text-[#E8D48B]">Session Notes</h3>
              {notesSaveStatus && (
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    notesSaveStatus === "Saved"
                      ? "bg-green-500/15 text-green-300"
                      : "bg-yellow-500/15 text-yellow-300"
                  }`}
                >
                  {notesSaveStatus}
                </span>
              )}
            </div>

            <textarea
              value={notes}
              onChange={handleNotesChange}
              placeholder="Private notes -- not visible to patient..."
              rows={12}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#C9A84C]/50 focus:ring-1 focus:ring-[#C9A84C]/30 transition-colors resize-none leading-relaxed"
            />

            <p className="text-gray-600 text-xs flex items-center gap-1.5">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
              These notes are private and only visible to you
            </p>
          </div>
        )}
      </div>

      {/* ── Toast ──────────────────────────────────────────── */}
      {toast && <Toast message={toast} onDismiss={() => setToast("")} />}
    </div>
  );
}
