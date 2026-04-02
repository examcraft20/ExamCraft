import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ADMIN_CLIENT } from "../supabase/supabase.constants";
import type { TenantContext } from "../common/types/authenticated-request";

type MembershipRow = {
  id: string;
  institution_id: string;
  display_name: string | null;
  institutions:
    | {
        id: string;
        name: string;
        slug: string;
        institution_type: string;
      }
    | null;
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

type CountResult = {
  count: number | null;
};

type RecentInvitationRow = {
  id: string;
  email: string;
  role_code: string;
  status: string;
  created_at: string;
};

type RecentQuestionRow = {
  id: string;
  title: string;
  subject: string;
  difficulty: string;
  status: string;
  created_at: string;
};

type RecentTemplateRow = {
  id: string;
  name: string;
  exam_type: string;
  status: string;
  created_at: string;
};

type PlatformInstitutionRow = {
  id: string;
  name: string;
  slug: string;
  institution_type: string;
  status: string;
  created_at: string;
};

type PlatformInstitutionUsageRow = {
  institution_id: string;
};

type PlatformAuditInvitationRow = {
  id: string;
  institution_id: string;
  email: string;
  status: string;
  created_at: string;
};

type PlatformAuditQuestionRow = {
  id: string;
  institution_id: string;
  title: string;
  status: string;
  created_at: string;
};

type PlatformAuditTemplateRow = {
  id: string;
  institution_id: string;
  name: string;
  status: string;
  created_at: string;
};

export type TenantMembershipSummary = {
  institutionUserId: string;
  institutionId: string;
  institutionName: string;
  institutionSlug: string;
  institutionType: string;
  displayName: string | null;
  roleCodes: string[];
};

export type InstitutionDashboardSummary = {
  totals: {
    users: number;
    invitations: number;
    questions: number;
    templates: number;
  };
  recentInvitations: Array<{
    id: string;
    email: string;
    roleCode: string;
    status: string;
    createdAt: string;
  }>;
  recentQuestions: Array<{
    id: string;
    title: string;
    subject: string;
    difficulty: string;
    status: string;
    createdAt: string;
  }>;
  recentTemplates: Array<{
    id: string;
    name: string;
    examType: string;
    status: string;
    createdAt: string;
  }>;
};

export type PlatformDashboardSummary = {
  totals: {
    institutions: number;
    activeUsers: number;
    pendingInvitations: number;
    questions: number;
    templates: number;
  };
  recentInstitutions: Array<{
    id: string;
    name: string;
    slug: string;
    institutionType: string;
    status: string;
    createdAt: string;
  }>;
};

export type PlatformInstitutionListItem = {
  id: string;
  name: string;
  slug: string;
  institutionType: string;
  status: string;
  createdAt: string;
  usage: {
    activeUsers: number;
    pendingInvitations: number;
    questions: number;
    templates: number;
  };
};

export type PlatformAuditEvent = {
  id: string;
  institutionId: string;
  institutionName: string;
  eventType: "institution.created" | "invitation.created" | "question.created" | "template.created";
  title: string;
  status: string;
  createdAt: string;
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
      .select(
        "id, institution_id, display_name, institutions(id, name, slug, institution_type), institution_user_roles(role_id, roles(code))"
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
        "id, institution_id, display_name, institutions(id, name, slug, institution_type), institution_user_roles(role_id, roles(code))"
      )
      .eq("user_id", userId)
      .eq("status", "active")
      .returns<MembershipRow[]>();

    if (error || !data) {
      throw new NotFoundException("Unable to load memberships for the current user.");
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
          displayName: membership.display_name,
          roleCodes:
            membership.institution_user_roles?.flatMap((membershipRole) =>
              membershipRole.roles?.code ? [membershipRole.roles.code] : []
            ) ?? []
        }
      ];
    });
  }

  async getInstitutionDashboardSummary(institutionId: string): Promise<InstitutionDashboardSummary> {
    const [
      usersCountResult,
      invitationsCountResult,
      questionsCountResult,
      templatesCountResult,
      invitationsResult,
      questionsResult,
      templatesResult
    ] = await Promise.all([
      this.supabaseAdminClient
        .from("institution_users")
        .select("id", { count: "exact", head: true })
        .eq("institution_id", institutionId)
        .returns<CountResult[]>(),
      this.supabaseAdminClient
        .from("invitations")
        .select("id", { count: "exact", head: true })
        .eq("institution_id", institutionId)
        .returns<CountResult[]>(),
      this.supabaseAdminClient
        .from("institution_questions")
        .select("id", { count: "exact", head: true })
        .eq("institution_id", institutionId)
        .returns<CountResult[]>(),
      this.supabaseAdminClient
        .from("institution_templates")
        .select("id", { count: "exact", head: true })
        .eq("institution_id", institutionId)
        .returns<CountResult[]>(),
      this.supabaseAdminClient
        .from("invitations")
        .select("id, email, role_code, status, created_at")
        .eq("institution_id", institutionId)
        .order("created_at", { ascending: false })
        .limit(5)
        .returns<RecentInvitationRow[]>(),
      this.supabaseAdminClient
        .from("institution_questions")
        .select("id, title, subject, difficulty, status, created_at")
        .eq("institution_id", institutionId)
        .order("created_at", { ascending: false })
        .limit(5)
        .returns<RecentQuestionRow[]>(),
      this.supabaseAdminClient
        .from("institution_templates")
        .select("id, name, exam_type, status, created_at")
        .eq("institution_id", institutionId)
        .order("created_at", { ascending: false })
        .limit(5)
        .returns<RecentTemplateRow[]>()
    ]);

    const countErrors = [
      usersCountResult.error,
      invitationsCountResult.error,
      questionsCountResult.error,
      templatesCountResult.error,
      invitationsResult.error,
      questionsResult.error,
      templatesResult.error
    ];

    if (countErrors.some(Boolean)) {
      throw new NotFoundException("Unable to load dashboard summary for the selected institution.");
    }

    return {
      totals: {
        users: usersCountResult.count ?? 0,
        invitations: invitationsCountResult.count ?? 0,
        questions: questionsCountResult.count ?? 0,
        templates: templatesCountResult.count ?? 0
      },
      recentInvitations:
        invitationsResult.data?.map((invitation) => ({
          id: invitation.id,
          email: invitation.email,
          roleCode: invitation.role_code,
          status: invitation.status,
          createdAt: invitation.created_at
        })) ?? [],
      recentQuestions:
        questionsResult.data?.map((question) => ({
          id: question.id,
          title: question.title,
          subject: question.subject,
          difficulty: question.difficulty,
          status: question.status,
          createdAt: question.created_at
        })) ?? [],
      recentTemplates:
        templatesResult.data?.map((template) => ({
          id: template.id,
          name: template.name,
          examType: template.exam_type,
          status: template.status,
          createdAt: template.created_at
        })) ?? []
    };
  }

  async getPlatformDashboardSummary(): Promise<PlatformDashboardSummary> {
    const [
      institutionsCountResult,
      activeUsersCountResult,
      pendingInvitationsCountResult,
      questionsCountResult,
      templatesCountResult,
      recentInstitutionsResult
    ] = await Promise.all([
      this.supabaseAdminClient
        .from("institutions")
        .select("id", { count: "exact", head: true })
        .returns<CountResult[]>(),
      this.supabaseAdminClient
        .from("institution_users")
        .select("id", { count: "exact", head: true })
        .eq("status", "active")
        .returns<CountResult[]>(),
      this.supabaseAdminClient
        .from("invitations")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending")
        .returns<CountResult[]>(),
      this.supabaseAdminClient
        .from("institution_questions")
        .select("id", { count: "exact", head: true })
        .returns<CountResult[]>(),
      this.supabaseAdminClient
        .from("institution_templates")
        .select("id", { count: "exact", head: true })
        .returns<CountResult[]>(),
      this.supabaseAdminClient
        .from("institutions")
        .select("id, name, slug, institution_type, status, created_at")
        .order("created_at", { ascending: false })
        .limit(8)
        .returns<PlatformInstitutionRow[]>()
    ]);

    const errors = [
      institutionsCountResult.error,
      activeUsersCountResult.error,
      pendingInvitationsCountResult.error,
      questionsCountResult.error,
      templatesCountResult.error,
      recentInstitutionsResult.error
    ];

    if (errors.some(Boolean)) {
      throw new NotFoundException("Unable to load platform dashboard summary.");
    }

    return {
      totals: {
        institutions: institutionsCountResult.count ?? 0,
        activeUsers: activeUsersCountResult.count ?? 0,
        pendingInvitations: pendingInvitationsCountResult.count ?? 0,
        questions: questionsCountResult.count ?? 0,
        templates: templatesCountResult.count ?? 0
      },
      recentInstitutions:
        recentInstitutionsResult.data?.map((institution) => ({
          id: institution.id,
          name: institution.name,
          slug: institution.slug,
          institutionType: institution.institution_type,
          status: institution.status,
          createdAt: institution.created_at
        })) ?? []
    };
  }

  async listPlatformInstitutions(): Promise<PlatformInstitutionListItem[]> {
    const { data: institutions, error } = await this.supabaseAdminClient
      .from("institutions")
      .select("id, name, slug, institution_type, status, created_at")
      .order("created_at", { ascending: false })
      .returns<PlatformInstitutionRow[]>();

    if (error || !institutions) {
      throw new NotFoundException("Unable to load institutions for platform management.");
    }

    const institutionIds = institutions.map((institution) => institution.id);
    const usage = institutionIds.length > 0 ? await this.loadPlatformInstitutionUsage(institutionIds) : new Map();

    return institutions.map((institution) => ({
      id: institution.id,
      name: institution.name,
      slug: institution.slug,
      institutionType: institution.institution_type,
      status: institution.status,
      createdAt: institution.created_at,
      usage:
        usage.get(institution.id) ?? {
          activeUsers: 0,
          pendingInvitations: 0,
          questions: 0,
          templates: 0
        }
    }));
  }

  async updateInstitutionStatus(
    institutionId: string,
    status: "active" | "trial" | "suspended" | "archived",
    actorUserId: string,
    note?: string
  ) {
    const { data: existingInstitution, error: existingError } = await this.supabaseAdminClient
      .from("institutions")
      .select("id, name, slug, institution_type, status, branding, created_at")
      .eq("id", institutionId)
      .single<
        PlatformInstitutionRow & {
          branding: Record<string, unknown> | null;
        }
      >();

    if (existingError || !existingInstitution) {
      throw new NotFoundException("Institution not found.");
    }

    const currentBranding =
      existingInstitution.branding && typeof existingInstitution.branding === "object"
        ? existingInstitution.branding
        : {};
    const statusHistory = Array.isArray(currentBranding.statusHistory)
      ? currentBranding.statusHistory
      : [];

    const { data, error } = await this.supabaseAdminClient
      .from("institutions")
      .update({
        status,
        branding: {
          ...currentBranding,
          statusHistory: [
            {
              status,
              note: note ?? null,
              changedAt: new Date().toISOString(),
              changedByUserId: actorUserId
            },
            ...statusHistory
          ].slice(0, 12)
        }
      })
      .eq("id", institutionId)
      .select("id, name, slug, institution_type, status, created_at")
      .single<PlatformInstitutionRow>();

    if (error || !data) {
      throw new NotFoundException("Unable to update institution status.");
    }

    return {
      id: data.id,
      name: data.name,
      slug: data.slug,
      institutionType: data.institution_type,
      status: data.status,
      createdAt: data.created_at
    };
  }

  async getPlatformAuditFeed(): Promise<PlatformAuditEvent[]> {
    const [
      institutionsResult,
      invitationsResult,
      questionsResult,
      templatesResult,
      institutionLookupResult
    ] = await Promise.all([
      this.supabaseAdminClient
        .from("institutions")
        .select("id, name, slug, institution_type, status, created_at")
        .order("created_at", { ascending: false })
        .limit(6)
        .returns<PlatformInstitutionRow[]>(),
      this.supabaseAdminClient
        .from("invitations")
        .select("id, institution_id, email, status, created_at")
        .order("created_at", { ascending: false })
        .limit(6)
        .returns<PlatformAuditInvitationRow[]>(),
      this.supabaseAdminClient
        .from("institution_questions")
        .select("id, institution_id, title, status, created_at")
        .order("created_at", { ascending: false })
        .limit(6)
        .returns<PlatformAuditQuestionRow[]>(),
      this.supabaseAdminClient
        .from("institution_templates")
        .select("id, institution_id, name, status, created_at")
        .order("created_at", { ascending: false })
        .limit(6)
        .returns<PlatformAuditTemplateRow[]>(),
      this.supabaseAdminClient
        .from("institutions")
        .select("id, name")
        .returns<Array<{ id: string; name: string }>>()
    ]);

    const errors = [
      institutionsResult.error,
      invitationsResult.error,
      questionsResult.error,
      templatesResult.error,
      institutionLookupResult.error
    ];

    if (errors.some(Boolean)) {
      throw new NotFoundException("Unable to load platform audit activity.");
    }

    const institutionNames = new Map(
      (institutionLookupResult.data ?? []).map((institution) => [institution.id, institution.name])
    );

    const events: PlatformAuditEvent[] = [
      ...((institutionsResult.data ?? []).map((institution) => ({
        id: institution.id,
        institutionId: institution.id,
        institutionName: institution.name,
        eventType: "institution.created" as const,
        title: `Institution created: ${institution.name}`,
        status: institution.status,
        createdAt: institution.created_at
      })) ?? []),
      ...((invitationsResult.data ?? []).map((invitation) => ({
        id: invitation.id,
        institutionId: invitation.institution_id,
        institutionName: institutionNames.get(invitation.institution_id) ?? "Unknown institution",
        eventType: "invitation.created" as const,
        title: `Invitation sent to ${invitation.email}`,
        status: invitation.status,
        createdAt: invitation.created_at
      })) ?? []),
      ...((questionsResult.data ?? []).map((question) => ({
        id: question.id,
        institutionId: question.institution_id,
        institutionName: institutionNames.get(question.institution_id) ?? "Unknown institution",
        eventType: "question.created" as const,
        title: `Question created: ${question.title}`,
        status: question.status,
        createdAt: question.created_at
      })) ?? []),
      ...((templatesResult.data ?? []).map((template) => ({
        id: template.id,
        institutionId: template.institution_id,
        institutionName: institutionNames.get(template.institution_id) ?? "Unknown institution",
        eventType: "template.created" as const,
        title: `Template created: ${template.name}`,
        status: template.status,
        createdAt: template.created_at
      })) ?? [])
    ];

    return events.sort((left, right) => right.createdAt.localeCompare(left.createdAt)).slice(0, 12);
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

  private async loadPlatformInstitutionUsage(institutionIds: string[]) {
    const [usersResult, invitationsResult, questionsResult, templatesResult] = await Promise.all([
      this.supabaseAdminClient
        .from("institution_users")
        .select("institution_id")
        .in("institution_id", institutionIds)
        .eq("status", "active")
        .returns<PlatformInstitutionUsageRow[]>(),
      this.supabaseAdminClient
        .from("invitations")
        .select("institution_id")
        .in("institution_id", institutionIds)
        .eq("status", "pending")
        .returns<PlatformInstitutionUsageRow[]>(),
      this.supabaseAdminClient
        .from("institution_questions")
        .select("institution_id")
        .in("institution_id", institutionIds)
        .returns<PlatformInstitutionUsageRow[]>(),
      this.supabaseAdminClient
        .from("institution_templates")
        .select("institution_id")
        .in("institution_id", institutionIds)
        .returns<PlatformInstitutionUsageRow[]>()
    ]);

    if (usersResult.error || invitationsResult.error || questionsResult.error || templatesResult.error) {
      throw new NotFoundException("Unable to load platform institution usage.");
    }

    const usageMap = new Map<string, PlatformInstitutionListItem["usage"]>();

    for (const institutionId of institutionIds) {
      usageMap.set(institutionId, {
        activeUsers: 0,
        pendingInvitations: 0,
        questions: 0,
        templates: 0
      });
    }

    for (const user of usersResult.data ?? []) {
      const current = usageMap.get(user.institution_id);
      if (current) current.activeUsers += 1;
    }

    for (const invitation of invitationsResult.data ?? []) {
      const current = usageMap.get(invitation.institution_id);
      if (current) current.pendingInvitations += 1;
    }

    for (const question of questionsResult.data ?? []) {
      const current = usageMap.get(question.institution_id);
      if (current) current.questions += 1;
    }

    for (const template of templatesResult.data ?? []) {
      const current = usageMap.get(template.institution_id);
      if (current) current.templates += 1;
    }

    return usageMap;
  }
}
