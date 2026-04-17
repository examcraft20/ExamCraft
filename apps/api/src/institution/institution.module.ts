import { Global, Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { SupabaseModule } from "../supabase/supabase.module";
import { InstitutionController } from "./institution.controller";
import { InstitutionContextGuard } from "./guards/institution-context.guard";
import { InstitutionMembershipsService } from "./services/institution-memberships.service";
import { InstitutionDashboardsService } from "./services/institution-dashboards.service";
import { PlatformAdministrationService } from "./services/platform-administration.service";
import { InstitutionBrandingService } from "./services/institution-branding.service";

@Global()
@Module({
  imports: [SupabaseModule, AuthModule],
  controllers: [InstitutionController],
  providers: [
    InstitutionMembershipsService, 
    InstitutionDashboardsService,
    PlatformAdministrationService,
    InstitutionBrandingService,
    InstitutionContextGuard
  ],
  exports: [
    InstitutionMembershipsService, 
    InstitutionDashboardsService,
    PlatformAdministrationService,
    InstitutionBrandingService,
    InstitutionContextGuard
  ]
})
export class InstitutionModule {}
