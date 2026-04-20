# How to Run ExamCraft

> Comprehensive setup, configuration, and troubleshooting guide.

---

## Prerequisites

| Requirement | Minimum Version | Check Command |
|---|---|---|
| **Node.js** | ≥ 18.13 | `node --version` |
| **pnpm** | ≥ 9.15 | `pnpm --version` |
| **Docker Desktop** | Latest | `docker info` |

Install pnpm if needed:
```bash
npm install -g pnpm@9
```

---

## Option 1: Automated Setup (Recommended)

The fastest way to get everything running:

```bash
# 1. Install dependencies
pnpm install

# 2. Run guided setup (checks Docker, configures env, starts DB)
pnpm db:setup

# 3. Start everything (DB + migrations + seed + dev servers)
pnpm dev:all
```

Visit http://localhost:3000 and login with `admin@testuniversity.edu` / `Test@123456`.

---

## Option 2: Manual Step-by-Step Setup

### Step 1: Install Dependencies

```bash
pnpm install
```

### Step 2: Start the Database

Ensure Docker Desktop is running, then:

```bash
pnpm db:start
```

This launches 7 Docker containers (PostgreSQL, GoTrue Auth, Kong Gateway, PostgREST, pg-meta, Supabase Studio, Vector).

### Step 3: Apply Database Migrations

```bash
pnpm db:migrate
```

Applies all 27 SQL migrations: schema, RLS policies, triggers, RPCs, and indexes.

### Step 4: Verify Database Connection

```bash
pnpm test:db-connection
```

### Step 5: Seed Test Data

```bash
pnpm seed
```

Creates a test institution ("Test University") with:
- 3 departments (CS, Math, Physics)
- 2 courses, 2 batches, 3 subjects
- 5 user accounts across all roles

### Step 6: Configure Environment Files

If not already configured by `pnpm db:setup`, manually create:

**`apps/web/.env.local`:**
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

**`apps/api/.env.local`:**
```env
API_PORT=4000
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres
```

### Step 7: Start Development Servers

```bash
pnpm dev
```

This starts:
- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:4000

---

## Service Reference

| Service | URL | Purpose |
|---|---|---|
| **Frontend** | http://localhost:3000 | Next.js application |
| **Backend API** | http://localhost:4000/api | NestJS REST API |
| **Supabase Studio** | http://localhost:54323 | Database management UI |
| **Supabase API** | http://localhost:54321 | Supabase endpoint (Kong) |
| **PostgreSQL** | `localhost:54322` | Direct database access |
| **GoTrue Auth** | `localhost:9999` | Authentication service |
| **pg-meta** | `localhost:8080` | Database metadata |

---

## Test Credentials

All test accounts use password: **`Test@123456`**

| Role | Email |
|---|---|
| Institution Admin | `admin@testuniversity.edu` |
| Academic Head | `head.cs@testuniversity.edu` |
| Reviewer/Approver | `reviewer@testuniversity.edu` |
| Faculty (CS) | `faculty1@testuniversity.edu` |
| Faculty (Math) | `faculty2@testuniversity.edu` |

> See [TEST_CREDENTIALS.md](./TEST_CREDENTIALS.md) for the full account list.

---

## All Commands Reference

### Application Commands

| Command | Description |
|---|---|
| `pnpm dev` | Start DB + frontend + backend |
| `pnpm dev:all` | Start DB + migrate + seed + frontend + backend |
| `pnpm dev:web` | Start frontend only |
| `pnpm dev:api` | Start backend only |
| `pnpm dev:fresh` | Kill ports 3000/4000 and restart |
| `pnpm build` | Build all packages for production |
| `pnpm build:web` | Build frontend only |
| `pnpm build:api` | Build backend only |
| `pnpm lint` | Run ESLint across all packages |
| `pnpm typecheck` | Run TypeScript type checking |
| `pnpm format` | Apply Prettier formatting |
| `pnpm clean` | Remove all build artifacts and node_modules |
| `pnpm kill:ports` | Kill processes on ports 3000 and 4000 |
| `pnpm check:env` | Validate environment variable configuration |

### Database Commands

| Command | Description |
|---|---|
| `pnpm db:start` | Start all Docker containers |
| `pnpm db:stop` | Stop all Docker containers |
| `pnpm db:restart` | Stop and restart containers |
| `pnpm db:reset` | Destroy volumes and recreate database |
| `pnpm db:migrate` | Apply SQL migrations |
| `pnpm db:status` | Show Docker container status |
| `pnpm db:logs` | Stream Docker container logs |
| `pnpm db:setup` | Interactive guided setup wizard |
| `pnpm test:db-connection` | Verify database connectivity |

### Data Commands

| Command | Description |
|---|---|
| `pnpm seed` | Seed test institution and user data |
| `pnpm seed:reset` | Clear all data and re-seed |
| `pnpm pilot:seed` | Seed pilot institution data |

---

## Troubleshooting

### Port Already in Use

```bash
pnpm kill:ports
pnpm dev
```

### Docker Containers Won't Start

```bash
# Check Docker is running
docker info

# Force restart
pnpm db:restart

# Nuclear option: destroy and recreate
pnpm db:reset
```

### Auth Service Crashes

The GoTrue container may fail if its migration table is missing. Fix:

```bash
docker exec -i examcraft-db psql -U postgres -c \
  "INSERT INTO auth.schema_migrations (version) VALUES ('20221208132122') ON CONFLICT DO NOTHING;"
docker restart examcraft-auth
```

### Environment Variables Missing

```bash
pnpm check:env
```

Or re-run the guided setup:
```bash
pnpm db:setup
```

### Database Migration Errors

```bash
# Check current migration state
docker exec -i examcraft-db psql -U postgres -c "SELECT * FROM supabase_migrations.schema_migrations ORDER BY version;"

# Force re-apply
pnpm db:migrate
```

### Build Failures

```bash
# Clean all caches and artifacts
pnpm clean

# Reinstall and rebuild
pnpm install
pnpm build
```

---

> For architecture details see [TRD.md](./TRD.md). For product features see [PRD.md](./PRD.md).
