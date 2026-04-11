# ExamCraft - Multi-Tenant Exam Management Platform

**A modern SaaS platform for educational institutions to manage question banks, exam templates, paper generation, approval workflows, and analytics.**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.13-green.svg)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-9.15-orange.svg)](https://pnpm.io/)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- pnpm 8+

Install pnpm if not installed:
npm install -g pnpm@8

### Setup
```bash
# 1. Install dependencies
pnpm install

# 2. Set up environment variables
cp apps/web/.env.example apps/web/.env.local
# Fill in your Supabase URL and keys

# 3. Check env is correct
pnpm check:env

# 4. Seed the database with test data
pnpm seed

# 5. Start development (both web + api)
pnpm dev

# OR start individually:
pnpm dev:web    # Frontend only → localhost:3000
pnpm dev:api    # Backend only  → localhost:4000
```

### If localhost:3000 shows wrong project
```bash
# Kill all processes on dev ports first
pnpm kill:ports

# Then start fresh
pnpm dev:fresh
```

### Common Commands
```bash
pnpm dev          # Start everything
pnpm dev:web      # Frontend only
pnpm dev:api      # Backend only
pnpm build        # Build everything
pnpm seed         # Reset and seed test data
pnpm check:env    # Verify env variables
pnpm kill:ports   # Kill port 3000 and 4000
pnpm clean        # Clean all build artifacts
```


---

## 📚 Documentation

### Core Documentation
- **[PRD.md](PRD.md)** - Product Requirements Document
- **[TRD.md](TRD.md)** - Technical Requirements Document
- **[Architecture.md](Architecture.md)** - System Architecture & Design

### Technical Guides
- **[docs/TEST_CASES_CRITICAL_WORKFLOWS.md](docs/TEST_CASES_CRITICAL_WORKFLOWS.md)** - Test cases for critical user flows
- **[docs/QUICK_TESTING_GUIDE.md](docs/QUICK_TESTING_GUIDE.md)** - Quick testing procedures

### Additional Resources
- **[docs/product/Pilot_Success_Criteria.md](docs/product/Pilot_Success_Criteria.md)** - Pilot launch success metrics
- **[docs/technical/Tenant_Model_and_Role_Matrix.md](docs/technical/Tenant_Model_and_Role_Matrix.md)** - Multi-tenancy design

---

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- Next.js 14.2.29 (App Router)
- React 18.3.1
- Tailwind CSS v3.4.19
- TypeScript 5.4.5

**Backend:**
- NestJS 10.4.22
- Supabase (PostgreSQL + Auth)
- TypeScript 5.4.5

**Infrastructure:**
- Monorepo: pnpm workspaces + Turbo
- Deployment: Vercel (frontend) + Railway (backend)
- CI/CD: GitHub Actions

### Key Features

✅ **Multi-Tenant SaaS** - Complete tenant isolation with RLS policies  
✅ **Role-Based Access Control** - 5 roles with granular permissions  
✅ **Academic Structure Management** - Departments, courses, batches, subjects  
✅ **Question Bank** - CRUD operations with metadata tracking & audit logs  
✅ **Exam Templates** - Reusable paper structures  
✅ **Approval Workflows** - Review and approval process  
✅ **Analytics Dashboard** - Real-time insights and institution metrics  
✅ **Security Hardened** - XSS sanitization, CSRF protection, and structured logging  
✅ **Health Monitoring** - Production health check and readiness probe endpoints  
✅ **PDF Export** - Branded document generation (Beta)

---

## 📁 Project Structure

ExamCraft/
├── apps/
│   ├── api/              # NestJS backend (Domain-Modular Structure)
│   │   ├── src/
│   │   │   ├── academic/     # Academic Hierarchy
│   │   │   ├── analytics/    # Reporting and metrics
│   │   │   ├── approvals/    # Review workflows
│   │   │   ├── auth/         # Authentication & Guards
│   │   │   ├── mailer/       # System notifications
│   │   │   ├── papers/       # Exam document generation
│   │   │   ├── platform-admin/ # Super admin tools
│   │   │   ├── questions/    # Repository & Item banking
│   │   │   ├── templates/    # Blueprint architectures
│   │   │   └── users/        # User management
│   │   └── dist/         # Compiled output
│   └── web/              # Next.js frontend
│       ├── app/          # App router pages
│       │   ├── (auth)/   # Authenticated gateways
│       │   └── (app)/    # Flat Role-based App Workspaces
│       │       ├── (academic-head)/
│       │       ├── (faculty)/
│       │       ├── (institution-admin)/
│       │       ├── (reviewer)/
│       │       └── (super-admin)/
│       ├── components/   # Feature-grouped React components
│       └── lib/          # Utilities & hooks
├── packages/
│   ├── ui/               # Shared component library
│   ├── types/            # Shared TypeScript domain models
│   ├── sdk/              # API SDK
│   └── config/           # Shared configs
├── supabase/
│   └── migrations/       # Progressive Database migrations & RLS schemas
└── docs/                 # Documentation
`

---

## 🎯 Current Status

**Overall Progress:** 100% MVP Complete (Production Ready)

| Module | Status | Progress |
|--------|--------|----------|
| Foundation | ✅ Complete | 100% |
| Academic Structure | ✅ Complete | 100% |
| Question Bank | ✅ Complete | 100% |
| Templates | ✅ Complete | 100% |
| Paper Generation | ✅ Complete | 100% |
| Approval Workflow | ✅ Complete | 100% |
| PDF Export | ✅ Complete | 100% |
| Analytics | ✅ Complete | 100% |
| Security & Audit | ✅ Complete | 100% |

---

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run unit tests only
pnpm test:unit

# Run integration tests
pnpm test:integration

# Run E2E tests
pnpm test:e2e

# Check code coverage
pnpm test:coverage
```

**Test Coverage Target:** 80%+ for all services

---

## 🚦 Development Workflow

### Branch Strategy
- **main** - Production-ready code
- **develop** - Integration branch
- **feature/*** - Feature branches
- **hotfix/*** - Critical fixes

### Commit Convention
We follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat: add paper generation endpoint
fix: resolve template cloning bug
docs: update API documentation
test: add unit tests for approval workflow
refactor: optimize database queries
```

### Pull Request Process
1. Create feature branch from develop
2. Implement changes with tests
3. Ensure all checks pass
4. Request code review
5. Merge to develop after approval
6. Deploy to staging for QA
7. Merge to main for production release

---

## 🌐 Environment Variables

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_DEMO_MODE=true
```

### Backend (apps/api/.env)
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PORT=4000
NODE_ENV=development
```

See [.env.example](.env.example) for complete configuration options.

---

## 📊 Monitoring & Observability

- **Health Checks:**
  - `/api/v1/health` - Basic health check
  - `/api/v1/health/ready` - Readiness probe (checks DB & services)
  - `/api/v1/health/live` - Liveness probe
- **Audit Logging:** Every critical state mutation is logged to the `audit_logs` table via NestJS Interceptors and Database Triggers.
- **Error Tracking:** Structured JSON error responses with `HttpExceptionFilter` and server-side logging.
- **Structured Logging:** NestJS `Logger` used across all services for consistent production logs.

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) (coming soon) for details.

### Code Style
- ESLint + Prettier for code formatting
- TypeScript strict mode enabled
- Component-driven development
- Mobile-first responsive design

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

**ExamCraft Technologies**  
Building the future of educational assessment technology.

For questions or support:
- 📧 Email: support@examcraft.test
- 🐛 Issues: [GitHub Issues](../../issues)
- 💬 Discussions: [GitHub Discussions](../../discussions)

---

## 🙏 Acknowledgments

Built with ❤️ using:
- [Next.js](https://nextjs.org/)
- [NestJS](https://nestjs.com/)
- [Supabase](https://supabase.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/)

---

**Last Updated:** 2026-04-09  
**Version:** 1.0.0 (Production Stable)
