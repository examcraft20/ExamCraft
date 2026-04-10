# 🐳 ExamCraft Docker Database - Quick Reference

## 🚀 Getting Started (3 Steps)

```powershell
# 1. Start database
pnpm db:start

# 2. Apply migrations (first time only)
pnpm db:migrate

# 3. Start app with database
pnpm dev:with-db
```

---

## 📋 Essential Commands

| Command | Description |
|---------|-------------|
| `pnpm db:start` | Start database |
| `pnpm db:stop` | Stop database |
| `pnpm db:restart` | Restart database |
| `pnpm db:status` | Check status |
| `pnpm db:logs` | View logs |
| `pnpm db:migrate` | Apply migrations |
| `pnpm db:reset` | Reset (deletes data!) |
| `pnpm dev:with-db` | Start app + database |

---

## 🌐 Service URLs

- **Supabase Studio:** http://localhost:54323
- **API Gateway:** http://localhost:54321
- **PostgreSQL:** localhost:54322

---

## 🔑 Environment Setup

**Set `NEXT_PUBLIC_DEMO_MODE=false` in:**
- `apps/web/.env.local`
- `apps/api/.env.local`

**Use these credentials:**
```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 💻 VS Code Integration

**Run Tasks:** Ctrl+Shift+P → "Run Task"
- 🚀 Start Database
- ⚡ Dev with Database
- 📊 Database Status
- 🔍 View Database Logs

**Docker Extension:**
- View containers in left sidebar
- Right-click to start/stop/restart
- View logs with one click

---

## 🐛 Troubleshooting

**Docker not running?**
```powershell
# Open Docker Desktop first
docker info
```

**Port in use?**
```powershell
npx kill-port 54321 54322 54323
pnpm db:restart
```

**Need fresh start?**
```powershell
docker compose down -v
pnpm db:start
pnpm db:migrate
pnpm seed
```

---

## 📚 Full Documentation

See [DOCKER_DATABASE_SETUP.md](DOCKER_DATABASE_SETUP.md) for complete guide.
