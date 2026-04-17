import { Inject, Injectable, InternalServerErrorException } from "@nestjs/common";
import { SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ADMIN_CLIENT } from "../../supabase/supabase.constants";
import { 
  InstitutionDashboardSummaryResponse, 
  PlatformDashboardSummaryResponse 
} from "@examcraft/types";

@Injectable()
export class InstitutionDashboardsService {
  constructor(
    @Inject(SUPABASE_ADMIN_CLIENT)
    private readonly supabaseAdminClient: SupabaseClient
  ) {}

  async getInstitutionDashboardSummary(institutionId: string): Promise<InstitutionDashboardSummaryResponse> {
    const { data, error } = await this.supabaseAdminClient
      .rpc('get_institution_dashboard_summary', { p_institution_id: institutionId });

    if (error || !data) {
      throw new InternalServerErrorException("Unable to load dashboard summary for this institution.");
    }

    return data as InstitutionDashboardSummaryResponse;
  }

  async getPlatformDashboardSummary(): Promise<PlatformDashboardSummaryResponse> {
    const { data, error } = await this.supabaseAdminClient
      .rpc('get_platform_dashboard_summary');

    if (error || !data) {
      throw new InternalServerErrorException("Unable to load platform dashboard summary.");
    }

    return data as PlatformDashboardSummaryResponse;
  }
}
