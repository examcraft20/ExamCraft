# ExamCraft Tenant Model and Role Matrix

> **Version:** 2.0 — Updated April 18, 2026  
> **Source of Truth:** [PRD.md §5](../PRD.md#5-user-roles--permissions-rbac) · [Database Migration: auth_tenant_foundation.sql](../supabase/migrations/20260401000100_auth_tenant_foundation.sql)

---

## Purpose

This document defines the tenant isolation model, role hierarchy, and permission matrix for ExamCraft. It serves as the authoritative reference for:

- Tenant isolation boundaries
- Institution ownership rules
- Role definitions and responsibilities
- Permission-to-role assignments
- Onboarding and invitation ownership rules
- Workflow authorization policies

---

## Tenant Model

### Tenant Unit

The primary tenant is the **`institution`**. Each institution is a fully isolated customer workspace containing:

| Resource | Isolation Level |
|---|---|
| Users & memberships | Per-institution |
| Academic structure (departments, courses, batches, subjects) | Per-institution |
| Question banks | Per-institution |
| Institution templates | Per-institution |
| Generated papers | Per-institution |
| Approval/review records | Per-institution |
| Audit logs | Per-institution |
| Branding & settings | Per-institution |
| Subscription & usage metrics | Per-institution |
| Feature flags | Per-institution |

### Tenant Isolation Enforcement

| Layer | Mechanism |
|---|---|
| **Database** | PostgreSQL Row Level Security (RLS) policies on every tenant-scoped table |
| **Application** | `InstitutionContextGuard` validates institution membership and attaches context to every request |
| **API** | Controllers enforce `institutionContext.institutionId` in all service calls |
| **Frontend** | `useInstitution()` hook manages active institution selection and API header injection |

### Isolation Rules

1. Every functional business record is scoped to `institution_id` unless explicitly platform-owned.
2. Tenant-scoped reads and writes MUST be filtered by the authenticated user's active institution membership.
3. Cross-institution access is forbidden — enforced at both database and application layers.
4. Multi-membership is supported: a user can belong to multiple institutions with different roles in each.

### Platform-Owned Data (Not Tenant-Scoped)

| Resource | Owner | Purpose |
|---|---|---|
| Global template library | Platform | Standardized exam patterns available to all institutions |
| Role definitions | Platform | 5 system roles shared across all tenants |
| Permission definitions | Platform | 24 permissions shared across all tenants |
| Subscription plan definitions | Platform | Free, Growth, Enterprise tier configurations |
| Platform audit feed | Platform | Cross-tenant audit activity for super admins |

### Sub-Tenant Hierarchy

Departments, courses, batches, and subjects are **child entities** within an institution tenant — not separate tenants. This supports multi-department institutions while maintaining a single tenant boundary.

```
Institution (Tenant)
  └── Department
        └── Course
              ├── Batch
              └── Subject
```

---

## Role Model

### Platform Role

| Role | Code | Scope | Description |
|---|---|---|---|
| Super Admin | `super_admin` | Platform | Platform operator with full cross-tenant access |

### Institution Roles

| Role | Code | Scope | Description |
|---|---|---|---|
| Institution Admin | `institution_admin` | Institution | Workspace owner — manages users, branding, settings, publishes papers |
| Academic Head | `academic_head` | Institution | Academic leadership — manages structure, creates content, reviews quality |
| Faculty | `faculty` | Institution | Content creator — manages questions, templates, generates papers |
| Reviewer Approver | `reviewer_approver` | Institution | Quality gate — reviews and approves/rejects submitted content |

### Role Assignment Rules

1. The first user of a new institution is automatically assigned `institution_admin`.
2. Only `institution_admin` can invite new users.
3. A user can hold multiple roles within the same institution.
4. Role codes are stored in `institution_user_roles` via `role_id` foreign key.
5. The backend resolves role codes from the database on every authenticated request.

---

## Permission Matrix (24 Permissions)

### Complete Role-Permission Assignment

| Permission | Module | `institution_admin` | `academic_head` | `faculty` | `reviewer_approver` |
|---|---|---|---|---|---|
| `institution.manage` | Institution | ✓ | — | — | — |
| `users.invite` | Users | ✓ | — | — | — |
| `users.manage` | Users | ✓ | — | — | — |
| `academic_structure.manage` | Academic | ✓ | ✓ | — | — |
| `questions.create` | Questions | — | ✓ | ✓ | — |
| `questions.edit` | Questions | — | ✓ | ✓ | — |
| `questions.import` | Questions | — | ✓ | ✓ | — |
| `questions.read` | Questions | ✓ | ✓ | ✓ | ✓ |
| `templates.create` | Templates | — | ✓ | ✓ | — |
| `templates.edit` | Templates | — | ✓ | ✓ | — |
| `templates.read` | Templates | ✓ | ✓ | ✓ | ✓ |
| `global_templates.read` | Global Templates | ✓ | ✓ | ✓ | ✓ |
| `global_templates.clone` | Global Templates | ✓ | ✓ | — | — |
| `papers.generate` | Papers | — | ✓ | ✓ | — |
| `papers.read` | Papers | ✓ | ✓ | ✓ | ✓ |
| `papers.edit_draft` | Papers | — | ✓ | ✓ | — |
| `papers.submit` | Papers | — | ✓ | ✓ | — |
| `papers.review` | Papers | ✓ | ✓ | — | ✓ |
| `papers.approve` | Papers | ✓ | ✓ | — | ✓ |
| `papers.reject` | Papers | ✓ | ✓ | — | ✓ |
| `papers.publish` | Papers | ✓ | — | — | — |
| `exports.generate` | Exports | ✓ | ✓ | ✓ | ✓ |
| `analytics.read` | Analytics | ✓ | ✓ | — | — |
| `audit.read` | Audit | ✓ | — | — | — |
| `ai.use` | AI | — | ✓ | ✓ | — |

> **Note:** `super_admin` has implicit access to all operations without requiring explicit permission assignments.

---

## Workflow Authorization Rules

### Paper Lifecycle

| Action | Authorized Roles |
|---|---|
| Generate draft paper | `academic_head`, `faculty` |
| Edit draft paper | `academic_head`, `faculty` |
| Submit paper for review | `academic_head`, `faculty` |
| Review submitted paper | `institution_admin`, `academic_head`, `reviewer_approver` |
| Approve paper | `institution_admin`, `academic_head`, `reviewer_approver` |
| Reject paper | `institution_admin`, `academic_head`, `reviewer_approver` |
| Publish approved paper | `institution_admin` only |

### Question Lifecycle

| Action | Authorized Roles |
|---|---|
| Create question | `academic_head`, `faculty` |
| Edit question | `academic_head`, `faculty` |
| Bulk import questions | `academic_head`, `faculty` |
| Review/approve question | `institution_admin`, `academic_head`, `reviewer_approver` |
| Archive question | `academic_head`, `faculty` |

### Template Lifecycle

| Action | Authorized Roles |
|---|---|
| Create template | `academic_head`, `faculty` |
| Edit template | `academic_head`, `faculty` |
| Clone global template | `institution_admin`, `academic_head` |
| Review template | `institution_admin`, `academic_head`, `reviewer_approver` |

---

## Implemented Role-Aware Surfaces

The frontend implements dedicated dashboard views for each role:

| Dashboard Route | Role | Key Features |
|---|---|---|
| `/dashboard/institution_admin` | Institution Admin | User management, invitation panel, institution overview |
| `/dashboard/academic_head` | Academic Head | Academic structure management, content oversight |
| `/dashboard/faculty` | Faculty | Question creation, template design, paper generation |
| `/dashboard/reviewer_approver` | Reviewer Approver | Pending review queue, approval actions |
| `/dashboard/super_admin` | Super Admin | Cross-tenant institution directory, platform metrics |

---

## Deferred Items (Phase 4+)

| Item | Status | Notes |
|---|---|---|
| Student role | Planned | Exam schedules, paper delivery, result viewing |
| Parent role | Future | View student progress |
| Custom roles in tenant UI | Future | Admin-configurable role definitions |
| Branch-level delegated admin | Future | Sub-institutional admin scope |
| SSO (SAML/OIDC) | Future | Enterprise authentication |
| Billing self-service | Planned | Stripe/Razorpay integration |

---

## Design Principles

1. **Fixed but extensible** — Ship with a static permission model that can expand without changing core boundaries.
2. **Backend is source of truth** — Authorization decisions are made server-side in NestJS guards, never solely in the UI.
3. **Permission via mapping** — Permissions are granted through role-permission associations, not hardcoded in controllers.
4. **Fail-closed** — Missing context (institution, user, role) always results in access denial, never permissive fallback.
