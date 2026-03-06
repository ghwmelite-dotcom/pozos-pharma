import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import LoginModal from "../components/Auth/LoginModal";
import RegisterModal from "../components/Auth/RegisterModal";
import ForgotPasswordModal from "../components/Auth/ForgotPasswordModal";

const API_URL = import.meta.env.VITE_API_URL || "";

const SUBJECTS = [
  { value: "general", label: "General" },
  { value: "pharmacology", label: "Pharmacology" },
  { value: "pharmaceutics", label: "Pharmaceutics" },
  { value: "clinical-pharmacy", label: "Clinical Pharmacy" },
  { value: "pharmacognosy", label: "Pharmacognosy" },
  { value: "pharmacy-practice", label: "Pharmacy Practice" },
  { value: "pharm-chemistry", label: "Pharm. Chemistry" },
];

const DIFFICULTIES = [
  { value: "year1", label: "Year 1 Student" },
  { value: "final-year", label: "Final Year Student" },
  { value: "practicing", label: "Practicing Pharmacist" },
  { value: "researcher", label: "Researcher" },
];

const SUGGESTED_QUESTIONS = {
  general: [
    "What are the key roles of a pharmacist in Ghana?",
    "Explain the drug registration process with Ghana FDA",
    "What is the difference between OTC and prescription medicines?",
    "How does the NHIS formulary work in Ghana?",
  ],
  pharmacology: [
    "Explain the mechanism of action of ACE inhibitors",
    "What are the pharmacokinetic phases of drug action?",
    "Compare first-generation and second-generation antihistamines",
    "Describe the dose-response curve and its clinical significance",
    "What are the common adverse effects of NSAIDs?",
  ],
  pharmaceutics: [
    "What factors affect drug dissolution rate?",
    "Explain the BCS classification system",
    "What are the advantages of sustained-release formulations?",
    "Describe the role of excipients in tablet formulation",
  ],
  "clinical-pharmacy": [
    "How do you assess drug therapy problems?",
    "What is the SOAP note format for pharmaceutical care?",
    "Explain therapeutic drug monitoring for aminoglycosides",
    "What are the key drug interactions with warfarin?",
  ],
  pharmacognosy: [
    "What are the active compounds in Cryptolepis sanguinolenta?",
    "Explain the medicinal uses of Moringa oleifera in Ghana",
    "How are alkaloids classified and what are their pharmacological effects?",
    "What is the role of traditional medicine regulation in Ghana?",
  ],
  "pharmacy-practice": [
    "What are the ethical obligations of pharmacists in Ghana?",
    "Explain good dispensing practices",
    "How do you counsel patients on antibiotic use?",
    "What are the requirements for opening a pharmacy in Ghana?",
  ],
  "pharm-chemistry": [
    "Explain structure-activity relationships of beta-lactam antibiotics",
    "What is the role of chirality in drug action?",
    "Describe the chemical basis of drug metabolism",
    "How do prodrugs work and give examples",
  ],
};

