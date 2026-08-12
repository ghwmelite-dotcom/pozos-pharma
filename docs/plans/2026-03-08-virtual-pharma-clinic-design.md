# Virtual Pharma Clinic -- Design Document

## Overview
Private 1:1 pharmacist consultations via video/audio call with a clinical toolkit. Users can connect on-demand or book scheduled appointments. Paystack handles payment. Pharmacists earn 80% per session via an in-app wallet. Post-session AI summary generated from clinical data (no video recording).

## Session Tiers

| Tier | Duration | Price | Mode |
|---|---|---|---|
| Quick Consult | 15 min | GHS 20 | Audio only |
| Standard | 30 min | GHS 40 | Video + clinical tools |
| Comprehensive | 45 min | GHS 70 | Full workup + follow-up |

## User Flows

### On-Demand
1. User taps "Consult Now" on the clinic page
2. Selects tier, fills pre-consultation form (reason, current meds, allergies)
3. Pays via Paystack
4. Matched with next available online pharmacist (by specialization if relevant)
5. Enters virtual office -- video/audio call with clinical sidebar
6. Post-session: AI-generated summary, rate pharmacist

### Booking
1. User browses pharmacist directory
2. Clicks "Book Consultation" on a pharmacist's profile
3. Selects tier, picks available time slot
4. Fills pre-consultation form, pays via Paystack
5. Both parties get notification at session time
6. Same virtual office experience

## Virtual Office UI

Split-screen layout:
- Left (70%): Video/audio feed with call controls (mute, camera, end call, timer)
- Right (30%): Clinical toolkit tabs

## Clinical Toolkit (Pharmacist Side)

6 tabs in the sidebar:

1. **Patient Info** -- Pre-consultation form answers, allergies, current medications, past consultation history with this patient

2. **Vitals Logger** -- Form to record: blood pressure, temperature, pulse, blood sugar, weight, SpO2. Each entry timestamped. View historical vitals chart for returning patients.

3. **Symptom Checker** -- Structured intake: symptom name, onset, duration, severity (1-5), location, aggravating/relieving factors. AI suggests possible conditions based on symptoms (informational only, not diagnostic).

4. **Medication Review** -- Pull user's medications (from MyMedications if added). Run interaction check against current meds. Flag issues inline.

5. **Prescription Pad** -- Generate a recommendation note (NOT a legal prescription): recommended OTC medications, dosage instructions, lifestyle advice, referral to doctor if needed. Generates a PDF-style summary card for the patient.

6. **Session Notes** -- Private pharmacist-only notes. Not visible to patient. Persisted for future consultations with same patient.

Patient side sees: their own pre-consultation info, vitals being recorded (read-only), and the prescription/recommendation card at end of session.

## Architecture

### Frontend
- `/clinic` -- Consultation hub (browse pharmacists, on-demand, booking)
- `/clinic/session/:sessionId` -- Virtual office (video + clinical toolkit)
- Pharmacist dashboard gets "My Consultations" section (upcoming, active, past, earnings)

### Backend API (Worker)
- `POST /api/clinic/request` -- Create on-demand consultation request
- `POST /api/clinic/book` -- Book a scheduled consultation
- `GET /api/clinic/slots/:pharmacistId` -- Get available time slots
- `POST /api/clinic/slots` -- Pharmacist sets availability
- `POST /api/clinic/pay` -- Initiate Paystack payment
- `POST /api/clinic/webhook` -- Paystack webhook for payment confirmation
- `GET /api/clinic/session/:id` -- Get session details + clinical data
- `POST /api/clinic/vitals` -- Save vitals during session
- `POST /api/clinic/symptoms` -- Save symptom assessment
- `POST /api/clinic/prescription` -- Save recommendation note
- `POST /api/clinic/notes` -- Save pharmacist session notes
- `GET /api/clinic/history` -- User's past consultations
- `GET /api/clinic/earnings` -- Pharmacist earnings + wallet
- `POST /api/clinic/withdraw` -- Pharmacist requests withdrawal
- `POST /api/clinic/summary` -- AI-generated session summary (post-call)

### Database (D1 -- New Tables)
- `clinic_consultations` -- id, user_id, pharmacist_id, tier, status (pending/paid/active/completed/cancelled), scheduled_at, started_at, ended_at, pre_consult_reason, pre_consult_meds, pre_consult_allergies, payment_ref, amount, summary, created_at
- `clinic_vitals` -- id, consultation_id, patient_id, blood_pressure, temperature, pulse, blood_sugar, weight, spo2, recorded_by, created_at
- `clinic_symptoms` -- id, consultation_id, symptom, onset, duration, severity, location, aggravating, relieving, ai_suggestions, created_at
- `clinic_prescriptions` -- id, consultation_id, pharmacist_id, recommendations (JSON), referral_notes, lifestyle_advice, created_at
- `clinic_notes` -- id, consultation_id, pharmacist_id, content, created_at
- `clinic_slots` -- id, pharmacist_id, day_of_week, start_time, end_time, is_active
- `clinic_wallet` -- id, pharmacist_id, balance, total_earned, total_withdrawn
- `clinic_transactions` -- id, wallet_id, consultation_id, type (credit/debit), amount, description, created_at

### Video/Audio
- WebRTC peer-to-peer via existing Durable Object signaling
- Private 1:1 room per consultation (room slug: `clinic-{consultationId}`)
- Session timer enforced client-side with warning at 2 min remaining

### AI Summary (Post-Session)
- Workers AI (Llama 3.3 70B) generates summary from: pharmacist notes + vitals + symptoms + prescription
- Saved to `clinic_consultations.summary`
- Visible to both patient and pharmacist

### Payment Flow
1. User selects tier -> Paystack inline checkout (GHS 20/40/70)
2. Webhook confirms -> consultation status set to `paid`
3. 80% credited to pharmacist's `clinic_wallet`
4. 20% stays as platform revenue
5. Pharmacist requests withdrawal -> admin approves -> manual payout initially

## Pharmacist Availability & Matching

### Availability
- Pharmacists set recurring weekly slots (e.g., Mon 9am-12pm, Wed 2pm-6pm)
- Can toggle "Available Now" for on-demand (reuses existing `is_online` field)
- Booked slots automatically blocked

### On-Demand Matching
1. Filter pharmacists where `is_online = 1` AND `is_verified = 1`
2. If user came from specific chatroom, prefer matching specialization
3. Sort by: matching specialization > composite_score > response_time_avg
4. Assign first match, notify via WebSocket
5. Pharmacist has 60 seconds to accept, otherwise next
6. If no one available, offer to book instead

### Session Lifecycle
```
created -> paid -> waiting -> active -> completed -> summarized
```
Plus cancelled/expired states for no-shows and timeouts.

### Notifications
- Booking confirmed: both parties get in-app notification
- 15 min before scheduled session: reminder
- On-demand: pharmacist gets real-time WebSocket alert
- Session completed: both get AI summary

## Revenue Model
- Platform split: 80% pharmacist / 20% PozosPharma
- Fixed pricing per tier (GHS 20 / 40 / 70)
- Wallet system with manual withdrawal processing

## Tech Stack
- Video: WebRTC (peer-to-peer, existing DO signaling)
- Payment: Paystack (existing integration)
- AI Summary: Workers AI (Llama 3.3 70B)
- Database: Cloudflare D1
- Auth: Existing JWT system
- Frontend: React + Tailwind (Adinkra Gold design system)
