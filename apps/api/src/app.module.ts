import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { EnvModule } from "./config/env.module";
import { AuthModule } from "./auth/auth.module";
import { TenantModule } from "./tenant/tenant.module";
import { OnboardingModule } from "./onboarding/onboarding.module";
import { InvitationModule } from "./invitations/invitation.module";
import { PeopleModule } from "./people/people.module";
import { ContentModule } from "./content/content.module";

@Module({
  imports: [
    EnvModule,
    AuthModule,
    TenantModule,
    OnboardingModule,
    InvitationModule,
    PeopleModule,
    ContentModule
  ],
  controllers: [AppController]
})
export class AppModule {}
