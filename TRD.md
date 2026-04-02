# ExamCraft Technical Requirements Document

## 1. Purpose

This TRD defines the technical architecture, system boundaries, technology direction, data model strategy, and non-functional requirements for the new `ExamCraft` SaaS platform.

It assumes a clean restart. The previous codebase is a product reference, not the technical baseline.

## 2. Technical Objectives

The new `ExamCraft` must:

- support true multi-tenancy
- centralize business logic in a dedicated backend
- enforce tenant isolation and role-based access consistently
- provide reliable export and approval workflows
- start on free tiers where possible without creating migration pain later
- remain scalable enough to grow into a commercial SaaS platform

## 3. Free-Tier-First Stack Direction

### Frontend

- Next.js with modern app architecture
- TypeScript
- shared component library/design system
- responsive admin-first UI
- accessibility baseline

### Backend

- Node.js backend layer required
- preferred framework: NestJS
- acceptable alternatives: Express or Fastify
- REST API by default, GraphQL optional later

### Database and Auth

- Supabase free tier initially
- PostgreSQL as the primary system of record
- Supabase Auth for email/password, session management, invites, and password reset

### Storage

- Supabase Storage free tier initially for uploads and exports

### Hosting and Deployment

- Vercel free tier initially for frontend
- Supabase managed project for DB/Auth/Storage
- GitHub Actions for CI on free tier initially

### AI Layer

- usage-controlled AI integration with strict quotas
- provider abstraction so AI vendor can change later without major rewrites

## 4. System Architecture Requirements

### 4.1 Multi-Tenancy

The platform must support many institutions from one codebase and deployment while preserving:

- data isolation
- branding isolation
- settings isolation
- user/permission isolation
- tenant-level usage metrics

Every functional record must be tenant-scoped unless explicitly global.

### 4.2 Backend Ownership of Business Logic

The backend must own:

- paper generation
- approval state transitions
- template publication/versioning
- audit/event logging
- AI-assisted workflows
- export generation
- usage tracking

### 4.3 Modular Domain Boundaries

The system should be organized into these service domains:

- institution management
- user and access management
- academic structure
- question bank
- template system
- Global Template Library
- paper generation
- approval workflow
- analytics and reporting
- AI services
- platform administration

### 4.4 Asynchronous Processing

Background processing is required for:

- PDF/DOCX export
- AI question generation
- duplicate/similarity detection
- notifications
- report generation
- heavy batch operations

## 5. Core Technical Modules

### A. Multi-Tenant Institution Management

- institution onboarding
- tenant provisioning
- branding configuration
- academic defaults
- subscription/plan context
- usage metering

### B. User and Access Management

- user authentication
- invitations
- role assignment
- permission enforcement
- account lifecycle management
- future SSO support

### C. Academic Structure Management

- departments
- branches/campuses
- courses
- batches/classes
- academic terms
- subjects
- academic year/session

### D. Question Bank

- manual question creation
- bulk Excel/CSV import
- media/image support
- metadata tagging
- lifecycle/status tracking
- duplicate detection
- version history
- usage history

### E. Paper Blueprint and Template System

- exam pattern builder
- section definitions
- difficulty rules
- subject/topic rules
- reusable institution templates
- versioned template management

### F. Global Template Library

- platform-owned predefined templates
- category/tag management
- board/university metadata
- preview and cloning support
- recommendation logic
- version control and update visibility

### G. Paper Generation Workflow

- paper generation from blueprint/template
- manual review/edit support
- draft saving
- section regeneration
- branded export preparation
- audit metadata generation

### H. Approval Workflow

- draft -> submitted -> approved -> rejected -> published lifecycle
- reviewer assignment
- review notes
- approval history
- final-lock publishing rules

### I. Analytics and Reporting

- coverage analysis
- difficulty balance reporting
- faculty contribution reporting
- approval turnaround reporting
- institution usage metrics
- exportable reports

### J. AI-Assisted Services

- syllabus-to-question generation
- question improvement suggestions
- difficulty rebalance suggestions
- duplicate/similarity detection
- topic extraction
- outcome tagging assistance

### K. Platform Administration

- plan/feature control
- support tooling
- audit access
- tenant provisioning controls
- monitoring and alerts

## 6. Data Model Direction

Recommended top-level model:

- `institutions`
- `institution_users`
- `departments`
- `academic_terms`
- `subjects`
- `question_banks`
- `questions`
- `question_versions`
- `templates`
- `template_sections`
- `papers`
- `paper_sections`
- `approval_requests`
- `audit_logs`
- `subscriptions`
- `usage_metrics`

Every functional record should be tenant-scoped.

## 7. Security Requirements

- multi-tenant secure architecture
- strong permission model
- backend-controlled workflow transitions
- tenant-safe data access
- signed access for sensitive files where needed
- least-privilege administration
- comprehensive audit logging for sensitive actions

## 8. Non-Functional Requirements

- scalable to many institutions
- auditability
- export reliability
- mobile-friendly admin UI
- good performance for large question banks
- observability and monitoring
- compliance-ready foundation

## 9. MVP Technical Scope

The MVP should technically deliver:

- multi-tenant institution setup
- role-based access and invites
- academic structure setup
- question bank with bulk import
- template builder
- Global Template Library
- clone-to-tenant template flow
- paper generation
- approval workflow
- PDF/DOCX export
- basic analytics
- audit log

## 10. Final Technical Conclusion

The new `ExamCraft` must be built as a clean, backend-driven, multi-tenant SaaS platform with a free-tier-first stack, normalized tenant-aware data model, reliable workflow orchestration, and a first-class Global Template Library. The previous project should remain a discovery asset only.
