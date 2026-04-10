import { Module, MiddlewareConsumer, RequestMethod } from "@nestjs/common";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { AppController } from "./app.controller";
import { EnvModule } from "./config/env.module";
import { AuthModule } from "./auth/auth.module";
import { TenantModule } from "./tenant/tenant.module";
import { OnboardingModule } from "./onboarding/onboarding.module";
import { InvitationModule } from "./invitations/invitation.module";
import { PeopleModule } from "./people/people.module";
import { ContentModule } from "./content/content.module";
import { AcademicModule } from "./academic/academic.module";
import { AcademicStructureModule } from "./modules/academic-structure/academic-structure.module";
import { AnalyticsModule } from "./analytics/analytics.module";
import { GlobalTemplatesModule } from "./global-templates/global-templates.module";
import { AuditLogsModule } from "./audit-logs/audit-logs.module";
import { SupabaseModule } from "./supabase/supabase.module";
import { MailerModule } from "./modules/mailer/mailer.module";
import { HealthModule } from "./health/health.module";
import { SanitizeMiddleware } from "./common/middleware/sanitize.middleware";
import { CsrfGuard } from "./common/guards/csrf.guard";
import { AuditLogInterceptor } from "./common/interceptors/audit-log.interceptor";
import { AuditLogsService } from "./audit-logs/audit-logs.service";

@Module({
  imports: [
    ThrottlerModule.forRoot([
      { name: 'short',  ttl: 1000,  limit: 10  },
      { name: 'medium', ttl: 60000, limit: 100 },
      { name: 'auth',   ttl: 60000, limit: 10  },
    ]),
    EnvModule,
    AuthModule,
    TenantModule,
    OnboardingModule,
    InvitationModule,
    PeopleModule,
    ContentModule,
    AcademicModule,
    AcademicStructureModule,
    AnalyticsModule,
    GlobalTemplatesModule,
    AuditLogsModule,
    SupabaseModule,
    MailerModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: CsrfGuard,
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
