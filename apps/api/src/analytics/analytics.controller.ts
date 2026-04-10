import { Controller, Get, InternalServerErrorException } from "@nestjs/common";
import { RequirePermissions } from "../auth/decorators/permissions.decorator";
import { RequireRoles } from "../auth/decorators/roles.decorator";
import { CurrentTenant } from "../common/decorators/tenant-context.decorator";
import type { TenantContext } from "../common/types/authenticated-request";
import { UseTenantAuthorization } from "../tenant/guards/tenant-context.guard";
import { AnalyticsService } from "./analytics.service";

@Controller({ path: "analytics", version: "1" })
@UseTenantAuthorization()
@RequireRoles("institution_admin", "academic_head", "super_admin")
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get("summary")
  @RequirePermissions("analytics.read")
  async getSummaryStats(@CurrentTenant() tenantContext: TenantContext | undefined) {
    if (!tenantContext) {
      throw new InternalServerErrorException("Missing tenant context.");
    }
    return this.analyticsService.getSummaryStats(tenantContext.institutionId);
  }
}
