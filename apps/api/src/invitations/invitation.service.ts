import { randomBytes, createHash } from "crypto";
import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException
} from "@nestjs/common";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ADMIN_CLIENT } from "../supabase/supabase.constants";
import type { TenantContext } from "../common/types/authenticated-request";
import type { AcceptInvitationDto, CreateInvitationDto } from "./dto/create-invitation.dto";

type InvitationRecord = {
  id: string;
  institution_id: string;
  email: string;
  role_code: CreateInvitationDto["roleCode"];
  status: string;
  expires_at: string;
  institutions?: {
    name: string;
  } | null;
};

type RoleRecord = {
  id: string;
};

@Injectable()
export class InvitationService {
  constructor(
    @Inject(SUPABASE_ADMIN_CLIENT)
    private readonly supabaseAdminClient: SupabaseClient
  ) {}

  async createInvitation(
    tenantContext: TenantContext,
    invitedByUserId: string,
    payload: CreateInvitationDto
  ) {
    if (
      tenantContext.institutionId !== payload.institutionId ||
      !tenantContext.roleCodes.includes("institution_admin")
    ) {
      throw new ForbiddenException("Only institution admins can create invitations.");
    }

    const rawToken = randomBytes(24).toString("hex");
    const tokenHash = createHash("sha256").update(rawToken).digest("hex");
    const expiresInDays = payload.expiresInDays ?? 7;
    const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await this.supabaseAdminClient
      .from("invitations")
      .insert({
        institution_id: payload.institutionId,
        email: payload.email,
        role_code: payload.roleCode,
        token_hash: tokenHash,
        invited_by_user_id: invitedByUserId,
        expires_at: expiresAt,
        status: "pending"
      })
      .select("id, institution_id, email, role_code, status, expires_at")
      .single();

    if (error || !data) {
      throw new InternalServerErrorException("Failed to create invitation.");
    }

    return {
      invitation: data,
      rawToken
    };
  }

  async previewInvitation(token: string) {
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const { data, error } = await this.supabaseAdminClient
      .from("invitations")
      .select("id, institution_id, email, role_code, status, expires_at, institutions(name)")
      .eq("token_hash", tokenHash)
      .single<InvitationRecord>();

    if (error || !data) {
      throw new BadRequestException("Invitation token is invalid.");
    }

    if (data.status !== "pending") {
      throw new BadRequestException("Invitation is no longer pending.");
    }

    if (new Date(data.expires_at).getTime() < Date.now()) {
      throw new BadRequestException("Invitation has expired.");
    }

    return {
      invitation: {
        id: data.id,
        institutionId: data.institution_id,
        email: data.email,
        roleCode: data.role_code,
        status: data.status,
        expiresAt: data.expires_at,
        institutionName: data.institutions?.name ?? "ExamCraft Institution"
      }
    };
  }

  async acceptInvitation(payload: AcceptInvitationDto) {
    const tokenHash = createHash("sha256").update(payload.token).digest("hex");
    const { data: invitation, error: invitationError } = await this.supabaseAdminClient
      .from("invitations")
      .select("id, institution_id, email, role_code, status, expires_at")
      .eq("token_hash", tokenHash)
      .single<InvitationRecord>();

    if (invitationError || !invitation) {
      throw new BadRequestException("Invitation token is invalid.");
    }

    if (invitation.status !== "pending") {
      throw new BadRequestException("Invitation is no longer pending.");
    }

    if (new Date(invitation.expires_at).getTime() < Date.now()) {
      throw new BadRequestException("Invitation has expired.");
    }

    const createdUser = await this.supabaseAdminClient.auth.admin.createUser({
      email: invitation.email,
      password: payload.password,
      email_confirm: true,
      user_metadata: {
        display_name: payload.displayName
      }
    });

    if (createdUser.error || !createdUser.data.user) {
      throw new InternalServerErrorException(
        createdUser.error?.message ?? "Failed to create invited user."
      );
    }

    const { data: role, error: roleError } = await this.supabaseAdminClient
      .from("roles")
      .select("id")
      .eq("code", invitation.role_code)
      .single<RoleRecord>();

    if (roleError || !role) {
      throw new InternalServerErrorException("Failed to resolve invited role.");
    }

    const { data: institutionUser, error: membershipError } = await this.supabaseAdminClient
      .from("institution_users")
      .insert({
        institution_id: invitation.institution_id,
        user_id: createdUser.data.user.id,
        display_name: payload.displayName,
        status: "active",
        joined_at: new Date().toISOString()
      })
      .select("id")
      .single<{ id: string }>();

    if (membershipError || !institutionUser) {
      throw new InternalServerErrorException("Failed to create invited membership.");
    }

    const { error: roleAssignmentError } = await this.supabaseAdminClient
      .from("institution_user_roles")
      .insert({
        institution_user_id: institutionUser.id,
        role_id: role.id
      });

    if (roleAssignmentError) {
      throw new InternalServerErrorException("Failed to assign invited role.");
    }

    const { error: invitationUpdateError } = await this.supabaseAdminClient
      .from("invitations")
      .update({
        status: "accepted",
        accepted_at: new Date().toISOString()
      })
      .eq("id", invitation.id);

    if (invitationUpdateError) {
      throw new InternalServerErrorException("Failed to mark invitation as accepted.");
    }

    return {
      institutionId: invitation.institution_id,
      email: invitation.email,
      userId: createdUser.data.user.id
    };
  }
}
