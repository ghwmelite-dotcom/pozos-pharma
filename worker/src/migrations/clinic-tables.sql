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
