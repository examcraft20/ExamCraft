# ExamCraft - Multi-Tenant Exam Management Platform
SaaS platform for Managing question banks, exam templates, paper generation, and analytics.

## Quick Start
1. `pnpm install`
2. `cp apps/web/.env.example apps/web/.env.local` (Update Supabase keys).
3. `pnpm seed`
4. `pnpm dev` (Frontend: `:3000`, Backend: `:4000`).

## Tech Stack
- **Frontend**: Next.js 14, React 18, Tailwind CSS, TypeScript.
- **Backend**: NestJS 10, Supabase (Postgres + Auth).
- **Core Features**: Multi-tenancy (RLS), RBAC (5 roles), Question Bank, Exam Blueprints, Approval Workflows, PDF Export.

## Project Structure
- `apps/api`: NestJS domain-modular backend.
- `apps/web`: Next.js App Router (role-based workspaces).
- `packages/*`: Shared `ui`, `types`, and `sdk`.
- `supabase/migrations`: Database schema and RLS policies.

## Status: 100% MVP Complete
All core modules—Foundation, Academic Structure, Question Bank, Templates, Paper Generation, Approvals, PDF Export, and Analytics—are complete.

## Development Workflow
- **Rules**: Conventional Commits, Feature Branching, 80%+ Test Coverage.
- **Commands**: `pnpm build`, `pnpm test`, `pnpm lint`, `pnpm clean`.
- **Health**: `/api/v1/health` (basic) and `/api/v1/health/ready` (system-wide).
