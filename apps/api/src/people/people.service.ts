import { Inject, Injectable, InternalServerErrorException } from "@nestjs/common";
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
}
