# ExamCraft Development Plan

## 1. Purpose

This document expands the existing product and execution documents into a delivery-ready development plan for building the new `ExamCraft` multi-tenant SaaS platform from scratch.

It includes:

- a sprint-by-sprint roadmap
- a PostgreSQL schema draft
- a monorepo folder structure
- the first 20 implementation tasks for the MVP

This plan assumes:

- a clean restart
- a free-tier-first launch strategy
- a Next.js + NestJS + Supabase/PostgreSQL stack
- a commercially meaningful MVP as the first milestone

## 2. Delivery Assumptions

### Sprint Cadence

- 2-week sprints
- 5 working days per week
- 10 working days per sprint

### Team Model

Suggested minimum team:

- 1 Product Lead / Founder
- 1 Technical Lead / Architect
- 1 Frontend Engineer
- 1 Backend Engineer
- 1 Full-Stack Engineer
- 1 QA Engineer
- 1 UI/UX Designer shared across early sprints

### Team Assignment Labels

- `PL`: Product Lead
- `TL`: Technical Lead
- `FE`: Frontend Engineer
- `BE`: Backend Engineer
- `FS`: Full-Stack Engineer
- `QA`: QA Engineer
- `UX`: UI/UX Designer

## 3. Sprint-by-Sprint Roadmap

## Phase 0: Project Initiation

### Sprint 0

- Duration: 1 week
- Team: `PL`, `TL`, `UX`
- Objectives:
- confirm MVP scope
- confirm stack and free-tier constraints
- finalize product principles and success metrics
- review PRD/TRD/Architecture/Execution Plan
- Deliverables:
- approved MVP scope
- role matrix draft
- risk register
- high-level backlog
- architecture sign-off

## Phase 1: Repository and Infrastructure Foundations

### Sprint 1

- Duration: 2 weeks
- Team: `TL`, `BE`, `FE`, `FS`
- Objectives:
- create new repository and monorepo skeleton
- initialize `apps/web`, `apps/api`, `packages/ui`, `packages/types`, `packages/config`
- configure TypeScript, ESLint, Prettier, shared configs
- set up GitHub Actions CI
- provision Supabase and Vercel projects
- Deliverables:
- working monorepo
- CI pipeline
- local environment setup guide
- connected free-tier infrastructure

### Sprint 2

- Duration: 2 weeks
- Team: `TL`, `BE`, `FS`
- Objectives:
- establish environment config strategy
- create NestJS API bootstrap
- create Next.js app bootstrap
- add shared package wiring
- add monitoring/error tracking stub
- Deliverables:
- frontend and backend app shells
- env variable strategy
- deployment-ready skeletons

## Phase 2: Tenant Model, Auth, and Access Control

### Sprint 3

- Duration: 2 weeks
- Team: `TL`, `BE`, `FS`
- Objectives:
- design tenant-aware auth/access schema
- implement `institutions`, `institution_users`, `roles`, `permissions`
- implement backend auth/session abstraction
- integrate Supabase Auth
- Deliverables:
- initial auth schema
- backend auth module
- tenant context resolution

### Sprint 4

- Duration: 2 weeks
- Team: `BE`, `FE`, `FS`, `QA`
- Objectives:
- implement onboarding for first institution admin
- implement invite-based user onboarding
- implement route guards and permission guards
- implement password reset and account lifecycle basics
- Deliverables:
- institution creation flow
- invite flow
- role-based access baseline
- auth integration tests

## Phase 3: Academic Structure Management

### Sprint 5

- Duration: 2 weeks
- Team: `BE`, `FS`
- Objectives:
- create schema and services for campuses, departments, courses, batches, academic_terms, subjects, academic_years
- add CRUD APIs
- Deliverables:
- academic structure schema
- CRUD endpoints

### Sprint 6

