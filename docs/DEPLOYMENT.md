# Production Deployment Guide

This guide covers deploying ExamCraft to production using **Vercel** (frontend), **Supabase Cloud** (database/auth), and a **Docker-based container host** (API).

---

## 1. Prerequisites

Create accounts on the following platforms before you begin:

| Service | Purpose | URL |
|---|---|---|
| **Supabase Cloud** | PostgreSQL database, Auth, RLS | <https://supabase.com> |
| **Vercel** | Next.js frontend hosting | <https://vercel.com> |
| **Container Host** | NestJS API hosting (pick one) | Railway, Cloud Run, or Render |
| **GitHub** | Source code, CI/CD, GHCR | <https://github.com> |
| **Sentry** | Error tracking & performance | <https://sentry.io> |
| **Resend** | Transactional email | <https://resend.com> |
| **Google AI** | Gemini API for AI features | <https://aistudio.google.com> |

Additional requirements:

- **Node.js** 20.x (for local verification)
- **Docker** (for building the API image)
- **Supabase CLI** (`npm install -g supabase`) for migrations
- **pnpm** 9.x (monorepo package manager)

---

## 2. Supabase Cloud Setup

### 2.1 Create a Project

1. Go to <https://supabase.com/dashboard> and click **New Project**.
2. Choose an organization, enter a project name (e.g. `examcraft-prod`), and set a strong database password.
3. Select the closest region for your users.
4. Wait for the project to finish provisioning (~2 minutes).

### 2.2 Get API Keys

Navigate to **Settings → API** and record the following:

| Key | Where to find it |
|---|---|
| `Project URL` | Settings → API → Project URL |
| `anon public` key | Settings → API → Project API keys |
| `service_role` key | Settings → API → Project API keys (reveal) |
| `Connection string` | Settings → Database → Connection string (URI format) |

> **Important:** The `service_role` key bypasses RLS. Never expose it in the frontend. Store it only in the API's environment variables.

### 2.3 Apply Migrations

The project has 27 migrations in `supabase/migrations/`. Apply them to your Supabase Cloud project using the CLI:

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Log in to Supabase
supabase login

# Link your local project to the cloud project
supabase link --project-ref <your-project-ref>

# Push all migrations to the cloud database
supabase db push
```

Replace `<your-project-ref>` with your project's reference ID (found in Settings → General → Reference ID).

### 2.4 Verify RLS Policies

After applying migrations, verify that Row Level Security is enabled on all tenant-scoped tables:

```sql
-- Run in the Supabase SQL Editor (Dashboard → SQL Editor)
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND rowsecurity = false;
```

This should return zero rows. If any tables appear, add RLS policies before going live — the migrations in `20260403000300_content_review_permissions.sql` and `20260410000400_missing_rls.sql` cover known gaps, but verify after any custom schema changes.

### 2.5 Configure Auth Settings

In **Authentication → URL Configuration**:

| Setting | Production Value |
|---|---|
| **Site URL** | `https://your-domain.com` |
| **Redirect URLs** | `https://your-domain.com/**` |

In **Authentication → Providers**: ensure **Email** is enabled. Configure additional providers (Google, etc.) as needed.

---

## 3. Frontend Deployment (Vercel)

### 3.1 Connect the Repository

1. Go to <https://vercel.com/new> and import your GitHub repository.
2. Configure the project:
   - **Root Directory:** `apps/web`
   - **Framework Preset:** Next.js
   - Vercel auto-detects the `vercel.json` configuration at `apps/web/vercel.json`, which sets:
     - `buildCommand`: `cd ../.. && pnpm turbo build --filter=web`
     - `installCommand`: `cd ../.. && pnpm install --frozen-lockfile`
     - `outputDirectory`: `.next-build`

### 3.2 Configure Environment Variables

In **Settings → Environment Variables**, add the following for the **Production** environment:

| Variable | Example Value | Required |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | `https://your-domain.com` | Yes |
| `NEXT_PUBLIC_API_URL` | `https://api.your-domain.com/api` | Yes |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<project-ref>.supabase.co` | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIs...` | Yes |
| `NEXT_PUBLIC_SENTRY_DSN` | `https://xxx@o123456.ingest.sentry.io/789` | No |
| `SENTRY_AUTH_TOKEN` | (from Sentry → Settings → Auth Tokens) | No |
| `SENTRY_ORG` | `your-org-slug` | No |
| `SENTRY_PROJECT` | `examcraft-web` | No |

> `NEXT_PUBLIC_` prefixed variables are embedded at build time. Redeploy after changing them.

### 3.3 Custom Domain Setup

1. In **Settings → Domains**, add your custom domain (e.g. `app.yourdomain.com`).
2. Add the CNAME record to your DNS provider pointing to `cname.vercel-dns.com`.
3. Vercel provisions an SSL certificate automatically within minutes.

### 3.4 Deploy

