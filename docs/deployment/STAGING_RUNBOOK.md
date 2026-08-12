# Isolated Staging Runbook

## Current state

The repository does not yet define a Cloudflare staging environment. The top-level `worker/wrangler.toml` is the production configuration and binds the production Worker name, D1 database, KV namespace, R2 bucket, production CORS origin, and `ENVIRONMENT = "production"`.

Do not run a remote migration or deploy from this branch until the staging resources below exist. A staging Worker that points to production storage is not isolated staging.

## Required staging resources

Provision these in the intended Cloudflare account and record their generated identifiers outside source control:

- Worker environment: `pozospharma-worker-staging`
- D1 database: `pozospharma-db-staging`
- KV namespace dedicated to staging
- R2 bucket: `pozospharma-docs-staging`
- Staging frontend URL and matching CORS origin
- Staging-only `JWT_SECRET`, email credentials, payment test credentials, and any other Worker secrets
- Synthetic verified-pharmacist and ordinary-user accounts

Use synthetic clinical records only. Never copy production user, pharmacist, chat, intervention, or analytics data into staging.

## Wrangler environment template

Cloudflare named environments create a separately named Worker, but bindings and variables are not inherited. After provisioning the resources, append an environment block like this to `worker/wrangler.toml`, replacing every placeholder with the generated staging value:

```toml
[env.staging]
workers_dev = true

  [env.staging.vars]
  ENVIRONMENT = "staging"
  APP_NAME = "PozosPharma Staging"
  AI_PRIMARY_MODEL = "@cf/meta/llama-3.1-8b-instruct"
  AI_FALLBACK_MODEL = "@cf/mistral/mistral-7b-instruct-v0.1"
  AI_COMPLEX_MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast"
  CORS_ORIGIN = "https://REPLACE_WITH_STAGING_FRONTEND"
  PAYSTACK_PLAN_CODE = ""

  [env.staging.ai]
  binding = "AI"

  [[env.staging.d1_databases]]
  binding = "DB"
  database_name = "pozospharma-db-staging"
  database_id = "REPLACE_WITH_STAGING_D1_ID"

  [[env.staging.kv_namespaces]]
  binding = "KV"
  id = "REPLACE_WITH_STAGING_KV_ID"

  [[env.staging.r2_buckets]]
  binding = "R2"
  bucket_name = "pozospharma-docs-staging"

  [[env.staging.durable_objects.bindings]]
  name = "CHAT_ROOM"
  class_name = "ChatRoom"

  [[env.staging.migrations]]
  tag = "v1"
  new_classes = ["ChatRoom"]
```

Cloudflare environment guidance: <https://developers.cloudflare.com/workers/wrangler/environments/> and <https://developers.cloudflare.com/workers/wrangler/configuration/#environments>.

## Deployment gate

Before any remote command:

1. Confirm the active Cloudflare account is the intended PozosPharma account.
2. Review `npx wrangler deploy --env staging --dry-run` and confirm every binding name includes the staging resource.
3. Add staging secrets with Wrangler's secret command for the `staging` environment. Do not place secrets in `wrangler.toml`, `.env`, logs, or the PR.
4. Apply `schema.sql`, then the dated migrations, to the dedicated staging D1 database only.
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
