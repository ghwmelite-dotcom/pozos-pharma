import { useState, useEffect, useCallback } from "react";
import useAuth from "../hooks/useAuth";
import Button from "../components/UI/Button";
import Badge from "../components/UI/Badge";
import AnalyticsCharts from "../components/Admin/AnalyticsCharts";

const API_URL = import.meta.env.VITE_API_URL || "";

const TABS = [
  { key: "dashboard", label: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { key: "pharmacists", label: "Pharmacists", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
  { key: "verification", label: "Verification", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
  { key: "pharmacies", label: "Pharmacies", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
  { key: "flagged", label: "Flagged", icon: "M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" },
  { key: "ai-stats", label: "AI Stats", icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
  { key: "analytics", label: "Analytics", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
  { key: "academy", label: "Academy", icon: "M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" },
];

const SPECIALIZATIONS = [
  "Community Pharmacy", "Clinical Pharmacy", "Hospital Pharmacy",
  "Industrial Pharmacy", "Pharmaceutical Research", "Regulatory Affairs",
  "Pharmacovigilance", "Oncology Pharmacy", "Pediatric Pharmacy",
  "Geriatric Pharmacy", "Herbal Medicine",
];

const TIER_OPTIONS = ["standard", "senior", "lead", "specialist"];
const TIER_COLORS = {
  specialist: { bg: "bg-purple-500/15", text: "text-purple-300", dot: "bg-purple-400" },
  lead: { bg: "bg-amber-500/15", text: "text-amber-300", dot: "bg-amber-400" },
  senior: { bg: "bg-sky-500/15", text: "text-sky-300", dot: "bg-sky-400" },
  standard: { bg: "bg-gray-500/15", text: "text-gray-400", dot: "bg-gray-500" },
};

export default function AdminPanel() {
  const { isAdmin, token, isAuthenticated } = useAuth();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [dashboardStats, setDashboardStats] = useState(null);
  const [topTopics, setTopTopics] = useState([]);
  const [pendingPharmacists, setPendingPharmacists] = useState([]);
  const [verifyLoading, setVerifyLoading] = useState({});
  const [flaggedMessages, setFlaggedMessages] = useState([]);
  const [aiStats, setAiStats] = useState(null);

  const [allPharmacists, setAllPharmacists] = useState([]);
  const [pharmSearch, setPharmSearch] = useState("");
  const [pharmStatusFilter, setPharmStatusFilter] = useState("all");
  const [pharmTierFilter, setPharmTierFilter] = useState("all");
  const [pharmLoading, setPharmLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({ email: "", username: "", fullName: "", licenseNumber: "", country: "Ghana", specialization: "", bio: "", tier: "standard", password: "" });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [actionLoading, setActionLoading] = useState({});

  const [allPharmacies, setAllPharmacies] = useState([]);
  const [phcySearch, setPhcySearch] = useState("");
  const [phcyLoading, setPhcyLoading] = useState(false);
  const [showAddPharmacy, setShowAddPharmacy] = useState(false);
  const [phcyForm, setPhcyForm] = useState({ name: "", address: "", city: "", region: "Greater Accra", lat: "", lng: "", phone: "", hours: "", is_partner: false, nhis_accepted: false });
  const [phcyAddLoading, setPhcyAddLoading] = useState(false);
  const [phcyAddError, setPhcyAddError] = useState("");
  const [editingPhcyId, setEditingPhcyId] = useState(null);
  const [editPhcyForm, setEditPhcyForm] = useState({});

  const [academyStats, setAcademyStats] = useState(null);
  const [academyLoading, setAcademyLoading] = useState(false);
  const [certificates, setCertificates] = useState([]);
  const [certSearch, setCertSearch] = useState("");
  const [academySubTab, setAcademySubTab] = useState("overview");
  const [academyCourses, setAcademyCourses] = useState([]);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [editCourseForm, setEditCourseForm] = useState({});
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [addCourseForm, setAddCourseForm] = useState({ title: "", year: 2, difficulty: "Beginner", description: "" });
  const [addCourseLoading, setAddCourseLoading] = useState(false);
  const [addCourseError, setAddCourseError] = useState("");
  const [expandedCourseId, setExpandedCourseId] = useState(null);
  const [editingLessonId, setEditingLessonId] = useState(null);
  const [editLessonForm, setEditLessonForm] = useState({});
  const [showAddLesson, setShowAddLesson] = useState(null);
  const [addLessonForm, setAddLessonForm] = useState({ title: "", duration: "", content: "", keyPoints: "" });
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizCategoryFilter, setQuizCategoryFilter] = useState("all");
  const [editingQuizId, setEditingQuizId] = useState(null);
  const [editQuizForm, setEditQuizForm] = useState({});
  const [showAddQuiz, setShowAddQuiz] = useState(false);
  const [addQuizForm, setAddQuizForm] = useState({ question: "", options: ["", "", "", ""], correct: 0, category: "pharmacology", explanation: "" });
  const [addQuizLoading, setAddQuizLoading] = useState(false);
  const [addQuizError, setAddQuizError] = useState("");

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/dashboard`, { headers });
      if (!res.ok) throw new Error("Failed to fetch dashboard");
      const data = await res.json();
      setDashboardStats(data.stats || data);
      setTopTopics(data.top_topics || []);
    } catch (err) {
      console.error("[AdminPanel] fetchDashboard:", err);
    }
  }, [token]);

  const fetchPendingPharmacists = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/pharmacists/pending`, { headers });
      if (!res.ok) throw new Error("Failed to fetch pending pharmacists");
      const data = await res.json();
      setPendingPharmacists(Array.isArray(data) ? data : data.pharmacists || []);
    } catch (err) {
      console.error("[AdminPanel] fetchPendingPharmacists:", err);
    }
  }, [token]);

  const fetchFlaggedMessages = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/flagged`, { headers });
      if (!res.ok) throw new Error("Failed to fetch flagged messages");
      const data = await res.json();
      setFlaggedMessages(Array.isArray(data) ? data : data.messages || []);
    } catch (err) {
      console.error("[AdminPanel] fetchFlaggedMessages:", err);
    }
  }, [token]);

  const fetchAiStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/ai-stats`, { headers });
      if (!res.ok) throw new Error("Failed to fetch AI stats");
      const data = await res.json();
      setAiStats(data);
    } catch (err) {
      console.error("[AdminPanel] fetchAiStats:", err);
    }
  }, [token]);

  const fetchAllPharmacists = useCallback(async () => {
    setPharmLoading(true);
    try {
      const params = new URLSearchParams();
      if (pharmSearch) params.set("search", pharmSearch);
      if (pharmStatusFilter !== "all") params.set("status", pharmStatusFilter);
      if (pharmTierFilter !== "all") params.set("tier", pharmTierFilter);
      const res = await fetch(`${API_URL}/api/admin/pharmacists?${params}`, { headers });
      if (!res.ok) throw new Error("Failed to fetch pharmacists");
      const data = await res.json();
      setAllPharmacists(data.pharmacists || []);
    } catch (err) {
      console.error("[AdminPanel] fetchAllPharmacists:", err);
    } finally {
      setPharmLoading(false);
    }
  }, [token, pharmSearch, pharmStatusFilter, pharmTierFilter]);

  useEffect(() => {
    if (!isAdmin) { setLoading(false); return; }
    const loadAll = async () => {
      setLoading(true);
      setError("");
      try {
        await Promise.all([fetchDashboard(), fetchPendingPharmacists(), fetchFlaggedMessages(), fetchAiStats()]);
      } catch {
        setError("Failed to load admin data.");
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, [isAdmin, fetchDashboard, fetchPendingPharmacists, fetchFlaggedMessages, fetchAiStats]);

  const fetchAllPharmacies = useCallback(async () => {
    setPhcyLoading(true);
    try {
      const params = new URLSearchParams();
      if (phcySearch) params.set("search", phcySearch);
      const res = await fetch(`${API_URL}/api/admin/pharmacies?${params}`, { headers });
      if (!res.ok) throw new Error("Failed to fetch pharmacies");
      const data = await res.json();
      setAllPharmacies(data.pharmacies || []);
    } catch (err) {
      console.error("[AdminPanel] fetchAllPharmacies:", err);
    } finally {
      setPhcyLoading(false);
    }
  }, [token, phcySearch]);

  const fetchAcademyStats = useCallback(async () => {
    setAcademyLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/academy/stats`, { headers });
      if (res.ok) {
        const data = await res.json();
        setAcademyStats(data);
        setCertificates(data.certificates || []);
      } else {
        setAcademyStats(null);
        setCertificates([]);
      }
    } catch {
      setAcademyStats(null);
      setCertificates([]);
    } finally {
      setAcademyLoading(false);
    }
  }, [token]);

  const fetchAcademyCourses = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/academy/courses`, { headers });
      if (res.ok) {
        const data = await res.json();
        setAcademyCourses(data.courses || []);
      } else {
        setAcademyCourses([
          { id: "pharmacology-1", title: "Pharmacology I", year: 2, lessons: 8, quizQuestions: 24, difficulty: "Beginner", status: "active" },
          { id: "pharma-chemistry", title: "Pharmaceutical Chemistry", year: 2, lessons: 6, quizQuestions: 18, difficulty: "Intermediate", status: "active" },
          { id: "pharmacognosy", title: "Pharmacognosy", year: 3, lessons: 5, quizQuestions: 15, difficulty: "Intermediate", status: "active" },
          { id: "clinical-pharmacy", title: "Clinical Pharmacy", year: 4, lessons: 6, quizQuestions: 18, difficulty: "Advanced", status: "active" },
          { id: "pharmacy-practice", title: "Pharmacy Practice & Ethics", year: 3, lessons: 6, quizQuestions: 18, difficulty: "Intermediate", status: "active" },
          { id: "biopharmaceutics", title: "Biopharmaceutics", year: 3, lessons: 6, quizQuestions: 18, difficulty: "Advanced", status: "active" },
          { id: "pharma-microbiology", title: "Pharmaceutical Microbiology", year: 2, lessons: 6, quizQuestions: 18, difficulty: "Intermediate", status: "active" },
          { id: "pharmaceutics", title: "Pharmaceutics & Dosage Forms", year: 2, lessons: 6, quizQuestions: 18, difficulty: "Intermediate", status: "active" },
          { id: "pathophysiology", title: "Pathophysiology for Pharmacists", year: 3, lessons: 6, quizQuestions: 18, difficulty: "Intermediate", status: "active" },
          { id: "pharmacokinetics", title: "Pharmacokinetics & Drug Metabolism", year: 3, lessons: 6, quizQuestions: 18, difficulty: "Advanced", status: "active" },
          { id: "toxicology", title: "Toxicology & Poison Management", year: 4, lessons: 6, quizQuestions: 18, difficulty: "Advanced", status: "active" },
          { id: "public-health-pharmacy", title: "Public Health Pharmacy", year: 4, lessons: 6, quizQuestions: 18, difficulty: "Intermediate", status: "active" },
          { id: "herbal-medicine", title: "Traditional & Herbal Medicine Regulation", year: 3, lessons: 6, quizQuestions: 18, difficulty: "Intermediate", status: "active" },
          { id: "supply-chain", title: "Pharmaceutical Supply Chain Management", year: 4, lessons: 6, quizQuestions: 18, difficulty: "Intermediate", status: "active" },
        ]);
      }
    } catch {
      setAcademyCourses([]);
    }
  }, [token]);

  const fetchQuizQuestions = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (quizCategoryFilter !== "all") params.set("category", quizCategoryFilter);
      const res = await fetch(`${API_URL}/api/admin/academy/quiz-questions?${params}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setQuizQuestions(data.questions || []);
      } else {
        setQuizQuestions([]);
      }
    } catch {
      setQuizQuestions([]);
    }
  }, [token, quizCategoryFilter]);

  const handleAddCourse = async (e) => {
    e.preventDefault();
    setAddCourseLoading(true);
    setAddCourseError("");
    try {
      const res = await fetch(`${API_URL}/api/admin/academy/courses`, {
        method: "POST", headers, body: JSON.stringify(addCourseForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add course");
      setShowAddCourse(false);
      setAddCourseForm({ title: "", year: 2, difficulty: "Beginner", description: "" });
      await fetchAcademyCourses();
    } catch (err) {
      setAddCourseError(err.message);
    } finally {
      setAddCourseLoading(false);
    }
  };

  const handleUpdateCourse = async (courseId) => {
    setActionLoading((p) => ({ ...p, [courseId]: "save" }));
    try {
      await fetch(`${API_URL}/api/admin/academy/courses/${courseId}`, {
        method: "PUT", headers, body: JSON.stringify(editCourseForm),
      });
      setEditingCourseId(null);
      await fetchAcademyCourses();
    } catch (err) {
      console.error("Update course:", err);
    } finally {
      setActionLoading((p) => ({ ...p, [courseId]: null }));
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!confirm("Delete this course and all its lessons? This cannot be undone.")) return;
    setActionLoading((p) => ({ ...p, [courseId]: "delete" }));
    try {
      await fetch(`${API_URL}/api/admin/academy/courses/${courseId}`, { method: "DELETE", headers });
      await fetchAcademyCourses();
    } catch (err) {
      console.error("Delete course:", err);
    } finally {
      setActionLoading((p) => ({ ...p, [courseId]: null }));
    }
  };

  const handleToggleCourseStatus = async (courseId, currentStatus) => {
    setActionLoading((p) => ({ ...p, [courseId]: "status" }));
    try {
      await fetch(`${API_URL}/api/admin/academy/courses/${courseId}/status`, {
        method: "PUT", headers, body: JSON.stringify({ status: currentStatus === "active" ? "draft" : "active" }),
      });
      await fetchAcademyCourses();
    } catch (err) {
      console.error("Toggle course status:", err);
    } finally {
      setActionLoading((p) => ({ ...p, [courseId]: null }));
    }
  };

  const handleAddLesson = async (e, courseId) => {
    e.preventDefault();
    setActionLoading((p) => ({ ...p, [`lesson-${courseId}`]: true }));
    try {
      const body = { ...addLessonForm, keyPoints: addLessonForm.keyPoints.split("\n").filter(Boolean) };
      await fetch(`${API_URL}/api/admin/academy/courses/${courseId}/lessons`, {
        method: "POST", headers, body: JSON.stringify(body),
      });
      setShowAddLesson(null);
      setAddLessonForm({ title: "", duration: "", content: "", keyPoints: "" });
      await fetchAcademyCourses();
    } catch (err) {
      console.error("Add lesson:", err);
    } finally {
      setActionLoading((p) => ({ ...p, [`lesson-${courseId}`]: false }));
    }
  };

  const handleUpdateLesson = async (courseId, lessonId) => {
    setActionLoading((p) => ({ ...p, [`lesson-${lessonId}`]: "save" }));
    try {
      const body = { ...editLessonForm };
      if (typeof body.keyPoints === "string") body.keyPoints = body.keyPoints.split("\n").filter(Boolean);
      await fetch(`${API_URL}/api/admin/academy/courses/${courseId}/lessons/${lessonId}`, {
        method: "PUT", headers, body: JSON.stringify(body),
      });
      setEditingLessonId(null);
      await fetchAcademyCourses();
    } catch (err) {
      console.error("Update lesson:", err);
    } finally {
      setActionLoading((p) => ({ ...p, [`lesson-${lessonId}`]: null }));
    }
  };

  const handleDeleteLesson = async (courseId, lessonId) => {
    if (!confirm("Delete this lesson?")) return;
    try {
      await fetch(`${API_URL}/api/admin/academy/courses/${courseId}/lessons/${lessonId}`, { method: "DELETE", headers });
      await fetchAcademyCourses();
    } catch (err) {
      console.error("Delete lesson:", err);
    }
  };

  const handleAddQuizQuestion = async (e) => {
    e.preventDefault();
    setAddQuizLoading(true);
    setAddQuizError("");
    try {
      const res = await fetch(`${API_URL}/api/admin/academy/quiz-questions`, {
        method: "POST", headers, body: JSON.stringify(addQuizForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add question");
      setShowAddQuiz(false);
      setAddQuizForm({ question: "", options: ["", "", "", ""], correct: 0, category: "pharmacology", explanation: "" });
      await fetchQuizQuestions();
    } catch (err) {
      setAddQuizError(err.message);
    } finally {
      setAddQuizLoading(false);
    }
  };

  const handleUpdateQuizQuestion = async (questionId) => {
    setActionLoading((p) => ({ ...p, [`quiz-${questionId}`]: "save" }));
    try {
      await fetch(`${API_URL}/api/admin/academy/quiz-questions/${questionId}`, {
        method: "PUT", headers, body: JSON.stringify(editQuizForm),
      });
      setEditingQuizId(null);
      await fetchQuizQuestions();
    } catch (err) {
      console.error("Update quiz question:", err);
    } finally {
      setActionLoading((p) => ({ ...p, [`quiz-${questionId}`]: null }));
    }
  };

  const handleDeleteQuizQuestion = async (questionId) => {
    if (!confirm("Delete this quiz question?")) return;
    try {
      await fetch(`${API_URL}/api/admin/academy/quiz-questions/${questionId}`, { method: "DELETE", headers });
      await fetchQuizQuestions();
    } catch (err) {
      console.error("Delete quiz question:", err);
    }
  };

  const handleRevokeCertificate = async (certId) => {
    if (!confirm("Revoke this certificate? The student will be notified.")) return;
    setActionLoading((p) => ({ ...p, [`cert-${certId}`]: "revoke" }));
    try {
      await fetch(`${API_URL}/api/admin/academy/certificates/${certId}/revoke`, { method: "POST", headers });
      await fetchAcademyStats();
    } catch (err) {
      console.error("Revoke certificate:", err);
    } finally {
      setActionLoading((p) => ({ ...p, [`cert-${certId}`]: null }));
    }
  };

  useEffect(() => {
    if (activeTab === "pharmacists" && isAdmin) fetchAllPharmacists();
    if (activeTab === "pharmacies" && isAdmin) fetchAllPharmacies();
    if (activeTab === "academy" && isAdmin) {
      fetchAcademyStats();
      fetchAcademyCourses();
      fetchQuizQuestions();
    }
  }, [activeTab, isAdmin, fetchAllPharmacists, fetchAllPharmacies, fetchAcademyStats, fetchAcademyCourses, fetchQuizQuestions]);

  const handleVerifyAction = async (pharmacistId, action) => {
    setVerifyLoading((prev) => ({ ...prev, [pharmacistId]: action }));
    try {
      const res = await fetch(`${API_URL}/api/admin/pharmacists/${pharmacistId}/${action}`, { method: "POST", headers });
      if (!res.ok) throw new Error(`Failed to ${action} pharmacist`);
      await fetchPendingPharmacists();
    } catch (err) {
      console.error(`[AdminPanel] ${action} pharmacist:`, err);
    } finally {
      setVerifyLoading((prev) => ({ ...prev, [pharmacistId]: null }));
    }
  };

  const handleAddPharmacist = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    setAddError("");
    try {
      const res = await fetch(`${API_URL}/api/admin/pharmacists/add`, {
        method: "POST", headers, body: JSON.stringify(addForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add pharmacist");
      setShowAddForm(false);
      setAddForm({ email: "", username: "", fullName: "", licenseNumber: "", country: "Ghana", specialization: "", bio: "", tier: "standard", password: "" });
      await fetchAllPharmacists();
    } catch (err) {
      setAddError(err.message);
    } finally {
      setAddLoading(false);
    }
  };

  const handleUpdatePharmacist = async (pharmacistId) => {
    setActionLoading((p) => ({ ...p, [pharmacistId]: "save" }));
    try {
      const res = await fetch(`${API_URL}/api/admin/pharmacists/${pharmacistId}`, {
        method: "PUT", headers, body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error("Failed to update");
      setEditingId(null);
      await fetchAllPharmacists();
    } catch (err) {
      console.error("Update pharmacist:", err);
    } finally {
      setActionLoading((p) => ({ ...p, [pharmacistId]: null }));
    }
  };

  const handleSuspend = async (pharmacistId, currentlyBanned) => {
    setActionLoading((p) => ({ ...p, [pharmacistId]: "suspend" }));
    try {
      await fetch(`${API_URL}/api/admin/pharmacists/${pharmacistId}/suspend`, {
        method: "POST", headers, body: JSON.stringify({ suspended: !currentlyBanned }),
      });
      await fetchAllPharmacists();
    } catch (err) {
      console.error("Suspend pharmacist:", err);
    } finally {
      setActionLoading((p) => ({ ...p, [pharmacistId]: null }));
    }
  };

  const handleSetTier = async (pharmacistId, tier) => {
    setActionLoading((p) => ({ ...p, [pharmacistId]: "tier" }));
    try {
      await fetch(`${API_URL}/api/admin/pharmacists/${pharmacistId}/tier`, {
        method: "PUT", headers, body: JSON.stringify({ tier }),
      });
      await fetchAllPharmacists();
    } catch (err) {
      console.error("Set tier:", err);
    } finally {
      setActionLoading((p) => ({ ...p, [pharmacistId]: null }));
    }
  };

  const handleRemove = async (pharmacistId) => {
    if (!confirm("Remove this pharmacist? Their account will revert to a regular user.")) return;
    setActionLoading((p) => ({ ...p, [pharmacistId]: "remove" }));
    try {
      await fetch(`${API_URL}/api/admin/pharmacists/${pharmacistId}`, { method: "DELETE", headers });
      await fetchAllPharmacists();
    } catch (err) {
      console.error("Remove pharmacist:", err);
    } finally {
      setActionLoading((p) => ({ ...p, [pharmacistId]: null }));
    }
  };

  const handleRecalculateScores = async () => {
    setActionLoading((p) => ({ ...p, recalc: true }));
    try {
      await fetch(`${API_URL}/api/admin/pharmacists/recalculate-scores`, { method: "POST", headers });
      await fetchAllPharmacists();
    } catch (err) {
      console.error("Recalculate scores:", err);
    } finally {
      setActionLoading((p) => ({ ...p, recalc: false }));
    }
  };

  const handleAddPharmacy = async (e) => {
    e.preventDefault();
    setPhcyAddLoading(true);
    setPhcyAddError("");
    try {
      const body = { ...phcyForm, lat: phcyForm.lat ? parseFloat(phcyForm.lat) : null, lng: phcyForm.lng ? parseFloat(phcyForm.lng) : null };
      const res = await fetch(`${API_URL}/api/admin/pharmacies`, { method: "POST", headers, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add pharmacy");
      setShowAddPharmacy(false);
      setPhcyForm({ name: "", address: "", city: "", region: "Greater Accra", lat: "", lng: "", phone: "", hours: "", is_partner: false, nhis_accepted: false });
      await fetchAllPharmacies();
    } catch (err) {
      setPhcyAddError(err.message);
    } finally {
      setPhcyAddLoading(false);
    }
  };

  const handleUpdatePharmacy = async (id) => {
    setActionLoading((p) => ({ ...p, [id]: "save" }));
    try {
      const body = { ...editPhcyForm };
      if (body.lat) body.lat = parseFloat(body.lat);
      if (body.lng) body.lng = parseFloat(body.lng);
      await fetch(`${API_URL}/api/admin/pharmacies/${id}`, { method: "PUT", headers, body: JSON.stringify(body) });
      setEditingPhcyId(null);
      await fetchAllPharmacies();
    } catch (err) {
      console.error("Update pharmacy:", err);
    } finally {
      setActionLoading((p) => ({ ...p, [id]: null }));
    }
  };

  const handleDeletePharmacy = async (id) => {
    if (!confirm("Delete this pharmacy and its stock data?")) return;
    setActionLoading((p) => ({ ...p, [id]: "delete" }));
    try {
      await fetch(`${API_URL}/api/admin/pharmacies/${id}`, { method: "DELETE", headers });
      await fetchAllPharmacies();
    } catch (err) {
      console.error("Delete pharmacy:", err);
    } finally {
      setActionLoading((p) => ({ ...p, [id]: null }));
    }
  };

  const tierBadge = (tier) => {
    const t = TIER_COLORS[tier] || TIER_COLORS.standard;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-full ${t.bg} ${t.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${t.dot}`} />
        {(tier || "standard").charAt(0).toUpperCase() + (tier || "standard").slice(1)}
      </span>
    );
  };

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center dark-glass rounded-2xl p-10">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 flex items-center justify-center mb-4 ring-1 ring-red-500/20">
            <svg className="w-8 h-8 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-xl font-display font-semibold text-white">Access Denied</h2>
          <p className="text-sm text-gray-400 mt-2">Admin privileges required.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#C9A84C] animate-spin" />
            <div className="absolute inset-1 rounded-full border-2 border-transparent border-b-[#C9A84C]/40 animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
          </div>
          <p className="text-sm text-gray-400 font-body">Loading command center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Background texture */}
      <div className="fixed inset-0 kente-weave pointer-events-none" />
      <div className="fixed inset-0 noise-overlay pointer-events-none" />

      <div className="relative z-10 space-y-6 pb-12">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl dark-glass p-6 sm:p-8">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent" />
          <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-[#C9A84C]/5 blur-3xl" />
          <div className="relative">
            <h1 className="text-2xl sm:text-3xl font-display gold-text tracking-tight">Command Center</h1>
            <p className="text-sm text-gray-400 mt-1 font-body">PozosPharma Platform Administration</p>
          </div>
          {/* Kente accent strip */}
          <div className="absolute bottom-0 left-0 right-0 h-[3px] flex">
            <div className="flex-1 bg-ghana-red/60" />
            <div className="flex-1 bg-ghana-gold/60" />
            <div className="flex-1 bg-ghana-green/60" />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`group flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-body font-medium whitespace-nowrap transition-all duration-200 ${
                activeTab === tab.key
                  ? "bg-[#C9A84C]/15 text-[#E8D48B] ring-1 ring-[#C9A84C]/30"
                  : "text-gray-500 hover:text-gray-300 hover:bg-warm-50/5"
              }`}
            >
              <svg className={`w-4 h-4 transition-colors ${activeTab === tab.key ? "text-[#C9A84C]" : "text-gray-600 group-hover:text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
              </svg>
              {tab.label}
              {tab.key === "verification" && pendingPharmacists.length > 0 && (
                <span className="ml-1 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-[#C9A84C] rounded-full">{pendingPharmacists.length}</span>
              )}
              {tab.key === "flagged" && flaggedMessages.length > 0 && (
                <span className="ml-1 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-red-500 rounded-full">{flaggedMessages.length}</span>
              )}
            </button>
          ))}
        </div>

        {error && (
          <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-300 font-body">{error}</div>
        )}

        {/* ── Dashboard Tab ─────────────────────────────────── */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {[
                { label: "Total Users", value: dashboardStats?.total_users ?? 0, color: "from-[#C9A84C]/20 to-transparent" },
                { label: "Sessions", value: dashboardStats?.total_sessions ?? 0, color: "from-sky-500/20 to-transparent" },
                { label: "Messages", value: dashboardStats?.total_messages ?? 0, color: "from-emerald-500/20 to-transparent" },
                { label: "Pharmacists", value: dashboardStats?.total_pharmacists ?? 0, color: "from-purple-500/20 to-transparent" },
                { label: "Flagged", value: dashboardStats?.flagged_count ?? 0, color: "from-red-500/20 to-transparent" },
                { label: "Handoff Rate", value: `${dashboardStats?.handoff_rate ?? 0}%`, color: "from-teal-500/20 to-transparent" },
                { label: "Avg Satisfaction", value: dashboardStats?.avg_satisfaction?.toFixed?.(1) ?? "N/A", color: "from-amber-500/20 to-transparent" },
                { label: "Active Today", value: dashboardStats?.active_today ?? 0, color: "from-indigo-500/20 to-transparent" },
              ].map((stat, i) => (
                <div
                  key={stat.label}
                  className="relative overflow-hidden dark-glass rounded-xl p-4 stat-glow animate-stagger"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-50`} />
                  <div className="relative">
                    <p className="text-2xl sm:text-3xl font-display text-white tracking-tight">{stat.value}</p>
                    <p className="text-[11px] text-gray-500 mt-1 font-body uppercase tracking-wider">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="dark-glass rounded-xl p-5 sm:p-6">
              <h3 className="text-xs font-body font-semibold text-[#C9A84C] mb-5 uppercase tracking-[0.2em]">Trending Topics</h3>
              {topTopics.length === 0 ? (
                <p className="text-sm text-gray-500 font-body">No topic data available</p>
              ) : (
                <div className="space-y-4">
                  {topTopics.slice(0, 8).map((topic, index) => {
                    const maxCount = topTopics[0]?.count || 1;
                    const percentage = Math.round((topic.count / maxCount) * 100);
                    return (
                      <div key={topic.name || index} className="animate-stagger" style={{ animationDelay: `${index * 80}ms` }}>
                        <div className="flex items-center justify-between text-sm mb-1.5">
                          <span className="text-gray-300 font-body font-medium truncate">{topic.name}</span>
                          <span className="text-gray-500 text-xs font-mono ml-2 shrink-0">{topic.count}</span>
                        </div>
                        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                          <div className="h-full rounded-full score-bar-gold transition-all duration-700" style={{ width: `${percentage}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Pharmacist Management Tab ──────────────────── */}
        {activeTab === "pharmacists" && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-lg font-display text-white gold-underline pb-2">Pharmacist Management</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRecalculateScores}
                  disabled={!!actionLoading.recalc}
                  className="px-3 py-2 text-xs font-body font-medium rounded-lg bg-warm-50/5 text-gray-400 hover:text-[#C9A84C] hover:bg-[#C9A84C]/10 border border-white/10 hover:border-[#C9A84C]/30 transition-all disabled:opacity-50"
                >
                  {actionLoading.recalc ? "Calculating..." : "Recalculate Scores"}
                </button>
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="px-4 py-2 text-xs font-body font-semibold rounded-lg bg-[#C9A84C] text-gray-900 hover:bg-[#E8D48B] transition-colors"
                >
                  {showAddForm ? "Cancel" : "+ Add Pharmacist"}
                </button>
              </div>
            </div>

            {showAddForm && (
              <form onSubmit={handleAddPharmacist} className="gold-glass rounded-xl p-5 sm:p-6 space-y-4">
                <h3 className="text-base font-display text-white">New Pharmacist</h3>
                {addError && (
                  <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-300 font-body">{addError}</div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: "Full Name *", key: "fullName", type: "text", required: true },
                    { label: "Email *", key: "email", type: "email", required: true },
                    { label: "Username", key: "username", type: "text", placeholder: "Auto-generated if empty" },
                    { label: "License Number *", key: "licenseNumber", type: "text", required: true, placeholder: "e.g. PCG/12345" },
                  ].map((field) => (
                    <div key={field.key}>
                      <label className="block text-[11px] font-body font-medium text-gray-400 mb-1.5 uppercase tracking-wider">{field.label}</label>
                      <input
                        type={field.type}
                        required={field.required}
                        placeholder={field.placeholder}
                        value={addForm[field.key]}
                        onChange={(e) => setAddForm(p => ({ ...p, [field.key]: e.target.value }))}
                        className="admin-input"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-[11px] font-body font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Country</label>
                    <select value={addForm.country} onChange={(e) => setAddForm(p => ({ ...p, country: e.target.value }))} className="admin-select w-full">
                      {["Ghana", "Nigeria", "Kenya", "South Africa", "Other"].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-body font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Specialization</label>
                    <select value={addForm.specialization} onChange={(e) => setAddForm(p => ({ ...p, specialization: e.target.value }))} className="admin-select w-full">
                      <option value="">Select...</option>
                      {SPECIALIZATIONS.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-body font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Tier</label>
                    <select value={addForm.tier} onChange={(e) => setAddForm(p => ({ ...p, tier: e.target.value }))} className="admin-select w-full">
                      {TIER_OPTIONS.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-body font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Temp Password</label>
                    <input type="text" value={addForm.password} onChange={(e) => setAddForm(p => ({ ...p, password: e.target.value }))}
                      placeholder="Auto-generated if empty" className="admin-input" />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-body font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Bio</label>
                  <textarea rows={2} value={addForm.bio} onChange={(e) => setAddForm(p => ({ ...p, bio: e.target.value }))} className="admin-input resize-none" />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 text-sm font-body text-gray-400 hover:text-white transition-colors">Cancel</button>
                  <button type="submit" disabled={addLoading} className="px-5 py-2 text-sm font-body font-semibold rounded-lg bg-[#C9A84C] text-gray-900 hover:bg-[#E8D48B] transition-colors disabled:opacity-50">
                    {addLoading ? "Adding..." : "Add Pharmacist"}
                  </button>
                </div>
              </form>
            )}

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search name, username, license..."
                  value={pharmSearch}
                  onChange={(e) => setPharmSearch(e.target.value)}
                  className="admin-input pl-9"
                />
              </div>
              <select value={pharmStatusFilter} onChange={(e) => setPharmStatusFilter(e.target.value)} className="admin-select">
                <option value="all">All Status</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </select>
              <select value={pharmTierFilter} onChange={(e) => setPharmTierFilter(e.target.value)} className="admin-select">
                <option value="all">All Tiers</option>
                {TIER_OPTIONS.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>

            {pharmLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-2 border-transparent border-t-[#C9A84C] rounded-full animate-spin" />
              </div>
            ) : allPharmacists.length === 0 ? (
              <div className="dark-glass rounded-xl p-10 text-center">
                <p className="text-sm text-gray-500 font-body">No pharmacists found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl dark-glass">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5">
                      {["Pharmacist", "License", "Tier", "Rating", "Score", "Status", "Actions"].map((h) => (
                        <th key={h} className={`px-4 py-3.5 text-[10px] font-body font-semibold text-[#C9A84C]/70 uppercase tracking-[0.15em] ${h === "Actions" ? "text-right" : h === "Tier" || h === "Rating" || h === "Score" || h === "Status" ? "text-center" : "text-left"}`}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {allPharmacists.map((p, i) => (
                      <tr key={p.id} className="hover:bg-warm-50/[0.02] transition-colors animate-stagger" style={{ animationDelay: `${i * 40}ms` }}>
                        <td className="px-4 py-3">
                          {editingId === p.id ? (
                            <div className="space-y-1.5">
                              <input type="text" value={editForm.full_name ?? p.full_name} onChange={(e) => setEditForm(f => ({ ...f, full_name: e.target.value }))} className="admin-input text-sm py-1.5" />
                              <select value={editForm.specialization ?? p.specialization} onChange={(e) => setEditForm(f => ({ ...f, specialization: e.target.value }))} className="admin-select w-full text-xs py-1">
                                {SPECIALIZATIONS.map(s => <option key={s}>{s}</option>)}
                              </select>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#C9A84C]/20 to-[#C9A84C]/5 flex items-center justify-center shrink-0 ring-1 ring-[#C9A84C]/20">
                                <span className="text-xs font-bold text-[#C9A84C]">{p.full_name?.[0]?.toUpperCase() || "?"}</span>
                              </div>
                              <div className="min-w-0">
                                <p className="font-body font-medium text-gray-200 truncate">{p.full_name}</p>
                                <p className="text-[11px] text-gray-500 font-body">{p.specialization} &middot; @{p.username}</p>
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs font-mono">{p.license_number}</td>
                        <td className="px-4 py-3 text-center">
                          {editingId === p.id ? (
                            <select value={editForm.tier ?? p.tier ?? "standard"} onChange={(e) => setEditForm(f => ({ ...f, tier: e.target.value }))} className="admin-select text-xs py-1">
                              {TIER_OPTIONS.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                            </select>
                          ) : tierBadge(p.tier)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-[#C9A84C] font-semibold font-mono">{(p.rating || 0).toFixed(1)}</span>
                          <span className="text-[10px] text-gray-600 ml-0.5">({p.review_count || 0})</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="font-bold text-white font-mono">{(p.composite_score || 0).toFixed(1)}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {p.is_banned ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-red-500/15 text-red-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />Suspended
                            </span>
                          ) : p.is_verified ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-500/15 text-emerald-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-amber-500/15 text-amber-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />Pending
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {editingId === p.id ? (
                              <>
                                <button onClick={() => handleUpdatePharmacist(p.id)} disabled={actionLoading[p.id] === "save"}
                                  className="px-3 py-1.5 text-xs font-body font-semibold rounded-lg bg-[#C9A84C] text-gray-900 hover:bg-[#E8D48B] transition-colors disabled:opacity-50">
                                  {actionLoading[p.id] === "save" ? "..." : "Save"}
                                </button>
                                <button onClick={() => setEditingId(null)} className="px-3 py-1.5 text-xs font-body text-gray-400 hover:text-white transition-colors">Cancel</button>
                              </>
                            ) : (
                              <>
                                <button onClick={() => { setEditingId(p.id); setEditForm({ full_name: p.full_name, specialization: p.specialization, tier: p.tier || "standard" }); }}
                                  className="p-1.5 rounded-lg text-gray-500 hover:text-[#C9A84C] hover:bg-[#C9A84C]/10 transition-all" title="Edit">
                                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                                </button>
                                <select
                                  value={p.tier || "standard"}
                                  onChange={(e) => handleSetTier(p.id, e.target.value)}
                                  className="px-1.5 py-1 text-[10px] rounded-lg bg-warm-50/5 border border-white/10 text-gray-400 font-body"
                                  title="Change tier"
                                >
                                  {TIER_OPTIONS.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                                </select>
                                <button onClick={() => handleSuspend(p.id, p.is_banned)}
                                  className={`p-1.5 rounded-lg transition-all ${p.is_banned ? "text-emerald-400 hover:bg-emerald-500/10" : "text-amber-400 hover:bg-amber-500/10"}`}
                                  title={p.is_banned ? "Activate" : "Suspend"}>
                                  {p.is_banned ? (
                                    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                  ) : (
                                    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" /></svg>
                                  )}
                                </button>
                                <button onClick={() => handleRemove(p.id)}
                                  className="p-1.5 rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-all" title="Remove">
                                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Pharmacies Tab ────────────────────────────────── */}
        {activeTab === "pharmacies" && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-lg font-display text-white gold-underline pb-2">Pharmacy Management</h2>
              <button
                onClick={() => setShowAddPharmacy(!showAddPharmacy)}
                className="px-4 py-2 text-xs font-body font-semibold rounded-lg bg-[#C9A84C] text-gray-900 hover:bg-[#E8D48B] transition-colors"
              >
                {showAddPharmacy ? "Cancel" : "+ Add Pharmacy"}
              </button>
            </div>

            {showAddPharmacy && (
              <form onSubmit={handleAddPharmacy} className="gold-glass rounded-xl p-5 sm:p-6 space-y-4">
                <h3 className="text-base font-display text-white">New Pharmacy</h3>
                {phcyAddError && (
                  <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-300 font-body">{phcyAddError}</div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-body font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Name *</label>
                    <input type="text" required value={phcyForm.name} onChange={(e) => setPhcyForm(p => ({ ...p, name: e.target.value }))} className="admin-input" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-body font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Phone</label>
                    <input type="text" value={phcyForm.phone} onChange={(e) => setPhcyForm(p => ({ ...p, phone: e.target.value }))} className="admin-input" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-body font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Address *</label>
                    <input type="text" required value={phcyForm.address} onChange={(e) => setPhcyForm(p => ({ ...p, address: e.target.value }))} className="admin-input" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-body font-medium text-gray-400 mb-1.5 uppercase tracking-wider">City *</label>
                    <input type="text" required value={phcyForm.city} onChange={(e) => setPhcyForm(p => ({ ...p, city: e.target.value }))} className="admin-input" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-body font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Region *</label>
                    <select required value={phcyForm.region} onChange={(e) => setPhcyForm(p => ({ ...p, region: e.target.value }))} className="admin-select w-full">
                      {["Greater Accra","Ashanti","Western","Eastern","Central","Northern","Volta","Upper East","Upper West","Bono","Bono East","Ahafo","Savannah","North East","Oti","Western North"].map(r => <option key={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-body font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Latitude</label>
                    <input type="number" step="any" value={phcyForm.lat} onChange={(e) => setPhcyForm(p => ({ ...p, lat: e.target.value }))} placeholder="e.g. 5.6037" className="admin-input" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-body font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Longitude</label>
                    <input type="number" step="any" value={phcyForm.lng} onChange={(e) => setPhcyForm(p => ({ ...p, lng: e.target.value }))} placeholder="e.g. -0.1870" className="admin-input" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-body font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Operating Hours</label>
                    <input type="text" value={phcyForm.hours} onChange={(e) => setPhcyForm(p => ({ ...p, hours: e.target.value }))} placeholder="e.g. Mon-Sat 8am-8pm" className="admin-input" />
                  </div>
                  <div className="flex items-center gap-6 sm:col-span-2 pt-2">
                    <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer font-body">
                      <input type="checkbox" checked={phcyForm.nhis_accepted} onChange={(e) => setPhcyForm(p => ({ ...p, nhis_accepted: e.target.checked }))}
                        className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-[#C9A84C] focus:ring-[#C9A84C]/30" />
                      NHIS Accepted
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer font-body">
                      <input type="checkbox" checked={phcyForm.is_partner} onChange={(e) => setPhcyForm(p => ({ ...p, is_partner: e.target.checked }))}
                        className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-[#C9A84C] focus:ring-[#C9A84C]/30" />
                      PozosPharma Partner
                    </label>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowAddPharmacy(false)} className="px-4 py-2 text-sm font-body text-gray-400 hover:text-white transition-colors">Cancel</button>
                  <button type="submit" disabled={phcyAddLoading} className="px-5 py-2 text-sm font-body font-semibold rounded-lg bg-[#C9A84C] text-gray-900 hover:bg-[#E8D48B] transition-colors disabled:opacity-50">
                    {phcyAddLoading ? "Adding..." : "Add Pharmacy"}
                  </button>
                </div>
              </form>
            )}

            <div className="relative max-w-md">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search pharmacy name, city, address..."
                value={phcySearch}
                onChange={(e) => setPhcySearch(e.target.value)}
                className="admin-input pl-9"
              />
            </div>

            {phcyLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-2 border-transparent border-t-[#C9A84C] rounded-full animate-spin" />
              </div>
            ) : allPharmacies.length === 0 ? (
              <div className="dark-glass rounded-xl p-10 text-center">
                <p className="text-sm text-gray-500 font-body">No pharmacies found. Add your first pharmacy above.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl dark-glass">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5">
                      {["Pharmacy", "Location", "Phone", "NHIS", "Partner", "Actions"].map((h) => (
                        <th key={h} className={`px-4 py-3.5 text-[10px] font-body font-semibold text-[#C9A84C]/70 uppercase tracking-[0.15em] ${h === "Actions" ? "text-right" : h === "NHIS" || h === "Partner" ? "text-center" : "text-left"}`}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {allPharmacies.map((ph, i) => (
                      <tr key={ph.id} className="hover:bg-warm-50/[0.02] transition-colors animate-stagger" style={{ animationDelay: `${i * 40}ms` }}>
                        <td className="px-4 py-3">
                          {editingPhcyId === ph.id ? (
                            <input type="text" value={editPhcyForm.name ?? ph.name} onChange={(e) => setEditPhcyForm(f => ({ ...f, name: e.target.value }))} className="admin-input text-sm py-1.5" />
                          ) : (
                            <div>
                              <p className="font-body font-medium text-gray-200">{ph.name}</p>
                              <p className="text-[11px] text-gray-500 font-body">{ph.hours || "Hours not set"}</p>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {editingPhcyId === ph.id ? (
                            <div className="space-y-1.5">
                              <input type="text" value={editPhcyForm.address ?? ph.address} onChange={(e) => setEditPhcyForm(f => ({ ...f, address: e.target.value }))} className="admin-input text-xs py-1" placeholder="Address" />
                              <input type="text" value={editPhcyForm.city ?? ph.city} onChange={(e) => setEditPhcyForm(f => ({ ...f, city: e.target.value }))} className="admin-input text-xs py-1" placeholder="City" />
                            </div>
                          ) : (
                            <div>
                              <p className="text-gray-300 text-xs font-body">{ph.address}</p>
                              <p className="text-gray-500 text-[11px] font-body">{ph.city}, {ph.region}</p>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs font-mono">{ph.phone || "--"}</td>
                        <td className="px-4 py-3 text-center">
                          {ph.nhis_accepted ? (
                            <span className="inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-500/15 text-emerald-400">Yes</span>
                          ) : (
                            <span className="text-xs text-gray-600">No</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {ph.is_partner ? (
                            <span className="inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-full bg-[#C9A84C]/15 text-[#C9A84C]">Partner</span>
                          ) : (
                            <span className="text-xs text-gray-600">No</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {editingPhcyId === ph.id ? (
                              <>
                                <button onClick={() => handleUpdatePharmacy(ph.id)} disabled={actionLoading[ph.id] === "save"}
                                  className="px-3 py-1.5 text-xs font-body font-semibold rounded-lg bg-[#C9A84C] text-gray-900 hover:bg-[#E8D48B] transition-colors disabled:opacity-50">
                                  {actionLoading[ph.id] === "save" ? "..." : "Save"}
                                </button>
                                <button onClick={() => setEditingPhcyId(null)} className="px-3 py-1.5 text-xs font-body text-gray-400 hover:text-white transition-colors">Cancel</button>
                              </>
                            ) : (
                              <>
                                <button onClick={() => { setEditingPhcyId(ph.id); setEditPhcyForm({ name: ph.name, address: ph.address, city: ph.city, phone: ph.phone || "" }); }}
                                  className="p-1.5 rounded-lg text-gray-500 hover:text-[#C9A84C] hover:bg-[#C9A84C]/10 transition-all" title="Edit">
                                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                                </button>
                                <button onClick={() => handleDeletePharmacy(ph.id)} disabled={actionLoading[ph.id] === "delete"}
                                  className="p-1.5 rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-all" title="Delete">
                                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Verification Tab ──────────────────────────────── */}
        {activeTab === "verification" && (
          <div className="space-y-5">
            <h2 className="text-lg font-display text-white gold-underline pb-2">Pending Verifications</h2>
            {pendingPharmacists.length === 0 ? (
              <div className="dark-glass rounded-xl p-10 text-center">
                <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 ring-1 ring-emerald-500/20">
                  <svg className="w-7 h-7 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-sm text-gray-400 font-body">All clear. No pending verifications.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingPharmacists.map((pharm, i) => (
                  <div key={pharm.id} className="dark-glass rounded-xl p-5 animate-stagger" style={{ animationDelay: `${i * 80}ms` }}>
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#C9A84C]/20 to-[#C9A84C]/5 flex items-center justify-center ring-1 ring-[#C9A84C]/20">
                            <span className="text-sm font-bold text-[#C9A84C]">{pharm.full_name?.[0]?.toUpperCase() || "?"}</span>
                          </div>
                          <div>
                            <h3 className="text-base font-display text-white">{pharm.full_name}</h3>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-amber-500/15 text-amber-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />Pending Review
                            </span>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm font-body">
                          {[
                            ["License", pharm.license_number],
                            ["Country", pharm.country],
                            ["Specialization", pharm.specialization],
                            ["Submitted", pharm.created_at ? new Date(pharm.created_at).toLocaleDateString() : "N/A"],
                          ].map(([label, value]) => (
                            <div key={label}>
                              <span className="text-gray-500 text-xs">{label}: </span>
                              <span className="text-gray-300 text-xs">{value}</span>
                            </div>
                          ))}
                        </div>
                        {pharm.bio && <p className="mt-2 text-sm text-gray-400 font-body line-clamp-2">{pharm.bio}</p>}
                        {pharm.license_doc_url && (
                          <a href={pharm.license_doc_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-2 text-xs font-body font-medium text-[#C9A84C] hover:text-[#E8D48B] transition-colors">
                            <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" /></svg>
                            View License
                          </a>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => handleVerifyAction(pharm.id, "approve")} disabled={!!verifyLoading[pharm.id]}
                          className="px-4 py-2 text-xs font-body font-semibold rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/20 transition-all disabled:opacity-50">
                          {verifyLoading[pharm.id] === "approve" ? "..." : "Approve"}
                        </button>
                        <button onClick={() => handleVerifyAction(pharm.id, "reject")} disabled={!!verifyLoading[pharm.id]}
                          className="px-4 py-2 text-xs font-body font-semibold rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/20 transition-all disabled:opacity-50">
                          {verifyLoading[pharm.id] === "reject" ? "..." : "Reject"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Flagged Messages Tab ──────────────────────────── */}
        {activeTab === "flagged" && (
          <div className="space-y-5">
            <h2 className="text-lg font-display text-white gold-underline pb-2">Flagged Messages</h2>
            {flaggedMessages.length === 0 ? (
              <div className="dark-glass rounded-xl p-10 text-center">
                <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 ring-1 ring-emerald-500/20">
                  <svg className="w-7 h-7 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-sm text-gray-400 font-body">No flagged messages. All clear.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {flaggedMessages.map((msg, i) => (
                  <div key={msg.id} className="dark-glass rounded-xl p-4 border-l-2 border-l-red-500/50 animate-stagger" style={{ animationDelay: `${i * 60}ms` }}>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                          msg.severity === "high" ? "bg-red-500/15 text-red-400" : msg.severity === "medium" ? "bg-amber-500/15 text-amber-400" : "bg-gray-500/15 text-gray-400"
                        }`}>
                          {msg.flag_reason || "Flagged"}
                        </span>
                        <span className="text-[11px] text-gray-600 font-body">{msg.created_at ? new Date(msg.created_at).toLocaleString() : ""}</span>
                      </div>
                      <span className="text-[11px] text-gray-600 font-mono">Room: {msg.room_slug || "N/A"}</span>
                    </div>
                    <div className="rounded-lg bg-warm-50/[0.03] border border-white/5 p-3 mb-3">
                      <p className="text-[11px] font-body text-gray-500 mb-1">{msg.sender} ({msg.sender_type || "user"})</p>
                      <p className="text-sm text-gray-200 font-body">{msg.content}</p>
                    </div>
                    {msg.context && msg.context.length > 0 && (
                      <div className="mb-3">
                        <p className="text-[11px] font-body text-gray-500 mb-1.5">Context:</p>
                        <div className="space-y-1">
                          {msg.context.map((ctx, ci) => (
                            <div key={ci} className="text-xs text-gray-500 font-body pl-3 border-l border-white/10">
                              <span className="text-gray-400">{ctx.sender}:</span> {ctx.content}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button className="px-3 py-1.5 text-xs font-body text-gray-400 hover:text-white hover:bg-warm-50/5 rounded-lg border border-white/10 transition-all">Dismiss</button>
                      <button className="px-3 py-1.5 text-xs font-body text-red-400 hover:bg-red-500/10 rounded-lg border border-red-500/20 transition-all">Ban User</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── AI Stats Tab ──────────────────────────────────── */}
        {activeTab === "ai-stats" && (
          <div className="space-y-6">
            <h2 className="text-lg font-display text-white gold-underline pb-2">AI Performance</h2>
            {!aiStats ? (
              <div className="dark-glass rounded-xl p-10 text-center">
                <p className="text-sm text-gray-500 font-body">No AI stats available</p>
              </div>
            ) : (
              <>
                <div className="dark-glass rounded-xl p-5 sm:p-6">
                  <h3 className="text-xs font-body font-semibold text-[#C9A84C] mb-5 uppercase tracking-[0.2em]">Model Usage</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {(aiStats.model_usage || []).map((model, i) => (
                      <div key={model.model_name || model.model} className="gold-glass rounded-lg p-4 animate-stagger" style={{ animationDelay: `${i * 80}ms` }}>
                        <p className="text-sm font-body font-medium text-gray-300 truncate">{model.model_name || model.model}</p>
                        <p className="text-2xl font-display text-white mt-1">{(model.count || 0).toLocaleString()}</p>
                        <p className="text-[11px] text-gray-500 font-body uppercase tracking-wider">requests</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { label: "Total Requests", value: (aiStats.total_requests || 0).toLocaleString(), color: "text-white" },
                    { label: "Errors", value: (aiStats.total_errors || 0).toLocaleString(), color: "text-red-400" },
                    { label: "Error Rate", value: `${(aiStats.error_rate || 0).toFixed(2)}%`, color: (aiStats.error_rate || 0) > 5 ? "text-red-400" : "text-emerald-400" },
                  ].map((s, i) => (
                    <div key={s.label} className="dark-glass rounded-xl p-4 stat-glow animate-stagger" style={{ animationDelay: `${i * 80}ms` }}>
                      <p className="text-[11px] font-body text-gray-500 uppercase tracking-wider">{s.label}</p>
                      <p className={`text-2xl font-display mt-1 ${s.color}`}>{s.value}</p>
                    </div>
                  ))}
                </div>
                {aiStats.avg_response_ms != null && (
                  <div className="dark-glass rounded-xl p-5">
                    <h3 className="text-xs font-body font-semibold text-[#C9A84C] mb-2 uppercase tracking-[0.2em]">Avg Response Time</h3>
                    <p className="text-4xl font-display gold-text">{aiStats.avg_response_ms}ms</p>
                    <p className="text-[11px] text-gray-500 font-body mt-1">AI model response latency</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── Analytics Tab ─────────────────────────────────── */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <h2 className="text-lg font-display text-white gold-underline pb-2">Analytics Dashboard</h2>
            <AnalyticsCharts />
          </div>
        )}

        {/* ── Academy Tab ────────────────────────────────────── */}
        {activeTab === "academy" && (
          <div className="space-y-6">
            <h2 className="text-lg font-display text-white gold-underline pb-2">Academy Management</h2>

            {/* Academy Sub-tabs */}
            <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-1">
              {[
                { key: "overview", label: "Overview", icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" },
                { key: "courses", label: "Courses", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
                { key: "quizzes", label: "Quiz Questions", icon: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
                { key: "certificates", label: "Certificates", icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" },
              ].map((sub) => (
                <button
                  key={sub.key}
                  type="button"
                  onClick={() => setAcademySubTab(sub.key)}
                  className={`group flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-body font-medium whitespace-nowrap transition-all duration-200 ${
                    academySubTab === sub.key
                      ? "bg-[#C9A84C]/15 text-[#E8D48B] ring-1 ring-[#C9A84C]/30"
                      : "text-gray-500 hover:text-gray-300 hover:bg-warm-50/5"
                  }`}
                >
                  <svg className={`w-3.5 h-3.5 transition-colors ${academySubTab === sub.key ? "text-[#C9A84C]" : "text-gray-600 group-hover:text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={sub.icon} />
                  </svg>
                  {sub.label}
                </button>
              ))}
            </div>

            {academyLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-2 border-transparent border-t-[#C9A84C] rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {/* ── Overview Sub-tab ── */}
                {academySubTab === "overview" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                      {[
                        { label: "Courses", value: academyStats?.total_courses ?? (academyCourses.length || 14), color: "from-[#C9A84C]/20 to-transparent" },
                        { label: "Total Lessons", value: academyStats?.total_lessons ?? 85, color: "from-sky-500/20 to-transparent" },
                        { label: "Quiz Questions", value: academyStats?.total_quiz_questions ?? 309, color: "from-emerald-500/20 to-transparent" },
                        { label: "Flashcard Decks", value: academyStats?.total_flashcard_decks ?? 8, color: "from-purple-500/20 to-transparent" },
                        { label: "Flashcards", value: academyStats?.total_flashcards ?? 75, color: "from-indigo-500/20 to-transparent" },
                        { label: "Lab Simulations", value: academyStats?.total_simulations ?? 6, color: "from-teal-500/20 to-transparent" },
                        { label: "Calc Problems", value: academyStats?.total_calc_problems ?? 18, color: "from-amber-500/20 to-transparent" },
                        { label: "Certificates", value: academyStats?.total_certificates ?? certificates.length, color: "from-rose-500/20 to-transparent" },
                      ].map((stat, i) => (
                        <div key={stat.label} className="relative overflow-hidden dark-glass rounded-xl p-4 stat-glow animate-stagger" style={{ animationDelay: `${i * 60}ms` }}>
                          <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-50`} />
                          <div className="relative">
                            <p className="text-2xl sm:text-3xl font-display text-white tracking-tight">{stat.value}</p>
                            <p className="text-[11px] text-gray-500 mt-1 font-body uppercase tracking-wider">{stat.label}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Quick tools grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { name: "Flashcard Decks", items: academyStats?.flashcard_decks || [
                          { name: "Drug Classifications", cards: 10 }, { name: "Mechanisms of Action", cards: 10 }, { name: "Side Effects & ADRs", cards: 10 },
                          { name: "Drug Interactions", cards: 10 }, { name: "Dosage Forms & Routes", cards: 8 }, { name: "Pharma Calculations", cards: 10 },
                          { name: "Ghana Pharmacy Law", cards: 8 }, { name: "Tropical Disease Drugs", cards: 9 },
                        ], color: "purple", valueKey: "cards" },
                        { name: "Compounding Lab", items: academyStats?.simulations || [
                          { name: "ORS Preparation", completions: 0 }, { name: "Calamine Lotion", completions: 0 }, { name: "Hydrocortisone Cream", completions: 0 },
                          { name: "Paracetamol Suspension", completions: 0 }, { name: "Capsule Filling", completions: 0 }, { name: "Chlorhexidine Mouthwash", completions: 0 },
                        ], color: "teal", valueKey: "completions", suffix: " done" },
                        { name: "Calc Trainer", items: academyStats?.calc_categories || [
                          { name: "Dosage", problems: 5 }, { name: "IV Drip Rates", problems: 3 }, { name: "Dilutions", problems: 3 },
                          { name: "Pediatric", problems: 4 }, { name: "Compounding", problems: 3 },
                        ], color: "amber", valueKey: "problems", suffix: " problems" },
                      ].map((section) => (
                        <div key={section.name} className="dark-glass rounded-xl p-5">
                          <h4 className="text-xs font-body font-semibold text-[#C9A84C] mb-4 uppercase tracking-[0.15em]">{section.name}</h4>
                          <div className="space-y-2.5">
                            {section.items.map((item) => (
                              <div key={item.name} className="flex items-center justify-between">
                                <span className="text-xs text-gray-500 font-body truncate mr-2">{item.name}</span>
                                <span className="text-xs font-semibold text-gray-300 font-mono shrink-0">{item[section.valueKey]}{section.suffix || ""}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Courses Sub-tab ── */}
                {academySubTab === "courses" && (
                  <div className="space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <p className="text-sm text-gray-400 font-body">{academyCourses.length} courses &middot; {academyCourses.reduce((s, c) => s + (c.lessons || 0), 0)} lessons total</p>
                      <button
                        onClick={() => setShowAddCourse(!showAddCourse)}
                        className="px-4 py-2 text-xs font-body font-semibold rounded-lg bg-[#C9A84C] text-gray-900 hover:bg-[#E8D48B] transition-colors"
                      >
                        {showAddCourse ? "Cancel" : "+ Add Course"}
                      </button>
                    </div>

                    {/* Add Course Form */}
                    {showAddCourse && (
                      <form onSubmit={handleAddCourse} className="gold-glass rounded-xl p-5 sm:p-6 space-y-4">
                        <h3 className="text-base font-display text-white">New Course</h3>
                        {addCourseError && (
                          <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-300 font-body">{addCourseError}</div>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="sm:col-span-2">
                            <label className="block text-[11px] font-body font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Course Title *</label>
                            <input type="text" required value={addCourseForm.title} onChange={(e) => setAddCourseForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Advanced Pharmacology II" className="admin-input" />
                          </div>
                          <div>
                            <label className="block text-[11px] font-body font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Year *</label>
                            <select required value={addCourseForm.year} onChange={(e) => setAddCourseForm(p => ({ ...p, year: parseInt(e.target.value) }))} className="admin-select w-full">
                              {[1, 2, 3, 4, 5, 6].map(y => <option key={y} value={y}>Year {y}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[11px] font-body font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Difficulty *</label>
                            <select required value={addCourseForm.difficulty} onChange={(e) => setAddCourseForm(p => ({ ...p, difficulty: e.target.value }))} className="admin-select w-full">
                              {["Beginner", "Intermediate", "Advanced"].map(d => <option key={d}>{d}</option>)}
                            </select>
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-[11px] font-body font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Description</label>
                            <textarea rows={2} value={addCourseForm.description} onChange={(e) => setAddCourseForm(p => ({ ...p, description: e.target.value }))} className="admin-input resize-none" placeholder="Brief course overview..." />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                          <button type="button" onClick={() => setShowAddCourse(false)} className="px-4 py-2 text-sm font-body text-gray-400 hover:text-white transition-colors">Cancel</button>
                          <button type="submit" disabled={addCourseLoading} className="px-5 py-2 text-sm font-body font-semibold rounded-lg bg-[#C9A84C] text-gray-900 hover:bg-[#E8D48B] transition-colors disabled:opacity-50">
                            {addCourseLoading ? "Adding..." : "Add Course"}
                          </button>
                        </div>
                      </form>
                    )}

                    {/* Course Cards */}
                    {academyCourses.length === 0 ? (
                      <div className="dark-glass rounded-xl p-10 text-center">
                        <p className="text-sm text-gray-500 font-body">No courses found. Add your first course above.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {academyCourses.map((course, i) => (
                          <div key={course.id} className="dark-glass rounded-xl overflow-hidden animate-stagger" style={{ animationDelay: `${i * 50}ms` }}>
                            {/* Course Header Row */}
                            <div className="flex items-center gap-3 p-4 hover:bg-warm-50/[0.02] transition-colors">
                              <button onClick={() => setExpandedCourseId(expandedCourseId === course.id ? null : course.id)} className="p-1 text-gray-500 hover:text-[#C9A84C] transition-colors">
                                <svg className={`w-4 h-4 transition-transform duration-200 ${expandedCourseId === course.id ? "rotate-90" : ""}`} viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                              </button>
                              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#C9A84C]/20 to-[#C9A84C]/5 flex items-center justify-center ring-1 ring-[#C9A84C]/20 shrink-0">
                                <svg className="w-4 h-4 text-[#C9A84C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                              </div>
                              <div className="flex-1 min-w-0">
                                {editingCourseId === course.id ? (
                                  <div className="flex flex-wrap items-center gap-2">
                                    <input type="text" value={editCourseForm.title ?? course.title} onChange={(e) => setEditCourseForm(f => ({ ...f, title: e.target.value }))} className="admin-input text-sm py-1.5 flex-1 min-w-[200px]" />
                                    <select value={editCourseForm.year ?? course.year} onChange={(e) => setEditCourseForm(f => ({ ...f, year: parseInt(e.target.value) }))} className="admin-select text-xs py-1.5">
                                      {[1,2,3,4,5,6].map(y => <option key={y} value={y}>Year {y}</option>)}
                                    </select>
                                    <select value={editCourseForm.difficulty ?? course.difficulty} onChange={(e) => setEditCourseForm(f => ({ ...f, difficulty: e.target.value }))} className="admin-select text-xs py-1.5">
                                      {["Beginner","Intermediate","Advanced"].map(d => <option key={d}>{d}</option>)}
                                    </select>
                                  </div>
                                ) : (
                                  <div>
                                    <p className="font-body font-medium text-gray-200">{course.title}</p>
                                    <p className="text-[11px] text-gray-500 font-body">Year {course.year} &middot; {course.lessons} lessons &middot; {course.quizQuestions || course.lessons * 3} quiz questions</p>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className={`inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                                  course.difficulty === "Advanced" ? "bg-red-500/15 text-red-400" :
                                  course.difficulty === "Intermediate" ? "bg-amber-500/15 text-amber-400" :
                                  "bg-emerald-500/15 text-emerald-400"
                                }`}>{course.difficulty}</span>
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full cursor-pointer transition-all ${
                                  (course.status || "active") === "active" ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25" : "bg-gray-500/15 text-gray-400 hover:bg-gray-500/25"
                                }`} onClick={() => handleToggleCourseStatus(course.id, course.status || "active")} title="Click to toggle status">
                                  <span className={`w-1.5 h-1.5 rounded-full ${(course.status || "active") === "active" ? "bg-emerald-400" : "bg-gray-500"}`} />
                                  {(course.status || "active") === "active" ? "Active" : "Draft"}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                {editingCourseId === course.id ? (
                                  <>
                                    <button onClick={() => handleUpdateCourse(course.id)} disabled={actionLoading[course.id] === "save"}
                                      className="px-3 py-1.5 text-xs font-body font-semibold rounded-lg bg-[#C9A84C] text-gray-900 hover:bg-[#E8D48B] transition-colors disabled:opacity-50">
                                      {actionLoading[course.id] === "save" ? "..." : "Save"}
                                    </button>
                                    <button onClick={() => setEditingCourseId(null)} className="px-3 py-1.5 text-xs font-body text-gray-400 hover:text-white transition-colors">Cancel</button>
                                  </>
                                ) : (
                                  <>
                                    <button onClick={() => { setEditingCourseId(course.id); setEditCourseForm({ title: course.title, year: course.year, difficulty: course.difficulty }); }}
                                      className="p-1.5 rounded-lg text-gray-500 hover:text-[#C9A84C] hover:bg-[#C9A84C]/10 transition-all" title="Edit course">
                                      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                                    </button>
                                    <button onClick={() => handleDeleteCourse(course.id)} disabled={actionLoading[course.id] === "delete"}
                                      className="p-1.5 rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-all" title="Delete course">
                                      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Expanded Lessons Panel */}
                            {expandedCourseId === course.id && (
                              <div className="border-t border-white/5 bg-warm-50/[0.02]">
                                <div className="px-4 py-3 flex items-center justify-between">
                                  <p className="text-[11px] font-body font-semibold text-[#C9A84C]/70 uppercase tracking-[0.15em]">Lessons ({course.lessons})</p>
                                  <button onClick={() => setShowAddLesson(showAddLesson === course.id ? null : course.id)}
                                    className="px-3 py-1.5 text-[11px] font-body font-semibold rounded-lg bg-[#C9A84C]/10 text-[#C9A84C] hover:bg-[#C9A84C]/20 border border-[#C9A84C]/20 transition-all">
                                    {showAddLesson === course.id ? "Cancel" : "+ Add Lesson"}
                                  </button>
                                </div>

                                {/* Add Lesson Form */}
                                {showAddLesson === course.id && (
                                  <form onSubmit={(e) => handleAddLesson(e, course.id)} className="mx-4 mb-3 gold-glass rounded-lg p-4 space-y-3">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                      <div>
                                        <label className="block text-[10px] font-body font-medium text-gray-400 mb-1 uppercase tracking-wider">Lesson Title *</label>
                                        <input type="text" required value={addLessonForm.title} onChange={(e) => setAddLessonForm(p => ({ ...p, title: e.target.value }))} className="admin-input text-xs" placeholder="e.g. Introduction to Drug Metabolism" />
                                      </div>
                                      <div>
                                        <label className="block text-[10px] font-body font-medium text-gray-400 mb-1 uppercase tracking-wider">Duration</label>
                                        <input type="text" value={addLessonForm.duration} onChange={(e) => setAddLessonForm(p => ({ ...p, duration: e.target.value }))} className="admin-input text-xs" placeholder="e.g. 25 min" />
                                      </div>
                                      <div className="sm:col-span-2">
                                        <label className="block text-[10px] font-body font-medium text-gray-400 mb-1 uppercase tracking-wider">Content *</label>
                                        <textarea rows={3} required value={addLessonForm.content} onChange={(e) => setAddLessonForm(p => ({ ...p, content: e.target.value }))} className="admin-input text-xs resize-none" placeholder="Lesson content..." />
                                      </div>
                                      <div className="sm:col-span-2">
                                        <label className="block text-[10px] font-body font-medium text-gray-400 mb-1 uppercase tracking-wider">Key Points (one per line)</label>
                                        <textarea rows={2} value={addLessonForm.keyPoints} onChange={(e) => setAddLessonForm(p => ({ ...p, keyPoints: e.target.value }))} className="admin-input text-xs resize-none" placeholder="Point 1&#10;Point 2&#10;Point 3" />
                                      </div>
                                    </div>
                                    <div className="flex justify-end gap-2">
                                      <button type="button" onClick={() => setShowAddLesson(null)} className="px-3 py-1.5 text-xs font-body text-gray-400 hover:text-white transition-colors">Cancel</button>
                                      <button type="submit" disabled={!!actionLoading[`lesson-${course.id}`]} className="px-4 py-1.5 text-xs font-body font-semibold rounded-lg bg-[#C9A84C] text-gray-900 hover:bg-[#E8D48B] transition-colors disabled:opacity-50">
                                        {actionLoading[`lesson-${course.id}`] ? "Adding..." : "Add Lesson"}
                                      </button>
                                    </div>
                                  </form>
                                )}

                                {/* Lesson list */}
                                <div className="px-4 pb-4 space-y-1.5">
                                  {(course.lessonsList || Array.from({ length: course.lessons }, (_, li) => ({
                                    id: `${course.id}-lesson-${li + 1}`,
                                    title: `Lesson ${li + 1}`,
                                    duration: "~20 min",
                                  }))).map((lesson, li) => (
                                    <div key={lesson.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-warm-50/[0.03] border border-white/5 hover:border-[#C9A84C]/20 transition-all group">
                                      <span className="w-6 h-6 rounded-md bg-[#C9A84C]/10 flex items-center justify-center text-[10px] font-bold text-[#C9A84C] shrink-0">{li + 1}</span>
                                      {editingLessonId === lesson.id ? (
                                        <div className="flex-1 flex flex-wrap items-center gap-2">
                                          <input type="text" value={editLessonForm.title ?? lesson.title} onChange={(e) => setEditLessonForm(f => ({ ...f, title: e.target.value }))} className="admin-input text-xs py-1 flex-1 min-w-[150px]" />
                                          <input type="text" value={editLessonForm.duration ?? lesson.duration} onChange={(e) => setEditLessonForm(f => ({ ...f, duration: e.target.value }))} className="admin-input text-xs py-1 w-24" placeholder="Duration" />
                                          <button onClick={() => handleUpdateLesson(course.id, lesson.id)} disabled={actionLoading[`lesson-${lesson.id}`] === "save"}
                                            className="px-2.5 py-1 text-[11px] font-body font-semibold rounded-md bg-[#C9A84C] text-gray-900 hover:bg-[#E8D48B] transition-colors disabled:opacity-50">
                                            {actionLoading[`lesson-${lesson.id}`] === "save" ? "..." : "Save"}
                                          </button>
                                          <button onClick={() => setEditingLessonId(null)} className="px-2 py-1 text-[11px] font-body text-gray-400 hover:text-white transition-colors">Cancel</button>
                                        </div>
                                      ) : (
                                        <>
                                          <div className="flex-1 min-w-0">
                                            <p className="text-xs font-body text-gray-300 truncate">{lesson.title}</p>
                                          </div>
                                          <span className="text-[10px] text-gray-600 font-body shrink-0">{lesson.duration}</span>
                                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => { setEditingLessonId(lesson.id); setEditLessonForm({ title: lesson.title, duration: lesson.duration }); }}
                                              className="p-1 rounded text-gray-500 hover:text-[#C9A84C] hover:bg-[#C9A84C]/10 transition-all" title="Edit lesson">
                                              <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                                            </button>
                                            <button onClick={() => handleDeleteLesson(course.id, lesson.id)}
                                              className="p-1 rounded text-red-400/50 hover:text-red-400 hover:bg-red-500/10 transition-all" title="Delete lesson">
                                              <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                            </button>
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ── Quiz Questions Sub-tab ── */}
                {academySubTab === "quizzes" && (
                  <div className="space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <select value={quizCategoryFilter} onChange={(e) => setQuizCategoryFilter(e.target.value)} className="admin-select text-xs">
                          <option value="all">All Categories</option>
                          {["pharmacology", "pharmaceutical_chemistry", "pharmacognosy", "clinical_pharmacy", "pharmacy_practice"].map(c => (
                            <option key={c} value={c}>{c.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</option>
                          ))}
                        </select>
                        <p className="text-sm text-gray-500 font-body">{quizQuestions.length} questions</p>
                      </div>
                      <button
                        onClick={() => setShowAddQuiz(!showAddQuiz)}
                        className="px-4 py-2 text-xs font-body font-semibold rounded-lg bg-[#C9A84C] text-gray-900 hover:bg-[#E8D48B] transition-colors"
                      >
                        {showAddQuiz ? "Cancel" : "+ Add Question"}
                      </button>
                    </div>

                    {/* Add Quiz Question Form */}
                    {showAddQuiz && (
                      <form onSubmit={handleAddQuizQuestion} className="gold-glass rounded-xl p-5 sm:p-6 space-y-4">
                        <h3 className="text-base font-display text-white">New Quiz Question</h3>
                        {addQuizError && (
                          <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-300 font-body">{addQuizError}</div>
                        )}
                        <div className="space-y-4">
                          <div>
                            <label className="block text-[11px] font-body font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Category *</label>
                            <select required value={addQuizForm.category} onChange={(e) => setAddQuizForm(p => ({ ...p, category: e.target.value }))} className="admin-select w-full">
                              {["pharmacology", "pharmaceutical_chemistry", "pharmacognosy", "clinical_pharmacy", "pharmacy_practice"].map(c => (
                                <option key={c} value={c}>{c.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[11px] font-body font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Question *</label>
                            <textarea rows={2} required value={addQuizForm.question} onChange={(e) => setAddQuizForm(p => ({ ...p, question: e.target.value }))} className="admin-input resize-none" placeholder="Enter the question..." />
                          </div>
                          <div>
                            <label className="block text-[11px] font-body font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Options *</label>
                            <div className="space-y-2">
                              {addQuizForm.options.map((opt, oi) => (
                                <div key={oi} className="flex items-center gap-2">
                                  <button type="button" onClick={() => setAddQuizForm(p => ({ ...p, correct: oi }))}
                                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                                      addQuizForm.correct === oi ? "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30" : "bg-warm-50/5 text-gray-500 hover:text-gray-300"
                                    }`} title={addQuizForm.correct === oi ? "Correct answer" : "Mark as correct"}>
                                    {String.fromCharCode(65 + oi)}
                                  </button>
                                  <input type="text" required value={opt} onChange={(e) => { const opts = [...addQuizForm.options]; opts[oi] = e.target.value; setAddQuizForm(p => ({ ...p, options: opts })); }}
                                    className="admin-input text-sm flex-1" placeholder={`Option ${String.fromCharCode(65 + oi)}`} />
                                </div>
                              ))}
                              <p className="text-[10px] text-gray-600 font-body">Click a letter to mark the correct answer (highlighted in green)</p>
                            </div>
                          </div>
                          <div>
                            <label className="block text-[11px] font-body font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Explanation</label>
                            <textarea rows={2} value={addQuizForm.explanation} onChange={(e) => setAddQuizForm(p => ({ ...p, explanation: e.target.value }))} className="admin-input resize-none" placeholder="Why is this the correct answer?" />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                          <button type="button" onClick={() => setShowAddQuiz(false)} className="px-4 py-2 text-sm font-body text-gray-400 hover:text-white transition-colors">Cancel</button>
                          <button type="submit" disabled={addQuizLoading} className="px-5 py-2 text-sm font-body font-semibold rounded-lg bg-[#C9A84C] text-gray-900 hover:bg-[#E8D48B] transition-colors disabled:opacity-50">
                            {addQuizLoading ? "Adding..." : "Add Question"}
                          </button>
                        </div>
                      </form>
                    )}

                    {/* Quiz Questions List */}
                    {quizQuestions.length === 0 ? (
                      <div className="dark-glass rounded-xl p-10 text-center">
                        <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 ring-1 ring-emerald-500/20">
                          <svg className="w-7 h-7 text-emerald-400/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <p className="text-sm text-gray-400 font-body">No quiz questions found{quizCategoryFilter !== "all" ? ` in ${quizCategoryFilter.replace(/_/g, " ")}` : ""}</p>
                        <p className="text-xs text-gray-600 font-body mt-1">Quiz questions from the API will appear here. Add new questions above.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {quizQuestions.map((q, qi) => (
                          <div key={q.id || qi} className="dark-glass rounded-xl p-4 animate-stagger" style={{ animationDelay: `${qi * 40}ms` }}>
                            {editingQuizId === (q.id || qi) ? (
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-[10px] font-body font-medium text-gray-400 mb-1 uppercase tracking-wider">Category</label>
                                  <select value={editQuizForm.category ?? q.category} onChange={(e) => setEditQuizForm(f => ({ ...f, category: e.target.value }))} className="admin-select w-full text-xs">
                                    {["pharmacology", "pharmaceutical_chemistry", "pharmacognosy", "clinical_pharmacy", "pharmacy_practice"].map(c => (
                                      <option key={c} value={c}>{c.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-[10px] font-body font-medium text-gray-400 mb-1 uppercase tracking-wider">Question</label>
                                  <textarea rows={2} value={editQuizForm.question ?? q.question} onChange={(e) => setEditQuizForm(f => ({ ...f, question: e.target.value }))} className="admin-input text-xs resize-none" />
                                </div>
                                <div className="space-y-1.5">
                                  {(editQuizForm.options ?? q.options ?? []).map((opt, oi) => (
                                    <div key={oi} className="flex items-center gap-2">
                                      <button type="button" onClick={() => setEditQuizForm(f => ({ ...f, correct: oi }))}
                                        className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 transition-all ${
                                          (editQuizForm.correct ?? q.correct) === oi ? "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30" : "bg-warm-50/5 text-gray-500"
                                        }`}>{String.fromCharCode(65 + oi)}</button>
                                      <input type="text" value={opt} onChange={(e) => {
                                        const opts = [...(editQuizForm.options ?? q.options ?? [])];
                                        opts[oi] = e.target.value;
                                        setEditQuizForm(f => ({ ...f, options: opts }));
                                      }} className="admin-input text-xs py-1 flex-1" />
                                    </div>
                                  ))}
                                </div>
                                <div>
                                  <label className="block text-[10px] font-body font-medium text-gray-400 mb-1 uppercase tracking-wider">Explanation</label>
                                  <textarea rows={2} value={editQuizForm.explanation ?? q.explanation ?? ""} onChange={(e) => setEditQuizForm(f => ({ ...f, explanation: e.target.value }))} className="admin-input text-xs resize-none" />
                                </div>
                                <div className="flex justify-end gap-2">
                                  <button onClick={() => setEditingQuizId(null)} className="px-3 py-1.5 text-xs font-body text-gray-400 hover:text-white transition-colors">Cancel</button>
                                  <button onClick={() => handleUpdateQuizQuestion(q.id || qi)} disabled={actionLoading[`quiz-${q.id || qi}`] === "save"}
                                    className="px-4 py-1.5 text-xs font-body font-semibold rounded-lg bg-[#C9A84C] text-gray-900 hover:bg-[#E8D48B] transition-colors disabled:opacity-50">
                                    {actionLoading[`quiz-${q.id || qi}`] === "save" ? "Saving..." : "Save Changes"}
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-start justify-between gap-3 mb-3">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1.5">
                                      <span className="inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-full bg-sky-500/15 text-sky-400">
                                        {(q.category || "general").replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                                      </span>
                                      <span className="text-[10px] text-gray-600 font-mono">#{qi + 1}</span>
                                    </div>
                                    <p className="text-sm text-gray-200 font-body">{q.question}</p>
                                  </div>
                                  <div className="flex items-center gap-1 shrink-0">
                                    <button onClick={() => { setEditingQuizId(q.id || qi); setEditQuizForm({ question: q.question, options: [...(q.options || [])], correct: q.correct, category: q.category, explanation: q.explanation }); }}
                                      className="p-1.5 rounded-lg text-gray-500 hover:text-[#C9A84C] hover:bg-[#C9A84C]/10 transition-all" title="Edit">
                                      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                                    </button>
                                    <button onClick={() => handleDeleteQuizQuestion(q.id || qi)}
                                      className="p-1.5 rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-all" title="Delete">
                                      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                    </button>
                                  </div>
                                </div>
                                {q.options && (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-2">
                                    {q.options.map((opt, oi) => (
                                      <div key={oi} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-body ${
                                        q.correct === oi ? "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20" : "bg-warm-50/[0.03] text-gray-400"
                                      }`}>
                                        <span className="font-bold text-[10px]">{String.fromCharCode(65 + oi)}.</span>
                                        <span className="truncate">{opt}</span>
                                        {q.correct === oi && (
                                          <svg className="w-3.5 h-3.5 ml-auto shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {q.explanation && <p className="text-[11px] text-gray-500 font-body italic">{q.explanation}</p>}
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ── Certificates Sub-tab ── */}
                {academySubTab === "certificates" && (
                  <div className="space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <p className="text-sm text-gray-400 font-body">{certificates.length} certificates issued</p>
                      <div className="relative max-w-xs">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input type="text" placeholder="Search by student, course, or cert ID..." value={certSearch} onChange={(e) => setCertSearch(e.target.value)} className="admin-input pl-9 text-xs" />
                      </div>
                    </div>

                    {certificates.length === 0 ? (
                      <div className="dark-glass rounded-xl p-10 text-center">
                        <div className="w-14 h-14 mx-auto rounded-full bg-[#C9A84C]/10 flex items-center justify-center mb-4 ring-1 ring-[#C9A84C]/20">
                          <svg className="w-7 h-7 text-[#C9A84C]/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                          </svg>
                        </div>
                        <p className="text-sm text-gray-400 font-body">No certificates issued yet</p>
                        <p className="text-xs text-gray-600 font-body mt-1">Certificates appear here when students complete courses and pass all quizzes</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto dark-glass rounded-xl">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-white/5">
                              {["Certificate ID", "Student", "Course", "Score", "Date", "Status", "Actions"].map((h) => (
                                <th key={h} className={`px-4 py-3.5 text-[10px] font-body font-semibold text-[#C9A84C]/70 uppercase tracking-[0.15em] ${h === "Actions" ? "text-right" : h === "Score" || h === "Status" ? "text-center" : "text-left"}`}>
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {certificates
                              .filter((c) => !certSearch || c.student_name?.toLowerCase().includes(certSearch.toLowerCase()) || c.cert_id?.toLowerCase().includes(certSearch.toLowerCase()) || c.course_title?.toLowerCase().includes(certSearch.toLowerCase()))
                              .map((cert, i) => (
                              <tr key={cert.cert_id || i} className="hover:bg-warm-50/[0.02] transition-colors">
                                <td className="px-4 py-3 font-mono text-xs text-[#C9A84C]">{cert.cert_id}</td>
                                <td className="px-4 py-3">
                                  <p className="font-body text-gray-200 text-sm">{cert.student_name}</p>
                                  {cert.student_email && <p className="text-[11px] text-gray-500 font-body">{cert.student_email}</p>}
                                </td>
                                <td className="px-4 py-3 font-body text-gray-400 text-xs">{cert.course_title}</td>
                                <td className="px-4 py-3 text-center">
                                  <span className={`font-mono font-semibold ${cert.score >= 70 ? "text-emerald-400" : "text-amber-400"}`}>{cert.score}%</span>
                                </td>
                                <td className="px-4 py-3 text-xs text-gray-500 font-body">{cert.issued_at ? new Date(cert.issued_at).toLocaleDateString() : "N/A"}</td>
                                <td className="px-4 py-3 text-center">
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                                    cert.revoked ? "bg-red-500/15 text-red-400" : "bg-emerald-500/15 text-emerald-400"
                                  }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${cert.revoked ? "bg-red-400" : "bg-emerald-400"}`} />
                                    {cert.revoked ? "Revoked" : "Valid"}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                  {cert.revoked ? (
                                    <span className="text-[11px] text-gray-600 font-body">Revoked</span>
                                  ) : (
                                    <button
                                      onClick={() => handleRevokeCertificate(cert.cert_id)}
                                      disabled={actionLoading[`cert-${cert.cert_id}`] === "revoke"}
                                      className="px-3 py-1.5 text-xs font-body text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg border border-white/10 hover:border-red-500/20 transition-all disabled:opacity-50"
                                    >
                                      {actionLoading[`cert-${cert.cert_id}`] === "revoke" ? "Revoking..." : "Revoke"}
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
