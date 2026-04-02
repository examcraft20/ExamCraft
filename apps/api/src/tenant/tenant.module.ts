import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { SupabaseModule } from "../supabase/supabase.module";
import { TenantController } from "./tenant.controller";
import { TenantContextGuard } from "./guards/tenant-context.guard";
import { TenantContextService } from "./tenant-context.service";
import { RolesGuard } from "../auth/guards/roles.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";

@Module({
  imports: [SupabaseModule, AuthModule],
  controllers: [TenantController],
  providers: [TenantContextService, TenantContextGuard, RolesGuard, PermissionsGuard],
  exports: [TenantContextService, TenantContextGuard]
})
export class TenantModule {}