- Duration: 2 weeks
- Team: `FE`, `FS`, `QA`
- Objectives:
- build institution setup UI for academic hierarchy
- validate tenant-scoped structure editing
- add audit logging for setup changes
- Deliverables:
- academic structure UI
- CRUD integration
- QA checklist for tenant scoping

## Phase 4: Question Bank Foundation

### Sprint 7

- Duration: 2 weeks
- Team: `TL`, `BE`, `FS`
- Objectives:
- create schema for question banks, questions, question versions
- add metadata model for difficulty, topics, units, outcomes
- build question CRUD APIs
- Deliverables:
- question bank schema
- question services

### Sprint 8

- Duration: 2 weeks
- Team: `FE`, `FS`
- Objectives:
- build question list/create/edit screens
- add search/filter UI
- add lifecycle state support
- Deliverables:
- working question bank UI

### Sprint 9

- Duration: 2 weeks
- Team: `BE`, `FE`, `QA`
- Objectives:
- build CSV/Excel import pipeline
- add media upload support
- add version history recording
- add exact duplicate detection baseline
- Deliverables:
- bulk import flow
- import validation reporting
- media support

## Phase 5: Template System and Global Template Library

### Sprint 10

- Duration: 2 weeks
- Team: `BE`, `FS`
- Objectives:
- create schema for templates and template_sections
- design global template entities and clone lineage
- implement template CRUD APIs
- Deliverables:
- template schema
- Global Template Library schema

### Sprint 11

- Duration: 2 weeks
- Team: `FE`, `FS`, `UX`
- Objectives:
- build institution template builder
- build section rule configuration UI
- Deliverables:
- institution template builder UI

### Sprint 12

- Duration: 2 weeks
- Team: `BE`, `FE`, `QA`
- Objectives:
- build Global Template Library admin publish flow
- build browse/filter/preview/clone flow for institutions
- add recommendation hooks
- Deliverables:
- working Global Template Library
- clone-to-tenant flow

## Phase 6: Paper Generation Engine

### Sprint 13

- Duration: 2 weeks
- Team: `TL`, `BE`, `FS`
- Objectives:
- create schema for papers, paper_sections, generation_runs
- implement backend generation engine
- support section rules and selection constraints
- Deliverables:
- generation engine v1
- draft persistence model

### Sprint 14

- Duration: 2 weeks
- Team: `FE`, `FS`
- Objectives:
- build paper generation UI
- build draft review/edit UI
- add section regeneration UX
- Deliverables:
- generation screens
- draft paper editor

## Phase 7: Approval Workflow

### Sprint 15

- Duration: 2 weeks
- Team: `BE`, `FS`, `QA`
- Objectives:
- implement approval state machine
- implement reviewer assignment
- implement review notes and approval history
- Deliverables:
- approval workflow backend
- transition tests

### Sprint 16

- Duration: 2 weeks
- Team: `FE`, `FS`
- Objectives:
- build review queue and paper approval UI
- enforce role-aware workflow states in frontend
- Deliverables:
- approval UI
- review timeline screen

## Phase 8: Export Pipeline

### Sprint 17

- Duration: 2 weeks
- Team: `BE`, `FS`
- Objectives:
- implement PDF export service
- define DOCX export format strategy
- persist export records and file references
- Deliverables:
- PDF export pipeline v1

### Sprint 18

- Duration: 2 weeks
- Team: `BE`, `FE`, `QA`
- Objectives:
- implement DOCX export
- add branded header/footer support
- add download flow and permission enforcement
- Deliverables:
- PDF/DOCX export flow
- export tests

## Phase 9: Analytics, Reporting, and Audit

### Sprint 19

- Duration: 2 weeks
- Team: `BE`, `FS`
- Objectives:
- implement audit_logs and usage_metrics
- capture core business events
- build reporting queries
- Deliverables:
- audit/event capture baseline

### Sprint 20

