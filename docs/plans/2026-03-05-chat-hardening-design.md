# Chat Room Hardening - Design Document

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Harden the chat room from a fragile MVP to a reliable, secure real-time messaging system.

**Architecture:** Three-layer approach: security (JWT in DO, safety filter), reliability (REST-to-DO bridge, dedup, history replay, reconnection UX), and UX polish (active counts, typing ghost fix, retry, pharmacist handoff). All messages flow through REST API for auth/persistence/AI, then broadcast via Durable Object for real-time delivery.

**Tech Stack:** Cloudflare Workers, Durable Objects (WebSocket), D1 (SQLite), KV, React 18, Zustand, Tailwind CSS

---

## Layer 1: Security

### 1a. JWT Validation in Durable Object
- Extract `verifyToken()` from `worker/src/middleware/auth.js` into a shared utility
- Import into `ChatRoom.js`, validate token on `auth` message
- Reject connection with `{ type: "error", message: "Invalid token" }` and close if invalid
- Store verified userId/role from token payload, not client-provided data

### 1b. Token Expiry Watchdog
- Store token expiry time on session after successful auth
- In existing ping cycle, check expiry
- Send `{ type: "auth_expired" }` and close if expired
- Frontend shows "Session expired" banner and redirects to login

### 1c. Expanded Safety Filter
- Add ~20 more patterns: self-harm variations, abuse/threats, drug solicitation
- Add basic profanity detection
- Add spam detection: repeated messages, all-caps floods
- Keep existing crisis response for self-harm patterns

---

## Layer 2: Reliability

### 2a. REST-to-DO Message Broadcast Bridge
- After `sendMessage()` in `chat.js` saves messages to D1, call the Durable Object via internal fetch
- DO broadcasts user message + AI response to all connected WebSocket clients
- Frontend stops sending chat messages via WebSocket directly
- All messages go through REST (auth, rate limiting, safety, AI, persistence)
- DO handles only: broadcast, presence, typing indicators, video signaling

### 2b. Message Deduplication
- Every message has a UUID from the backend
- Zustand store's `addMessage` checks for existing message with same ID before inserting
- Prevents optimistic update + broadcast duplicate

### 2c. Message History on Reconnect
- On WebSocket auth success, DO queries D1 for last 50 messages in the room
- Sends `{ type: "history", messages: [...] }` to the connecting client
- Frontend merges with existing messages, deduplicating by ID

### 2d. Reconnection UX
- Add `connectionStatus` state to Zustand: `connected`, `connecting`, `disconnected`
- `useWebSocket.js` updates this state on connect/disconnect/reconnect
- `ChatWindow.jsx` shows slim banner: yellow "Reconnecting..." or red "Disconnected"
- Banner disappears on successful reconnect

### 2e. Failed Message Retry
- Failed messages get a "Retry" button
- Clicking retry re-calls REST API with same content
- After 3 retries: "Could not send. Check your connection."

---

## Layer 3: UX Polish

### 3a. Room Active User Counts
- DO stores user count in KV on presence change (`room:${slug}:users`, 60s TTL)
- `GET /api/chat/rooms` reads KV keys and returns actual counts
- Frontend polls rooms every 30s on home page only

### 3b. Typing Indicator Ghost Fix
- Reduce auto-remove timeout from 4s to 2s on receiving side
- On WebSocket close in DO, broadcast `typing: false` for disconnecting user

### 3c. Pharmacist Handoff Acceptance
- Add "Handoff Queue" tab to PharmacistPortal
- Shows pending handoffs with urgency, user info, AI summary
- "Accept" button: updates session status to `pharmacist_active`, broadcasts via DO
- Frontend shows "A pharmacist has joined" banner
- Pharmacist types in chat, messages saved with `sender_type: 'pharmacist'`

---

## Out of Scope (YAGNI)
- AI response streaming
- Read receipts
- Message editing/deletion
- Message search
- Thread replies / mentions
- bcrypt password upgrade
- Room creation by users

---

## Files Affected

**Worker (backend):**
- `worker/src/middleware/auth.js` - extract verifyToken to shared utility
- `worker/src/durable-objects/ChatRoom.js` - JWT validation, history replay, typing ghost fix, presence KV sync, broadcast endpoint
- `worker/src/routes/chat.js` - REST-to-DO bridge after sendMessage
- `worker/src/routes/safety.js` - expanded patterns
- `worker/src/routes/pharmacist.js` - handoff accept endpoint (may already exist)

**Frontend:**
- `frontend/src/hooks/useWebSocket.js` - auth_expired handling, connectionStatus, history merge
- `frontend/src/store/chatStore.js` - connectionStatus state, message dedup, retry logic
- `frontend/src/pages/ChatRoom.jsx` - connection banner, retry UI
- `frontend/src/components/Chat/ChatWindow.jsx` - connection status banner
- `frontend/src/components/Chat/MessageBubble.jsx` - retry button for failed messages
- `frontend/src/pages/PharmacistPortal.jsx` - handoff queue tab
