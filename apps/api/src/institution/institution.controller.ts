import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  InternalServerErrorException,
  Param,
  Patch,
  UseGuards
} from "@nestjs/common";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { CurrentInstitution } from "../common/decorators/institution-context.decorator";
import type { AuthenticatedUser, InstitutionContext } from "../common/types/authenticated-request";
import { RequirePermissions } from "../auth/decorators/permissions.decorator";
import { RequireRoles } from "../auth/decorators/roles.decorator";
import { SupabaseAuthGuard } from "../auth/guards/supabase-auth.guard";
import { UseInstitutionAuthorization } from "./guards/institution-context.guard";
import { InstitutionContextService } from "./institution-context.service";
import { UpdateInstitutionStatusDto } from "./dto/update-institution-status.dto";
import { UpdateBrandingDto } from "./dto/update-branding.dto";

@Controller({ path: "institution", version: "1" })
export class InstitutionController {
  constructor(private readonly institutionContextService: InstitutionContextService) {}

  @Get("memberships")
  @UseGuards(SupabaseAuthGuard)
  getMemberships(@CurrentUser() currentUser: AuthenticatedUser | undefined) {
    if (!currentUser) {
      throw new InternalServerErrorException("Missing authenticated user context.");
    }

    return this.institutionContextService.listMemberships(currentUser.id);
  }

  @Get("context")
  @UseInstitutionAuthorization()
  @RequirePermissions("global_templates.read")
  getContext(@CurrentInstitution() institutionContext: InstitutionContext | undefined) {
    return {
      institutionContext
    };
  }

  @Get("dashboard-summary")
  @UseInstitutionAuthorization()
  @RequireRoles("institution_admin", "academic_head", "reviewer_approver", "faculty")
  getDashboardSummary(@CurrentInstitution() institutionContext: InstitutionContext | undefined) {
    if (!institutionContext) {
      throw new InternalServerErrorException("Missing institution context.");
    }

    return this.institutionContextService.getInstitutionDashboardSummary(institutionContext.institutionId);
  }

  @Get("platform-summary")
  @UseGuards(SupabaseAuthGuard)
  getPlatformSummary(@CurrentUser() currentUser: AuthenticatedUser | undefined) {
    if (!currentUser) {
      throw new InternalServerErrorException("Missing authenticated user context.");
    }

    if (!currentUser.isSuperAdmin) {
      throw new ForbiddenException("You do not have access to the platform dashboard.");
    }

    return this.institutionContextService.getPlatformDashboardSummary();
  }

  @Get("platform-institutions")
  @UseGuards(SupabaseAuthGuard)
  getPlatformInstitutions(@CurrentUser() currentUser: AuthenticatedUser | undefined) {
    if (!currentUser) {
      throw new InternalServerErrorException("Missing authenticated user context.");
    }

    if (!currentUser.isSuperAdmin) {
      throw new ForbiddenException("You do not have access to platform institution controls.");
    }

    return this.institutionContextService.listPlatformInstitutions();
  }

  @Patch("platform-institutions/:institutionId/status")
  @UseGuards(SupabaseAuthGuard)
  updatePlatformInstitutionStatus(
    @CurrentUser() currentUser: AuthenticatedUser | undefined,
    @Param("institutionId") institutionId: string,
    @Body() body: UpdateInstitutionStatusDto
  ) {
    if (!currentUser) {
      throw new InternalServerErrorException("Missing authenticated user context.");
    }

    if (!currentUser.isSuperAdmin) {
      throw new ForbiddenException("You do not have access to platform institution controls.");
    }

    return this.institutionContextService.updateInstitutionStatus(
      institutionId,
      body.status,
      currentUser.id,
      body.note
    );
  }

  @Get("platform-audit-feed")
  @UseGuards(SupabaseAuthGuard)
  getPlatformAuditFeed(@CurrentUser() currentUser: AuthenticatedUser | undefined) {
    if (!currentUser) {
      throw new InternalServerErrorException("Missing authenticated user context.");
    }

    if (!currentUser.isSuperAdmin) {
      throw new ForbiddenException("You do not have access to platform audit activity.");
    }

    return this.institutionContextService.getPlatformAuditFeed();
  }

  @Patch("branding")
  @UseInstitutionAuthorization()
  @RequireRoles("institution_admin")
  updateBranding(
    @CurrentInstitution() institutionContext: InstitutionContext | undefined,
    @Body() body: UpdateBrandingDto
  ) {
    if (!institutionContext) {
      throw new InternalServerErrorException("Missing institution context.");
    }

    return this.institutionContextService.updateInstitutionBranding(
      institutionContext.institutionId,
      body
    );
  }
}
