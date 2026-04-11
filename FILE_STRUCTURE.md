# ExamCraft Monorepo - Complete File Structure Map

Generated: 2026-04-11

## Full Directory Tree

```
ExamCraft/
  .env.example
  .env.local
  .env.production.template
  .eslintrc.cjs
  .gitattributes
  .gitignore
  Architecture.md
  CLEANUP_SUMMARY.md
  COMPREHENSIVE_AUDIT_REPORT.md
  Logo.png
  PRD.md
  README.md
  TRD.md
  package.json
  pnpm-lock.yaml
  pnpm-workspace.yaml
  tsconfig.base.json
  turbo.json

  .github/
    workflows/
      ci.yml

  apps/
    api/
      nest-cli.json
      package.json
      tsconfig.json
      src/
        main.ts
        app.controller.ts
        app.module.ts
        academic/
          academic.controller.ts
          academic.module.ts
          academic.service.ts
          dto/
            create-academic.dto.ts
        auth/
          auth.controller.ts
          auth.module.ts
          decorators/
            permissions.decorator.ts
            roles.decorator.ts
          guards/
            permissions.guard.ts
            roles.guard.ts
            supabase-auth.guard.ts
        common/
          decorators/
            current-user.decorator.ts
            tenant-context.decorator.ts
          types/
            authenticated-request.ts
        config/
          env.module.ts
        content/
          content.controller.ts
          content.module.ts
          content.service.ts
          paper-export.service.ts
          dto/
            create-bulk-questions.dto.ts
            create-question.dto.ts
            create-template.dto.ts
            generate-paper.dto.ts
            review-content.dto.ts
        invitations/
          invitation.controller.ts
          invitation.module.ts
          invitation.service.ts
          invitation.service.spec.ts
          dto/
            create-invitation.dto.ts
        modules/
          academic-structure/
            academic-structure.controller.ts
            academic-structure.module.ts
            academic-structure.service.ts
            dto/
              academic-structure.dto.ts
        onboarding/
          onboarding.controller.ts
          onboarding.module.ts
          onboarding.service.ts
          onboarding.controller.spec.ts
          dto/
            create-institution-onboarding.dto.ts
        people/
          people.controller.ts
          people.module.ts
          people.service.ts
          dto/
            create-staff-invitation.dto.ts
        supabase/
          supabase.constants.ts
          supabase.module.ts
        tenant/
          tenant.controller.ts
          tenant.module.ts
          tenant-context.service.ts
          tenant-context.service.spec.ts
          dto/
            update-branding.dto.ts
            update-institution-status.dto.ts
          guards/
            tenant-context.guard.ts

    web/
      .env.local
      .eslintrc.json
      next-env.d.ts
      next.config.js
      package.json
      playwright.config.ts
      postcss.config.js
      tailwind.config.ts
      tsconfig.json
      tsconfig.tsbuildinfo
      vitest.config.ts
      app/
        page.tsx
        layout.tsx
        loading.tsx
        error.tsx
        globals.css
        (auth)/
          layout.tsx
          login/
            page.tsx
          signup/
            page.tsx
        (admin)/
          layout.tsx
          admin/
            page.tsx
            dashboard/
              page.tsx
            flags/
              page.tsx
            institutions/
              page.tsx
            logs/
              page.tsx
            settings/
              page.tsx
            support/
              page.tsx
            users/
              page.tsx
        auth/
          forgot-password/
            page.tsx
          reset-password/
            page.tsx
        dashboard/
          page.tsx
          layout.tsx
          error.tsx
          [role]/
            page.tsx
          academic-structure/
            departments/
              page.tsx
          faculty/
            page.tsx
            layout.tsx
            questions/
              page.tsx
              new/
                page.tsx
              [id]/
                edit/
                  page.tsx
            papers/
              page.tsx
            templates/
              page.tsx
            subjects/
              page.tsx
            submissions/
              page.tsx
            settings/
              page.tsx
            syllabus-ai/
              page.tsx
          head/
            page.tsx
            analytics/
              page.tsx
            audit-logs/
              page.tsx
            overview/
              page.tsx
          reviewer/
            page.tsx
            history/
              page.tsx
            queue/
              page.tsx
            review/
              page.tsx
          institution_admin/
            page.tsx
            analytics/
              page.tsx
            approve-papers/
              page.tsx
            approve-questions/
              page.tsx
            manage-faculty/
              page.tsx
            manage-questions/
              page.tsx
            reports/
              page.tsx
            settings/
              page.tsx
            subjects/
              page.tsx
        onboarding/
          page.tsx
        unauthorized/
          page.tsx
      components/
        error-boundary.tsx
        admin/ (8 files)
          AdminLayout.tsx
          AdminSidebar.tsx
          AuditLogsTable.tsx
          FeatureFlagsTable.tsx
          InstitutionsTable.tsx
          PlatformActivityFeed.tsx
          PlatformOverviewContent.tsx
          ToggleSwitch.tsx
        auth/ (8 files)
          AuthLayout.tsx
          AuthPage.tsx
          InviteAcceptanceCard.tsx
          LoginForm.tsx
          SignupForm.tsx
          auth-shell.tsx
          institution-onboarding-form.tsx
          invite-acceptance-form.tsx
        dashboard/ (20+ files)
          ActivityFeed.tsx
          INTEGRATION_EXAMPLES.md
          StatCard.tsx
          Table.tsx
          academic-head-workspace.tsx
          academic-structure-workspace.tsx
          branding-workspace.tsx
          command-palette.tsx
          dashboard-home.tsx
          dashboard-sidebar.tsx
          faculty-workspace.tsx
          global-template-library.tsx
          institution-admin-workspace.tsx
          paper-preview-modal.tsx
          paper-workspace.tsx
          question-bank-workspace.tsx
          reviewer-workspace.tsx
          role-dashboard.tsx
          super-admin-workspace.tsx
          template-section-configurator.tsx
          academic-structure/
            departments-page.tsx
          faculty/ (5 files)
            metadata-panel.tsx
            question-card.tsx
            question-filters.tsx
            question-form.tsx
            question-list.tsx
        head/ (3 files)
          CoverageCard.tsx
          DepartmentOverviewContent.tsx
          FacultyActivityTable.tsx
        landing/ (8 files)
          CTABanner.tsx
          FeaturesGrid.tsx
          Footer.tsx
          Hero.tsx
          HowItWorks.tsx
          Navbar.tsx
          Roles.tsx
          SocialProof.tsx
        onboarding/ (5 files)
          OnboardingCard.tsx
          StepIndicator.tsx
          steps/
            AcademicConfig.tsx
            InstitutionDetails.tsx
            InviteTeam.tsx
        reviewer/ (5 files)
          ConfirmDialog.tsx
          PaperViewer.tsx
          ReviewContent.tsx
          ReviewHistory.tsx
          ReviewPanel.tsx
        shared/ (3 files)
          DifficultyBadge.tsx
          RoleBadge.tsx
          StatusBadge.tsx
      e2e/
        dashboard-role-flows.spec.ts
      hooks/
        use-review-workflow.ts
      lib/ (10 files)
        academic.ts
        api.demo.ts
        api.production.ts
        api.ts
        dashboard.test.ts
        dashboard.ts
        design-tokens.ts
        env.ts
        error-utils.ts
        supabase-browser.ts
      public/ (5 files)
        auth-visual.png
        hero-dashboard.png
        testimonial-academic-head.jpg
        testimonial-faculty.jpg
        workflow-step-1.png

  docs/
    QUICK_TESTING_GUIDE.md
    TEST_CASES_CRITICAL_WORKFLOWS.md
    api/
    product/
      Pilot_Success_Criteria.md
    runbooks/
    technical/
      Tenant_Model_and_Role_Matrix.md

  packages/
    types/
      package.json
      tsconfig.json
      src/
        index.ts
        domain/
          institution.ts
    ui/
      package.json
      tsconfig.json
      src/
        index.ts
        lib/
          design-tokens.ts
        themes/
          tokens.ts
        components/
          avatar-tailwind.tsx
          badge.tsx
          button.tsx
          card.tsx
          input.tsx
          select.tsx
          skeleton.tsx
          spinner.tsx
          status-message.tsx
          table.tsx
          textarea.tsx
          shared/
            RoleBadge.tsx
            StatusBadge.tsx

  scripts/
    seed-academic-structure.ts

  supabase/
    config.toml
    seed.sql
    migrations/ (9 files)
      20260401000100_auth_tenant_foundation.sql
      20260402000100_content_and_rls.sql
      20260403000100_papers_workflow.sql
      20260403000200_academic_structure.sql
      20260403000300_content_review_permissions.sql
      20260404000100_question_bank_foundation.sql
      20260404000300_versioning_and_duplicates.sql
      20260404000400_template_system_v2.sql
      20260405000100_academic_structure_complete.sql
    snippets/
    .branches/
      _current_branch
    .temp/
      cli-latest
```

