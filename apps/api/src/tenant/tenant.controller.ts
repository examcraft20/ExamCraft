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
import { CurrentTenant } from "../common/decorators/tenant-context.decorator";
import type { AuthenticatedUser, TenantContext } from "../common/types/authenticated-request";
import { RequirePermissions } from "../auth/decorators/permissions.decorator";
import { RequireRoles } from "../auth/decorators/roles.decorator";
import { SupabaseAuthGuard } from "../auth/guards/supabase-auth.guard";
import { UseTenantAuthorization } from "./guards/tenant-context.guard";
import { TenantContextService } from "./tenant-context.service";
import { UpdateInstitutionStatusDto } from "./dto/update-institution-status.dto";

@Controller("tenant")
export class TenantController {
  constructor(private readonly tenantContextService: TenantContextService) {}

  @Get("memberships")
  @UseGuards(SupabaseAuthGuard)
  getMemberships(@CurrentUser() currentUser: AuthenticatedUser | undefined) {
    if (!currentUser) {
      throw new InternalServerErrorException("Missing authenticated user context.");
    }

    return this.tenantContextService.listMemberships(currentUser.id);
  }

  @Get("context")
  @UseTenantAuthorization()
  @RequirePermissions("global_templates.read")
  getContext(@CurrentTenant() tenantContext: TenantContext | undefined) {
    return {
      tenantContext
    };
  }

  @Get("dashboard-summary")
  @UseTenantAuthorization()
  @RequireRoles("institution_admin", "academic_head", "reviewer_approver", "faculty")
  getDashboardSummary(@CurrentTenant() tenantContext: TenantContext | undefined) {
    if (!tenantContext) {
      throw new InternalServerErrorException("Missing tenant context.");
    }

    return this.tenantContextService.getInstitutionDashboardSummary(tenantContext.institutionId);
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

    return this.tenantContextService.getPlatformDashboardSummary();
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

    return this.tenantContextService.listPlatformInstitutions();
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

    return this.tenantContextService.updateInstitutionStatus(
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

    return this.tenantContextService.getPlatformAuditFeed();
  }
}
