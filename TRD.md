# ExamCraft Technical Requirements Document

## 1. Technical Objectives
- **Multi-Tenancy**: Consistent data isolation and role-based access control.
- **Centralized Logic**: Backend-driven paper generation, approvals, and exports.
- **Sustainability**: Free-tier-first stack (Vercel, Supabase) with a scalable migration path.

## 2. Technology Stack
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS v3, and `packages/ui` component library.
- **Backend**: Node.js/NestJS providing a REST API and domain orchestration.
- **Persistence**: Supabase for PostgreSQL, Auth, and Object Storage.
- **AI Layer**: Provider-agnostic abstraction for question generation and suggestions.

## 3. System Requirements
- **Tenant Isolation**: Every functional record must be tenant-scoped.
- **Service Domains**: Modular organization including Academic Structure, Question Bank, Approvals, and Analytics.
- **Background Processing**: Asynchronous handling for exports, AI, and batch reports.

## 4. Core Modules
- **Access Management**: invitations, RBAC enforcement, and account lifecycles.
- **Academic Structure**: Campus to session hierarchy management.
- **Content Management**: Question banks (bulk import), Blueprints, and Global Library.
- **Assessment Lifecycle**: Generation from blueprints, multi-stage approval (Draft → Published), and branded exports.
- **AI Services**: Syllabus analysis, question improvement, and topic extraction.

## 5. Security & Performance
- **Security**: Signed file access, tenant-safe RLS, and comprehensive audit logging.
- **NFRs**: Scalable to many institutions, mobile-friendly admin UI, and high performance for large datasets.

## 6. MVP Technical Scope
Includes Multi-tenant setup, RBAC, bulk-import question bank, template builder, generation/approval workflows, PDF export (using `pdfkit` and `docx`), and basic audit logging.

### 6.6 Export Services
The export functionality is handled entirely within the NestJS backend to ensure performance and reliability without relying on heavy headless browsers (like Puppeteer).
- **PDF Export**: Implemented using `pdfkit` to provide pixel-perfect, institution-branded academic papers.
- **DOCX Export**: Implemented using `docx` to allow faculty to download and make manual adjustments in Microsoft Word.
