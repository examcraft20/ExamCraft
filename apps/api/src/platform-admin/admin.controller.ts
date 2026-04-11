import { Controller, Get, Post, Body, Patch, Param, UseGuards, Query } from "@nestjs/common";
import { RequireRoles } from "../auth/decorators/roles.decorator";
import { SupabaseAuthGuard } from "../auth/guards/supabase-auth.guard";
import { FlagsService } from "./flags.service";
import { AdminAuditService } from "./audit.service";

@Controller({ path: "platform-admin", version: "1" })
@UseGuards(SupabaseAuthGuard)
@RequireRoles("super_admin")
export class AdminController {
  constructor(
    private readonly flagsService: FlagsService,
    private readonly auditService: AdminAuditService,
  ) {}

  @Get("flags")
  async getFlags() {
    return this.flagsService.getFlags();
  }

  @Patch("flags/:key")
  async updateFlag(@Param("key") key: string, @Body("value") value: boolean) {
    return this.flagsService.updateFlag(key, value);
  }

  @Get("audit-logs")
  async getAuditLogs(@Query() filters: any) {
    return this.auditService.queryLogs(filters);
  }

  @Post("audit-logs")
  async logPlatformEvent(@Body() log: any) {
    return this.auditService.writeLog(log);
  }
}
