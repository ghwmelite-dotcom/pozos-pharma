import { useState, useRef, useEffect, useCallback } from "react";
import useChatStore from "../../store/chatStore";
import useChat from "../../hooks/useChat";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import HandoffBanner from "./HandoffBanner";
import AIDisclaimer from "./AIDisclaimer";
import Button from "../UI/Button";
import VoiceInput from "./VoiceInput";
import VideoCall from "../Pharmacist/VideoCall";

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
  const [videoCallActive, setVideoCallActive] = useState(false);
  const [videoRemoteUserId, setVideoRemoteUserId] = useState(null);
  const [videoIsInitiator, setVideoIsInitiator] = useState(false);
  const [incomingCallFrom, setIncomingCallFrom] = useState(null);

  const connectionStatus = useChatStore((s) => s.connectionStatus);
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
    sendWsMessage,
    videoSignal,
  } = useChat(roomSlug);

  // Fetch rooms on mount
  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  // Handle incoming video call offer (show prompt if not already in a call)
  const lastVideoSignalRef = useRef(null);
  useEffect(() => {
    if (!videoSignal || videoSignal === lastVideoSignalRef.current) return;
    lastVideoSignalRef.current = videoSignal;

    if (videoSignal.type === "video_offer" && !videoCallActive) {
      setIncomingCallFrom(videoSignal.fromUserId);
    }
  }, [videoSignal, videoCallActive]);

  // Start a video call (initiator side)
  const handleStartVideoCall = useCallback(() => {
    // Find the other user (pharmacist or patient) from onlineUsers
    const otherUser = onlineUsers.find(
      (u) => u.userId !== user?.id && u.userId !== user?.username
    );
    if (!otherUser) return;
    setVideoRemoteUserId(otherUser.userId);
    setVideoIsInitiator(true);
    setVideoCallActive(true);
  }, [onlineUsers, user]);

  // Accept incoming video call
  const handleAcceptVideoCall = useCallback(() => {
    setVideoRemoteUserId(incomingCallFrom);
    setVideoIsInitiator(false);
    setVideoCallActive(true);
    setIncomingCallFrom(null);
  }, [incomingCallFrom]);

  // Decline incoming video call
  const handleDeclineVideoCall = useCallback(() => {
    setIncomingCallFrom(null);
  }, []);

  // End video call
  const handleEndVideoCall = useCallback(() => {
    setVideoCallActive(false);
    setVideoRemoteUserId(null);
    setVideoIsInitiator(false);
  }, []);

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

  // Handle voice transcription result
  const handleVoiceTranscribe = useCallback((text) => {
    setInputValue((prev) => {
      const combined = prev ? `${prev} ${text}` : text;
      return combined;
    });
    document.getElementById("chat-input")?.focus();
  }, []);

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
          bg-warm-50 dark:bg-surface-card-dark
          border-r border-warm-200/60 dark:border-gray-700
          transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        aria-label="Chat sidebar"
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-warm-200/60 dark:border-gray-700">
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
                      : "text-gray-700 dark:text-gray-300 hover:bg-warm-200/40 dark:hover:bg-gray-800"
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
          <div className="border-t border-warm-200/60 dark:border-gray-700">
            <h3 className="px-4 pt-3 pb-1 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Recent Sessions
            </h3>
            <div className="max-h-40 overflow-y-auto pb-2">
              {sessions.slice(0, 5).map((session) => (
                <div
                  key={session.id}
                  className="px-4 py-1.5 text-xs text-gray-500 dark:text-gray-400 truncate hover:bg-warm-200/40 dark:hover:bg-gray-800 cursor-pointer"
                >
                  {session.title || session.id}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* User info */}
        {user && (
          <div className="border-t border-warm-200/60 dark:border-gray-700 px-4 py-3 flex items-center gap-2">
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
        <header className="shrink-0 border-b border-warm-200/60 dark:border-gray-700">
          <div className="flex items-center gap-3 px-4 py-2">
            {/* Mobile sidebar toggle */}
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-warm-200/60 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800"
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

            {/* Video call button - visible only when handoff is active */}
            {handoffStatus === "active" && (
              <button
                type="button"
                onClick={handleStartVideoCall}
                className="ml-auto p-1.5 rounded-lg text-brand-teal hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-colors"
                aria-label="Start video call"
                title="Start video call"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* AI Disclaimer */}
          <AIDisclaimer />
        </header>

        {/* Connection status banner */}
        {connectionStatus === 'connecting' && (
          <div className="px-4 py-1.5 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 text-center">
            <span className="text-xs font-medium text-amber-700 dark:text-amber-300">Reconnecting...</span>
          </div>
        )}
        {connectionStatus === 'disconnected' && (
          <div className="px-4 py-1.5 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 text-center">
            <span className="text-xs font-medium text-red-700 dark:text-red-300">Disconnected — messages may not be delivered</span>
          </div>
        )}

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
                Welcome!
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
                status: msg.status,
                onRetry: msg.status === 'failed' ? () => useChatStore.getState().retryMessage(msg.id, roomSlug) : undefined,
              }}
            />
          ))}

          {/* Typing indicator */}
          <TypingIndicator typingUsers={typingUserObjects} />

          {/* Scroll anchor */}
          <div ref={messagesEndRef} aria-hidden="true" />
        </div>

        {/* ── Input Bar ────────────────────────────────────────── */}
        <div className="shrink-0 border-t border-warm-200/60 dark:border-gray-700 bg-warm-50 dark:bg-surface-card-dark px-3 py-3 sm:px-4">
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
                className="w-full resize-none rounded-xl border border-gray-300 dark:border-gray-600 bg-warm-100 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 px-4 py-2.5 pr-12 focus:outline-none focus:ring-2 focus:ring-brand-indigo focus:border-transparent transition-shadow"
                aria-label="Message input"
                style={{
                  maxHeight: "120px",
                  minHeight: "42px",
                }}
              />
            </div>

            {/* Voice input */}
            <VoiceInput
              onTranscribe={handleVoiceTranscribe}
              disabled={false}
            />

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

      {/* Incoming video call prompt */}
      {incomingCallFrom && !videoCallActive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-warm-50 dark:bg-surface-card-dark rounded-2xl shadow-2xl p-6 max-w-sm mx-4 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-brand-teal/10 dark:bg-teal-900/30 flex items-center justify-center mb-4 animate-pulse">
              <svg
                className="w-8 h-8 text-brand-teal"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
              Incoming Video Call
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              A pharmacist is requesting a video consultation.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleDeclineVideoCall}
                className="px-5 py-2.5 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Decline
              </button>
              <button
                type="button"
                onClick={handleAcceptVideoCall}
                className="px-5 py-2.5 rounded-xl bg-brand-teal text-white font-medium hover:bg-teal-600 transition-colors"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video call overlay */}
      {videoCallActive && videoRemoteUserId && (
        <VideoCall
          roomSlug={roomSlug}
          remoteUserId={videoRemoteUserId}
          onEnd={handleEndVideoCall}
          isInitiator={videoIsInitiator}
          sendSignal={sendWsMessage}
          incomingSignal={videoSignal}
        />
      )}
    </div>
  );
}
