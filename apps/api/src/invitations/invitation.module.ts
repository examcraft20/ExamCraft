import { Module } from "@nestjs/common";
import { TenantModule } from "../tenant/tenant.module";
import { SupabaseModule } from "../supabase/supabase.module";
import { InvitationController } from "./invitation.controller";
import { InvitationService } from "./invitation.service";

@Module({
  imports: [SupabaseModule, TenantModule],
  controllers: [InvitationController],
  providers: [InvitationService],
  exports: [InvitationService]
})
export class InvitationModule {}