- Duration: 2 weeks
- Team: `FE`, `FS`, `QA`
- Objectives:
- build analytics dashboards
- build exportable report views
- validate tenant-isolated reporting
- Deliverables:
- MVP analytics dashboard
- audit visibility screens

## Phase 10: AI Foundations

### Sprint 21

- Duration: 2 weeks
- Team: `TL`, `BE`
- Objectives:
- create AI provider abstraction
- add quota and usage logging
- implement first AI workflow interfaces
- Deliverables:
- AI service framework

### Sprint 22

- Duration: 2 weeks
- Team: `BE`, `FE`, `QA`
- Objectives:
- implement first controlled AI flows
- syllabus-to-question generation
- topic extraction
- outcome tagging assistance
- Deliverables:
- AI-assisted MVP or pilot-ready features

## Phase 11: QA Hardening

### Sprint 23

- Duration: 2 weeks
- Team: `QA`, `BE`, `FE`, `FS`
- Objectives:
- expand unit and integration coverage
- cover core workflows end-to-end
- run accessibility and performance checks
- Deliverables:
- QA baseline
- defect backlog

### Sprint 24

- Duration: 2 weeks
- Team: `QA`, `TL`, `BE`, `FE`
- Objectives:
- fix high-priority defects
- validate free-tier operational limits
- complete security review for auth, tenant scoping, and file access
- Deliverables:
- pilot-readiness sign-off

## Phase 12: Deployment and Pilot Launch

### Sprint 25

- Duration: 2 weeks
- Team: `TL`, `BE`, `FE`, `QA`, `PL`
- Objectives:
- finalize staging and production environments
- perform staging acceptance testing
- configure production secrets and domain setup
- Deliverables:
- production-ready infrastructure

### Sprint 26

- Duration: 2 weeks
- Team: `PL`, `TL`, `QA`, `FE`, `BE`
- Objectives:
- launch production
- onboard first pilot institution
- monitor generation, export, auth, and reporting health
- capture first wave pilot feedback
- Deliverables:
- pilot launch
- launch review report

## 4. Milestone Summary

- Milestone 1: Foundations complete by Sprint 2
- Milestone 2: Tenant/auth/access complete by Sprint 4
- Milestone 3: Academic structure + question bank complete by Sprint 9
- Milestone 4: Templates + Global Template Library complete by Sprint 12
- Milestone 5: Generation + approvals + exports complete by Sprint 18
- Milestone 6: Analytics + audit complete by Sprint 20
- Milestone 7: AI foundations complete by Sprint 22
- Milestone 8: QA hardening complete by Sprint 24
- Milestone 9: Pilot launch complete by Sprint 26

## 5. Database Schema Draft

## 5.1 Multi-Tenant Foundation

### `institutions`

- `id uuid pk`
- `name text not null`
- `slug text unique not null`
- `institution_type text not null`
- `branding_name text`
- `logo_url text`
- `primary_color text`
- `timezone text`
- `country text`
- `state text`
- `city text`
- `is_active boolean default true`
- `created_at timestamptz default now()`
- `updated_at timestamptz default now()`

### `roles`

- `id uuid pk`
- `code text unique not null`
- `name text not null`
- `scope text not null`
- `is_system boolean default true`
- `created_at timestamptz default now()`

### `permissions`

- `id uuid pk`
- `code text unique not null`
- `name text not null`
- `module text not null`
- `created_at timestamptz default now()`

### `role_permissions`

- `role_id uuid fk -> roles.id`
- `permission_id uuid fk -> permissions.id`
- primary key `(role_id, permission_id)`

### `institution_users`

- `id uuid pk`
- `institution_id uuid fk -> institutions.id`
- `auth_user_id uuid unique`
- `email text not null`
- `display_name text not null`
- `status text not null`
- `department_id uuid null`
- `primary_role_id uuid fk -> roles.id`
- `is_active boolean default true`
- `last_login_at timestamptz`
- `created_at timestamptz default now()`
- `updated_at timestamptz default now()`

