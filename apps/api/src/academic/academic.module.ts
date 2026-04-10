import { Module } from "@nestjs/common";
import { AcademicController } from "./academic.controller";
import { AcademicService } from "./academic.service";

import { AuthModule } from "../auth/auth.module";
import { SupabaseModule } from "../supabase/supabase.module";
import { TenantModule } from "../tenant/tenant.module";

@Module({
  imports: [SupabaseModule, TenantModule, AuthModule],
  controllers: [AcademicController],
  providers: [AcademicService],
  exports: [AcademicService]
})
export class AcademicModule {}