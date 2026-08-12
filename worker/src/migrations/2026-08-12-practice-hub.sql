-- PSGH-aligned, de-identified pharmacy intervention documentation.
-- Never store patient names, phone numbers, addresses, or NHIS identifiers here.
-- Repair legacy applications that were promoted before admin verification.
UPDATE users
SET role = 'user'
WHERE role = 'pharmacist'
  AND EXISTS (
    SELECT 1 FROM pharmacists p
    WHERE p.user_id = users.id AND p.is_verified = 0
  )
  AND NOT EXISTS (
    SELECT 1 FROM pharmacists p
    WHERE p.user_id = users.id AND p.is_verified = 1
  );

CREATE TABLE IF NOT EXISTS clinical_interventions (
  id TEXT PRIMARY KEY,
  pharmacist_id TEXT NOT NULL REFERENCES pharmacists(id),
  recorded_by_user_id TEXT NOT NULL REFERENCES users(id),
  client_request_id TEXT,
  reference_code TEXT NOT NULL UNIQUE,
  condition_category TEXT NOT NULL,
  drug_names TEXT NOT NULL,
  issue_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  action_taken TEXT NOT NULL,
  outcome TEXT NOT NULL,
  reportable INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  occurred_at INTEGER NOT NULL DEFAULT (unixepoch()),
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE(pharmacist_id, client_request_id)
);

CREATE INDEX IF NOT EXISTS idx_interventions_pharmacist_occurred
  ON clinical_interventions(pharmacist_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_interventions_pharmacist_condition
  ON clinical_interventions(pharmacist_id, condition_category, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_interventions_pharmacist_reportable
  ON clinical_interventions(pharmacist_id, reportable, occurred_at DESC);
