import { Controller, Get, Post, Body, Query, UseGuards } from "@nestjs/common";
import { RequireRoles } from "../auth/decorators/roles.decorator";
import { SupabaseAuthGuard } from "../auth/guards/supabase-auth.guard";
import { AdminAuditService } from "./audit.service";

@Controller({ path: "platform-admin", version: "1" })
@UseGuards(SupabaseAuthGuard)
@RequireRoles("super_admin")
export class AdminController {
  constructor(
    private readonly auditService: AdminAuditService,
  ) {}

  @Get("audit-logs")
  async getAuditLogs(@Query() filters: Record<string, unknown>) {
    return this.auditService.queryLogs(filters);
  }

  @Post("audit-logs")
  async logPlatformEvent(@Body() log: Record<string, unknown>) {
    return this.auditService.writeLog(log);
  }
}
