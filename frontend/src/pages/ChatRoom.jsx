import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useChatStore from "../store/chatStore";
import ChatWindow from "../components/Chat/ChatWindow";
import LoginModal from "../components/Auth/LoginModal";
import RegisterModal from "../components/Auth/RegisterModal";

const API_URL = import.meta.env.VITE_API_URL || "";

/**
 * PozosPharma Chat Room Page
 *
 * Gets roomSlug from URL params and renders ChatWindow.
 * Requires authentication -- shows login modal if not authenticated.
 * Fetches room details and message history on mount.
 */
export default function ChatRoom() {
  const { roomSlug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, token } = useAuth();

  const setMessages = useChatStore((s) => s.setMessages);
  const fetchRooms = useChatStore((s) => s.fetchRooms);
  const rooms = useChatStore((s) => s.rooms);

  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // If not authenticated, show login modal
  useEffect(() => {
    if (!isAuthenticated) {
      setShowLogin(true);
    } else {
      setShowLogin(false);
      setShowRegister(false);
    }
  }, [isAuthenticated]);

  // Fetch room details and messages on mount or slug change
  useEffect(() => {
    if (!isAuthenticated || !roomSlug) return;

    const loadRoom = async () => {
      setLoading(true);
      setError("");

      try {
        // Fetch rooms if not loaded
        if (rooms.length === 0) {
          await fetchRooms();
        }

        // Fetch message history
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch(`${API_URL}/api/chat/${roomSlug}/messages`, {
          headers,
        });

        if (!res.ok) {
          if (res.status === 404) {
            setError("Room not found.");
          } else {
            throw new Error("Failed to fetch messages");
          }
          return;
        }

        const data = await res.json();
        const messages = Array.isArray(data) ? data : data.messages || [];
        setMessages(messages);
      } catch (err) {
        console.error("[ChatRoom] loadRoom error:", err);
        setError("Failed to load chat room. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadRoom();
  }, [isAuthenticated, roomSlug, token, fetchRooms, rooms.length, setMessages]);

  // Handle room change from sidebar
  const handleRoomChange = useCallback(
    (slug) => {
      navigate(`/chat/${slug}`);
    },
    [navigate]
  );

  // Auth modal handlers
  const closeModals = () => {
    setShowLogin(false);
    setShowRegister(false);
    if (!isAuthenticated) {
      navigate("/");
    }
  };

  const switchToRegister = () => {
    setShowLogin(false);
    setShowRegister(true);
  };

  const switchToLogin = () => {
    setShowRegister(false);
    setShowLogin(true);
  };

  // Not authenticated - show modal over empty state
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-brand-indigo/10 dark:bg-indigo-900/20 flex items-center justify-center mb-3">
            <svg className="w-7 h-7 text-brand-indigo dark:text-indigo-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Sign in to join the conversation
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            You need an account to chat on PozosPharma
          </p>
        </div>

        <LoginModal
          isOpen={showLogin}
          onClose={closeModals}
          onSwitchToRegister={switchToRegister}
        />
        <RegisterModal
          isOpen={showRegister}
          onClose={closeModals}
          onSwitchToLogin={switchToLogin}
        />
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-indigo border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading chat...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-red-500 dark:text-red-400 mb-3">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 text-sm font-medium text-brand-indigo hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
      <ChatWindow roomSlug={roomSlug} onRoomChange={handleRoomChange} />
    </div>
  );
}
