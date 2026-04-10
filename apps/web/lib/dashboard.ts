export const rolePriority = [
  "super_admin",
  "institution_admin",
  "academic_head",
  "reviewer_approver",
  "faculty",
] as const;

export type AppRole = (typeof rolePriority)[number];

export type MembershipSummary = {
  institutionUserId: string;
  institutionId: string;
  institutionName: string;
  institutionSlug: string;
  institutionType: string;
  branding: any;
  displayName: string | null;
  roleCodes: string[];
};

export type TenantContextResponse = {
  tenantContext: {
    institutionId: string;
    institutionUserId: string;
    roleCodes: string[];
    permissionCodes: string[];
  };
};

export type AuthMeResponse = {
  user: {
    id: string;
    email?: string;
    roleCodes: string[];
    isSuperAdmin: boolean;
  } | null;
};

export type InstitutionDashboardSummaryResponse = {
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
    reviewComment?: string | null;
    reviewHistory?: ReviewHistoryEntry[];
    createdAt: string;
  }>;
  recentTemplates: Array<{
    id: string;
    name: string;
    examType: string;
    status: string;
    reviewComment?: string | null;
    reviewHistory?: ReviewHistoryEntry[];
    createdAt: string;
  }>;
};

export type ReviewHistoryEntry = {
  action: "approve" | "reject" | "archive" | "comment";
  comment?: string;
  reviewedAt: string;
  reviewedByUserId: string;
  reviewedByRoles: string[];
};

export type QuestionRecord = {
  id: string;
  title: string;
  subject: string;
  bloomLevel: string;
  difficulty: string;
  tags: string[];
  courseOutcomes: string[];
  unitNumber: number | null;
  departmentId: string | null;
  courseId: string | null;
  status: string;
  reviewComment?: string | null;
  reviewHistory?: ReviewHistoryEntry[];
  createdAt: string;
};

export type TemplateRecord = {
  id: string;
  name: string;
  examType: string;
  durationMinutes: number;
  totalMarks: number;
  sections: Array<{ title: string; questionCount: number; marks: number }>;
  departmentId: string | null;
  courseId: string | null;
  subjectId: string | null;
  tags?: string[];
  status: string;
  reviewComment?: string | null;
  reviewHistory?: ReviewHistoryEntry[];
  createdAt: string;
};

export type PaperRecord = {
  id: string;
  title: string;
  templateId: string;
  templateName: string;
  subject: string;
  totalMarks: number;
  status: string;
  sections: Array<{
    title: string;
    marks: number;
    questionCount?: number;
    questions: Array<{
      id: string;
      title: string;
      marks: number;
      bloomLevel: string;
      difficulty: string;
    }>;
  }>;
  reviewComment?: string | null;
  reviewHistory?: ReviewHistoryEntry[];
  metadata?: any;
  createdAt: string;
};

export type PlatformDashboardSummaryResponse = {
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

export type PlatformInstitutionRecord = {
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
  eventType:
    | "institution.created"
    | "institution.status_changed"
    | "institution.onboarded"
    | "invitation.created"
    | "question.created"
    | "template.created"
    | "questions.bulk_imported"
    | "template.cloned";
  title: string;
  status: string;
  createdAt: string;
};

export function resolvePrimaryRole(roleCodes: string[]): AppRole | null {
  for (const role of rolePriority) {
    if (roleCodes.includes(role)) {
      return role;
    }
  }

  return null;
}

export function formatRoleName(role: string) {
  return role
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

export function getRoleSummary(role: AppRole) {
  switch (role) {
    case "super_admin":
      return {
        title: "Platform control center",
        description:
          "Monitor tenants, manage global settings, and support institutions across the platform.",
      };
    case "institution_admin":
      return {
        title: "Institution operations hub",
        description:
          "Manage users, academic setup, approvals, and publishing for your institution.",
      };
    case "academic_head":
      return {
        title: "Academic oversight workspace",
        description:
          "Review question quality, approve submissions, and coordinate academic readiness.",
      };
    case "reviewer_approver":
      return {
        title: "Review and approval desk",
        description:
          "Evaluate submitted papers, record review outcomes, and keep release quality high.",
      };
    case "faculty":
      return {
        title: "Faculty authoring workspace",
        description:
          "Create questions, build templates, and draft papers for review.",
      };
  }
}
