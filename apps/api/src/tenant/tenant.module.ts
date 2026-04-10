import { Global, Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { SupabaseModule } from "../supabase/supabase.module";
import { TenantController } from "./tenant.controller";
import { TenantContextGuard } from "./guards/tenant-context.guard";
import { TenantContextService } from "./tenant-context.service";

@Global()
@Module({
  imports: [SupabaseModule, AuthModule],
  controllers: [TenantController],
  providers: [TenantContextService, TenantContextGuard],
  exports: [TenantContextService, TenantContextGuard]
})
export class TenantModule {}
