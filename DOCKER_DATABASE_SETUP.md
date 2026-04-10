# ExamCraft Docker Database Setup Guide

This guide explains how to use Docker to run a local Supabase database for ExamCraft, integrating seamlessly with VS Code's Docker extension.

---

## 📋 Prerequisites

### 1. Install Docker Desktop

**Windows:**
- Download: https://www.docker.com/products/docker-desktop
- Install and restart your computer
- Verify Docker is running (check system tray)

**Verify Installation:**
```powershell
docker --version
docker compose version
```

### 2. Install VS Code Docker Extension

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "Docker"
4. Install the official **Docker** extension by Microsoft
5. Reload VS Code

---

## 🚀 Quick Start (Recommended)

### **Option 1: Automatic Start with Application**

Start database and application together:
```powershell
pnpm dev:with-db
```

This command:
1. Starts Supabase database via Docker
2. Waits for database to be ready
3. Starts frontend and backend servers

### **Option 2: Manual Control**

**Step 1: Start Database**
```powershell
pnpm db:start
```

**Step 2: Apply Migrations** (First time only)
```powershell
pnpm db:migrate
```

**Step 3: Seed Test Data** (Optional)
```powershell
pnpm seed
```

**Step 4: Switch to Database Mode**

Update `apps/web/.env.local`:
```env
NEXT_PUBLIC_DEMO_MODE=false
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
```

Update `apps/api/.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
API_PORT=4000
```

**Step 5: Start Application**
```powershell
pnpm dev
```

---

## 🎯 Using VS Code Docker Extension

### **View Containers**

1. Click the **Docker** icon in the left sidebar
2. Expand **Containers** to see running services:
   - `examcraft-db` (PostgreSQL)
   - `examcraft-auth` (Authentication)
   - `examault-studio` (Web UI)
   - `examcraft-kong` (API Gateway)
   - `examcraft-rest` (REST API)
   - `examcraft-meta` (Database Metadata)

### **Start/Stop Containers**

**Via VS Code UI:**
1. Right-click on any container
2. Select **Start**, **Stop**, or **Restart**

**Via Terminal:**
```powershell
# Start all containers
pnpm db:start

# Stop all containers
pnpm db:stop

# Restart all containers
pnpm db:restart
```

### **View Logs**

**Via VS Code UI:**
1. Right-click on a container
2. Select **View Logs**

**Via Terminal:**
```powershell
# View all logs
pnpm db:logs

# View specific service logs
docker compose logs -f db
docker compose logs -f auth
```

### **Access Database Directly**

**Via VS Code UI:**
1. Right-click on `examcraft-db` container
2. Select **Attach Shell**
3. Run PostgreSQL commands:
   ```bash
   psql -U postgres -d postgres
   ```

**Via Terminal:**
```powershell
docker exec -it examcraft-db psql -U postgres -d postgres
```

---

## 📊 Service URLs

| Service | URL | Description |
|---------|-----|-------------|
| **Supabase API Gateway** | http://localhost:54321 | Main API endpoint |
| **Supabase Studio** | http://localhost:54323 | Database management UI |
| **PostgreSQL** | localhost:54322 | Direct database access |
| **Auth Service** | http://localhost:9999 | Authentication API |
| **REST API** | http://localhost:3001 | PostgREST API |
| **Meta Service** | http://localhost:8080 | Database metadata |

---

## 🛠️ Database Management Commands

### **Common Commands**

```powershell
# Check database status
pnpm db:status

# Start database
pnpm db:start

# Stop database (preserves data)
pnpm db:stop

# Restart database
pnpm db:restart

# View logs
pnpm db:logs

# Apply migrations
pnpm db:migrate

# Reset database (WARNING: deletes all data!)
pnpm db:reset

# Start app with database
pnpm dev:with-db
```

### **Docker Compose Commands**

```powershell
# View container status
docker compose ps

# Start services
docker compose up -d

# Stop services
docker compose down

# Stop and remove volumes (deletes data!)
docker compose down -v

# Rebuild services
docker compose up -d --build

# View logs
docker compose logs -f [service-name]
```

---

## 🔄 Workflow Examples

### **Daily Development Workflow**

```powershell
# 1. Start everything (database + app)
pnpm dev:with-db

# 2. Work on your features...

# 3. Stop everything when done
pnpm db:stop
```

### **Fresh Start (Clear Everything)**

