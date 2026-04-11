import { Module } from "@nestjs/common";
import { SupabaseModule } from "../supabase/supabase.module";
import { AnalyticsController } from "./analytics.controller";
import { AnalyticsService } from "./analytics.service";
import { ReportsService } from "./reports.service";

@Module({
  imports: [SupabaseModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, ReportsService]
})
export class AnalyticsModule {}
