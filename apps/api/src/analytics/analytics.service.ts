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
      console.error("Analytics RPC Error:", error);
      throw new InternalServerErrorException("Failed to read analytics metrics");
    }

    return data;
  }

  async getQuestionCoverage(institutionId: string) {
    const { data: questions, error } = await this.supabaseAdminClient
      .from("institution_questions")
      .select("unit_number, bloom_level, subject_id")
      .eq("institution_id", institutionId)
      .eq("status", "approved");

    if (error) {
      throw new InternalServerErrorException("Failed to fetch coverage data");
    }

    const coverage = {
       units: {} as Record<string, number>,
       bloomLevels: {} as Record<string, number>,
    };

    questions?.forEach(q => {
       const u = q.unit_number || "Unknown";
       coverage.units[u] = (coverage.units[u] || 0) + 1;
       
       const b = q.bloom_level || "Unknown";
       coverage.bloomLevels[b] = (coverage.bloomLevels[b] || 0) + 1;
    });

    return coverage;
  }

  async getDifficultyDistribution(institutionId: string) {
    const { data, error } = await this.supabaseAdminClient
      .from("institution_questions")
      .select("difficulty")
      .eq("institution_id", institutionId);

    if (error) {
      throw new InternalServerErrorException("Failed to fetch distribution");
    }

    const distribution = { Easy: 0, Medium: 0, Hard: 0 };
    data?.forEach(q => {
      const diff = q.difficulty as "Easy" | "Medium" | "Hard" | "easy" | "medium" | "hard";
      if (!diff) return;
      
      const capDiff = diff.charAt(0).toUpperCase() + diff.slice(1).toLowerCase();
      if ((distribution as any)[capDiff] !== undefined) {
         (distribution as any)[capDiff]++;
      }
    });

    return distribution;
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
