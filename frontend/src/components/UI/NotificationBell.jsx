import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import useNotificationStore from "../../store/notificationStore";

// ── Notification Icons ──────────────────────────────────────
function NotifIcon({ type, size = 16 }) {
  const s = size;
  const icons = {
    chat: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
    pharmacist: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4-4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
    handoff: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 1l4 4-4 4" />
        <path d="M3 11V9a4 4 0 014-4h14" />
        <path d="M7 23l-4-4 4-4" />
        <path d="M21 13v2a4 4 0 01-4 4H3" />
      </svg>
    ),
    alert: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    system: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
    room: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  };
  return icons[type] || icons.system;
}

// ── Time Formatter ──────────────────────────────────────────
function timeAgo(timestamp) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// ── Single Notification Item ────────────────────────────────
function NotificationItem({ notification, onRead, onNavigate }) {
  const { id, title, message, body, meta, timestamp, read, url, type } = notification;

  return (
    <button
      onClick={() => {
        onRead(id);
        if (url) onNavigate(url);
      }}
      className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-all hover:bg-[#C9A84C]/5 dark:hover:bg-[#C9A84C]/10 group ${
        !read ? "bg-[#C9A84C]/[0.03] dark:bg-[#C9A84C]/[0.06]" : ""
      }`}
    >
      {/* Icon circle */}
      <div
        className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center mt-0.5"
        style={{ backgroundColor: meta.color + "18", color: meta.color }}
      >
        <NotifIcon type={meta.icon} size={16} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-body font-semibold truncate ${
            !read ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400"
          }`}>
            {title}
          </span>
          {!read && (
            <span className="shrink-0 w-2 h-2 rounded-full bg-[#C9A84C] animate-pulse" />
          )}
        </div>
        <p className="text-xs font-body text-gray-500 dark:text-gray-500 line-clamp-2 mt-0.5 leading-relaxed">
          {body || message}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span
            className="text-[10px] font-body font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
            style={{ backgroundColor: meta.color + "15", color: meta.color }}
          >
            {meta.label}
          </span>
          <span className="text-[10px] font-body text-gray-400 dark:text-gray-600">
            {timeAgo(timestamp)}
          </span>
        </div>
      </div>
    </button>
  );
}

