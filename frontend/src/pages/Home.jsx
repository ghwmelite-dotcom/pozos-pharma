import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import useChatStore from "../store/chatStore";
import useAuth from "../hooks/useAuth";
import TopicRooms from "../components/Community/TopicRooms";
import FAQPanel from "../components/Community/FAQPanel";
import LoginModal from "../components/Auth/LoginModal";
import RegisterModal from "../components/Auth/RegisterModal";
import ForgotPasswordModal from "../components/Auth/ForgotPasswordModal";
import DrugOfTheWeek from "../components/Education/DrugOfTheWeek";

/* Floating Adinkra particle */
function FloatingSymbol({ delay, duration, x, y, size, symbol, opacity }) {
  return (
    <div
      className="absolute pointer-events-none hero-float"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
        opacity,
      }}
    >
      <svg className="text-[#C9A84C]" width={size} height={size} viewBox="0 0 40 40" fill="currentColor" style={{ opacity: 0.6 }}>
        {symbol === "cross" && <path d="M16 4h8v12h12v8H24v12h-8V24H4v-8h12V4z" />}
        {symbol === "gye" && <path d="M20 6C13 6 8 11 8 18c0 5 3 8 6 10l-2 5 8-3 8 3-2-5c3-2 6-5 6-10 0-7-5-12-12-12zm-3 8s2-3 3-3 3 3 3 3 2 3 0 5-3 4-3 4-1-1-3-4c-2-2 0-5 0-5z" />}
        {symbol === "diamond" && <path d="M20 4L36 20 20 36 4 20z M20 12L28 20 20 28 12 20z" fillRule="evenodd" />}
        {symbol === "dot" && <circle cx="20" cy="20" r="4" />}
      </svg>
    </div>
  );
}

/* Orbiting ring dot */
function OrbitDot({ size, color, orbitClass, delay }) {
  return (
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ animationDelay: delay }}>
      <div className={orbitClass} style={{ animationDelay: delay }}>
        <div className="rounded-full" style={{ width: size, height: size, background: color }} />
      </div>
    </div>
  );
}

