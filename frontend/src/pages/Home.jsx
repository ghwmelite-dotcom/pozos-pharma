import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import useChatStore from "../store/chatStore";
import useAuth from "../hooks/useAuth";
import TopicRooms from "../components/Community/TopicRooms";
import FAQPanel from "../components/Community/FAQPanel";
import LoginModal from "../components/Auth/LoginModal";
import RegisterModal from "../components/Auth/RegisterModal";
import Button from "../components/UI/Button";

/**
 * PozosPharma Home Page
 *
 * Hero section, TopicRooms grid, stats bar, FAQPanel, and trust footer.
 * Features Kente-pattern accents and Adinkra Gye Nyame watermark.
 */
export default function Home() {
  const fetchRooms = useChatStore((s) => s.fetchRooms);
  const { isAuthenticated } = useAuth();

  const [searchParams, setSearchParams] = useSearchParams();
  const [showLogin, setShowLogin] = useState(searchParams.get("login") === "true");
  const [showRegister, setShowRegister] = useState(searchParams.get("register") === "true");

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  // Sync search params with modal state
  useEffect(() => {
    if (searchParams.get("login") === "true" && !showLogin) {
      setShowLogin(true);
    }
    if (searchParams.get("register") === "true" && !showRegister) {
      setShowRegister(true);
    }
  }, [searchParams]);

  const openLogin = () => {
    setShowRegister(false);
    setShowLogin(true);
  };

  const openRegister = () => {
    setShowLogin(false);
    setShowRegister(true);
  };

  const closeModals = () => {
    setShowLogin(false);
    setShowRegister(false);
    // Clear search params
    setSearchParams({});
  };

  return (
    <div className="space-y-12 pb-12">
      {/* ── Hero Section ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-teal-600 text-white py-16 px-6 sm:px-12 adinkra-bg-gye-nyame">
        {/* Kente top accent */}
        <div className="absolute top-0 inset-x-0 h-1.5 flex">
          <div className="flex-1 bg-ghana-red" />
          <div className="flex-1 bg-ghana-gold" />
          <div className="flex-1 bg-ghana-green" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          {/* Gye Nyame symbol */}
          <div className="mx-auto w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mb-5 ring-2 ring-white/20">
            <svg
              className="w-9 h-9 text-white"
              viewBox="0 0 60 60"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M30 10C20 10 12 18 12 28c0 7 4 12 10 15l-4 7 12-5 12 5-4-7c6-3 10-8 10-15 0-10-8-18-18-18zm-5 12s3-4 5-4 5 4 5 4 3 4 0 8c-3 4-5 6-5 6s-2-2-5-6c-3-4 0-8 0-8z" />
            </svg>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            Akwaaba! Welcome to PozosPharma
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-indigo-100 font-medium">
            Ghana&apos;s Trusted AI Pharmaceutical Community
          </p>
          <p className="mt-3 text-sm sm:text-base text-indigo-200 max-w-xl mx-auto leading-relaxed">
            Get instant, AI-powered pharmaceutical guidance from PozosBot, or connect
            with verified pharmacists registered with the Pharmacy Council of Ghana.
            Your health questions answered, 24/7.
          </p>

          {!isAuthenticated && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
              <Button
                variant="primary"
                size="lg"
                onClick={openRegister}
                className="!bg-white !text-indigo-700 hover:!bg-indigo-50 !shadow-lg"
              >
                Get Started Free
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={openLogin}
                className="!border-white/50 !text-white hover:!bg-white/10"
              >
                Sign In
              </Button>
            </div>
          )}
        </div>

        {/* Kente bottom accent */}
        <div className="absolute bottom-0 inset-x-0 h-1.5 flex">
          <div className="flex-1 bg-ghana-red" />
          <div className="flex-1 bg-ghana-gold" />
          <div className="flex-1 bg-ghana-green" />
        </div>
      </section>

      {/* ── PozosBot AI Introduction ─────────────────────────────── */}
      <section className="max-w-3xl mx-auto text-center px-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 text-brand-teal dark:text-teal-400 text-sm font-medium mb-4">
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M10 2a1 1 0 011 1v1.07A7.002 7.002 0 0117 11v2a3 3 0 01-3 3H6a3 3 0 01-3-3v-2a7.002 7.002 0 016-6.93V3a1 1 0 011-1z" />
          </svg>
          Powered by PozosBot AI
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Your AI Pharmaceutical Assistant
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          PozosBot uses Cloudflare Workers AI to provide instant, evidence-based pharmaceutical
          guidance. Ask about medications, drug interactions, dosages, and more. When you need
          professional advice, PozosBot seamlessly connects you with a verified pharmacist.
        </p>
      </section>

      {/* ── Topic Rooms ──────────────────────────────────────────── */}
      <TopicRooms />

      {/* ── Stats Bar ────────────────────────────────────────────── */}
      <section className="kente-pattern-bg rounded-xl py-8 px-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto text-center">
          <div>
            <div className="flex items-center justify-center gap-2">
              <svg className="w-7 h-7 text-brand-indigo dark:text-indigo-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-1">Open Community</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Join free, ask anything</p>
          </div>
          <div>
            <div className="flex items-center justify-center gap-2">
              <svg className="w-7 h-7 text-brand-emerald dark:text-emerald-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-1">Verified Pharmacists</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">PSGH-registered professionals</p>
          </div>
          <div>
            <div className="flex items-center justify-center gap-2">
              <p className="text-3xl font-extrabold text-brand-teal dark:text-teal-400">
                AI
              </p>
              <svg className="w-6 h-6 text-brand-teal dark:text-teal-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-1">Powered by Cloudflare AI</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Instant pharmaceutical guidance</p>
          </div>
        </div>
      </section>

      {/* ── FAQ Section ──────────────────────────────────────────── */}
      <FAQPanel />

      {/* ── Trust Footer ─────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto text-center px-4 pb-4">
        <div className="rounded-xl bg-white dark:bg-surface-card-dark border border-gray-200 dark:border-gray-700 p-6 kente-border-accent">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-600 dark:text-gray-400">
            {/* PSGH */}
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-brand-emerald shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Registered with Pharmacy Council of Ghana (PSGH)</span>
            </div>

            {/* Encrypted */}
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-brand-indigo shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span>All messages encrypted</span>
            </div>
          </div>

          {/* Gye Nyame watermark text */}
          <p className="mt-4 text-xs text-gray-400 dark:text-gray-500 italic">
            &ldquo;Gye Nyame&rdquo; &mdash; Except God. We put your health and safety first.
          </p>
        </div>
      </section>

      {/* ── Auth Modals ──────────────────────────────────────────── */}
      <LoginModal
        isOpen={showLogin}
        onClose={closeModals}
        onSwitchToRegister={openRegister}
      />
      <RegisterModal
        isOpen={showRegister}
        onClose={closeModals}
        onSwitchToLogin={openLogin}
      />
    </div>
  );
}
