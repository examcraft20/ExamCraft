import { Controller, Get, InternalServerErrorException } from "@nestjs/common";
import { RequirePermissions } from "../auth/decorators/permissions.decorator";
import { RequireRoles } from "../auth/decorators/roles.decorator";
import { CurrentTenant } from "../common/decorators/tenant-context.decorator";
import { TenantContext } from "../common/types/authenticated-request";
import { UseTenantAuthorization } from "../tenant/guards/tenant-context.guard";
import { AuditLogsService } from "./audit-logs.service";

@Controller({ path: "audit-logs", version: "1" })
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @UseTenantAuthorization()
  @RequireRoles("institution_admin", "super_admin")
  getAuditLogs(@CurrentTenant() tenantContext: TenantContext | undefined) {
    if (!tenantContext) {
      throw new InternalServerErrorException("Missing tenant context.");
    }

    return this.auditLogsService.listAuditLogs(tenantContext);
  }
}
