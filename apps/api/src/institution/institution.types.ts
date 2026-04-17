export type MembershipRow = {
  id: string;
  institution_id: string;
  display_name: string | null;
  institutions:
    | {
        id: string;
        name: string;
        slug: string;
        institution_type: string;
        branding: any;
      }
    | null;
  institution_user_roles: Array<{
    role_id: string;
    roles: {
      code: string;
    } | null;
  }> | null;
};

export type PermissionRow = {
  permissions: {
    code: string;
  } | null;
};

export type TenantMembershipSummary = {
  institutionUserId: string;
  institutionId: string;
  institutionName: string;
  institutionSlug: string;
  institutionType: string;
  branding: any;
  displayName: string | null;
  roleCodes: string[];
};

export type CountResult = {
  count: number | null;
};

export type PlatformInstitutionRow = {
  id: string;
  name: string;
  slug: string;
  institution_type: string;
  status: string;
  created_at: string;
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
