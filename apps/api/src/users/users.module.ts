import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { InvitationModule } from "../invitations/invitation.module";
import { SupabaseModule } from "../supabase/supabase.module";
import { InstitutionModule } from "../institution/institution.module";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";

@Module({
  imports: [SupabaseModule, InstitutionModule, InvitationModule, AuthModule],
  controllers: [UsersController],
  providers: [UsersService]
})
export class UsersModule {}
