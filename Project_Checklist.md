# ExamCraft Project Checklist

## 1. Purpose

This file is the central tracking checklist for the `ExamCraft` project.

It is intended to:

- track all major project activities in one place
- show what has already been completed
- show what remains to be done
- provide a simple execution view across planning, setup, development, testing, and launch

### Status Key

- `[x]` Completed
- `[~]` In Progress
- `[ ]` Not Started
- `[!]` Blocked / Needs Decision

## 2. Current Project State Summary

### Completed So Far

- [x] New product documentation created for `ExamCraft`
- [x] Execution plan created
- [x] Development plan created
- [x] Phase 0 checklist and Sprint 1 backlog created
- [x] New monorepo scaffold created
- [x] Root workspace configuration added
- [x] `apps/web` scaffold created
- [x] `apps/api` scaffold created
- [x] Shared package scaffolding created
- [x] Supabase folder scaffold created
- [x] CI workflow stub added

### Still Pending / Active

- [x] Final Phase 0 tenant model decision
- [x] Final Phase 0 role matrix decision
- [x] Final Phase 0 pilot success criteria
- [~] Sprint 1 execution
- [x] Dependency installation and first local run
- [~] Tenant/auth schema implementation

## 3. Phase 0: Execution-Readiness

### Product and Scope

- [x] Define new greenfield SaaS direction
- [x] Create PRD
- [x] Create TRD
- [x] Create Architecture document
- [x] Create Execution Plan
- [x] Create Development Plan
- [x] Create Phase 0 checklist and Sprint 1 backlog
- [ ] Confirm final MVP scope line-by-line
- [ ] Create explicit deferred scope list
- [ ] Confirm first pilot institution profile
- [ ] Define must-work pilot workflows

### Architecture and Delivery Decisions

- [x] Confirm high-level stack direction
- [x] Confirm free-tier-first strategy
- [x] Draft monorepo structure
- [ ] Confirm final monorepo decision
- [ ] Confirm `pnpm` workspaces as final package manager strategy
- [ ] Confirm trunk-based branching policy
- [ ] Confirm CI merge gates
- [ ] Confirm environment strategy: local / staging / production
- [ ] Confirm REST as MVP API style

### Tenant Model and Roles

- [x] Confirm tenant model
- [x] Confirm MVP platform roles
- [x] Confirm MVP institution roles
- [x] Confirm role-permission matrix
- [x] Confirm invite/onboarding ownership rules

### Pilot Success Criteria

- [x] Define pilot success metrics
- [x] Define MVP launch readiness criteria
- [x] Define pilot launch success criteria

### Team and Workflow

- [ ] Confirm sprint cadence with team
- [ ] Confirm team ownership by role
- [ ] Confirm board/backlog tool
- [ ] Confirm definition of done
- [ ] Confirm QA expectations

## 4. Sprint 1: Repository and Infrastructure Foundations

### Repo and Workspace

- [x] Create new repo structure in workspace
- [x] Create root `package.json`
- [x] Create `pnpm-workspace.yaml`
- [x] Create `turbo.json`
- [x] Create root TypeScript base config
- [x] Create `.gitignore`
- [x] Create `.env.example`
- [x] Create root `README.md`

### Applications

- [x] Create `apps/web`
- [x] Add Next.js app shell files
- [x] Create `apps/api`
- [x] Add NestJS-style app shell files
- [x] Add API health endpoint

### Shared Packages

- [x] Create `packages/ui`
- [x] Add first shared UI component stub
- [x] Create `packages/types`
- [x] Add first shared domain type stub
- [x] Create `packages/config`
- [x] Create `packages/sdk`

### DevOps and Support Structure

- [x] Create `.github/workflows/ci.yml`
- [x] Create `supabase/` scaffold
- [x] Create `docs/` scaffold
- [x] Create `scripts/` scaffold
- [x] Install dependencies
- [x] Run first workspace install successfully
- [x] Run first local frontend startup
- [x] Run first local backend startup
- [x] Run first lint check
- [x] Run first typecheck
- [x] Run first CI validation locally

## 5. Phase 2: Tenant Model, Auth, and Access Control

### Schema and Migrations

- [x] Create migration for `institutions`
- [x] Create migration for `roles`
- [x] Create migration for `permissions`
- [x] Create migration for `role_permissions`
- [x] Create migration for `institution_users`
- [x] Create migration for `institution_user_roles`
- [x] Create migration for `invitations`
- [x] Create migration for `subscriptions`
- [x] Create migration for `usage_metrics`

### Backend

- [x] Create auth module
- [x] Create tenant context resolver
- [x] Create role guard
- [x] Create permission guard
- [x] Create onboarding service
- [x] Create invitation service

### Frontend

- [x] Build login screen
- [x] Build signup screen
- [ ] Build forgot password flow
- [x] Build invite acceptance flow
- [x] Build first tenant onboarding flow

## 6. Phase 3: Academic Structure Management