```powershell
# 1. Stop and delete all data
docker compose down -v

# 2. Start fresh
pnpm db:start

# 3. Apply migrations
pnpm db:migrate

# 4. Seed test data
pnpm seed

# 5. Start application
pnpm dev
```

### **Switch Between Demo and Database Mode**

**To Database Mode:**
```powershell
# 1. Start database
pnpm db:start

# 2. Update .env.local files (set NEXT_PUBLIC_DEMO_MODE=false)

# 3. Restart application
pnpm dev
```

**To Demo Mode:**
```powershell
# 1. Stop database (optional)
pnpm db:stop

# 2. Update .env.local files (set NEXT_PUBLIC_DEMO_MODE=true)

# 3. Restart application
pnpm dev
```

---

## 🐛 Troubleshooting

### **Docker Not Running**

**Error:** `Cannot connect to the Docker daemon`

**Solution:**
1. Open Docker Desktop
2. Wait for it to start (green icon in system tray)
3. Verify: `docker info`

### **Port Already in Use**

**Error:** `Port 54321 is already in use`

**Solution:**
```powershell
# Kill processes on ports
npx kill-port 54321 54322 54323 9999

# Restart database
pnpm db:restart
```

### **Database Not Responding**

**Solution:**
```powershell
# Check container status
docker compose ps

# View logs for errors
docker compose logs db

# Restart database
pnpm db:restart
```

### **Migrations Failed**

**Solution:**
```powershell
# Reset database
pnpm db:reset

# Reapply migrations
pnpm db:migrate
```

### **Containers Won't Start**

**Solution:**
```powershell
# Stop everything
docker compose down

# Remove volumes
docker compose down -v

# Pull latest images
docker compose pull

# Start fresh
pnpm db:start
```

---

## 📁 Project Structure

```
ExamCraft/
├── docker-compose.yml          # Docker configuration
├── scripts/
│   ├── db-start.js             # Start database script
│   ├── db-stop.js              # Stop database script
│   └── db-migrate.js           # Apply migrations script
├── supabase/
│   ├── kong.yml                # API Gateway configuration
│   ├── vector.yml              # Logging configuration
│   ├── config.toml             # Supabase configuration
│   └── migrations/             # Database migrations
└── apps/
    ├── web/.env.local          # Frontend environment
    └── api/.env.local          # Backend environment
```

---

## 🔐 Default Credentials

### **Database**
- **Host:** localhost
- **Port:** 54322
- **Database:** postgres
- **User:** postgres
- **Password:** postgres

### **Supabase**
- **URL:** http://localhost:54321
- **Anon Key:** `sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH`
- **Service Role Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU`

---

## 💡 Tips

### **Auto-Start Database with VS Code**

Create a VS Code task to auto-start database:

1. Create `.vscode/tasks.json`:
```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Start ExamCraft Database",
      "type": "shell",
      "command": "pnpm db:start",
      "problemMatcher": [],
      "presentation": {
        "reveal": "always",
        "panel": "new"
      }
    }
  ]
}
```

2. Run with: **Terminal → Run Task → Start ExamCraft Database**

### **VS Code Database Client**

Install **PostgreSQL** extension by Microsoft to connect directly to the database:

1. Install extension
2. Click **PostgreSQL** in sidebar
3. Add connection:
   - Host: localhost
   - Port: 54322
   - Database: postgres
   - User: postgres
   - Password: postgres

### **Performance Optimization**

If Docker is slow on Windows:
1. Open Docker Desktop Settings
2. Go to **Resources**
3. Increase:
   - CPUs: 4+
   - Memory: 8GB+
   - Swap: 2GB+

---

## 📚 Additional Resources

- **Docker Documentation:** https://docs.docker.com/
- **Supabase Documentation:** https://supabase.com/docs
- **PostgreSQL Documentation:** https://www.postgresql.org/docs/

---

## ✅ Verification Checklist

After starting the database, verify:

- [ ] Docker Desktop is running
- [ ] All containers are running (`pnpm db:status`)
- [ ] Supabase Studio accessible (http://localhost:54323)
- [ ] Migrations applied (`pnpm db:migrate`)
- [ ] Environment variables updated (DEMO_MODE=false)
- [ ] Application connects to database
- [ ] Can login and see real data

---

**Need Help?** Check the troubleshooting section or create an issue on GitHub.
