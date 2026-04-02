# ExamCraft

Monorepo for the ExamCraft multi-tenant educational assessment platform.

## Apps

- `apps/web`: Next.js frontend with onboarding, invite acceptance, role-aware dashboards, institution admin workspace, and faculty content workflows
- `apps/api`: NestJS-style backend API for auth, tenant context, onboarding, invitations, institution people management, and question/template content

## Packages

- `packages/ui`: shared UI primitives and theme tokens
- `packages/types`: shared TypeScript contracts
- `packages/config`: shared config references
- `packages/sdk`: placeholder workspace package for future SDK work

## Frontend Styling

- `apps/web` now uses a stable Tailwind v3 plus `globals.css` hybrid stack
- `packages/ui` holds reusable component primitives; `Button`, `Card`, `Input`, `Select`, `Skeleton`, `Avatar`, `Badge`, `Spinner`, and `StatusMessage` are all aligned to the current Tailwind-backed design system surface
- `apps/web/app/globals.css` still owns the product-wide layout language, premium auth shell treatment, dashboard surface utilities, and fallback CSS variables
- the currently implemented UI surface includes landing, auth, invite acceptance, dashboard selection, institution admin team management, faculty authoring, academic head oversight, reviewer readiness, and super admin platform summaries

## Backend and Database

- `apps/api` validates request payloads with Nest `ValidationPipe`
- Supabase migrations in `supabase/migrations` define tenant/auth tables, question/template content tables, and row-level security helper policies
- tenant access in the API is resolved through authenticated membership plus permission mapping

## Testing

- `pnpm --filter @examcraft/api test` runs focused API auth/tenant tests
- `pnpm --filter @examcraft/web test` runs frontend dashboard-role helper tests
- `pnpm test` runs the workspace test pipeline through Turbo

## Getting Started

1. Copy `.env.example` to `.env.local` and fill in values.
2. Install dependencies with `pnpm install`.
3. Apply Supabase migrations in `supabase/migrations`.
4. Run the backend with `pnpm --filter @examcraft/api start`.
5. Run the frontend with `pnpm --filter @examcraft/web dev`.

## Current Notes

- The frontend redesign is active and now uses a stable Tailwind v3-compatible setup, but the app is still intentionally hybrid because page-level layout and branded surface styling remain in `globals.css`.
- Production builds inside OneDrive-backed workspaces can still fail with `.next-build` file-lock issues. Prefer a non-OneDrive workspace for stable `next build` output.
