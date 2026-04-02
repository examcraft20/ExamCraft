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

### Important Realignment Note

This checklist had drifted ahead of the actual implementation. Items marked complete in later phases should not be treated as verified shipped functionality unless they match the current implementation summary below or have been revalidated in code and tests.

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
- [x] Active development workspace moved out of OneDrive to avoid build locks
- [x] Demo pilot institution and test admin account provisioned in Supabase
- [x] Demo academic seed data created for the pilot institution
- [x] Demo faculty and reviewer test accounts provisioned in Supabase
- [x] Shared auth shell and premium auth redesign implemented
- [x] `lucide-react` integrated for landing/auth/dashboard surfaces
- [x] `sonner` integrated for toast notifications
- [x] Tailwind CSS configured in `apps/web`
- [x] Tailwind migration started in `packages/ui` for `Button`, `Card`, `Input`, `Select`, and `Skeleton`
- [x] Dashboard membership selector built
- [x] Institution admin workspace built
- [x] Faculty workspace built

### Still Pending / Active

- [x] Final Phase 0 tenant model decision
- [x] Final Phase 0 role matrix decision
- [x] Final Phase 0 pilot success criteria
- [~] Sprint 1 execution
- [x] Dependency installation and first local run
- [~] Tenant/auth schema implementation
- [~] Analytics/reporting implementation is underway
- [~] QA hardening has started with approval/export coverage and first browser E2E flow
- [~] Tailwind-based frontend redesign has started with shared primitives, landing, and auth flows
- [~] Tailwind migration for the remaining `packages/ui` primitives is still in progress
- [~] Dashboard-wide redesign is partial; only the currently implemented modules should be considered validated
- [!] Historical checklist sections below contain roadmap items that need revalidation before being treated as complete

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
- [x] Provision first working test login with tenant access

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
- [ ] Seed first department and first subject for demo testing

## 7. Phase 4: Question Bank Foundation

- [ ] Create schema for question banks
- [x] Create schema for questions
- [ ] Create schema for question versions
- [ ] Create schema for topics
- [ ] Create schema for learning outcomes
- [ ] Create schema for question media
- [ ] Create schema for question duplicate tracking
- [x] Build question CRUD APIs
- [ ] Build question list/search/filter UI
- [~] Build manual question create/edit UI
- [ ] Build CSV import flow
- [ ] Build Excel import flow
- [ ] Build media upload support
- [ ] Add exact duplicate detection
- [ ] Add question lifecycle state support
- [ ] Add usage history tracking

## 8. Phase 5: Template System and Global Template Library

- [x] Create schema for templates
- [ ] Create schema for template sections
- [ ] Create schema for global templates
- [ ] Create schema for global template sections
- [ ] Create schema for template clone lineage
- [x] Build institution template CRUD APIs
- [~] Build institution template builder UI
- [ ] Build global template admin publish flow
- [ ] Build global template browse/filter/preview flow
- [ ] Build global template clone flow
- [ ] Add template recommendation logic
- [ ] Add template version visibility
- [ ] Add stronger global publish controls
- [ ] Add version comparison for global-to-institution template drift
- [ ] Add sync/update flow from global templates to institution copies

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
- [ ] Connect generated papers into approval workflow state transitions

## 11. Phase 8: Export Pipeline

- [ ] Build PDF export service
- [ ] Build DOCX export service
- [ ] Add branded header/footer rendering
- [ ] Improve branded export richness for header/footer/meta presentation
- [ ] Persist export records
- [ ] Store generated files in storage
- [ ] Build secure export download flow
- [ ] Add export permission checks
- [ ] Gate official exports to published-paper milestone
- [ ] Run published-paper PDF and DOCX export smoke test

## 12. Phase 9: Analytics, Reporting, and Audit

- [ ] Create schema for audit logs
- [ ] Create analytics aggregation strategy
- [ ] Create reporting queries/views
- [ ] Build usage metrics tracking
- [ ] Build basic analytics dashboard
- [ ] Build exportable reports
- [ ] Validate tenant-safe reporting
- [ ] Build first analytics dashboard API

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

- [x] Add backend unit tests
- [x] Add frontend unit/component tests
- [~] Add integration tests for auth and tenant access
- [ ] Add integration tests for question bank
- [ ] Add integration tests for template system
- [ ] Add integration tests for paper generation
- [ ] Add integration tests for approval workflow
- [ ] Add integration tests for export pipeline
- [ ] Add E2E tests for pilot-critical workflows
- [ ] Run accessibility review
- [ ] Run performance review
- [ ] Run security review

## 14.1 Frontend Design System and UI Modernization