// ── Settings Panel ──────────────────────────────────────────
function NotificationSettings({ onBack }) {
  const { pushEnabled, soundEnabled, requestPushPermission, setSoundEnabled } =
    useNotificationStore();

  const handlePushToggle = async () => {
    if (!pushEnabled) {
      await requestPushPermission();
    } else {
      useNotificationStore.getState().setPushEnabled(false);
    }
  };

  return (
    <div className="p-4">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm font-body text-gray-400 hover:text-[#C9A84C] transition-colors mb-4"
      >
        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back
      </button>

      <h3 className="text-sm font-display font-bold text-gray-900 dark:text-white mb-4">
        Notification Preferences
      </h3>

      <div className="space-y-4">
        {/* Push toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-body font-medium text-gray-800 dark:text-gray-200">
              Push Notifications
            </p>
            <p className="text-xs font-body text-gray-500 dark:text-gray-500">
              Get notified even when tab is closed
            </p>
          </div>
          <button
            onClick={handlePushToggle}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              pushEnabled ? "bg-[#C9A84C]" : "bg-gray-300 dark:bg-gray-700"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-warm-50 shadow-sm transition-transform ${
                pushEnabled ? "translate-x-5" : ""
              }`}
            />
          </button>
        </div>

        {/* Sound toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-body font-medium text-gray-800 dark:text-gray-200">
              Sound Alerts
            </p>
            <p className="text-xs font-body text-gray-500 dark:text-gray-500">
              Play a chime for new notifications
            </p>
          </div>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              soundEnabled ? "bg-[#C9A84C]" : "bg-gray-300 dark:bg-gray-700"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-warm-50 shadow-sm transition-transform ${
                soundEnabled ? "translate-x-5" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Permission status */}
      {"Notification" in window && Notification.permission === "denied" && (
        <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-xs font-body text-red-600 dark:text-red-400">
            Push notifications are blocked by your browser. Enable them in your browser settings.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Main Bell Component ─────────────────────────────────────
export default function NotificationBell() {
  const {
    notifications,
    unreadCount,
    isOpen,
    toggleOpen,
    setIsOpen,
    markAsRead,
    markAllAsRead,
    clearAll,
  } = useNotificationStore();

  const navigate = useNavigate();
  const ref = useRef(null);
  const [showSettings, setShowSettings] = useState(false);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false);
        setShowSettings(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [setIsOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setShowSettings(false);
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [setIsOpen]);

  const handleNavigate = useCallback(
    (url) => {
      setIsOpen(false);
      navigate(url);
    },
    [navigate, setIsOpen]
  );

  return (
    <div className="relative" ref={ref}>
      {/* Bell Button */}
      <button
        onClick={toggleOpen}
        className="relative p-2 rounded-lg text-gray-400 hover:text-[#C9A84C] hover:bg-[#C9A84C]/5 dark:hover:bg-[#C9A84C]/10 transition-all"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 01-3.46 0" />
        </svg>

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[#C9A84C] text-[10px] font-body font-bold text-gray-900 shadow-lg shadow-[#C9A84C]/30 animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-warm-50 dark:bg-gray-900 border border-warm-200/60 dark:border-[#C9A84C]/15 rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/40 z-50 overflow-hidden">
          {/* Kente accent top border */}
          <div className="h-[3px] flex">
            <div className="flex-1 bg-ghana-red" />
            <div className="flex-1 bg-ghana-gold" />
            <div className="flex-1 bg-ghana-green" />
          </div>

          {showSettings ? (
            <NotificationSettings onBack={() => setShowSettings(false)} />
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-warm-200 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-display font-bold text-gray-900 dark:text-white">
                    Notifications
                  </h2>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-[#C9A84C]/10 text-[10px] font-body font-bold text-[#C9A84C]">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-[11px] font-body font-medium text-[#C9A84C] hover:text-[#E8D48B] px-2 py-1 rounded-md hover:bg-[#C9A84C]/5 transition-all"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setShowSettings(true)}
                    className="p-1.5 rounded-md text-gray-400 hover:text-[#C9A84C] hover:bg-[#C9A84C]/5 transition-all"
                    aria-label="Notification settings"
                  >
                    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Notification List */}
              <div className="max-h-[380px] overflow-y-auto overscroll-contain divide-y divide-gray-50 dark:divide-gray-800/50">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 px-4">
                    {/* Adinkra symbol — Nsoromma (star) */}
                    <div className="w-14 h-14 rounded-2xl bg-[#C9A84C]/5 dark:bg-[#C9A84C]/10 flex items-center justify-center mb-4 ring-1 ring-[#C9A84C]/10">
                      <svg className="w-7 h-7 text-[#C9A84C]/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <p className="text-sm font-body font-medium text-gray-400 dark:text-gray-600">
                      No notifications yet
                    </p>
                    <p className="text-xs font-body text-gray-400/60 dark:text-gray-600 mt-1 text-center">
                      Activity from chats, pharmacists, and alerts will appear here
                    </p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <NotificationItem
                      key={n.id}
                      notification={n}
                      onRead={markAsRead}
                      onNavigate={handleNavigate}
                    />
                  ))
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="px-4 py-2.5 border-t border-warm-200 dark:border-gray-800 flex justify-between items-center">
                  <button
                    onClick={clearAll}
                    className="text-[11px] font-body font-medium text-gray-400 hover:text-red-500 transition-colors"
                  >
                    Clear all
                  </button>
                  <span className="text-[10px] font-body text-gray-400/60 dark:text-gray-600">
                    {notifications.length} notification{notifications.length !== 1 ? "s" : ""}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
