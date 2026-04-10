import { Injectable, Inject, InternalServerErrorException, Logger } from "@nestjs/common";
import { SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ADMIN_CLIENT } from "../supabase/supabase.constants";
import { TenantContext } from "../common/types/authenticated-request";
import { AuditAction } from "./audit-action.enum";

@Injectable()
export class AuditLogsService {
  private readonly logger = new Logger(AuditLogsService.name);

  constructor(
    @Inject(SUPABASE_ADMIN_CLIENT)
    private readonly supabaseAdminClient: SupabaseClient
  ) {}

  async listAuditLogs(tenantContext: TenantContext) {
    const { data, error } = await this.supabaseAdminClient
      .from("institution_audit_logs")
      .select("*, actor:institution_users(user_id, role, users(email))")
      .eq("institution_id", tenantContext.institutionId)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      throw new InternalServerErrorException("Failed to fetch audit logs.");
    }

    return data;
  }

  async createAuditLog(params: {
    institutionId: string;
    userId: string;
    action: AuditAction;
    resourceType: string;
    resourceId?: string;
    metadata?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    const { error } = await this.supabaseAdminClient
      .from('institution_audit_logs')
      .insert({
        institution_id: params.institutionId,
        user_id: params.userId,
        action: params.action,
        resource_type: params.resourceType,
        resource_id: params.resourceId ?? null,
        metadata: params.metadata ?? {},
        ip_address: params.ipAddress ?? null,
        user_agent: params.userAgent ?? null,
      });

    if (error) {
      this.logger.error('Failed to write audit log', { error, params });
      // Do NOT throw — audit logging must never break user flows
    }
  }
}
