-- PozosPharma Database Schema
-- Cloudflare D1 (SQLite)

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  avatar_url TEXT,
  created_at INTEGER DEFAULT (unixepoch()),
  is_banned INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS pharmacists (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  full_name TEXT NOT NULL,
  license_number TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'Ghana',
  specialization TEXT,
  is_verified INTEGER DEFAULT 0,
  is_online INTEGER DEFAULT 0,
  bio TEXT,
  rating REAL DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  verified_at INTEGER,
  badge_level TEXT DEFAULT 'green',
  license_doc_key TEXT,
  tier TEXT DEFAULT 'standard',
  composite_score REAL DEFAULT 0,
  response_time_avg REAL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  pharmacist_id TEXT,
  room_id TEXT,
  status TEXT DEFAULT 'ai_active',
  topic TEXT,
  started_at INTEGER DEFAULT (unixepoch()),
  ended_at INTEGER,
  handoff_requested_at INTEGER,
  handoff_accepted_at INTEGER,
  ai_summary TEXT,
  satisfaction_rating INTEGER
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  session_id TEXT REFERENCES sessions(id),
  sender_id TEXT,
  sender_type TEXT NOT NULL,
  content TEXT NOT NULL,
  is_flagged INTEGER DEFAULT 0,
  flag_reason TEXT,
  drug_references TEXT,
  created_at INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS drugs (
  id TEXT PRIMARY KEY,
  generic_name TEXT NOT NULL,
  brand_names TEXT,
  drug_class TEXT,
  uses TEXT,
  side_effects TEXT,
  interactions TEXT,
  dosage_notes TEXT,
  pregnancy_category TEXT,
  otc INTEGER DEFAULT 0,
  controlled INTEGER DEFAULT 0,
  -- NHIS coverage & pricing (queried by worker/src/routes/drugs.js). Unpopulated
  -- until real NHIS Medicines List / price data is loaded — 0/NULL means "unknown",
  -- not "confirmed not covered". nhis_tier holds the NHIS list category (e.g. 'A'/'B'/'C').
  nhis_covered INTEGER DEFAULT 0,
  nhis_tier TEXT,
  avg_price_ghs REAL,
  -- Provenance / clinical-credibility fields. A row is only "verified" when
  -- reviewed_by is populated by a licensed pharmacist. See drugRAG / pozosBot.
  contraindications TEXT,                 -- absolute contraindications; do NOT bury these in `interactions`
  pregnancy_category_system TEXT,         -- which system the letter/label uses (e.g. 'US-FDA (legacy)', 'AU-TGA', 'narrative')
  source_reference TEXT,                  -- e.g. 'Ghana STG 2017; WHO Malaria Guidelines 2023'
  source_url TEXT,
  reviewed_by TEXT,                       -- licensed pharmacist name + Pharmacy Council of Ghana licence no.; NULL = unreviewed
  reviewed_at INTEGER                     -- epoch seconds of pharmacist sign-off
);

-- Herbal & traditional medicines (Ghanaian / West African). Deliberately SEPARATE
-- from `drugs`: evidence_level is a first-class column so traditional use is never
-- presented as clinical proof. Seeded in herbs-seed.sql. reviewed_by NULL = not yet
-- verified by a pharmacist / qualified herbal-medicine authority.
CREATE TABLE IF NOT EXISTS herbs (
  id TEXT PRIMARY KEY,
  common_name TEXT NOT NULL,
  local_names TEXT,                       -- Twi/Ga/Ewe/Hausa/pidgin names
  scientific_name TEXT,
  traditional_uses TEXT,                  -- what it is traditionally used for (claim, not endorsement)
  evidence_level TEXT,                    -- 'traditional use only' | 'limited clinical evidence' | 'moderate evidence' | 'well established'
  active_constituents TEXT,
  herb_drug_interactions TEXT,            -- interactions with conventional medicines
  safety_concerns TEXT,                   -- toxicity, organ effects, overdose, adulteration
  pregnancy_caution TEXT,                 -- pregnancy/breastfeeding safety note
  preparation TEXT,                       -- typical preparation (decoction, infusion, poultice)
  source_reference TEXT,
  source_url TEXT,
  reviewed_by TEXT,                       -- NULL = not verified
  reviewed_at INTEGER
);

CREATE TABLE IF NOT EXISTS handoff_queue (
  id TEXT PRIMARY KEY,
  session_id TEXT REFERENCES sessions(id),
  user_id TEXT REFERENCES users(id),
  urgency TEXT DEFAULT 'normal',
  reason TEXT,
  ai_summary TEXT,
  created_at INTEGER DEFAULT (unixepoch()),
  claimed_by TEXT,
  claimed_at INTEGER
);

CREATE TABLE IF NOT EXISTS rooms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  category TEXT,
  active_users INTEGER DEFAULT 0,
  total_messages INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  pharmacist_id TEXT REFERENCES pharmacists(id),
  user_id TEXT REFERENCES users(id),
  session_id TEXT REFERENCES sessions(id),
  rating INTEGER NOT NULL,
  comment TEXT,
  created_at INTEGER DEFAULT (unixepoch())
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_messages_session ON messages(session_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_handoff_queue_claimed ON handoff_queue(claimed_by);
CREATE INDEX IF NOT EXISTS idx_drugs_generic ON drugs(generic_name);
CREATE INDEX IF NOT EXISTS idx_herbs_common ON herbs(common_name);
CREATE INDEX IF NOT EXISTS idx_pharmacists_verified ON pharmacists(is_verified);
CREATE INDEX IF NOT EXISTS idx_pharmacists_score ON pharmacists(composite_score);

-- Seed community rooms
INSERT OR IGNORE INTO rooms VALUES
  ('r1','General Questions','general','All pharmaceutical Q&A — ask anything about your medications','💊','general',0,0),
  ('r2','Drug Interactions','interactions','Check combination safety before mixing medications','⚠️','safety',0,0),
  ('r3','Chronic Conditions','chronic','Diabetes, hypertension, sickle cell & more','🫀','chronic',0,0),
  ('r4','Mental Health Meds','mental-health','Antidepressants, anxiolytics & mental wellness','🧠','mental_health',0,0),
  ('r5','Children''s Health','pediatric','Pediatric dosing & safety for Ghanaian families','👶','pediatric',0,0),
  ('r6','Women''s Health','womens-health','Hormones, pregnancy, reproductive health','🌸','womens',0,0),
  ('r7','OTC Medications','otc','No-prescription guidance — what you can buy at the pharmacy','🏥','otc',0,0),
  ('r8','Cancer Support','oncology','Oncology medication help & support','🎗️','oncology',0,0),
  ('r9','Herbal & Traditional','herbal','Traditional Ghanaian remedies & herb-drug interactions','🌿','traditional',0,0);

-- Seed common Ghanaian market drugs
INSERT OR IGNORE INTO drugs
  (id, generic_name, brand_names, drug_class, uses, side_effects, interactions, dosage_notes, pregnancy_category, otc, controlled)
VALUES
  ('d1','Paracetamol','Panadol, Efpac, Tylenol','Analgesic/Antipyretic','Pain relief, fever reduction','Liver damage at high doses, nausea, rash','Warfarin, alcohol, isoniazid','Adults: 500mg-1g every 4-6hrs, max 4g/day. Children: 10-15mg/kg','B',1,0),
  ('d2','Amoxicillin','Amoxil, Ospamox','Penicillin Antibiotic','Bacterial infections, UTI, respiratory infections','Diarrhea, nausea, rash, allergic reactions','Methotrexate, warfarin, oral contraceptives','Adults: 250-500mg every 8hrs. Children: 25mg/kg/day divided','B',0,0),
  ('d3','Metformin','Glucophage, Diaformin','Biguanide','Type 2 diabetes','Nausea, diarrhea, lactic acidosis (rare), B12 deficiency','Alcohol, contrast dyes, cimetidine','Start 500mg once daily, max 2550mg/day with meals','B',0,0),
  ('d4','Artemether-Lumefantrine','Coartem, Lonart','Antimalarial','Uncomplicated P. falciparum malaria','Headache, dizziness, nausea, joint pain','CYP3A4 inhibitors, grapefruit, other QT-prolonging drugs','Adults: 4 tablets at 0,8,24,36,48,60hrs','C',0,0),
  ('d5','Amlodipine','Norvasc, Amlovar','Calcium Channel Blocker','Hypertension, angina','Ankle swelling, dizziness, flushing, headache','Simvastatin (high doses), CYP3A4 inhibitors','5-10mg once daily','C',0,0),
  ('d6','Omeprazole','Losec, Omez','Proton Pump Inhibitor','GERD, peptic ulcers, H. pylori (combo)','Headache, diarrhea, B12 deficiency (long-term)','Clopidogrel, methotrexate, diazepam','20-40mg once daily before breakfast','C',0,0),
  ('d7','Ibuprofen','Brufen, Advil, Nurofen','NSAID','Pain, inflammation, fever','GI bleeding, kidney issues, cardiovascular risk','Aspirin, warfarin, ACE inhibitors, lithium','Adults: 200-400mg every 4-6hrs, max 1200mg/day OTC','C/D',1,0),
  ('d8','Ciprofloxacin','Cipro, Ciproxin','Fluoroquinolone','UTI, respiratory, GI infections','Tendon damage, nausea, dizziness, photosensitivity','Tizanidine, theophylline, antacids, dairy','250-750mg every 12hrs','C',0,0),
  ('d9','Diazepam','Valium','Benzodiazepine','Anxiety, seizures, muscle spasm','Drowsiness, dependence, respiratory depression','Alcohol, opioids, CYP3A4 inhibitors','2-10mg 2-4 times daily as needed','D',0,1),
  ('d10','Oral Rehydration Salts','ORS, Pedialyte','Electrolyte Replacement','Dehydration from diarrhea, vomiting','Vomiting if consumed too fast, hypernatremia (rare)','None significant','Dissolve 1 sachet in 1L clean water, sip frequently','A',1,0);

-- AI Tutor tables
CREATE TABLE IF NOT EXISTS tutor_conversations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  subject TEXT NOT NULL DEFAULT 'general',
  difficulty TEXT NOT NULL DEFAULT 'year1',
  title TEXT,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS tutor_messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES tutor_conversations(id),
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS tutor_subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL REFERENCES users(id),
  paystack_sub_code TEXT,
  paystack_customer_code TEXT,
  plan TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'active',
  current_period_end INTEGER,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS tutor_usage (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  date TEXT NOT NULL,
  question_count INTEGER DEFAULT 0,
  UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_tutor_conv_user ON tutor_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_tutor_conv_updated ON tutor_conversations(updated_at);
CREATE INDEX IF NOT EXISTS idx_tutor_msg_conv ON tutor_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_tutor_msg_created ON tutor_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_tutor_sub_user ON tutor_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_tutor_usage_user_date ON tutor_usage(user_id, date);

-- Virtual Pharma Clinic tables

CREATE TABLE IF NOT EXISTS clinic_consultations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  pharmacist_id TEXT REFERENCES pharmacists(id),
  tier TEXT NOT NULL CHECK(tier IN ('quick', 'standard', 'comprehensive')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'paid', 'waiting', 'active', 'completed', 'cancelled', 'expired', 'summarized')),
  mode TEXT NOT NULL DEFAULT 'on_demand' CHECK(mode IN ('on_demand', 'booking')),
  scheduled_at INTEGER,
  started_at INTEGER,
  ended_at INTEGER,
  pre_consult_reason TEXT,
  pre_consult_meds TEXT,
  pre_consult_allergies TEXT,
  payment_ref TEXT,
  amount INTEGER NOT NULL DEFAULT 0,
  summary TEXT,
  user_rating INTEGER,
  user_review TEXT,
  created_at INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS clinic_vitals (
  id TEXT PRIMARY KEY,
  consultation_id TEXT NOT NULL REFERENCES clinic_consultations(id),
  patient_id TEXT NOT NULL REFERENCES users(id),
  blood_pressure TEXT,
  temperature REAL,
  pulse INTEGER,
  blood_sugar REAL,
  weight REAL,
  spo2 INTEGER,
  recorded_by TEXT NOT NULL REFERENCES users(id),
  created_at INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS clinic_symptoms (
  id TEXT PRIMARY KEY,
  consultation_id TEXT NOT NULL REFERENCES clinic_consultations(id),
  symptom TEXT NOT NULL,
  onset TEXT,
  duration TEXT,
  severity INTEGER CHECK(severity BETWEEN 1 AND 5),
  location TEXT,
  aggravating TEXT,
  relieving TEXT,
  ai_suggestions TEXT,
  created_at INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS clinic_prescriptions (
  id TEXT PRIMARY KEY,
  consultation_id TEXT NOT NULL REFERENCES clinic_consultations(id),
  pharmacist_id TEXT NOT NULL REFERENCES pharmacists(id),
  recommendations TEXT,
  referral_notes TEXT,
  lifestyle_advice TEXT,
  created_at INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS clinic_notes (
  id TEXT PRIMARY KEY,
  consultation_id TEXT NOT NULL REFERENCES clinic_consultations(id),
  pharmacist_id TEXT NOT NULL REFERENCES pharmacists(id),
  content TEXT NOT NULL,
  created_at INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS clinic_slots (
  id TEXT PRIMARY KEY,
  pharmacist_id TEXT NOT NULL REFERENCES pharmacists(id),
  day_of_week INTEGER NOT NULL CHECK(day_of_week BETWEEN 0 AND 6),
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  is_active INTEGER DEFAULT 1,
  created_at INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS clinic_wallet (
  id TEXT PRIMARY KEY,
  pharmacist_id TEXT UNIQUE NOT NULL REFERENCES pharmacists(id),
  balance INTEGER DEFAULT 0,
  total_earned INTEGER DEFAULT 0,
  total_withdrawn INTEGER DEFAULT 0,
  created_at INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS clinic_transactions (
  id TEXT PRIMARY KEY,
  wallet_id TEXT NOT NULL REFERENCES clinic_wallet(id),
  consultation_id TEXT REFERENCES clinic_consultations(id),
  type TEXT NOT NULL CHECK(type IN ('credit', 'debit')),
  amount INTEGER NOT NULL,
  description TEXT,
  created_at INTEGER DEFAULT (unixepoch())
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_clinic_consult_user ON clinic_consultations(user_id);
CREATE INDEX IF NOT EXISTS idx_clinic_consult_pharmacist ON clinic_consultations(pharmacist_id);
CREATE INDEX IF NOT EXISTS idx_clinic_consult_status ON clinic_consultations(status);
CREATE INDEX IF NOT EXISTS idx_clinic_consult_scheduled ON clinic_consultations(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_clinic_vitals_consult ON clinic_vitals(consultation_id);
CREATE INDEX IF NOT EXISTS idx_clinic_vitals_patient ON clinic_vitals(patient_id);
CREATE INDEX IF NOT EXISTS idx_clinic_symptoms_consult ON clinic_symptoms(consultation_id);
CREATE INDEX IF NOT EXISTS idx_clinic_slots_pharmacist ON clinic_slots(pharmacist_id);
CREATE INDEX IF NOT EXISTS idx_clinic_wallet_pharmacist ON clinic_wallet(pharmacist_id);
CREATE INDEX IF NOT EXISTS idx_clinic_transactions_wallet ON clinic_transactions(wallet_id);
