# ExamCraft Docker Guide

> Infrastructure setup and container management for local development.

---

## Architecture

ExamCraft uses Docker Compose to run a local Supabase infrastructure stack. The application servers (Next.js and NestJS) run natively on Node.js — they are **not** containerized during development.

### Container Topology

```
┌──────────────────────────────────────────────────────────────┐
│                    Docker Compose Stack                       │
│                                                              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────┐  │
│  │  PostgreSQL  │    │   GoTrue    │    │   Kong Gateway  │  │
│  │  :54322      │───▶│  (Auth)     │───▶│    :54321       │  │
│  │  15.6.1.137  │    │  :9999      │    │    2.8.4        │  │
│  └──────┬───────┘    └─────────────┘    └─────────────────┘  │
│         │                                                     │
│  ┌──────▼───────┐    ┌─────────────┐    ┌─────────────────┐  │
│  │  PostgREST   │    │   pg-meta   │    │  Supabase Studio│  │
│  │  :3001       │    │   :8080     │───▶│    :54323       │  │
│  │  v12.2.0     │    │   v0.84.2   │    │    (UI)         │  │
│  └──────────────┘    └─────────────┘    └─────────────────┘  │
│                                                              │
│  ┌──────────────┐                                            │
│  │   Vector     │    Log aggregation                         │
│  │   :9001      │                                            │
│  └──────────────┘                                            │
└──────────────────────────────────────────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
   ┌──────────┐    ┌──────────────┐   ┌──────────┐
   │ Next.js  │    │   NestJS     │   │ Browser  │
   │  :3000   │    │   :4000      │   │          │
   │ (native) │    │  (native)    │   │          │
   └──────────┘    └──────────────┘   └──────────┘
```

## Commands

| Command | Description |
|---|---|
| `pnpm db:start` | Start all containers |
| `pnpm db:stop` | Stop all containers (data persisted) |
| `pnpm db:restart` | Stop and start containers |
| `pnpm db:reset` | Destroy volumes and recreate from scratch |
| `pnpm db:status` | Show container status (`docker compose ps`) |
| `pnpm db:logs` | Stream container logs (`docker compose logs -f`) |
| `pnpm db:migrate` | Apply SQL migrations to running database |
| `pnpm db:setup` | Interactive guided setup wizard |

## Container Details

| Container | Image | Host Port | Container Port | Restart Policy |
|---|---|---|---|---|
| `examcraft-db` | `supabase/postgres:15.6.1.137` | 54322 | 5432 | `unless-stopped` |
| `examcraft-auth` | `supabase/gotrue:v2.164.0` | 9999 | 9999 | `unless-stopped` |
| `examcraft-kong` | `kong:2.8.4` | 54321 | 8000 | `unless-stopped` |
| `examcraft-rest` | `postgrest/postgrest:v12.2.0` | 3001 | 3000 | `unless-stopped` |
| `examcraft-meta` | `supabase/postgres-meta:v0.84.2` | 8080 | 8080 | `unless-stopped` |
| `examcraft-studio` | `supabase/studio:latest` | 54323 | 3000 | `unless-stopped` |
| `examcraft-vector` | `timberio/vector:0.39.0-alpine` | 9001 | 9001 | `unless-stopped` |

## Persistent Volumes

| Volume | Purpose | Lifecycle |
|---|---|---|
| `postgres_data` | PostgreSQL data directory | Persists across `db:stop`/`db:start`. Destroyed by `db:reset`. |

## Environment Variables (Docker)

Set in `.env.local` at the project root:

| Variable | Default | Purpose |
|---|---|---|
| `POSTGRES_PASSWORD` | `postgres` | Database superuser password |
| `JWT_SECRET` | (32+ char string) | JWT signing secret shared with GoTrue |
| `SUPABASE_ANON_KEY` | (auto-generated) | Public Supabase API key |
| `SUPABASE_SERVICE_ROLE_KEY` | (auto-generated) | Admin Supabase API key |

## Troubleshooting

### Auth Container Crashes on First Start

GoTrue requires a specific migration record. Fix:

```bash
docker exec -i examcraft-db psql -U postgres -c \
  "INSERT INTO auth.schema_migrations (version) VALUES ('20221208132122') ON CONFLICT DO NOTHING;"
docker restart examcraft-auth
```

### Port Conflicts

```bash
# Check what's using Supabase ports
netstat -ano | findstr "54321 54322 54323"

# Or use the built-in port killer for app ports
pnpm kill:ports
```

### Volume Corruption

```bash
# Nuclear: destroy all data and start fresh
pnpm db:reset
pnpm seed
```

### Container Won't Pull Images

```bash
# Ensure Docker Hub is accessible
docker pull supabase/postgres:15.6.1.137
```

## Production Dockerfiles

Both applications include multi-stage Dockerfiles for production deployment:

- `apps/web/Dockerfile` — Turborepo-pruned Next.js build
- `apps/api/Dockerfile` — (planned) NestJS production build

These are used for deployment, not local development.