export default function Home() {
  const fetchRooms = useChatStore((s) => s.fetchRooms);
  const { isAuthenticated } = useAuth();

  const [searchParams, setSearchParams] = useSearchParams();
  const [showLogin, setShowLogin] = useState(searchParams.get("login") === "true");
  const [showRegister, setShowRegister] = useState(searchParams.get("register") === "true");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const heroRef = useRef(null);

  useEffect(() => { fetchRooms(); }, [fetchRooms]);

  useEffect(() => {
    if (searchParams.get("login") === "true" && !showLogin) setShowLogin(true);
    if (searchParams.get("register") === "true" && !showRegister) setShowRegister(true);
  }, [searchParams]);

  const openLogin = () => { setShowRegister(false); setShowLogin(true); };
  const openRegister = () => { setShowLogin(false); setShowRegister(true); };
  const openForgotPassword = () => { setShowLogin(false); setShowRegister(false); setShowForgotPassword(true); };
  const closeModals = () => { setShowLogin(false); setShowRegister(false); setShowForgotPassword(false); setSearchParams({}); };

  // Parallax mouse tracking
  const handleMouseMove = (e) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  return (
    <div className="space-y-16 pb-16">
      {/* ── Hero Section ─────────────────────────────────── */}
      <section
        ref={heroRef}
        onMouseMove={handleMouseMove}
        className="relative overflow-hidden rounded-2xl bg-gray-900 text-white py-24 sm:py-32 px-6 sm:px-12"
      >
        {/* Background layers */}
        <div className="absolute inset-0 kente-weave" />
        <div className="absolute inset-0 noise-overlay" />

        {/* Animated glow blobs that follow mouse subtly */}
        <div
          className="absolute w-[600px] h-[600px] rounded-full hero-glow-pulse pointer-events-none"
          style={{
            left: `${mousePos.x * 0.6}%`,
            top: `${mousePos.y * 0.6}%`,
            transform: "translate(-50%, -50%)",
            background: "radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%)",
            transition: "left 0.8s ease-out, top 0.8s ease-out",
          }}
        />

        {/* Morphing blob background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#C9A84C]/[0.04] hero-morph-blob pointer-events-none" />

        {/* Color accent blobs */}
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-ghana-green/[0.04] blur-[80px] hero-drift pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-ghana-red/[0.04] blur-[80px] hero-drift pointer-events-none" style={{ animationDelay: "4s" }} />
        <div className="absolute -top-20 right-1/4 w-60 h-60 rounded-full bg-[#C9A84C]/[0.03] blur-[60px] hero-glow-pulse pointer-events-none" style={{ animationDelay: "2s" }} />

        {/* Floating Adinkra particles */}
        <FloatingSymbol delay={0} duration={7} x={8} y={20} size={20} symbol="cross" opacity={0.12} />
        <FloatingSymbol delay={1.5} duration={9} x={85} y={15} size={16} symbol="gye" opacity={0.1} />
        <FloatingSymbol delay={3} duration={8} x={15} y={70} size={14} symbol="diamond" opacity={0.08} />
        <FloatingSymbol delay={0.5} duration={10} x={90} y={65} size={18} symbol="cross" opacity={0.1} />
        <FloatingSymbol delay={2} duration={6} x={50} y={85} size={12} symbol="dot" opacity={0.15} />
        <FloatingSymbol delay={4} duration={11} x={70} y={10} size={22} symbol="diamond" opacity={0.06} />
        <FloatingSymbol delay={1} duration={7.5} x={30} y={12} size={10} symbol="dot" opacity={0.2} />
        <FloatingSymbol delay={3.5} duration={8.5} x={5} y={50} size={16} symbol="gye" opacity={0.07} />
        <FloatingSymbol delay={2.5} duration={9.5} x={60} y={80} size={14} symbol="cross" opacity={0.09} />
        <FloatingSymbol delay={5} duration={12} x={40} y={5} size={18} symbol="gye" opacity={0.05} />

        {/* Top kente accent */}
        <div className="absolute top-0 inset-x-0 h-[3px] flex">
          <div className="flex-1 bg-ghana-red/60" />
          <div className="flex-1 bg-ghana-gold/60" />
          <div className="flex-1 bg-ghana-green/60" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          {/* Gye Nyame symbol with pulsing rings */}
          <div className="relative mx-auto w-20 h-20 mb-8">
            {/* Pulse rings */}
            <div className="absolute inset-0 rounded-full border border-[#C9A84C]/20 hero-pulse-ring" />
            <div className="absolute -inset-3 rounded-full border border-[#C9A84C]/10 hero-pulse-ring" style={{ animationDelay: "0.8s" }} />
            <div className="absolute -inset-6 rounded-full border border-[#C9A84C]/5 hero-pulse-ring" style={{ animationDelay: "1.6s" }} />

            {/* Orbiting dots */}
            <OrbitDot size="4px" color="#C9A84C" orbitClass="hero-orbit-slow" delay="0s" />
            <OrbitDot size="3px" color="#E8D48B" orbitClass="hero-orbit-fast" delay="2s" />
            <OrbitDot size="2px" color="rgba(201,168,76,0.5)" orbitClass="hero-orbit-slow" delay="5s" />

            {/* Icon */}
            <div className="absolute inset-0 rounded-full bg-[#C9A84C]/10 backdrop-blur-sm flex items-center justify-center ring-1 ring-[#C9A84C]/25 hero-reveal" style={{ animationDelay: "0.1s" }}>
              <svg className="w-10 h-10 text-[#C9A84C]" viewBox="0 0 60 60" fill="currentColor">
                <path d="M30 10C20 10 12 18 12 28c0 7 4 12 10 15l-4 7 12-5 12 5-4-7c6-3 10-8 10-15 0-10-8-18-18-18zm-5 12s3-4 5-4 5 4 5 4 3 4 0 8c-3 4-5 6-5 6s-2-2-5-6c-3-4 0-8 0-8z" />
              </svg>
            </div>
          </div>

          <p className="text-[11px] font-body font-semibold text-[#C9A84C] uppercase tracking-[0.3em] mb-4 hero-reveal" style={{ animationDelay: "0.2s" }}>
            Ghana's Trusted Pharmaceutical Community
          </p>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display tracking-tight leading-[1.1] hero-title-reveal" style={{ animationDelay: "0.35s" }}>
            Welcome to <br />
            <span className="hero-shimmer-text">PozosPharma</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-gray-300 max-w-xl mx-auto leading-relaxed font-body hero-reveal" style={{ animationDelay: "0.5s" }}>
            Get instant, AI-powered pharmaceutical guidance from PozosBot, or connect
            with verified pharmacists registered with the Pharmacy Council of Ghana.
          </p>

          {/* Animated feature pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8 hero-reveal" style={{ animationDelay: "0.65s" }}>
            {[
              { icon: "M10 2a1 1 0 011 1v1.07A7.002 7.002 0 0117 11v2a3 3 0 01-3 3H6a3 3 0 01-3-3v-2a7.002 7.002 0 016-6.93V3a1 1 0 011-1z", label: "AI-Powered" },
              { icon: "M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001z", label: "Verified Pharmacists" },
              { icon: "M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z", label: "Encrypted" },
            ].map((pill, i) => (
              <span
                key={pill.label}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-body font-medium text-[#C9A84C]/80 bg-[#C9A84C]/[0.06] border border-[#C9A84C]/10 backdrop-blur-sm animate-stagger"
                style={{ animationDelay: `${0.8 + i * 0.1}s` }}
              >
                <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><path d={pill.icon} /></svg>
                {pill.label}
              </span>
            ))}
          </div>

          {!isAuthenticated && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10 hero-reveal" style={{ animationDelay: "0.8s" }}>
              <button
                onClick={openRegister}
                className="hero-cta-glow group relative px-8 py-3.5 text-sm font-body font-semibold text-gray-900 bg-[#C9A84C] hover:bg-[#E8D48B] rounded-xl transition-all shadow-lg shadow-[#C9A84C]/25 hover:shadow-[#C9A84C]/40 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Get Started Free
                  <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
              </button>
              <button
                onClick={openLogin}
                className="group px-8 py-3.5 text-sm font-body font-medium text-gray-300 border border-white/15 hover:border-[#C9A84C]/40 hover:text-[#C9A84C] rounded-xl transition-all hover:bg-[#C9A84C]/5"
              >
                <span className="flex items-center gap-2">
                  Sign In
                  <svg className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Bottom kente accent */}
        <div className="absolute bottom-0 inset-x-0 h-[3px] flex">
          <div className="flex-1 bg-ghana-red/60" />
          <div className="flex-1 bg-ghana-gold/60" />
          <div className="flex-1 bg-ghana-green/60" />
        </div>
      </section>

      {/* ── PozosBot AI Introduction ────────────────────── */}
      <section className="max-w-3xl mx-auto text-center px-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C9A84C]/5 dark:bg-[#C9A84C]/10 border border-[#C9A84C]/15 text-[#7A6520] dark:text-[#C9A84C] text-sm font-body font-medium mb-5">
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 2a1 1 0 011 1v1.07A7.002 7.002 0 0117 11v2a3 3 0 01-3 3H6a3 3 0 01-3-3v-2a7.002 7.002 0 016-6.93V3a1 1 0 011-1z" />
          </svg>
          Powered by PozosBot AI
        </div>
        <h2 className="text-2xl font-display text-gray-900 dark:text-white">
          Your AI Pharmaceutical Assistant
        </h2>
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-body max-w-lg mx-auto">
          PozosBot uses advanced AI to provide instant, evidence-based pharmaceutical
          guidance. Ask about medications, drug interactions, dosages, and more. When you need
          professional advice, PozosBot seamlessly connects you with a verified pharmacist.
        </p>
      </section>

      {/* ── Topic Rooms ─────────────────────────────────── */}
      <TopicRooms />

      {/* ── Stats Bar ───────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-2xl bg-warm-50 dark:bg-gray-900 border border-warm-200/60 dark:border-gray-800 py-10 px-6">
        <div className="absolute inset-0 kente-pattern-bg" />
        <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto text-center">
          {[
            {
              icon: <svg className="w-7 h-7" viewBox="0 0 20 20" fill="currentColor"><path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" /></svg>,
              title: "Open Community",
              desc: "Join free, ask anything",
            },
            {
              icon: <svg className="w-7 h-7" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>,
              title: "Verified Pharmacists",
              desc: "PSGH-registered professionals",
            },
            {
              icon: <span className="text-2xl font-display font-bold">AI</span>,
              title: "Powered by Advanced AI",
              desc: "Instant pharmaceutical guidance",
            },
          ].map((stat, i) => (
            <div key={i} className="animate-stagger" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="flex items-center justify-center text-[#C9A84C] mb-2">{stat.icon}</div>
              <p className="text-sm font-body font-semibold text-gray-800 dark:text-gray-200">{stat.title}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-body">{stat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Drug of the Week ────────────────────────────── */}
      <DrugOfTheWeek />

      {/* ── FAQ Section ─────────────────────────────────── */}
      <FAQPanel />

      {/* ── Trust Footer ────────────────────────────────── */}
      <section className="max-w-3xl mx-auto text-center px-4 pb-4">
        <div className="relative overflow-hidden rounded-2xl bg-warm-50 dark:bg-gray-900 border border-warm-200/60 dark:border-gray-800 p-8">
          {/* Gold top line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C9A84C]/50 to-transparent" />

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-600 dark:text-gray-400 font-body">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-ghana-green shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Registered with Pharmacy Council of Ghana</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[#C9A84C] shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span>All messages encrypted</span>
            </div>
          </div>

          <p className="mt-5 text-xs text-gray-600 dark:text-gray-500 italic font-display">
            &ldquo;Gye Nyame&rdquo; &mdash; Except God. We put your health and safety first.
          </p>

          {/* Bottom kente */}
          <div className="absolute bottom-0 left-0 right-0 h-[2px] flex">
            <div className="flex-1 bg-ghana-red/30" />
            <div className="flex-1 bg-ghana-gold/30" />
            <div className="flex-1 bg-ghana-green/30" />
          </div>
        </div>
      </section>

      {/* ── Auth Modals ─────────────────────────────────── */}
      <LoginModal isOpen={showLogin} onClose={closeModals} onSwitchToRegister={openRegister} onForgotPassword={openForgotPassword} />
      <RegisterModal isOpen={showRegister} onClose={closeModals} onSwitchToLogin={openLogin} />
      <ForgotPasswordModal isOpen={showForgotPassword} onClose={closeModals} onBackToLogin={openLogin} />
    </div>
  );
}
