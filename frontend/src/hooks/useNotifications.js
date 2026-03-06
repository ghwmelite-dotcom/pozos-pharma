import { useEffect, useRef } from "react";
import useChatStore from "../store/chatStore";
import useNotificationStore from "../store/notificationStore";

/**
 * useNotifications
 *
 * Bridges chatStore events → notification system.
 * Watches for new messages, handoff status changes, and room activity
 * to generate in-app + push notifications automatically.
 *
 * Mount once in App.jsx.
 */
export function useNotifications() {
  const user = useChatStore((s) => s.user);
  const messages = useChatStore((s) => s.messages);
  const handoffStatus = useChatStore((s) => s.handoffStatus);
  const addNotification = useNotificationStore((s) => s.addNotification);

  const prevMessageCount = useRef(messages.length);
  const prevHandoffStatus = useRef(handoffStatus);
  const isInitialized = useRef(false);

  // Skip notifications for the initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      isInitialized.current = true;
      prevMessageCount.current = messages.length;
    }, 2000);
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Watch for new messages
  useEffect(() => {
    if (!isInitialized.current || !user) return;

    const newCount = messages.length;
    const prevCount = prevMessageCount.current;

    if (newCount > prevCount) {
      // Process only the new messages
      const newMessages = messages.slice(prevCount);

      for (const msg of newMessages) {
        // Don't notify for own messages
        if (msg.sender === user.username || msg.sender_type === "user") continue;

        // AI/Bot response
        if (msg.sender_type === "ai" || msg.sender === "PozosBot") {
          // Only notify if user is on a different page
          if (document.hidden || !window.location.pathname.includes("/chat/")) {
            addNotification({
              type: "chat_message",
              title: "PozosBot replied",
              body: msg.content?.slice(0, 100) + (msg.content?.length > 100 ? "..." : ""),
              url: `/chat/${msg.room_slug || "general"}`,
            });
          }
        }

        // Pharmacist message
        if (msg.sender_type === "pharmacist") {
          addNotification({
            type: "pharmacist_reply",
            title: `Pharmacist ${msg.sender} responded`,
            body: msg.content?.slice(0, 100) + (msg.content?.length > 100 ? "..." : ""),
            url: `/chat/${msg.room_slug || "general"}`,
          });
        }

        // Emergency flag
        if (msg.isEmergency) {
          addNotification({
            type: "drug_alert",
            title: "Emergency Alert",
            body: "An urgent health concern was detected in your conversation. Please consult a pharmacist.",
            url: `/chat/${msg.room_slug || "general"}`,
          });
        }
      }
    }

    prevMessageCount.current = newCount;
  }, [messages, user, addNotification]);

  // Watch for handoff status changes
  useEffect(() => {
    if (!isInitialized.current || !user) return;

    const prev = prevHandoffStatus.current;

    if (handoffStatus !== prev && handoffStatus) {
      const handoffNotifs = {
        requested: {
          type: "handoff_accepted",
          title: "Handoff Requested",
          body: "Your request to speak with a pharmacist has been submitted. Please wait...",
        },
        accepted: {
          type: "handoff_accepted",
          title: "Pharmacist Joined",
          body: "A pharmacist has accepted your request and is now in the chat!",
        },
        active: {
          type: "handoff_accepted",
          title: "Live Session Active",
          body: "You are now in a live session with a pharmacist.",
        },
        completed: {
          type: "system",
          title: "Session Completed",
          body: "Your pharmacist session has ended. Thank you for using PozosPharma!",
        },
      };

      const notif = handoffNotifs[handoffStatus];
      if (notif) {
        addNotification({ ...notif, url: "/chat/general" });
      }
    }

    prevHandoffStatus.current = handoffStatus;
  }, [handoffStatus, user, addNotification]);

  // Request push permission on first auth (non-blocking)
  useEffect(() => {
    if (!user) return;

    const { pushEnabled } = useNotificationStore.getState();
    if (!pushEnabled && "Notification" in window && Notification.permission === "default") {
      // Delay the prompt so it doesn't fire immediately on login
      const timer = setTimeout(() => {
        useNotificationStore.getState().requestPushPermission();
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [user]);
}

/**
 * Utility to manually trigger notifications from anywhere in the app.
 * Import and call directly — no hook needed.
 */
export function notify(type, title, body, url) {
  useNotificationStore.getState().addNotification({ type, title, body, url });
}
