import { Inject, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ADMIN_CLIENT } from "../../supabase/supabase.constants";
import { InstitutionContext } from "../../common/types/authenticated-request";
import { TenantMembershipSummary, MembershipRow } from "../institution.types";

@Injectable()
export class InstitutionMembershipsService {
  constructor(
    @Inject(SUPABASE_ADMIN_CLIENT)
    private readonly supabaseAdminClient: SupabaseClient
  ) {}

  async resolveForUser(userId: string, institutionId: string): Promise<InstitutionContext> {
    const { data, error } = await this.supabaseAdminClient
      .from("institution_users")
      .select(
        "id, institution_id, display_name, institutions(id, name, slug, institution_type, branding), institution_user_roles(role_id, roles(code))"
      )
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

  async listMemberships(userId: string): Promise<TenantMembershipSummary[]> {
    const { data, error } = await this.supabaseAdminClient
      .from("institution_users")
      .select(
        "id, institution_id, display_name, institutions(id, name, slug, institution_type, branding), institution_user_roles(role_id, roles(code))"
      )
      .eq("user_id", userId)
      .eq("status", "active")
      .returns<MembershipRow[]>();

    if (error || !data) {
      throw new InternalServerErrorException("Unable to load memberships for the current user.");
    }

    return data.flatMap((membership) => {
      if (!membership.institutions) {
        return [];
      }

      return [
        {
          institutionUserId: membership.id,
          institutionId: membership.institution_id,
          institutionName: membership.institutions.name,
          institutionSlug: membership.institutions.slug,
          institutionType: membership.institutions.institution_type,
          branding: membership.institutions.branding,
          displayName: membership.display_name,
          roleCodes:
            membership.institution_user_roles?.flatMap((roleRow) =>
              roleRow.roles?.code ? [roleRow.roles.code] : []
            ) ?? []
        }
      ];
    });
  }

  // In-memory cache for role permissions. Roles and permissions rarely change,
  // making an in-memory cache highly effective at reducing database load.
  private readonly permissionCache = new Map<string, { codes: string[]; expiresAt: number }>();
  private readonly CACHE_TTL_MS = 1000 * 60 * 5; // 5 minutes

  private async loadPermissionCodes(roleIds: string[]): Promise<string[]> {
    const unachedRoleIds: string[] = [];
    const cachedCodes = new Set<string>();
    const now = Date.now();

    for (const roleId of roleIds) {
      const cached = this.permissionCache.get(roleId);
      if (cached && cached.expiresAt > now) {
        cached.codes.forEach((code) => cachedCodes.add(code));
      } else {
        unachedRoleIds.push(roleId);
      }
    }

    if (unachedRoleIds.length === 0) {
      return Array.from(cachedCodes);
    }

    const { data, error } = await this.supabaseAdminClient
      .from("role_permissions")
      .select("role_id, permissions(code)")
      .in("role_id", unachedRoleIds)
      .returns<any[]>();

    if (error || !data) {
      return Array.from(cachedCodes);
    }

    const newCodesByRole = new Map<string, Set<string>>();
    data.forEach((row: any) => {
      if (row.permissions?.code && row.role_id) {
        if (!newCodesByRole.has(row.role_id)) {
          newCodesByRole.set(row.role_id, new Set());
        }
        newCodesByRole.get(row.role_id)!.add(row.permissions.code);
        cachedCodes.add(row.permissions.code);
      }
    });

    for (const roleId of unachedRoleIds) {
      const codeSet = newCodesByRole.get(roleId);
      this.permissionCache.set(roleId, {
        codes: codeSet ? Array.from(codeSet) : [],
        expiresAt: now + this.CACHE_TTL_MS
      });
    }

    return Array.from(cachedCodes);
  }
}
