# ExamCraft Tenant Model and MVP Role Matrix

## Purpose

This document finalizes the tenant model and MVP role matrix for the first build of `ExamCraft`.

It is the working source of truth for:

- tenant isolation decisions
- institution ownership boundaries
- role definitions
- permission grouping
- onboarding and invite ownership rules

## Tenant Model

### Tenant Unit

The primary tenant in MVP is the `institution`.

Each institution represents an isolated customer workspace with:

- its own users
- its own academic structure
- its own question banks
- its own institution templates
- its own papers
- its own approvals
- its own analytics and audit records
- its own branding and settings

### Tenant Isolation Rules

- Every functional business record is scoped to `institution_id` unless it is explicitly platform-owned.
- Tenant-scoped reads and writes must always be filtered by the authenticated user's active institution membership.
- Cross-institution access is not allowed in MVP.
- Tenant boundaries are enforced in the backend, not only in the frontend.

### Platform-Owned Data

The following records can exist outside tenant ownership:

- platform configuration
- global template library records
- platform roles and permission definitions
- subscription plan definitions
- super admin operations data

### Branches and Departments

Campuses, branches, and departments are not separate tenants in MVP.

They are child entities inside an institution tenant. This keeps the first release simpler while still supporting colleges, schools, and multi-branch coaching institutes.

### Templates

The template model has two layers:

1. Global templates
2. Institution templates

Global templates are platform-managed, read-only defaults.

Institution templates are tenant-owned and can be:

- created from scratch
- cloned from global templates
- customized for departments

## MVP Role Model

### Platform Role

- `super_admin`

### Institution Roles

- `institution_admin`
- `academic_head`
- `faculty`
- `reviewer_approver`

### Role Principles

- A user can belong to one or more institutions if this is needed later, but MVP should optimize for one active institution context at a time.
- A user can hold multiple roles inside the same institution when required.
- Permissions are granted through role-permission mapping, not hardcoded in the UI.
- The backend remains the source of truth for authorization.

## Role Responsibilities

### `super_admin`

Platform operator with cross-tenant access for support and governance.

Responsibilities:

- manage platform-level settings
- manage global template library
- view tenant health and usage
- provision or suspend institution tenants
- manage subscription plan definitions

### `institution_admin`

Primary owner of an institution workspace.

Responsibilities:

- manage institution profile and branding
- invite and manage institution users
- manage institution settings
- manage academic structure
- publish approved papers
- view institution analytics and audit activity

### `academic_head`

Academic leadership role such as HOD or coordinator.

Responsibilities:

- oversee question and template quality
- review submitted papers
- approve or reject papers
- monitor department readiness and coverage

### `faculty`

Primary content creation role.

Responsibilities:

- create and edit questions
- import question data
- create institution templates
- generate draft papers
- edit draft papers
- submit papers for review

### `reviewer_approver`

Dedicated reviewer role for review and approval workflow.

Responsibilities:

- review submitted papers
- add review notes
- approve or reject papers

## MVP Permission Groups

The following permission groups should exist in the first authorization model:

- `institution.manage`
- `users.invite`
- `users.manage`
- `academic_structure.manage`
- `questions.create`
- `questions.edit`
- `questions.import`
- `templates.create`
- `templates.edit`
- `global_templates.read`
- `papers.generate`
- `papers.edit_draft`
- `papers.submit`
- `papers.review`
- `papers.approve`
- `papers.reject`
- `papers.publish`
- `exports.generate`
- `analytics.read`
- `audit.read`

## Recommended MVP Role-Permission Matrix

### `super_admin`

- full platform authority
- global template management
- subscription and tenant operations

### `institution_admin`

- `institution.manage`
- `users.invite`
- `users.manage`
- `academic_structure.manage`
- `global_templates.read`
- `papers.review`
- `papers.approve`
- `papers.reject`
- `papers.publish`
- `exports.generate`
- `analytics.read`
- `audit.read`

### `academic_head`

- `academic_structure.manage`
- `questions.create`
- `questions.edit`
- `templates.create`
- `templates.edit`
- `global_templates.read`
- `papers.generate`
- `papers.edit_draft`
- `papers.submit`
- `papers.review`
- `papers.approve`
- `papers.reject`
- `exports.generate`
- `analytics.read`

### `faculty`

- `questions.create`
- `questions.edit`
- `questions.import`
- `templates.create`
- `templates.edit`
- `global_templates.read`
- `papers.generate`
- `papers.edit_draft`
- `papers.submit`
- `exports.generate`

### `reviewer_approver`

- `global_templates.read`
- `papers.review`
- `papers.approve`
- `papers.reject`
- `exports.generate`

## Workflow Ownership Rules

- The first user created for a new institution becomes the default `institution_admin`.
- Only `institution_admin` can invite new users in MVP.
- `faculty` can create draft papers and submit them for review, but cannot publish.
- `academic_head`, `reviewer_approver`, and `institution_admin` can review and approve or reject submitted papers.
- Only `institution_admin` publishes final papers in MVP by default.
- Only `super_admin` creates and manages global templates.

## Implemented MVP Workspaces

The current implemented role-aware surfaces are:

- dashboard selection based on authenticated memberships and role priority
- `institution_admin` workspace for institution team visibility and invite creation
- `faculty` workspace for question creation and template creation

The remaining roles currently use role-aware dashboard shells with permission summaries and can be expanded incrementally.

## Deferred Items

These are intentionally deferred beyond MVP:

- student role
- parent role
- configurable custom roles in tenant UI
- branch-level delegated administration
- SSO
- billing self-service

## Final Recommendation

The MVP should ship with a fixed but extensible permission model.

This gives the team:

- simpler implementation
- safer authorization behavior
- easier testing
- faster delivery for pilot institutions

Later releases can expand this into a more configurable access-control system without changing the core tenant boundary.
