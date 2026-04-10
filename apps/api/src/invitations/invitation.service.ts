import { randomBytes, createHash } from "crypto";
import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ADMIN_CLIENT } from "../supabase/supabase.constants";
import type { TenantContext } from "../common/types/authenticated-request";
import type {
  AcceptInvitationDto,
  CreateInvitationDto,
} from "./dto/create-invitation.dto";
import { MailerService } from "../modules/mailer/mailer.service";

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
  private readonly logger = new Logger(InvitationService.name);

  constructor(
    @Inject(SUPABASE_ADMIN_CLIENT)
    private readonly supabaseAdminClient: SupabaseClient,
    private readonly mailerService: MailerService,
  ) {}

  async createInvitation(
    tenantContext: TenantContext,
    invitedByUserId: string,
    payload: CreateInvitationDto,
  ) {
    if (
      tenantContext.institutionId !== payload.institutionId ||
      !tenantContext.roleCodes.includes("institution_admin")
    ) {
      throw new ForbiddenException(
        "Only institution admins can create invitations.",
      );
    }

    const rawToken = randomBytes(24).toString("hex");
    const tokenHash = createHash("sha256").update(rawToken).digest("hex");
    const expiresInDays = payload.expiresInDays ?? 7;
    if (
      !Number.isInteger(expiresInDays) ||
      expiresInDays < 1 ||
      expiresInDays > 30
    ) {
      throw new BadRequestException(
        "Invitation expiry must be between 1 and 30 days.",
      );
    }

    const expiresAt = new Date(
      Date.now() + expiresInDays * 24 * 60 * 60 * 1000,
    ).toISOString();

    const { data, error } = await this.supabaseAdminClient
      .from("invitations")
      .insert({
        institution_id: payload.institutionId,
        email: payload.email.trim().toLowerCase(),
        role_code: payload.roleCode,
        token_hash: tokenHash,
        invited_by_user_id: invitedByUserId,
        expires_at: expiresAt,
        status: "pending",
      })
      .select("id, institution_id, email, role_code, status, expires_at")
      .single();

    if (error || !data) {
      throw new InternalServerErrorException("Failed to create invitation.");
    }

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const inviteUrl = `${frontendUrl}/invite?token=${rawToken}`;

    // We send emails in background, no await
    this.mailerService
      .sendFacultyInvite(
        payload.email.trim().toLowerCase(),
        "your ExamCraft institution",
        payload.roleCode,
        inviteUrl,
      )
      .catch((e) => this.logger.error("Could not send mail", e));

    return {
      invitation: data,
      rawToken,
    };
  }

  async previewInvitation(token: string) {
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const { data, error } = await this.supabaseAdminClient
      .from("invitations")
      .select(
        "id, institution_id, email, role_code, status, expires_at, institutions(name)",
      )
      .eq("token_hash", tokenHash)
      .single<InvitationRecord>();

    // Use constant error message to prevent token enumeration
    const INVALID_TOKEN_MESSAGE = "Invitation is invalid or expired.";

    if (error || !data) {
      throw new BadRequestException(INVALID_TOKEN_MESSAGE);
    }

    if (data.status !== "pending") {
      throw new BadRequestException(INVALID_TOKEN_MESSAGE);
    }

    if (new Date(data.expires_at).getTime() < Date.now()) {
      throw new BadRequestException(INVALID_TOKEN_MESSAGE);
    }

    return {
      invitation: {
        id: data.id,
        institutionId: data.institution_id,
        email: data.email,
        roleCode: data.role_code,
        status: data.status,
        expiresAt: data.expires_at,
        institutionName: data.institutions?.name ?? "ExamCraft Institution",
      },
    };
  }

  async acceptInvitation(payload: AcceptInvitationDto) {
    const token = payload.token.trim();
    if (!token) {
      throw new BadRequestException("Invitation token is required.");
    }

    const tokenHash = createHash("sha256").update(token).digest("hex");
    const { data: invitation, error: invitationError } =
      await this.supabaseAdminClient
        .from("invitations")
        .select("id, institution_id, email, role_code, status, expires_at")
        .eq("token_hash", tokenHash)
        .single<InvitationRecord>();

    // Use constant error message to prevent token enumeration
    const INVALID_TOKEN_MESSAGE = "Invitation is invalid or expired.";

    if (invitationError || !invitation) {
      throw new BadRequestException(INVALID_TOKEN_MESSAGE);
    }

    if (invitation.status !== "pending") {
      throw new BadRequestException(INVALID_TOKEN_MESSAGE);
    }

    if (new Date(invitation.expires_at).getTime() < Date.now()) {
      throw new BadRequestException(INVALID_TOKEN_MESSAGE);
    }

    let createdUserId: string | null = null;

    try {
      const createdUser = await this.supabaseAdminClient.auth.admin.createUser({
        email: invitation.email,
        password: payload.password,
        email_confirm: true,
        user_metadata: {
          display_name: payload.displayName,
        },
      });

      if (createdUser.error || !createdUser.data.user) {
        throw new InternalServerErrorException(
          createdUser.error?.message ?? "Failed to create invited user.",
        );
      }

      createdUserId = createdUser.data.user.id;

      const { data: role, error: roleError } = await this.supabaseAdminClient
        .from("roles")
        .select("id")
        .eq("code", invitation.role_code)
        .single<RoleRecord>();

      if (roleError || !role) {
        throw new InternalServerErrorException(
          "Failed to resolve invited role.",
        );
      }

      const { data: institutionUser, error: membershipError } =
        await this.supabaseAdminClient
          .from("institution_users")
          .insert({
            institution_id: invitation.institution_id,
            user_id: createdUserId,
            display_name: payload.displayName,
            status: "active",
            joined_at: new Date().toISOString(),
          })
          .select("id")
          .single<{ id: string }>();

      if (membershipError || !institutionUser) {
        throw new InternalServerErrorException(
          "Failed to create invited membership.",
        );
      }

      const { error: roleAssignmentError } = await this.supabaseAdminClient
        .from("institution_user_roles")
        .insert({
          institution_user_id: institutionUser.id,
          role_id: role.id,
        });

      if (roleAssignmentError) {
        throw new InternalServerErrorException(
          "Failed to assign invited role.",
        );
      }

      const { error: invitationUpdateError } = await this.supabaseAdminClient
        .from("invitations")
        .update({
          status: "accepted",
          accepted_at: new Date().toISOString(),
        })
        .eq("id", invitation.id);

      if (invitationUpdateError) {
        throw new InternalServerErrorException(
          "Failed to mark invitation as accepted.",
        );
      }
    } catch (error) {
      if (createdUserId) {
        await this.supabaseAdminClient.auth.admin.deleteUser(createdUserId);
      }

      throw error;
    }

    return {
      institutionId: invitation.institution_id,
      email: invitation.email,
      userId: createdUserId,
    };
  }

  async resendInvitation(tenantContext: TenantContext, invitationId: string) {
    const { data: invitation, error } = await this.supabaseAdminClient
      .from("invitations")
      .select("id, email, role_code, expires_at, institutions(name)")
      .eq("id", invitationId)
      .eq("institution_id", tenantContext.institutionId)
      .eq("status", "pending")
      .single<InvitationRecord & { institutions: { name: string }[] }>();

    if (error || !invitation) {
      throw new NotFoundException("Pending invitation not found.");
    }

    const expiresInDays = 7;
    const expiresAt = new Date(
      Date.now() + expiresInDays * 24 * 60 * 60 * 1000,
    ).toISOString();

    const rawToken = randomBytes(24).toString("hex");
    const tokenHash = createHash("sha256").update(rawToken).digest("hex");

    const { error: updateError } = await this.supabaseAdminClient
      .from("invitations")
      .update({
        token_hash: tokenHash,
        expires_at: expiresAt,
      })
      .eq("id", invitationId);

    if (updateError) {
      throw new InternalServerErrorException("Failed to resend invitation.");
    }

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const inviteUrl = `${frontendUrl}/invite?token=${rawToken}`;

    const institutionName =
      invitation.institutions?.[0]?.name || "your ExamCraft institution";

    this.mailerService
      .sendFacultyInvite(
        invitation.email,
        institutionName,
        invitation.role_code,
        inviteUrl,
      )
      .catch((e) => this.logger.error("Could not send mail", e));

    return { id: invitationId, email: invitation.email };
  }
}
