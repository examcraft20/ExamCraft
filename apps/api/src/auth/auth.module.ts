import { Module } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { SupabaseModule } from "../supabase/supabase.module";
import { AuthController } from "./auth.controller";
import { PermissionsGuard } from "./guards/permissions.guard";
import { RolesGuard } from "./guards/roles.guard";
import { SupabaseAuthGuard } from "./guards/supabase-auth.guard";

@Module({
  imports: [SupabaseModule],
  controllers: [AuthController],
  providers: [Reflector, SupabaseAuthGuard, RolesGuard, PermissionsGuard],
  exports: [SupabaseAuthGuard, RolesGuard, PermissionsGuard]
})
export class AuthModule {}