### `institution_user_roles`

- `institution_user_id uuid fk -> institution_users.id`
- `role_id uuid fk -> roles.id`
- primary key `(institution_user_id, role_id)`

### `invitations`

- `id uuid pk`
- `institution_id uuid fk -> institutions.id`
- `email text not null`
- `role_id uuid fk -> roles.id`
- `invited_by uuid fk -> institution_users.id`
- `token text unique not null`
- `status text not null`
- `expires_at timestamptz not null`
- `accepted_at timestamptz`
- `created_at timestamptz default now()`

### `subscriptions`

- `id uuid pk`
- `institution_id uuid fk -> institutions.id unique`
- `plan_code text not null`
- `status text not null`
- `billing_cycle text`
- `starts_at timestamptz`
- `ends_at timestamptz`
- `trial_ends_at timestamptz`
- `created_at timestamptz default now()`
- `updated_at timestamptz default now()`

### `usage_metrics`

- `id uuid pk`
- `institution_id uuid fk -> institutions.id`
- `metric_code text not null`
- `metric_date date not null`
- `metric_value numeric not null`
- `metadata jsonb default '{}'::jsonb`
- `created_at timestamptz default now()`

## 5.2 Academic Structure

### `campuses`

- `id uuid pk`
- `institution_id uuid fk -> institutions.id`
- `name text not null`
- `code text`
- `is_active boolean default true`
- `created_at timestamptz default now()`

### `departments`

- `id uuid pk`
- `institution_id uuid fk -> institutions.id`
- `campus_id uuid null fk -> campuses.id`
- `name text not null`
- `code text`
- `is_active boolean default true`
- `created_at timestamptz default now()`

### `courses`

- `id uuid pk`
- `institution_id uuid fk -> institutions.id`
- `department_id uuid fk -> departments.id`
- `name text not null`
- `code text`
- `level text`
- `duration_terms int`
- `is_active boolean default true`
- `created_at timestamptz default now()`

### `batches`

- `id uuid pk`
- `institution_id uuid fk -> institutions.id`
- `course_id uuid fk -> courses.id`
- `name text not null`
- `start_year int`
- `end_year int`
- `is_active boolean default true`
- `created_at timestamptz default now()`

### `academic_years`

- `id uuid pk`
- `institution_id uuid fk -> institutions.id`
- `name text not null`
- `starts_on date`
- `ends_on date`
- `is_current boolean default false`

### `academic_terms`

- `id uuid pk`
- `institution_id uuid fk -> institutions.id`
- `academic_year_id uuid fk -> academic_years.id`
- `name text not null`
- `term_type text`
- `sequence_no int`
- `starts_on date`
- `ends_on date`

### `subjects`

- `id uuid pk`
- `institution_id uuid fk -> institutions.id`
- `department_id uuid fk -> departments.id`
- `course_id uuid fk -> courses.id`
- `batch_id uuid null fk -> batches.id`
- `academic_term_id uuid null fk -> academic_terms.id`
- `name text not null`
- `code text`
- `credits numeric`
- `subject_stream text`
- `is_active boolean default true`
- `created_at timestamptz default now()`

## 5.3 Question Bank

### `question_banks`

- `id uuid pk`
- `institution_id uuid fk -> institutions.id`
- `subject_id uuid fk -> subjects.id`
- `name text not null`
- `description text`
- `status text not null default 'active'`
- `created_by uuid fk -> institution_users.id`
- `created_at timestamptz default now()`

### `questions`

- `id uuid pk`
- `institution_id uuid fk -> institutions.id`
- `question_bank_id uuid fk -> question_banks.id`
- `subject_id uuid fk -> subjects.id`
- `current_version_no int not null default 1`
- `status text not null`
- `question_type text not null`
- `difficulty_level text not null`
- `marks numeric not null`
- `language_code text default 'en'`
- `has_media boolean default false`
- `usage_count int default 0`
- `created_by uuid fk -> institution_users.id`
- `created_at timestamptz default now()`
- `updated_at timestamptz default now()`

