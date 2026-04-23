# Operations Runbook

This runbook covers monitoring, scaling, backup, and incident response for the ExamCraft production environment.

---

## 1. Health Monitoring

### 1.1 Health Endpoints

The API exposes three health endpoints defined in `apps/api/src/health/health.controller.ts`:

| Endpoint | Method | Purpose | Response |
|---|---|---|---|
| `/api/v1/health` | `GET` | Full health check (self-ping) | `{ "status": "ok", "info": { "api-status": { "status": "up" } } }` |
| `/api/v1/health/ready` | `GET` | Readiness — checks Supabase Auth connectivity | `{ "status": "ok", "info": { "supabase-api": { "status": "up" } } }` |
| `/api/v1/health/live` | `GET` | Liveness — immediate response, no dependencies | `{ "status": "ok", "timestamp": "2026-04-23T12:00:00.000Z" }` |

The Dockerfile (`apps/api/Dockerfile`) includes a built-in health check:

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:8080/api/v1/health/live || exit 1
```

### 1.2 Recommended Uptime Monitoring

Configure an external monitoring service to probe the health endpoints every 1–5 minutes:

| Service | Free Tier | Setup |
|---|---|---|
| [UptimeRobot](https://uptimerobot.com) | 50 monitors | Add HTTP monitor for `https://api.yourdomain.com/api/v1/health/live` |
| [Better Stack](https://betterstack.com) | 5 monitors | Add uptime check with alerting to Slack/PagerDuty |

**Recommended monitors:**

| Monitor | URL | Expected | Alert if |
|---|---|---|---|
| API Liveness | `/api/v1/health/live` | `200` + `{ "status": "ok" }` | Non-200 or timeout |
| API Readiness | `/api/v1/health/ready` | `200` + `"status": "up"` | `supabase-api` status is `"down"` |
| Frontend | `https://app.yourdomain.com` | `200` | Non-200 |

### 1.3 Alert Configuration

- **Critical:** API liveness fails for >2 consecutive checks → page on-call
- **Warning:** API readiness fails → check Supabase status page
- **Info:** Frontend 5xx errors → check Vercel deployment logs

---

## 2. Error Tracking

### 2.1 Sentry Configuration

ExamCraft uses Sentry for both frontend and backend error tracking.

**API (NestJS)** — configured in `apps/api/src/instrument.ts`:

```typescript
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [nodeProfilingIntegration()],
  tracesSampleRate: 0.1,    // 10% of transactions
  profilesSampleRate: 0.1,  // 10% of profiles
});
```

**Web (Next.js Client)** — configured in `apps/web/sentry.client.config.ts`:

```typescript
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,          // 10% of transactions
  replaysOnErrorSampleRate: 1.0,  // 100% of error replays
  replaysSessionSampleRate: 0.1,  // 10% of session replays
  integrations: [Sentry.replayIntegration({ maskAllText: true, blockAllMedia: true })],
});
```

**Web (Next.js Server)** — configured in `apps/web/sentry.server.config.ts`:

```typescript
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,  // 10% of transactions
});
```

### 2.2 Accessing and Triaging Errors

1. Go to your Sentry dashboard → **Issues**.
2. Filter by project:
   - `examcraft-api` — backend errors
   - `examcraft-web` — frontend errors
3. Prioritize issues by:
   - **Frequency** — how many users are affected
   - **Level** — `error` > `warning` > `info`
   - **Release** — is it a new regression?
4. Use **Replays** (client-side only) to replay the user session that triggered the error.

### 2.3 Sentry Sample Rates Reference

| Rate | API | Web Client | Web Server |
|---|---|---|---|
| `tracesSampleRate` | 0.1 | 0.1 | 0.1 |
| `profilesSampleRate` | 0.1 | — | — |
| `replaysOnErrorSampleRate` | — | 1.0 | — |
| `replaysSessionSampleRate` | — | 0.1 | — |

To increase tracing for debugging, raise `tracesSampleRate` temporarily (e.g. to `1.0`) and redeploy. Reset to `0.1` after investigation to control quota usage.

---

## 3. Logging

### 3.1 API Logging (NestJS)

The API uses NestJS's built-in `Logger`. All log output goes to **stdout** in JSON-friendly format. Key log sources:

- **Bootstrap messages** — startup confirmation, port binding
- **HTTP requests** — via middleware or interceptor (if configured)
- **Error stack traces** — uncaught exceptions and filter output

Logs are written to stdout by default, making them compatible with any log aggregation system.

### 3.2 Local Log Aggregation (Vector)

The `docker-compose.yml` includes a Vector container for local log aggregation:

```yaml
vector:
  image: timberio/vector:0.39.0-alpine
  ports:
    - "9001:9001"
  volumes:
    - ./supabase/vector.yml:/etc/vector/vector.yml:ro
```

This is for local development only. In production, use one of the cloud options below.

### 3.3 Cloud Logging Options

| Service | Setup |
|---|---|
| **CloudWatch** (AWS) | If API runs on ECS/EC2, logs are auto-captured. Configure log group and retention. |
| **Datadog** | Install the Datadog Agent on the container host. Set `DD_API_KEY` and `DD_SITE`. |
| **Grafana Cloud** | Use the Grafana Agent or Loki driver. Configure via `loki` log driver in Docker. |
| **Railway Logs** | Logs are available in the Railway dashboard under the service → Deployments tab. |
| **Cloud Run Logs** | Logs are available in Google Cloud Console → Cloud Run → service → Logs tab. |

### 3.4 Useful Log Queries

```bash
# View API container logs (Docker)
docker logs examcraft-api --tail 100 -f

# Railway
railway logs --service examcraft-api

# Cloud Run (gcloud)
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=examcraft-api" --limit 50
```

---

## 4. Database Operations

### 4.1 Supabase Cloud Dashboard Access

Navigate to <https://supabase.com/dashboard>, select your project. Key sections:

| Section | Purpose |
|---|---|
| **Table Editor** | Browse and edit data directly |
| **SQL Editor** | Run ad-hoc SQL queries |
| **Authentication** | Manage users, view sign-in logs |
| **Database → Migrations** | View applied migration history |
| **Database → Backups** | View available PITR snapshots |
| **Logs** | Database and API request logs |

### 4.2 Running Migrations

To apply new migrations to production:

```bash
# Ensure you're linked to the correct project
supabase link --project-ref <your-project-ref>

# Push pending migrations
supabase db push
```

To check migration status without applying:

```bash
supabase db diff --schema public
```

> **Warning:** Never modify the database schema directly via SQL Editor in production. Always use migrations to ensure reproducibility and auditability.

### 4.3 Backup and Restore

#### Supabase Dashboard (PITR)

Supabase Cloud provides **Point-in-Time Recovery** on Pro plans and above:

1. Go to **Database → Backups** in the Supabase dashboard.
2. Select a recovery point and click **Restore**.
3. Supabase creates a new project with the restored data.

#### Manual pg_dump

For additional safety, create periodic logical backups:

```bash
# Dump the database (replace with your connection string from Settings → Database)
pg_dump "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" \
  --no-owner --no-privileges \
  -f examcraft_backup_$(date +%Y%m%d).sql

# Restore from backup
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" \
  < examcraft_backup_20260423.sql
```

> Schedule pg_dump via cron or your CI/CD pipeline. Store backups in a secure, off-site location (e.g. S3 bucket).

### 4.4 Connection Pooling

Supabase Cloud uses **PgBouncer** for connection pooling. Connect via the **pooler connection string** (port `6543`) instead of the direct connection (port `5432`) for API workloads:

```
# Pooler (recommended for API)
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres

# Direct (for migrations only)
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].supabase.com:5432/postgres
```

---

## 5. Scaling

### 5.1 Frontend (Vercel)

Vercel auto-scales Next.js applications. No manual configuration needed:

- **Serverless Functions** scale to zero when idle and scale up with traffic.
- **Edge Caching** serves static assets from the CDN automatically.
- **Pro plan** includes 100 GB bandwidth/month and unlimited deployments.

### 5.2 API (Container)

The API is **stateless** — it uses JWT-based authentication (no server-side sessions), so there is no need for sticky sessions.

**Horizontal scaling (increase replicas):**

| Host | How to scale |
|---|---|
| **Railway** | Settings → Service → Replicas (or configure `RAILWAY_REPLICA_COUNT`) |
| **Cloud Run** | `gcloud run services update examcraft-api --max-instances 10 --min-instances 1` |
| **Render** | Upgrade plan for auto-scaling; configure min/max instances in dashboard |

**Vertical scaling (increase resources):**

- Increase CPU/memory allocation in your container host's dashboard.
- The API Docker image is lightweight (Alpine-based, production-only dependencies).

### 5.3 Database (Supabase)

Supabase Cloud handles scaling at the database level:

- **Free plan:** 500 MB storage, shared compute
- **Pro plan:** 8 GB storage, dedicated compute (1–16 CPUs), PITR, connection pooling
- Upgrade via **Settings → Billing → Change plan** in the Supabase dashboard.

---

## 6. Secret Rotation

### 6.1 JWT_SECRET

The `JWT_SECRET` is used by Supabase Auth (GoTrue) for signing JWTs and by the API for token verification.

1. Generate a new secret:
   ```bash
   openssl rand -base64 48
   ```
2. Update in **Supabase Dashboard**: Settings → API → JWT Secret → Rotate
3. Update in your **API environment variables** on the container host.
4. **Restart the API** to pick up the new secret.
5. **All existing sessions will be invalidated.** Users must re-authenticate.

> Coordinate JWT_SECRET rotation during low-traffic periods and notify users of a brief session reset.

### 6.2 POSTGRES_PASSWORD

1. Generate a new password:
   ```bash
   openssl rand -base64 32
   ```
2. Update in **Supabase Dashboard**: Settings → Database → Database password → Reset
3. Update the `DATABASE_URL` environment variable on the API container.
4. Restart the API.

### 6.3 SUPABASE_ANON_KEY / NEXT_PUBLIC_SUPABASE_ANON_KEY

The anon key is derived from the JWT secret. Rotating the JWT secret (Section 6.1) automatically invalidates the old anon key. After rotating:

1. Copy the new anon key from **Settings → API → Project API keys**.
2. Update in both the **Vercel** environment (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) and the **API container** (`NEXT_PUBLIC_SUPABASE_ANON_KEY`).
3. **Redeploy the frontend** — `NEXT_PUBLIC_` variables are baked in at build time.

### 6.4 API Keys (GEMINI_API_KEY, RESEND_API_KEY)

1. Rotate the key at the provider's dashboard:
   - Google AI Studio → API Keys → Create new key
   - Resend Dashboard → API Keys → Create new key
2. Update the environment variable on the API container.
3. Restart the API.
4. Revoke the old key at the provider after confirming the new one works.

### 6.5 SENTRY_DSN

Sentry DSNs are public (embedded in client-side code). If compromised:

1. Create a new project in Sentry.
2. Copy the new DSN.
3. Update `SENTRY_DSN` (API), `NEXT_PUBLIC_SENTRY_DSN` (Web), and redeploy both services.
4. Archive the old Sentry project.

---

## 7. Incident Response

### 7.1 Incident Severity Levels

| Level | Impact | Examples | Response Time |
|---|---|---|---|
| **P1 — Critical** | Service completely down | API returning 5xx to all requests, database unreachable | < 15 min |
| **P2 — High** | Major feature broken | Login failures, paper generation errors | < 1 hour |
| **P3 — Medium** | Minor feature degraded | Slow analytics, email delivery delayed | < 4 hours |
| **P4 — Low** | Cosmetic / non-blocking | UI glitch, incorrect breadcrumb | Next business day |

### 7.2 Response Runbook

Follow these steps in order when an incident is reported:

#### Step 1: Check Health Endpoints

```bash
# API liveness
curl -s https://api.yourdomain.com/api/v1/health/live

# API readiness (Supabase connectivity)
curl -s https://api.yourdomain.com/api/v1/health/ready

# Frontend
curl -s -o /dev/null -w "%{http_code}" https://app.yourdomain.com
```

If liveness fails → the API container is down. Check the container host dashboard.
If readiness fails → Supabase is unreachable. Check <https://status.supabase.com>.

#### Step 2: Check Sentry for Errors

1. Go to Sentry → Issues.
2. Filter by the affected project (`examcraft-api` or `examcraft-web`).
3. Sort by **New Issues** or **Frequency**.
4. Look for spikes in error rate around the incident time.
5. Use **Replays** for frontend errors to see the user's session.

#### Step 3: Check Logs

```bash
# Railway
railway logs --service examcraft-api

# Cloud Run
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=examcraft-api" --limit 100

# Vercel
# Check Deployments → click latest deployment → Runtime Logs
```

Look for:
- Unhandled exceptions or stack traces
- Database connection errors (`ECONNREFUSED`, `connection timeout`)
- CORS errors (`Access-Control-Allow-Origin`)
- Auth errors (`401`, `403`, `invalid token`)

#### Step 4: Check Database Connectivity

```bash
# From a machine with network access (or the Supabase SQL Editor)
psql "postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres" -c "SELECT 1;"
```

If the connection fails:
- Check Supabase status: <https://status.supabase.com>
- Check if the database is paused (Free plan pauses after 1 week of inactivity)

#### Step 5: Rollback Deployment (if needed)

If the incident was caused by a recent deployment:

**API (Docker):**
```bash
# Roll back to the previous image tag (commit SHA)
# Railway: Settings → Deployments → Redeploy previous
# Cloud Run:
gcloud run services update examcraft-api \
  --image ghcr.io/YOUR_ORG/examcraft/api:PREVIOUS_SHA
```

**Frontend (Vercel):**
1. Go to Vercel Dashboard → project → Deployments.
2. Find the last working deployment.
3. Click **⋯** → **Promote to Production**.

**Database (Migration Rollback):**
- Supabase does not auto-rollback migrations.
- Write a reverse migration SQL file and apply via `supabase db push` or the SQL Editor.

### 7.3 Post-Incident

After resolving an incident:

1. Document the root cause, timeline, and fix.
2. Add any missing alerts or health checks.
3. If a code fix was needed, create a PR and follow the standard CI/CD pipeline.

---

## 8. Common Issues

| Problem | Symptoms | Resolution |
|---|---|---|
| **CORS errors** | Browser console: `Access-Control-Allow-Origin` header missing | 1. Check `CORS_ORIGIN` env var on the API includes the frontend's exact origin. 2. Ensure no trailing slashes. 3. Redeploy the API after changing env vars. 4. Verify the API is running (not just the frontend). |
| **Auth failures (401/403)** | Users cannot log in or API returns `Unauthorized` | 1. Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` match between frontend and API. 2. Check Supabase Auth → URL Configuration → Site URL and Redirect URLs match your production domain. 3. Check if JWT_SECRET was recently rotated (invalidates sessions). |
| **Migration errors** | `supabase db push` fails with SQL errors | 1. Check the Supabase SQL Editor for conflicting objects. 2. Ensure migrations are applied in order (timestamps in filenames). 3. Use `supabase db diff` to identify drift. 4. For production, always test migrations on a staging project first. |
| **Docker build failures** | `docker build` fails at `pnpm install --frozen-lockfile` | 1. Ensure `pnpm-lock.yaml` is committed and up to date: run `pnpm install` locally and commit the lockfile. 2. Build from the repository root, not from `apps/api/`. 3. Ensure Docker has sufficient memory (≥4 GB recommended). |
| **API container crash loop** | Health check fails, container restarts repeatedly | 1. Check logs: `docker logs examcraft-api` or host-specific log viewer. 2. Verify all required env vars are set (see [DEPLOYMENT.md §7](./DEPLOYMENT.md#7-environment-variable-checklist)). 3. Check if `SUPABASE_SERVICE_ROLE_KEY` is valid (not the local dev key). 4. Ensure port 8080 is not blocked by the container host's firewall. |
| **Frontend blank page** | Page loads but shows blank or white screen | 1. Check browser console for errors. 2. Verify `NEXT_PUBLIC_` env vars are set correctly in Vercel. 3. These are build-time variables — you must redeploy after changing them. 4. Check if `NEXT_PUBLIC_API_URL` points to the correct API URL. |
| **Supabase connection refused** | API readiness check fails, DB queries error | 1. Check <https://status.supabase.com> for outages. 2. Free plan databases pause after 1 week of inactivity — visit the dashboard to resume. 3. Verify the connection string uses the pooler URL for API traffic (port 6543). 4. Check if IP restrictions are enabled in Supabase settings. |
| **Email not sending** | Password reset / invitation emails not delivered | 1. Verify `RESEND_API_KEY` is set on the API container. 2. Check Resend dashboard → Logs for delivery status. 3. Verify the sender domain is configured and verified in Resend. 4. Check Supabase Auth → SMTP settings if using Supabase's built-in email. |
| **Sentry not receiving errors** | No errors appear in Sentry dashboard | 1. Verify `SENTRY_DSN` (API) and `NEXT_PUBLIC_SENTRY_DSN` (Web) are set. 2. Trigger a test error: navigate to a non-existent API route or throw an error in the frontend. 3. Check Sentry project settings → Client Keys → DSN matches. 4. For the frontend, `NEXT_PUBLIC_SENTRY_DSN` requires a redeploy to take effect. |
