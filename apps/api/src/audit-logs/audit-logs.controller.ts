import { Controller, Get, InternalServerErrorException } from "@nestjs/common";
import { RequirePermissions } from "../auth/decorators/permissions.decorator";
import { RequireRoles } from "../auth/decorators/roles.decorator";
import { CurrentInstitution } from "../common/decorators/institution-context.decorator";
import { InstitutionContext } from "../common/types/authenticated-request";
import { UseInstitutionAuthorization } from "../institution/guards/institution-context.guard";
import { AuditLogsService } from "./audit-logs.service";

@Controller({ path: "audit-logs", version: "1" })
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @UseInstitutionAuthorization()
  @RequireRoles("institution_admin", "super_admin")
  getAuditLogs(@CurrentInstitution() institutionContext: InstitutionContext | undefined) {
    if (!institutionContext) {
      throw new InternalServerErrorException("Missing institution context.");
    }

    return this.auditLogsService.listAuditLogs(institutionContext);
  }
}
