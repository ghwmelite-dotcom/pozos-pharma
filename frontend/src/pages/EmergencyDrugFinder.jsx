import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "../i18n/useTranslation";

/* ================================================================
   Constants & Mock Data
   ================================================================ */

const DRUG_SUGGESTIONS = [
  "Insulin Glargine",
  "Amodiaquine",
  "Coartem",
  "Metformin",
  "Amoxicillin",
  "Ciprofloxacin",
  "ORS Sachets",
  "Artemether-Lumefantrine",
];

const CRITICAL_DRUGS = [
  "insulin",
  "antivenin",
  "adrenaline",
  "epinephrine",
  "blood pressure",
  "amlodipine",
  "losartan",
  "atenolol",
  "metformin",
  "nitroglycerin",
  "warfarin",
  "heparin",
];

const GHANA_REGIONS = [
  "Greater Accra",
  "Ashanti",
  "Western",
  "Northern",
  "Eastern",
  "Central",
  "Volta",
  "Bono",
  "Upper East",
  "Upper West",
];

const MOCK_PHARMACIES = [];

/* ================================================================
   SVG Icon Components
   ================================================================ */

function RedCrossIcon({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="9" y="2" width="6" height="20" rx="1" fill="currentColor" />
      <rect x="2" y="9" width="20" height="6" rx="1" fill="currentColor" />
    </svg>
  );
}

