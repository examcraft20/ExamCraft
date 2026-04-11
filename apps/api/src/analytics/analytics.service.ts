import { Injectable, Inject, InternalServerErrorException } from "@nestjs/common";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ADMIN_CLIENT } from "../supabase/supabase.constants";

@Injectable()
export class AnalyticsService {
  constructor(
    @Inject(SUPABASE_ADMIN_CLIENT)
    private readonly supabaseAdminClient: SupabaseClient
  ) {}

  async getSummaryStats(institutionId: string) {
    const { data, error } = await this.supabaseAdminClient.rpc(
      "get_institution_stats",
      { p_institution_id: institutionId }
    );

    if (error || !data) {
      throw new InternalServerErrorException("Failed to read analytics metrics");
    }

    return data;
  }

  async getQuestionCoverage(institutionId: string) {
    // Stub for question coverage by subject/unit
    return {
      message: "Question coverage data",
      timestamp: new Date().toISOString(),
      institutionId,
      coverage: [],
    };
  }

  async getDifficultyDistribution(institutionId: string) {
    // Stub for difficulty distribution analysis
    return {
      message: "Difficulty distribution data",
      timestamp: new Date().toISOString(),
      institutionId,
      distribution: {
        easy: 0,
        medium: 0,
        hard: 0,
      },
    };
  }

  async getUsageTrends(institutionId: string) {
    // Stub for question generation and paper usage trends
    return {
      message: "Usage trends data",
      timestamp: new Date().toISOString(),
      institutionId,
      trends: [],
    };
  }
}
