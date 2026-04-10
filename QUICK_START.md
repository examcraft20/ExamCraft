# ExamCraft - Quick Start Guide

## Running the Project

### Prerequisites
- **Node.js** ≥ 18.13 (v20 recommended)
- **pnpm** ≥ 9.15 - [Install pnpm](https://pnpm.io/installation)

### Quick Start (Demo Mode)

The project runs in **demo mode by default** - no database setup needed:

```bash
# 1. Install dependencies
pnpm install

# 2. Start development servers (frontend + backend together)
pnpm dev
```

**Application URLs:**
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:4000
- **API Docs:** http://localhost:4000/api/docs

---

## Individual Commands

If you want to run parts separately:

```bash
# Start only frontend (Next.js)
cd apps/web && pnpm dev

# Start only backend (NestJS) in another terminal
cd apps/api && pnpm dev

# Build all packages
pnpm build

# Run linter
pnpm lint

# Run tests
pnpm test

# Format code with Prettier
pnpm format
```

---

## ❓ Do We Need Supabase?

**No, not for basic development!**

The project runs in **demo mode by default**, which means:
- ✅ All UI components work
- ✅ Mock data is built-in
- ✅ You can test flows immediately
- ✅ No database setup required

### When you'd need Supabase:
Only if you want to:
- Test real database operations
- Test actual authentication with real credentials
- Connect to production or persistent data
- Run integration tests against a real database

---

## Using Real Supabase (Optional)

To connect to a real database instead of demo mode:

1. Create a Supabase project at https://supabase.com
2. Copy your credentials from Project Settings → API
3. Update `.env.local` with your credentials:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   DATABASE_URL=postgresql://...
   NEXT_PUBLIC_DEMO_MODE=false
   ```
4. Apply migrations: `supabase db push`

---

## Testing the App

For quick validation:

```bash
# Run tests for all packages
pnpm test

# Run E2E tests
pnpm test:e2e

# Type checking
pnpm typecheck
```

---

## Architecture Overview

- **Frontend** (`apps/web`): Next.js 14 + React 18 + Tailwind CSS
- **Backend** (`apps/api`): NestJS + Supabase PostgreSQL
- **Shared** (`packages/`): UI components, types, design tokens
- **Monorepo Manager**: pnpm workspaces + Turbo

---

## Getting Started

```bash
pnpm install
pnpm dev
```

Then visit http://localhost:3000 🚀

Default demo credentials are built-in — you can log in immediately!
