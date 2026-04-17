export type ReviewHistoryEntry = {
    action: "approve" | "reject" | "archive" | "comment";
    comment?: string;
    reviewedAt: string;
    reviewedByUserId: string;
    reviewedByRoles: string[];
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
    eventType: "institution.created" | "institution.status_changed" | "institution.onboarded" | "invitation.created" | "question.created" | "template.created" | "questions.bulk_imported" | "template.cloned";
    title: string;
    status: string;
    createdAt: string;
};
