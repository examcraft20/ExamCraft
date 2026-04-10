import { Controller, Get, Post, Param, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { RequirePermissions } from "../auth/decorators/permissions.decorator";
import { RequireRoles } from "../auth/decorators/roles.decorator";
import { CurrentTenant } from "../common/decorators/tenant-context.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import type { AuthenticatedUser, TenantContext } from "../common/types/authenticated-request";
import { GlobalTemplatesService } from "./global-templates.service";
import { UseTenantAuthorization } from "../tenant/guards/tenant-context.guard";

@Controller({ path: "global-templates", version: "1" })
@UseTenantAuthorization()
export class GlobalTemplatesController {
  constructor(private readonly globalTemplatesService: GlobalTemplatesService) {}

  @Get()
  @RequireRoles("institution_admin", "academic_head", "faculty")
  async listGlobalTemplates() {
    return this.globalTemplatesService.listGlobalTemplates();
  }

  @Post(":id/clone")
  @RequireRoles("institution_admin", "academic_head")
  @RequirePermissions("templates.create")
  async cloneTemplate(
    @CurrentTenant() tenantContext: TenantContext | undefined,
    @CurrentUser() currentUser: AuthenticatedUser | undefined,
    @Param("id") templateId: string
  ) {
    if (!tenantContext || !currentUser) {
      throw new InternalServerErrorException("Missing tenant or user context.");
    }

    return this.globalTemplatesService.cloneTemplate(tenantContext.institutionId, currentUser.id, templateId);
  }
}
