# ExamCraft Phase 0 Checklist and Sprint 1 Backlog

## 1. Purpose

This document converts Phase 0 into an execution-readiness checkpoint and drafts the first sprint backlog so the team can move into Phase 1 within the week.

It is designed to answer two questions:

1. What must be finalized before coding starts?
2. What should Sprint 1 contain once those decisions are made?

## 2. Current Confirmed Decisions

These items are already locked based on your guidance:

- MVP scope will stay tight and pilot-focused
- Stack is confirmed:
- `Next.js`
- `NestJS`
- `Supabase PostgreSQL`
- `Supabase Auth`
- `Supabase Storage`
- `Vercel`
- Repo direction is leaning toward:
- monorepo
- `pnpm` workspaces
- trunk-based development with short-lived feature branches
- CI gates on lint + tests

## 3. Phase 0 Execution-Readiness Checklist

## 3.1 Mandatory Before Coding

### Product and Scope

- [ ] Confirm the final MVP scope line-by-line from [PRD.md](/C:/Users/hp/OneDrive/Desktop/EXAM%20CRAFT%20-%20QPGS%20ENTERPRIES/PRD.md)
- [ ] Create an explicit deferred list for non-MVP items
- [ ] Confirm pilot institution profile for the first target customer
- [ ] Define the “must work” pilot workflows

### Architecture and Delivery

- [ ] Confirm monorepo decision
- [ ] Confirm `pnpm` workspaces
- [ ] Confirm trunk-based branching model
- [ ] Confirm CI gates for PR merge
- [ ] Confirm environment strategy: `local`, `staging`, `production`
- [ ] Confirm API style: REST for MVP

### Tenant Model and Roles

- [ ] Finalize tenant model
- [ ] Finalize platform roles
- [ ] Finalize institution roles
- [ ] Finalize role-permission matrix for MVP
- [ ] Confirm invitation and onboarding flow ownership

### Pilot Success Criteria

- [ ] Define pilot success metrics jointly
- [ ] Define MVP launch readiness criteria
- [ ] Define what counts as a successful pilot launch

### Team and Workflow

- [ ] Confirm team responsibilities by role
- [ ] Confirm sprint cadence
- [ ] Confirm backlog tool and board structure
- [ ] Confirm definition of done
- [ ] Confirm QA ownership and test expectations

## 3.2 Recommended Before Coding

- [ ] Create architecture decision log
- [ ] Create risk register
- [ ] Create naming conventions document
- [ ] Create API error response conventions
- [ ] Create migration/versioning policy
- [ ] Create initial monitoring/alerting plan

## 4. Decision Gates Requiring Your Input

These are the only items I would treat as true decision blockers before tickets are finalized.

### Gate 1: Tenant Model Review Session

Recommended:

- 30 to 60 minute working session
- participants: you + technical lead + product lead
- objective: confirm exact tenant boundary model

Questions to settle:

- Is the tenant always the institution, or do you want branch-level tenancy later?
- Are campuses/branches child entities under one institution tenant in MVP?
- Are global templates fully platform-managed and read-only in MVP?
- Should institution admins be able to create department-level templates in MVP?

### Gate 2: Role Matrix Review Session

Recommended:

- 30 to 60 minute working session
- participants: you + technical lead + product lead
- objective: finalize MVP permissions without overdesigning future roles

MVP roles to confirm:

- `super_admin`
- `institution_admin`
- `academic_head`
- `faculty`
- `reviewer_approver`

Questions to settle:

- Can one user hold multiple roles in MVP?
- Does `academic_head` approve papers, or only assign reviewers?
- Can faculty publish, or only submit for review?
- Can institution admins override approval states?

### Gate 3: Pilot Success Criteria

Recommended:

- 30 minute session
- objective: define a shared launch target

Questions to settle:

- How many institutions are needed for pilot success?
- What are the 3 most important pilot workflows that must be flawless?
- What error rate or support burden is acceptable in pilot?
- Is “pilot success” operational usage, revenue, or both?

## 5. Recommended Phase 0 Meetings

## Meeting A: Product and MVP Lock

- Duration: 45 minutes
- Owner: `PL`
- Attendees: `PL`, `TL`, `UX`, you
- Output:
- locked MVP scope
- deferred list
- target pilot profile

## Meeting B: Tenant and Role Matrix Working Session

