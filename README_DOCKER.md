# 🐳 ExamCraft - Docker Database Integration

## Quick Start

### **Option 1: Interactive Setup Wizard (Recommended for First Time)**

```powershell
pnpm db:setup
```

This wizard will:
- ✅ Check if Docker is installed
- ✅ Verify Docker is running
- ✅ Check database status
- ✅ Guide you through setup options

---

### **Option 2: Manual Setup (3 Steps)**

```powershell
# Step 1: Start database
pnpm db:start

# Step 2: Apply migrations (first time only)
pnpm db:migrate

# Step 3: Start application with database
pnpm dev:with-db
```

That's it! Your application will now use the real database instead of demo mode.

---

## 📖 Documentation

- **[DOCKER_QUICK_REFERENCE.md](DOCKER_QUICK_REFERENCE.md)** - Quick command reference
- **[DOCKER_DATABASE_SETUP.md](DOCKER_DATABASE_SETUP.md)** - Complete setup guide with troubleshooting

---

## 🎯 VS Code Integration

### **Using VS Code Tasks**

1. Press `Ctrl+Shift+P`
2. Type "Run Task"
3. Select from available tasks:
   - 🚀 Start Database
   - ⚡ Dev with Database
   - 📊 Database Status
   - 🔍 View Database Logs
   - 🛑 Stop Database

### **Using Docker Extension**

1. Install the **Docker** extension by Microsoft
2. Click the Docker icon in the left sidebar
3. View and manage containers visually:
   - Right-click to start/stop/restart
   - View logs with one click
   - Attach shell to database

---

## 🔑 Switch Between Demo and Database Mode

### **To Use Database:**

1. Start database: `pnpm db:start`
2. Update environment variables:

**`apps/web/.env.local`:**
```env
NEXT_PUBLIC_DEMO_MODE=false
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
```

**`apps/api/.env.local`:**
```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
```

3. Restart application: `pnpm dev`

### **To Use Demo Mode (No Database):**

1. Set `NEXT_PUBLIC_DEMO_MODE=true` in both `.env.local` files
2. Restart application: `pnpm dev`
3. Database not required!

---

## 📊 Service URLs

| Service | URL | Description |
|---------|-----|-------------|
| **Application** | http://localhost:3000 | Main web app |
| **Backend API** | http://localhost:4000 | NestJS API |
| **Supabase Studio** | http://localhost:54323 | Database UI |
| **API Gateway** | http://localhost:54321 | Supabase API |
| **PostgreSQL** | localhost:54322 | Direct DB access |

---

## 🛠️ Common Commands

```powershell
# Database Management
pnpm db:start          # Start database
pnpm db:stop           # Stop database
pnpm db:restart        # Restart database
pnpm db:status         # Check status
pnpm db:logs           # View logs
pnpm db:migrate        # Apply migrations
pnpm db:reset          # Reset (deletes data!)

# Development
pnpm dev               # Start app only (uses current mode)
pnpm dev:with-db       # Start app + database together
pnpm dev:fresh         # Kill ports and restart

# Data
pnpm seed              # Seed test data
pnpm db:setup          # Interactive setup wizard
```

---

## 🐛 Troubleshooting

### **Docker Not Running**
```powershell
# Open Docker Desktop first
# Then verify:
docker info
```

### **Port Conflicts**
```powershell
# Kill processes on ports
npx kill-port 54321 54322 54323

# Restart database
pnpm db:restart
```

### **Fresh Start**
```powershell
# Stop and delete everything
docker compose down -v

# Start fresh
pnpm db:start
pnpm db:migrate
pnpm seed
pnpm dev
```

---

## 📁 Files Created

| File | Purpose |
|------|---------|
| `docker-compose.yml` | Docker services configuration |
| `supabase/kong.yml` | API Gateway routing |
| `supabase/vector.yml` | Logging configuration |
| `scripts/db-start.js` | Start database script |
| `scripts/db-stop.js` | Stop database script |
| `scripts/db-migrate.js` | Apply migrations script |
| `scripts/setup-database.ps1` | Interactive setup wizard |
| `.vscode/tasks.json` | VS Code tasks |
| `.dockerignore` | Docker build optimizations |

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Docker Desktop is running
- [ ] Database containers running (`pnpm db:status`)
- [ ] Supabase Studio accessible (http://localhost:54323)
- [ ] Migrations applied (`pnpm db:migrate`)
- [ ] Environment variables set (DEMO_MODE=false)
- [ ] Application connects successfully
- [ ] Can login and see data

---

## 🎓 Learning Resources

- **Docker Basics:** https://docs.docker.com/get-started/
- **Supabase Docs:** https://supabase.com/docs
- **PostgreSQL Tutorial:** https://www.postgresqltutorial.com/

---

## 💡 Tips

### **Auto-Start Database**
Add to your VS Code workspace settings to auto-start database on project open.

### **Database GUI**
Install **pgAdmin** or use **Supabase Studio** (http://localhost:54323) for visual database management.

### **Backup Data**
```powershell
# Export database
docker exec examcraft-db pg_dump -U postgres postgres > backup.sql

# Import database
docker exec -i examcraft-db psql -U postgres postgres < backup.sql
```

---

**Need Help?** See [DOCKER_DATABASE_SETUP.md](DOCKER_DATABASE_SETUP.md) for complete documentation.
