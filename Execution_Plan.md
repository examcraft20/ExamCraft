# ExamCraft Execution Plan

## 1. Purpose

This document provides a comprehensive step-by-step execution plan for building the new `ExamCraft` multi-tenant SaaS platform from scratch, based on the current [PRD.md](/C:/Users/hp/OneDrive/Desktop/EXAM%20CRAFT%20-%20QPGS%20ENTERPRIES/PRD.md), [TRD.md](/C:/Users/hp/OneDrive/Desktop/EXAM%20CRAFT%20-%20QPGS%20ENTERPRIES/TRD.md), and [Architecture.md](/C:/Users/hp/OneDrive/Desktop/EXAM%20CRAFT%20-%20QPGS%20ENTERPRIES/Architecture.md).

The plan assumes:

- the product is being built from a clean restart
- the old prototype is not being extended
- the initial release should be free-tier-first
- the MVP is the first commercial milestone

## 2. Delivery Principles

- Build the backend contract before the UI depends on it.
- Model multi-tenancy from day one.
- Keep the MVP disciplined and commercially useful.
- Treat auditability, permissions, and workflow correctness as core requirements.
- Use free tiers initially, but avoid architectural shortcuts that create future rewrites.
- Ship in narrow vertical slices rather than building all domains in parallel without integration.

## 3. Recommended Delivery Sequence

The product should be built in this order:

1. Foundations and repo setup
2. Tenant model and authentication
3. Academic structure and access control
4. Question bank
5. Template system and Global Template Library
6. Paper generation
7. Approval workflow
8. Export pipeline
9. Analytics and audit logs
10. QA hardening
11. Deployment and pilot launch

## 4. Phase 0: Project Initiation

### Goals

- confirm scope and success criteria
- lock the MVP boundary
- prepare team workflow

### Tasks

1. Review PRD, TRD, and Architecture docs with all stakeholders.
2. Confirm the MVP scope and explicitly defer non-MVP items.
3. Define product success metrics for pilot institutions.
4. Choose the final stack:
   - Next.js
   - NestJS
   - Supabase/PostgreSQL
   - Supabase Auth
   - Supabase Storage
   - Vercel
5. Define engineering conventions:
   - branch strategy
   - commit conventions
   - environment naming
   - coding standards
   - API versioning rules
6. Define issue-tracking structure:
   - epics
   - milestones
   - sprint cadence

### Deliverables

- signed-off MVP scope
- team conventions
- prioritized backlog

## 5. Phase 1: Repository and Infrastructure Foundations

### Goals

- create the new codebase from scratch
- establish development workflow
- wire the free-tier-first infrastructure

### Tasks

1. Create a new repository for `ExamCraft`.
2. Initialize monorepo or structured multi-app repo.
3. Create base applications/modules:
   - `apps/web`
   - `apps/api`
   - `packages/ui`
   - `packages/types`
   - `packages/config`
4. Configure TypeScript across all apps/packages.
5. Configure linting, formatting, and shared tsconfig.
6. Set up environment variable management for local, staging, and production.
7. Create Supabase project:
   - database
   - auth
   - storage
8. Configure Vercel project for the frontend.
9. Set up CI with GitHub Actions:
   - install
   - lint
   - typecheck
   - test
10. Add baseline monitoring/error tracking integration.

### Deliverables

- clean repo structure
- CI pipeline
- connected Supabase project
- connected Vercel project

## 6. Phase 2: Tenant Model, Auth, and Access Control

### Goals

- implement the multi-tenant foundation
- establish secure identity and permission handling

### Tasks

1. Define the core tenant-aware schema:
   - institutions
   - institution_users
   - roles/permissions
   - subscriptions
   - usage_metrics
2. Design role matrix:
   - super admin
   - institution admin
   - academic head/HOD
   - faculty
   - reviewer/approver
3. Implement authentication using Supabase Auth.
4. Implement invitation flow.
5. Implement onboarding flow for first tenant admin.
6. Implement backend tenant context resolution.
7. Implement authorization guards in backend.
8. Implement tenant-aware route/session handling in frontend.
9. Implement password reset and account activation/deactivation.
10. Add audit log entries for auth and access-critical actions.

### Testing

- auth flow tests
- tenant isolation tests
- role guard tests
- invite flow tests

### Deliverables

- working tenant creation
- working user invitation and access control
- secure tenant-aware session model

## 7. Phase 3: Academic Structure Management