- [x] Add Tailwind CSS to `apps/web`
- [x] Create shared Tailwind theme configuration
- [x] Create shared design token definitions
- [~] Redesign shared UI primitives in `packages/ui`
- [x] Redesign landing page
- [x] Redesign login page
- [x] Redesign signup page
- [x] Redesign onboarding page
- [x] Redesign invite acceptance page
- [ ] Redesign forgot password page
- [ ] Redesign reset password page
- [~] Redesign dashboard shell
- [~] Redesign dashboard modules
- [ ] Run cross-screen visual QA pass
- [ ] Restyle approval workflow module
- [ ] Restyle audit log module

## 15. Phase 12: Deployment and Pilot Launch

- [x] Finalize dev environment
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
9. [x] Resolve OneDrive lock blocking Next.js production build output
10. [x] Build forgot password flow
11. [x] Connect frontend screens to post-login tenant dashboard state
12. [x] Add password reset session recovery UX polish
13. [x] Build dashboard actions for invitation creation and academic structure setup
14. [x] Add invitation delivery beyond raw token sharing
15. [x] Add academic structure update/delete actions and audit logging
16. [x] Start question bank foundation module
17. [x] Add invitation email provider integration
18. [x] Expand question bank with edit/search/filter/import
19. [x] Add audit log views to the dashboard
20. [!] Configure live email provider secrets to move invites from fallback to delivery
21. [x] Add question bank Excel/media/import validation enhancements
22. [x] Build approval workflow foundation
23. [x] Add reviewer assignment support to approval workflow
24. [x] Enforce final-lock publishing rules
25. [x] Add actual file/media uploads for question attachments
26. [x] Add more seeded test roles/users for faculty and reviewer flows
27. [x] Run role-based approval workflow smoke test across faculty, reviewer, and admin users
28. [x] Start template system and Global Template Library foundation
29. [x] Add template version visibility
30. [x] Build global template admin publish flow
31. [x] Start paper generation foundation
32. [x] Implement section rule handling for generated papers
33. [x] Add shortage handling with placeholders when requirements cannot be satisfied
34. [x] Add section regeneration support
35. [x] Build draft paper review/edit UI
36. [x] Connect generated papers into the approval workflow
37. [x] Add Excel import support to the question bank
38. [x] Add exact duplicate detection to the question bank
39. [x] Add richer question lifecycle states
40. [x] Add question usage history tracking
41. [x] Add template recommendation logic for institution type fit
42. [x] Add stronger publish controls for the global template library
43. [x] Add version comparison visibility for institution template copies
44. [x] Add sync flow from global templates to institution copies
45. [x] Build PDF export foundation for approved and published papers
46. [x] Persist paper export records and storage-backed download links
47. [x] Wire export actions into the paper dashboard
48. [x] Add DOCX export generation and dashboard action
49. [x] Tighten export actions to the publish milestone only
50. [x] Improve branded document presentation for exported papers
51. [x] Verify published-paper PDF and DOCX export downloads end to end
52. [x] Create analytics aggregation strategy document
53. [x] Build first analytics dashboard API
54. [x] Add approval workflow integration tests
55. [x] Add export pipeline integration tests
56. [x] Build analytics dashboard UI in the web app
57. [x] Add reporting queries/views for trend and summary cards
58. [x] Add usage metrics tracking for denormalized dashboard rollups
59. [x] Add E2E publish-to-export coverage in the browser flow
60. [x] Add export and approval timeline badges inside the paper review panel
61. [x] Add usage metric rollups for daily dashboard trend persistence
62. [x] Add accessibility and performance review passes for dashboard-heavy screens
63. [x] Build exportable CSV and JSON analytics reports
64. [x] Add question bank integration test coverage
65. [x] Add template system integration test coverage
66. [x] Add paper generation integration test coverage
67. [x] Write and store the first deployment-oriented security review
68. [x] Harden question attachments to private signed access before broader rollout
69. [x] Add invitation rate limiting and invalid-token abuse throttling before broader rollout
70. [x] Add Tailwind CSS setup and theme tokens for the web app
71. [~] Redesign shared UI primitives in `packages/ui`
72. [x] Redesign landing and auth pages with the new shared shell
73. [~] Redesign dashboard shell and module surfaces with the new design language
74. [ ] Run desktop visual QA on the redesigned dashboard flow
75. [ ] Run mobile visual QA on the redesigned dashboard flow
76. [~] Add data-backed role workspaces for academic head, reviewer, and super admin
77. [ ] Re-run production build verification outside OneDrive

## 17. Maintenance Rules for This File

Whenever work is done:

- update the relevant checklist item immediately
- add new tasks if scope expands
- mark blockers with `[!]`
- keep “Immediate Next Queue” current
