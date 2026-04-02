import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { EnvModule } from "./config/env.module";
import { AuthModule } from "./auth/auth.module";
import { TenantModule } from "./tenant/tenant.module";
import { OnboardingModule } from "./onboarding/onboarding.module";
import { InvitationModule } from "./invitations/invitation.module";

@Module({
  imports: [EnvModule, AuthModule, TenantModule, OnboardingModule, InvitationModule],
  controllers: [AppController]
})
export class AppModule {}
