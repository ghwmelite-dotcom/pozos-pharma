# Isolated Staging Runbook

## Current state

An isolated Cloudflare staging environment was provisioned on 12 August 2026 in the account pinned by `worker/wrangler.toml`:

- Frontend: <https://pozospharma-staging.pages.dev>
- Worker API: <https://pozospharma-worker-staging.ghwmelite.workers.dev>
- Worker environment: `pozospharma-worker-staging`
- D1 database: `pozospharma-db-staging`
- KV namespace: `pozospharma-worker-staging-KV`
- R2 bucket: `pozospharma-docs-staging`

The staging environment has a separate JWT secret and a synthetic verified-pharmacist account. Production data was not copied or queried. Production deployment remains a separate, human-approved release phase.

## Environment configuration

The `[env.staging]` block in `worker/wrangler.toml` declares every non-inherited binding and variable. Before a deployment, run:

```powershell
cd worker
npx.cmd wrangler deploy --env staging --dry-run --outdir .wrangler\staging-dry-run
```

The binding report must name only the staging D1 database, KV namespace, R2 bucket, staging CORS origin, and staging Worker. Stop if any production resource appears.

Use synthetic clinical records only. Never copy production user, pharmacist, chat, intervention, or analytics data into staging.

## Deployment procedure

Initialize a newly created staging database once:

```powershell
cd worker
npx.cmd wrangler d1 execute pozospharma-db-staging --remote --file=..\schema.sql
```

Deploy the Worker:

```powershell
cd worker
npx.cmd wrangler deploy --env staging
```

Build and deploy the frontend against the staging Worker:

```powershell
cd frontend
$env:VITE_API_URL='https://pozospharma-worker-staging.ghwmelite.workers.dev'
npm.cmd run build
..\worker\node_modules\.bin\wrangler.cmd pages deploy dist --project-name pozospharma-staging --branch staging
```

Record the exact Git commit and both URLs in the pharmacist approval form after deployment.

## Synthetic reviewer handoff

The staging credentials are generated locally at `worker/.wrangler/staging-reviewer-credentials.json`, which is ignored by Git. Share them with the registered pharmacist through a private channel; never paste the password into the PR, an issue, logs, or the approval document. The synthetic license value is visibly marked `STAGING-ONLY` and is not a Pharmacy Council registration.

After creating or rotating the account, promote only that synthetic user in the staging D1 database. The helper produces a seed under `worker/.wrangler`; verify the target database name before executing it.

Run the automated smoke suite before handoff:

```powershell
node scripts\smoke-test-practice-hub-staging.cjs `
  https://pozospharma-worker-staging.ghwmelite.workers.dev `
  https://pozospharma-staging.pages.dev `
  worker\.wrangler\staging-reviewer-credentials.json
```

## Validation evidence

On 12 August 2026:

- Worker tests: 20 passed, 0 failed.
- Frontend production build: passed.
- Wrangler staging dry run: passed with staging-only bindings.
- Live smoke suite: passed for site routing, unauthenticated denial, CORS, synthetic pharmacist login, overview, record creation, idempotent replay, direct-identifier rejection, and CSV export.

The automated suite is a technical gate, not clinical approval. A registered pharmacist must complete and sign `docs/reviews/PRACTICE_HUB_APPROVAL_FORM.docx` against the deployed Git commit.

## Release gate

Before any remote command:

1. Confirm the active Cloudflare account is the intended PozosPharma account.
2. Review `npx wrangler deploy --env staging --dry-run` and confirm every binding name includes the staging resource.
3. Add staging secrets with Wrangler's secret command for the `staging` environment. Do not place secrets in `wrangler.toml`, `.env`, logs, or the PR.
4. Apply `schema.sql` to a new dedicated staging D1 database only. The current schema already contains the dated Practice Hub and analytics changes.
5. Deploy the Worker with `npx wrangler deploy --env staging`.
6. Build the frontend with `VITE_API_URL` set to the staging Worker URL and deploy it to a non-production Pages project or preview environment.
7. Run the UAT scenarios in `docs/reviews/PRACTICE_HUB_PHARMACIST_REVIEW.md`.

## Go/no-go checks

- CI is green on the exact commit being staged.
- The registered-pharmacist review decision permits staging UAT.
- D1, KV, R2, Durable Object, secrets, CORS, and frontend are all isolated from production.
- Test users contain no real patient data.
- Unverified and ordinary users receive access denial.
- Offline sync creates one record after reconnect.
- CSV export is pharmacist-scoped and opens without executing formula content.
- Logs contain no record body, token, secret, or patient information.

## Rollback

If UAT fails, stop the staging Worker deployment or redeploy the previous staging version. Preserve staging evidence needed for diagnosis, then delete synthetic records through an approved staging-data cleanup procedure. Do not change or purge production resources as part of staging rollback.
