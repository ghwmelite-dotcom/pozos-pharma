import { useCallback, useRef, useMemo } from "react";
import useChatStore from "../store/chatStore";
import useWebSocket from "./useWebSocket";

/**
 * Chat hook combining Zustand chatStore with WebSocket communication.
 *
 * Provides a unified API for sending messages (API call + WS broadcast),
 * reading messages, observing typing indicators, and managing typing state.
 *
 * @param {string} roomSlug - The chat room slug
 * @returns {{
 *   messages: Array,
 *   typingUsers: string[],
 *   sendMessage: (content: string) => Promise<void>,
 *   startTyping: () => void,
 *   stopTyping: () => void,
 *   isConnected: boolean,
 *   onlineUsers: string[],
 * }}
 */
export default function useChat(roomSlug) {
  const { sendWsMessage, isConnected, onlineUsers, videoSignal } = useWebSocket(roomSlug);

  const messages = useChatStore((s) => s.messages);
  const typingUsersMap = useChatStore((s) => s.typingUsers);
  const storeSendMessage = useChatStore((s) => s.sendMessage);
  const user = useChatStore((s) => s.user);

  // Typing users for the current room
  const typingUsers = useMemo(
    () => (typingUsersMap[roomSlug] || []).filter((u) => u !== user?.username),
    [typingUsersMap, roomSlug, user?.username]
  );

  // Debounce typing indicator to avoid spamming
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  /**
   * Send a message: call the REST API for persistence, then broadcast
   * via WebSocket so other clients receive it in real time.
   */
  const sendMessage = useCallback(
    async (content) => {
      if (!content?.trim()) return;

      // Stop typing indicator when sending
      if (isTypingRef.current) {
        sendWsMessage({
          type: "typing",
          username: user?.username,
          is_typing: false,
          room_slug: roomSlug,
        });
        isTypingRef.current = false;
      }

      // Persist via API (includes optimistic update in store)
      // The DO will broadcast the message after the REST API saves it
      const result = await storeSendMessage(roomSlug, content.trim());

      return result;
    },
    [roomSlug, storeSendMessage, sendWsMessage, user?.username]
  );

  /**
   * Signal that the current user has started typing.
   * Automatically stops after 3 seconds of inactivity.
   */
  const startTyping = useCallback(() => {
    if (!user?.username || !roomSlug) return;

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      sendWsMessage({
        type: "typing",
        username: user.username,
        is_typing: true,
        room_slug: roomSlug,
      });
    }

    // Reset the auto-stop timer
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      if (isTypingRef.current) {
        isTypingRef.current = false;
        sendWsMessage({
          type: "typing",
          username: user.username,
          is_typing: false,
          room_slug: roomSlug,
        });
      }
    }, 3000);
  }, [user?.username, roomSlug, sendWsMessage]);

  /**
   * Signal that the current user has stopped typing.
   */
  const stopTyping = useCallback(() => {
    if (!user?.username || !roomSlug) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    if (isTypingRef.current) {
      isTypingRef.current = false;
      sendWsMessage({
        type: "typing",
        username: user.username,
        is_typing: false,
        room_slug: roomSlug,
      });
    }
  }, [user?.username, roomSlug, sendWsMessage]);

  return {
    messages,
    typingUsers,
    sendMessage,
    startTyping,
    stopTyping,
    isConnected,
    onlineUsers,
    sendWsMessage,
    videoSignal,
  };
}
