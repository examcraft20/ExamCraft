# Verify Database Connection

## Quick Methods
1. **Container Status**: Run `pnpm db:status` or `docker compose ps`. Containers should be `Up` or `healthy`.

3. **API Test**: `curl http://localhost:54321/rest/v1/` should return a JSON response (e.g., "Route not found").
4. **Direct DB**: `docker exec -it examcraft-db psql -U postgres -d postgres -c "SELECT version();"`.

## ⭐ Recommended Tools
- **Test Page**: Visit `http://localhost:3000/test-connection` for an automated diagnostic report.
- **Test Script**: Run `pnpm test:db-connection` for an 8-point system health check (Auth, Postgres, Gateway, etc.).

## Troubleshooting
If `pnpm db:status` shows `Exited`, check Docker Desktop is running or try `pnpm db:restart`.
