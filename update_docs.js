const fs = require('fs');

// Update README.md
let readme = fs.readFileSync('C:/Projects/ExamCraft/README.md', 'utf-8');

const updatedReadmeTree = 
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
;

readme = readme.replace(/ExamCraft\/\n├── apps\/[\s\S]*?└── \*\.md                  # Root documentation files/m, updatedReadmeTree.trim());
fs.writeFileSync('C:/Projects/ExamCraft/README.md', readme);

// Update FILE_STRUCTURE.md section
let fmd = fs.readFileSync('C:/Projects/ExamCraft/FILE_STRUCTURE.md', 'utf-8');
const backendLayers = ### Backend (NestJS)
- **Authentication**: Supabase auth guards, JWT validation
- **Authorization**: Role-based access control (RBAC) with permissions
- **Tenant Management**: Multi-tenant context isolation
- **Core Domains**: Top-level modular structure including \cademic\, \i\, \nalytics\, \pprovals\, \uth\, \institution\, \invitations\, \mailer\, \onboarding\, \papers\, \platform-admin\, \questions\, \	emplates\, and \users\.;

fmd = fmd.replace(/### Backend \(NestJS\)[\s\S]*?- Tenant: Institution branding & configuration/m, backendLayers);

const frontendLayers = ### Frontend (Next.js)
- **Auth Routes**: \(auth)\ - Login, signup, password resets
- **App Routes**: \(app)\ - Flattened Role-based application structure unified through unified gateways
  - \(academic-head)\: Oversight & analytics
  - \(faculty)\: Question and exam composition
  - \(institution-admin)\: Structure, billing, team setup
  - \(reviewer)\: Paper verification
  - \(super-admin)\: Global tenants & flags
- **Components**: Component modules matched seamlessly to routing domains (\/components/question-bank\, \/components/approvals\, etc.);

fmd = fmd.replace(/### Frontend \(Next\.js\)[\s\S]*?- \*\*Utilities\*\*: API clients, design tokens, environment config, Supabase browser client/m, frontendLayers);

fs.writeFileSync('C:/Projects/ExamCraft/FILE_STRUCTURE.md', fmd);

console.log('Docs updated');
