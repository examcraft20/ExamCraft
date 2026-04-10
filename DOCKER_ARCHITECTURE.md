# ExamCraft Architecture with Docker

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Developer Machine                       │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              VS Code + Docker Extension                │  │
│  │  • Visual container management                         │  │
│  │  • One-click tasks                                     │  │
│  │  • Integrated terminal                                 │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌──────────────┐              ┌───────────────────────┐    │
│  │  Frontend    │              │   Backend API         │    │
│  │  Next.js     │◄────────────►│   NestJS              │    │
│  │  :3000       │   HTTP/API   │   :4000               │    │
│  └──────────────┘              └───────────────────────┘    │
│           │                              │                   │
│           │                              │                   │
│           └──────────────┬───────────────┘                   │
│                          │                                   │
│                          ▼                                   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │          Docker Compose (Supabase Stack)               │  │
│  │                                                         │  │
│  │  ┌──────────┐  ┌──────┐  ┌──────┐  ┌──────────┐     │  │
│  │  │  Studio  │  │ Kong │  │ Auth │  │   REST   │     │  │
│  │  │  :54323  │  │:54321│  │:9999 │  │  :3001   │     │  │
│  │  └──────────┘  └──────┘  └──────┘  └──────────┘     │  │
│  │       │            │         │           │            │  │
│  │       └────────────┴─────────┴───────────┘            │  │
│  │                          │                             │  │
│  │                          ▼                             │  │
│  │                  ┌──────────┐                          │  │
│  │                  │   PostgreSQL                        │  │
│  │                  │   :54322                             │  │
│  │                  │   (Persistent Data)                  │  │
│  │                  └──────────┘                          │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### **Demo Mode (No Database)**

```
User Browser
    │
    ▼
Next.js (:3000)
    │
    ├─ NEXT_PUBLIC_DEMO_MODE=true
    │
    ▼
Mock API (in-memory)
    │
    └─► Returns mock data from lib/api/mock.ts
```

### **Database Mode (With Docker)**

```
User Browser
    │
    ▼
Next.js (:3000)
    │
    ├─ NEXT_PUBLIC_DEMO_MODE=false
    ├─ NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
    │
    ▼
Supabase Kong Gateway (:54321)
    │
    ├─► Auth Requests → Auth Service (:9999)
    ├─► REST Requests → PostgREST (:3001)
    └─► Meta Requests → PG Meta (:8080)
              │
              ▼
         PostgreSQL (:54322)
              │
              └─► Persistent Data Storage
```

---

## Docker Containers

| Container | Image | Port | Purpose |
|-----------|-------|------|---------|
| `examcraft-db` | supabase/postgres | 54322 | PostgreSQL database |
| `examcraft-kong` | kong | 54321 | API Gateway |
| `examcraft-auth` | supabase/gotrue | 9999 | Authentication |
| `examcraft-rest` | postgrest | 3001 | REST API |
| `examcraft-studio` | supabase/studio | 54323 | Web UI |
| `examcraft-meta` | supabase/postgres-meta | 8080 | Database metadata |
| `examcraft-vector` | timberio/vector | 9001 | Logging (optional) |

---

## Development Workflows

### **Workflow 1: Quick Demo (No Setup)**

```bash
pnpm install
pnpm dev
# Done! Uses mock data, no database needed
```

### **Workflow 2: Full Stack Development**

```bash
pnpm install
pnpm db:setup              # Interactive wizard
# OR
pnpm db:start              # Start database
pnpm db:migrate            # Apply migrations
pnpm seed                  # Seed test data
pnpm dev:with-db           # Start everything
```

### **Workflow 3: VS Code Integration**

```
1. Open project in VS Code
2. Ctrl+Shift+P → "Run Task"
3. Select "⚡ Dev with Database"
4. Everything starts automatically!
```

---

## Environment Configuration

### **Frontend (.env.local)**

```env
# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:4000/api

# Supabase (Docker)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Mode Toggle
NEXT_PUBLIC_DEMO_MODE=false  # Set to true for demo mode
```

### **Backend (.env.local)**

```env
# Supabase (Docker)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# API Server
API_PORT=4000
```

---

## Port Map

| Port | Service | Access |
|------|---------|--------|
| 3000 | Next.js Frontend | http://localhost:3000 |
| 4000 | NestJS Backend | http://localhost:4000 |
| 54321 | Supabase Gateway | http://localhost:54321 |
| 54322 | PostgreSQL | localhost:54322 |
| 54323 | Supabase Studio | http://localhost:54323 |
| 9999 | Auth Service | http://localhost:9999 |
| 3001 | PostgREST | http://localhost:3001 |
| 8080 | PG Meta | http://localhost:8080 |

---

## File Structure

```
ExamCraft/
├── docker-compose.yml              # Docker services
├── .dockerignore                   # Docker build exclusions
├── .vscode/
│   └── tasks.json                  # VS Code tasks
├── scripts/
│   ├── db-start.js                 # Start database
│   ├── db-stop.js                  # Stop database
│   ├── db-migrate.js               # Apply migrations
│   └── setup-database.ps1          # Setup wizard
├── supabase/
│   ├── config.toml                 # Supabase config
│   ├── kong.yml                    # API Gateway config
│   ├── vector.yml                  # Logging config
│   └── migrations/                 # SQL migrations
├── apps/
│   ├── web/
│   │   └── .env.local              # Frontend env
│   └── api/
│       └── .env.local              # Backend env
└── package.json                    # Root scripts
```

---

## State Management

### **Demo Mode**
- Data stored in browser memory
- Resets on page refresh
- No persistence
- Perfect for UI testing

### **Database Mode**
- Data stored in PostgreSQL
- Persists across restarts
- Real database operations
- Perfect for integration testing

---

## Security Notes

⚠️ **Development Only**: This Docker setup is for local development only.

For production:
- Use managed Supabase hosting
- Rotate all API keys
- Enable SSL/TLS
- Configure proper CORS
- Use environment-specific secrets

---

## Performance Tips

### **Docker on Windows**
1. Use WSL2 backend (not Hyper-V)
2. Allocate sufficient resources:
   - CPU: 4+ cores
   - Memory: 8GB+
   - Swap: 2GB+

### **Database Optimization**
1. Use indexes for frequent queries
2. Regular VACUUM ANALYZE
3. Monitor with Supabase Studio

### **Development Speed**
1. Use `pnpm dev:with-db` for one-command start
2. Keep database running between sessions
3. Use VS Code tasks for quick access

---

## Monitoring

### **Check Container Health**
```bash
docker compose ps
```

### **View Logs**
```bash
# All services
pnpm db:logs

# Specific service
docker compose logs -f db
docker compose logs -f auth
```

### **Database Stats**
- Open Supabase Studio: http://localhost:54323
- View table sizes, row counts
- Monitor query performance

---

This architecture provides a complete local development environment that closely mirrors production while remaining easy to set up and manage through VS Code!