### `question_versions`

- `id uuid pk`
- `institution_id uuid fk -> institutions.id`
- `question_id uuid fk -> questions.id`
- `version_no int not null`
- `question_text text not null`
- `answer_text text`
- `explanation_text text`
- `metadata jsonb default '{}'::jsonb`
- `created_by uuid fk -> institution_users.id`
- `created_at timestamptz default now()`

### `topics`

- `id uuid pk`
- `institution_id uuid fk -> institutions.id`
- `subject_id uuid fk -> subjects.id`
- `name text not null`
- `unit_name text`
- `created_at timestamptz default now()`

### `question_topics`

- `question_id uuid fk -> questions.id`
- `topic_id uuid fk -> topics.id`
- primary key `(question_id, topic_id)`

### `learning_outcomes`

- `id uuid pk`
- `institution_id uuid fk -> institutions.id`
- `subject_id uuid fk -> subjects.id`
- `outcome_type text not null`
- `code text not null`
- `description text`
- `created_at timestamptz default now()`

### `question_learning_outcomes`

- `question_id uuid fk -> questions.id`
- `learning_outcome_id uuid fk -> learning_outcomes.id`
- primary key `(question_id, learning_outcome_id)`

### `question_media`

- `id uuid pk`
- `institution_id uuid fk -> institutions.id`
- `question_id uuid fk -> questions.id`
- `file_url text not null`
- `file_type text not null`
- `created_at timestamptz default now()`

### `question_duplicates`

- `id uuid pk`
- `institution_id uuid fk -> institutions.id`
- `question_id uuid fk -> questions.id`
- `matched_question_id uuid fk -> questions.id`
- `match_type text not null`
- `similarity_score numeric`
- `created_at timestamptz default now()`

## 5.4 Template System and Global Templates

### `templates`

- `id uuid pk`
- `institution_id uuid fk -> institutions.id`
- `subject_id uuid null fk -> subjects.id`
- `name text not null`
- `template_scope text not null`
- `status text not null`
- `version_no int not null default 1`
- `source_type text not null`
- `clone_origin_template_id uuid null`
- `description text`
- `duration_minutes int`
- `total_marks numeric`
- `created_by uuid fk -> institution_users.id`
- `created_at timestamptz default now()`
- `updated_at timestamptz default now()`

### `template_sections`

- `id uuid pk`
- `template_id uuid fk -> templates.id`
- `name text not null`
- `sequence_no int not null`
- `section_type text`
- `marks_per_question numeric`
- `questions_required int`
- `optional_questions_count int`
- `section_marks numeric`
- `rules jsonb default '{}'::jsonb`

### `global_template_categories`

- `id uuid pk`
- `name text not null`
- `slug text unique not null`

### `global_templates`

- `id uuid pk`
- `name text not null`
- `template_type text not null`
- `institution_type text not null`
- `board_university_tag text`
- `exam_type text`
- `subject_category text`
- `total_marks numeric`
- `duration_minutes int`
- `mandatory_instructions text`
- `evaluation_scheme text`
- `supports_co_po boolean default false`
- `version_no int not null default 1`
- `status text not null`
- `is_recommended boolean default false`
- `metadata jsonb default '{}'::jsonb`
- `created_at timestamptz default now()`
- `updated_at timestamptz default now()`

### `global_template_sections`

- `id uuid pk`
- `global_template_id uuid fk -> global_templates.id`
- `name text not null`
- `sequence_no int not null`
- `section_marks numeric`
- `rules jsonb default '{}'::jsonb`

### `template_clones`

- `id uuid pk`
- `global_template_id uuid fk -> global_templates.id`
- `template_id uuid fk -> templates.id`
- `institution_id uuid fk -> institutions.id`
- `cloned_at timestamptz default now()`
- `updated_version_available boolean default false`

