# ExamCraft

**Multi-tenant SaaS platform for academic assessment management.**

ExamCraft digitizes the complete exam lifecycle — from question banking and template design to paper generation, multi-stage approval, and institution-branded PDF/DOCX export.

---

## Key Features

- **Multi-Tenancy** — Complete data isolation per institution with independent branding, roles, and settings
- **5-Role RBAC** — Super Admin, Institution Admin, Academic Head, Faculty, Reviewer/Approver (24 permissions)
- **Question Bank** — Manual entry, bulk CSV import, Bloom's taxonomy, difficulty levels, course outcomes
- **Template Builder** — Section-wise blueprints with mark distribution and question type criteria
- **Paper Generation** — Automated paper assembly from templates with random question selection
- **Approval Workflows** — Draft → Submitted → Reviewed → Approved → Published pipeline
- **AI-Powered** — Gemini-based syllabus extraction (PDF upload) and question generation
- **Branded Exports** — Institution-branded PDF and DOCX output via `pdfkit` and `docx` (no headless browsers)
- **Analytics & Audit** — Dashboard metrics, usage trends, and comprehensive mutation audit trail
- **Platform Admin** — Cross-tenant institution management for platform operators

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14.x · React 18 · Tailwind CSS 3.x · TypeScript |
| **Backend** | NestJS 10.x · Node.js ≥18 · TypeScript |
| **Database** | PostgreSQL 15.6 via Supabase (with RLS) |
| **Auth** | Supabase Auth (GoTrue) via `@supabase/ssr` |
| **AI** | Google Gemini (`gemini-1.5-flash`) |
| **PDF/DOCX** | `pdfkit` · `docx` |
| **Monorepo** | pnpm 9.x · Turborepo 2.x |
| **Infrastructure** | Docker Compose (7 containers) · Sentry |

## Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Start database (requires Docker)
pnpm db:setup          # Guided wizard — configures env and starts containers

# 3. Start all services
pnpm dev               # Frontend :3000 · Backend :4000

# OR start everything at once (DB + migrations + seed + dev servers)
pnpm dev:all
```

**Login:** `admin@testuniversity.edu` / `Test@123456`

> See [HOW_TO_RUN.md](./HOW_TO_RUN.md) for detailed setup instructions.  
> See [TEST_CREDENTIALS.md](./TEST_CREDENTIALS.md) for all test accounts.

## Project Structure

```
apps/
  web/    → Next.js 14 App Router (role-based dashboards, 14 component dirs)
  api/    → NestJS 10 (20 domain modules, ~57 API endpoints)
packages/
  types/  → Shared TypeScript DTOs and models
  ui/     → Shared React component library
supabase/
  migrations/ → 27 incremental SQL migrations (schema + RLS)
  seed.sql    → Test data with 5 user accounts and academic structure
```

## Commands

| Command | Purpose |
|---|---|
| `pnpm dev` | Start frontend + backend (starts DB first) |
| `pnpm dev:all` | Start DB + migrate + seed + dev servers |
| `pnpm build` | Compile all packages |
| `pnpm lint` | Run ESLint across all packages |
| `pnpm typecheck` | TypeScript validation |
| `pnpm format` | Apply Prettier formatting |
| `pnpm seed` | Seed test data |
| `pnpm db:start` | Start Docker containers |
| `pnpm db:stop` | Stop Docker containers |
| `pnpm db:reset` | Destroy and recreate database |
| `pnpm kill:ports` | Kill processes on :3000 and :4000 |

## Services

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:4000/api |
| Supabase Studio | http://localhost:54323 |
| PostgreSQL | localhost:54322 |
| Supabase API | http://localhost:54321 |

## Documentation

| Document | Purpose |
|---|---|
| [PRD.md](./PRD.md) | Product Requirements — features, modules, user roles, data models |
| [TRD.md](./TRD.md) | Technical Requirements — architecture, security, infrastructure |
| [HOW_TO_RUN.md](./HOW_TO_RUN.md) | Detailed setup and troubleshooting guide |
| [QUICK_START.md](./QUICK_START.md) | Minimal 4-step setup |
| [TEST_CREDENTIALS.md](./TEST_CREDENTIALS.md) | All test accounts and passwords |
| [AI_CODEBASE_MAP.md](./AI_CODEBASE_MAP.md) | Architecture index for AI assistants |

## Status

**Phase 1–3: Complete** — Foundation, Assessment Engine, Governance & Intelligence  
**Phase 4: Planned** — Student Portal, Deep Analytics, Payment Integration

> See [PRD.md §14](./PRD.md#14-phase-4-roadmap-outstanding) for the full roadmap.

## License

Private — All rights reserved.
