import { Module, MiddlewareConsumer, RequestMethod } from "@nestjs/common";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { AppController } from "./app.controller";
import { EnvModule } from "./config/env.module";
import { AuthModule } from "./auth/auth.module";
import { InstitutionModule } from "./institution/institution.module";
import { OnboardingModule } from "./onboarding/onboarding.module";
import { InvitationModule } from "./invitations/invitation.module";
import { UsersModule } from "./users/users.module";
import { QuestionsModule } from "./questions/questions.module";
import { TemplatesModule } from "./templates/templates.module";
import { PapersModule } from "./papers/papers.module";
import { ApprovalsModule } from "./approvals/approvals.module";
import { AcademicModule } from "./academic/academic.module";
import { AnalyticsModule } from "./analytics/analytics.module";
import { GlobalTemplatesModule } from "./global-templates/global-templates.module";
import { AuditLogsModule } from "./audit-logs/audit-logs.module";
import { SupabaseModule } from "./supabase/supabase.module";
import { MailerModule } from "./mailer/mailer.module";
import { HealthModule } from "./health/health.module";
import { AIModule } from "./ai/ai.module";
import { AdminModule } from "./platform-admin/admin.module";
import { SanitizeMiddleware } from "./common/middleware/sanitize.middleware";
import { MutationAuthGuard } from "./common/guards/mutation-auth.guard";
import { AuditLogInterceptor } from "./common/interceptors/audit-log.interceptor";
import { AuditLogsService } from "./audit-logs/audit-logs.service";

@Module({
  imports: [
    ThrottlerModule.forRoot([
      { name: 'short',  ttl: 1000,  limit: 1000  },
      { name: 'medium', ttl: 60000, limit: 10000 },
      { name: 'auth',   ttl: 60000, limit: 1000  },
    ]),
    EnvModule,
    AuthModule,
    InstitutionModule,
    OnboardingModule,
    InvitationModule,
    UsersModule,
    QuestionsModule,
    TemplatesModule,
    PapersModule,
    ApprovalsModule,
    AcademicModule,
    AnalyticsModule,
    GlobalTemplatesModule,
    AuditLogsModule,
    SupabaseModule,
    MailerModule,
    HealthModule,
    AIModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: MutationAuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLogInterceptor,
    },
    AuditLogsService,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SanitizeMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
