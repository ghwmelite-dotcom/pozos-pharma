const fs = require("node:fs");

const apiUrl = process.argv[2];
const siteUrl = process.argv[3];
const credentialsPath = process.argv[4];

if (!apiUrl || !siteUrl || !credentialsPath) {
  process.stderr.write("Usage: node scripts/smoke-test-practice-hub-staging.cjs <api-url> <site-url> <credentials-json>\n");
  process.exit(1);
}

const credentials = JSON.parse(fs.readFileSync(credentialsPath, "utf8"));

async function expectResponse(label, response, expectedStatus) {
  if (response.status !== expectedStatus) {
    const body = await response.text();
    throw new Error(`${label}: expected ${expectedStatus}, received ${response.status}: ${body.slice(0, 300)}`);
  }
  process.stdout.write(`PASS ${label} (${response.status})\n`);
  return response;
}

async function main() {
  await expectResponse("staging site", await fetch(siteUrl), 200);
  await expectResponse("Practice Hub route", await fetch(`${siteUrl}/practice`), 200);
  await expectResponse("unauthenticated Practice Hub API", await fetch(`${apiUrl}/api/practice/overview`), 401);

  const preflight = await fetch(`${apiUrl}/api/practice/overview`, {
    method: "OPTIONS",
    headers: {
      Origin: siteUrl,
      "Access-Control-Request-Method": "GET",
      "Access-Control-Request-Headers": "authorization",
    },
  });
  await expectResponse("staging CORS preflight", preflight, 204);
  if (preflight.headers.get("access-control-allow-origin") !== siteUrl) {
    throw new Error("staging CORS preflight did not echo the configured staging origin");
  }

  const loginResponse = await fetch(`${apiUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: credentials.email, password: credentials.password }),
  });
  await expectResponse("synthetic pharmacist login", loginResponse, 200);
  const login = await loginResponse.json();
  const headers = {
    Authorization: `Bearer ${login.token}`,
    "Content-Type": "application/json",
  };

  const overviewResponse = await fetch(`${apiUrl}/api/practice/overview`, { headers });
  await expectResponse("verified pharmacist overview", overviewResponse, 200);
  const overview = await overviewResponse.json();
  if (overview.practitioner?.license_number !== "STAGING-ONLY-0001") {
    throw new Error("overview did not resolve the synthetic verified pharmacist record");
  }

  const clientRequestId = `staging-smoke-${Date.now()}`;
  const intervention = {
    clientRequestId,
    conditionCategory: "cardiovascular",
    drugNames: "Amlodipine and simvastatin",
    issueType: "interaction",
    severity: "moderate",
    actionTaken: "Recommended prescriber review of the synthetic regimen.",
    outcome: "accepted",
    reportable: false,
    notes: "Synthetic staging record only.",
    occurredAt: new Date().toISOString(),
  };

  await expectResponse("create synthetic intervention", await fetch(`${apiUrl}/api/practice/interventions`, {
    method: "POST",
    headers,
    body: JSON.stringify(intervention),
  }), 201);

  const replayResponse = await fetch(`${apiUrl}/api/practice/interventions`, {
    method: "POST",
    headers,
    body: JSON.stringify(intervention),
  });
  await expectResponse("offline-idempotency replay", replayResponse, 200);
  const replay = await replayResponse.json();
  if (replay.replayed !== true) throw new Error("duplicate client request was not marked as replayed");

  await expectResponse("direct-identifier rejection", await fetch(`${apiUrl}/api/practice/interventions`, {
    method: "POST",
    headers,
    body: JSON.stringify({ ...intervention, clientRequestId: `${clientRequestId}-identifier`, notes: "Patient email person@example.com" }),
  }), 400);

  const exportResponse = await fetch(`${apiUrl}/api/practice/interventions/export.csv`, { headers });
  await expectResponse("pharmacist-scoped CSV export", exportResponse, 200);
  if (!exportResponse.headers.get("content-type")?.startsWith("text/csv")) {
    throw new Error("export did not return CSV content");
  }

  process.stdout.write("Staging Practice Hub smoke suite passed.\n");
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exit(1);
});