- [ ] Create schema for campuses
- [ ] Create schema for departments
- [ ] Create schema for courses
- [ ] Create schema for batches/classes
- [ ] Create schema for academic years
- [ ] Create schema for academic terms
- [ ] Create schema for subjects
- [ ] Build CRUD APIs for academic structure
- [ ] Build frontend screens for academic structure setup
- [ ] Add audit logging for academic structure changes

## 7. Phase 4: Question Bank Foundation

- [ ] Create schema for question banks
- [ ] Create schema for questions
- [ ] Create schema for question versions
- [ ] Create schema for topics
- [ ] Create schema for learning outcomes
- [ ] Create schema for question media
- [ ] Create schema for question duplicate tracking
- [ ] Build question CRUD APIs
- [ ] Build question list/search/filter UI
- [ ] Build manual question create/edit UI
- [ ] Build CSV import flow
- [ ] Build Excel import flow
- [ ] Build media upload support
- [ ] Add exact duplicate detection
- [ ] Add question lifecycle state support
- [ ] Add usage history tracking

## 8. Phase 5: Template System and Global Template Library

- [ ] Create schema for templates
- [ ] Create schema for template sections
- [ ] Create schema for global templates
- [ ] Create schema for global template sections
- [ ] Create schema for template clone lineage
- [ ] Build institution template CRUD APIs
- [ ] Build institution template builder UI
- [ ] Build global template admin publish flow
- [ ] Build global template browse/filter/preview flow
- [ ] Build global template clone flow
- [ ] Add template recommendation logic
- [ ] Add template version visibility

## 9. Phase 6: Paper Generation Engine

- [ ] Create schema for papers
- [ ] Create schema for paper sections
- [ ] Create schema for generation runs
- [ ] Build backend generation engine
- [ ] Implement section rule handling
- [ ] Implement shortage handling
- [ ] Implement section regeneration support
- [ ] Build paper generation UI
- [ ] Build draft paper review/edit UI
- [ ] Add audit metadata generation

## 10. Phase 7: Approval Workflow

- [ ] Create schema for approval requests
- [ ] Create schema for reviewer assignments
- [ ] Create schema for review notes
- [ ] Create schema for approval history
- [ ] Build approval state machine
- [ ] Build reviewer assignment logic
- [ ] Build review queue UI
- [ ] Build approve/reject/publish flow
- [ ] Enforce final-lock publishing rules

## 11. Phase 8: Export Pipeline

- [ ] Build PDF export service
- [ ] Build DOCX export service
- [ ] Add branded header/footer rendering
- [ ] Persist export records
- [ ] Store generated files in storage
- [ ] Build secure export download flow
- [ ] Add export permission checks

## 12. Phase 9: Analytics, Reporting, and Audit

- [ ] Create schema for audit logs
- [ ] Create analytics aggregation strategy
- [ ] Create reporting queries/views
- [ ] Build usage metrics tracking
- [ ] Build basic analytics dashboard
- [ ] Build exportable reports
- [ ] Validate tenant-safe reporting

## 13. Phase 10: AI Foundations

- [ ] Create AI provider abstraction
- [ ] Create AI usage logging
- [ ] Add AI quota controls
- [ ] Build syllabus-to-question generation flow
- [ ] Build question improvement suggestion flow
- [ ] Build topic extraction support
- [ ] Build outcome tagging assistance
- [ ] Build AI review/acceptance flow

## 14. Phase 11: QA Hardening

- [ ] Add backend unit tests
- [ ] Add frontend unit/component tests
- [ ] Add integration tests for auth and tenant access
- [ ] Add integration tests for question bank
- [ ] Add integration tests for template system
- [ ] Add integration tests for paper generation
- [ ] Add integration tests for approval workflow
- [ ] Add integration tests for export pipeline
- [ ] Add E2E tests for pilot-critical workflows
- [ ] Run accessibility review
- [ ] Run performance review
- [ ] Run security review

## 15. Phase 12: Deployment and Pilot Launch

- [ ] Finalize dev environment
- [ ] Finalize staging environment
- [ ] Finalize production environment
- [ ] Configure secrets and environment variables
- [ ] Complete staging acceptance test run
- [ ] Deploy production
- [ ] Onboard first pilot institution
- [ ] Monitor auth/generation/export/reporting health
- [ ] Capture pilot feedback

## 16. Immediate Next Queue

These are the next logical tasks in order.

1. [x] Run first lint check
2. [x] Run first CI validation locally
3. [x] Apply the first Supabase migration in a local project
4. [x] Build auth module and tenant context resolver
5. [x] Build onboarding and invitation services
6. [x] Build role and permission guards
7. [x] Add API env file wiring for cloud Supabase
8. [x] Build frontend login, invite acceptance, and onboarding flows
9. [!] Resolve OneDrive lock blocking Next.js production build output
10. [ ] Build forgot password flow
11. [ ] Connect frontend screens to post-login tenant dashboard state

## 17. Maintenance Rules for This File

Whenever work is done:

- update the relevant checklist item immediately
- add new tasks if scope expands
- mark blockers with `[!]`
- keep “Immediate Next Queue” current