### Goals

- allow institutions to configure their academic hierarchy

### Tasks

1. Design and migrate schema for:
   - departments
   - campuses/branches
   - courses
   - batches/classes
   - academic_terms
   - subjects
   - academic_year/session fields
2. Implement backend CRUD endpoints.
3. Build admin screens for institution setup.
4. Support subject ownership/assignment to users where needed.
5. Add validation for duplicates and inactive records.
6. Add audit logging for structural changes.

### Testing

- CRUD validation tests
- permission tests
- tenant scoping tests

### Deliverables

- complete academic structure setup flow

## 8. Phase 4: Question Bank Foundation

### Goals

- deliver a production-ready institution question bank for MVP

### Tasks

1. Design schema for:
   - question_banks
   - questions
   - question_versions
2. Add metadata support:
   - difficulty
   - topic/unit
   - CO/PO/learning outcomes
   - status lifecycle
   - usage history
3. Build manual question entry flow.
4. Build question list/search/filter UI.
5. Build bulk import pipeline:
   - CSV
   - Excel
   - validation report
   - row-level error handling
6. Add media/image upload support.
7. Add question versioning logic.
8. Implement question status transitions.
9. Implement duplicate detection foundation:
   - exact duplicate checks in MVP
   - similarity hooks for later AI-assisted checks
10. Add audit log coverage for question create/update/import/status changes.

### Testing

- import parser tests
- question CRUD tests
- versioning tests
- search/filter tests
- tenant data isolation tests

### Deliverables

- working institution-scoped question bank

## 9. Phase 5: Template System and Global Template Library

### Goals

- deliver both institution-level templates and platform-managed global templates

### Tasks

1. Design schema for:
   - templates
   - template_sections
   - global template metadata
   - clone origin/version lineage
2. Build institution template builder:
   - sections
   - marks distribution
   - difficulty rules
   - subject/topic coverage rules
3. Build Global Template Library data model:
   - template type
   - institution type
   - board/university tag
   - exam type
   - subject category
   - marks pattern
4. Build admin flow to create/publish/deprecate global templates.
5. Build institution flow to:
   - browse
   - filter
   - preview
   - clone
   - customize locally
6. Add template versioning and “updated version available” flagging.
7. Add onboarding recommendations from the global library.

### Testing

- global template publication tests
- clone lineage tests
- template builder validation tests
- permissions tests

### Deliverables

- institution template builder
- working Global Template Library

## 10. Phase 6: Paper Generation Engine

### Goals

- generate institution-ready draft papers from templates and question banks

### Tasks

1. Design schema for:
   - papers
   - paper_sections
   - generation runs
2. Implement backend paper generation service.
3. Implement rules engine for:
   - section-wise marks
   - difficulty distribution
   - subject/topic coverage
   - reusable blueprint constraints
4. Add shortage handling logic when the bank cannot satisfy requirements.
5. Add section regeneration support.
6. Add draft persistence and editing model.
7. Generate paper ID and audit metadata.
8. Support institution branding snapshot on generated papers.

### Testing

- generation rule tests
- shortage/fallback tests
- regeneration tests
- deterministic selection tests where needed

### Deliverables

- working draft paper generation engine

## 11. Phase 7: Approval Workflow

### Goals

- enforce controlled paper review and publishing

### Tasks

1. Implement approval state machine:
   - draft
   - submitted
   - approved
   - rejected
   - published
2. Add reviewer assignment model.
3. Add review notes and rejection reasons.
4. Add approval history timeline.
5. Enforce final-lock rules on published papers.
6. Restrict transitions by role/permission.
7. Add audit log entries for all transitions.

### Testing

- workflow transition tests
- role enforcement tests
- final-lock tests
- audit event tests

### Deliverables

- complete approval and publishing workflow

## 12. Phase 8: Export Pipeline

### Goals

- provide reliable institutional exports for final papers

### Tasks

1. Implement PDF export service.
2. Implement DOCX export service.
3. Support branded institution header/footer.
4. Support consistent section/marks rendering.
5. Store export records and generated files in storage.
6. Generate secure access/download links where needed.
7. Move heavy export operations to background jobs if needed.

### Testing

- PDF snapshot/render tests
- DOCX structure validation tests
- export permission tests
- branding consistency tests

### Deliverables

- reliable PDF/DOCX export workflow

## 13. Phase 9: Analytics, Reporting, and Audit

### Goals

- provide essential institutional visibility for MVP

