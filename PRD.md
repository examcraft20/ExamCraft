# ExamCraft Product Requirements Document

## 1. Purpose

This PRD defines the new `ExamCraft` product as a greenfield SaaS platform for educational institutions. It assumes the old codebase will be retired rather than extended.

The new product must:

- start from a clean architectural baseline
- use free tiers wherever possible in the initial stage
- support multiple institutions from one platform
- enforce tenant isolation and role-based access
- be commercially viable as a sellable SaaS product

## 2. Product Overview

- Product name: `ExamCraft`
- Product type: multi-tenant full-stack SaaS platform for academic assessment and exam operations
- Target users: tuition centers, colleges, schools, department heads, academic coordinators, faculty, administrators, reviewers, and later students

### Core Vision

Build a modern SaaS platform that helps educational institutions manage question banks, academic structures, exam templates, paper generation, approval workflows, analytics, and institution-level operations from one scalable system.

### Primary Business Goal

Create a commercially viable product that can serve multiple institutions as separate tenants, each with its own branding, users, settings, permissions, and isolated data.

## 3. Product Goals

- support multiple institutions from one platform
- provide institution-specific configuration and branding
- offer role-based workflows for academic teams
- enable strong question-bank and assessment management
- support approval-driven paper generation and controlled publishing
- add analytics, auditability, and operational reporting
- create a base for future modules such as student portals, fees, attendance, and LMS integrations

## 4. Target Market

### Phase 1

- colleges and higher education departments
- tuition/coaching centers running frequent test series

### Phase 2

- schools with structured internal exam workflows
- multi-branch coaching institutes
- university-affiliated institutions

## 5. Core Modules

### A. Multi-Tenant Institution Management

- institution onboarding
- tenant isolation
- institution branding
- institution-specific academic settings
- plan/usage control
- usage tracking

### B. User and Access Management

- invite-based onboarding
- role and permission matrix
- user activation/deactivation
- password reset
- future SSO readiness

### C. Academic Structure Management

- institutions
- campuses / branches
- departments
- courses
- batches / classes
- semesters / terms
- subjects
- academic year / session

### D. Question Bank

- manual question entry
- bulk upload via Excel/CSV
- media/image support
- difficulty tagging
- topic/unit tagging
- CO/PO/learning outcome mapping
- question lifecycle/status
- duplicate detection
- version history
- question usage history

### E. Paper Blueprint and Template System

- exam pattern builder
- section-wise mark distribution
- difficulty distribution rules
- subject/topic coverage rules
- reusable templates
- institution-wide and department-wide templates
- versioned templates

### F. Paper Generation Workflow

- auto-generate from blueprint
- manual review/edit before finalization
- save drafts
- regenerate selected sections
- export PDF/DOCX
- branded institution header/footer
- paper ID and audit metadata

### G. Approval Workflow

- draft -> submitted -> approved -> rejected -> published
- review notes
- reviewer assignment
- approval history
- final-lock publishing flow

### H. Analytics and Reporting

- question-bank coverage
- difficulty balance
- subject/unit coverage
- faculty contribution
- approval turnaround time
- paper generation trends
- institution usage statistics
- exportable reports

### I. AI-Assisted Features

- syllabus-to-question generation
- suggest question improvements
- difficulty rebalance suggestions
- duplicate/similarity detection
- topic extraction
- outcome tagging assistance

### J. Platform Administration

- subscription plans
- tenant provisioning
- support dashboard
- audit logs
- feature flags
- monitoring and alerts

## 6. Global Template Library

A major improvement in the new `ExamCraft` is the `Global Template Library`, a centralized repository of predefined academic paper templates that institutions can use immediately without starting from scratch.

### Purpose

- give users instant access to standardized paper formats
- reduce setup time for institutions
- improve consistency in exam paper structure
- support recognized board/university patterns
- increase product usability and adoption for first-time customers

### Example Categories

- CBSE-style school paper formats
- state board paper patterns
- university-specific formats
- college internal assessment templates
- unit test templates
- mid-semester formats
- end-semester exam templates
- coaching center test-series formats
- objective + subjective mixed papers
- practical/oral/viva templates
- outcome-based education templates
- department-customizable base templates

### Key Features

- read-only default templates provided by the platform
- search and filter by board, university, exam type, institution type, subject stream, and marks pattern
- preview template before using it
- clone template into institution workspace
- customize cloned template locally without affecting the global version
- version tracking for template updates
- recommended templates based on institution type during onboarding

## 7. Free-Tier-First Strategy

The initial product must be designed to launch on free tiers wherever practical.

### Goals

- reduce initial burn
- accelerate pilot launches
- validate product-market fit before infrastructure spend
- preserve clean upgrade paths later

## 8. MVP Scope

The first version of `ExamCraft` should include:

- multi-tenant institution setup
- user roles and invites
- subject/department setup
- question bank with bulk import
- template builder
- Global Template Library
- ability to clone standardized templates
- paper generation
- approval workflow
- PDF/DOCX export
- basic analytics
- audit log

## 9. Transition Guidance

### Carry Forward

- proven workflows
- validated UX concepts
- reusable business rules
- export/reporting concepts
- product learnings

### Do Not Carry Forward Blindly

- single-tenant shortcuts
- inconsistent naming
- ad hoc schema assumptions
- frontend-heavy workflow enforcement

## 10. Final Conclusion

The new `ExamCraft` must be built as a fresh, free-tier-first, multi-tenant SaaS platform for educational institutions. It should preserve the strongest ideas from the current prototype while replacing its limitations with clean architecture, strong role-based access, reliable tenant isolation, and a platform-grade template and assessment workflow system.
