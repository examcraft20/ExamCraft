# ExamCraft Quick Start

Get up and running in 4 steps.

## Prerequisites

- **Node.js** ≥ 18.13
- **pnpm** ≥ 9.15 (`npm install -g pnpm@9`)
- **Docker Desktop** (running)

## Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Configure environment & start database (guided wizard)
pnpm db:setup

# 3. Start everything (DB + migrations + seed + dev servers)
pnpm dev:all

# 4. Visit http://localhost:3000
#    Login: admin@testuniversity.edu / Test@123456
```

## Services

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:4000/api |
| Supabase Studio | http://localhost:54323 |

## Essential Commands

| Command | Purpose |
|---|---|
| `pnpm dev` | Start frontend + backend (auto-starts DB) |
| `pnpm dev:all` | Full startup with DB, migrations, seed, and dev servers |
| `pnpm build` | Compile all packages for production |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | Run TypeScript validation |
| `pnpm format` | Apply Prettier formatting |
| `pnpm seed` | Re-seed test data |
| `pnpm db:reset` | Destroy and recreate database |
| `pnpm kill:ports` | Clear ports 3000 and 4000 |

## Architecture

- **Web:** Next.js 14 (App Router) with role-based dashboards
- **API:** NestJS 10 with 20 domain modules and ~57 endpoints
- **Database:** PostgreSQL 15.6 via Supabase (RLS-enforced multi-tenancy)
- **AI:** Google Gemini for syllabus extraction and question generation
- **Exports:** PDF (`pdfkit`) and DOCX (`docx`) — no headless browsers

> **Note:** ExamCraft requires Docker for the database and auth services. No mock mode is supported to ensure environment parity between development and production.

> For detailed setup see [HOW_TO_RUN.md](./HOW_TO_RUN.md). For full docs see [README.md](./README.md).
