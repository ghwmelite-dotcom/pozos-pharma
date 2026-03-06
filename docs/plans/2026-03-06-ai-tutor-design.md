# AI Pharmacy Tutor — Design Document

## Overview
Paid AI tutoring section for PozosPharma. Chat-based pharmacy tutor powered by Cloudflare Workers AI (Llama 3.3 70B). Freemium model with Paystack subscriptions.

## Tier Structure

| Feature | Free Tier | Premium (GHS 50/mo) |
|---|---|---|
| Questions per day | 10 | Unlimited |
| Subject picker | Yes | Yes |
| Difficulty levels | Yes | Yes |
| Exam prep mode | No | Yes |
| Chat history | Last 3 conversations | Unlimited history |
| Source citations | Basic | Enhanced (RAG, later) |
| Voice input | No | Yes |

## Architecture

### Frontend (`src/pages/AITutor.jsx`)
- Chat interface with message bubbles (Adinkra Gold design system)
- Subject picker sidebar: Pharmacology, Pharmaceutics, Clinical Pharmacy, Pharmacognosy, Pharmacy Practice, Pharmaceutical Chemistry
- Difficulty selector: "Explain like I'm a..." dropdown (Year 1, Final year, Practicing pharmacist, Researcher)
- Exam prep toggle (premium only — generates MCQs with explanations)
- Voice input button (premium — Web Speech API, browser-native)
- Daily question counter for free tier
- Paywall modal when limit hit — "Upgrade to Premium" with Paystack inline checkout
- Chat history sidebar (collapsible)

### Worker API (`worker/src/`)
- `POST /api/tutor/chat` — sends message to Workers AI with pharmacy system prompt, returns streamed response
- `GET /api/tutor/history` — fetch past conversations for user
- `POST /api/tutor/subscribe` — initiate Paystack subscription
- `POST /api/tutor/webhook` — Paystack webhook to activate/deactivate subscriptions
- `GET /api/tutor/usage` — check daily question count

### Database (D1 — new tables)
- `tutor_conversations` — id, user_id, subject, difficulty, created_at
- `tutor_messages` — id, conversation_id, role, content, created_at
- `tutor_subscriptions` — user_id, paystack_sub_id, plan, status, expires_at
- `tutor_usage` — user_id, date, question_count

### System Prompt Strategy
- Detailed pharmacy system prompt covering Ghana-specific context (FDA guidelines, KNUST/UG syllabi, Ghana Essential Medicines List)
- Subject-specific context injected based on selected topic
- Difficulty level adjusts explanation depth
- Instructions to cite sources and acknowledge uncertainty
- Exam prep mode prompt variant generates MCQs with explanations
- Phase 2: RAG with pharmacy textbooks/guidelines for premium tier

### Payment Flow (Paystack)
1. User hits daily limit or clicks "Upgrade"
2. Paystack inline checkout opens (MoMo or card)
3. Paystack webhook confirms payment -> activate subscription in D1
4. Worker middleware checks subscription status on each `/api/tutor/chat` request

### Voice Input
- Web Speech API (browser-native, zero cost)
- Microphone button in chat input area
- Transcribed text inserted into input field, user confirms and sends

## Tech Stack
- Model: `@cf/meta/llama-3.3-70b-instruct-fp8-fast` (free on Workers AI)
- Payment: Paystack (MoMo + cards, recurring subscriptions)
- Database: Cloudflare D1 (existing)
- Auth: Existing user auth system
- Voice: Web Speech API (browser-native)

## Phase 2 (Future)
- RAG knowledge base (pharmacy textbooks, Ghana BNF, WHO Essential Medicines)
- RAG as premium differentiator (better accuracy for paid users)
