# ExamCraft Monorepo - Complete File Structure Map

Generated: 2026-04-11

## Full Directory Tree

`
ExamCraft/
├── .github/
│   └── workflows/
│       └── ci.yml
├── .pnpm-store/
│   └── v3/
├── .qoder/
│   ├── agents/
│   ├── skills/
│   ├── api-dev.err.log
│   ├── api-dev.out.log
│   ├── api-start.err.log
│   ├── api-start.out.log
│   ├── web-dev.err.log
│   └── web-dev.out.log
├── .vscode/
│   └── tasks.json
├── apps/
│   ├── api/
│   │   ├── src/
│   │   │   ├── academic/
│   │   │   │   ├── dto/
│   │   │   │   │   └── academic.dto.ts
│   │   │   │   ├── academic.controller.ts
│   │   │   │   ├── academic.module.ts
│   │   │   │   └── academic.service.ts
│   │   │   ├── ai/
│   │   │   │   ├── dto/
│   │   │   │   │   └── ai.dto.ts
│   │   │   │   ├── ai.controller.ts
│   │   │   │   ├── ai.module.ts
│   │   │   │   ├── suggestions.service.ts
│   │   │   │   └── syllabus.service.ts
│   │   │   ├── analytics/
│   │   │   │   ├── analytics.controller.ts
│   │   │   │   ├── analytics.module.ts
│   │   │   │   ├── analytics.service.spec.ts
│   │   │   │   ├── analytics.service.ts
│   │   │   │   └── reports.service.ts
│   │   │   ├── approvals/
│   │   │   │   ├── dto/
│   │   │   │   │   └── review-content.dto.ts
│   │   │   │   ├── approvals.controller.ts
│   │   │   │   ├── approvals.module.ts
│   │   │   │   └── approvals.service.ts
│   │   │   ├── audit-logs/
│   │   │   │   ├── audit-action.enum.ts
│   │   │   │   ├── audit-logs.controller.ts
│   │   │   │   ├── audit-logs.module.ts
│   │   │   │   ├── audit-logs.service.spec.ts
│   │   │   │   └── audit-logs.service.ts
│   │   │   ├── auth/
│   │   │   │   ├── decorators/
│   │   │   │   │   ├── permissions.decorator.ts
│   │   │   │   │   └── roles.decorator.ts
│   │   │   │   ├── guards/
│   │   │   │   │   ├── permissions.guard.ts
│   │   │   │   │   ├── roles.guard.ts
│   │   │   │   │   └── supabase-auth.guard.ts
│   │   │   │   ├── auth.controller.ts
│   │   │   │   └── auth.module.ts
│   │   │   ├── common/
│   │   │   │   ├── decorators/
│   │   │   │   │   ├── audit-log.decorator.ts
│   │   │   │   │   ├── current-user.decorator.ts
│   │   │   │   │   └── institution-context.decorator.ts
│   │   │   │   ├── filters/
│   │   │   │   │   └── http-exception.filter.ts
│   │   │   │   ├── guards/
│   │   │   │   │   └── mutation-auth.guard.ts
│   │   │   │   ├── interceptors/
│   │   │   │   │   └── audit-log.interceptor.ts
│   │   │   │   ├── middleware/
│   │   │   │   │   └── sanitize.middleware.ts
│   │   │   │   ├── types/
│   │   │   │   │   └── authenticated-request.ts
│   │   │   │   └── utils/
│   │   │   │       └── review.utils.ts
│   │   │   ├── config/
│   │   │   │   └── env.module.ts
│   │   │   ├── global-templates/
│   │   │   │   ├── global-templates.controller.ts
│   │   │   │   ├── global-templates.module.ts
│   │   │   │   └── global-templates.service.ts
│   │   │   ├── health/
│   │   │   │   ├── health.controller.ts
│   │   │   │   └── health.module.ts
│   │   │   ├── institution/
│   │   │   │   ├── dto/
│   │   │   │   │   ├── update-branding.dto.ts
│   │   │   │   │   └── update-institution-status.dto.ts
│   │   │   │   ├── guards/
│   │   │   │   │   └── institution-context.guard.ts
│   │   │   │   ├── institution-context.service.spec.ts
│   │   │   │   ├── institution-context.service.ts
│   │   │   │   ├── institution.controller.ts
│   │   │   │   └── institution.module.ts
│   │   │   ├── invitations/
│   │   │   │   ├── dto/
│   │   │   │   │   └── create-invitation.dto.ts
│   │   │   │   ├── invitation.controller.ts
│   │   │   │   ├── invitation.module.ts
│   │   │   │   ├── invitation.service.spec.ts
│   │   │   │   └── invitation.service.ts
│   │   │   ├── mailer/
│   │   │   │   ├── mailer.module.ts
│   │   │   │   └── mailer.service.ts
│   │   │   ├── onboarding/
│   │   │   │   ├── dto/
│   │   │   │   │   └── create-institution-onboarding.dto.ts
│   │   │   │   ├── onboarding.controller.spec.ts
│   │   │   │   ├── onboarding.controller.ts
│   │   │   │   ├── onboarding.module.ts
│   │   │   │   └── onboarding.service.ts
│   │   │   ├── papers/
│   │   │   │   ├── dto/
│   │   │   │   │   └── generate-paper.dto.ts
│   │   │   │   ├── paper-export.service.ts
│   │   │   │   ├── papers.controller.ts
│   │   │   │   ├── papers.module.ts
│   │   │   │   └── papers.service.ts
│   │   │   ├── platform-admin/
│   │   │   │   ├── admin.controller.ts
│   │   │   │   ├── admin.module.ts
│   │   │   │   ├── audit.service.ts
│   │   │   │   └── flags.service.ts
│   │   │   ├── questions/
│   │   │   │   ├── dto/
│   │   │   │   │   ├── create-bulk-questions.dto.ts
│   │   │   │   │   ├── create-question.dto.ts
│   │   │   │   │   └── edit-question.dto.ts
│   │   │   │   ├── questions.controller.ts
│   │   │   │   ├── questions.module.ts
│   │   │   │   └── questions.service.ts
│   │   │   ├── supabase/
│   │   │   │   ├── supabase.constants.ts
│   │   │   │   └── supabase.module.ts
│   │   │   ├── templates/
│   │   │   │   ├── dto/
│   │   │   │   │   └── create-template.dto.ts
│   │   │   │   ├── templates.controller.ts
│   │   │   │   ├── templates.module.ts
│   │   │   │   └── templates.service.ts
│   │   │   ├── users/
│   │   │   │   ├── dto/
│   │   │   │   │   └── create-staff-invitation.dto.ts
│   │   │   │   ├── users.controller.ts
│   │   │   │   ├── users.module.ts
│   │   │   │   └── users.service.ts
│   │   │   ├── app.controller.ts
│   │   │   ├── app.module.ts
│   │   │   └── main.ts
│   │   ├── .env.local
│   │   ├── Dockerfile
│   │   ├── nest-cli.json
│   │   ├── package.json
│   │   ├── railway.json
│   │   └── tsconfig.json
│   └── web/
│       ├── __tests__/
│       │   ├── components/
│       │   │   └── badges.test.tsx
│       │   ├── forms/
│       │   │   └── form-validation.test.ts
│       │   ├── utils/
│       │   │   ├── dashboard-helpers.test.ts
│       │   │   ├── data-utilities.test.ts
│       │   │   └── error-utils.test.ts
│       │   └── dashboard.test.ts
│       ├── app/
│       │   ├── (app)/
│       │   │   ├── (academic-head)/
│       │   │   │   ├── admin-subjects/
│       │   │   │   │   └── page.tsx
│       │   │   │   ├── analytics/
│       │   │   │   │   ├── faculty/
│       │   │   │   │   │   └── page.tsx
│       │   │   │   │   ├── reports/
│       │   │   │   │   │   └── page.tsx
│       │   │   │   │   ├── trends/
│       │   │   │   │   │   └── page.tsx
│       │   │   │   │   └── page.tsx
│       │   │   │   ├── approvals/
│       │   │   │   │   ├── [paperId]/
│       │   │   │   │   │   ├── history/
│       │   │   │   │   │   │   └── page.tsx
│       │   │   │   │   │   └── page.tsx
│       │   │   │   │   └── page.tsx
│       │   │   │   ├── approve-questions/
│       │   │   │   │   └── page.tsx
│       │   │   │   ├── audit-logs/
│       │   │   │   │   └── page.tsx
│       │   │   │   ├── dashboard/
│       │   │   │   ├── head-analytics/
│       │   │   │   │   └── page.tsx
│       │   │   │   ├── history/
│       │   │   │   │   └── page.tsx
│       │   │   │   ├── manage-questions/
│       │   │   │   │   └── page.tsx
│       │   │   │   ├── overview/
│       │   │   │   │   └── page.tsx
│       │   │   │   ├── reports/
│       │   │   │   │   └── page.tsx
│       │   │   │   └── layout.tsx
│       │   │   ├── (faculty)/
│       │   │   │   ├── papers/
│       │   │   │   │   ├── [id]/
│       │   │   │   │   │   ├── preview/
│       │   │   │   │   │   │   └── page.tsx
│       │   │   │   │   │   ├── submit/
│       │   │   │   │   │   │   └── page.tsx
│       │   │   │   │   │   └── page.tsx
│       │   │   │   │   ├── generate/
│       │   │   │   │   │   └── page.tsx
│       │   │   │   │   ├── new/
│       │   │   │   │   │   ├── new-paper-client.tsx
│       │   │   │   │   │   └── page.tsx
│       │   │   │   │   ├── page.tsx
│       │   │   │   │   └── papers-client.tsx
│       │   │   │   ├── questions/
│       │   │   │   │   ├── [id]/
│       │   │   │   │   │   ├── edit/
│       │   │   │   │   │   │   ├── edit-question-client.tsx
│       │   │   │   │   │   │   └── page.tsx
│       │   │   │   │   │   └── page.tsx
│       │   │   │   │   ├── bulk-upload/
│       │   │   │   │   │   └── page.tsx
│       │   │   │   │   ├── new/
│       │   │   │   │   │   ├── new-question-client.tsx
│       │   │   │   │   │   └── page.tsx
│       │   │   │   │   ├── page.tsx
│       │   │   │   │   └── questions-client.tsx
│       │   │   │   ├── submissions/
│       │   │   │   │   ├── page.tsx
│       │   │   │   │   └── submissions-client.tsx
│       │   │   │   ├── syllabus-ai/
│       │   │   │   │   ├── page.tsx
│       │   │   │   │   └── syllabus-ai-client-page.tsx
│       │   │   │   ├── templates/
│       │   │   │   │   ├── [id]/
│       │   │   │   │   │   └── page.tsx
│       │   │   │   │   ├── new/
│       │   │   │   │   │   ├── new-template-client.tsx
│       │   │   │   │   │   └── page.tsx
│       │   │   │   │   ├── page.tsx
│       │   │   │   │   └── templates-client.tsx
│       │   │   │   └── layout.tsx
│       │   │   ├── (institution-admin)/
│       │   │   │   ├── approve/
│       │   │   │   │   └── page.tsx
│       │   │   │   ├── billing/
│       │   │   │   │   └── page.tsx
│       │   │   │   ├── branding/
│       │   │   │   │   └── page.tsx
│       │   │   │   ├── roles/
│       │   │   │   │   └── page.tsx
│       │   │   │   ├── settings/
│       │   │   │   │   └── page.tsx
│       │   │   │   ├── structure/
│       │   │   │   │   └── page.tsx
│       │   │   │   ├── team/
│       │   │   │   │   └── page.tsx
│       │   │   │   └── layout.tsx
│       │   │   ├── (reviewer)/
│       │   │   │   ├── review/
│       │   │   │   │   ├── [paperId]/
│       │   │   │   │   │   └── page.tsx
│       │   │   │   │   └── page.tsx
│       │   │   │   └── layout.tsx
│       │   │   ├── (super-admin)/
│       │   │   │   ├── audit/
│       │   │   │   │   └── page.tsx
│       │   │   │   ├── flags/
│       │   │   │   │   └── page.tsx
│       │   │   │   ├── plans/
│       │   │   │   │   └── page.tsx
│       │   │   │   ├── support/
│       │   │   │   │   └── page.tsx
│       │   │   │   ├── tenants/
│       │   │   │   │   ├── [id]/
│       │   │   │   │   │   └── page.tsx
│       │   │   │   │   └── page.tsx
│       │   │   │   └── layout.tsx
│       │   │   ├── dashboard/
│       │   │   │   ├── error.tsx
│       │   │   │   └── page.tsx
│       │   │   ├── library/
│       │   │   │   ├── [templateId]/
│       │   │   │   │   └── page.tsx
│       │   │   │   └── page.tsx
│       │   │   ├── profile/
│       │   │   │   └── page.tsx
│       │   │   └── layout.tsx
│       │   ├── (auth)/
│       │   │   ├── forgot-password/
│       │   │   │   └── page.tsx
│       │   │   ├── invite/
│       │   │   │   ├── [token]/
│       │   │   │   │   └── page.tsx
│       │   │   │   └── page.tsx
│       │   │   ├── login/
│       │   │   │   └── page.tsx
│       │   │   ├── reset-password/
│       │   │   │   └── [token]/
│       │   │   │       └── page.tsx
│       │   │   ├── signup/
│       │   │   │   └── page.tsx
│       │   │   └── layout.tsx
│       │   ├── onboarding/
│       │   │   └── page.tsx
│       │   ├── unauthorized/
│       │   │   └── page.tsx
│       │   ├── error.tsx
│       │   ├── global-error.tsx
│       │   ├── globals.css
│       │   ├── layout.tsx
│       │   ├── loading.tsx
│       │   └── page.tsx
│       ├── components/
│       │   ├── ai/
│       │   │   ├── ai-suggestions-panel.tsx
│       │   │   ├── syllabus-analysis-client.tsx
│       │   │   └── syllabus-uploader.tsx
│       │   ├── analytics/
│       │   │   ├── audit-logs-client.tsx
│       │   │   ├── coverage-chart.tsx
│       │   │   ├── dashboard.tsx
│       │   │   ├── department-overview.tsx
│       │   │   └── faculty-table.tsx
│       │   ├── approvals/
│       │   │   ├── confirm-dialog.tsx
│       │   │   ├── paper-review-panel.tsx
│       │   │   ├── paper-viewer.tsx
│       │   │   ├── review-content.tsx
│       │   │   ├── review-history.tsx
│       │   │   ├── review-panel.tsx
│       │   │   ├── review-queue.tsx
│       │   │   └── submissions-list.tsx
│       │   ├── auth/
│       │   │   ├── auth-shell.tsx
│       │   │   ├── AuthLayout.tsx
│       │   │   ├── AuthPage.tsx
│       │   │   ├── ForgotPasswordForm.tsx
│       │   │   ├── institution-onboarding-form.tsx
│       │   │   ├── invite-acceptance-form.tsx
│       │   │   ├── InviteAcceptanceCard.tsx
│       │   │   ├── login-form.tsx
│       │   │   ├── ResetPasswordForm.tsx
│       │   │   ├── role-guard.tsx
│       │   │   └── signup-form.tsx
│       │   ├── institution-admin/
│       │   │   ├── branding-editor.tsx
│       │   │   ├── departments-page.tsx
│       │   │   ├── role-matrix.tsx
│       │   │   ├── structure-manager.tsx
│       │   │   ├── subjects-list.tsx
│       │   │   └── team-table.tsx
│       │   ├── landing/
│       │   │   ├── CTABanner.tsx
│       │   │   ├── FeaturesGrid.tsx
│       │   │   ├── Footer.tsx
│       │   │   ├── Hero.tsx
│       │   │   ├── HowItWorks.tsx
│       │   │   ├── Navbar.tsx
│       │   │   ├── Roles.tsx
│       │   │   └── SocialProof.tsx
│       │   ├── layout/
│       │   │   ├── admin-layout.tsx
│       │   │   ├── admin-sidebar.tsx
│       │   │   ├── breadcrumb.tsx
│       │   │   ├── command-palette.tsx
│       │   │   ├── dashboard-home.tsx
│       │   │   ├── dashboard-shell.tsx
│       │   │   ├── dashboard-sidebar.tsx
│       │   │   └── page-header.tsx
│       │   ├── onboarding/
│       │   │   ├── steps/
│       │   │   │   ├── AcademicConfig.tsx
│       │   │   │   ├── InstitutionDetails.tsx
│       │   │   │   └── InviteTeam.tsx
│       │   │   ├── OnboardingCard.tsx
│       │   │   └── StepIndicator.tsx
│       │   ├── papers/
│       │   │   ├── generator.tsx
│       │   │   ├── list.tsx
│       │   │   ├── paper-editor.tsx
│       │   │   ├── paper-export-button.tsx
│       │   │   └── status-badge.tsx
│       │   ├── question-bank/
│       │   │   ├── home.tsx
│       │   │   ├── metadata-panel.tsx
│       │   │   ├── question-card.tsx
│       │   │   ├── question-editor.tsx
│       │   │   ├── question-filter-bar.tsx
│       │   │   ├── question-list.tsx
│       │   │   └── tag-selector.tsx
│       │   ├── shared/
│       │   │   ├── activity-feed.tsx
│       │   │   ├── bulk-import-modal.tsx
│       │   │   ├── paper-preview-modal.tsx
│       │   │   └── settings-client.tsx
│       │   ├── super-admin/
│       │   │   ├── audit-logs-table.tsx
│       │   │   ├── feature-flags-table.tsx
│       │   │   ├── institutions-table.tsx
│       │   │   ├── platform-activity.tsx
│       │   │   └── workspace.tsx
│       │   ├── templates/
│       │   │   ├── builder.tsx
│       │   │   ├── global-library.tsx
│       │   │   ├── list.tsx
│       │   │   ├── section-builder.tsx
│       │   │   ├── template-card.tsx
│       │   │   └── template-preview.tsx
│       │   ├── ui/
│       │   │   ├── data-table.tsx
│       │   │   ├── sidebar.tsx
│       │   │   ├── stat-card.tsx
│       │   │   └── toggle-switch.tsx
│       │   └── error-boundary.tsx
│       ├── e2e/
│       │   ├── dashboard-role-flows.spec.ts
│       │   └── multi-tenancy-isolation.spec.ts
│       ├── hooks/
│       │   ├── use-admin-context.ts
│       │   ├── use-institution.ts
│       │   └── use-review-workflow.ts
│       ├── lib/
│       │   ├── api/
│       │   │   ├── client.ts
│       │   │   ├── index.ts
│       │   │   ├── mock.ts
│       │   │   └── production.ts
│       │   ├── academic.ts
│       │   ├── dashboard.ts
│       │   ├── env.ts
│       │   ├── error-utils.ts
│       │   └── supabase-browser.ts
│       ├── public/
│       │   ├── auth-visual.png
│       │   ├── hero-dashboard.png
│       │   ├── testimonial-academic-head.jpg
│       │   ├── testimonial-faculty.jpg
│       │   └── workflow-step-1.png
│       ├── .env.local
│       ├── .eslintrc.json
│       ├── fix-imports.js
│       ├── instrumentation-client.ts
│       ├── instrumentation.ts
│       ├── middleware.ts
│       ├── next-env.d.ts
│       ├── next.config.js
│       ├── package.json
│       ├── playwright.config.ts
│       ├── postcss.config.js
│       ├── sentry.edge.config.ts
│       ├── sentry.server.config.ts
│       ├── tailwind.config.ts
│       ├── tsconfig.json
│       ├── tsconfig.tsbuildinfo
│       └── vitest.config.ts
├── docs/
│   ├── api/
│   ├── product/
│   │   └── Pilot_Success_Criteria.md
│   ├── runbooks/
│   ├── technical/
│   │   ├── INTEGRATION_EXAMPLES.md
│   │   └── Tenant_Model_and_Role_Matrix.md
│   ├── QUICK_TESTING_GUIDE.md
│   ├── SEED_DATA_GUIDE.md
│   └── TEST_CASES_CRITICAL_WORKFLOWS.md
├── packages/
│   ├── types/
│   │   ├── src/
│   │   │   ├── domain/
│   │   │   │   ├── academic.ts
│   │   │   │   ├── institution.ts
│   │   │   │   ├── paper.ts
│   │   │   │   ├── question.ts
│   │   │   │   ├── template.ts
│   │   │   │   └── user.ts
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── ui/ (Shared UI package)
├── scratch/
├── scripts/
│   ├── check-env.ts
│   ├── db-migrate.js
│   ├── db-start.js
│   ├── db-stop.js
│   ├── pilot-seed.ts
│   ├── seed-academic-structure.ts
│   ├── seed-test-data.ts
│   ├── setup-database.ps1
│   └── test-db-connection.js
├── supabase/
│   ├── migrations/
│   │   ├── 20260401000100_auth_tenant_foundation.sql
│   │   ├── 20260402000100_content_and_rls.sql
│   │   ├── 20260403000100_papers_workflow.sql
│   │   ├── 20260403000200_academic_structure.sql
│   │   ├── 20260403000300_content_review_permissions.sql
│   │   ├── 20260404000100_question_bank_foundation.sql
│   │   ├── 20260404000300_versioning_and_duplicates.sql
│   │   ├── 20260404000400_template_system_v2.sql
│   │   ├── 20260405000100_academic_structure_complete.sql
│   │   ├── 20260409000100_random_questions_rpc.sql
│   │   ├── 20260410000100_audit_logs.sql
│   │   ├── 20260410000200_feature_flags.sql
│   │   ├── 20260410000300_missing_indexes.sql
│   │   ├── 20260410000400_missing_rls.sql
│   │   ├── 20260410000500_audit_triggers.sql
│   │   ├── 20260410000600_analytics_rpc.sql
│   │   ├── 20260410000700_standardize_naming.sql
│   │   └── 20260410000800_update_audit_triggers.sql
│   ├── snippets/
│   ├── config.toml
│   ├── kong.yml
│   ├── seed.sql
│   └── vector.yml
├── .dockerignore
├── .env.example
├── .env.local
├── .env.production.template
├── .eslintrc.cjs
├── .gitattributes
├── .gitignore
├── api-startup.log
├── Architecture.md
├── CLEANUP_SUMMARY.md
├── COMPREHENSIVE_AUDIT_REPORT.md
├── db-audit.txt
├── DOCKER_ARCHITECTURE.md
├── DOCKER_DATABASE_SETUP.md
├── DOCKER_QUICK_REFERENCE.md
├── DOCKER_SETUP_COMPLETE.md
├── docker-compose.yml
├── ERROR_REPORT_CHECKLIST.md
├── FILE_STRUCTURE.md
├── HOW_TO_CHECK_CONNECTION.md
├── HOW_TO_RUN.md
├── Logo.png
├── package.json
├── paying_customer_gaps.md
├── pilot_pitch_one_pager.md
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── PRD.md
├── pre_pilot_smoke_test.md
├── QUICK_START.md
├── README_DOCKER.md
├── README.md
├── TEST_CREDENTIALS.md
├── TRD.md
├── tsconfig.base.json
├── turbo.json
└── update_structure.js

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
  - **Core Domains**: Top-level modular structure including `academic`, `ai`, `analytics`, `approvals`, `auth`, `institution`, `invitations`, `mailer`, `onboarding`, `papers`, `platform-admin`, `questions`, `templates`, and `users`.

### Frontend (Next.js)
- **Auth Routes**: `(auth)` - Login, signup, password resets
- **App Routes**: `(app)` - Flattened Role-based application structure mapped directly through unified gateways
  - `(academic-head)`: Oversight & analytics
  - `(faculty)`: Question and exam composition
  - `(institution-admin)`: Structure, billing, team setup
  - `(reviewer)`: Paper verification
  - `(super-admin)`: Global tenants & flags
- **Components**: Component modules matched seamlessly to routing domains (`/components/question-bank`, `/components/approvals`, etc.)
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