- Duration: 60 minutes
- Owner: `TL`
- Attendees: `TL`, `PL`, `BE`, you
- Output:
- tenant model decision
- role matrix decision
- onboarding flow decision

## Meeting C: Delivery and Repo Setup

- Duration: 30 minutes
- Owner: `TL`
- Attendees: `TL`, `FE`, `BE`, `FS`, `QA`
- Output:
- repo strategy
- branching model
- CI gating rules
- definition of done

## Meeting D: Pilot Success Criteria

- Duration: 30 minutes
- Owner: `PL`
- Attendees: `PL`, `TL`, you
- Output:
- success criteria
- readiness criteria
- post-sprint evaluation format

## 6. Phase 0 Exit Criteria

Phase 0 is complete only when all of the following are true:

- MVP scope is locked
- deferred items are documented
- tenant model is confirmed
- role matrix is confirmed
- pilot success criteria are defined
- repo strategy is confirmed
- sprint cadence and ownership are confirmed
- first sprint backlog is approved

## 7. Sprint 1 Goal

Sprint 1 should establish the development foundations for the new `ExamCraft` platform:

- new repository and monorepo scaffold
- base `web` and `api` apps
- shared package scaffolding
- TypeScript/lint/format setup
- CI pipeline
- connected Supabase and Vercel projects
- initial environment configuration

## 8. Sprint 1 Backlog

Assumption:

- Sprint duration: 2 weeks
- Sprint owner: `TL`
- Primary team: `TL`, `FE`, `BE`, `FS`
- Supporting team: `QA`, `UX`

## Story 1: Create New Repository

- Priority: `P0`
- Owner: `TL`
- Estimate: `0.5 day`
- Dependencies: none
- Description:
- Create the new `ExamCraft` repository
- Initialize git settings and root project files
- Acceptance Criteria:
- repo exists
- root README exists
- branch protection strategy documented

## Story 2: Set Up Monorepo with pnpm Workspaces

- Priority: `P0`
- Owner: `TL`, `FS`
- Estimate: `1 day`
- Dependencies: Story 1
- Description:
- Initialize monorepo
- Add workspace config
- Add root package scripts
- Acceptance Criteria:
- `pnpm install` works at root
- workspaces resolve correctly

## Story 3: Bootstrap apps/web

- Priority: `P0`
- Owner: `FE`
- Estimate: `1 day`
- Dependencies: Story 2
- Description:
- Create Next.js app
- Configure TypeScript and App Router
- Acceptance Criteria:
- app runs locally
- base route loads

## Story 4: Bootstrap apps/api

- Priority: `P0`
- Owner: `BE`
- Estimate: `1 day`
- Dependencies: Story 2
- Description:
- Create NestJS API app
- Add health endpoint
- Acceptance Criteria:
- API boots locally
- health endpoint responds

## Story 5: Create Shared Packages

- Priority: `P0`
- Owner: `FS`
- Estimate: `1 day`
- Dependencies: Story 2
- Description:
- Create `packages/ui`
- Create `packages/types`
- Create `packages/config`
- Acceptance Criteria:
- each package builds
- both apps can import from shared packages

## Story 6: Configure TypeScript, ESLint, and Prettier

- Priority: `P0`
- Owner: `TL`, `FS`
- Estimate: `1.5 days`
- Dependencies: Stories 3-5
- Description:
- create shared TS config
- create shared lint config
- create formatting config
- Acceptance Criteria:
- lint and typecheck run from root
- no duplicate config drift between apps

## Story 7: Add Root Scripts and Developer Tooling

- Priority: `P1`
- Owner: `FS`
- Estimate: `0.5 day`
- Dependencies: Story 6
- Description:
- add root scripts for dev, build, lint, test
- add consistent developer commands
- Acceptance Criteria:
- local setup is documented
- root commands work

## Story 8: Provision Supabase Project

- Priority: `P0`
- Owner: `TL`
- Estimate: `0.5 day`
- Dependencies: none
- Description:
- create Supabase project
- enable Postgres/Auth/Storage
- configure local project settings
- Acceptance Criteria:
- Supabase credentials available for dev
- local env example updated

## Story 9: Provision Vercel Project

- Priority: `P1`
- Owner: `TL`
- Estimate: `0.5 day`
- Dependencies: Story 3
- Description:
- create Vercel project for web app
- connect repo
- configure environment placeholders
- Acceptance Criteria:
- preview deployment path is defined

