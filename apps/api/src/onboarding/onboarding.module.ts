import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { SupabaseModule } from "../supabase/supabase.module";
import { OnboardingController } from "./onboarding.controller";
import { OnboardingService } from "./onboarding.service";

@Module({
  imports: [SupabaseModule, AuthModule],
  controllers: [OnboardingController],
  providers: [OnboardingService],
  exports: [OnboardingService]
})
export class OnboardingModule {}
