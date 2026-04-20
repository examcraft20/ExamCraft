# ExamCraft AI Codebase Map

**Purpose:** Immediate architectural index for AI assistants to prevent redundant full-codebase traversals. Always consult this file first.

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Frontend | Next.js 14 (App Router), React 18, Tailwind CSS 3, TypeScript | Latest |
| Backend | NestJS 10 (domain-modular REST API), TypeScript | Latest |
| Database | PostgreSQL 15.6 via Supabase, with Row Level Security (RLS) | 15.6.1.137 |
| Auth | Supabase Auth (GoTrue) via `@supabase/ssr` | v2.164.0 |
| AI | Google Gemini (`gemini-1.5-flash`) via `@google/generative-ai` | Latest |
| PDF | `pdfkit` (server-side, no headless browsers) | Latest |
| DOCX | `docx` (server-side, no headless browsers) | Latest |
| Monorepo | pnpm 9.x workspaces + Turborepo 2.x | Latest |

---

## Monorepo Structure

### `apps/web/` — Next.js Frontend (Port :3000)

```
src/
  app/
    (app)/                  # Authenticated routes (deny-by-default)
      dashboard/            # Role-based dashboards
        institution_admin/  # Admin dashboard
        academic_head/      # Head dashboard
        faculty/            # Faculty dashboard
        reviewer_approver/  # Reviewer dashboard
        super_admin/        # Platform admin dashboard
      library/              # Question bank & template browsing
      profile/              # User profile management
    (auth)/                 # Public auth routes
      login/
      signup/
      forgot-password/
      reset-password/
      invite/               # Invitation acceptance
    onboarding/             # Institution registration wizard
    unauthorized/           # Access denied page
  components/               # 14 component directories
    ai/                     # AI feature UI
    analytics/              # Charts and metrics
    approvals/              # Review workflow
    auth/                   # Auth forms
    institution-admin/      # Admin panels
    layout/                 # App shell, sidebar, navigation
    onboarding/             # Wizard steps
    papers/                 # Paper generation & viewing
    question-bank/          # Question CRUD
    shared/                 # Reusable primitives
    super-admin/            # Platform admin panels
    templates/              # Template builder
    ui/                     # Base design system
  hooks/
    use-institution.ts      # Institution context, membership, API headers
    use-admin-context.ts    # Admin-specific context & permissions
    use-review-workflow.ts  # Approval form state & submission
  lib/
    api/                    # API client wrapper for NestJS
    export/                 # Export-related utilities
    supabase-browser.ts     # Browser Supabase client
    supabase-server.ts      # Server Supabase client
    dashboard.ts            # Dashboard data & role-based routing
    academic.ts             # Academic structure API helpers
    with-role-guard.ts      # Client-side role enforcement HOC
    error-utils.ts          # Error message extraction
    env.ts                  # Environment validation
middleware.ts               # Route protection & session refresh
```

### `apps/api/` — NestJS Backend (Port :4000)

