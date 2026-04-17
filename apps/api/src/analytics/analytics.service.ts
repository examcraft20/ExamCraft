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
    // TODO: Implement question coverage by subject/unit
    throw new InternalServerErrorException("Not yet implemented");
  }

  async getDifficultyDistribution(institutionId: string) {
    // TODO: Implement difficulty distribution analysis
    throw new InternalServerErrorException("Not yet implemented");
  }

  async getUsageTrends(institutionId: string) {
    const { data: papers, error } = await this.supabaseAdminClient
      .from("institution_papers")
      .select("created_at")
      .eq("institution_id", institutionId)
      .gte("created_at", new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString());

    if (error) {
      throw new InternalServerErrorException("Failed to fetch usage trends");
    }

    // Simple group by month
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trendMap = new Map<string, number>();
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      trendMap.set(months[d.getMonth()], 0);
    }

    papers?.forEach(p => {
      const month = months[new Date(p.created_at).getMonth()];
      if (trendMap.has(month)) {
        trendMap.set(month, (trendMap.get(month) || 0) + 1);
      }
    });

    return {
      institutionId,
      trends: Array.from(trendMap.entries()).map(([month, count]) => ({
        month,
        papers: count
      }))
    };
  }
}
