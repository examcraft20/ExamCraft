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
}
