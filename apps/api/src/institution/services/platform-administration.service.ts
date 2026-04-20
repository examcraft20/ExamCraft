import { Inject, Injectable, NotFoundException, InternalServerErrorException } from "@nestjs/common";
import { SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ADMIN_CLIENT } from "../../supabase/supabase.constants";
import { PlatformAuditEvent } from "@examcraft/types";
import { PlatformInstitutionListItem, PlatformInstitutionRow } from "../institution.types";

@Injectable()
export class PlatformAdministrationService {
  constructor(
    @Inject(SUPABASE_ADMIN_CLIENT)
    private readonly supabaseAdminClient: SupabaseClient
  ) {}

  async listPlatformInstitutions(
    limit: number = 50,
    offset: number = 0,
  ): Promise<PlatformInstitutionListItem[]> {
    const { data: institutions, error } = await this.supabaseAdminClient
      .from("institutions")
      .select("id, name, slug, institution_type, status, created_at")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)
      .returns<PlatformInstitutionRow[]>();

    if (error || !institutions) {
      throw new InternalServerErrorException("Unable to load platform institutions.");
    }

    const usageResult = await this.supabaseAdminClient.rpc("get_batch_institution_usage");

    const usageMap = new Map<string, any>();
    if (!usageResult.error && usageResult.data) {
      (usageResult.data as any[]).forEach((row) => {
        usageMap.set(row.institution_id, {
          activeUsers: parseInt(row.active_users_count ?? "0", 10),
          pendingInvitations: parseInt(row.pending_invitations_count ?? "0", 10),
          questions: parseInt(row.questions_count ?? "0", 10),
          templates: parseInt(row.templates_count ?? "0", 10)
        });
      });
    }

    return institutions.map((institution) => ({
      id: institution.id,
      name: institution.name,
      slug: institution.slug,
      institutionType: institution.institution_type,
      status: institution.status,
      createdAt: institution.created_at,
      usage: usageMap.get(institution.id) ?? {
        activeUsers: 0,
        pendingInvitations: 0,
        questions: 0,
        templates: 0
      }
    }));
  }

  async updateInstitutionStatus(
    institutionId: string,
    status: "active" | "suspended" | "trial" | "archived",
    updatedByUserId: string,
    note?: string
  ): Promise<void> {
    const { data: institution, error: fetchError } = await this.supabaseAdminClient
      .from("institutions")
      .select("id, branding")
      .eq("id", institutionId)
      .single();

    if (fetchError || !institution) {
      throw new NotFoundException("Institution not found.");
    }

    const branding = institution.branding ?? {};
    const statusHistory = Array.isArray(branding.status_history) ? branding.status_history : [];

    statusHistory.push({
      status,
      updated_at: new Date().toISOString(),
      updated_by: updatedByUserId,
      note: note ?? ""
    });

    const { error: updateError } = await this.supabaseAdminClient
      .from("institutions")
      .update({
        status,
        branding: { ...branding, status_history: statusHistory }
      })
      .eq("id", institutionId);

    if (updateError) {
      throw new InternalServerErrorException("Failed to update institution status.");
    }
  }

  async getPlatformAuditFeed(): Promise<PlatformAuditEvent[]> {
    const { data, error } = await this.supabaseAdminClient
      .rpc('get_platform_audit_feed');

    if (error || !data) {
      throw new InternalServerErrorException("Unable to load platform audit activity.");
    }

    return data as PlatformAuditEvent[];
  }
}
