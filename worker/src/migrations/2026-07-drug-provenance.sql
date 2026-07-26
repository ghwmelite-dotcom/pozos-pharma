-- Migration: add clinical provenance / credibility columns to the drugs table.
-- Safe to run once against an existing D1 database that predates these columns.
-- Fresh installs already get these columns from schema.sql.
--
-- Apply with:
--   wrangler d1 execute pozospharma-db --file=worker/src/migrations/2026-07-drug-provenance.sql
--
-- SQLite has no "ADD COLUMN IF NOT EXISTS"; each statement errors harmlessly
-- if the column already exists. Run individually if a re-run is needed.

ALTER TABLE drugs ADD COLUMN contraindications TEXT;
ALTER TABLE drugs ADD COLUMN pregnancy_category_system TEXT;
ALTER TABLE drugs ADD COLUMN source_reference TEXT;
ALTER TABLE drugs ADD COLUMN source_url TEXT;
ALTER TABLE drugs ADD COLUMN reviewed_by TEXT;
ALTER TABLE drugs ADD COLUMN reviewed_at INTEGER;

-- NHIS coverage & pricing columns queried by worker/src/routes/drugs.js
-- (searchDrugs, getNhisDrugs, checkInteractions). Without these, the
-- Interaction Checker and NHIS lookup throw "no such column" and break.
ALTER TABLE drugs ADD COLUMN nhis_covered INTEGER DEFAULT 0;
ALTER TABLE drugs ADD COLUMN nhis_tier TEXT;
ALTER TABLE drugs ADD COLUMN avg_price_ghs REAL;
