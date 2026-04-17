import {
  ReviewHistoryEntry,
  InstitutionDashboardSummaryResponse,
  PlatformDashboardSummaryResponse,
  PlatformInstitutionRecord,
  PlatformAuditEvent
} from "@examcraft/types";

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
  branding: Record<string, unknown> | null;
  displayName: string | null;
  roleCodes: string[];
};

export type InstitutionContextResponse = {
  institutionContext: {
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

// Aliased records if they are used elsewhere
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
  metadata?: Record<string, unknown> | null;
  createdAt: string;
};

export type {
  ReviewHistoryEntry,
  InstitutionDashboardSummaryResponse,
  PlatformDashboardSummaryResponse,
  PlatformInstitutionRecord,
  PlatformAuditEvent
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
