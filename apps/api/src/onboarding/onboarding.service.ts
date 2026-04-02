import { Inject, Injectable, InternalServerErrorException } from "@nestjs/common";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ADMIN_CLIENT } from "../supabase/supabase.constants";
import type { CreateInstitutionOnboardingDto } from "./dto/create-institution-onboarding.dto";

type InstitutionRecord = {
  id: string;
  name: string;
  slug: string;
};

type RoleRecord = {
  id: string;
  code: string;
};

@Injectable()
export class OnboardingService {
  constructor(
    @Inject(SUPABASE_ADMIN_CLIENT)
    private readonly supabaseAdminClient: SupabaseClient
  ) {}

  async createInstitutionWorkspace(
    authenticatedUserId: string,
    payload: CreateInstitutionOnboardingDto
  ) {
    const { data: institution, error: institutionError } = await this.supabaseAdminClient
      .from("institutions")
      .insert({
        name: payload.institutionName,
        slug: payload.institutionSlug,
        institution_type: payload.institutionType,
        primary_contact_email: payload.primaryContactEmail
      })
      .select("id, name, slug")
      .single<InstitutionRecord>();

    if (institutionError || !institution) {
      throw new InternalServerErrorException("Failed to create institution.");
    }

    try {
      const { data: institutionAdminRole, error: roleError } = await this.supabaseAdminClient
        .from("roles")
        .select("id, code")
        .eq("code", "institution_admin")
        .single<RoleRecord>();

      if (roleError || !institutionAdminRole) {
        throw new InternalServerErrorException("Failed to load institution admin role.");
      }

      const { data: institutionUser, error: institutionUserError } = await this.supabaseAdminClient
        .from("institution_users")
        .insert({
          institution_id: institution.id,
          user_id: authenticatedUserId,
          display_name: payload.adminDisplayName,
          status: "active",
          joined_at: new Date().toISOString()
        })
        .select("id")
        .single<{ id: string }>();

      if (institutionUserError || !institutionUser) {
        throw new InternalServerErrorException("Failed to create institution membership.");
      }

      const { error: membershipRoleError } = await this.supabaseAdminClient
        .from("institution_user_roles")
        .insert({
          institution_user_id: institutionUser.id,
          role_id: institutionAdminRole.id
        });

      if (membershipRoleError) {
        throw new InternalServerErrorException("Failed to assign institution admin role.");
      }

      const { error: subscriptionError } = await this.supabaseAdminClient
        .from("subscriptions")
        .insert({
          institution_id: institution.id,
          plan_code: "free",
          billing_status: "active"
        });

      if (subscriptionError) {
        throw new InternalServerErrorException("Failed to create default free subscription.");
      }
    } catch (error) {
      await this.deleteInstitutionIfCreated(institution.id);
      throw error;
    }

    return {
      institution,
      subscriptionPlan: "free"
    };
  }

  private async deleteInstitutionIfCreated(institutionId: string) {
    await this.supabaseAdminClient.from("institutions").delete().eq("id", institutionId);
  }
}
