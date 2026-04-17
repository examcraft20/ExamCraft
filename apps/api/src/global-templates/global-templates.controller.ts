import { Controller, Get, Post, Param, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { RequirePermissions } from "../auth/decorators/permissions.decorator";
import { RequireRoles } from "../auth/decorators/roles.decorator";
import { CurrentInstitution } from "../common/decorators/institution-context.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import type { AuthenticatedUser, InstitutionContext } from "../common/types/authenticated-request";
import { GlobalTemplatesService } from "./global-templates.service";
import { UseInstitutionAuthorization } from "../institution/guards/institution-context.guard";

@Controller({ path: "global-templates", version: "1" })
@UseInstitutionAuthorization()
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
    @CurrentInstitution() institutionContext: InstitutionContext | undefined,
    @CurrentUser() currentUser: AuthenticatedUser | undefined,
    @Param("id") templateId: string
  ) {
    if (!institutionContext || !currentUser) {
      throw new InternalServerErrorException("Missing institution or user context.");
    }

    return this.globalTemplatesService.cloneTemplate(institutionContext.institutionId, currentUser.id, templateId);
  }
}
