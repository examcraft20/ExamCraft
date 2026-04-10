import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { InvitationModule } from "../invitations/invitation.module";
import { SupabaseModule } from "../supabase/supabase.module";
import { TenantModule } from "../tenant/tenant.module";
import { PeopleController } from "./people.controller";
import { PeopleService } from "./people.service";

@Module({
  imports: [SupabaseModule, TenantModule, InvitationModule, AuthModule],
  controllers: [PeopleController],
  providers: [PeopleService]
})
export class PeopleModule {}
