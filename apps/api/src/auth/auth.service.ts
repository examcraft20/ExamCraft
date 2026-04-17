import { Injectable, Inject, Logger } from "@nestjs/common";
import { SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ADMIN_CLIENT } from "../supabase/supabase.constants";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(SUPABASE_ADMIN_CLIENT)
    private readonly supabaseAdminClient: SupabaseClient
  ) {}

  async signUp(body: any) {
    const { email, password, options } = body;
    const { data, error } = await this.supabaseAdminClient.auth.signUp({
      email,
      password,
      options,
    });

    if (!error && data.user) {
      await this.logSystemAudit("USER_SIGNUP", "user", data.user.id, { email });
    }

    return { data, error: error ? { message: error.message } : null };
  }

  async resetPasswordForEmail(email: string, redirectTo: string) {
    const { data, error } = await this.supabaseAdminClient.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (!error) {
      await this.logSystemAudit("PASSWORD_RESET_REQUESTED", "user", null, { email });
    }

    return { data, error: error ? { message: error.message } : null };
  }

  private async logSystemAudit(action: string, resourceType: string, resourceId?: string | null, metadata?: Record<string, unknown>) {
    try {
      // Log system-level events (signup, password reset) to system_audit_logs
      await this.supabaseAdminClient
        .from('system_audit_logs')
        .insert({
          user_id: resourceId ?? null,
          action,
          resource_type: resourceType,
          resource_id: resourceId ?? null,
          metadata: metadata ?? {},
        });
    } catch (e) {
      this.logger.error(`Failed to log system audit for action "${action}"`, e);
    }
  }
}
