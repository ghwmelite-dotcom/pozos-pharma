import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Notification Store
 * Manages in-app notifications, push permission state, and preferences.
 */

// Notification types with their metadata
const NOTIFICATION_META = {
  chat_message: { icon: "chat", color: "#C9A84C", label: "Chat" },
  pharmacist_reply: { icon: "pharmacist", color: "#10B981", label: "Pharmacist" },
  handoff_accepted: { icon: "handoff", color: "#3B82F6", label: "Handoff" },
  drug_alert: { icon: "alert", color: "#EF4444", label: "Alert" },
  system: { icon: "system", color: "#8B5CF6", label: "System" },
  room_activity: { icon: "room", color: "#F59E0B", label: "Room" },
};

const useNotificationStore = create(
  persist(
    (set, get) => ({
      // ── Notification State ─────────────────────────────
      notifications: [],
      unreadCount: 0,
      isOpen: false,

      // ── Preferences ────────────────────────────────────
      pushEnabled: false,
      soundEnabled: true,
      pushSubscription: null,

      // ── Actions ────────────────────────────────────────

      addNotification: (notification) => {
        const id = crypto.randomUUID();
        const newNotif = {
          id,
          timestamp: Date.now(),
          read: false,
          meta: NOTIFICATION_META[notification.type] || NOTIFICATION_META.system,
          ...notification,
        };

        set((state) => ({
          notifications: [newNotif, ...state.notifications].slice(0, 50), // Keep last 50
          unreadCount: state.unreadCount + 1,
        }));

        // Play sound if enabled
        const { soundEnabled } = get();
        if (soundEnabled) {
          playNotificationSound();
        }

        // Show browser push if enabled and tab not focused
        if (document.hidden && get().pushEnabled) {
          showPushNotification(newNotif);
        }

        return id;
      },

      markAsRead: (id) =>
        set((state) => {
          const notifications = state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          );
          const unreadCount = notifications.filter((n) => !n.read).length;
          return { notifications, unreadCount };
        }),

      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        })),

      removeNotification: (id) =>
        set((state) => {
          const notifications = state.notifications.filter((n) => n.id !== id);
          const unreadCount = notifications.filter((n) => !n.read).length;
          return { notifications, unreadCount };
        }),

      clearAll: () => set({ notifications: [], unreadCount: 0 }),

      setIsOpen: (isOpen) => set({ isOpen }),
      toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),

      // ── Push Notification Management ───────────────────
      setPushEnabled: (enabled) => set({ pushEnabled: enabled }),
      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
      setPushSubscription: (sub) => set({ pushSubscription: sub }),

      requestPushPermission: async () => {
        if (!("Notification" in window)) return false;

        const permission = await Notification.requestPermission();
        const granted = permission === "granted";
        set({ pushEnabled: granted });
        return granted;
      },
    }),
    {
      name: "pozospharma-notifications",
      partialize: (state) => ({
        notifications: state.notifications.slice(0, 20), // Persist last 20
        unreadCount: state.unreadCount,
        pushEnabled: state.pushEnabled,
        soundEnabled: state.soundEnabled,
      }),
    }
  )
);

// ── Audio ─────────────────────────────────────────────────
let audioContext = null;

function playNotificationSound() {
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    // Create a pleasant two-tone chime
    const now = audioContext.currentTime;

    // First tone — golden bell
    const osc1 = audioContext.createOscillator();
    const gain1 = audioContext.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(880, now); // A5
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc1.connect(gain1).connect(audioContext.destination);
    osc1.start(now);
    osc1.stop(now + 0.4);

    // Second tone — harmonic
    const osc2 = audioContext.createOscillator();
    const gain2 = audioContext.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(1320, now + 0.08); // E6
    gain2.gain.setValueAtTime(0, now);
    gain2.gain.setValueAtTime(0.1, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc2.connect(gain2).connect(audioContext.destination);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.5);
  } catch {
    // Audio not available — fail silently
  }
}

// ── Push Notification Display ─────────────────────────────
function showPushNotification(notification) {
  if (Notification.permission !== "granted") return;

  try {
    const n = new Notification(notification.title || "PozosPharma", {
      body: notification.body || notification.message,
      icon: "/logo.svg",
      badge: "/logo.svg",
      tag: notification.type,
      data: { url: notification.url },
    });

    n.onclick = () => {
      window.focus();
      if (notification.url) {
        window.location.href = notification.url;
      }
      n.close();
    };

    setTimeout(() => n.close(), 6000);
  } catch {
    // Push not available
  }
}

export default useNotificationStore;
