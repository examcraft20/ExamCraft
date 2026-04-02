import { Controller, Get } from "@nestjs/common";
import { CurrentTenant } from "../common/decorators/tenant-context.decorator";
import type { TenantContext } from "../common/types/authenticated-request";
import { RequirePermissions } from "../auth/decorators/permissions.decorator";
import { UseTenantAuthorization } from "./guards/tenant-context.guard";

@Controller("tenant")
export class TenantController {
  @Get("context")
  @UseTenantAuthorization()
  @RequirePermissions("global_templates.read")
  getContext(@CurrentTenant() tenantContext: TenantContext | undefined) {
    return {
      tenantContext
    };
  }
}