## Statistics

| Aspect | Count |
|--------|-------|
| NestJS API Modules | 10 |
| API Data Transfer Objects (DTOs) | 13+ |
| Next.js App Routes | 45+ |
| React Components | 80+ |
| Dashboard Workspace Components | 20 |
| UI Package Components | 13 |
| Supabase Migrations | 9 |
| Configuration Files | 8 |
| Documentation Files | 5 |

## Architecture Layers

### Backend (NestJS)
- **Authentication**: Supabase auth guards, JWT validation
- **Authorization**: Role-based access control (RBAC) with permissions
- **Tenant Management**: Multi-tenant context isolation
- **Domain Modules**:
  - Academic: Academic structure management
  - Content: Questions, templates, paper generation
  - Invitations: User invitations workflow
  - Onboarding: Institution setup
  - People: User/staff management
  - Tenant: Institution branding & configuration

### Frontend (Next.js)
- **Auth Routes**: `(auth)` - Login/signup flows
- **Admin Routes**: `(admin)` - Platform administration dashboards
- **Dashboard Routes**: `dashboard` - Role-based user workspaces
  - Faculty workspace
  - Academic head workspace
  - Reviewer workspace
  - Super admin workspace
  - Institution admin workspace
- **Components**: 80+ reusable React components across multiple feature areas
- **Utilities**: API clients, design tokens, environment config, Supabase browser client

