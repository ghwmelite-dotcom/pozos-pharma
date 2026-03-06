import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import DrugSearch from "../components/Community/DrugSearch";
import PillIdentifier from "../components/Drugs/PillIdentifier";
import PrescriptionUpload from "../components/Drugs/PrescriptionUpload";
import { useTranslation } from "../i18n/useTranslation";

const CATEGORIES = [
  { key: "antimalarials", icon: "\u{1F99F}", query: "antimalarial" },
  { key: "antibiotics", icon: "\u{1F48A}", query: "antibiotic" },
  { key: "analgesics", icon: "\u{1FA79}", query: "analgesic pain" },
  { key: "antihypertensives", icon: "\u2764\uFE0F", query: "antihypertensive" },
  { key: "diabetes", icon: "\u{1FA78}", query: "diabetes antidiabetic" },
  { key: "otc", icon: "\u{1F3EA}", query: "over the counter" },
];

const TABS = [
  { id: "search", label: "Search", icon: (
    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
    </svg>
  )},
  { id: "pill-id", label: "Pill Identifier", icon: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
      <path d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
    </svg>
  )},
  { id: "prescription", label: "Prescription Reader", icon: (
    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 003 3.5v13A1.5 1.5 0 004.5 18h11a1.5 1.5 0 001.5-1.5V7.621a1.5 1.5 0 00-.44-1.06l-4.12-4.122A1.5 1.5 0 0011.378 2H4.5zm2.25 8.5a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5zm0 3a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z" clipRule="evenodd" />
    </svg>
  )},
];

export default function DrugDatabase() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("search");

  const handleCategoryClick = useCallback((query) => {
    const input = document.querySelector('input[aria-label="Search for medications"]');
    if (input) {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value"
      ).set;
      nativeInputValueSetter.call(input, query);
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }, []);

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl dark-glass p-8 sm:p-10 text-center">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent" />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-60 h-60 rounded-full bg-[#C9A84C]/5 blur-[80px]" />

        <div className="relative">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#C9A84C]/10 ring-1 ring-[#C9A84C]/20 mb-4">
            <svg className="w-7 h-7 text-[#C9A84C]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6V3z" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display gold-text">
            {t("drugs.title")}
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 max-w-lg mx-auto font-body">
            {t("drugs.subtitle")}
          </p>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-[3px] flex">
          <div className="flex-1 bg-ghana-red/50" />
          <div className="flex-1 bg-ghana-gold/50" />
          <div className="flex-1 bg-ghana-green/50" />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-warm-50/50 dark:bg-white/[0.03] border border-warm-200/60 dark:border-white/10" role="tablist" aria-label="Drug database tools">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-body font-medium rounded-lg transition-all ${
                activeTab === tab.id
                  ? "bg-warm-50 dark:bg-white/[0.06] text-[#7A6520] dark:text-[#C9A84C] shadow-sm ring-1 ring-[#C9A84C]/20"
                  : "text-gray-600 dark:text-gray-400 hover:text-[#7A6520] dark:hover:text-[#C9A84C] hover:bg-[#C9A84C]/5"
              }`}
              aria-selected={activeTab === tab.id}
              role="tab"
              id={`tab-${tab.id}`}
              aria-controls={`tabpanel-${tab.id}`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden text-xs">{tab.label.split(" ")[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "search" && (
        <>
          {/* Category Quick Links */}
          <div className="max-w-3xl mx-auto">
            <h2 className="text-[11px] font-body font-semibold text-[#8B7328] dark:text-[#C9A84C]/70 mb-3 uppercase tracking-[0.15em] text-center">
              {t("drugs.commonCategories")}
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => handleCategoryClick(cat.query)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-body font-medium bg-warm-50 dark:bg-white/[0.03] border border-warm-200/60 dark:border-white/10 rounded-full hover:border-[#C9A84C]/30 hover:shadow-sm transition-all text-gray-700 dark:text-gray-300 hover:text-[#7A6520] dark:hover:text-[#C9A84C]"
                >
                  <span aria-hidden="true">{cat.icon}</span>
                  <span>{t(`drugs.categories.${cat.key}`)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Interaction Checker CTA */}
          <div className="max-w-3xl mx-auto">
            <Link
              to="/interactions"
              className="block rounded-xl overflow-hidden gold-glass p-5 hover:shadow-[0_0_30px_rgba(201,168,76,0.08)] transition-all group"
            >
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C9A84C]/30 to-transparent" />
              <div className="flex items-center gap-4">
                <div className="shrink-0 w-12 h-12 rounded-full bg-[#C9A84C]/10 flex items-center justify-center group-hover:scale-110 transition-transform ring-1 ring-[#C9A84C]/20">
                  <svg className="w-6 h-6 text-[#C9A84C]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M16 3l4 4-4 4" />
                    <path d="M20 7H4" />
                    <path d="M8 21l-4-4 4-4" />
                    <path d="M4 17h16" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-display text-gray-900 dark:text-white">
                    Check Drug Interactions
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 font-body">
                    Analyze potential interactions between multiple medications with AI-powered insights
                  </p>
                </div>
                <svg className="w-5 h-5 text-[#C9A84C]/50 shrink-0 group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </Link>
          </div>

          {/* Kente accent */}
          <div className="max-w-3xl mx-auto">
            <div className="h-[2px] w-full rounded-full overflow-hidden flex">
              <div className="flex-1 bg-ghana-red/40" />
              <div className="flex-1 bg-ghana-gold/40" />
              <div className="flex-1 bg-ghana-green/40" />
            </div>
          </div>

          {/* Drug Search */}
          <div className="max-w-3xl mx-auto">
            <DrugSearch />
          </div>
        </>
      )}

      {activeTab === "pill-id" && (
        <div className="max-w-3xl mx-auto">
          <PillIdentifier />
        </div>
      )}

      {activeTab === "prescription" && (
        <div className="max-w-3xl mx-auto">
          <PrescriptionUpload />
        </div>
      )}

      {/* Disclaimer */}
      <div className="max-w-3xl mx-auto">
        <div className="rounded-xl bg-[#C9A84C]/5 dark:bg-[#C9A84C]/[0.03] border border-[#C9A84C]/20 p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-[#C9A84C] shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="text-sm font-display text-[#7A6520] dark:text-[#C9A84C]">
              {t("disclaimer.title")}
            </p>
            <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-body">
              {t("disclaimer.text")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
