import {
  Body,
  Controller,
  InternalServerErrorException,
  Post,
  UseGuards
} from "@nestjs/common";
import { SupabaseAuthGuard } from "../auth/guards/supabase-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../common/types/authenticated-request";
import { OnboardingService } from "./onboarding.service";
import type { CreateInstitutionOnboardingDto } from "./dto/create-institution-onboarding.dto";

@Controller({ path: "onboarding", version: "1" })
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Post("institution")
  @UseGuards(SupabaseAuthGuard)
  createInstitution(
    @CurrentUser() currentUser: AuthenticatedUser | undefined,
    @Body() body: CreateInstitutionOnboardingDto
  ) {
    if (!currentUser) {
      throw new InternalServerErrorException("Missing authenticated user context.");
    }

    return this.onboardingService.createInstitutionWorkspace(currentUser.id, body);
  }
}