## 5.5 Paper Generation

### `papers`

- `id uuid pk`
- `institution_id uuid fk -> institutions.id`
- `subject_id uuid fk -> subjects.id`
- `template_id uuid fk -> templates.id`
- `title text not null`
- `paper_code text`
- `status text not null`
- `branding_snapshot jsonb default '{}'::jsonb`
- `total_marks numeric`
- `duration_minutes int`
- `created_by uuid fk -> institution_users.id`
- `created_at timestamptz default now()`
- `updated_at timestamptz default now()`

### `paper_sections`

- `id uuid pk`
- `paper_id uuid fk -> papers.id`
- `template_section_id uuid null fk -> template_sections.id`
- `name text not null`
- `sequence_no int not null`
- `content jsonb not null`
- `section_marks numeric`

### `generation_runs`

- `id uuid pk`
- `institution_id uuid fk -> institutions.id`
- `paper_id uuid null fk -> papers.id`
- `template_id uuid fk -> templates.id`
- `subject_id uuid fk -> subjects.id`
- `status text not null`
- `input_snapshot jsonb not null`
- `output_summary jsonb default '{}'::jsonb`
- `started_at timestamptz default now()`
- `completed_at timestamptz`
- `triggered_by uuid fk -> institution_users.id`

## 5.6 Approval Workflow

### `approval_requests`

- `id uuid pk`
- `institution_id uuid fk -> institutions.id`
- `paper_id uuid fk -> papers.id`
- `current_state text not null`
- `submitted_by uuid fk -> institution_users.id`
- `submitted_at timestamptz`
- `approved_at timestamptz`
- `rejected_at timestamptz`
- `published_at timestamptz`

### `paper_reviewer_assignments`

- `id uuid pk`
- `approval_request_id uuid fk -> approval_requests.id`
- `reviewer_user_id uuid fk -> institution_users.id`
- `assigned_at timestamptz default now()`
- `status text not null`

### `review_notes`

- `id uuid pk`
- `approval_request_id uuid fk -> approval_requests.id`
- `author_user_id uuid fk -> institution_users.id`
- `note_type text not null`
- `note_text text not null`
- `created_at timestamptz default now()`

### `approval_history`

- `id uuid pk`
- `approval_request_id uuid fk -> approval_requests.id`
- `from_state text`
- `to_state text not null`
- `acted_by uuid fk -> institution_users.id`
- `reason text`
- `created_at timestamptz default now()`

## 5.7 Audit and Analytics

### `audit_logs`

- `id uuid pk`
- `institution_id uuid fk -> institutions.id`
- `actor_user_id uuid null fk -> institution_users.id`
- `entity_type text not null`
- `entity_id uuid`
- `action text not null`
- `old_values jsonb`
- `new_values jsonb`
- `metadata jsonb default '{}'::jsonb`
- `created_at timestamptz default now()`

### `institution_metrics_daily`

- `id uuid pk`
- `institution_id uuid fk -> institutions.id`
- `metric_date date not null`
- `questions_count int default 0`
- `papers_generated_count int default 0`
- `papers_published_count int default 0`
- `active_users_count int default 0`
- `exports_count int default 0`
- `ai_requests_count int default 0`

## 6. Repository Folder Structure

