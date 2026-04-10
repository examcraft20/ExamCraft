# 🚀 How to Run ExamCraft - Complete Step-by-Step Guide

## Quick Start

**Choose one mode:**
- **Demo Mode** (Easiest) - No database needed, works immediately
- **Database Mode** (Full Features) - Real database with Docker

---

## 📋 Prerequisites

Before starting, make sure you have:

1. **Node.js** ≥ 18.13 installed
   - Check: `node --version`
   - Download: https://nodejs.org/

2. **pnpm** ≥ 9.15 installed
   - Install: `npm install -g pnpm@9`
   - Check: `pnpm --version`

3. **Docker Desktop** (ONLY for Database Mode)
   - Download: https://www.docker.com/products/docker-desktop
   - Must be running before starting database

---

## 🎯 Option A: Demo Mode (Easiest - No Database)

### **Step 1: Navigate to Project**

```powershell
cd c:\Projects\ExamCraft
```

### **Step 2: Install Dependencies**

```powershell
pnpm install
```

⏱️ **Wait time:** 1-2 minutes  
✅ **Success:** You see "Done" at the end

### **Step 3: Start Application**

```powershell
pnpm dev
```

⏱️ **Wait time:** 10-20 seconds  
✅ **Success:** You see:
```
✓ web:  http://localhost:3000
✓ api:  http://localhost:4000
```

### **Step 4: Open Application**

Open your browser:
- **Main App:** http://localhost:3000
- **Login:** http://localhost:3000/login
- **Test Connection:** http://localhost:3000/test-connection

### **Step 5: Login**

Use ANY credentials:
- **Email:** `demo@examcraft.test` (or anything)
- **Password:** `password123` (or anything)

✅ **Done!** You're running ExamCraft in demo mode!

---

## 🗄️ Option B: Database Mode (Full Features with Docker)

### **Step 1: Navigate to Project**

```powershell
cd c:\Projects\ExamCraft
```

### **Step 2: Install Dependencies**

```powershell
pnpm install
```

⏱️ **Wait time:** 1-2 minutes

### **Step 3: Verify Docker is Running**

```powershell
docker info
```

✅ **Success:** Shows Docker system information  
❌ **If error:** Open **Docker Desktop** and wait for green icon in system tray

### **Step 4: Start Database**

```powershell
pnpm db:start
```

⏱️ **Wait time:** 15-30 seconds  
✅ **Success:** "Database services started!"

You should see:
```
✅ Database services started!

📊 Service URLs:
   - Supabase API Gateway: http://localhost:54321
   - Supabase Studio:      http://localhost:54323
   - PostgreSQL:           localhost:54322
   - Auth Service:         http://localhost:9999
```

### **Step 5: Apply Database Migrations** (First Time Only)

```powershell
pnpm db:migrate
```

⏱️ **Wait time:** 10-20 seconds  
✅ **Success:** "All migrations applied successfully!"

### **Step 6: Verify Database Connection**

```powershell
pnpm test:db-connection
```

✅ **Success:** "All tests passed! Database is connected and working."

### **Step 7: Seed Test Data** (Required for first-time setup)

```powershell
pnpm seed
```

⏱️ **Wait time:** 30-60 seconds  
✅ **Success:** "Ready for testing! 🚀"  
(This creates the initial admin accounts and test institutions)

### **Step 8: Update Environment Variables**

**File 1:** `apps/web/.env.local`

Change this line:
```env
NEXT_PUBLIC_DEMO_MODE=false
```