/* Simple markdown renderer using regex */
function renderMarkdown(text) {
  if (!text) return null;
  const lines = text.split("\n");
  const elements = [];
  let listItems = [];
  let listType = null;
  let key = 0;

  const flushList = () => {
    if (listItems.length > 0) {
      if (listType === "ol") {
        elements.push(<ol key={key++} className="list-decimal list-inside space-y-1 my-2 text-sm">{listItems}</ol>);
      } else {
        elements.push(<ul key={key++} className="list-disc list-inside space-y-1 my-2 text-sm">{listItems}</ul>);
      }
      listItems = [];
      listType = null;
    }
  };

  const inlineFormat = (str) => {
    const parts = [];
    let remaining = str;
    let i = 0;
    // bold
    remaining = remaining.replace(/\*\*(.+?)\*\*/g, (_, m) => `<b>${m}</b>`);
    // code
    remaining = remaining.replace(/`([^`]+)`/g, (_, m) => `<code class="px-1.5 py-0.5 rounded bg-white/10 text-[#E8D48B] text-xs font-mono">${m}</code>`);
    return <span key={i++} dangerouslySetInnerHTML={{ __html: remaining }} />;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // headings
    if (line.startsWith("### ")) {
      flushList();
      elements.push(<h4 key={key++} className="text-sm font-semibold text-[#E8D48B] mt-3 mb-1">{inlineFormat(line.slice(4))}</h4>);
      continue;
    }
    if (line.startsWith("## ")) {
      flushList();
      elements.push(<h3 key={key++} className="text-base font-semibold text-[#E8D48B] mt-3 mb-1 font-display">{inlineFormat(line.slice(3))}</h3>);
      continue;
    }
    if (line.startsWith("# ")) {
      flushList();
      elements.push(<h2 key={key++} className="text-lg font-bold text-[#E8D48B] mt-3 mb-1 font-display">{inlineFormat(line.slice(2))}</h2>);
      continue;
    }

    // bullet list
    if (/^[-*]\s/.test(line)) {
      if (listType !== "ul") flushList();
      listType = "ul";
      listItems.push(<li key={key++}>{inlineFormat(line.slice(2))}</li>);
      continue;
    }

    // numbered list
    if (/^\d+\.\s/.test(line)) {
      if (listType !== "ol") flushList();
      listType = "ol";
      listItems.push(<li key={key++}>{inlineFormat(line.replace(/^\d+\.\s/, ""))}</li>);
      continue;
    }

    // empty line
    if (line.trim() === "") {
      flushList();
      elements.push(<div key={key++} className="h-2" />);
      continue;
    }

    // paragraph
    flushList();
    elements.push(<p key={key++} className="text-sm leading-relaxed my-1">{inlineFormat(line)}</p>);
  }
  flushList();
  return elements;
}

/* Typing indicator */
function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 rounded-full bg-[#C9A84C]"
          style={{
            animation: "bounce 1.2s infinite",
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-8px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

/* Paywall Modal */
function PaywallModal({ isOpen, onClose, onSubscribe, loading: subLoading }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="dark-glass rounded-2xl max-w-md w-full p-6 border border-[#C9A84C]/20 relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#C9A84C]/10 flex items-center justify-center mb-3 ring-1 ring-[#C9A84C]/20">
            <svg className="w-7 h-7 text-[#C9A84C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
            </svg>
          </div>
          <h3 className="text-xl font-display text-white mb-1">Upgrade to Premium</h3>
          <p className="text-sm text-gray-400 font-body">Unlock the full power of your AI Pharmacy Tutor</p>
        </div>

        <div className="space-y-3 mb-6">
          {[
            "Unlimited daily questions",
            "Exam preparation mode with practice questions",
            "Voice input for hands-free studying",
            "Full conversation history access",
            "Priority response times",
          ].map((benefit) => (
            <div key={benefit} className="flex items-start gap-2.5">
              <svg className="w-5 h-5 text-[#C9A84C] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              <span className="text-sm text-gray-300 font-body">{benefit}</span>
            </div>
          ))}
        </div>

        <div className="text-center mb-4">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-3xl font-display font-bold gold-text">GHS 50</span>
            <span className="text-sm text-gray-400 font-body">/month</span>
          </div>
        </div>

        <button
          onClick={onSubscribe}
          disabled={subLoading}
          className="w-full py-3 bg-[#C9A84C] text-gray-950 font-semibold rounded-lg hover:bg-[#E8D48B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-body"
        >
          {subLoading ? "Processing..." : "Subscribe with Paystack"}
        </button>
        <p className="text-xs text-gray-500 text-center mt-3 font-body">Cancel anytime. Secure payment via Paystack.</p>
      </div>
    </div>
  );
}

/* Toast component */
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-20 right-4 z-[60] flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg backdrop-blur-sm border transition-all animate-slide-in ${
      type === "success"
        ? "bg-green-900/80 border-green-500/30 text-green-200"
        : type === "error"
        ? "bg-red-900/80 border-red-500/30 text-red-200"
        : "bg-gray-900/80 border-gray-500/30 text-gray-200"
    }`}>
      {type === "success" && (
        <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
      )}
      <span className="text-sm font-body">{message}</span>
      <button onClick={onClose} className="ml-2 text-current/60 hover:text-current">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
      <style>{`
        @keyframes slide-in { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
      `}</style>
    </div>
  );
}

