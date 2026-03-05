import { useEffect, useRef, useCallback, useState } from "react";
import useChatStore from "../store/chatStore";

const WS_BASE =
  import.meta.env.VITE_WS_URL ||
  `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}`;

const MAX_RECONNECT_DELAY = 30000; // 30 seconds
const INITIAL_RECONNECT_DELAY = 1000; // 1 second
const PING_INTERVAL = 25000; // 25 seconds

/**
 * Custom WebSocket hook for PozosPharma chat rooms.
 *
 * Connects to ws://<host>/ws/{roomSlug}, authenticates on open,
 * and handles message types: message, typing, handoff_update, presence, pong.
 * Includes automatic reconnection with exponential backoff.
 *
 * @param {string} roomSlug - The chat room slug to connect to
 * @returns {{ sendWsMessage: Function, isConnected: boolean, onlineUsers: string[] }}
 */
export default function useWebSocket(roomSlug) {
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const pingIntervalRef = useRef(null);
  const reconnectDelayRef = useRef(INITIAL_RECONNECT_DELAY);
  const mountedRef = useRef(true);

  const [onlineUsers, setOnlineUsers] = useState([]);

  const token = useChatStore((s) => s.token);
  const user = useChatStore((s) => s.user);
  const addMessage = useChatStore((s) => s.addMessage);
  const setIsConnected = useChatStore((s) => s.setIsConnected);
  const addTypingUser = useChatStore((s) => s.addTypingUser);
  const removeTypingUser = useChatStore((s) => s.removeTypingUser);
  const setHandoffStatus = useChatStore((s) => s.setHandoffStatus);

  const cleanup = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.onclose = null; // Prevent reconnect on intentional close
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    if (!roomSlug || !mountedRef.current) return;

    cleanup();

    const wsUrl = `${WS_BASE}/ws/${roomSlug}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      if (!mountedRef.current) return;

      // Reset reconnect delay on successful connection
      reconnectDelayRef.current = INITIAL_RECONNECT_DELAY;
      setIsConnected(true);

      // Send authentication message
      if (token) {
        ws.send(
          JSON.stringify({
            type: "auth",
            token,
            username: user?.username,
          })
        );
      }

      // Start ping/keepalive interval
      pingIntervalRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "ping" }));
        }
      }, PING_INTERVAL);
    };

    ws.onmessage = (event) => {
      if (!mountedRef.current) return;

      let data;
      try {
        data = JSON.parse(event.data);
      } catch {
        console.warn("[useWebSocket] Non-JSON message received:", event.data);
        return;
      }

      switch (data.type) {
        case "message":
          // Avoid duplicate messages from self that were already optimistically added
          addMessage({
            id: data.id,
            content: data.content,
            sender: data.sender || data.username,
            sender_type: data.sender_type || "user",
            room_slug: roomSlug,
            created_at: data.created_at || new Date().toISOString(),
            metadata: data.metadata,
          });
          break;

        case "typing":
          if (data.username && data.username !== user?.username) {
            if (data.is_typing) {
              addTypingUser(roomSlug, data.username);
              // Auto-remove after 4 seconds if no stop event
              setTimeout(() => {
                if (mountedRef.current) {
                  removeTypingUser(roomSlug, data.username);
                }
              }, 4000);
            } else {
              removeTypingUser(roomSlug, data.username);
            }
          }
          break;

        case "handoff_update":
          setHandoffStatus(data.status);
          if (data.message) {
            addMessage({
              id: crypto.randomUUID(),
              content: data.message,
              sender: "System",
              sender_type: "system",
              room_slug: roomSlug,
              created_at: new Date().toISOString(),
            });
          }
          break;

        case "presence":
          setOnlineUsers(data.users || []);
          break;

        case "pong":
          // Keepalive acknowledged — nothing to do
          break;

        case "error":
          console.error("[useWebSocket] Server error:", data.message);
          break;

        default:
          console.debug("[useWebSocket] Unknown message type:", data.type);
      }
    };

    ws.onerror = (err) => {
      console.error("[useWebSocket] Connection error:", err);
    };

    ws.onclose = (event) => {
      if (!mountedRef.current) return;

      setIsConnected(false);

      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = null;
      }

      // Reconnect with exponential backoff
      const delay = reconnectDelayRef.current;
      console.info(
        `[useWebSocket] Connection closed (code: ${event.code}). Reconnecting in ${delay}ms...`
      );

      reconnectTimeoutRef.current = setTimeout(() => {
        reconnectDelayRef.current = Math.min(
          reconnectDelayRef.current * 2,
          MAX_RECONNECT_DELAY
        );
        connect();
      }, delay);
    };
  }, [
    roomSlug,
    token,
    user?.username,
    cleanup,
    addMessage,
    setIsConnected,
    addTypingUser,
    removeTypingUser,
    setHandoffStatus,
  ]);

  // Connect on mount / roomSlug change
  useEffect(() => {
    mountedRef.current = true;
    connect();

    return () => {
      mountedRef.current = false;
      cleanup();
      setIsConnected(false);
    };
  }, [connect, cleanup, setIsConnected]);

  /**
   * Send a message through the WebSocket connection.
   * @param {object} data - The message payload to send as JSON
   */
  const sendWsMessage = useCallback((data) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    } else {
      console.warn("[useWebSocket] Cannot send — WebSocket is not open");
    }
  }, []);

  const isConnected = useChatStore((s) => s.isConnected);

  return { sendWsMessage, isConnected, onlineUsers };
}