Make sure these are set:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
NEXT_PUBLIC_DEMO_MODE=false
```

**File 2:** `apps/api/.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
API_PORT=4000
```

### **Step 9: Start Application with Database**

```powershell
pnpm dev:with-db
```

⏱️ **Wait time:** 10-20 seconds  
✅ **Success:** You see both services running

### **Step 10: Open Application**

- **Main App:** http://localhost:3000
- **Login:** http://localhost:3000/login
- **Test Connection:** http://localhost:3000/test-connection
- **Supabase Studio:** http://localhost:54323
- **API Docs:** http://localhost:4000/api/docs

### **Step 11: Login**

Use test credentials from [`TEST_CREDENTIALS.md`](file:///c:/Projects/ExamCraft/TEST_CREDENTIALS.md):

**Admin User:**
- **Email:** `admin.dtc@examcraft-test.com`
- **Password:** `TestPass@123`

✅ **Done!** You're running ExamCraft with real database!

---

## 🎯 Interactive Setup Wizard (Alternative)

Instead of manual steps, run:

```powershell
pnpm db:setup
```

This wizard will:
1. ✅ Check if Docker is installed
2. ✅ Verify Docker is running
3. ✅ Check database status
4. ✅ Let you choose what to do
5. ✅ Guide you through the process

---

## 📊 Service URLs Reference

| Service | URL | Description |
|---------|-----|-------------|
| **Main Application** | http://localhost:3000 | Your web app |
| **Login Page** | http://localhost:3000/login | Authentication |
| **Connection Test** | http://localhost:3000/test-connection | Verify DB connection |
| **Backend API** | http://localhost:4000 | NestJS API server |
| **API Documentation** | http://localhost:4000/api/docs | Swagger docs |
| **Supabase Studio** | http://localhost:54323 | Database management UI |
| **API Gateway** | http://localhost:54321 | Supabase API endpoint |
| **PostgreSQL** | localhost:54322 | Direct database access |

---

## ✅ Verification Checklist

After starting, verify everything is working:

### **For Demo Mode:**
- [ ] Can access http://localhost:3000
- [ ] Login page loads
- [ ] Can login with any credentials
- [ ] Dashboard shows demo data

### **For Database Mode:**
- [ ] All Docker containers running (`pnpm db:status`)
- [ ] Can access http://localhost:54323 (Supabase Studio)
- [ ] Connection test passes (http://localhost:3000/test-connection)
- [ ] Can login with test credentials
- [ ] Dashboard shows real data from database

---

## 🛠️ Essential Commands

### **Database Management**
```powershell
pnpm db:start          # Start database
pnpm db:stop           # Stop database
pnpm db:restart        # Restart database
pnpm db:status         # Check container status
pnpm db:logs           # View database logs
pnpm db:migrate        # Apply migrations
pnpm db:reset          # Reset database (WARNING: deletes all data!)
pnpm test:db-connection  # Test database connection
```

### **Application Management**
```powershell
pnpm dev               # Start app (uses current mode)
pnpm dev:web           # Start frontend only
pnpm dev:api           # Start backend only
pnpm dev:with-db       # Start app + database together
pnpm dev:fresh         # Kill ports and restart fresh
pnpm kill:ports        # Kill processes on ports 3000 & 4000
```

### **Build & Test**
```powershell
pnpm build             # Build everything
pnpm test              # Run tests
pnpm lint              # Run linter
pnpm typecheck         # Type checking
pnpm seed              # Seed test data
pnpm check:env         # Verify environment variables
```

---

## 🐛 Troubleshooting

### **Problem: Port Already in Use**

```powershell
pnpm kill:ports
pnpm dev
```

### **Problem: Docker Not Running**

1. Open Docker Desktop
2. Wait for green icon in system tray
3. Verify: `docker info`
4. Try again: `pnpm db:start`

### **Problem: Database Won't Start**

```powershell
# Check status
pnpm db:status

# View logs
pnpm db:logs

# Restart
pnpm db:restart