### Shared Packages
- **UI**: Base components (badges, buttons, inputs, cards, tables) + design tokens
- **Types**: Shared TypeScript domain interfaces (institutions, roles, etc.)

### Database (Supabase PostgreSQL)
- 9 progressive migrations handling:
  - Authentication & tenant foundation
  - Content & row-level security (RLS)
  - Papers workflow & review process
  - Academic structure & hierarchy
  - Question bank & versioning
  - Template system v2

## Key Features Reflected in Structure

1. **Role-Based Access**: Separate workspaces for faculty, heads, reviewers, admins
2. **Multi-Tenancy**: Tenant context guards and services throughout backend
3. **Onboarding Flow**: Dedicated components and API routes
4. **Content Management**: Questions, templates, paper generation pipeline
5. **Review Workflow**: Reviewer workspace with paper viewing and feedback
6. **Academic Hierarchy**: Departments, courses, terms management
7. **Admin Dashboard**: Platform-wide analytics, institutions, users, feature flags
8. **Design System**: Centralized tokens and shared UI components

## Excluded Directories (Build Artifacts)
- `node_modules/` - Dependencies
- `.turbo/` - Turborepo cache
- `.next/` & `.next-build/` - Next.js build output
- `dist/` - Build output
- `.git/` - Git metadata
