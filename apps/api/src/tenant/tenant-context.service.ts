import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ADMIN_CLIENT } from "../supabase/supabase.constants";
import type { TenantContext } from "../common/types/authenticated-request";

type MembershipRow = {
  id: string;
  institution_id: string;
  institution_user_roles: Array<{
    role_id: string;
    roles: {
      code: string;
    } | null;
  }> | null;
};

type PermissionRow = {
  permissions: {
    code: string;
  } | null;
};

@Injectable()
export class TenantContextService {
  constructor(
    @Inject(SUPABASE_ADMIN_CLIENT)
    private readonly supabaseAdminClient: SupabaseClient
  ) {}

  async resolveForUser(userId: string, institutionId: string): Promise<TenantContext> {
    const { data, error } = await this.supabaseAdminClient
      .from("institution_users")
      .select("id, institution_id, institution_user_roles(role_id, roles(code))")
      .eq("user_id", userId)
      .eq("institution_id", institutionId)
      .eq("status", "active")
      .single<MembershipRow>();

    if (error || !data) {
      throw new NotFoundException("No active membership found for the selected institution.");
    }

    const roleIds =
      data.institution_user_roles?.flatMap((membershipRole) =>
        membershipRole.role_id ? [membershipRole.role_id] : []
      ) ?? [];

    const permissionCodes =
      roleIds.length > 0
        ? await this.loadPermissionCodes(roleIds)
        : [];

    return {
      institutionId: data.institution_id,
      institutionUserId: data.id,
      roleCodes:
        data.institution_user_roles?.flatMap((membershipRole) =>
          membershipRole.roles?.code ? [membershipRole.roles.code] : []
        ) ?? [],
      permissionCodes
    };
  }

  private async loadPermissionCodes(roleIds: string[]): Promise<string[]> {
    const { data, error } = await this.supabaseAdminClient
      .from("role_permissions")
      .select("permissions(code)")
      .in("role_id", roleIds)
      .returns<PermissionRow[]>();

    if (error || !data) {
      throw new NotFoundException("Unable to resolve permissions for the active membership.");
    }

    return Array.from(
      new Set(
        data.flatMap((permissionRow) =>
          permissionRow.permissions?.code ? [permissionRow.permissions.code] : []
        )
      )
    );
  }
}
