# ExamCraft AI Codebase Map

**Purpose:** This file acts as an immediate architectural index to prevent the need for full codebase traversals. Refer to this for routing, module structures, and high-level stack decisions.

## Tech Stack Overview
- **Frontend (Web):** Next.js 14 (App Router), React 18, Tailwind CSS, TypeScript, Supabase Auth.
- **Backend (API):** NestJS (Domain-Modular architecture), REST API.
- **Database:** Supabase (PostgreSQL), with Row Level Security (RLS) for multi-tenancy.
- **Monorepo Manager:** pnpm workspaces & Turborepo (`turbo`).

## Monorepo Directory Structure

### `apps/web/` (Next.js Frontend)
- **`/src/app`**
  - `(app)/`: Main application layout post-login (Dashboards, etc.).
  - `(auth)/`: Authentication routing (login, signup, reset password).
  - `onboarding/`: Institution boarding processes.
  - `unauthorized/`: Error handling for permissions.
- **`/src/components`**: Reusable frontend standard components.
- **`/src/hooks`**: Custom React hooks (e.g., `use-institution.ts`).
- **`/src/lib`**: Utility functions, Supabase client init, and standardized helpers.

### `apps/api/` (NestJS Backend)
Organized strictly by Domain Modules. Each directory under `src/` represents a self-contained feature:
- `academic/`: Campus, terms, and session hierarchy.
- `questions/`: Question bank schema, storage, bulk imports.
- `papers/`: Assessment generation logic.
- `global-templates/` & `templates/`: Blueprint management.
- `auth/` & `users/`: Access management, Supabase integration wrapper.
- `approvals/`: Multi-stage workflows (Draft -> Published).
- `institution/`: Tenant-scoped utilities and context enforcement.
- `analytics/`, `audit-logs/`, `mailer/`, `ai/`: Specialized services.

### `packages/`
- **`ui/`**: Shared UI presentation components (likely UI components utilized by `apps/web`).
- **`types/`**: Shared interfaces, TypeScript types, and DTOs to maintain shape synchronicity between Frontend and API.

### `supabase/`
- **`/migrations`**: Core database schema setups and Row Level Security definitions ensuring tenant isolation.

## Important Commands (from root)
- Startup Frontend/Backend: `pnpm dev`
- Seed test DB data: `pnpm seed`
- Rebuild API: `pnpm build:api`

## Core Paradigms
- **Tenant Isolation**: Every database interaction MUST respect the institution context (mostly enforced by Supabase RLS and the Backend `InstitutionManager`).
- **Export System**: Generation of PDFs occurs inside NestJS (using `pdfkit`) and Word Docs (using `docx`), not via headless browsers.
- **Authentication**: Using `@supabase/ssr` / `@supabase/supabase-js`. Client-side Supabase auth handles session tokens, but sensitive actions should pipe through API.
