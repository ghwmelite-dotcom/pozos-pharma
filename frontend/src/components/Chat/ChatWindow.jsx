import { useState, useRef, useEffect, useCallback } from "react";
import useChatStore from "../../store/chatStore";
import useChat from "../../hooks/useChat";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import HandoffBanner from "./HandoffBanner";
import AIDisclaimer from "./AIDisclaimer";
import Button from "../UI/Button";

/**
 * PozosPharma Chat Window
 *
 * Full chat interface with sidebar (rooms + session history) and main chat area.
 * Mobile responsive with toggle sidebar.
 *
 * @param {object} props
 * @param {string} props.roomSlug - Active room slug
 * @param {(slug: string) => void} [props.onRoomChange] - Callback when user switches rooms
 */
export default function ChatWindow({ roomSlug, onRoomChange }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const rooms = useChatStore((s) => s.rooms);
  const sessions = useChatStore((s) => s.sessions);
  const handoffStatus = useChatStore((s) => s.handoffStatus);
  const user = useChatStore((s) => s.user);
  const fetchRooms = useChatStore((s) => s.fetchRooms);

  const {
    messages,
    typingUsers,
    sendMessage,
    startTyping,
    stopTyping,
    isConnected,
    onlineUsers,
  } = useChat(roomSlug);

  // Fetch rooms on mount
  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  // Auto-scroll to bottom on new messages
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  // Send message handler
  const handleSend = useCallback(async () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    setInputValue("");
    stopTyping();
    try {
      await sendMessage(trimmed);
    } catch (err) {
      console.error("[ChatWindow] Failed to send:", err);
    }
  }, [inputValue, sendMessage, stopTyping]);

  // Handle Enter key to send
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle input change + typing indicator
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    if (e.target.value.trim()) {
      startTyping();
    } else {
      stopTyping();
    }
  };

  // Quick-trigger /pharmacist command
  const handlePharmacistTrigger = () => {
    setInputValue("/pharmacist ");
    document.getElementById("chat-input")?.focus();
  };

  // Room click
  const handleRoomClick = (slug) => {
    if (onRoomChange) {
      onRoomChange(slug);
    }
    setSidebarOpen(false);
  };

  // Map typingUsers strings to objects for TypingIndicator
  const typingUserObjects = typingUsers.map((username) => ({
    userId: username,
    username,
    role: username === "PozosBot" ? "ai" : "user",
  }));

  // Handoff status mapping
  const handoffStatusMap = {
    requested: "REQUESTING",
    accepted: "ACCEPTED",
    active: "ACCEPTED",
    unavailable: "UNAVAILABLE",
  };
  const bannerStatus = handoffStatusMap[handoffStatus] || "IDLE";

  return (
    <div className="flex h-full bg-surface-light dark:bg-surface-dark">
      {/* ── Mobile sidebar overlay ─────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar ────────────────────────────────────────────── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-72
          lg:static lg:z-auto
          flex flex-col
          bg-white dark:bg-surface-card-dark
          border-r border-gray-200 dark:border-gray-700
          transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        aria-label="Chat sidebar"
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
            Rooms
          </h2>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 text-xs ${isConnected ? "text-green-600 dark:text-green-400" : "text-gray-400"}`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${isConnected ? "bg-green-500" : "bg-gray-400"}`}
                aria-hidden="true"
              />
              {isConnected ? "Live" : "Offline"}
            </span>
            {/* Close sidebar on mobile */}
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label="Close sidebar"
            >
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Room list */}
        <nav className="flex-1 overflow-y-auto py-2" aria-label="Chat rooms">
          {rooms.length === 0 && (
            <p className="px-4 py-3 text-xs text-gray-400 dark:text-gray-500 italic">
              No rooms available
            </p>
          )}
          {rooms.map((room) => {
            const isActive = room.slug === roomSlug;
            return (
              <button
                key={room.slug || room.id}
                type="button"
                onClick={() => handleRoomClick(room.slug)}
                className={`
                  w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors
                  ${
                    isActive
                      ? "bg-brand-indigo/10 dark:bg-indigo-900/30 text-brand-indigo dark:text-indigo-300 border-r-2 border-brand-indigo"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }
                `}
                aria-current={isActive ? "page" : undefined}
              >
                {/* Room icon */}
                <span className="text-lg shrink-0" aria-hidden="true">
                  {room.icon || "#"}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="block text-sm font-medium truncate">
                    {room.name || room.slug}
                  </span>
                  {room.description && (
                    <span className="block text-[11px] text-gray-400 dark:text-gray-500 truncate">
                      {room.description}
                    </span>
                  )}
                </div>
                {/* Active user count */}
                {room.active_count > 0 && (
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-brand-teal/10 text-brand-teal dark:bg-teal-900/30 dark:text-teal-400">
                    {room.active_count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Session history */}
        {sessions.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700">
            <h3 className="px-4 pt-3 pb-1 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Recent Sessions
            </h3>
            <div className="max-h-40 overflow-y-auto pb-2">
              {sessions.slice(0, 5).map((session) => (
                <div
                  key={session.id}
                  className="px-4 py-1.5 text-xs text-gray-500 dark:text-gray-400 truncate hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                >
                  {session.title || session.id}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* User info */}
        {user && (
          <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-brand-indigo/20 dark:bg-indigo-900/40 flex items-center justify-center text-xs font-bold text-brand-indigo dark:text-indigo-300">
              {user.username?.[0]?.toUpperCase() || "?"}
            </div>
            <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
              {user.username}
            </span>
          </div>
        )}
      </aside>

      {/* ── Main Chat Area ─────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar: mobile menu + room name + disclaimer */}
        <header className="shrink-0 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 px-4 py-2">
            {/* Mobile sidebar toggle */}
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800"
              aria-label="Open sidebar"
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            <h1 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
              {rooms.find((r) => r.slug === roomSlug)?.name || roomSlug || "Chat"}
            </h1>

            {onlineUsers.length > 0 && (
              <span className="text-[11px] text-gray-400 dark:text-gray-500">
                {onlineUsers.length} online
              </span>
            )}
          </div>

          {/* AI Disclaimer */}
          <AIDisclaimer />
        </header>

        {/* Handoff Banner */}
        <HandoffBanner
          status={bannerStatus}
          onlineCount={onlineUsers.filter((u) => u !== user?.username).length}
        />

        {/* Messages area */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto py-4 scroll-smooth"
          role="log"
          aria-label="Chat messages"
          aria-live="polite"
        >
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              {/* Adinkra welcome */}
              <div className="w-16 h-16 rounded-full bg-brand-teal/10 dark:bg-teal-900/30 flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-brand-teal"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                  />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Akwaaba! Welcome
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                Ask PozosBot a pharmacy question, or type{" "}
                <code className="text-brand-teal font-mono text-xs bg-teal-50 dark:bg-teal-900/30 px-1 py-0.5 rounded">
                  /pharmacist
                </code>{" "}
                to speak with a verified professional.
              </p>
            </div>
          )}

          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={{
                id: msg.id,
                content: msg.content,
                senderType: msg.sender_type || "user",
                sender: msg.sender,
                timestamp: msg.created_at,
                model: msg.metadata?.model,
                badgeLevel: msg.metadata?.badge_level,
                isEmergency: msg.metadata?.is_emergency,
                drugRefs: msg.metadata?.drug_refs,
                rating: msg.metadata?.rating,
                countryFlag: msg.metadata?.country_flag,
              }}
            />
          ))}

          {/* Typing indicator */}
          <TypingIndicator typingUsers={typingUserObjects} />

          {/* Scroll anchor */}
          <div ref={messagesEndRef} aria-hidden="true" />
        </div>

        {/* ── Input Bar ────────────────────────────────────────── */}
        <div className="shrink-0 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-card-dark px-3 py-3 sm:px-4">
          <div className="flex items-end gap-2">
            {/* Pharmacist quick-trigger chip */}
            <button
              type="button"
              onClick={handlePharmacistTrigger}
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-brand-emerald bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors shrink-0"
              title="Request a pharmacist"
            >
              <svg
                className="w-3.5 h-3.5"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
              </svg>
              /pharmacist
            </button>

            {/* Text input */}
            <div className="flex-1 relative">
              <textarea
                id="chat-input"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                rows={1}
                className="w-full resize-none rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 px-4 py-2.5 pr-12 focus:outline-none focus:ring-2 focus:ring-brand-indigo focus:border-transparent transition-shadow"
                aria-label="Message input"
                style={{
                  maxHeight: "120px",
                  minHeight: "42px",
                }}
              />
            </div>

            {/* Send button */}
            <Button
              variant="primary"
              size="md"
              onClick={handleSend}
              disabled={!inputValue.trim()}
              aria-label="Send message"
              className="shrink-0 !rounded-xl !px-3"
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </Button>
          </div>

          {/* Mobile pharmacist trigger */}
          <div className="sm:hidden mt-2">
            <button
              type="button"
              onClick={handlePharmacistTrigger}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-brand-emerald bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
            >
              <svg
                className="w-3.5 h-3.5"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
              </svg>
              /pharmacist
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