function LocationPinIcon({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M12 2C7.58 2 4 5.58 4 10c0 5.25 7.13 11.38 7.42 11.62a1 1 0 001.16 0C12.87 21.38 20 15.25 20 10c0-4.42-3.58-8-8-8zm0 11a3 3 0 110-6 3 3 0 010 6z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function SearchIcon({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function PhoneIcon({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V20a1 1 0 01-1 1C10.07 21 3 13.93 3 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.46.57 3.58a1 1 0 01-.24 1.01l-2.21 2.2z" />
    </svg>
  );
}

function DirectionsIcon({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M21.71 11.29l-9-9a1 1 0 00-1.42 0l-9 9a1 1 0 000 1.42l9 9a1 1 0 001.42 0l9-9a1 1 0 000-1.42zM14 14.5V12h-4v3H8v-4a1 1 0 011-1h5V7.5l3.5 3.5-3.5 3.5z" />
    </svg>
  );
}

function ClockIcon({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function FilterIcon({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  );
}

function CrosshairIcon({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="22" y1="12" x2="18" y2="12" />
      <line x1="6" y1="12" x2="2" y2="12" />
      <line x1="12" y1="6" x2="12" y2="2" />
      <line x1="12" y1="22" x2="12" y2="18" />
    </svg>
  );
}

function AlertTriangleIcon({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

/* ================================================================
   Stock Status Badge
   ================================================================ */

function StockBadge({ status }) {
  const config = {
    IN_STOCK: {
      label: "In Stock",
      bg: "bg-emerald-500/15 dark:bg-emerald-500/20",
      text: "text-emerald-700 dark:text-emerald-400",
      ring: "ring-emerald-500/30",
      dot: "bg-emerald-500",
    },
    LOW_STOCK: {
      label: "Low Stock",
      bg: "bg-amber-500/15 dark:bg-amber-500/20",
      text: "text-amber-700 dark:text-amber-400",
      ring: "ring-amber-500/30",
      dot: "bg-amber-500",
    },
    OUT_OF_STOCK: {
      label: "Out of Stock",
      bg: "bg-red-500/15 dark:bg-red-500/20",
      text: "text-red-700 dark:text-red-400",
      ring: "ring-red-500/30",
      dot: "bg-red-500",
    },
  };

  const c = config[status] || config.OUT_OF_STOCK;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ring-1 ${c.bg} ${c.text} ${c.ring}`}
      role="status"
    >
      <span className={`w-2 h-2 rounded-full ${c.dot} ${status === "LOW_STOCK" ? "animate-pulse" : ""}`} />
      {c.label}
    </span>
  );
}

/* ================================================================
   Pharmacy Card
   ================================================================ */

function PharmacyResultCard({ pharmacy, index, drugName }) {
  const isOutOfStock = pharmacy.stock === "OUT_OF_STOCK";

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${pharmacy.lat},${pharmacy.lng}`;

  return (
    <div
      className={`animate-stagger relative group ${isOutOfStock ? "opacity-60" : ""}`}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div
        className={`dark-glass rounded-xl p-5 transition-all duration-300 ${
          isOutOfStock
            ? "border-gray-700/30"
            : "hover:border-[#C9A84C]/30 hover:shadow-lg hover:shadow-[#C9A84C]/5"
        }`}
      >
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-lg text-warm-50 dark:text-warm-50 truncate">
              {pharmacy.name}
            </h3>
            <p className="text-sm text-gray-400 mt-0.5 flex items-center gap-1.5">
              <LocationPinIcon className="w-3.5 h-3.5 shrink-0 text-[#C9A84C]" />
              <span className="truncate">{pharmacy.address}</span>
            </p>
          </div>
          <StockBadge status={pharmacy.stock} />
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4 text-sm">
          <div>
            <span className="text-gray-500 text-xs uppercase tracking-wider">Distance</span>
            <p className="text-warm-100 font-semibold mt-0.5">{pharmacy.distance} km</p>
          </div>
          <div>
            <span className="text-gray-500 text-xs uppercase tracking-wider">Price</span>
            <p className="text-warm-100 font-semibold mt-0.5">
              GH&#x20B5; {pharmacy.price.toFixed(2)}
            </p>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <span className="text-gray-500 text-xs uppercase tracking-wider flex items-center gap-1">
              <ClockIcon className="w-3 h-3" />
              Hours
            </span>
            <p className="text-warm-100 text-xs mt-0.5">{pharmacy.hours}</p>
          </div>
        </div>

        {/* Drug name tag */}
        {drugName && (
          <div className="mb-4">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono bg-emerald-900/30 text-emerald-300 border border-emerald-800/40">
              {drugName}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2.5 pt-3 border-t border-gray-800/50">
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
              isOutOfStock
                ? "bg-gray-800 text-gray-500 cursor-not-allowed pointer-events-none"
                : "bg-gradient-to-r from-[#C9A84C] to-[#A8893A] text-gray-950 hover:from-[#E8D48B] hover:to-[#C9A84C] shadow-sm hover:shadow-md hover:shadow-[#C9A84C]/20"
            }`}
            aria-label={`Get directions to ${pharmacy.name}`}
          >
            <DirectionsIcon className="w-4 h-4" />
            Get Directions
          </a>
          <a
            href={`tel:${pharmacy.phone}`}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
              isOutOfStock
                ? "bg-gray-800 text-gray-500 cursor-not-allowed pointer-events-none"
                : "bg-gray-800 text-[#E8D48B] hover:bg-gray-700 ring-1 ring-[#C9A84C]/20 hover:ring-[#C9A84C]/40"
            }`}
            aria-label={`Call ${pharmacy.name}`}
          >
            <PhoneIcon className="w-4 h-4" />
            Call Now
          </a>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   Main Page Component
   ================================================================ */

export default function EmergencyDrugFinder() {
  const { t } = useTranslation();

  /* ── State ────────────────────────────────────────────────── */
  const [drugQuery, setDrugQuery] = useState("");
  const [selectedDrug, setSelectedDrug] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [region, setRegion] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [sortBy, setSortBy] = useState("distance");
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const searchInputRef = useRef(null);
  const suggestionsRef = useRef(null);

  /* ── Derived ──────────────────────────────────────────────── */
  const isCriticalDrug = CRITICAL_DRUGS.some((d) =>
    selectedDrug.toLowerCase().includes(d)
  );

  const filteredSuggestions = drugQuery.trim()
    ? DRUG_SUGGESTIONS.filter((d) =>
        d.toLowerCase().includes(drugQuery.toLowerCase())
      )
    : [];

  /* Sort & filter pharmacy results */
  const pharmacyResults = (() => {
    if (!hasSearched) return [];
    let results = [...MOCK_PHARMACIES];

    if (onlyInStock) {
      results = results.filter((p) => p.stock !== "OUT_OF_STOCK");
    }

    results.sort((a, b) => {
      if (sortBy === "distance") return a.distance - b.distance;
      if (sortBy === "price") return a.price - b.price;
      if (sortBy === "availability") {
        const order = { IN_STOCK: 0, LOW_STOCK: 1, OUT_OF_STOCK: 2 };
        return (order[a.stock] ?? 3) - (order[b.stock] ?? 3);
      }
      return 0;
    });

    return results;
  })();

  /* ── Close suggestions on outside click ───────────────────── */
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(e.target)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ── Handlers ─────────────────────────────────────────────── */
  const handleDrugSelect = useCallback((drug) => {
    setDrugQuery(drug);
    setSelectedDrug(drug);
    setShowSuggestions(false);
    searchInputRef.current?.focus();
  }, []);

  const handleSearch = useCallback(() => {
    if (!drugQuery.trim()) return;
    setSelectedDrug(drugQuery.trim());
    setIsSearching(true);
    setShowSuggestions(false);

    // Simulate network delay
    setTimeout(() => {
      setHasSearched(true);
      setIsSearching(false);
    }, 800);
  }, [drugQuery]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") {
        handleSearch();
      }
      if (e.key === "Escape") {
        setShowSuggestions(false);
      }
    },
    [handleSearch]
  );

  const handleUseLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }
    setLocating(true);
    setLocationError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLocating(false);
      },
      (err) => {
        setLocationError(
          err.code === 1
            ? "Location permission denied. Please allow location access or select a region."
            : "Unable to determine your location. Please try again or select a region."
        );
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  /* ================================================================
     Render
     ================================================================ */
  return (
    <div className="min-h-screen bg-warm-50 dark:bg-gray-950 relative overflow-hidden">
      {/* Background decorations */}
      <div className="kente-weave absolute inset-0 pointer-events-none" />
      <div className="noise-overlay absolute inset-0 pointer-events-none" />

      {/* ── Urgency Banner (critical drugs) ──────────────────── */}
      {hasSearched && isCriticalDrug && (
        <div
          className="relative z-20 border-b-2 animate-pulse"
          style={{
            borderImage:
              "linear-gradient(90deg, #CE1126, #C9A84C, #CE1126, #C9A84C) 1",
          }}
        >
          <div className="bg-red-950/90 dark:bg-red-950/95 backdrop-blur-sm px-4 py-3">
            <div className="max-w-5xl mx-auto flex items-center gap-3">
              <AlertTriangleIcon className="w-5 h-5 text-red-400 shrink-0" />
              <p className="text-sm text-red-200 font-body">
                <span className="font-semibold text-red-100">
                  Critical medication alert:
                </span>{" "}
                <span className="italic">{selectedDrug}</span> is classified as
                an emergency/essential medicine. Contact the nearest pharmacy
                immediately if unavailable.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* ── Hero Section ───────────────────────────────────── */}
        <header className="text-center mb-10 sm:mb-12">
          {/* Pulse ring + icons */}
          <div className="relative inline-flex items-center justify-center mb-6">
            {/* Outer pulse rings */}
            <span className="absolute w-24 h-24 rounded-full border-2 border-red-500/30 hero-pulse-ring" />
            <span
              className="absolute w-20 h-20 rounded-full border border-[#C9A84C]/20 hero-pulse-ring"
              style={{ animationDelay: "0.5s" }}
            />

            {/* Icon cluster */}
            <div className="relative flex items-center gap-2">
              <RedCrossIcon className="w-10 h-10 text-red-500 drop-shadow-lg" />
              <LocationPinIcon className="w-8 h-8 text-[#C9A84C] -ml-2 drop-shadow-lg" />
            </div>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl gold-text leading-tight mb-3 hero-title-reveal">
            Emergency Drug Finder
          </h1>
          <p className="font-body text-lg sm:text-xl text-warm-600 dark:text-gray-400 max-w-2xl mx-auto hero-reveal">
            Find medicines in stock near you &mdash; right now
          </p>

          {/* Kente accent bar */}
          <div className="mt-6 mx-auto w-32 h-1 rounded-full bg-kente-accent" />
        </header>

        {/* ── Search Section ─────────────────────────────────── */}
        <section aria-label="Drug search" className="mb-8">
          <div className="dark-glass rounded-2xl p-5 sm:p-6">
            {/* Search input */}
            <div className="relative mb-5">
              <label htmlFor="drug-search" className="sr-only">
                Search for a drug
              </label>
              <div className="relative">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  id="drug-search"
                  type="text"
                  className="admin-input pl-12 pr-28 !py-4 !text-base !rounded-xl"
                  placeholder="Enter drug name (e.g. Insulin, Coartem, Amoxicillin)..."
                  value={drugQuery}
                  onChange={(e) => {
                    setDrugQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => drugQuery.trim() && setShowSuggestions(true)}
                  onKeyDown={handleKeyDown}
                  autoComplete="off"
                  aria-expanded={showSuggestions && filteredSuggestions.length > 0}
                  aria-haspopup="listbox"
                  aria-controls="drug-suggestions"
                />
                <button
                  type="button"
                  onClick={handleSearch}
                  disabled={!drugQuery.trim() || isSearching}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-[#C9A84C] to-[#A8893A] text-gray-950 hover:from-[#E8D48B] hover:to-[#C9A84C] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                >
                  {isSearching ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="animate-spin w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Searching
                    </span>
                  ) : (
                    "Search"
                  )}
                </button>
              </div>

              {/* Autocomplete suggestions */}
              {showSuggestions && filteredSuggestions.length > 0 && (
                <ul
                  ref={suggestionsRef}
                  id="drug-suggestions"
                  role="listbox"
                  className="absolute z-30 left-0 right-0 mt-2 dark-glass rounded-xl overflow-hidden shadow-xl shadow-black/30"
                >
                  {filteredSuggestions.map((drug) => (
                    <li
                      key={drug}
                      role="option"
                      aria-selected={drugQuery === drug}
                      className="px-4 py-3 text-sm text-warm-100 hover:bg-[#C9A84C]/10 cursor-pointer transition-colors border-b border-gray-800/30 last:border-b-0 font-body"
                      onClick={() => handleDrugSelect(drug)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleDrugSelect(drug);
                      }}
                      tabIndex={0}
                    >
                      <span className="font-medium">{drug}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Location row */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Use My Location button */}
              <button
                type="button"
                onClick={handleUseLocation}
                disabled={locating}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-gray-800 text-[#E8D48B] hover:bg-gray-700 ring-1 ring-[#C9A84C]/20 hover:ring-[#C9A84C]/40 transition-all duration-200 disabled:opacity-60"
              >
                {locating ? (
                  <>
                    <svg
                      className="animate-spin w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Locating...
                  </>
                ) : (
                  <>
                    <CrosshairIcon className="w-4 h-4" />
                    Use My Location
                  </>
                )}
              </button>

              <span className="text-gray-600 dark:text-gray-500 text-sm font-body hidden sm:inline">
                or
              </span>

              {/* Region dropdown */}
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="admin-select flex-1"
                aria-label="Select region"
              >
                <option value="">Select Region</option>
                {GHANA_REGIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Location status */}
            {(userLocation || locationError) && (
              <div className="mt-3 text-sm font-body">
                {userLocation && (
                  <p className="text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Location acquired ({userLocation.lat.toFixed(4)},{" "}
                    {userLocation.lng.toFixed(4)})
                  </p>
                )}
                {locationError && (
                  <p className="text-red-400 flex items-center gap-1.5">
                    <AlertTriangleIcon className="w-3.5 h-3.5 shrink-0" />
                    {locationError}
                  </p>
                )}
              </div>
            )}
          </div>
        </section>

        {/* ── Filter Bar ─────────────────────────────────────── */}
        {hasSearched && (
          <section
            aria-label="Filters and sorting"
            className="mb-6 animate-stagger"
            style={{ animationDelay: "50ms" }}
          >
            <div className="dark-glass rounded-xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex items-center gap-2 text-gray-400 text-sm font-body shrink-0">
                <FilterIcon className="w-4 h-4 text-[#C9A84C]" />
                <span>Sort &amp; Filter</span>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
                {/* Sort by */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="admin-select text-sm"
                  aria-label="Sort results by"
                >
                  <option value="distance">Sort by Distance</option>
                  <option value="price">Sort by Price</option>
                  <option value="availability">Sort by Availability</option>
                </select>

                {/* In-stock toggle */}
                <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
                  <span className="relative">
                    <input
                      type="checkbox"
                      checked={onlyInStock}
                      onChange={(e) => setOnlyInStock(e.target.checked)}
                      className="sr-only peer"
                    />
                    <span className="block w-10 h-6 rounded-full bg-gray-700 peer-checked:bg-[#C9A84C] transition-colors duration-200" />
                    <span className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 peer-checked:translate-x-4" />
                  </span>
                  <span className="text-sm text-gray-300 font-body whitespace-nowrap">
                    Only show in-stock
                  </span>
                </label>
              </div>

              {/* Result count */}
              <span className="text-xs text-gray-500 font-body shrink-0">
                {pharmacyResults.length} result
                {pharmacyResults.length !== 1 ? "s" : ""}
              </span>
            </div>
          </section>
        )}

        {/* ── Results List ───────────────────────────────────── */}
        {hasSearched && (
          <section aria-label="Pharmacy results">
            {/* Selected drug heading */}
            <div className="mb-5 flex items-center gap-3">
              <h2 className="font-display text-xl sm:text-2xl gold-text">
                Results for &ldquo;{selectedDrug}&rdquo;
              </h2>
              {isCriticalDrug && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-red-900/50 text-red-300 ring-1 ring-red-500/40 animate-pulse">
                  <AlertTriangleIcon className="w-3 h-3" />
                  Critical
                </span>
              )}
            </div>

            {isSearching ? (
              /* Loading skeleton */
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="dark-glass rounded-xl p-5 animate-pulse">
                    <div className="flex items-start justify-between mb-3">
                      <div className="space-y-2 flex-1">
                        <div className="h-5 w-40 bg-gray-800 rounded" />
                        <div className="h-4 w-56 bg-gray-800/60 rounded" />
                      </div>
                      <div className="h-6 w-20 bg-gray-800 rounded-full" />
                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="h-10 bg-gray-800/40 rounded" />
                      <div className="h-10 bg-gray-800/40 rounded" />
                      <div className="h-10 bg-gray-800/40 rounded" />
                    </div>
                    <div className="flex gap-2.5 pt-3 border-t border-gray-800/50">
                      <div className="h-10 flex-1 bg-gray-800/40 rounded-lg" />
                      <div className="h-10 w-28 bg-gray-800/40 rounded-lg" />
                    </div>
                  </div>
                ))}
              </div>
            ) : pharmacyResults.length === 0 ? (
              /* No results */
              <div className="dark-glass rounded-2xl border border-white/5 p-8 text-center">
                <svg className="w-12 h-12 mx-auto text-[#C9A84C]/40 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                <h3 className="font-display text-lg font-bold text-warm-800 dark:text-warm-200 mb-2">No Pharmacies Found</h3>
                <p className="text-sm text-warm-500 dark:text-warm-400 max-w-md mx-auto">No pharmacy stock data available yet. For emergencies, call <strong className="text-[#C9A84C]">193</strong> (Ghana Ambulance).</p>
              </div>
            ) : (
              /* Pharmacy cards */
              <div className="space-y-4">
                {pharmacyResults.map((pharmacy, index) => (
                  <PharmacyResultCard
                    key={pharmacy.id}
                    pharmacy={pharmacy}
                    index={index}
                    drugName={selectedDrug}
                  />
                ))}
              </div>
            )}

            {/* Disclaimer */}
            {pharmacyResults.length > 0 && (
              <p className="mt-6 text-xs text-gray-500 font-body text-center max-w-lg mx-auto">
                Stock availability and prices are approximate and may change
                without notice. Always call the pharmacy to confirm before
                visiting.
              </p>
            )}
          </section>
        )}

        {/* ── Empty state (before search) ────────────────────── */}
        {!hasSearched && (
          <section className="text-center py-12 sm:py-16">
            <div className="dark-glass rounded-2xl p-8 sm:p-12 max-w-lg mx-auto">
              <div className="relative inline-flex items-center justify-center mb-6">
                <span className="absolute w-16 h-16 rounded-full bg-[#C9A84C]/10 animate-ping" />
                <SearchIcon className="w-10 h-10 text-[#C9A84C] relative" />
              </div>
              <h2 className="font-display text-2xl text-warm-100 mb-3">
                Search for a medicine
              </h2>
              <p className="font-body text-gray-400 text-sm mb-6">
                Enter the name of the drug you need. We will find pharmacies
                near you that have it in stock right now.
              </p>

              {/* Quick picks */}
              <div className="space-y-2">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-body">
                  Common searches
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {DRUG_SUGGESTIONS.slice(0, 6).map((drug) => (
                    <button
                      key={drug}
                      type="button"
                      onClick={() => {
                        setDrugQuery(drug);
                        setSelectedDrug(drug);
                        handleDrugSelect(drug);
                        // Auto-search
                        setTimeout(() => {
                          setIsSearching(true);
                          setTimeout(() => {
                            setHasSearched(true);
                            setIsSearching(false);
                          }, 800);
                        }, 100);
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-body text-[#E8D48B] bg-gray-800/80 hover:bg-gray-700 ring-1 ring-[#C9A84C]/15 hover:ring-[#C9A84C]/30 transition-all duration-200"
                    >
                      {drug}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
