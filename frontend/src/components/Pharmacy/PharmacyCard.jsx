import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "";

export default function PharmacyCard({ pharmacy, onSelect }) {
  const [stockOpen, setStockOpen] = useState(false);
  const [stock, setStock] = useState(null);
  const [loadingStock, setLoadingStock] = useState(false);

  const handleViewStock = async () => {
    if (stockOpen) {
      setStockOpen(false);
      return;
    }
    setStockOpen(true);
    if (stock) return;
    setLoadingStock(true);
    try {
      const res = await fetch(`${API_URL}/api/pharmacies/${pharmacy.id}/stock`);
      const data = await res.json();
      setStock(data.stock || []);
    } catch {
      setStock([]);
    } finally {
      setLoadingStock(false);
    }
  };

  const directionsUrl = pharmacy.lat && pharmacy.lng
    ? `https://www.google.com/maps/dir/?api=1&destination=${pharmacy.lat},${pharmacy.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pharmacy.name + ' ' + pharmacy.city + ' Ghana')}`;

  return (
    <div
      className="bg-warm-50 dark:bg-surface-card-dark border border-warm-200/60 dark:border-gray-700 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onSelect?.(pharmacy)}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 truncate text-base">
            {pharmacy.name}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
            {pharmacy.address}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-500">
            {pharmacy.city}, {pharmacy.region}
          </p>
        </div>
        {pharmacy.distance_km != null && (
          <span className="shrink-0 inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {pharmacy.distance_km} km
          </span>
        )}
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5 mt-3">
        {pharmacy.nhis_accepted === 1 && (
          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-full border border-emerald-200 dark:border-emerald-800">
            NHIS
          </span>
        )}
        {pharmacy.is_partner === 1 && (
          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-full border border-indigo-200 dark:border-indigo-800">
            Partner
          </span>
        )}
      </div>

      {/* Phone & Hours */}
      <div className="mt-3 space-y-1">
        {pharmacy.phone && (
          <div className="flex items-center gap-2 text-sm">
            <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <a
              href={`tel:${pharmacy.phone}`}
              className="text-brand-indigo dark:text-indigo-400 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {pharmacy.phone}
            </a>
          </div>
        )}
        {pharmacy.hours && (
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{pharmacy.hours}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-warm-200 dark:border-gray-700">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); handleViewStock(); }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          {stockOpen ? "Hide Stock" : "View Stock"}
        </button>
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-brand-indigo/10 dark:bg-indigo-900/20 text-brand-indigo dark:text-indigo-300 hover:bg-brand-indigo/20 dark:hover:bg-indigo-900/40 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          Get Directions
        </a>
      </div>

      {/* Stock Section */}
      {stockOpen && (
        <div className="mt-3 pt-3 border-t border-warm-200 dark:border-gray-700" onClick={(e) => e.stopPropagation()}>
          {loadingStock ? (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
              Loading stock...
            </div>
          ) : stock && stock.length > 0 ? (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Available Medications</h3>
              {stock.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-warm-100 dark:bg-gray-800/50 text-sm"
                >
                  <div>
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      {item.generic_name || item.drug_id}
                    </span>
                    {item.brand_names && (
                      <span className="ml-1.5 text-xs text-gray-400">({item.brand_names})</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {item.price_ghs && (
                      <span className="text-xs font-medium text-ghana-green dark:text-emerald-400">
                        GHS {item.price_ghs.toFixed(2)}
                      </span>
                    )}
                    <span className={`inline-block w-2 h-2 rounded-full ${item.in_stock ? 'bg-emerald-500' : 'bg-red-400'}`} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-400">No stock information available.</p>
          )}
        </div>
      )}
    </div>
  );
}
