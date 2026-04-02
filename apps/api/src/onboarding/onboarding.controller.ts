import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { SupabaseAuthGuard } from "../auth/guards/supabase-auth.guard";
import { OnboardingService } from "./onboarding.service";
import type { CreateInstitutionOnboardingDto } from "./dto/create-institution-onboarding.dto";

@Controller("onboarding")
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Post("institution")
  @UseGuards(SupabaseAuthGuard)
  createInstitution(@Body() body: CreateInstitutionOnboardingDto) {
    return this.onboardingService.createInstitutionWorkspace(body);
  }
}
