# ExamCraft — Product Requirements Document (PRD)

> **Version:** 2.0  
> **Last Updated:** April 18, 2026  
> **Status:** Production-Ready (Phase 1–3 Complete)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Vision & Strategy](#2-product-vision--strategy)
3. [Target Users & Personas](#3-target-users--personas)
4. [System Architecture Overview](#4-system-architecture-overview)
5. [User Roles & Permissions (RBAC)](#5-user-roles--permissions-rbac)
6. [Feature Modules (Detailed)](#6-feature-modules-detailed)
   - 6.1 [Authentication & Session Management](#61-authentication--session-management)
   - 6.2 [Multi-Tenant Institution Management](#62-multi-tenant-institution-management)
   - 6.3 [Institution Onboarding](#63-institution-onboarding)
   - 6.4 [User & Invitation Management](#64-user--invitation-management)
   - 6.5 [Academic Structure Management](#65-academic-structure-management)
   - 6.6 [Question Bank & Content Management](#66-question-bank--content-management)
   - 6.7 [Paper Blueprint Templates](#67-paper-blueprint-templates)
   - 6.8 [Global Template Library](#68-global-template-library)
   - 6.9 [Paper Generation Engine](#69-paper-generation-engine)
   - 6.10 [Approval & Review Workflows](#610-approval--review-workflows)
   - 6.11 [Export Services (PDF & DOCX)](#611-export-services-pdf--docx)
   - 6.12 [AI-Assisted Operations](#612-ai-assisted-operations)
   - 6.13 [Analytics & Reporting](#613-analytics--reporting)
   - 6.14 [Audit Logging & Compliance](#614-audit-logging--compliance)
   - 6.15 [Platform Administration (Super Admin)](#615-platform-administration-super-admin)
   - 6.16 [Subscription & Billing Tiers](#616-subscription--billing-tiers)
7. [Data Model & Database Schema](#7-data-model--database-schema)
8. [API Surface Summary](#8-api-surface-summary)
9. [Frontend Application Structure](#9-frontend-application-structure)
10. [Security & Compliance](#10-security--compliance)
11. [Experience & Design Goals](#11-experience--design-goals)
12. [Non-Functional Requirements](#12-non-functional-requirements)
13. [Development Phases & Delivery Status](#13-development-phases--delivery-status)
14. [Phase 4 Roadmap (Outstanding)](#14-phase-4-roadmap-outstanding)

---

## 1. Executive Summary

**ExamCraft** is a production-grade, multi-tenant SaaS platform engineered to digitize and automate the complete lifecycle of academic assessments — from question banking and template design to paper generation, multi-stage approval, and branded document export.

Built on a modern monorepo architecture (NestJS backend + Next.js frontend), the platform serves educational institutions of all sizes — tuition centers, schools, colleges, and universities — enabling them to replace fragmented, manual exam-paper workflows with a unified, role-controlled, AI-enhanced digital ecosystem.

### Key Value Propositions

| Capability | Description |
|---|---|
| **Multi-Tenancy** | Complete data isolation per institution with independent branding, roles, and configurations |
| **End-to-End Assessment Lifecycle** | Question creation → Template design → Paper generation → Approval → Export |
| **AI-Powered Assistance** | Gemini-powered syllabus extraction and question generation from uploaded PDFs |
| **Branded Exports** | Institution-branded PDF and DOCX output using server-side rendering (no headless browsers) |
| **Role-Based Access Control** | Five granular roles with 24 discrete permissions across 10 modules |
| **Audit Trail** | Every mutation is tracked with automated database triggers and application-level interceptors |

---

## 2. Product Vision & Strategy

### Vision Statement

> Build the definitive SaaS platform that replaces manual, error-prone paper assembly with a unified ecosystem enforcing role-based limits, offering AI-assisted syllabus extraction, strict approval workflows, and branded academic exporting.

### Strategic Goals

1. **Commercial Scalability:** Scale rapidly across multiple educational institutions as separate tenants — each retaining isolated branding, user roles, billing subscription tiers, and feature flags.
2. **Operational Efficiency:** Reduce paper creation time from days to minutes through template reuse, AI assistance, and automated generation.
3. **Compliance & Accountability:** Maintain a complete audit trail of every question creation, approval decision, and paper export for institutional governance.
4. **Free-Tier First:** Deploy on a cost-effective stack (Vercel + Supabase) with a clear upgrade path to enterprise infrastructure.

### Business Model

- **Free Tier:** 5 seats, basic features, limited AI usage
- **Growth Tier:** Expanded seats, full AI access, advanced analytics
- **Enterprise Tier:** Unlimited seats, custom integrations, dedicated support

---

## 3. Target Users & Personas

### Primary Institutions

| Institution Type | Example | Scale |
|---|---|---|
| Tuition Centers | Coaching academies, test-prep centers | 5–20 faculty |
| Schools | K-12, CBSE/ICSE/State Board | 20–100 faculty |
| Colleges | Undergraduate programs, polytechnics | 50–300 faculty |
| Universities | Multi-department, multi-campus | 100–1000+ faculty |

### User Personas

| Persona | Role in ExamCraft | Primary Activities |
|---|---|---|
| **Institution Administrator** | `institution_admin` | Onboards institution, manages users, configures branding, oversees all operations |
| **Academic Head / HOD** | `academic_head` | Manages academic structure, creates and reviews questions/papers, runs analytics |
| **Faculty Member** | `faculty` | Creates questions (manual + bulk + AI), designs templates, generates and submits papers |
| **Reviewer / Approver** | `reviewer_approver` | Reviews submitted papers, approves or rejects with feedback |
| **Platform Operator** | `super_admin` | Manages all institutions across the platform, monitors health, handles escalations |

---

## 4. System Architecture Overview

### Technology Stack

| Layer | Technology | Version |
|---|---|---|
| **Frontend** | Next.js (App Router) | 14.x |
| **UI Framework** | React | 18.x |
| **Styling** | Tailwind CSS | 3.x |
| **Backend** | NestJS | 10.x |
| **Runtime** | Node.js | 18+ |
| **Database** | PostgreSQL (via Supabase) | 15.x |
| **Authentication** | Supabase Auth (`@supabase/ssr`) | — |
| **Object Storage** | Supabase Storage | — |
| **AI Provider** | Google Gemini (`gemini-1.5-flash`) | — |
| **PDF Generation** | `pdfkit` | — |
| **DOCX Generation** | `docx` | — |
| **Monorepo Tooling** | pnpm workspaces + Turborepo | — |
| **Error Tracking** | Sentry | — |
| **Containerization** | Docker + Docker Compose | — |

### Monorepo Structure

```
ExamCraft/
├── apps/
│   ├── web/                    # Next.js 14 frontend (:3000)
│   │   ├── src/app/(app)/      # Authenticated application routes
│   │   ├── src/app/(auth)/     # Authentication flows
│   │   ├── src/app/onboarding/ # Institution onboarding wizard
│   │   ├── src/components/     # Shared React components
│   │   ├── src/hooks/          # Custom React hooks
│   │   ├── src/lib/            # Utility libraries & API clients
│   │   └── middleware.ts       # Route protection middleware
│   │
│   └── api/                    # NestJS backend (:4000)
│       └── src/
│           ├── academic/       # Academic structure CRUD
│           ├── ai/             # AI syllabus & question generation
│           ├── analytics/      # Dashboard metrics & reports
│           ├── approvals/      # Multi-stage review workflows
│           ├── audit-logs/     # Audit trail management
│           ├── auth/           # Supabase auth guards & decorators
│           ├── common/         # Shared middleware, guards, interceptors
│           ├── config/         # Environment configuration
│           ├── global-templates/ # Platform-wide template library
│           ├── health/         # Health check endpoints
│           ├── institution/    # Tenant management & dashboards
│           ├── invitations/    # Invite-based user onboarding
│           ├── mailer/         # Email service abstraction
│           ├── onboarding/     # Institution registration
│           ├── papers/         # Paper generation & export
│           ├── platform-admin/ # Super admin operations
│           ├── questions/      # Question bank CRUD
│           ├── supabase/       # Supabase client provider
│           ├── templates/      # Institution template management
│           └── users/          # User profile management
│
├── packages/
│   ├── types/                  # Shared TypeScript DTOs & models
│   └── ui/                     # Shared React component library
│
├── supabase/
│   ├── migrations/             # 27 incremental SQL migrations
│   └── seed.sql                # Test data seeding script
│
└── docker-compose.yml          # Full-stack containerization
```

### Architecture Constraints

1. **Tenant Isolation:** Every database query for tenant-owned data MUST include `institution_id` scoping. Enforced via Supabase RLS + NestJS `InstitutionContextGuard`.
2. **Server-Side Auth:** All authentication uses `@supabase/ssr` with server-side cookie management. No raw client-side auth mutations.
3. **No Headless Browsers:** PDF/DOCX generation uses `pdfkit` and `docx` libraries exclusively — no Puppeteer, Playwright, or Chrome dependencies.
4. **Backend-First Logic:** All business logic, validation, and data transformation lives in the NestJS API. The frontend is a presentation layer.

---

## 5. User Roles & Permissions (RBAC)

### Role Definitions

ExamCraft implements a hierarchical RBAC system with 5 system roles and 24 granular permissions across 10 functional modules.

| Role | Scope | Description |
|---|---|---|
| `super_admin` | Platform | Platform operator with cross-tenant access to all institutions |
| `institution_admin` | Institution | Workspace owner — manages users, branding, settings, and has full oversight |
| `academic_head` | Institution | Academic leadership — manages academic structure, creates content, reviews, and runs analytics |
| `faculty` | Institution | Content creator — manages questions, templates, generates and submits papers |
| `reviewer_approver` | Institution | Quality gate — reviews and approves/rejects submitted papers |

### Permission Matrix

| Permission Code | Module | Super Admin | Inst. Admin | Academic Head | Faculty | Reviewer |
|---|---|---|---|---|---|---|
| `institution.manage` | Institution | ✓ | ✓ | — | — | — |
| `users.invite` | Users | ✓ | ✓ | — | — | — |
| `users.manage` | Users | ✓ | ✓ | — | — | — |
| `academic_structure.manage` | Academic | ✓ | ✓ | ✓ | — | — |
| `questions.create` | Questions | ✓ | — | ✓ | ✓ | — |
| `questions.edit` | Questions | ✓ | — | ✓ | ✓ | — |
| `questions.import` | Questions | ✓ | — | ✓ | ✓ | — |
| `questions.read` | Questions | ✓ | ✓ | ✓ | ✓ | ✓ |
| `templates.create` | Templates | ✓ | — | ✓ | ✓ | — |
| `templates.edit` | Templates | ✓ | — | ✓ | ✓ | — |
| `templates.read` | Templates | ✓ | ✓ | ✓ | ✓ | ✓ |
| `global_templates.read` | Global Templates | ✓ | ✓ | ✓ | ✓ | ✓ |
| `global_templates.clone` | Global Templates | ✓ | ✓ | ✓ | — | — |
| `papers.generate` | Papers | ✓ | — | ✓ | ✓ | — |
| `papers.read` | Papers | ✓ | ✓ | ✓ | ✓ | ✓ |
| `papers.edit_draft` | Papers | ✓ | — | ✓ | ✓ | — |
| `papers.submit` | Papers | ✓ | — | ✓ | ✓ | — |
| `papers.review` | Papers | ✓ | ✓ | ✓ | — | ✓ |
| `papers.approve` | Papers | ✓ | ✓ | ✓ | — | ✓ |
| `papers.reject` | Papers | ✓ | ✓ | ✓ | — | ✓ |
| `papers.publish` | Papers | ✓ | ✓ | — | — | — |
| `exports.generate` | Exports | ✓ | ✓ | ✓ | ✓ | ✓ |
| `analytics.read` | Analytics | ✓ | ✓ | ✓ | — | — |
| `audit.read` | Audit | ✓ | ✓ | — | — | — |
| `ai.use` | AI | ✓ | — | ✓ | ✓ | — |

---

## 6. Feature Modules (Detailed)

---

### 6.1 Authentication & Session Management

**Purpose:** Secure authentication for all platform users with session management, password recovery, and route protection.

#### Implemented Features

| Feature | Description | Status |
|---|---|---|
| **Email/Password Login** | Standard credential-based authentication through Supabase Auth | ✅ Implemented |
| **User Registration** | Self-service signup with email verification | ✅ Implemented |
| **Forgot Password** | Sends a password reset email via Supabase | ✅ Implemented |
| **Reset Password** | Token-based password reset flow | ✅ Implemented |
| **Invite-Based Signup** | New users can join via invitation tokens (see §6.4) | ✅ Implemented |
| **Server-Side Sessions** | Cookies managed server-side via `@supabase/ssr` in Next.js middleware | ✅ Implemented |
| **Route Protection** | Middleware enforces deny-by-default — all non-public routes require authentication | ✅ Implemented |
| **Auth Redirect** | Authenticated users are redirected away from login/signup pages; unauthenticated users are redirected to login | ✅ Implemented |

#### Frontend Routes

| Route | Purpose |
|---|---|
| `/login` | User login form |
| `/signup` | New user registration |
| `/forgot-password` | Password recovery initiation |
| `/reset-password` | Password reset completion |
| `/invite` | Invitation acceptance flow |

#### Technical Notes

- All auth state is resolved server-side in the Next.js middleware before any page renders.
- The Supabase client is created separately for browser (`supabase-browser.ts`) and server (`supabase-server.ts`) contexts.
- Public routes: `/`, `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/invite`, `/onboarding`.

---

### 6.2 Multi-Tenant Institution Management

**Purpose:** Complete tenant lifecycle management including creation, configuration, branding, and status control.

#### Implemented Features

| Feature | Description | Status |
|---|---|---|
| **Tenant Data Isolation** | Every record is scoped to `institution_id` via PostgreSQL RLS policies | ✅ Implemented |
| **Institution Profiles** | Each institution stores name, slug, legal name, type, contact details, and custom settings | ✅ Implemented |
| **Institution Branding** | Configurable branding (logo, colors, etc.) stored as JSONB, applied to exports and UI | ✅ Implemented |
| **Institution Status** | Lifecycle states: `active`, `trial`, `suspended`, `archived` | ✅ Implemented |
| **Institution Settings** | JSONB-based settings for institution-specific configuration | ✅ Implemented |
| **Dashboard Summary** | Aggregated metrics for Institution Admins — user counts, question totals, paper stats | ✅ Implemented |
| **Multi-Membership** | A single user can belong to multiple institutions with different roles in each | ✅ Implemented |

#### Data Model: `institutions`

| Column | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Unique institution identifier |
| `slug` | CITEXT (Unique) | URL-safe institution identifier |
| `name` | TEXT | Display name |
| `legal_name` | TEXT | Legal/registered name |
| `institution_type` | TEXT | Type: `university`, `college`, `school`, `tuition_center` |
| `status` | TEXT | `active` / `trial` / `suspended` / `archived` |
| `branding` | JSONB | Logo URL, color scheme, header/footer text |
| `settings` | JSONB | Feature flags, configuration overrides |
| `primary_contact_name` | TEXT | Primary contact person |
| `primary_contact_email` | CITEXT | Primary contact email |
| `primary_contact_phone` | TEXT | Primary contact phone |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last modification (auto-updated via trigger) |
| `deleted_at` | TIMESTAMPTZ | Soft-delete timestamp |

#### API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/v1/institution/memberships` | List all institutions the current user belongs to |
| `GET` | `/v1/institution/context` | Get the current institution context (after selection) |
| `GET` | `/v1/institution/dashboard-summary` | Aggregated dashboard stats for the institution |
| `PATCH` | `/v1/institution/branding` | Update institution branding (Admin only) |

---

### 6.3 Institution Onboarding

**Purpose:** Guided workflow for new users to register their institution and become its first administrator.

#### Implemented Features

| Feature | Description | Status |
|---|---|---|
| **Onboarding Wizard** | Multi-step form collecting institution name, type, contact details | ✅ Implemented |
| **Automatic Admin Assignment** | The onboarding user is automatically assigned `institution_admin` role | ✅ Implemented |
| **Subscription Initialization** | A default `free` plan subscription is created for the new institution | ✅ Implemented |

#### API Endpoint

| Method | Path | Description |
|---|---|---|
| `POST` | `/v1/onboarding/institution` | Register a new institution workspace |

#### Onboarding Payload

```typescript
interface CreateInstitutionOnboardingDto {
  name: string;                 // Institution display name
  institutionType: string;      // Type classification
  contactName?: string;         // Primary contact
  contactEmail?: string;        // Primary email
  contactPhone?: string;        // Primary phone
}
```

---

### 6.4 User & Invitation Management

**Purpose:** Invite-based user onboarding with role assignment, rate limiting, and invitation lifecycle management.

#### Implemented Features

| Feature | Description | Status |
|---|---|---|
| **Email Invitations** | Admins send role-assigned invitations to prospective users | ✅ Implemented |
| **Token-Based Security** | Invitations use hashed tokens with configurable expiration | ✅ Implemented |
| **Invitation Preview** | Public endpoint to preview invitation details before accepting | ✅ Implemented |
| **Invitation Acceptance** | Users create accounts and join the institution in one step | ✅ Implemented |
| **Rate Limiting** | Invitation preview limited to 10 requests/minute per IP | ✅ Implemented |
| **Invitation Status Tracking** | States: `pending`, `accepted`, `revoked`, `expired` | ✅ Implemented |
| **Audit Logging** | Every invitation creation is logged via `@AuditLog` decorator | ✅ Implemented |
| **Seat Limit Enforcement** | Invitations are validated against the institution's subscription seat limit | ✅ Implemented |

#### API Endpoints

| Method | Path | Guard | Description |
|---|---|---|---|
| `GET` | `/v1/invitations/preview?token=` | Public (rate-limited) | Preview invitation details |
| `POST` | `/v1/invitations` | `institution_admin` + `users.invite` | Create a new invitation |
| `POST` | `/v1/invitations/accept` | Public | Accept invitation and create/link account |
| `DELETE` | `/v1/invitations/:id` | `users.invite` | Revoke a pending invitation |
| `GET` | `/v1/users` | `users.manage` | List all members |
| `PUT` | `/v1/users/:id/role` | `institution_admin` | Update user role |
| `DELETE` | `/v1/users/:id` | `institution_admin` | Remove user from institution |

#### Data Model: `invitations`

| Column | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Invitation identifier |
| `institution_id` | UUID (FK) | Target institution |
| `email` | CITEXT | Invited user's email |
| `role_code` | TEXT | Assigned role on acceptance |
| `status` | TEXT | `pending` / `accepted` / `revoked` / `expired` |
| `token_hash` | TEXT (Unique) | Hashed invitation token |
| `invited_by_user_id` | UUID (FK) | The admin who sent the invitation |
| `expires_at` | TIMESTAMPTZ | Token expiration |
| `accepted_at` | TIMESTAMPTZ | When accepted |
| `metadata` | JSONB | Additional context |

---

### 6.5 Academic Structure Management

**Purpose:** Define and manage the hierarchical academic organization of an institution — departments, courses, batches, and subjects.

#### Implemented Features

| Feature | Description | Status |
|---|---|---|
| **Department Management** | Full CRUD for departments (name, code, description) | ✅ Implemented |
| **Course Management** | Full CRUD for courses linked to departments (name, code, level, duration) | ✅ Implemented |
| **Batch Management** | Full CRUD for batches linked to courses (academic year, date ranges, status) | ✅ Implemented |
| **Subject Management** | Full CRUD for subjects linked to courses (name, code, type, credits) | ✅ Implemented |
| **Hierarchical Filtering** | Filter courses by department, subjects by department/course, batches by course/year | ✅ Implemented |
| **Duplicate Detection** | Unique code constraints prevent duplicate department/course/batch/subject codes | ✅ Implemented |

#### Academic Hierarchy

```
Institution
  └── Department (e.g., "Computer Science" / CS)
        └── Course (e.g., "B.Tech Computer Science" / BT-CS)
              ├── Batch (e.g., "CS 2024-28" / CS-24, Academic Year: 2024-2028)
              └── Subject (e.g., "Data Structures" / CS201, Credits: 4)
```

#### API Endpoints (all under `/v1/academic/`)

| Method | Path | Description |
|---|---|---|
| `GET` | `departments` | List all departments |
| `GET` | `departments/:id` | Get department by ID |
| `POST` | `departments` | Create department |
| `PUT` | `departments/:id` | Update department |
| `DELETE` | `departments/:id` | Delete department |
| `GET` | `courses?department_id=` | List courses (optional filter) |
| `GET` | `courses/:id` | Get course by ID |
| `POST` | `courses` | Create course |
| `PUT` | `courses/:id` | Update course |
| `DELETE` | `courses/:id` | Delete course |
| `GET` | `batches?course_id=&academic_year=` | List batches (optional filters) |
| `GET` | `batches/:id` | Get batch with enrollment count |
| `POST` | `batches` | Create batch |
| `PUT` | `batches/:id` | Update batch |
| `DELETE` | `batches/:id` | Delete batch |
| `GET` | `subjects?department_id=&course_id=` | List subjects (optional filters) |
| `GET` | `subjects/:id` | Get subject by ID |
| `POST` | `subjects` | Create subject |
| `PUT` | `subjects/:id` | Update subject |
| `DELETE` | `subjects/:id` | Delete subject |

#### Data Models

**`institution_departments`**

| Column | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Department identifier |
| `institution_id` | UUID (FK) | Owning institution |
| `name` | TEXT | Department name |
| `code` | TEXT | Short code (unique per institution) |
| `description` | TEXT | Optional description |

**`institution_courses`**

| Column | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Course identifier |
| `institution_id` | UUID (FK) | Owning institution |
| `department_id` | UUID (FK) | Parent department |
| `name` | TEXT | Course name |
| `code` | TEXT | Course code |
| `level` | TEXT | `undergraduate`, `postgraduate`, etc. |
| `duration_semesters` | INTEGER | Total semesters |

**`institution_batches`**

| Column | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Batch identifier |
| `institution_id` | UUID (FK) | Owning institution |
| `course_id` | UUID (FK) | Parent course |
| `name` | TEXT | Batch display name |
| `code` | TEXT | Batch code |
| `academic_year` | TEXT | e.g., "2024-2028" |
| `start_date` | DATE | Batch start date |
| `end_date` | DATE | Batch end date |
| `status` | TEXT | `active`, `completed`, etc. |

**`institution_subjects`**

| Column | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Subject identifier |
| `institution_id` | UUID (FK) | Owning institution |
| `course_id` | UUID (FK) | Parent course |
| `name` | TEXT | Subject name |
| `code` | TEXT | Subject code |
| `subject_type` | TEXT | `theory`, `practical`, `elective` |
| `credits` | INTEGER | Credit hours |

---

### 6.6 Question Bank & Content Management

**Purpose:** Central repository for creating, managing, versioning, and bulk-importing exam questions with rich metadata.

#### Implemented Features

| Feature | Description | Status |
|---|---|---|
| **Manual Question Entry** | Rich form-based question creation with all metadata fields | ✅ Implemented |
| **Bulk CSV Upload** | Import multiple questions at once via structured CSV/array payloads | ✅ Implemented |
| **Question Metadata** | Bloom's taxonomy level, difficulty, marks, course outcomes (CO/PO), tags, unit mapping | ✅ Implemented |
| **MCQ Support** | Multiple-choice questions with options and correct answer designation | ✅ Implemented |
| **Question Editing** | Update any question field with version tracking | ✅ Implemented |
| **Soft Archival** | Questions are archived (soft-deleted) rather than permanently removed | ✅ Implemented |
| **Paginated Listing** | Server-side pagination with configurable limit and offset | ✅ Implemented |
| **Version History** | Track changes to questions over time | ✅ Implemented |
| **Duplicate Detection** | Collision tracking to flag potential duplicate questions | ✅ Implemented |

#### API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/v1/questions?limit=50&offset=0` | List questions (paginated) |
| `GET` | `/v1/questions/:id` | Get single question with full metadata |
| `POST` | `/v1/questions` | Create a new question |
| `POST` | `/v1/questions/bulk` | Bulk-create questions from array |
| `PUT` | `/v1/questions/:id` | Edit an existing question |
| `DELETE` | `/v1/questions/:id` | Archive a question (soft delete) |

#### Question Schema

```typescript
interface CreateQuestionDto {
  title: string;              // Question text/prompt
  questionType: string;       // "descriptive", "mcq", "short_answer", etc.
  difficulty: string;         // "Easy", "Medium", "Hard"
  marks: number;              // Maximum marks
  bloomLevel: string;         // "Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"
  subjectId: string;          // Linked subject UUID
  unitNumber?: number;        // Syllabus unit number
  courseOutcomes?: string[];   // Course Outcome codes (CO1, CO2, ...)
  tags?: string[];            // Searchable tags
  mcqOptions?: Array<{        // Only for MCQ type
    text: string;
    isCorrect: boolean;
  }>;
  metadata?: Record<string, any>;  // Additional flexible metadata
}
```

#### Data Model: `institution_questions`

| Column | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Unique question identifier |
| `institution_id` | UUID (FK) | Institution tenant |
| `title` | TEXT | Primary question content |
| `question_type` | TEXT | e.g. `mcq`, `descriptive` |
| `difficulty` | TEXT | `easy`, `medium`, `hard` |
| `marks` | NUMERIC | Max marks allocated |
| `bloom_level` | TEXT | Taxonomy classification |
| `subject_id` | UUID (FK) | Associated subject |
| `topics` | TEXT[] | Sub-topics or unit references |
| `parent_id` | UUID | Self reference for complex questions |
| `status` | TEXT | Lifecycle state |
| `metadata` | JSONB | Contains `mcqOptions`, `tags`, etc |
| `created_by_user_id` | UUID | Creator |


---

### 6.7 Paper Blueprint Templates

**Purpose:** Define reusable paper structures (blueprints) specifying section layout, mark distribution, question types, and duration.

#### Implemented Features

| Feature | Description | Status |
|---|---|---|
| **Template Creation** | Define paper blueprints with section-wise configurations | ✅ Implemented |
| **Template Listing** | View all institution-specific templates | ✅ Implemented |
| **Section Definitions** | Each template contains multiple sections with title, marks, and question criteria | ✅ Implemented |
| **Mark Distribution** | Configure total marks and per-section mark allocation | ✅ Implemented |
| **Duration Metadata** | Set exam duration in minutes | ✅ Implemented |
| **Template Review** | Templates can go through the approval workflow (see §6.10) | ✅ Implemented |

#### API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/v1/templates` | List all institution templates |
| `POST` | `/v1/templates` | Create a new template |
| `PUT` | `/v1/templates/:id` | Update an existing template |
| `DELETE` | `/v1/templates/:id` | Delete a template |

#### Template Schema

```typescript
interface CreateTemplateDto {
  name: string;                // Template title
  subjectId: string;           // Target subject
  totalMarks: number;          // Total paper marks
  durationMinutes: number;     // Exam duration
  sections: Array<{
    title: string;             // e.g., "Section A - MCQs"
    marks: number;             // Section marks
    questionCount: number;     // Number of questions
    questionType?: string;     // Preferred question type
    difficultyMix?: {          // Difficulty distribution
      easy: number;
      medium: number;
      hard: number;
    };
  }>;
}
```

#### Data Model: `institution_templates`

| Column | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Unique template identifier |
| `institution_id` | UUID (FK) | Institution tenant |
| `name` | TEXT | Blueprint title |
| `exam_type` | TEXT | Internal definition |
| `duration_minutes` | INTEGER | Time limit |
| `total_marks` | NUMERIC | Max aggregate marks |
| `sections` | JSONB | Section and routing schema |
| `department_id` | UUID (FK) | Department relation |
| `course_id` | UUID (FK) | Course relation |
| `subject_id` | UUID (FK) | Subject relation |
| `status` | TEXT | Blueprint state |
| `metadata` | JSONB | Extensible metadata |
| `created_by_user_id` | UUID | Creator |


---

### 6.8 Global Template Library

**Purpose:** Platform-wide collection of standardized paper templates (CBSE, State Boards, IB, university formats) that institutions can clone and customize.

#### Implemented Features

| Feature | Description | Status |
|---|---|---|
| **Global Template Listing** | Browse platform-wide templates available to all institutions | ✅ Implemented |
| **Template Cloning** | Clone a global template into the institution's private template collection | ✅ Implemented |
| **Role Restrictions** | Only `institution_admin` and `academic_head` can clone; all content roles can browse | ✅ Implemented |

#### API Endpoints

| Method | Path | Permission | Description |
|---|---|---|---|
| `GET` | `/v1/global-templates` | `institution_admin`, `academic_head`, `faculty` | List all global templates |
| `POST` | `/v1/global-templates/:id/clone` | `institution_admin`, `academic_head` + `templates.create` | Clone to institution |

#### Data Model: `global_templates`

| Column | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Unique platform template id |
| `name` | TEXT | Descriptive name |
| `description` | TEXT | About the template |
| `category` | TEXT | E.g. `k12`, `higher_ed` |
| `exam_board` | TEXT | E.g. `CBSE`, `ICSE` |
| `tags` | TEXT[] | Search keywords |
| `duration_minutes` | INTEGER | Exam length |
| `total_marks` | NUMERIC | Maximum marks |
| `sections` | JSONB | Preconfigured structure |
| `is_active` | BOOLEAN | Visibility flag |


---

### 6.9 Paper Generation Engine

**Purpose:** Automated paper generation from templates and question banks, with random question selection and section assembly.

#### Implemented Features

| Feature | Description | Status |
|---|---|---|
| **Template-Based Generation** | Generate a complete paper by selecting a template and populating questions | ✅ Implemented |
| **Random Question Selection** | Questions are randomly selected from the question bank matching section criteria | ✅ Implemented |
| **Paper Listing** | View all generated papers for the institution | ✅ Implemented |
| **Paper Detail View** | View full paper content with sections and questions | ✅ Implemented |
| **Paper Submission** | Submit a draft paper for review/approval | ✅ Implemented |
| **PostgreSQL RPC** | Random question selection uses database-level RPC for performance | ✅ Implemented |

#### API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/v1/papers` | List all papers |
| `GET` | `/v1/papers/:id` | Get paper with full question content |
| `POST` | `/v1/papers/generate` | Generate a new paper from template |
| `POST` | `/v1/papers/:id/submit` | Submit draft paper for review |
| `POST` | `/v1/papers/:id/publish` | Publish an approved paper |

#### Paper Generation Payload

```typescript
interface GeneratePaperDto {
  templateId: string;          // Source template
  title: string;               // Paper title
  metadata?: Record<string, any>;  // Additional paper metadata
}
```

#### Data Model: `institution_papers`

| Column | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Document identifier |
| `institution_id` | UUID (FK) | Tenant record |
| `template_id` | UUID (FK) | Derived from |
| `title` | TEXT | Paper title |
| `description` | TEXT | Instructions/notes |
| `status` | TEXT | Progression (`draft`, `approved`, etc) |
| `sections` | JSONB | Assembled section questions |
| `total_marks` | NUMERIC | Combined calculation |
| `duration_minutes` | INTEGER | From template |
| `is_locked` | BOOLEAN | Generated final state |
| `metadata` | JSONB | Assortment / additional tags |
| `created_by_user_id` | UUID | Author |


#### Paper Lifecycle States

```
Draft → Submitted → Under Review → Approved → Published
                                 → Rejected (returns to Draft)
```

---

### 6.10 Approval & Review Workflows

**Purpose:** Multi-stage approval pipeline ensuring quality control for questions, templates, and papers before publication.

#### Implemented Features

| Feature | Description | Status |
|---|---|---|
| **Question Review** | Reviewers approve or reject individual questions with feedback | ✅ Implemented |
| **Template Review** | Reviewers approve or reject template blueprints | ✅ Implemented |
| **Paper Review** | Reviewers approve or reject submitted papers | ✅ Implemented |
| **Review Comments** | Reviewers can attach notes/feedback with their decision | ✅ Implemented |
| **Status Transitions** | Automated status updates on approval/rejection | ✅ Implemented |

#### API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/v1/approvals/questions/:id/review` | Review a question |
| `POST` | `/v1/approvals/templates/:id/review` | Review a template |
| `POST` | `/v1/approvals/papers/:id/review` | Review a paper |

#### Review Payload

```typescript
interface ReviewContentDto {
  action: "approve" | "reject";     // Decision
  comments?: string;                 // Reviewer feedback
}
```

---

### 6.11 Export Services (PDF & DOCX)

**Purpose:** Generate institution-branded exam papers as downloadable PDF and DOCX documents, entirely server-side without headless browsers.

#### Implemented Features

| Feature | Description | Status |
|---|---|---|
| **PDF Export** | Full A4 PDF with institution header, exam metadata, sectioned questions, and footer | ✅ Implemented |
| **DOCX Export** | Microsoft Word document with proper headings, formatting, and institution branding | ✅ Implemented |
| **MCQ Formatting** | MCQ options rendered as lettered choices (a, b, c, d) in both formats | ✅ Implemented |
| **Section-Wise Layout** | Questions organized under section headers with mark annotations | ✅ Implemented |
| **Institution Branding** | Institution name displayed as header; "Generated by ExamCraft" footer | ✅ Implemented |
| **Exam Metadata** | Duration and total marks displayed in the paper header | ✅ Implemented |
| **Stream Response** | PDF is streamed directly to the response (no intermediate file storage) | ✅ Implemented |

#### API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/v1/papers/:id/export?format=pdf\|docx` | Export paper as PDF or DOCX |

#### Technical Implementation

- **PDF Engine:** `pdfkit` — Produces pixel-perfect A4 documents with embedded fonts, line separators, and structured layouts.
- **DOCX Engine:** `docx` — Generates `.docx` files using document sections, paragraphs, heading levels, and inline text runs. Output is base64-encoded and streamed.

---

### 6.12 AI-Assisted Operations

**Purpose:** Leverage Google Gemini to extract syllabus topics from uploaded PDFs and generate exam questions from syllabus content.

#### Implemented Features

| Feature | Description | Status |
|---|---|---|
| **Syllabus Extraction** | Upload a PDF syllabus → AI extracts core topics as a JSON array | ✅ Implemented |
| **Question Generation** | Provide syllabus text → AI generates questions with Bloom's levels, difficulty, and tags | ✅ Implemented |
| **File Validation** | Uploaded files validated for type (PDF/text) and size (max 5MB) | ✅ Implemented |
| **Graceful Fallback** | If AI fails, returns a structured error instead of crashing | ✅ Implemented |
| **Markdown Cleanup** | Automatically strips markdown code blocks from Gemini responses | ✅ Implemented |
| **Permission Gating** | Only users with `ai.use` permission can access AI features | ✅ Implemented |

#### API Endpoints

| Method | Path | Permission | Description |
|---|---|---|---|
| `POST` | `/v1/ai/extract-syllabus` | `ai.use` | Upload PDF → extract topics |

#### AI Response Format

**Syllabus Extraction:**
```json
{
  "topics": ["Data Structures", "Algorithms", "Database Management"],
  "confidence": 0.95,
  "timestamp": "2026-04-18T10:30:00Z"
}
```

**Question Generation:**
```json
{
  "generatedQuestions": [
    {
      "title": "Explain the time complexity of merge sort.",
      "subject": "Data Structures",
      "bloomLevel": "Understand",
      "difficulty": "Medium",
      "tags": ["AI Generated", "Sorting"],
      "courseOutcomes": ["CO1"],
      "unitNumber": 3,
      "status": "draft"
    }
  ],
  "metadata": {
    "wordCount": 2500,
    "model": "gemini-1.5-flash",
    "requestedCount": 5,
    "returnedCount": 5
  }
}
```

---

### 6.13 Analytics & Reporting

**Purpose:** Institutional dashboards and data insights to track question bank health, paper generation trends, and faculty activity.

#### Implemented Features

| Feature | Description | Status |
|---|---|---|
| **Summary Statistics** | Aggregated institution metrics via PostgreSQL RPC | ✅ Implemented |
| **Usage Trends** | Paper generation trends over the last 6 months, grouped by month | ✅ Implemented |
| **Report Export** | Export analytics data as CSV or PDF | ✅ Implemented |
| **Question Coverage** | Coverage analysis by subject/unit | 🚧 Planned |
| **Difficulty Distribution** | Distribution analysis across difficulty levels | 🚧 Planned |

#### API Endpoints

| Method | Path | Permission | Description |
|---|---|---|---|
| `GET` | `/v1/analytics/summary` | `analytics.read` | Institution summary stats |
| `GET` | `/v1/analytics/coverage` | `analytics.read` | Question coverage (planned) |
| `GET` | `/v1/analytics/difficulty` | `analytics.read` | Difficulty distribution (planned) |
| `GET` | `/v1/analytics/usage-trends` | `analytics.read` | 6-month paper generation trends |
| `GET` | `/v1/analytics/export?format=csv&type=` | `analytics.read` | Export reports |

#### Access Control

Analytics endpoints are restricted to `institution_admin`, `academic_head`, and `super_admin` roles.

---

### 6.14 Audit Logging & Compliance

**Purpose:** Comprehensive mutation tracking for governance, compliance, and incident investigation.

#### Implemented Features

| Feature | Description | Status |
|---|---|---|
| **Application-Level Logging** | `AuditLogInterceptor` captures all mutations with user context | ✅ Implemented |
| **Decorator-Based Logging** | `@AuditLog()` decorator for fine-grained action tracking | ✅ Implemented |
| **Database Triggers** | PostgreSQL triggers auto-log question and paper mutations | ✅ Implemented |
| **Audit Feed API** | Query audit logs for institution or platform-wide activity | ✅ Implemented |
| **Action Enumeration** | 18 typed audit actions across Auth, Users, Questions, Papers, Templates, and Settings | ✅ Implemented |

#### Tracked Audit Actions

| Category | Actions |
|---|---|
| **Authentication** | `USER_LOGIN`, `USER_LOGOUT` |
| **User Management** | `USER_INVITED`, `USER_UPDATED`, `USER_ROLE_CHANGED`, `USER_REMOVED` |
| **Questions** | `QUESTION_CREATED`, `QUESTION_UPDATED`, `QUESTION_DELETED`, `QUESTION_APPROVED`, `QUESTION_REJECTED` |
| **Papers** | `PAPER_CREATED`, `PAPER_STATUS_CHANGED`, `PAPER_APPROVED`, `PAPER_REJECTED`, `PAPER_EXPORTED` |
| **Templates** | `TEMPLATE_CREATED`, `TEMPLATE_UPDATED`, `TEMPLATE_DELETED` |
| **Settings** | `PERMISSION_CHANGED` |

#### API Endpoints

| Method | Path | Guard | Description |
|---|---|---|---|
| `GET` | `/v1/audit-logs` | `audit.read` | View paginated audit logs |
| `GET` | `/v1/audit-logs/platform` | `super_admin` | View all platform cross-tenant logs |

#### Data Model: `audit_logs`

| Column | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Event identifier |
| `institution_id` | UUID (FK) | Scoped tenant |
| `user_id` | UUID (FK) | Triggering auth identifier |
| `action` | TEXT | Canonical action type |
| `resource_type` | TEXT | Domain affected |
| `resource_id` | UUID | Item affected |
| `metadata` | JSONB | State change (diff) / payload context |
| `ip_address` | INET | Logging IP |
| `user_agent` | TEXT | Request header agent |

| Method | Path | Description |
|---|---|---|
| `GET` | `/v1/audit-logs` | List audit logs for the institution |
| `GET` | `/v1/institution/platform-audit-feed` | Platform-wide audit feed (Super Admin only) |

---

### 6.15 Platform Administration (Super Admin)

**Purpose:** Cross-tenant platform management for the ExamCraft operator, including institution oversight, status control, and system health monitoring.

#### Implemented Features

| Feature | Description | Status |
|---|---|---|
| **Platform Dashboard** | Aggregated stats across all institutions | ✅ Implemented |
| **Institution Directory** | Paginated list of all institutions with usage metrics | ✅ Implemented |
| **Institution Status Control** | Activate, suspend, or archive institutions with admin notes | ✅ Implemented |
| **Platform Audit Feed** | Cross-tenant audit activity stream | ✅ Implemented |
| **Super Admin Dashboard** | Dedicated frontend dashboard for platform operators | ✅ Implemented |

#### API Endpoints

| Method | Path | Guard | Description |
|---|---|---|---|
| `GET` | `/v1/institution/platform-summary` | `super_admin` | Platform-wide dashboard stats |
| `GET` | `/v1/institution/platform-institutions?limit=&offset=` | `super_admin` | Paginated institution directory |
| `PATCH` | `/v1/institution/platform-institutions/:id/status` | `super_admin` | Update institution status |
| `GET` | `/v1/institution/platform-audit-feed` | `super_admin` | Cross-institution audit feed |

#### Platform Institution List Item

```typescript
interface PlatformInstitutionListItem {
  id: string;
  name: string;
  slug: string;
  institutionType: string;
  status: string;
  createdAt: string;
  usage: {
    activeUsers: number;
    pendingInvitations: number;
    questions: number;
    templates: number;
  };
}
```

---

### 6.16 Subscription & Billing Tiers

**Purpose:** Enforce plan-based limits on seats, question storage, and AI generation usage per institution.

#### Implemented Features

| Feature | Description | Status |
|---|---|---|
| **Plan Tiers** | Three plans: `free`, `growth`, `enterprise` | ✅ Schema Defined |
| **Seat Limits** | Enforce maximum active members per institution | ✅ Implemented |
| **Question Limits** | Optional cap on total questions stored | ✅ Schema Defined |
| **AI Generation Limits** | Monthly cap on AI-powered question generation | ✅ Schema Defined |
| **Usage Metrics** | Per-institution daily metric tracking | ✅ Schema Defined |
| **Billing Status** | Track billing state: `active`, `trialing`, `past_due`, `canceled` | ✅ Schema Defined |

#### Data Model: `subscriptions`

| Column | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Subscription identifier |
| `institution_id` | UUID (FK, Unique) | One subscription per institution |
| `plan_code` | TEXT | `free` / `growth` / `enterprise` |
| `billing_status` | TEXT | `active` / `trialing` / `past_due` / `canceled` |
| `seats_included` | INTEGER | Max active user seats (default: 5) |
| `question_limit` | INTEGER | Max stored questions (null = unlimited) |
| `monthly_generation_limit` | INTEGER | Monthly AI generation cap |
| `current_period_start` | TIMESTAMPTZ | Billing period start |
| `current_period_end` | TIMESTAMPTZ | Billing period end |
| `metadata` | JSONB | Payment gateway metadata |

#### Data Model: `usage_metrics`

| Column | Type | Description |
|---|---|---|
| `institution_id` | UUID (FK) | Owning institution |
| `metric_date` | DATE | Date of measurement |
| `metric_code` | TEXT | Metric identifier (e.g., "ai_generations") |
| `metric_value` | NUMERIC(12,2) | Metric value |
| `dimension` | JSONB | Additional dimensional data |

---

## 7. Data Model & Database Schema

### Migration History

The database schema is managed through 27 incremental SQL migrations:

| Migration | Purpose |
|---|---|
| `auth_tenant_foundation` | Core tables: institutions, roles, permissions, users, invitations, subscriptions |
| `content_and_rls` | Content tables with Row Level Security policies |
| `papers_workflow` | Paper generation and status workflow tables |
| `academic_structure` | Department, course, batch, subject hierarchy |
| `content_review_permissions` | Review/approval permission grants |
| `question_bank_foundation` | Question bank core schema |
| `versioning_and_duplicates` | Question version history and duplicate detection |
| `template_system_v2` | Enhanced template schema with sections |
| `academic_structure_complete` | Extended academic entity relationships |
| `random_questions_rpc` | PostgreSQL RPC for random question selection |
| `audit_logs` | Audit log table and indexes |
| `feature_flags` | Institution-level feature flag support |
| `missing_indexes` | Performance indexes |
| `missing_rls` | Additional RLS policies |
| `audit_triggers` | Database-level audit triggers |
| `analytics_rpc` | PostgreSQL RPCs for analytics aggregation |
| `standardize_naming` | Table/column naming standardization |
| `update_audit_triggers` | Refined trigger behavior |
| `batch_usage_rpc` | Batch enrollment counting |
| `question_audit_triggers` | Question-specific audit triggers |
| `production_hardening` | Production security hardening |
| `system_audit_logs` | System-level audit log table |
| `dashboard_summary_rpc` | Dashboard aggregation RPCs |
| `platform_dashboard_rpc` | Platform-wide dashboard RPCs |
| `platform_audit_rpc` | Cross-tenant audit query RPCs |
| `feature_flags` (v2) | Extended feature flag capabilities |
| `subscription_limits` | Subscription limit enforcement |

### Entity Relationship Summary

```
institutions (1) ──── (N) institution_users ──── (N) institution_user_roles ──── (1) roles
     │                        │
     │                        └── (FK) auth.users
     │
     ├── (N) institution_departments
     │         └── (N) institution_courses
     │                   ├── (N) institution_batches
     │                   └── (N) institution_subjects
     │
     ├── (N) institution_questions
     ├── (N) institution_templates
     ├── (N) institution_papers
     ├── (N) invitations
     ├── (1) subscriptions
     ├── (N) usage_metrics
     └── (N) audit_logs

roles (1) ──── (N) role_permissions ──── (1) permissions
```

---

## 8. API Surface Summary

All API endpoints are versioned under `/v1/` and secured with appropriate authentication guards.

### Guard Stack

| Guard | Purpose |
|---|---|
| `SupabaseAuthGuard` | Validates JWT bearer token via Supabase Auth |
| `InstitutionContextGuard` | Resolves and validates institution context from request headers |
| `MutationAuthGuard` | Enforces authentication on all non-GET requests |
| `ThrottlerGuard` | Rate limits: 20 req/s (short), 200 req/min (medium), 10 req/min (auth) |
| `@RequireRoles()` | Decorator-based role enforcement |
| `@RequirePermissions()` | Decorator-based permission enforcement |

### Middleware

| Middleware | Purpose |
|---|---|
| `SanitizeMiddleware` | Sanitizes all incoming request bodies/params |
| `AuditLogInterceptor` | Intercepts and logs all mutations globally |

### Module Endpoint Count

| Module | Endpoints |
|---|---|
| Academic Structure | 20 |
| Questions | 6 |
| Papers | 5 |
| Templates | 4 |
| Global Templates | 2 |
| Approvals | 3 |
| Users & Invitations | 7 |
| Institution | 7 |
| Onboarding | 1 |
| Analytics | 3 |
| Export | 1 |
| Audit Logs | 2 |
| AI | 1 |
| Health | 1 |
| **Total** | **~63** |

---

## 9. Frontend Application Structure

### Route Architecture

**Authentication Space `(auth)/`:**

| Route | Purpose |
|---|---|
| `/login` | Email/password login form |
| `/signup` | New user registration |
| `/forgot-password` | Password recovery request |
| `/reset-password` | Password reset form |
| `/invite` | Invitation acceptance flow |

**Application Space `(app)/`:**

| Route | Purpose |
|---|---|
| `/dashboard` | Role-based dashboard router |
| `/dashboard/institution_admin` | Admin dashboard with institution overview |
| `/dashboard/academic_head` | Academic head dashboard |
| `/dashboard/faculty` | Faculty dashboard |
| `/dashboard/reviewer_approver` | Reviewer dashboard |
| `/dashboard/super_admin` | Platform admin dashboard |
| `/library` | Question bank and template browsing |
| `/profile` | User profile management |

**Standalone Routes:**

| Route | Purpose |
|---|---|
| `/onboarding` | Institution registration wizard |
| `/unauthorized` | Access denied page |

### Component Architecture

| Directory | Purpose |
|---|---|
| `components/ai/` | AI-powered features (syllabus extraction, question generation) |
| `components/analytics/` | Charts and metric displays |
| `components/approvals/` | Review workflow UI |
| `components/auth/` | Login, signup, and password reset forms |
| `components/institution-admin/` | Admin management panels |
| `components/layout/` | App shell, sidebar, navigation |
| `components/onboarding/` | Onboarding wizard steps |
| `components/papers/` | Paper generation and view components |
| `components/question-bank/` | Question CRUD forms and lists |
| `components/shared/` | Reusable UI primitives |
| `components/super-admin/` | Platform administration panels |
| `components/templates/` | Template builder and list views |
| `components/ui/` | Base design system components |

### Custom Hooks

| Hook | Purpose |
|---|---|
| `useInstitution` | Manages institution context, membership selection, and API header injection |
| `useAdminContext` | Provides admin-specific context and permissions |
| `useReviewWorkflow` | Manages approval/review state transitions and actions |

---

## 10. Security & Compliance

### Authentication Security

| Measure | Implementation |
|---|---|
| JWT-based Auth | Supabase Auth with signed JWTs verified on every request |
| Server-side Sessions | Cookie-based session management via `@supabase/ssr` |
| Rate Limiting | Three-tier throttling: short (20/s), medium (200/min), auth (10/min) |
| Input Sanitization | Global `SanitizeMiddleware` on all request paths |
| Password Security | Bcrypt hashing with salt via Supabase Auth |

### Data Security

| Measure | Implementation |
|---|---|
| Row Level Security | Every tenant table has RLS policies enforcing `institution_id` scoping |
| CSRF Protection | Backend-validated request origins |
| Secret Isolation | All secrets stored in environment variables, never committed |
| Soft Deletes | Critical entities use `deleted_at` timestamps instead of hard deletes |
| File Validation | AI uploads validated for type and size (5MB max) |

### Audit & Compliance

| Measure | Implementation |
|---|---|
| Global Interceptor | `AuditLogInterceptor` captures all mutations with user identity |
| Database Triggers | Automated audit records for question and paper mutations |
| Action Typing | 18 enumerated audit actions for structured log analysis |
| Platform Audit Feed | Super admins can view cross-tenant audit activity |

---

## 11. Experience & Design Goals

### Design Language

The product presents a cohesive, premium SaaS interface with:

- **Dark-Mode SaaS Aesthetic:** Primary dark theme with glassmorphism effects, subtle gradients, and modern iconography.
- **Responsive Gridded Layouts:** Skeleton loaders during data fetching, responsive grid systems adapting from desktop to tablet viewports.
- **Predictable Visual Hierarchies:** Complex academic data structures presented with clear parent-child relationships, breadcrumbs, and contextual navigation.
- **Role-Based Dashboards:** Each role sees a tailored dashboard view with relevant actions, metrics, and workflows.

### UX Priorities

1. **Zero-Confusion Navigation:** Role-appropriate dashboards ensure users only see what they need.
2. **Progressive Disclosure:** Complex features (AI generation, bulk import) are presented step-by-step.
3. **Error Resilience:** Styled error boundaries at page and component levels prevent full-app crashes. Global error page (`error.tsx`) and root error boundary (`global-error.tsx`) catch unhandled exceptions.
4. **Optimistic Updates:** UI responds immediately to user actions before server confirmation.
5. **Loading States:** Custom loading page with animations during navigation and data fetching.

---

## 12. Non-Functional Requirements

| Requirement | Target | Status |
|---|---|---|
| **Multi-tenancy** | Complete data isolation for unlimited institutions | ✅ Met |
| **Horizontal Scalability** | Stateless API servers behind load balancers | ✅ Architecture supports |
| **Mobile-Friendly** | Responsive layouts for admin tasks on tablets | ✅ Implemented |
| **Performance** | API response time < 500ms for standard operations | ✅ Met |
| **Docker Support** | Full-stack containerization via Docker Compose | ✅ Implemented |
| **CI/CD Ready** | Multi-stage Turbo-pruned Dockerfiles for optimized builds | ✅ Implemented |
| **Error Monitoring** | Sentry integration for client, server, and edge error tracking | ✅ Configured |
| **Health Checks** | Dedicated health endpoint for uptime monitoring | ✅ Implemented |
| **Environment Parity** | Consistent behavior across local development and production Supabase | ✅ Achieved |

---

## 13. Development Phases & Delivery Status

### Phase 1: Foundation ✅ Complete

- Multi-tenant database schema with RLS
- Authentication flows (login, signup, password recovery)
- Institution onboarding and membership management
- Role and permission system (5 roles, 24 permissions)
- Invite-based user management

### Phase 2: Core Assessment Engine ✅ Complete

- Academic structure management (Departments → Courses → Batches → Subjects)
- Question bank with manual entry, bulk import, and metadata
- Template builder with section-wise configuration
- Paper generation engine with random question selection
- PDF and DOCX export services with institution branding

### Phase 3: Governance & Intelligence ✅ Complete

- Multi-stage approval workflows (Questions, Templates, Papers)
- Comprehensive audit logging (interceptors + database triggers)
- AI-powered syllabus extraction and question generation (Gemini)
- Basic analytics with summary stats and usage trends
- Platform administration (Super Admin dashboard, institution controls)
- Global template library with cloning
- Subscription schema and seat limit enforcement
- Feature flag infrastructure
- Docker containerization and Sentry error monitoring

---

## 14. Phase 4 Roadmap (Outstanding)

The following modules remain as future deliverables to reach total PRD fulfillment:

### 14.1 Student Portal
- **Objective:** Isolated student-facing interfaces for exam schedules, paper delivery, and result viewing.
- **Scope:** Student role, exam assignment, timed exam delivery, answer submission.
- **Priority:** High
- **Estimated Effort:** 4–6 weeks

### 14.2 Advanced Academic Structure
- **Objective:** Extend basic entity management into scalable academic trees linking campuses, semesters, and elective tracks.
- **Scope:** Campus entity, semester management, elective/optional subject grouping, cross-department course sharing.
- **Priority:** Medium
- **Estimated Effort:** 2–3 weeks

### 14.3 Global Template Seeding
- **Objective:** Populate the Global Template Library with actual standardized exam patterns.
- **Scope:** CBSE Class 10/12 templates, IB Diploma patterns, generic university mid-semester and end-semester formats, State Board templates.
- **Priority:** Medium
- **Estimated Effort:** 1–2 weeks

### 14.4 Deep Analytics
- **Objective:** Transition basic summation endpoints into robust dynamic reporting grids.
- **Scope:**
  - Question coverage analysis by subject, unit, and Bloom's level
  - Difficulty distribution charts with gap identification
  - Faculty activity tracking (questions created, papers generated per faculty)
  - Approval pipeline metrics (average review time, rejection rates)
  - Time-series dashboards with configurable date ranges
- **Priority:** Medium
- **Estimated Effort:** 3–4 weeks

### 14.5 Enhanced AI Capabilities
- **Objective:** Expand AI beyond syllabus extraction to include question improvement suggestions, answer key generation, and plagiarism detection.
- **Scope:** Question quality scoring, answer model generation, similar question detection via embeddings.
- **Priority:** Low
- **Estimated Effort:** 4–6 weeks

### 14.6 Payment Gateway Integration
- **Objective:** Connect subscription tiers to actual payment processing.
- **Scope:** Stripe/Razorpay integration, plan upgrade/downgrade flows, invoice generation, webhook handling.
- **Priority:** High (for commercial launch)
- **Estimated Effort:** 2–3 weeks

---

> **Document End**  
> For technical implementation details, see the [Technical Requirements Document (TRD.md)](./TRD.md).  
> For quick setup instructions, see [QUICK_START.md](./QUICK_START.md).