Push to the `main` branch to trigger a production deployment. The `deploy-web.yml` workflow handles this automatically (see [Section 5](#5-cicd-pipeline)).

---

## 4. API Deployment (Docker)

### 4.1 Build the Docker Image

The API Dockerfile (`apps/api/Dockerfile`) is a multi-stage build that:

1. Prunes the monorepo to API-only files using Turborepo
2. Installs dependencies with `pnpm install --frozen-lockfile`
3. Builds the NestJS application
4. Creates a minimal production image (Alpine-based, runs as non-root user `nestjs`)

Build from the **repository root**:

```bash
docker build -f apps/api/Dockerfile -t examcraft-api .
```

The image exposes port **8080** and includes a built-in health check against `/api/v1/health/live` (30-second interval, 3-second timeout).

### 4.2 Push to GitHub Container Registry (GHCR)

```bash
# Log in to GHCR
docker login ghcr.io -u YOUR_GITHUB_USERNAME

# Tag and push
docker tag examcraft-api ghcr.io/YOUR_GITHUB_ORG/examcraft/api:latest
docker tag examcraft-api ghcr.io/YOUR_GITHUB_ORG/examcraft/api:1.0.0
docker push ghcr.io/YOUR_GITHUB_ORG/examcraft/api:latest
docker push ghcr.io/YOUR_GITHUB_ORG/examcraft/api:1.0.0
```

> The CI pipeline (`deploy-api.yml`) handles this automatically on pushes to `main`. See [Section 5](#5-cicd-pipeline).

### 4.3 Deploy to Your Container Host

#### Railway

1. Create a new project and select **Deploy from Docker image**.
2. Enter the image: `ghcr.io/YOUR_GITHUB_ORG/examcraft/api:latest`
3. Configure environment variables (see [Section 7](#7-environment-variable-checklist)).
4. Set the health check path to `/api/v1/health/live` on port `8080`.
5. Railway assigns a domain like `examcraft-api.up.railway.app`.

#### Google Cloud Run

```bash
gcloud run deploy examcraft-api \
  --image ghcr.io/YOUR_GITHUB_ORG/examcraft/api:latest \
  --region us-central1 \
  --port 8080 \
  --allow-unauthenticated \
  --set-env-vars "NEXT_PUBLIC_SUPABASE_URL=https://...,NEXT_PUBLIC_SUPABASE_ANON_KEY=..."
```

For production, use **Workload Identity Federation** for authentication (no service account keys). The `deploy-api.yml` workflow supports this natively.

#### Render

1. Create a new **Web Service** and connect your GitHub repo.
2. Set **Docker** as the environment with `apps/api/Dockerfile` as the Dockerfile path.
3. Set the health check path to `/api/v1/health/live`.
4. Configure environment variables.

### 4.4 Configure Health Checks

All three health endpoints are defined in `apps/api/src/health/health.controller.ts`:

| Endpoint | Purpose | What it checks |
|---|---|---|
| `GET /api/v1/health` | Full health check | API self-ping (`/health/live`) |
| `GET /api/v1/health/ready` | Readiness probe | Supabase Auth health (`/auth/v1/health`) |
| `GET /api/v1/health/live` | Liveness probe | Returns `{ status: "ok", timestamp }` immediately |

Configure your container host to use:

- **Liveness probe:** `GET /api/v1/health/live` — restart the container if this fails
- **Readiness probe:** `GET /api/v1/health/ready` — stop sending traffic if this fails

---

## 5. CI/CD Pipeline

The project uses three GitHub Actions workflows:

### 5.1 CI (`/.github/workflows/ci.yml`)

**Trigger:** Push to `main`, pull requests.

**Steps:**
1. Check out code
2. Setup pnpm 9 + Node.js 20
3. `pnpm install --frozen-lockfile`
4. `pnpm turbo run lint typecheck` — linting & type checking
5. `pnpm turbo run build` — compile all packages
6. Verify build artifacts exist (`apps/api/dist`, `apps/web/.next`)
7. `pnpm turbo run test` — run all tests
8. Collect and upload API test coverage

### 5.2 Deploy Web (`/.github/workflows/deploy-web.yml`)

**Trigger:** Push to `main`, pull requests to `main`.

**Steps:**
1. Install Vercel CLI
2. Pull Vercel environment (production for `main`, preview for PRs)
3. Build with Vercel
4. Deploy — posts the preview URL as a PR comment for pull requests

### 5.3 Deploy API (`/.github/workflows/deploy-api.yml`)

**Trigger:** Push to `main` when `apps/api/**`, `packages/**`, or `pnpm-lock.yaml` change.

**Steps:**
1. Build Docker image and push to GHCR with two tags: `latest` and the commit SHA
2. Deploy to Railway (if `DEPLOY_TARGET=railway`) or Cloud Run (if `DEPLOY_TARGET=cloudrun`)

### 5.4 Required GitHub Secrets

Configure these in **Settings → Secrets and variables → Actions**:

| Secret / Variable | Type | Purpose |
|---|---|---|
| `VERCEL_TOKEN` | Secret | Vercel deployment authentication |
| `VERCEL_ORG_ID` | Secret | Vercel organization ID |
| `VERCEL_PROJECT_ID` | Secret | Vercel project ID (web app) |
| `RAILWAY_TOKEN` | Secret | Railway deployment token (if using Railway) |
| `DEPLOY_TARGET` | Variable | Set to `railway` or `cloudrun` |
| `GCP_REGION` | Variable | GCP region for Cloud Run (default: `us-central1`) |

For Cloud Run, you also need to configure **Workload Identity Federation** per [google-github-actions/auth](https://github.com/google-github-actions/auth).

> `GITHUB_TOKEN` is automatically provided by GitHub Actions — no configuration needed.

---

## 6. DNS & SSL

### 6.1 Frontend (Vercel)

1. In Vercel **Settings → Domains**, add your domain (e.g. `app.yourdomain.com`).
2. At your DNS provider, create a **CNAME** record:
   ```
   app.yourdomain.com  →  cname.vercel-dns.com
   ```
3. SSL is provisioned automatically by Vercel (Let's Encrypt). No manual configuration needed.

### 6.2 API (Container Host)

| Host | Recommended DNS | SSL |
|---|---|---|
| **Railway** | Use the provided `*.up.railway.app` domain or add a custom domain with a CNAME | Automatic |
| **Cloud Run** | Use the provided `*.run.app` domain or map a custom domain via Cloud Run domain mapping | Automatic (Google-managed) |
| **Render** | Use the provided `*.onrender.com` domain or add a custom domain with a CNAME | Automatic |

### 6.3 CORS Configuration

Update the `CORS_ORIGIN` environment variable on the API to include your production frontend URL:

```
CORS_ORIGIN=https://app.yourdomain.com
```

Multiple origins can be comma-separated:

```
CORS_ORIGIN=https://app.yourdomain.com,https://staging.yourdomain.com
```

The API's CORS configuration (in `apps/api/src/main.ts`) splits on commas and trims whitespace.

---

## 7. Environment Variable Checklist

### API Service

| Variable | Required | Default | Description |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | **Yes** | — | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Yes** | — | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | **Yes** | — | Supabase service role key (bypasses RLS) |
| `JWT_SECRET` | **Yes** | — | Minimum 32 characters. Used for token signing |
| `API_PORT` | No | `4000` | API listen port (Dockerfile overrides to `8080`) |
| `DATABASE_URL` | No | — | PostgreSQL connection string |
| `CORS_ORIGIN` | No | `http://localhost:3000` | Comma-separated allowed origins |
| `GEMINI_API_KEY` | No | — | Google Gemini API key for AI features |
| `RESEND_API_KEY` | No | — | Resend API key for transactional email |
| `SENTRY_DSN` | No | — | Sentry DSN for error tracking (API side) |

### Web Service (Vercel)

| Variable | Required | Default | Description |
|---|---|---|---|
| `NEXT_PUBLIC_APP_URL` | **Yes** | — | Public URL of the frontend |
| `NEXT_PUBLIC_API_URL` | **Yes** | — | Public URL of the API (e.g. `https://api.yourdomain.com/api`) |
| `NEXT_PUBLIC_SUPABASE_URL` | **Yes** | — | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Yes** | — | Supabase anonymous key |
| `NEXT_PUBLIC_SENTRY_DSN` | No | — | Sentry DSN for client-side error tracking |
| `SENTRY_AUTH_TOKEN` | No | — | Sentry auth token (for source map uploads during build) |
| `SENTRY_ORG` | No | — | Sentry organization slug |
| `SENTRY_PROJECT` | No | — | Sentry project slug |

### Supabase Cloud (Dashboard Configuration)

| Setting | Where | Required |
|---|---|---|
| Site URL | Authentication → URL Configuration | **Yes** |
| Redirect URLs | Authentication → URL Configuration | **Yes** |
| SMTP settings | Authentication → SMTP | Recommended |

---

## Deployment Order

Follow this sequence to avoid dependency errors:

1. **Supabase Cloud** — create project, apply migrations, configure auth
2. **API** — deploy the Docker container with all required env vars
3. **Frontend** — deploy to Vercel with env vars pointing to Supabase and the API
4. **DNS** — configure custom domains for both frontend and API
5. **Sentry** — create projects, add DSNs to env vars, redeploy
6. **CI/CD** — configure GitHub secrets and verify workflows trigger on push

---

## Post-Deployment Verification

After deploying, run through these checks:

```bash
# 1. API health check
curl https://api.yourdomain.com/api/v1/health/live
# Expected: { "status": "ok", "timestamp": "..." }

# 2. API readiness check (verifies Supabase connectivity)
curl https://api.yourdomain.com/api/v1/health/ready
# Expected: { "status": "ok", ... }

# 3. Frontend loads
curl -s -o /dev/null -w "%{http_code}" https://app.yourdomain.com
# Expected: 200

# 4. Swagger docs accessible
curl -s -o /dev/null -w "%{http_code}" https://api.yourdomain.com/api/docs
# Expected: 200
```

Verify login flow by navigating to your frontend URL and signing in with a test account.
