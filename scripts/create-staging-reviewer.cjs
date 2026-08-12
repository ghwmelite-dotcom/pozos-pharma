const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const apiUrl = process.argv[2];
const siteUrl = process.argv[3];

if (!apiUrl || !siteUrl) {
  process.stderr.write("Usage: node scripts/create-staging-reviewer.cjs <api-url> <site-url>\n");
  process.exit(1);
}

const workerRuntimeDir = path.resolve(__dirname, "../worker/.wrangler");
const credentialsPath = path.join(workerRuntimeDir, "staging-reviewer-credentials.json");
const seedPath = path.join(workerRuntimeDir, "staging-reviewer-seed.sql");

function sql(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

async function main() {
  const username = "clinical_reviewer";
  const email = "practice-reviewer@staging.pozospharma.invalid";
  const password = crypto.randomBytes(24).toString("base64url");

  const response = await fetch(`${apiUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });
  const body = await response.json();

  if (!response.ok || !body.user?.id) {
    throw new Error(`Reviewer registration failed (${response.status}): ${body.error || "unknown error"}`);
  }

  const pharmacistId = crypto.randomUUID();
  const seed = [
    "-- Synthetic staging reviewer only. No real registration or patient data.",
    `UPDATE users SET role = 'pharmacist' WHERE id = ${sql(body.user.id)};`,
    "INSERT INTO pharmacists (id, user_id, full_name, license_number, country, specialization, is_verified, verified_at, badge_level, tier)",
    `VALUES (${sql(pharmacistId)}, ${sql(body.user.id)}, 'Synthetic Clinical Reviewer', 'STAGING-ONLY-0001', 'Ghana', 'Clinical governance UAT', 1, unixepoch(), 'green', 'standard');`,
    "",
  ].join("\n");

  const credentials = {
    warning: "STAGING ONLY. Share privately. Never use for production or real patient data.",
    siteUrl,
    apiUrl,
    username,
    email,
    password,
    createdAt: new Date().toISOString(),
  };

  fs.mkdirSync(workerRuntimeDir, { recursive: true });
  fs.writeFileSync(seedPath, seed, { encoding: "utf8", mode: 0o600 });
  fs.writeFileSync(credentialsPath, `${JSON.stringify(credentials, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });

  process.stdout.write(`Synthetic reviewer registered: ${email}\n`);
  process.stdout.write(`Credentials stored locally: ${credentialsPath}\n`);
  process.stdout.write(`Promotion seed created: ${seedPath}\n`);
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exit(1);
});
