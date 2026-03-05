import { Routes, Route, Link, NavLink } from "react-router-dom";
import { lazy, Suspense, useState } from "react";
import useChatStore from "./store/chatStore";

// Lazy-loaded route components
const Home = lazy(() => import("./pages/Home"));
const ChatRoom = lazy(() => import("./pages/ChatRoom"));
const PharmacistPortal = lazy(() => import("./pages/PharmacistPortal"));
const DrugDatabase = lazy(() => import("./pages/DrugDatabase"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  );
}

function Navbar() {
  const { user, logout, darkMode, toggleDarkMode } = useChatStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinkClass = ({ isActive }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"
        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
    }`;

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 kente-border-accent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img src="/logo.svg" alt="PozosPharma" className="h-8 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink to="/" end className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/drugs" className={navLinkClass}>
              Drug Database
            </NavLink>
            {user && (
              <NavLink to="/chat/general" className={navLinkClass}>
                Chat
              </NavLink>
            )}
            {user?.role === "pharmacist" && (
              <NavLink to="/pharmacist-portal" className={navLinkClass}>
                Pharmacist Portal
              </NavLink>
            )}
            {user?.role === "admin" && (
              <NavLink to="/admin" className={navLinkClass}>
                Admin
              </NavLink>
            )}
          </div>

          {/* Right side: auth + dark mode */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Akwaaba, <span className="font-semibold text-indigo-600 dark:text-indigo-400">{user.username}</span>
                </span>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/?login=true"
                  className="px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/?register=true"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            aria-label="Toggle navigation menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-1">
            <NavLink to="/" end className={navLinkClass} onClick={() => setMobileOpen(false)}>
              Home
            </NavLink>
            <NavLink to="/drugs" className={navLinkClass} onClick={() => setMobileOpen(false)}>
              Drug Database
            </NavLink>
            {user && (
              <NavLink to="/chat/general" className={navLinkClass} onClick={() => setMobileOpen(false)}>
                Chat
              </NavLink>
            )}
            {user?.role === "pharmacist" && (
              <NavLink to="/pharmacist-portal" className={navLinkClass} onClick={() => setMobileOpen(false)}>
                Pharmacist Portal
              </NavLink>
            )}
            {user?.role === "admin" && (
              <NavLink to="/admin" className={navLinkClass} onClick={() => setMobileOpen(false)}>
                Admin
              </NavLink>
            )}
            <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700 mt-2">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              >
                {darkMode ? "Light Mode" : "Dark Mode"}
              </button>
            </div>
            {user ? (
              <button
                onClick={() => { logout(); setMobileOpen(false); }}
                className="w-full text-left px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 rounded-md"
              >
                Logout
              </button>
            ) : (
              <div className="flex gap-2 pt-2">
                <Link to="/?login=true" className="px-4 py-2 text-sm font-medium text-indigo-600 rounded-lg" onClick={() => setMobileOpen(false)}>
                  Login
                </Link>
                <Link to="/?register=true" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg" onClick={() => setMobileOpen(false)}>
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/chat/:roomSlug" element={<ChatRoom />} />
            <Route path="/pharmacist-portal" element={<PharmacistPortal />} />
            <Route path="/drugs" element={<DrugDatabase />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}