export default function AITutor() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, token } = useAuth();

  // Auth modals
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Chat state
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);

  // Settings
  const [subject, setSubject] = useState("general");
  const [difficulty, setDifficulty] = useState("year1");
  const [examPrep, setExamPrep] = useState(false);

  // Usage
  const [usage, setUsage] = useState({ count: 0, limit: 10, isPremium: false });

  // History
  const [conversations, setConversations] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Paywall
  const [showPaywall, setShowPaywall] = useState(false);
  const [subLoading, setSubLoading] = useState(false);

  // Voice
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // Toast
  const [toast, setToast] = useState(null);

  // Refs
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auth gate
  useEffect(() => {
    if (!isAuthenticated) {
      setShowLogin(true);
    } else {
      setShowLogin(false);
      setShowRegister(false);
    }
  }, [isAuthenticated]);

  // Check payment success on mount
  useEffect(() => {
    if (searchParams.get("payment") === "success") {
      setToast({ message: "Subscription activated! You now have premium access.", type: "success" });
      fetchUsage();
      // Clean URL
      window.history.replaceState({}, "", "/ai-tutor");
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch usage on auth
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchUsage();
      fetchHistory();
    }
  }, [isAuthenticated, token]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const fetchUsage = async () => {
    try {
      const res = await fetch(`${API_URL}/api/tutor/usage`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUsage({
          count: data.usage || 0,
          limit: data.limit || 10,
          isPremium: data.isPremium || false,
        });
      }
    } catch (err) {
      console.error("[AITutor] fetchUsage error:", err);
    }
  };

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/tutor/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
        if (data.isPremium !== undefined) {
          setUsage((prev) => ({ ...prev, isPremium: data.isPremium }));
        }
      }
    } catch (err) {
      console.error("[AITutor] fetchHistory error:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const loadConversation = async (convId) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/tutor/history/${convId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
        setConversationId(convId);
        if (data.conversation?.subject) setSubject(data.conversation.subject);
        if (data.conversation?.difficulty) setDifficulty(data.conversation.difficulty);
      }
    } catch (err) {
      console.error("[AITutor] loadConversation error:", err);
    } finally {
      setLoading(false);
      setSidebarOpen(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setConversationId(null);
    setInput("");
    setSidebarOpen(false);
  };

  const sendMessage = async (text) => {
    const messageText = text || input.trim();
    if (!messageText || loading) return;

    const userMessage = { id: Date.now(), role: "user", content: messageText };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const body = { message: messageText, subject, difficulty };
      if (conversationId) body.conversationId = conversationId;
      if (examPrep) body.examPrep = true;

      const res = await fetch(`${API_URL}/api/tutor/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (res.status === 429) {
        const data = await res.json();
        setUsage((prev) => ({ ...prev, count: data.usage || prev.limit, limit: data.limit || prev.limit }));
        setShowPaywall(true);
        setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
        return;
      }

      if (res.status === 403) {
        setShowPaywall(true);
        setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
        return;
      }

      if (!res.ok) throw new Error("Failed to send message");

      const data = await res.json();
      if (data.conversationId) setConversationId(data.conversationId);
      if (data.message) {
        setMessages((prev) => [...prev, data.message]);
      }
      if (data.usage) {
        setUsage({
          count: data.usage.count || 0,
          limit: data.usage.limit || 10,
          isPremium: data.usage.isPremium || false,
        });
      }
    } catch (err) {
      console.error("[AITutor] sendMessage error:", err);
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), role: "assistant", content: "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    setSubLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/tutor/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.authorization_url) {
          window.location.href = data.authorization_url;
        }
      } else {
        setToast({ message: "Failed to initiate subscription. Please try again.", type: "error" });
      }
    } catch (err) {
      console.error("[AITutor] subscribe error:", err);
      setToast({ message: "Subscription error. Please try again.", type: "error" });
    } finally {
      setSubLoading(false);
    }
  };

  const startVoiceInput = () => {
    if (!usage.isPremium) {
      setShowPaywall(true);
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setToast({ message: "Voice input is not supported in your browser.", type: "error" });
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-GH";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognitionRef.current = recognition;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => prev + (prev ? " " : "") + transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
    setIsListening(true);
  };

  const handleExamPrepToggle = () => {
    if (!usage.isPremium) {
      setShowPaywall(true);
      return;
    }
    setExamPrep(!examPrep);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Auth modal handlers
  const closeModals = () => {
    setShowLogin(false);
    setShowRegister(false);
    setShowForgotPassword(false);
    if (!isAuthenticated) navigate("/");
  };
  const switchToRegister = () => { setShowLogin(false); setShowForgotPassword(false); setShowRegister(true); };
  const switchToLogin = () => { setShowRegister(false); setShowForgotPassword(false); setShowLogin(true); };
  const switchToForgotPassword = () => { setShowLogin(false); setShowRegister(false); setShowForgotPassword(true); };

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#C9A84C]/10 dark:bg-[#C9A84C]/15 flex items-center justify-center mb-3 ring-1 ring-[#C9A84C]/20">
            <svg className="w-7 h-7 text-[#C9A84C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          </div>
          <h2 className="text-lg font-display text-gray-900 dark:text-white">Sign in to use the AI Tutor</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-body">Your personal pharmacy study companion</p>
        </div>
        <LoginModal isOpen={showLogin} onClose={closeModals} onSwitchToRegister={switchToRegister} onForgotPassword={switchToForgotPassword} />
        <RegisterModal isOpen={showRegister} onClose={closeModals} onSwitchToLogin={switchToLogin} />
        <ForgotPasswordModal isOpen={showForgotPassword} onClose={closeModals} onBackToLogin={switchToLogin} />
      </div>
    );
  }

  const suggested = SUGGESTED_QUESTIONS[subject] || SUGGESTED_QUESTIONS.general;
  const visibleConversations = usage.isPremium ? conversations : conversations.slice(0, 3);
  const lockedConversations = usage.isPremium ? [] : conversations.slice(3);

  return (
    <div className="h-[calc(100vh-8rem)] flex rounded-xl overflow-hidden border border-warm-200/60 dark:border-gray-800 relative">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute top-3 left-3 z-30 md:hidden p-2 rounded-lg dark-glass border border-white/10 text-gray-400 hover:text-[#C9A84C] transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>

      {/* Sidebar overlay on mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 transition-transform duration-200 fixed md:static z-30 md:z-0 w-72 h-full dark-glass border-r border-white/10 flex flex-col overflow-hidden`}>
        {/* Sidebar header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-display gold-text">AI Tutor</h2>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <button
            onClick={handleNewChat}
            className="w-full py-2 px-3 bg-[#C9A84C] text-gray-950 font-semibold rounded-lg hover:bg-[#E8D48B] transition-colors text-sm font-body flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            New Chat
          </button>
        </div>

        {/* Subject picker */}
        <div className="p-4 border-b border-white/10 space-y-3">
          <label className="block text-xs font-body font-semibold text-gray-400 uppercase tracking-wider">Subject</label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl text-sm text-warm-800 dark:text-warm-200 focus:border-[#C9A84C]/50 focus:ring-1 focus:ring-[#C9A84C]/30 py-2 px-3 font-body"
          >
            {SUBJECTS.map((s) => (
              <option key={s.value} value={s.value} className="bg-gray-900">{s.label}</option>
            ))}
          </select>

          <label className="block text-xs font-body font-semibold text-gray-400 uppercase tracking-wider">Difficulty</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl text-sm text-warm-800 dark:text-warm-200 focus:border-[#C9A84C]/50 focus:ring-1 focus:ring-[#C9A84C]/30 py-2 px-3 font-body"
          >
            {DIFFICULTIES.map((d) => (
              <option key={d.value} value={d.value} className="bg-gray-900">{d.label}</option>
            ))}
          </select>

          {/* Exam prep toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-body font-semibold text-gray-400 uppercase tracking-wider">Exam Prep</span>
              {!usage.isPremium && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/20">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
                  Premium
                </span>
              )}
            </div>
            <button
              onClick={handleExamPrepToggle}
              className={`relative w-10 h-5 rounded-full transition-colors ${examPrep ? "bg-[#C9A84C]" : "bg-white/10"}`}
            >
              <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow ${examPrep ? "translate-x-5" : ""}`} />
            </button>
          </div>
        </div>

        {/* Chat history */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          <p className="text-xs font-body font-semibold text-gray-400 uppercase tracking-wider mb-2">History</p>
          {historyLoading ? (
            <p className="text-xs text-gray-500 font-body">Loading...</p>
          ) : conversations.length === 0 ? (
            <p className="text-xs text-gray-500 font-body">No conversations yet</p>
          ) : (
            <>
              {visibleConversations.map((conv) => (
                <button
                  key={conv.id || conv._id}
                  onClick={() => loadConversation(conv.id || conv._id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-body transition-colors truncate ${
                    conversationId === (conv.id || conv._id)
                      ? "bg-[#C9A84C]/10 text-[#C9A84C]"
                      : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                  }`}
                >
                  <div className="truncate">{conv.title || conv.subject || "Chat"}</div>
                  {conv.createdAt && (
                    <div className="text-[10px] text-gray-600 mt-0.5">
                      {new Date(conv.createdAt).toLocaleDateString()}
                    </div>
                  )}
                </button>
              ))}
              {lockedConversations.length > 0 && (
                <div className="relative mt-2">
                  <div className="blur-[2px] opacity-40 space-y-1">
                    {lockedConversations.slice(0, 3).map((conv, i) => (
                      <div key={i} className="px-3 py-2 rounded-lg text-xs text-gray-500">
                        {conv.title || "Chat"}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowPaywall(true)}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-900/80 text-[#C9A84C] text-xs font-body font-semibold border border-[#C9A84C]/20">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
                      Unlock all history
                    </span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Usage counter */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-body text-gray-400">Daily usage</span>
            <span className="text-xs font-body font-semibold text-[#C9A84C]">
              {usage.isPremium ? (
                <span className="flex items-center gap-1">
                  <span className="text-lg leading-none">&#8734;</span> unlimited
                </span>
              ) : (
                `${usage.count}/${usage.limit}`
              )}
            </span>
          </div>
          {!usage.isPremium && (
            <div className="mt-2 h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full bg-[#C9A84C] transition-all"
                style={{ width: `${Math.min((usage.count / usage.limit) * 100, 100)}%` }}
              />
            </div>
          )}
          {!usage.isPremium && (
            <button
              onClick={() => setShowPaywall(true)}
              className="mt-2 w-full text-xs text-[#C9A84C] hover:text-[#E8D48B] font-body font-semibold transition-colors"
            >
              Upgrade to Premium
            </button>
          )}
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat header */}
        <div className="px-4 py-3 border-b border-white/10 dark-glass flex items-center justify-between">
          <div className="flex items-center gap-3 ml-10 md:ml-0">
            <div className="w-8 h-8 rounded-lg bg-[#C9A84C]/10 flex items-center justify-center ring-1 ring-[#C9A84C]/20">
              <svg className="w-5 h-5 text-[#C9A84C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-display text-white">AI Pharmacy Tutor</h1>
              <p className="text-[11px] text-gray-500 font-body">
                {SUBJECTS.find((s) => s.value === subject)?.label} &middot; {DIFFICULTIES.find((d) => d.value === difficulty)?.label}
                {examPrep && <span className="ml-1 text-[#C9A84C]">&middot; Exam Mode</span>}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!usage.isPremium && (
              <span className="text-[11px] font-body font-medium text-gray-500 bg-white/5 px-2 py-1 rounded-lg">
                {usage.count}/{usage.limit}
              </span>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.length === 0 && !loading ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="w-16 h-16 rounded-2xl bg-[#C9A84C]/10 flex items-center justify-center mb-4 ring-1 ring-[#C9A84C]/20">
                <svg className="w-8 h-8 text-[#C9A84C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
                </svg>
              </div>
              <h2 className="text-xl font-display text-white mb-2">
                Welcome to your AI Pharmacy Tutor
              </h2>
              <p className="text-sm text-gray-400 font-body mb-6 max-w-md">
                Ask me anything about {SUBJECTS.find((s) => s.value === subject)?.label.toLowerCase() || "pharmacy"}.
                I am here to help you study, prepare for exams, and deepen your pharmaceutical knowledge.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                {suggested.slice(0, 4).map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-left px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-[#C9A84C]/10 hover:border-[#C9A84C]/20 text-xs text-gray-300 font-body transition-all leading-relaxed"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 ${
                      msg.role === "user"
                        ? "gold-glass text-gray-900 dark:text-gray-100"
                        : "dark-glass border-l-2 border-[#C9A84C]/40 text-gray-200"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <div className="prose-sm">{renderMarkdown(msg.content)}</div>
                    ) : (
                      <p className="text-sm font-body leading-relaxed">{msg.content}</p>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="dark-glass rounded-2xl border-l-2 border-[#C9A84C]/40">
                    <TypingIndicator />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input area */}
        <div className="px-4 py-3 border-t border-white/10 dark-glass">
          <div className="flex items-end gap-2 max-w-3xl mx-auto">
            {/* Voice input */}
            <button
              onClick={startVoiceInput}
              className={`shrink-0 p-2.5 rounded-xl transition-all relative ${
                isListening
                  ? "text-[#C9A84C] bg-[#C9A84C]/10"
                  : "text-gray-400 hover:text-[#C9A84C] hover:bg-white/5"
              }`}
              title={usage.isPremium ? "Voice input" : "Voice input (Premium)"}
            >
              {isListening && (
                <div className="absolute inset-0 rounded-xl ring-2 ring-[#C9A84C] animate-pulse" />
              )}
              <svg className="w-5 h-5 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
              </svg>
              {!usage.isPremium && (
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gray-800 border border-[#C9A84C]/30 flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-[#C9A84C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
                </div>
              )}
            </button>

            {/* Text input */}
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask your pharmacy question..."
                rows={1}
                className="w-full bg-white/5 border border-white/10 rounded-xl text-sm text-warm-800 dark:text-warm-200 placeholder-warm-500 focus:border-[#C9A84C]/50 focus:ring-1 focus:ring-[#C9A84C]/30 py-2.5 px-4 pr-10 font-body resize-none min-h-[42px] max-h-[120px]"
                style={{ height: "auto" }}
                onInput={(e) => {
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
                }}
              />
            </div>

            {/* Send button */}
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="shrink-0 p-2.5 bg-[#C9A84C] text-gray-950 rounded-xl hover:bg-[#E8D48B] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Paywall modal */}
      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        onSubscribe={handleSubscribe}
        loading={subLoading}
      />
    </div>
  );
}
