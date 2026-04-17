import { describe, expect, it, vi } from "vitest";
import { OnboardingController } from "./onboarding.controller";

describe("OnboardingController", () => {
  it("passes the authenticated user id to the onboarding service", () => {
    const onboardingService = {
      createInstitutionWorkspace: vi.fn()
    };
    const controller = new OnboardingController(onboardingService as never);
    const body = {
      institutionName: "ExamCraft College",
      institutionSlug: "examcraft-college",
      institutionType: "college" as const
    };

    controller.createInstitution(
      {
        id: "user-1",
        email: "admin@example.com",
        roleCodes: [],
        isSuperAdmin: false
      },
      body
    );

    expect(onboardingService.createInstitutionWorkspace).toHaveBeenCalledWith("user-1", body);
  });
});
