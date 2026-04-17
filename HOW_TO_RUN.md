# How to Run ExamCraft

## Prerequisites
- `Node.js` ≥ 18.13
- `pnpm` ≥ 9.15 (`npm install -g pnpm@9`)
- `Docker Desktop` (Required for Database Mode)

## Setup Instructions
1. `pnpm install`
2. Ensure Docker is running (`docker info`).
3. Run `pnpm dev:all` — Starts database, applies migrations, seeds data, and starts all services.

### Manual Setup (Step-by-Step)
If you prefer starting services individually:
1. `pnpm db:start` — Starts Supabase, Postgres, and Auth.
2. `pnpm db:migrate` — Apply initial schema.
3. `pnpm test:db-connection` — Verify connection.
4. `pnpm seed` — Create admin accounts and test data.
5. Ensure `apps/web/.env.local` and `apps/api/.env.local` are configured (Run `pnpm db:setup` if unsure).
6. `pnpm dev` — Start all services.
9. Login with: `admin.dtc@examcraft-test.com` / `TestPass@123`.

## Interactive Setup
Run `pnpm db:setup` for a guided wizard that checks Docker and configures the environment.

## Service Reference
- **Frontend**: http://localhost:3000
- **Backend/Docs**: http://localhost:4000/api/docs
- **Supabase Studio**: http://localhost:54323
- **Postgres**: `localhost:54322`

## Key Commands
- **Database**: `pnpm db:start|stop|restart|reset|status|logs`
- **Application**: `pnpm dev` (mode-dependent), `pnpm dev:fresh` (restart ports), `pnpm kill:ports`
- **Maintenance**: `pnpm build`, `pnpm test`, `pnpm lint`, `pnpm check:env`

## Troubleshooting
- **Port Busy**: Run `pnpm kill:ports` then restart.
- **Docker Issues**: Verify `docker info`, then runs `pnpm db:restart`.
- **Auth Service Error**: Run `docker exec -i examcraft-db psql -U postgres -c "INSERT INTO auth.schema_migrations (version) VALUES ('20221208132122');"` and restart the auth container.