```text
examcraft/
├─ apps/
│  ├─ web/
│  │  ├─ app/
│  │  │  ├─ (marketing)/
│  │  │  ├─ (auth)/
│  │  │  │  ├─ login/
│  │  │  │  ├─ signup/
│  │  │  │  ├─ forgot-password/
│  │  │  │  └─ invite-accept/
│  │  │  ├─ dashboard/
│  │  │  │  ├─ overview/
│  │  │  │  ├─ institutions/
│  │  │  │  ├─ users/
│  │  │  │  ├─ academic-structure/
│  │  │  │  ├─ question-bank/
│  │  │  │  ├─ templates/
│  │  │  │  ├─ global-templates/
│  │  │  │  ├─ papers/
│  │  │  │  ├─ approvals/
│  │  │  │  ├─ analytics/
│  │  │  │  └─ settings/
│  │  │  ├─ api/
│  │  │  ├─ layout.tsx
│  │  │  └─ globals.css
│  │  ├─ components/
│  │  │  ├─ forms/
│  │  │  ├─ layouts/
│  │  │  ├─ tables/
│  │  │  ├─ charts/
│  │  │  └─ ui/
│  │  ├─ hooks/
│  │  ├─ lib/
│  │  │  ├─ api-client/
│  │  │  ├─ auth/
│  │  │  ├─ validations/
│  │  │  └─ utils/
│  │  ├─ providers/
│  │  ├─ store/
│  │  ├─ tests/
│  │  ├─ public/
│  │  ├─ next.config.js
│  │  ├─ tsconfig.json
│  │  └─ package.json
│  └─ api/
│     ├─ src/
│     │  ├─ main.ts
│     │  ├─ app.module.ts
│     │  ├─ common/
│     │  │  ├─ guards/
│     │  │  ├─ interceptors/
│     │  │  ├─ decorators/
│     │  │  ├─ exceptions/
│     │  │  └─ utils/
│     │  ├─ config/
│     │  ├─ database/
│     │  │  ├─ migrations/
│     │  │  ├─ seeders/
│     │  │  └─ repositories/
│     │  ├─ modules/
│     │  │  ├─ auth/
│     │  │  ├─ institutions/
│     │  │  ├─ users/
│     │  │  ├─ roles/
│     │  │  ├─ academic-structure/
│     │  │  ├─ question-bank/
│     │  │  ├─ templates/
│     │  │  ├─ global-templates/
│     │  │  ├─ papers/
│     │  │  ├─ approvals/
│     │  │  ├─ exports/
│     │  │  ├─ analytics/
│     │  │  ├─ audit/
│     │  │  ├─ ai/
│     │  │  └─ admin/
│     │  ├─ jobs/
│     │  │  ├─ processors/
│     │  │  └─ queues/
│     │  └─ tests/
│     ├─ nest-cli.json
│     ├─ tsconfig.json
│     └─ package.json
├─ packages/
│  ├─ ui/
│  │  ├─ src/
│  │  │  ├─ components/
│  │  │  ├─ themes/
│  │  │  └─ index.ts
│  │  ├─ package.json
│  │  └─ tsconfig.json
│  ├─ types/
│  │  ├─ src/
│  │  │  ├─ api/
│  │  │  ├─ auth/
│  │  │  ├─ domain/
│  │  │  └─ index.ts
│  │  ├─ package.json
│  │  └─ tsconfig.json
│  ├─ config/
│  │  ├─ eslint/
│  │  ├─ tsconfig/
│  │  ├─ tailwind/
│  │  ├─ env/
│  │  └─ package.json
│  └─ sdk/
│     ├─ src/
│     └─ package.json
├─ docs/
│  ├─ product/
│  ├─ technical/
│  ├─ api/
│  └─ runbooks/
├─ .github/
│  └─ workflows/
├─ scripts/
│  ├─ setup/
│  ├─ db/
│  └─ release/
├─ supabase/
│  ├─ config.toml
│  ├─ migrations/
│  └─ seed.sql
├─ .env.example
├─ package.json
├─ pnpm-workspace.yaml
├─ turbo.json
└─ README.md
```

## 7. First 20 Implementation Tasks

## Task 1

- Title: Confirm MVP scope and stack
- Owner: `PL`, `TL`
- Estimate: 1 day
- Dependencies: none
- Output: signed-off MVP scope, stack, and role matrix draft

## Task 2

- Title: Create new monorepo repository
- Owner: `TL`
- Estimate: 0.5 day
- Dependencies: Task 1
- Output: clean repo with workspace tooling

