# ExamCraft Product Requirements Document

## 1. Purpose

This PRD defines the `ExamCraft` product as a modern, multi-tenant SaaS platform for educational institutions. Emerging from its prototype baseline, the platform is now a hardened, production-ready ecosystem designed to streamline and automate the full lifecycle of academic assessments, question banking, and paper generation.

The product must:
- Maintain a robust, scalable architectural baseline (NestJS + Next.js).
- Support multiple institutions effectively from a single platform.
- Enforce rigid tenant data isolation and role-based access control (RBAC).
- Present a cohesive, premium SaaS experience ready for commercial deployment.

## 2. Product Overview

- **Product Name:** `ExamCraft`
- **Product Type:** Multi-tenant full-stack SaaS for academic assessment operations.
- **Target Users:** Tuition centers, colleges, schools, department heads, academic coordinators, faculty, reviewers, administrators, and eventually students.

### Core Vision
Build a modern SaaS platform that replaces manual, error-prone paper assembly with a unified ecosystem enforcing role-based limits, offering AI-assisted syllabus extraction, strict approval workflows, and branded academic exporting.

### Primary Business Goal
Create a commercially resilient product that can scale rapidly across multiple educational institutions as separate tenants—each retaining their isolated branding, user roles, billing subscription tiers, and feature flags.

## 3. Product Features & Modules

### A. Multi-Tenant Institution Management
- Automated institution onboarding and tenant isolation.
- Institution-specific aesthetic branding and system parameters.
- Subscription seat limits and billing tier enforcement.
- Granular platform audit logs tracking all mutations.

### B. User and Access Management
- Secure invite-based onboarding via magic links.
- Sophisticated Role-Based Access Control (RBAC) (Admin, Faculty, Reviewer, etc.).
- Centralized server-side session management.
- Subscription-limited active membership capacity tracking.

### C. Question Bank & Assessment Hub
- Rich manual question entry forms.
- Dynamic bulk upload scaling via CSV arrays.
- Support for complex learning outcome mapping (CO/PO) and taxonomy metrics.
- Version history, duplicate-detection, and collision tracking.

### D. Paper Blueprint Templates
- Section-wise mark distribution schemas.
- Subject scaling and domain coverage metrics.
- An extensive **Global Template Library** enabling fast track cloning of known standardized formats (e.g., CBSE, State Boards, Mid-Semesters).
- Institution-wide isolated custom branches preserving specific academic signatures.

### E. AI-Assisted Operations
- Gemini-powered `Application/PDF` buffer topic extraction.
- Syllabus-to-Question content generation targeting multiple Bloom's taxonomy endpoints.
- AI usage permission flagging to throttle organizational API burn rate limits.

### F. Analytics, Export, and Review Workflows
- Automated Draft -> Submitted -> Approved -> Published pipeline.
- Instant PDF and DOCX exporting featuring branded institution headers/footers.
- Basic platform analytical summaries tracking question saturation and faculty usage.

## 4. Experience and Design Goals

The product presents a cohesive, professional interface across authentication flows, dashboards, and workflow stages. The UX direction prioritizes:
- A premium dark-mode SaaS aesthetic utilizing glassmorphism, responsive gridded skeleton loaders, and modern iconography.
- Predictable visual hierarchies tailored to complex data-heavy academic structures.
- Unified, responsive layouts bridging desktop administrative tools seamlessly to tablet viewport displays.

## 5. Development Strategy & MVP Delivery Status

### Phase 1 to Phase 3 Completion 
ExamCraft has successfully transcended MVP limitations, achieving high production stability:
- **Architecture:** Monolithic services have been broken down, redundant database hooks eradicated via direct PostgreSQL RPC implementations, and dependencies properly hoisted.
- **Security:** CSRF-protected, headless JWT-verified backend. Secrets isolated securely behind environment parameters.
- **DevOps:** CI/CD testing pipelines established, multi-stage Turbo-pruned Dockerfiles generated, and persistent local/production Supabase integrations solidified.
- **UI UX:** Error boundaries stylized natively, loading states smoothed across fallback abstractions, and optimistic cache spoofing plugged securely.

### Outstanding PRD Scope (Phase 4 Roadmap)
While the core framework is highly operational, the following modules remain outstanding deliverables to reach total PRD fulfillment:
1. **Student Portal:** Designing isolated interfaces mapping exam schedules and paper delivery directly to participating candidates.
2. **Department Structure Logic:** Extending the basic isolated entity structures into scalable academic trees linking courses, subjects, and campuses globally.
3. **Template Seeding:** Populating the Global Template Library schemas with actual standardized patterns (CBSE, IB, generic Universities).
4. **Deep Analytics:** Transitioning basic summation endpoints into robust dynamic reporting grids charting approval times, coverage gaps, and individual faculty loads over dedicated timeframes.
