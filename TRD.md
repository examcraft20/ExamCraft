# ExamCraft — Technical Requirements Document (TRD)

> **Version:** 2.0  
> **Last Updated:** April 18, 2026  
> **Companion:** [PRD.md](./PRD.md) · [HOW_TO_RUN.md](./HOW_TO_RUN.md) · [QUICK_START.md](./QUICK_START.md)

---

## Table of Contents

1. [Technical Objectives](#1-technical-objectives)
2. [Technology Stack](#2-technology-stack)
3. [System Architecture](#3-system-architecture)
4. [Monorepo Organization](#4-monorepo-organization)
5. [Backend Architecture (NestJS)](#5-backend-architecture-nestjs)
6. [Frontend Architecture (Next.js)](#6-frontend-architecture-nextjs)
7. [Database Architecture](#7-database-architecture)
8. [Authentication & Authorization](#8-authentication--authorization)
9. [API Design](#9-api-design)
10. [AI Integration](#10-ai-integration)
11. [Export Engine](#11-export-engine)
12. [Infrastructure & DevOps](#12-infrastructure--devops)
13. [Security Requirements](#13-security-requirements)
14. [Testing Strategy](#14-testing-strategy)
15. [Non-Functional Requirements](#15-non-functional-requirements)
16. [Environment Configuration](#16-environment-configuration)

---

## 1. Technical Objectives

| Objective | Description |
|---|---|
| **Multi-Tenancy** | Strict data isolation per institution enforced at the database (RLS) and application (guards) layers |
| **Backend-First Logic** | All business logic, validation, paper generation, approvals, and exports are centralized in the NestJS API |
| **Free-Tier-First Stack** | Designed around Vercel (frontend), Supabase (database + auth), with a clear migration path to managed PostgreSQL and custom auth if needed |
| **Type Safety** | End-to-end TypeScript across frontend, backend, and shared packages — with shared DTOs ensuring API contract consistency |
| **Modular Domain Design** | Each backend feature is a self-contained NestJS module with its own controller, service, DTOs, and guards |
| **Zero Headless Browsers** | Document generation (PDF/DOCX) uses library-based rendering, never headless Chrome/Puppeteer |

---

## 2. Technology Stack

### Core Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Frontend Framework** | Next.js (App Router) | 14.x | Server-side rendering, routing, middleware |
| **UI Library** | React | 18.x | Component rendering |
| **Styling** | Tailwind CSS | 3.x | Utility-first CSS framework |
| **Backend Framework** | NestJS | 10.x | Domain-modular REST API with guards, interceptors, and decorators |
| **Runtime** | Node.js | ≥ 18.13 | Server runtime |
| **Language** | TypeScript | 5.7.x | Full-stack type safety |
| **Database** | PostgreSQL | 15.6 | Primary data store (via Supabase) |
| **Authentication** | Supabase Auth (GoTrue) | v2.164 | JWT-based authentication with email/password |
| **Auth SDK** | `@supabase/ssr` | 0.10.x | Server-side cookie-based session management |

### Supporting Libraries

| Library | Version | Purpose |
|---|---|---|
| `pdfkit` | Latest | Server-side PDF document generation |
| `docx` | Latest | Server-side DOCX document generation |
| `@google/generative-ai` | Latest | Google Gemini AI integration |
| `@nestjs/throttler` | Latest | API rate limiting |
| `@sentry/nextjs` | Latest | Error tracking and monitoring |
| `date-fns` | 4.x | Date manipulation utilities |

### Monorepo Tooling

| Tool | Version | Purpose |
|---|---|---|
| `pnpm` | 9.15.x | Package management with workspace support |
| `turbo` (Turborepo) | 2.4.x | Build orchestration, caching, and task execution |
| `tsx` | 4.21.x | TypeScript script execution for seeds and utilities |
| `prettier` | 3.4.x | Code formatting |
| `eslint` | Latest | Code linting with TypeScript plugin |

### Infrastructure

| Component | Technology | Purpose |
|---|---|---|
| **API Gateway** | Kong 2.8.4 | Supabase request routing |
| **PostgREST** | v12.2.0 | Supabase REST API layer |
| **Container Runtime** | Docker Compose | Local development environment |
| **Supabase Studio** | Latest | Database management UI |
| **Log Aggregation** | Vector 0.39.0 | Log collection and forwarding |

---

## 3. System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Browser                           │
│                     (Next.js SSR + CSR)                         │
└────────────────┬───────────────────────┬────────────────────────┘
                 │ Port :3000            │
                 ▼                       │
┌────────────────────────────┐           │ Auth Cookies
│    Next.js Middleware      │           │ (@supabase/ssr)
│  - Route protection        │           │
│  - Session management      │           │
│  - Auth redirects          │           │
└────────────────┬───────────┘           │
                 │                       │
                 ▼                       ▼
┌────────────────────────────────────────────────────────────────┐
│                    NestJS API Server                           │
│                      Port :4000                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Global Middleware Stack                                   │  │
│  │  1. SanitizeMiddleware (all routes)                       │  │
│  │  2. ThrottlerGuard (rate limiting)                        │  │
│  │  3. MutationAuthGuard (non-GET auth enforcement)          │  │
│  │  4. AuditLogInterceptor (mutation logging)                │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Domain Modules (20 modules)                               │  │
│  │  academic | ai | analytics | approvals | audit-logs       │  │
│  │  auth | common | config | global-templates | health       │  │
│  │  institution | invitations | mailer | onboarding          │  │
│  │  papers | platform-admin | questions | supabase           │  │
│  │  templates | users                                        │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────┬───────────────────────────────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────────────┐
│                 Supabase Infrastructure                        │
│  ┌────────────┐ ┌──────────┐ ┌────────────┐ ┌──────────────┐  │
│  │ PostgreSQL │ │ GoTrue   │ │ PostgREST  │ │ Kong Gateway │  │
│  │  :54322    │ │ (Auth)   │ │  :3001     │ │   :54321     │  │
│  │  15.6.1    │ │ :9999    │ │  v12.2.0   │ │   2.8.4      │  │
│  └────────────┘ └──────────┘ └────────────┘ └──────────────┘  │
│  ┌────────────┐ ┌──────────┐                                   │
│  │ pg-meta    │ │ Studio   │                                   │
│  │  :8080     │ │ :54323   │                                   │
│  └────────────┘ └──────────┘                                   │
└────────────────────────────────────────────────────────────────┘
```

### Request Flow

1. Browser makes a request to Next.js (`:3000`)
2. Next.js middleware validates session via Supabase cookies
3. Frontend sends API requests to NestJS (`:4000`) with JWT bearer token and institution context headers
4. NestJS guards validate the JWT, resolve institution context, and check roles/permissions
5. NestJS service executes business logic against PostgreSQL via Supabase Admin Client
6. Response flows back through interceptors (audit logging) to the frontend

---

## 4. Monorepo Organization

### Workspace Structure

```
ExamCraft/
├── apps/
│   ├── web/                          # Next.js 14 frontend application
│   │   ├── src/
│   │   │   ├── app/                  # App Router (route groups)
│   │   │   │   ├── (app)/            # Authenticated application space
│   │   │   │   │   ├── dashboard/    # Role-based dashboards (5 variants)
│   │   │   │   │   ├── library/      # Question bank & template browsing
│   │   │   │   │   └── profile/      # User profile management
│   │   │   │   ├── (auth)/           # Authentication flows
│   │   │   │   │   ├── login/
│   │   │   │   │   ├── signup/
│   │   │   │   │   ├── forgot-password/
│   │   │   │   │   ├── reset-password/
│   │   │   │   │   └── invite/
│   │   │   │   ├── onboarding/       # Institution registration
│   │   │   │   └── unauthorized/     # Access denied
│   │   │   ├── components/           # 14 component directories
│   │   │   ├── hooks/                # 3 custom hooks
│   │   │   └── lib/                  # API clients, Supabase, utilities
│   │   ├── middleware.ts             # Route protection & session refresh
│   │   ├── Dockerfile                # Multi-stage production build
│   │   └── tailwind.config.ts        # Design system configuration
│   │
│   └── api/                          # NestJS 10 backend application
│       └── src/
│           ├── main.ts               # Bootstrap, CORS, versioning config
│           ├── app.module.ts          # Root module with all imports
│           └── [20 domain modules]   # See §5
│
├── packages/
│   ├── types/                        # Shared TypeScript DTOs and models
│   └── ui/                           # Shared React component library
│
├── supabase/
│   ├── migrations/                   # 27 SQL migrations
│   ├── seed.sql                      # Test data seeding
│   ├── config.toml                   # Supabase local config
│   └── kong.yml                      # API gateway routing
│
├── scripts/                          # Seed, setup, and utility scripts
├── docker-compose.yml                # 6-service Supabase infrastructure
├── turbo.json                        # Turborepo pipeline configuration
└── package.json                      # Root workspace scripts
```

### Workspace Dependencies

```
packages/types ──── imported by ──── apps/web
                                     apps/api

packages/ui ─────── imported by ──── apps/web
```

### Build Pipeline (Turborepo)

Tasks execute in dependency order with caching:
1. `packages/types` → builds first (shared dependency)
2. `packages/ui` → builds second
3. `apps/api` and `apps/web` → build in parallel

---

## 5. Backend Architecture (NestJS)

### Module Inventory

| Module | Files | Key Responsibilities |
|---|---|---|
| `academic` | Controller, Service, DTOs | CRUD for departments, courses, batches, subjects (20 endpoints) |
| `ai` | Controller, SyllabusService, DTOs | Gemini-powered syllabus extraction and question generation |
| `analytics` | Controller, AnalyticsService, ReportsService | Dashboard metrics, usage trends, CSV/PDF report export |
| `approvals` | Controller, Service, DTOs | Multi-entity review workflow (questions, templates, papers) |
| `audit-logs` | Controller, Service, Enum | Audit trail querying and action enumeration (18 actions) |
| `auth` | Guards, Decorators | `SupabaseAuthGuard`, `@RequireRoles()`, `@RequirePermissions()` |
| `common` | Middleware, Guards, Interceptors, Decorators, Types | `SanitizeMiddleware`, `MutationAuthGuard`, `AuditLogInterceptor`, `@CurrentUser()`, `@CurrentInstitution()`, `@AuditLog()` |
| `config` | EnvModule | Environment variable validation and injection |
| `global-templates` | Controller, Service | Platform-wide template library with cloning |
| `health` | Controller | Liveness and readiness probes |
| `institution` | Controller, 4 Services, Guards, Types, DTOs | Memberships, dashboards, platform admin, branding, `InstitutionContextGuard` |
| `invitations` | Controller, Service, DTOs | Token-based email invitations with rate limiting |
| `mailer` | Service | Email sending abstraction (Resend API) |
| `onboarding` | Controller, Service, DTOs | Institution registration and admin bootstrapping |
| `papers` | Controller, PapersService, PaperExportService, DTOs | Paper generation, submission, PDF/DOCX export |
| `platform-admin` | Controller, AuditService | Super admin cross-tenant operations |
| `questions` | Controller, Service, DTOs | Question CRUD, bulk import, pagination, archival |
| `supabase` | Module, Constants | Supabase client provider (admin and user-scoped) |
| `templates` | Controller, Service, DTOs | Institution template CRUD |
| `users` | Module | User profile management |

### Guard Execution Order

```
Request → SanitizeMiddleware → ThrottlerGuard → MutationAuthGuard
       → SupabaseAuthGuard → InstitutionContextGuard
       → @RequireRoles() → @RequirePermissions()
       → Controller → Service → Response
       → AuditLogInterceptor (post-execution)
```

### Custom Decorators

| Decorator | Target | Purpose |
|---|---|---|
| `@CurrentUser()` | Parameter | Injects authenticated user from request |
| `@CurrentInstitution()` | Parameter | Injects institution context from request |
| `@RequireRoles(...roles)` | Method/Class | Enforces role membership |
| `@RequirePermissions(...perms)` | Method/Class | Enforces permission ownership |
| `@AuditLog(action, entity, idExtractor)` | Method | Tags a method for audit log recording |
| `@UseInstitutionAuthorization()` | Class | Composite decorator for auth + institution guards |

---

## 6. Frontend Architecture (Next.js)

### App Router Structure

| Route Group | Purpose | Auth Required |
|---|---|---|
| `(auth)/` | Login, signup, password flows, invitation acceptance | No |
| `(app)/` | Dashboard, library, profile — all authenticated views | Yes |
| `onboarding/` | Institution creation wizard | Yes (but no institution membership required) |
| `unauthorized/` | Access denied fallback | No |

### Middleware Logic

The Next.js middleware (`middleware.ts`) enforces a **deny-by-default** security model:

1. Creates a Supabase client with server-side cookie management
2. Resolves the current user via `supabase.auth.getUser()`
3. Defines public routes: `/`, auth pages, `/invite`, `/onboarding`
4. Redirects unauthenticated users to `/login` for all non-public routes
5. Redirects authenticated users away from auth pages to `/dashboard`

### Key Libraries

| File | Purpose |
|---|---|
| `lib/supabase-browser.ts` | Browser-side Supabase client (for client components) |
| `lib/supabase-server.ts` | Server-side Supabase client (for server components and API routes) |
| `lib/api/` | API client wrapper for NestJS backend calls |
| `lib/dashboard.ts` | Dashboard data fetching and role-based routing logic |
| `lib/academic.ts` | Academic structure API helpers |
| `lib/with-role-guard.ts` | HOC for client-side role enforcement |
| `lib/error-utils.ts` | Standardized error message extraction |

### Custom Hooks

| Hook | Purpose |
|---|---|
| `useInstitution()` | Manages active institution selection, membership list, and API header injection |
| `useAdminContext()` | Provides admin-specific dashboard context and permission checks |
| `useReviewWorkflow()` | Handles approval/review form state, submission, and status transitions |

### Error Handling

| Level | File | Purpose |
|---|---|---|
| Root | `global-error.tsx` | Catches unhandled errors at the root level |
| App | `error.tsx` | Page-level error boundary with retry |
| Dashboard | `dashboard/error.tsx` | Dashboard-specific error handling |
| Component | `error-boundary.tsx` | Reusable component-level error boundary |

---

## 7. Database Architecture

### PostgreSQL Configuration

- **Engine:** supabase/postgres 15.6.1.137
- **Extensions:** `pgcrypto` (UUID generation, password hashing), `citext` (case-insensitive text)
- **Connection:** `localhost:54322` (Docker-mapped from container port 5432)

### Migration Strategy

27 incremental SQL migrations applied in order, covering:

| Phase | Migrations | Coverage |
|---|---|---|
| Foundation | 1–2 | Institutions, roles, permissions, users, invitations, subscriptions, RLS |
| Assessment | 3–8 | Papers, academic structure, review permissions, question bank, versioning, templates |
| Performance | 9–10 | Random question RPC, audit logs |
| Hardening | 11–17 | Feature flags, indexes, RLS gaps, audit triggers, analytics RPCs, naming |
| Production | 18–27 | Refined triggers, batch RPCs, production hardening, system logs, dashboard RPCs, platform admin |

### Row Level Security (RLS)

Every tenant-scoped table has RLS policies enforcing:

```sql
-- Example policy pattern
CREATE POLICY "Users can only access their institution's data"
ON institution_questions
FOR ALL
TO authenticated
USING (institution_id IN (
  SELECT institution_id FROM institution_users
  WHERE user_id = auth.uid() AND status = 'active'
));
```

### Database RPCs (PostgreSQL Functions)

| RPC | Purpose |
|---|---|
| `get_institution_stats` | Aggregate institution metrics for dashboard |
| `get_random_questions` | Randomly select questions matching criteria for paper generation |
| `get_batch_usage` | Count batch enrollments |
| `get_dashboard_summary` | Institution dashboard aggregation |
| `get_platform_summary` | Cross-tenant platform metrics |
| `get_platform_audit_feed` | Cross-tenant audit activity |

### Key Schema Patterns

| Pattern | Implementation |
|---|---|
| **Soft Deletes** | `deleted_at TIMESTAMPTZ` on institutions |
| **Auto-Updated Timestamps** | `set_updated_at()` trigger on all major tables |
| **Case-Insensitive Keys** | `CITEXT` type for slugs, emails, and institution identifiers |
| **Flexible Metadata** | `JSONB` columns for branding, settings, and extensible metadata |
| **Constraint Enforcement** | CHECK constraints for status enums (e.g., `active`, `trial`, `suspended`) |

---

## 8. Authentication & Authorization

### Authentication Flow

```
1. User submits credentials → Supabase Auth (GoTrue)
2. GoTrue validates and returns JWT + refresh token
3. Next.js middleware stores tokens in HTTP-only cookies
4. Frontend includes JWT as Bearer token in API requests
5. NestJS SupabaseAuthGuard validates JWT on every request
6. Guard extracts user identity and attaches to request context
```

### Authorization Flow

```
1. SupabaseAuthGuard → validates JWT, extracts user ID
2. InstitutionContextGuard → resolves institution from headers,
   validates membership, loads role and permission codes
3. @RequireRoles() → checks user has at least one required role
4. @RequirePermissions() → checks user has all required permissions
5. Controller method executes if all guards pass
```

### Session Management

| Aspect | Implementation |
|---|---|
| **Token Storage** | HTTP-only cookies via `@supabase/ssr` |
| **Token Refresh** | Automatic refresh in Next.js middleware on every request |
| **Session Scope** | Server-side — no client-side token exposure |
| **Multi-Tenancy** | Institution ID passed via request headers; validated against membership |

---

## 9. API Design

### API Conventions

| Convention | Value |
|---|---|
| **Base Path** | `/api` |
| **Versioning** | URI-based: `/v1/` prefix on all routes |
| **Format** | JSON request/response bodies |
| **Auth Header** | `Authorization: Bearer <jwt>` |
| **Institution Header** | Custom header with institution ID for tenant context |
| **Pagination** | Query parameters: `?limit=50&offset=0` |
| **Error Format** | NestJS standard: `{ statusCode, message, error }` |

### Rate Limiting Tiers

| Tier | Window | Limit | Use Case |
|---|---|---|---|
| `short` | 1 second | 20 requests | Global per-IP throttle |
| `medium` | 60 seconds | 200 requests | Standard operations |
| `auth` | 60 seconds | 10 requests | Authentication endpoints |

### Endpoint Summary (57 total)

| Module | Count | HTTP Methods |
|---|---|---|
| Academic Structure | 20 | GET, POST, PUT, DELETE |
| Institution | 7 | GET, PATCH |
| Questions | 6 | GET, POST, PUT, DELETE |
| Analytics | 5 | GET |
| Papers | 4 | GET, POST |
| Approvals | 3 | POST |
| Invitations | 3 | GET, POST |
| Global Templates | 2 | GET, POST |
| Templates | 2 | GET, POST |
| Onboarding | 1 | POST |
| AI | 1 | POST (multipart) |
| Health | 1 | GET |
| Audit Logs | 2 | GET |

---

## 10. AI Integration

### Provider

| Aspect | Value |
|---|---|
| **Provider** | Google Gemini |
| **Model** | `gemini-1.5-flash` |
| **SDK** | `@google/generative-ai` |
| **Auth** | API key via `GEMINI_API_KEY` environment variable |

### Capabilities

| Feature | Input | Output |
|---|---|---|
| **Syllabus Extraction** | PDF file (max 5MB) as base64 | JSON array of topic strings |
| **Question Generation** | Syllabus text + subject + count | Array of structured question objects with Bloom's level, difficulty, tags |

### Integration Constraints

- **File Size Limit:** 5MB maximum for uploaded PDFs
- **File Type Validation:** Only `application/pdf` and `text/plain` accepted
- **Permission Gate:** Only users with `ai.use` permission can access AI endpoints
- **Graceful Degradation:** AI failures return structured error responses, never crash the service
- **Response Sanitization:** Markdown code blocks are automatically stripped from Gemini responses
- **Text Truncation:** Syllabus text is truncated to 4,000 characters for prompt construction

---

## 11. Export Engine

### Design Philosophy

Document generation runs entirely within the NestJS process using library-based rendering. No headless browsers (Puppeteer, Playwright) are used — this ensures:
- Predictable memory usage
- No browser binary dependencies
- Fast generation times
- Consistent cross-platform behavior

### PDF Generation (`pdfkit`)

| Feature | Implementation |
|---|---|
| Page size | A4 (default) with 50px margins |
| Institution header | 20pt centered institution name |
| Exam title | 16pt centered paper title |
| Metadata line | Duration and total marks in 10pt |
| Section headers | 12pt underlined with mark allocation |
| Question numbering | Hierarchical `section.question` format |
| MCQ options | Lettered a–z with 10pt indented text |
| Footer | "Generated by ExamCraft" at page bottom |
| Delivery | Streamed directly to HTTP response |

### DOCX Generation (`docx`)

| Feature | Implementation |
|---|---|
| Heading structure | H1 (institution), H2 (paper title) |
| Text styling | Bold metadata, underlined section headers |
| Question format | Paragraph-based with numbered prefixes |
| MCQ options | Indented paragraphs with letter prefixes |
| Delivery | Base64-encoded buffer sent as binary response |

---

## 12. Infrastructure & DevOps

### Docker Compose Services (6 containers)

| Service | Image | Port | Purpose |
|---|---|---|---|
| `examcraft-db` | supabase/postgres:15.6.1.137 | 54322 | PostgreSQL database |
| `examcraft-auth` | supabase/gotrue:v2.164.0 | 9999 | Authentication service |
| `examcraft-kong` | kong:2.8.4 | 54321 | API gateway |
| `examcraft-rest` | postgrest/postgrest:v12.2.0 | 3001 | Supabase REST API |
| `examcraft-meta` | supabase/postgres-meta:v0.84.2 | 8080 | Database metadata service |
| `examcraft-studio` | supabase/studio:latest | 54323 | Database management UI |
| `examcraft-vector` | timberio/vector:0.39.0-alpine | 9001 | Log aggregation |

### Container Dependencies

```
db → auth → kong
db → rest → kong
db → meta → studio
db → vector
```

### Persistent Volumes

| Volume | Purpose |
|---|---|
| `postgres_data` | PostgreSQL data directory (persists across restarts) |

### Application Dockerfiles

Both `apps/web` and `apps/api` include multi-stage Dockerfiles optimized with Turborepo pruning for minimal production images.

### Error Monitoring (Sentry)

| Configuration | File |
|---|---|
| Client-side | `sentry.client.config.ts` |
| Server-side | `sentry.server.config.ts` |
| Edge runtime | `sentry.edge.config.ts` |

---

## 13. Security Requirements

### Input Security

| Measure | Implementation |
|---|---|
| **Input Sanitization** | Global `SanitizeMiddleware` processes all request bodies |
| **File Validation** | `ParseFilePipe` with `MaxFileSizeValidator` and `FileTypeValidator` |
| **Rate Limiting** | Three-tier `@nestjs/throttler` with configurable limits per route |
| **CORS** | Configured in `main.ts` bootstrap |

### Data Security

| Measure | Implementation |
|---|---|
| **Row Level Security** | PostgreSQL RLS policies on every tenant-scoped table |
| **Tenant Scoping** | `InstitutionContextGuard` validates membership before any data access |
| **Password Hashing** | Bcrypt with salt via Supabase Auth (GoTrue) |
| **JWT Validation** | Server-side verification on every API request |
| **Secret Management** | Environment variables only — never committed to source control |

### Authorization Security

| Measure | Implementation |
|---|---|
| **Deny-by-Default** | Next.js middleware blocks all non-public routes for unauthenticated users |
| **Mutation Protection** | `MutationAuthGuard` enforces authentication on all non-GET requests |
| **Role Enforcement** | `@RequireRoles()` decorator validates role membership |
| **Permission Enforcement** | `@RequirePermissions()` decorator validates fine-grained permissions |
| **Super Admin Isolation** | Platform endpoints explicitly check `isSuperAdmin` flag |

### Audit & Compliance

| Measure | Implementation |
|---|---|
| **Application Interceptor** | `AuditLogInterceptor` captures all mutations with user context |
| **Method Decorator** | `@AuditLog()` for fine-grained per-action tracking |
| **Database Triggers** | Auto-log question and paper mutations at the database level |
| **18 Action Types** | Typed `AuditAction` enum for structured analysis |

---

## 14. Testing Strategy

### Test Configuration

| Aspect | Tool |
|---|---|
| **Unit/Integration Testing** | Vitest |
| **Configuration** | `vitest.config.ts` in `apps/web/` |
| **Setup File** | `vitest.setup.ts` |
| **Test Location** | `__tests__/` directory and `*.spec.ts` co-located files |

### Test Coverage

| Module | Test File | Coverage |
|---|---|---|
| Questions Service | `questions.service.spec.ts` | CRUD, pagination, archival |
| Papers Service | `papers.service.spec.ts` | Generation, submission, status flow |
| Approvals Service | `approvals.service.spec.ts` | Review, approve, reject for all entity types |
| Invitation Service | `invitation.service.spec.ts` | Create, preview, accept, expiration |
| Audit Logs Service | `audit-logs.service.spec.ts` | Log creation and querying |
| Institution Context | `institution-context.service.spec.ts` | Membership resolution |
| Analytics Service | `analytics.service.spec.ts` | Stats aggregation |
| Onboarding Controller | `onboarding.controller.spec.ts` | Institution creation |

---

## 15. Non-Functional Requirements

| Requirement | Target | Implementation |
|---|---|---|
| **Response Time** | < 500ms for standard CRUD | Direct Supabase queries, minimal middleware |
| **Concurrent Tenants** | Unlimited institutions | Stateless API, RLS-based isolation |
| **Horizontal Scaling** | Stateless API behind load balancer | No server-side session state |
| **Availability** | 99.9% uptime target | Health checks, Docker restart policies |
| **Data Integrity** | Zero cross-tenant data leakage | RLS + application-level guards |
| **File Size Limits** | 5MB for AI uploads | Validated at controller level |
| **Mobile Responsiveness** | Tablet-friendly admin UI | Tailwind responsive utilities |
| **Build Optimization** | < 2 min production build | Turborepo caching and pruning |
| **Error Recovery** | Graceful error boundaries | Multi-level error handling (root, page, component) |

---

## 16. Environment Configuration

### Required Environment Variables

| Variable | Scope | Purpose |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | Web | Frontend base URL (`http://localhost:3000`) |
| `NEXT_PUBLIC_API_URL` | Web | Backend API URL (`http://localhost:4000/api`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Web + API | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Web + API | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | API | Supabase admin key (server-only) |
| `DATABASE_URL` | API | Direct PostgreSQL connection string |
| `API_PORT` | API | Backend port (default: 4000) |
| `JWT_SECRET` | Infra | JWT signing secret (shared with GoTrue) |
| `POSTGRES_PASSWORD` | Infra | Database password |
| `GEMINI_API_KEY` | API | Google Gemini API key (optional for AI features) |
| `RESEND_API_KEY` | API | Resend email API key (optional for emails) |
| `SENTRY_DSN` | Web + API | Sentry error tracking DSN (optional) |

### Environment Files

| File | Purpose |
|---|---|
| `.env.local` (root) | Docker Compose and infrastructure secrets |
| `apps/web/.env.local` | Frontend-specific environment |
| `apps/api/.env.local` | Backend-specific environment |
| `.env.example` | Template with all required variable names |

---

> **Document End**  
> For product requirements, see [PRD.md](./PRD.md).  
> For setup instructions, see [HOW_TO_RUN.md](./HOW_TO_RUN.md).