## Task 3

- Title: Bootstrap `apps/web` and `apps/api`
- Owner: `FE`, `BE`
- Estimate: 1 day
- Dependencies: Task 2
- Output: running Next.js and NestJS app shells

## Task 4

- Title: Create shared packages (`ui`, `types`, `config`)
- Owner: `FS`
- Estimate: 1 day
- Dependencies: Task 2
- Output: shared package wiring across apps

## Task 5

- Title: Configure TypeScript, linting, formatting, and CI
- Owner: `TL`, `FS`
- Estimate: 1.5 days
- Dependencies: Tasks 2-4
- Output: baseline quality gates in GitHub Actions

## Task 6

- Title: Provision Supabase and Vercel projects
- Owner: `TL`
- Estimate: 0.5 day
- Dependencies: Task 1
- Output: free-tier infrastructure connected to the repo

## Task 7

- Title: Design tenant/auth schema
- Owner: `TL`, `BE`
- Estimate: 1.5 days
- Dependencies: Task 6
- Output: migration draft for institutions, users, roles, permissions, invites

## Task 8

- Title: Implement backend auth module and tenant context
- Owner: `BE`
- Estimate: 2 days
- Dependencies: Task 7
- Output: auth guard, tenant resolver, permission base

## Task 9

- Title: Implement frontend auth flow
- Owner: `FE`
- Estimate: 2 days
- Dependencies: Task 8
- Output: login, signup, invite accept, forgot password screens

## Task 10

- Title: Implement institution onboarding flow
- Owner: `FS`
- Estimate: 2 days
- Dependencies: Tasks 8-9
- Output: first institution admin setup flow

## Task 11

- Title: Implement role-based access control
- Owner: `BE`, `FS`
- Estimate: 2 days
- Dependencies: Tasks 8-10
- Output: backend authorization + frontend route protection

## Task 12

- Title: Design academic structure schema and migrations
- Owner: `BE`
- Estimate: 1.5 days
- Dependencies: Task 7
- Output: departments/campuses/courses/batches/terms/subjects schema

## Task 13

- Title: Build academic structure CRUD APIs
- Owner: `BE`
- Estimate: 2 days
- Dependencies: Task 12
- Output: backend CRUD endpoints with tenant scoping

## Task 14

- Title: Build academic structure admin UI
- Owner: `FE`
- Estimate: 2 days
- Dependencies: Task 13
- Output: institution setup screens for hierarchy management

## Task 15

- Title: Design question bank schema
- Owner: `TL`, `BE`
- Estimate: 1.5 days
- Dependencies: Task 12
- Output: question banks, questions, versions, topics, outcomes schema

## Task 16

- Title: Build question CRUD APIs
- Owner: `BE`
- Estimate: 2 days
- Dependencies: Task 15
- Output: tenant-safe question APIs

## Task 17

- Title: Build question bank UI
- Owner: `FE`
- Estimate: 3 days
- Dependencies: Task 16
- Output: question list, create, edit, filter screens

## Task 18

- Title: Build CSV/Excel import pipeline
- Owner: `BE`, `FS`
- Estimate: 3 days
- Dependencies: Task 16
- Output: validated import processing with row-level errors

## Task 19

- Title: Design template and Global Template Library schema
- Owner: `TL`, `BE`
- Estimate: 2 days
- Dependencies: Tasks 12 and 15
- Output: templates, sections, global templates, clone lineage schema

## Task 20

- Title: Build institution template builder v1
- Owner: `FE`, `FS`
- Estimate: 3 days
- Dependencies: Task 19
- Output: template builder UI connected to backend APIs

## 8. Final Recommendation

Start with the multi-tenant and auth foundations, then move through academic structure, question bank, templates, generation, approvals, exports, and analytics in that order. Keep the MVP narrow but complete enough to sell, and use the free-tier-first approach as a cost strategy rather than an excuse for weak architecture.
