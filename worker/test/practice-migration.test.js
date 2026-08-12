import assert from 'node:assert/strict';
import fs from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';

test('practice migration creates the intervention table and indexes', () => {
  const database = new DatabaseSync(':memory:');
  database.exec(`
    CREATE TABLE users (id TEXT PRIMARY KEY, role TEXT NOT NULL);
    CREATE TABLE pharmacists (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      is_verified INTEGER NOT NULL DEFAULT 0
    );
    INSERT INTO users (id, role) VALUES
      ('pending-user', 'pharmacist'),
      ('verified-user', 'pharmacist');
    INSERT INTO pharmacists (id, user_id, is_verified) VALUES
      ('pending-pharmacist', 'pending-user', 0),
      ('verified-pharmacist', 'verified-user', 1);
  `);
  database.exec(fs.readFileSync(
    new URL('../src/migrations/2026-08-12-practice-hub.sql', import.meta.url),
    'utf8'
  ));

  const table = database.prepare(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'clinical_interventions'"
  ).get();
  const indexes = database.prepare(
    "SELECT name FROM sqlite_master WHERE type = 'index' AND tbl_name = 'clinical_interventions'"
  ).all().map((index) => index.name);

  assert.equal(table.name, 'clinical_interventions');
  assert.ok(indexes.includes('idx_interventions_pharmacist_occurred'));
  assert.ok(indexes.includes('idx_interventions_pharmacist_condition'));
  assert.ok(indexes.includes('idx_interventions_pharmacist_reportable'));
  assert.equal(database.prepare("SELECT role FROM users WHERE id = 'pending-user'").get().role, 'user');
  assert.equal(database.prepare("SELECT role FROM users WHERE id = 'verified-user'").get().role, 'pharmacist');
  database.close();
});