# Full reset (deletes data!)
pnpm db:reset
```

### **Problem: Wrong Project Shows on localhost:3000**

```powershell
pnpm dev:fresh
```

### **Problem: Can't Connect to Database**

1. Check Docker is running: `docker info`
2. Check containers: `pnpm db:status`
3. Test connection: `pnpm test:db-connection`
4. Check env variables: `NEXT_PUBLIC_DEMO_MODE=false`
5. Wait 15 seconds after starting database
6. Restart: `pnpm db:restart`

### **Problem: Auth Service (GoTrue) Crash / Migration Error**

If `pnpm db:logs auth` shows `ERROR: operator does not exist: uuid = text` or `relation "users" does not exist`:

1. Run this fix command:
   ```powershell
   docker exec -i examcraft-db psql -U postgres -d postgres -c "INSERT INTO auth.schema_migrations (version) VALUES ('20221208132122');"
   ```
2. Restart auth:
   ```powershell
   docker compose up -d auth --force-recreate
   ```

### **Problem: Dependencies Issues**

```powershell
pnpm install --force
pnpm dev
```

### **Problem: Clean Start Needed**

```powershell
pnpm clean
pnpm install
pnpm db:start
pnpm db:migrate
pnpm dev:with-db
```

---

## 🔄 Switching Between Modes

### **From Demo to Database Mode:**

1. Stop app (Ctrl+C)
2. Start database: `pnpm db:start`
3. Update `apps/web/.env.local`: `NEXT_PUBLIC_DEMO_MODE=false`
4. Update `apps/api/.env.local`: Set Supabase URL
5. Restart app: `pnpm dev:with-db`

### **From Database to Demo Mode:**

1. Stop app (Ctrl+C)
2. Update `apps/web/.env.local`: `NEXT_PUBLIC_DEMO_MODE=true`
3. Restart app: `pnpm dev`
4. Database can be stopped: `pnpm db:stop`

---

## 📚 Additional Resources

| Document | Purpose |
|----------|---------|
| [`README.md`](file:///c:/Projects/ExamCraft/README.md) | Project overview |
| [`QUICK_START.md`](file:///c:/Projects/ExamCraft/QUICK_START.md) | Quick start guide |
| [`DOCKER_DATABASE_SETUP.md`](file:///c:/Projects/ExamCraft/DOCKER_DATABASE_SETUP.md) | Complete Docker setup |
| [`DOCKER_QUICK_REFERENCE.md`](file:///c:/Projects/ExamCraft/DOCKER_QUICK_REFERENCE.md) | Docker commands |
| [`HOW_TO_CHECK_CONNECTION.md`](file:///c:/Projects/ExamCraft/HOW_TO_CHECK_CONNECTION.md) | Connection verification |
| [`TEST_CREDENTIALS.md`](file:///c:/Projects/ExamCraft/TEST_CREDENTIALS.md) | Test login credentials |

---

## 💡 Pro Tips

### **1. Keep Database Running**
Don't stop the database between coding sessions. Just pause your work and resume later. Data persists!

### **2. Use VS Code Tasks**
Press `Ctrl+Shift+P` → "Run Task" → Select from:
- 🚀 Start Database
- ⚡ Dev with Database
- 📊 Database Status
- 🔍 View Database Logs

### **3. Test Connection First**
Always run `pnpm test:db-connection` if something isn't working.

### **4. Use Interactive Wizard**
For first-time setup, use `pnpm db:setup` - it guides you through everything.

### **5. Monitor with Supabase Studio**
Open http://localhost:54323 to:
- View database tables
- Run SQL queries
- Check authentication users
- Monitor performance

---

## 🎓 What Each Mode Gives You

### **Demo Mode:**
- ✅ All UI components work
- ✅ Mock data for testing
- ✅ No database setup needed
- ✅ Instant start
- ❌ Data doesn't persist
- ❌ No real database operations

### **Database Mode:**
- ✅ Real database operations
- ✅ Data persists across sessions
- ✅ Test migrations
- ✅ Full integration testing
- ✅ Multi-user scenarios
- ⚠️ Requires Docker
- ⚠️ Slightly longer startup

---

## 🚀 Quick Reference Card

**Fastest Start (Demo):**
```powershell
cd c:\Projects\ExamCraft
pnpm install
pnpm dev
```

**Full Setup (Database):**
```powershell
cd c:\Projects\ExamCraft
pnpm install
pnpm db:start
pnpm db:migrate
pnpm dev:with-db
```

**Check Connection:**
```powershell
pnpm test:db-connection
```

**Stop Everything:**
```powershell
pnpm db:stop
```

---

## ✅ Success Indicators

You know it's working when:

1. **Terminal shows:**
   ```
   ✓ web:  http://localhost:3000
   ✓ api:  http://localhost:4000
   ```

2. **Browser loads:** http://localhost:3000

3. **Can login:** Any credentials work (demo mode)

4. **Dashboard displays:** You see data and metrics

5. **Connection test passes:** http://localhost:3000/test-connection shows all green ✅

---

**Need Help?** Check the troubleshooting section or review the detailed documentation files linked above.

**Happy Coding! 🎉**
