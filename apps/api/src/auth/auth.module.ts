import { Global, Module } from "@nestjs/common";
import { SupabaseModule } from "../supabase/supabase.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { PermissionsGuard } from "./guards/permissions.guard";
import { RolesGuard } from "./guards/roles.guard";
import { SupabaseAuthGuard } from "./guards/supabase-auth.guard";

@Global()
@Module({
  imports: [SupabaseModule],
  controllers: [AuthController],
  providers: [AuthService, SupabaseAuthGuard, RolesGuard, PermissionsGuard],
  exports: [AuthService, SupabaseAuthGuard, RolesGuard, PermissionsGuard]
})
export class AuthModule {}
