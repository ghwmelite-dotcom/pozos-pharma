import { useState, useEffect, useRef } from "react";
import Modal from "../UI/Modal";

const API_URL = import.meta.env.VITE_API_URL || "";

const FREQUENCY_OPTIONS = [
  { value: "once_daily", label: "Once daily", times: 1 },
  { value: "twice_daily", label: "Twice daily", times: 2 },
  { value: "three_times_daily", label: "Three times daily", times: 3 },
  { value: "every_8_hours", label: "Every 8 hours", times: 3 },
  { value: "weekly", label: "Weekly", times: 1 },
  { value: "as_needed", label: "As needed", times: 1 },
];

export default function AddMedicationModal({ isOpen, onClose, onAdded, token }) {
  const [drugName, setDrugName] = useState("");
  const [drugId, setDrugId] = useState(null);
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("once_daily");
  const [times, setTimes] = useState(["08:00"]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Drug search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searching, setSearching] = useState(false);
  const [manualEntry, setManualEntry] = useState(false);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setDrugName("");
      setDrugId(null);
      setDosage("");
      setFrequency("once_daily");
      setTimes(["08:00"]);
      setStartDate("");
      setEndDate("");
      setError("");
      setSearchQuery("");
      setSearchResults([]);
      setManualEntry(false);
    }
  }, [isOpen]);

  // Update time inputs when frequency changes
  useEffect(() => {
    const opt = FREQUENCY_OPTIONS.find((f) => f.value === frequency);
    if (opt) {
      const defaults = ["08:00", "14:00", "20:00"];
      setTimes(defaults.slice(0, opt.times));
    }
  }, [frequency]);

  // Drug search with debounce
  useEffect(() => {
    if (manualEntry || searchQuery.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`${API_URL}/api/drugs/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.drugs || []);
          setShowDropdown(true);
        }
      } catch {
        // ignore
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [searchQuery, manualEntry]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectDrug = (drug) => {
    setDrugName(drug.generic_name);
    setDrugId(drug.id);
    setSearchQuery(drug.generic_name);
    setShowDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const name = manualEntry ? drugName : (drugId ? drugName : searchQuery);
    if (!name.trim()) {
      setError("Please enter a drug name");
      return;
    }
    if (!frequency) {
      setError("Please select a frequency");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/reminders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          drug_id: drugId || undefined,
          drug_name: name.trim(),
          dosage: dosage.trim() || undefined,
          frequency,
          times,
          start_date: startDate || undefined,
          end_date: endDate || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save reminder");
      }

      onAdded();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Medication" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-red-700 bg-red-50 dark:text-red-300 dark:bg-red-900/20 rounded-lg">
            {error}
          </div>
        )}

        {/* Drug Search / Manual Entry */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Medication Name
          </label>
          {!manualEntry ? (
            <div className="relative" ref={searchRef}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setDrugId(null);
                  setDrugName("");
                }}
                placeholder="Search for a medication..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-warm-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              {searching && (
                <div className="absolute right-3 top-2.5">
                  <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              {showDropdown && searchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-warm-50 dark:bg-gray-800 border border-warm-200/60 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {searchResults.map((drug) => (
                    <button
                      key={drug.id}
                      type="button"
                      onClick={() => selectDrug(drug)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-warm-200/40 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 border-b border-warm-200 dark:border-gray-700 last:border-0"
                    >
                      <span className="font-medium">{drug.generic_name}</span>
                      {drug.brand_names && (
                        <span className="ml-2 text-gray-500 dark:text-gray-400">({drug.brand_names})</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
              {showDropdown && searchResults.length === 0 && searchQuery.length >= 2 && !searching && (
                <div className="absolute z-10 w-full mt-1 bg-warm-50 dark:bg-gray-800 border border-warm-200/60 dark:border-gray-700 rounded-lg shadow-lg p-3 text-sm text-gray-500 dark:text-gray-400">
                  No drugs found.
                </div>
              )}
              <button
                type="button"
                onClick={() => {
                  setManualEntry(true);
                  setDrugName(searchQuery);
                }}
                className="mt-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Drug not listed? Enter manually
              </button>
            </div>
          ) : (
            <div>
              <input
                type="text"
                value={drugName}
                onChange={(e) => setDrugName(e.target.value)}
                placeholder="Enter medication name"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-warm-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => {
                  setManualEntry(false);
                  setSearchQuery(drugName);
                }}
                className="mt-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Search drug database instead
              </button>
            </div>
          )}
        </div>

        {/* Dosage */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Dosage
          </label>
          <input
            type="text"
            value={dosage}
            onChange={(e) => setDosage(e.target.value)}
            placeholder="e.g., 500mg, 1 tablet, 5ml"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-warm-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* Frequency */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Frequency
          </label>
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-warm-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            {FREQUENCY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Time Pickers */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Reminder Times
          </label>
          <div className="flex flex-wrap gap-2">
            {times.map((time, idx) => (
              <input
                key={idx}
                type="time"
                value={time}
                onChange={(e) => {
                  const updated = [...times];
                  updated[idx] = e.target.value;
                  setTimes(updated);
                }}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-warm-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            ))}
          </div>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Start Date <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-warm-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              End Date <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-warm-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-warm-200/60 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg transition-colors"
          >
            {saving ? "Saving..." : "Save Medication"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