## Story 10: Set Up Environment Configuration

- Priority: `P0`
- Owner: `BE`, `FS`
- Estimate: `1 day`
- Dependencies: Stories 3, 4, 8
- Description:
- define environment variables for local/staging/prod
- add `.env.example`
- Acceptance Criteria:
- both apps can read required config
- environment naming is standardized

## Story 11: Add GitHub Actions CI

- Priority: `P0`
- Owner: `TL`
- Estimate: `1 day`
- Dependencies: Stories 3-7
- Description:
- create CI workflow
- run install, lint, typecheck, tests
- Acceptance Criteria:
- CI runs on pull requests
- failure blocks merge

## Story 12: Add Basic Testing Frameworks

- Priority: `P1`
- Owner: `BE`, `FE`, `QA`
- Estimate: `1 day`
- Dependencies: Stories 3-6
- Description:
- add unit test framework for API
- add test framework for web
- Acceptance Criteria:
- sample tests pass in CI

## Story 13: Create Supabase Local Development Structure

- Priority: `P1`
- Owner: `BE`
- Estimate: `1 day`
- Dependencies: Story 8
- Description:
- add `supabase/` folder structure
- add migrations and seed placeholders
- Acceptance Criteria:
- migration workflow documented

## Story 14: Add Base Design System Foundation

- Priority: `P1`
- Owner: `FE`, `UX`
- Estimate: `1.5 days`
- Dependencies: Story 5
- Description:
- define typography, spacing, colors, layout primitives
- create initial UI primitives
- Acceptance Criteria:
- shared UI package contains first reusable components

## Story 15: Add API Health and App Connectivity Check

- Priority: `P1`
- Owner: `BE`, `FE`
- Estimate: `0.5 day`
- Dependencies: Stories 3, 4
- Description:
- add a simple frontend-to-backend connectivity check
- Acceptance Criteria:
- web app can read API health response

## Story 16: Define Root README and Setup Guide

- Priority: `P1`
- Owner: `FS`
- Estimate: `0.5 day`
- Dependencies: Stories 2-10
- Description:
- document local setup
- document required tools and scripts
- Acceptance Criteria:
- a new developer can start the project using README alone

## Story 17: Define Branching and Merge Rules in Repo Docs

- Priority: `P1`
- Owner: `TL`
- Estimate: `0.5 day`
- Dependencies: Story 1
- Description:
- document trunk-based workflow
- define branch naming
- define merge expectations
- Acceptance Criteria:
- contribution rules are written and visible in repo docs

## Story 18: Add Monitoring/Error Tracking Placeholder

- Priority: `P2`
- Owner: `TL`, `FS`
- Estimate: `0.5 day`
- Dependencies: Stories 3, 4
- Description:
- add initial monitoring integration placeholders
- Acceptance Criteria:
- instrumentation path decided and documented

## Story 19: Sprint Review Demo Preparation

- Priority: `P2`
- Owner: `PL`, `TL`
- Estimate: `0.5 day`
- Dependencies: all major Sprint 1 stories
- Description:
- prepare end-of-sprint demo flow
- Acceptance Criteria:
- demo checklist exists

## Story 20: Sprint 2 Planning Preparation

- Priority: `P1`
- Owner: `TL`, `PL`
- Estimate: `0.5 day`
- Dependencies: Sprint 1 progress
- Description:
- refine backlog for tenant/auth phase
- Acceptance Criteria:
- Sprint 2 draft backlog ready before Sprint 1 close

## 9. Sprint 1 Suggested Capacity Split

- `TL`: Stories 1, 2, 6, 9, 11, 17
- `FE`: Stories 3, 14, 15
- `BE`: Stories 4, 10, 13, 15
- `FS`: Stories 5, 6, 7, 10, 16, 18
- `QA`: Story 12, Sprint review support
- `UX`: Story 14, product consistency support

## 10. Recommended Immediate Next Actions

1. Run the Phase 0 kickoff sessions.
2. Finalize tenant model and role matrix before writing Sprint 2 tickets.
3. Approve this Sprint 1 backlog.
4. Create the board in your tracker using the 20 stories above.
5. Start Sprint 1 immediately after Phase 0 exit criteria are met.
