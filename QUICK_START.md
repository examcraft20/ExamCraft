# ExamCraft Quick Start

## Fast Setup
Get up and running with the full feature set:
1. `pnpm install`
2. `pnpm db:setup` (Guided setup)
3. `pnpm dev`
4. Visit `http://localhost:3000`.

## Architecture Note
ExamCraft is designed for production readiness. It requires a local Docker environment for the database and authentication services to function correctly. No "mock" or "demo" mode is supported to ensure environment parity.

## Essential Commands
- `pnpm dev`: Start both services.
- `pnpm build`: Compile all packages.
- `pnpm test`: Execute comprehensive test suite.
- `pnpm format`: Apply Prettier formatting.
- `pnpm typecheck`: Run TypeScript validation.

## Architecture
- **Web**: Next.js 14.
- **API**: NestJS + Supabase.
- **Shared**: Common types and UI components.