### Tasks

1. Implement audit_logs model and event capture.
2. Implement usage_metrics model.
3. Build MVP analytics for:
   - question-bank coverage
   - difficulty balance
   - subject/unit coverage
   - faculty contribution
   - approval turnaround time
   - paper generation trends
   - institution usage statistics
4. Build exportable report endpoints where needed.
5. Add dashboards for institution admins.

### Testing

- analytics query tests
- audit event integrity tests
- tenant isolation tests for reporting

### Deliverables

- MVP analytics dashboards
- audit trail coverage

## 14. Phase 10: AI Foundations

### Goals

- add AI features carefully without destabilizing the MVP

### Tasks

1. Build AI provider abstraction.
2. Add quota tracking and usage logging.
3. Implement first-wave AI capabilities:
   - syllabus-to-question generation
   - question improvement suggestions
   - topic extraction
   - outcome tagging assistance
4. Add review/acceptance flow for AI-generated content.
5. Add admin controls for AI usage visibility.

### Testing

- provider integration tests
- quota enforcement tests
- content validation tests
- fallback/error tests

### Deliverables

- controlled AI foundation for MVP or post-MVP pilot

## 15. Phase 11: QA Hardening

### Goals

- make the platform pilot-ready and stable

### Tasks

1. Add unit tests across core domains.
2. Add integration tests for major workflows.
3. Add end-to-end tests for:
   - onboarding
   - invite flow
   - question import
   - template cloning
   - paper generation
   - approval
   - export
4. Run accessibility checks on core admin flows.
5. Run performance checks for large question banks.
6. Validate free-tier limits under expected pilot load.
7. Conduct security review of:
   - auth
   - permissions
   - tenant scoping
   - file access

### Deliverables

- pilot-ready QA baseline

## 16. Phase 12: Deployment and Pilot Launch

### Goals

- deploy safely and onboard early institutions

### Tasks

1. Finalize environments:
   - development
   - staging
   - production
2. Configure secrets and environment variables.
3. Set up domain and branding for production.
4. Run staging acceptance test checklist.
5. Launch production environment.
6. Onboard first pilot institution.
7. Monitor:
   - auth errors
   - generation failures
   - export failures
   - slow queries
   - storage issues
8. Capture pilot feedback and defect backlog.

### Deliverables

- production deployment
- first pilot tenant live

## 17. Phase 13: Post-MVP Stabilization and Growth

### Goals

- turn MVP into a scalable SaaS baseline

### Tasks

1. Optimize slow reports and generation queries.
2. Add Redis/queue infrastructure if needed.
3. Improve analytics depth.
4. Expand AI-assisted services carefully.
5. Add stronger support/admin tooling.
6. Add billing/subscription automation if commercial rollout begins.
7. Add school/coaching-specific template packs and onboarding variants.

## 18. Suggested Milestone Structure

### Milestone 1

- repo setup
- auth
- tenant model
- role model

### Milestone 2

- academic structure
- question bank
- bulk import

### Milestone 3

- institution template builder
- Global Template Library

### Milestone 4

- paper generation
- approval workflow
- export

### Milestone 5

- analytics
- audit logs
- QA hardening
- deployment

## 19. Recommended Build Order by Team Focus

### Backend First

- schema
- auth and tenant context
- permissions
- services
- APIs
- jobs

### Frontend After Contract

- onboarding UI
- admin dashboards
- question bank screens
- template library screens
- generation and approval UI
- analytics UI

### Shared Ongoing Work

- tests
- documentation
- CI/CD
- monitoring

## 20. Risks and Controls

### Risk: Scope Bloat

Control:

- enforce MVP gate
- defer non-essential modules

### Risk: Weak Tenant Isolation

Control:

- test tenant scoping early
- review all data access patterns

### Risk: Frontend Re-absorbs Business Logic

Control:

- backend contract first
- service ownership rules

### Risk: Export Complexity

Control:

- implement PDF first with strong tests
- keep DOCX structured and template-driven

### Risk: AI Cost or Quality Issues

Control:

- quota controls
- optional rollout
- provider abstraction

## 21. Final Recommendation

Build `ExamCraft` in disciplined vertical phases, starting with tenant/auth foundations and moving outward into question bank, templates, generation, approvals, exports, and analytics. Keep the MVP commercially meaningful, technically clean, and free-tier-friendly. Avoid rebuilding the old prototype’s shortcuts into the new platform.
