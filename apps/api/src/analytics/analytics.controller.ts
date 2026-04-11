import { Controller, Get, Query, InternalServerErrorException } from "@nestjs/common";
import { RequirePermissions } from "../auth/decorators/permissions.decorator";
import { RequireRoles } from "../auth/decorators/roles.decorator";
import { CurrentInstitution } from "../common/decorators/institution-context.decorator";
import type { InstitutionContext } from "../common/types/authenticated-request";
import { UseInstitutionAuthorization } from "../institution/guards/institution-context.guard";
import { AnalyticsService } from "./analytics.service";
import { ReportsService } from "./reports.service";

@Controller({ path: "analytics", version: "1" })
@UseInstitutionAuthorization()
@RequireRoles("institution_admin", "academic_head", "super_admin")
export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly reportsService: ReportsService,
  ) {}

  @Get("summary")
  @RequirePermissions("analytics.read")
  async getSummaryStats(@CurrentInstitution() institutionContext: InstitutionContext | undefined) {
    if (!institutionContext) {
      throw new InternalServerErrorException("Missing institution context.");
    }
    return this.analyticsService.getSummaryStats(institutionContext.institutionId);
  }

  @Get("coverage")
  @RequirePermissions("analytics.read")
  async getQuestionCoverage(@CurrentInstitution() institutionContext: InstitutionContext | undefined) {
    if (!institutionContext) {
      throw new InternalServerErrorException("Missing institution context.");
    }
    return this.analyticsService.getQuestionCoverage(institutionContext.institutionId);
  }

  @Get("difficulty")
  @RequirePermissions("analytics.read")
  async getDifficultyDistribution(@CurrentInstitution() institutionContext: InstitutionContext | undefined) {
    if (!institutionContext) {
      throw new InternalServerErrorException("Missing institution context.");
    }
    return this.analyticsService.getDifficultyDistribution(institutionContext.institutionId);
  }

  @Get("trends")
  @RequirePermissions("analytics.read")
  async getUsageTrends(@CurrentInstitution() institutionContext: InstitutionContext | undefined) {
    if (!institutionContext) {
      throw new InternalServerErrorException("Missing institution context.");
    }
    return this.analyticsService.getUsageTrends(institutionContext.institutionId);
  }

  @Get("export")
  @RequirePermissions("analytics.read")
  async exportReport(
    @CurrentInstitution() institutionContext: InstitutionContext | undefined,
    @Query("format") format: "csv" | "pdf",
    @Query("type") type: string,
  ) {
    if (!institutionContext) {
      throw new InternalServerErrorException("Missing institution context.");
    }
    
    if (format === "csv") {
      return this.reportsService.exportCsv(institutionContext.institutionId, type);
    }
    return this.reportsService.exportPdf(institutionContext.institutionId, type);
  }
}
