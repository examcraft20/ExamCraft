import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { TenantModule } from "../tenant/tenant.module";
import { SupabaseModule } from "../supabase/supabase.module";
import { InvitationController } from "./invitation.controller";
import { InvitationService } from "./invitation.service";

@Module({
  imports: [SupabaseModule, TenantModule, AuthModule],
  controllers: [InvitationController],
  providers: [InvitationService],
  exports: [InvitationService]
})
export class InvitationModule {}
