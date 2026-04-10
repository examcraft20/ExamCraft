import { Inject, Injectable, InternalServerErrorException, NotFoundException, BadRequestException } from "@nestjs/common";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { TenantContext } from "../common/types/authenticated-request";
import { SUPABASE_ADMIN_CLIENT } from "../supabase/supabase.constants";

type InstitutionUserRow = {
  id: string;
  display_name: string | null;
  status: string;
  joined_at: string | null;
  user_id: string;
  institution_user_roles:
    | Array<{
        roles:
          | {
              code: string;
            }
          | null;
      }>
    | null;
};

type InvitationRow = {
  id: string;
  email: string;
  role_code: string;
  status: string;
  expires_at: string;
  created_at: string;
};

@Injectable()
export class PeopleService {
  constructor(
    @Inject(SUPABASE_ADMIN_CLIENT)
    private readonly supabaseAdminClient: SupabaseClient
  ) {}

  async getInstitutionPeople(tenantContext: TenantContext) {
    const [{ data: users, error: usersError }, { data: invitations, error: invitationsError }] =
      await Promise.all([
        this.supabaseAdminClient
          .from("institution_users")
          .select("id, display_name, status, joined_at, user_id, institution_user_roles(roles(code))")
          .eq("institution_id", tenantContext.institutionId)
          .order("created_at", { ascending: true })
          .returns<InstitutionUserRow[]>(),
        this.supabaseAdminClient
          .from("invitations")
          .select("id, email, role_code, status, expires_at, created_at")
          .eq("institution_id", tenantContext.institutionId)
          .order("created_at", { ascending: false })
          .returns<InvitationRow[]>()
      ]);

    if (usersError || !users || invitationsError || !invitations) {
      throw new InternalServerErrorException("Unable to load institution people data.");
    }

    return {
      users: users.map((user) => ({
        institutionUserId: user.id,
        userId: user.user_id,
        displayName: user.display_name,
        status: user.status,
        joinedAt: user.joined_at,
        roleCodes:
          user.institution_user_roles?.flatMap((assignment) =>
            assignment.roles?.code ? [assignment.roles.code] : []
          ) ?? []
      })),
      invitations: invitations.map((invitation) => ({
        id: invitation.id,
        email: invitation.email,
        roleCode: invitation.role_code,
        status: invitation.status,
        expiresAt: invitation.expires_at,
        createdAt: invitation.created_at
      }))
    };
  }

  async updateUserRole(tenantContext: TenantContext, institutionUserId: string, newRoleCode: string) {
    // Check if user exists in institution
    const { data: user, error: userError } = await this.supabaseAdminClient
      .from("institution_users")
      .select("id")
      .eq("id", institutionUserId)
      .eq("institution_id", tenantContext.institutionId)
      .single();

    if (userError || !user) {
      throw new NotFoundException("User not found in this institution.");
    }

    // Get role ID
    const { data: role, error: roleError } = await this.supabaseAdminClient
      .from("roles")
      .select("id")
      .eq("code", newRoleCode)
      .single();

    if (roleError || !role) {
      throw new BadRequestException("Invalid role code.");
    }

    // Update role (assuming one role per user for simplified SaaS logic, or replacing all with this one)
    // First, delete existing
    await this.supabaseAdminClient
      .from("institution_user_roles")
      .delete()
      .eq("institution_user_id", institutionUserId);

    // Then insert new
    const { error: insertError } = await this.supabaseAdminClient
      .from("institution_user_roles")
      .insert({
        institution_user_id: institutionUserId,
        role_id: role.id
      });

    if (insertError) {
      throw new InternalServerErrorException("Failed to update user role.");
    }

    return { id: institutionUserId };
  }

  async removeUser(tenantContext: TenantContext, institutionUserId: string) {
    const { error } = await this.supabaseAdminClient
      .from("institution_users")
      .delete()
      .eq("id", institutionUserId)
      .eq("institution_id", tenantContext.institutionId);

    if (error) {
      throw new InternalServerErrorException("Failed to remove user from institution.");
    }

    return { id: institutionUserId };
  }
}

