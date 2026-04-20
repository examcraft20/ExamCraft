import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { InstitutionContext } from "../common/types/authenticated-request";
import { SUPABASE_ADMIN_CLIENT } from "../supabase/supabase.constants";

type InstitutionUserRow = {
  id: string;
  display_name: string | null;
  status: string;
  joined_at: string | null;
  user_id: string;
  institution_user_roles: Array<{
    roles: {
      code: string;
    } | null;
  }> | null;
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
export class UsersService {
  constructor(
    @Inject(SUPABASE_ADMIN_CLIENT)
    private readonly supabaseAdminClient: SupabaseClient,
  ) {}

  async getInstitutionUsers(institutionContext: InstitutionContext) {
    const [
      { data: users, error: usersError },
      { data: invitations, error: invitationsError },
    ] = await Promise.all([
      this.supabaseAdminClient
        .from("institution_users")
        .select(
          "id, display_name, status, joined_at, user_id, institution_user_roles(roles(code))",
        )
        .eq("institution_id", institutionContext.institutionId)
        .order("created_at", { ascending: true })
        .returns<InstitutionUserRow[]>(),
      this.supabaseAdminClient
        .from("invitations")
        .select("id, email, role_code, status, expires_at, created_at")
        .eq("institution_id", institutionContext.institutionId)
        .order("created_at", { ascending: false })
        .returns<InvitationRow[]>(),
    ]);

    if (usersError || !users || invitationsError || !invitations) {
      throw new InternalServerErrorException(
        "Unable to load institution users data.",
      );
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
            assignment.roles?.code ? [assignment.roles.code] : [],
          ) ?? [],
      })),
      invitations: invitations.map((invitation) => ({
        id: invitation.id,
        email: invitation.email,
        roleCode: invitation.role_code,
        status: invitation.status,
        expiresAt: invitation.expires_at,
        createdAt: invitation.created_at,
      })),
    };
  }

  async updateUserRole(
    institutionContext: InstitutionContext,
    institutionUserId: string,
    newRoleCode: string,
  ) {
    // Check if user exists in institution
    const { data: user, error: userError } = await this.supabaseAdminClient
      .from("institution_users")
      .select("id")
      .eq("id", institutionUserId)
      .eq("institution_id", institutionContext.institutionId)
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
        role_id: role.id,
      });

    if (insertError) {
      throw new InternalServerErrorException("Failed to update user role.");
    }

    return { id: institutionUserId };
  }

  async updateUser(
    institutionContext: InstitutionContext,
    institutionUserId: string,
    updates: { status?: string; displayName?: string },
  ) {
    const { data: user, error: userError } = await this.supabaseAdminClient
      .from("institution_users")
      .select("id")
      .eq("id", institutionUserId)
      .eq("institution_id", institutionContext.institutionId)
      .single();

    if (userError || !user) {
      throw new NotFoundException("User not found in this institution.");
    }

    const updateData: Record<string, unknown> = {};
    if (updates.status) {
      if (!["active", "disabled"].includes(updates.status)) {
        throw new BadRequestException(
          "Invalid status. Must be 'active' or 'disabled'.",
        );
      }
      updateData.status = updates.status;
    }
    if (updates.displayName !== undefined) {
      updateData.display_name = updates.displayName;
    }

    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException("No valid updates provided.");
    }

    const { error: updateError } = await this.supabaseAdminClient
      .from("institution_users")
      .update(updateData)
      .eq("id", institutionUserId)
      .eq("institution_id", institutionContext.institutionId);

    if (updateError) {
      throw new InternalServerErrorException("Failed to update user.");
    }

    return { id: institutionUserId };
  }

  async getUserSubjects(institutionContext: InstitutionContext, institutionUserId: string) {
    const { data, error } = await this.supabaseAdminClient
      .from("faculty_subject_assignments")
      .select("subject_id")
      .eq("institution_user_id", institutionUserId)
      .eq("institution_id", institutionContext.institutionId);

    if (error) {
      throw new InternalServerErrorException("Failed to load user subjects.");
    }

    return (data || []).map((row: any) => row.subject_id);
  }

  async updateUserSubjects(
    institutionContext: InstitutionContext,
    institutionUserId: string,
    subjectIds: string[],
  ) {
    // 1. Delete existing assignments
    const { error: deleteError } = await this.supabaseAdminClient
      .from("faculty_subject_assignments")
      .delete()
      .eq("institution_user_id", institutionUserId)
      .eq("institution_id", institutionContext.institutionId);

    if (deleteError) {
      throw new InternalServerErrorException("Failed to reset subject assignments.");
    }

    // 2. Insert new ones
    if (subjectIds.length > 0) {
      const inserts = subjectIds.map((sid) => ({
        institution_id: institutionContext.institutionId,
        institution_user_id: institutionUserId,
        subject_id: sid,
      }));

      const { error: insertError } = await this.supabaseAdminClient
        .from("faculty_subject_assignments")
        .insert(inserts);

      if (insertError) {
        throw new InternalServerErrorException("Failed to save subject assignments.");
      }
    }

    return { id: institutionUserId, count: subjectIds.length };
  }

  async removeUser(institutionContext: InstitutionContext, institutionUserId: string) {
    const { error } = await this.supabaseAdminClient
      .from("institution_users")
      .delete()
      .eq("id", institutionUserId)
      .eq("institution_id", institutionContext.institutionId);

    if (error) {
      throw new InternalServerErrorException(
        "Failed to remove user from institution.",
      );
    }

    return { id: institutionUserId };
  }

  async deleteGdprUser(userId: string) {
    // Fulfills the GDPR right to erasure by securely invoking Supabase's auth admin hard-deletion API.
    // This wipes the identity in auth.users, and cascades through all tables defining 'ON DELETE CASCADE'
    // to strictly purge all PII and individually ascribed data fragments matching this user's UID.
    const { error } = await this.supabaseAdminClient.auth.admin.deleteUser(userId);

    if (error) {
      throw new InternalServerErrorException("Failed to completely erase user data during GDPR request.");
    }
  }
}
