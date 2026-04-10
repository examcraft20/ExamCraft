# 🔍 How to Verify Database Connection

## Quick Verification Methods

### **Method 1: Check Environment Variable (Visual)**

Open your browser console on http://localhost:3000:

1. Open DevTools (F12)
2. Go to Console tab
3. Type: `process.env.NEXT_PUBLIC_DEMO_MODE`
4. Should return: `"false"` (if using database) or `"true"` (if using demo mode)

---

### **Method 2: Check Docker Containers Running**

```powershell
# Check if database containers are running
pnpm db:status

# OR
docker compose ps
```

**✅ Good Output:**
```
NAME                STATUS         PORTS
examcraft-db        Up (healthy)   0.0.0.0:54322->5432/tcp
examcraft-kong      Up             0.0.0.0:54321->8000/tcp
examcraft-auth      Up             0.0.0.0:9999->9999/tcp
examcraft-studio    Up             0.0.0.0:54323->3000/tcp
examcraft-rest      Up             0.0.0.0:3001->3000/tcp
examcraft-meta      Up             0.0.0.0:8080->8080/tcp
```

**❌ Bad Output:**
```
NAME                STATUS
examcraft-db        Exited
examcraft-kong      Exited
```

---

### **Method 3: Test Supabase API Endpoint**

Open in browser or use curl:

```powershell
# Test if Supabase API is responding
curl http://localhost:54321/rest/v1/

# Should return: {"message":"Route not found"}
# This means the API is running (route doesn't exist, but server is up)
```

**✅ Success:** Returns JSON response  
**❌ Failed:** Connection refused or timeout

---

### **Method 4: Direct Database Connection Test**

```powershell
# Try connecting to PostgreSQL directly
docker exec -it examcraft-db psql -U postgres -d postgres -c "SELECT version();"
```

**✅ Success Output:**
```
                                                version                                                
-------------------------------------------------------------------------------------------------------
 PostgreSQL 15.1 on x86_64-pc-linux-gnu, compiled by gcc (Debian 10.2.1-6) 10.2.1 20210110, 64-bit
(1 row)
```

**❌ Failed Output:**
```
Error: No such container: examcraft-db
# OR
could not connect to server: Connection refused
```

---

### **Method 5: Check Application Logs**

```powershell
# Start the application and watch for connection messages
pnpm dev

# Look for these messages in the console:
# ✅ "Connected to Supabase" 
# ✅ "Database connection established"
# ❌ "Failed to connect to database"
# ❌ "Connection refused"
```

---

### **Method 6: Use the Connection Test Page** ⭐ EASIEST

**Open in your browser:**
```
http://localhost:3000/test-connection
```

This page will automatically:
- ✅ Check if you're in Demo or Database mode
- ✅ Test Supabase API connection
- ✅ Verify Auth service is running
- ✅ Check Backend API connectivity
- ✅ Show clear pass/fail results
- ✅ Provide troubleshooting steps if something fails

---

### **Method 7: Run Automated Test Script**

```powershell
pnpm test:db-connection
```

This runs 8 comprehensive tests:
1. ✅ Docker status
2. ✅ Container status
3. ✅ API Gateway (port 54321)
4. ✅ PostgreSQL (port 54322)
5. ✅ Supabase Studio (port 54323)
6. ✅ Auth Service (port 9999)
7. ✅ Environment variables
8. ✅ Database query test
