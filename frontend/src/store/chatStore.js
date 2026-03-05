import { create } from "zustand";
import { persist } from "zustand/middleware";

const API_URL = import.meta.env.VITE_API_URL || "";

/**
 * PozosPharma Zustand Store
 * Manages chat messages, auth state, rooms, sessions, WebSocket state,
 * handoff status, and dark mode preference.
 */
const useChatStore = create(
  persist(
    (set, get) => ({
      // ── Chat State ──────────────────────────────────────────
      messages: [],
      sessions: [],
      currentSession: null,
      rooms: [],
      typingUsers: {},
      isConnected: false,
      handoffStatus: null, // null | "requested" | "accepted" | "active" | "completed"

      // ── Auth State ──────────────────────────────────────────
      user: null,
      token: null,

      // ── UI State ────────────────────────────────────────────
      darkMode: false,

      // ── Message Actions ─────────────────────────────────────
      addMessage: (message) =>
        set((state) => ({
          messages: [...state.messages, { ...message, id: message.id || crypto.randomUUID() }],
        })),

      clearMessages: () => set({ messages: [] }),

      setMessages: (messages) => set({ messages }),

      // ── Session Actions ─────────────────────────────────────
      setSessions: (sessions) => set({ sessions }),

      setCurrentSession: (session) =>
        set({ currentSession: session, messages: [] }),

      // ── Room Actions ────────────────────────────────────────
      setRooms: (rooms) => set({ rooms }),

      fetchRooms: async () => {
        try {
          const { token } = get();
          const headers = token ? { Authorization: `Bearer ${token}` } : {};
          const res = await fetch(`${API_URL}/api/chat/rooms`, { headers });
          if (!res.ok) throw new Error("Failed to fetch rooms");
          const data = await res.json();
          set({ rooms: Array.isArray(data) ? data : data.rooms || [] });
        } catch (err) {
          console.error("[chatStore] fetchRooms error:", err);
        }
      },

      // ── Auth Actions ────────────────────────────────────────
      setUser: (user) => set({ user }),

      setToken: (token) => set({ token }),

      login: async (email, password) => {
        const res = await fetch(`${API_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: "Login failed" }));
          throw new Error(err.error || "Login failed");
        }

        const data = await res.json();
        set({
          user: data.user,
          token: data.access_token || data.token,
        });
        return data;
      },

      register: async (username, email, password) => {
        const res = await fetch(`${API_URL}/api/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email, password }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: "Registration failed" }));
          throw new Error(err.error || "Registration failed");
        }

        const data = await res.json();
        set({
          user: data.user,
          token: data.access_token || data.token,
        });
        return data;
      },

      logout: () => {
        set({
          user: null,
          token: null,
          messages: [],
          currentSession: null,
          sessions: [],
          handoffStatus: null,
          typingUsers: {},
        });
      },

      // ── Send Message (API call + optimistic update) ─────────
      sendMessage: async (roomSlug, content) => {
        const { token, user, currentSession } = get();

        // Optimistic update
        const optimisticMsg = {
          id: `temp-${crypto.randomUUID()}`,
          content,
          sender: user?.username || "You",
          sender_type: "user",
          room_slug: roomSlug,
          created_at: new Date().toISOString(),
          status: "sending",
        };

        set((state) => ({
          messages: [...state.messages, optimisticMsg],
        }));

        try {
          const res = await fetch(`${API_URL}/api/chat/message`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ content, sessionId: currentSession, roomId: roomSlug }),
          });

          if (!res.ok) throw new Error("Failed to send message");

          const data = await res.json();

          // Replace optimistic message with confirmed + add AI response
          set((state) => {
            const updated = state.messages.map((msg) =>
              msg.id === optimisticMsg.id
                ? { ...optimisticMsg, status: "sent" }
                : msg
            );
            // Add AI response if present
            if (data.aiMessage) {
              updated.push({
                id: data.aiMessage.id,
                content: data.aiMessage.content,
                sender: "PozosBot",
                sender_type: "ai",
                model: data.aiMessage.model,
                isEmergency: data.aiMessage.isEmergency,
                created_at: new Date().toISOString(),
              });
            }
            return {
              messages: updated,
              currentSession: data.sessionId || state.currentSession,
              handoffStatus: data.requiresHandoff ? "requested" : state.handoffStatus,
            };
          });

          return data;
        } catch (err) {
          // Mark optimistic message as failed
          set((state) => ({
            messages: state.messages.map((msg) =>
              msg.id === optimisticMsg.id
                ? { ...msg, status: "failed" }
                : msg
            ),
          }));
          throw err;
        }
      },

      // ── Handoff Actions ─────────────────────────────────────
      requestHandoff: async () => {
        const { token, currentSession } = get();
        try {
          const res = await fetch(`${API_URL}/api/handoff/request`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ sessionId: currentSession }),
          });

          if (!res.ok) throw new Error("Handoff request failed");

          const data = await res.json();
          set({ handoffStatus: "requested" });
          return data;
        } catch (err) {
          console.error("[chatStore] requestHandoff error:", err);
          throw err;
        }
      },

      setHandoffStatus: (status) => set({ handoffStatus: status }),

      // ── WebSocket State ─────────────────────────────────────
      setIsConnected: (connected) => set({ isConnected: connected }),

      setTypingUsers: (typingUsers) => set({ typingUsers }),

      addTypingUser: (roomSlug, username) =>
        set((state) => ({
          typingUsers: {
            ...state.typingUsers,
            [roomSlug]: [
              ...new Set([...(state.typingUsers[roomSlug] || []), username]),
            ],
          },
        })),

      removeTypingUser: (roomSlug, username) =>
        set((state) => ({
          typingUsers: {
            ...state.typingUsers,
            [roomSlug]: (state.typingUsers[roomSlug] || []).filter(
              (u) => u !== username
            ),
          },
        })),

      // ── Dark Mode ───────────────────────────────────────────
      toggleDarkMode: () =>
        set((state) => {
          const next = !state.darkMode;
          if (next) {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
          localStorage.setItem("pozospharma-dark-mode", String(next));
          return { darkMode: next };
        }),
    }),
    {
      name: "pozospharma-store",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        darkMode: state.darkMode,
      }),
    }
  )
);

export default useChatStore;
