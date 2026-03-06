import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "../i18n/useTranslation";
import PharmacyCard from "../components/Pharmacy/PharmacyCard";

const API_URL = import.meta.env.VITE_API_URL || "";

const GHANA_REGIONS = [
  "Greater Accra",
  "Ashanti",
  "Northern",
  "Central",
  "Western",
  "Eastern",
  "Volta",
  "Bono",
  "Bono East",
  "Ahafo",
  "Upper East",
  "Upper West",
  "Savannah",
  "North East",
  "Oti",
  "Western North",
];

export default function PharmacyLocator() {
  const { t } = useTranslation();
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("");
  const [nhisFilter, setNhisFilter] = useState(false);
  const [partnerFilter, setPartnerFilter] = useState(false);
  const [userLat, setUserLat] = useState(null);
  const [userLng, setUserLng] = useState(null);
  const [locating, setLocating] = useState(false);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);

  const fetchPharmacies = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("q", search.trim());
      if (region) params.set("region", region);
      if (nhisFilter) params.set("nhis", "1");
      if (partnerFilter) params.set("partner", "1");
      if (userLat != null && userLng != null) {
        params.set("lat", userLat);
        params.set("lng", userLng);
      }
      const res = await fetch(`${API_URL}/api/pharmacies?${params.toString()}`);
      const data = await res.json();
      setPharmacies(data.pharmacies || []);
    } catch {
      setPharmacies([]);
    } finally {
      setLoading(false);
    }
  }, [search, region, nhisFilter, partnerFilter, userLat, userLng]);

  useEffect(() => {
    const debounce = setTimeout(fetchPharmacies, 300);
    return () => clearTimeout(debounce);
  }, [fetchPharmacies]);

  const handleUseLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLat(pos.coords.latitude);
        setUserLng(pos.coords.longitude);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const clearLocation = () => {
    setUserLat(null);
    setUserLng(null);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl dark-glass p-8 sm:p-10 text-center">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent" />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-60 h-60 rounded-full bg-[#C9A84C]/5 blur-[80px]" />
        <div className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full bg-ghana-green/5 blur-3xl" />

        <div className="relative">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#C9A84C]/10 ring-1 ring-[#C9A84C]/20 mb-4">
            <svg className="w-7 h-7 text-[#C9A84C]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display gold-text">
            Find a Pharmacy
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 max-w-lg mx-auto font-body">
            Locate pharmacies across Ghana. Filter by NHIS acceptance, partner status, and distance from your location.
          </p>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-[3px] flex">
          <div className="flex-1 bg-ghana-red/50" />
          <div className="flex-1 bg-ghana-gold/50" />
          <div className="flex-1 bg-ghana-green/50" />
        </div>
      </div>

      {/* Search & Filters */}
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Search bar */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by pharmacy name or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-warm-200/60 dark:border-white/10 bg-warm-50 dark:bg-white/[0.03] text-gray-900 dark:text-gray-100 placeholder-gray-400 font-body focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C]/50 transition-colors"
            aria-label="Search pharmacies"
          />
        </div>

        {/* Filter row */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="admin-select flex-1 min-w-[160px]"
            aria-label="Filter by region"
          >
            <option value="">All Regions</option>
            {GHANA_REGIONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setNhisFilter(!nhisFilter)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-body font-medium rounded-lg border transition-colors ${
              nhisFilter
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-warm-50/50 dark:bg-white/[0.03] border-warm-200/60 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-emerald-500/30"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            NHIS Accepted
          </button>

          <button
            type="button"
            onClick={() => setPartnerFilter(!partnerFilter)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-body font-medium rounded-lg border transition-colors ${
              partnerFilter
                ? "bg-[#C9A84C]/10 border-[#C9A84C]/30 text-[#C9A84C]"
                : "bg-warm-50/50 dark:bg-white/[0.03] border-warm-200/60 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-[#C9A84C]/30"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            Partner Pharmacies
          </button>

          <button
            type="button"
            onClick={userLat != null ? clearLocation : handleUseLocation}
            disabled={locating}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-body font-medium rounded-lg border transition-colors ${
              userLat != null
                ? "bg-sky-500/10 border-sky-500/30 text-sky-400"
                : "bg-warm-50/50 dark:bg-white/[0.03] border-warm-200/60 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-sky-500/30"
            } ${locating ? "opacity-60 cursor-wait" : ""}`}
          >
            {locating ? (
              <div className="w-4 h-4 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
            {userLat != null ? "Near Me (on)" : "Use My Location"}
          </button>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400 font-body">
            {loading ? "Searching..." : `${pharmacies.length} ${pharmacies.length === 1 ? "pharmacy" : "pharmacies"} found`}
          </p>
          {userLat != null && (
            <p className="text-xs text-sky-400 font-body">
              Sorted by distance from your location
            </p>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="max-w-4xl mx-auto">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#C9A84C] animate-spin" />
                <div className="absolute inset-1 rounded-full border-2 border-transparent border-b-[#C9A84C]/40 animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-body">Finding pharmacies...</p>
            </div>
          </div>
        ) : pharmacies.length === 0 ? (
          <div className="text-center py-16 dark-glass rounded-xl">
            <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h2 className="text-lg font-display text-gray-700 dark:text-gray-300">No pharmacies found</h2>
            <p className="text-sm text-gray-600 dark:text-gray-500 mt-1 font-body">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {pharmacies.map((pharmacy) => (
              <PharmacyCard
                key={pharmacy.id}
                pharmacy={pharmacy}
                onSelect={setSelectedPharmacy}
              />
            ))}
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="max-w-4xl mx-auto">
        <div className="rounded-xl bg-[#C9A84C]/5 dark:bg-[#C9A84C]/[0.03] border border-[#C9A84C]/20 p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-[#C9A84C] shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="text-sm font-display text-[#7A6520] dark:text-[#C9A84C]">
              Pharmacy Information
            </p>
            <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-body">
              Hours and stock availability may vary. Please call ahead to confirm. For emergencies, call Ghana Emergency Services: 112 / 193.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