```
src/
  main.ts                   # Bootstrap: CORS, versioning, port config
  app.module.ts             # Root module — imports all 20 domain modules
  
  # Domain Modules (alphabetical)
  academic/                 # Departments, courses, batches, subjects (20 endpoints)
    academic.controller.ts
    academic.service.ts
    dto/
  ai/                       # Gemini-powered syllabus extraction & generation
    ai.controller.ts
    syllabus.service.ts
    dto/
  analytics/                # Dashboard metrics, trends, report exports
    analytics.controller.ts
    analytics.service.ts
    reports.service.ts
  approvals/                # Review workflow for questions, templates, papers
    approvals.controller.ts
    approvals.service.ts
    dto/
  audit-logs/               # Audit trail querying + 18 action types
    audit-action.enum.ts
    audit-logs.controller.ts
    audit-logs.service.ts
  auth/                     # Guards & decorators
    guards/supabase-auth.guard.ts
    decorators/roles.decorator.ts
    decorators/permissions.decorator.ts
  common/                   # Shared infrastructure
    middleware/sanitize.middleware.ts
    guards/mutation-auth.guard.ts
    interceptors/audit-log.interceptor.ts
    decorators/current-user.decorator.ts
    decorators/institution-context.decorator.ts
    decorators/audit-log.decorator.ts
    types/authenticated-request.ts
  config/                   # Environment configuration (EnvModule)
  global-templates/         # Platform template library + cloning
    global-templates.controller.ts
    global-templates.service.ts
  health/                   # Liveness & readiness probes
  institution/              # Tenant management, dashboards, branding
    institution.controller.ts
    services/
      institution-memberships.service.ts
      institution-dashboards.service.ts
      platform-administration.service.ts
      institution-branding.service.ts
    guards/institution-context.guard.ts
    institution.types.ts
    dto/
  invitations/              # Token-based email invitations
    invitation.controller.ts
    invitation.service.ts
    dto/
  mailer/                   # Email service (Resend)
  onboarding/               # Institution registration + admin bootstrap
    onboarding.controller.ts
    onboarding.service.ts
    dto/
  papers/                   # Paper generation, submission, exports
    papers.controller.ts
    papers.service.ts
    paper-export.service.ts (PDF via pdfkit, DOCX via docx)
    dto/
  platform-admin/           # Super admin operations
    admin.controller.ts
    audit.service.ts
  questions/                # Question CRUD, bulk import, archival
    questions.controller.ts
    questions.service.ts
    dto/
  supabase/                 # Supabase client provider module
  templates/                # Institution template management
    templates.controller.ts
    templates.service.ts
    dto/
  users/                    # User profile management
```

### `packages/`

```
types/    # Shared TypeScript DTOs and models (imported by web + api)
ui/       # Shared React component library (imported by web)
```

### `supabase/`

```
migrations/               # 27 incremental SQL migrations
  20260401..._auth_tenant_foundation.sql     # Core tables, roles, permissions
  20260402..._content_and_rls.sql            # Content + RLS
  20260403..._papers_workflow.sql            # Paper status flow
  20260403..._academic_structure.sql         # Dept/Course/Batch/Subject
  ...
  20260417..._subscription_limits.sql        # Plan enforcement
seed.sql                  # Test data (1 institution, 5 users, academic structure)
config.toml               # Supabase local configuration
kong.yml                  # API gateway routing rules
```

---

## Core Paradigms

1. **Tenant Isolation:** Every database query for institution-owned data MUST include `institution_id` scoping. Enforced via PostgreSQL RLS + NestJS `InstitutionContextGuard`.

2. **Guard Chain:** `SanitizeMiddleware` → `ThrottlerGuard` → `MutationAuthGuard` → `SupabaseAuthGuard` → `InstitutionContextGuard` → `@RequireRoles()` → `@RequirePermissions()`.

3. **No Headless Browsers:** PDF via `pdfkit`, DOCX via `docx`. Never use Puppeteer or Playwright.

4. **Server-Side Auth:** All auth uses `@supabase/ssr` with server-side cookie management. No raw client-side auth mutations.

5. **Backend-First Logic:** Business logic, validation, and data transformation lives in NestJS — frontend is a presentation layer.

---

## Important Commands

| Command | Purpose |
|---|---|
| `pnpm dev` | Start DB + frontend (:3000) + backend (:4000) |
| `pnpm dev:all` | Full startup with DB + migrations + seed + dev |
| `pnpm build` | Build all packages |
| `pnpm seed` | Seed test data |
| `pnpm db:reset` | Destroy and recreate database |
| `pnpm kill:ports` | Free ports 3000 & 4000 |

---

## RBAC Quick Reference

| Role | Scope | Key Permissions |
|---|---|---|
| `super_admin` | Platform | Full cross-tenant access |
| `institution_admin` | Institution | Manage users, branding, publish papers, view audit |
| `academic_head` | Institution | Manage academic structure, create content, review, AI |
| `faculty` | Institution | Create questions/templates, generate papers, use AI |
| `reviewer_approver` | Institution | Review and approve/reject papers |
