import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { InstitutionModule } from "../institution/institution.module";
import { SupabaseModule } from "../supabase/supabase.module";
import { InvitationController } from "./invitation.controller";
import { InvitationService } from "./invitation.service";

@Module({
  imports: [SupabaseModule, InstitutionModule, AuthModule],
  controllers: [InvitationController],
  providers: [InvitationService],
  exports: [InvitationService]
})
export class InvitationModule {}
