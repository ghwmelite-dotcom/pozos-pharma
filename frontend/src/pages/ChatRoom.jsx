import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useChatStore from "../store/chatStore";
import ChatWindow from "../components/Chat/ChatWindow";
import LoginModal from "../components/Auth/LoginModal";
import RegisterModal from "../components/Auth/RegisterModal";
import ForgotPasswordModal from "../components/Auth/ForgotPasswordModal";

const API_URL = import.meta.env.VITE_API_URL || "";

export default function ChatRoom() {
  const { roomSlug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, token } = useAuth();

  const setMessages = useChatStore((s) => s.setMessages);
  const fetchRooms = useChatStore((s) => s.fetchRooms);
  const rooms = useChatStore((s) => s.rooms);

  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      setShowLogin(true);
    } else {
      setShowLogin(false);
      setShowRegister(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !roomSlug) return;

    const loadRoom = async () => {
      setLoading(true);
      setError("");

      try {
        if (rooms.length === 0) {
          await fetchRooms();
        }

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

  const handleRoomChange = useCallback(
    (slug) => {
      navigate(`/chat/${slug}`);
    },
    [navigate]
  );

  const closeModals = () => {
    setShowLogin(false);
    setShowRegister(false);
    setShowForgotPassword(false);
    if (!isAuthenticated) {
      navigate("/");
    }
  };

  const switchToRegister = () => {
    setShowLogin(false);
    setShowForgotPassword(false);
    setShowRegister(true);
  };

  const switchToLogin = () => {
    setShowRegister(false);
    setShowForgotPassword(false);
    setShowLogin(true);
  };

  const switchToForgotPassword = () => {
    setShowLogin(false);
    setShowRegister(false);
    setShowForgotPassword(true);
  };

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#C9A84C]/10 dark:bg-[#C9A84C]/15 flex items-center justify-center mb-3 ring-1 ring-[#C9A84C]/20">
            <svg className="w-7 h-7 text-[#C9A84C]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-lg font-display text-gray-900 dark:text-white">
            Sign in to join the conversation
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-body">
            You need an account to chat on PozosPharma
          </p>
        </div>

        <LoginModal
          isOpen={showLogin}
          onClose={closeModals}
          onSwitchToRegister={switchToRegister}
          onForgotPassword={switchToForgotPassword}
        />
        <RegisterModal
          isOpen={showRegister}
          onClose={closeModals}
          onSwitchToLogin={switchToLogin}
        />
        <ForgotPasswordModal
          isOpen={showForgotPassword}
          onClose={closeModals}
          onBackToLogin={switchToLogin}
        />
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#C9A84C] animate-spin" />
            <div className="absolute inset-1 rounded-full border-2 border-transparent border-b-[#C9A84C]/40 animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-body">Loading chat...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-red-500 dark:text-red-400 mb-3 font-body">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 text-sm font-body font-medium text-[#C9A84C] hover:bg-[#C9A84C]/5 rounded-lg transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] rounded-xl overflow-hidden border border-warm-200/60 dark:border-gray-800">
      <ChatWindow roomSlug={roomSlug} onRoomChange={handleRoomChange} />
    </div>
  );
}
