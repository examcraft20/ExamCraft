"use client";

import type {
  AuthMeResponse,
  InstitutionDashboardSummaryResponse,
  MembershipSummary,
  PaperRecord,
  PlatformAuditEvent,
  PlatformDashboardSummaryResponse,
  PlatformInstitutionRecord,
  QuestionRecord,
  TemplateRecord,
  TenantContextResponse,
} from "../dashboard";
import type {
  DepartmentRecord,
  CourseRecord,
  SubjectRecord,
} from "../academic";

type DemoState = {
  user: NonNullable<AuthMeResponse["user"]>;
  memberships: MembershipSummary[];
  tenantContexts: Record<string, TenantContextResponse["tenantContext"]>;
  questions: QuestionRecord[];
  templates: TemplateRecord[];
  papers: PaperRecord[];
  people: {
    users: Array<{
      institutionUserId: string;
      userId: string;
      displayName: string | null;
      status: string;
      joinedAt: string | null;
      roleCodes: string[];
    }>;
    invitations: Array<{
      id: string;
      email: string;
      roleCode: string;
      status: string;
      expiresAt: string;
      createdAt: string;
      rawToken: string;
    }>;
  };
  platformInstitutions: PlatformInstitutionRecord[];
  platformAudit: PlatformAuditEvent[];
  academic: {
    departments: DepartmentRecord[];
    courses: CourseRecord[];
    subjects: SubjectRecord[];
  };
  globalTemplates: Array<{
    id: string;
    name: string;
    examType: string;
    totalMarks: number;
    durationMinutes: number;
    sections: any[];
    tags: string[];
    isVerified: boolean;
  }>;
};

const demoState: DemoState = createInitialDemoState();

function createInitialDemoState(): DemoState {
  const now = new Date().toISOString();
  const demoInstitutionId = "inst-demo-1";
  const demoUserId = "demo-user-1";
  const demoInstitutionUserId = "inst-user-1";

  const questions: QuestionRecord[] = [
    {
      id: "q-1",
      title: "Explain Newton's First Law",
      subject: "Physics",
      bloomLevel: "Understand",
      difficulty: "medium",
      tags: ["motion", "fundamentals"],
      courseOutcomes: ["CO1", "CO2"],
      unitNumber: 1,
      departmentId: "dept-1",
      courseId: "course-1",
      status: "draft",
      createdAt: now,
    },
    {
      id: "q-2",
      title: "Solve quadratic equation using factoring",
      subject: "Mathematics",
      bloomLevel: "Apply",
      difficulty: "easy",
      tags: ["algebra", "quadratic"],
      courseOutcomes: ["CO3"],
      unitNumber: 2,
      departmentId: "dept-1",
      courseId: "course-1",
      status: "ready",
      createdAt: now,
    },
  ];

  const templates: TemplateRecord[] = [
    {
      id: "t-1",
      name: "Midterm Core Template",
      examType: "Midterm",
      durationMinutes: 90,
      totalMarks: 100,
      sections: [
        { title: "Section A", questionCount: 5, marks: 50 },
        { title: "Section B", questionCount: 5, marks: 50 },
      ],
      departmentId: "dept-1",
      courseId: "course-1",
      subjectId: "sub-1",
      status: "draft",
      createdAt: now,
    },
  ];

  const papers: PaperRecord[] = [
    {
      id: "paper-1",
      title: "Mid-Term Physics Exam",
      templateId: "t-1",
      templateName: "Midterm Core Template",
      subject: "Physics",
      totalMarks: 100,
      status: "draft",
      sections: [
        {
          title: "Section A",
          marks: 50,
          questions: questions.slice(0, 1).map((q) => ({
            id: q.id,
            title: q.title,
            marks: 50,
            bloomLevel: q.bloomLevel,
            difficulty: q.difficulty,
          })),
        },
      ],
      createdAt: now,
    },
  ];

  const invitations = [
    {
      id: "invite-1",
      email: "faculty@demo.edu",
      roleCode: "faculty",
      status: "pending",
      expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
      createdAt: now,
      rawToken: "demo-invite-token",
    },
  ];

  const platformInstitutions: PlatformInstitutionRecord[] = [
    {
      id: demoInstitutionId,
      name: "Demo Institute of Technology",
      slug: "demo-tech",
      institutionType: "college",
      status: "trial",
      createdAt: now,
      usage: {
        activeUsers: 6,
        pendingInvitations: invitations.length,
        questions: questions.length,
        templates: templates.length,
      },
    },
    {
      id: "inst-demo-2",
      name: "Northwind Coaching Center",
      slug: "northwind-coaching",
      institutionType: "coaching",
      status: "active",
      createdAt: now,
      usage: {
        activeUsers: 12,
        pendingInvitations: 2,
        questions: 24,
        templates: 6,
      },
    },
  ];

  return {
    user: {
      id: demoUserId,
      email: "demo.user@examcraft.test",
      roleCodes: [
        "super_admin",
        "institution_admin",
        "academic_head",
        "reviewer_approver",
        "faculty",
      ],
      isSuperAdmin: true,
    },
    memberships: [
      {
        institutionUserId: demoInstitutionUserId,
        institutionId: demoInstitutionId,
        institutionName: "Demo Institute of Technology",
        institutionSlug: "demo-tech",
        institutionType: "college",
        branding: null,
        displayName: "Demo User",
        roleCodes: [
          "institution_admin",
          "academic_head",
          "reviewer_approver",
          "faculty",
        ],
      },
    ],
    tenantContexts: {
      [demoInstitutionId]: {
        institutionId: demoInstitutionId,
        institutionUserId: demoInstitutionUserId,
        roleCodes: [
          "institution_admin",
          "academic_head",
          "reviewer_approver",
          "faculty",
        ],
        permissionCodes: [
          "questions.read",
          "questions.create",
          "questions.review",
          "questions.approve",
          "questions.reject",
          "templates.read",
          "templates.create",
          "templates.review",
          "templates.approve",
          "templates.reject",
          "people.read",
          "people.invite",
          "tenant.dashboard",
        ],
      },
    },
    questions,
    templates,
    papers,
    people: {
      users: [
        {
          institutionUserId: demoInstitutionUserId,
          userId: demoUserId,
          displayName: "Demo User",
          status: "active",
          joinedAt: now,
          roleCodes: ["institution_admin", "academic_head"],
        },
        {
          institutionUserId: "inst-user-2",
          userId: "demo-user-2",
          displayName: "Priya Mehta",
          status: "active",
          joinedAt: now,
          roleCodes: ["faculty"],
        },
      ],
      invitations,
    },
    platformInstitutions,
    platformAudit: [
      {
        id: "audit-1",
        institutionId: demoInstitutionId,
        institutionName: "Demo Institute of Technology",
        eventType: "institution.created",
        title: "Demo Institute of Technology onboarded",
        status: "trial",
        createdAt: now,
      },
    ],
    academic: {
      departments: [
        {
          id: "dept-1",
          institution_id: demoInstitutionId,
          name: "Science",
          code: "SCI",
          status: "active",
          created_at: now,
        },
      ],
      courses: [
        {
          id: "course-1",
          institution_id: demoInstitutionId,
          department_id: "dept-1",
          name: "B.Sc Physics",
          code: "BSP",
          status: "active",
          created_at: now,
        },
      ],
      subjects: [
        {
          id: "sub-1",
          institution_id: demoInstitutionId,
          department_id: "dept-1",
          course_id: "course-1",
          name: "Modern Physics",
          code: "PHY101",
          status: "active",
          created_at: now,
        },
      ],
    },
    globalTemplates: [
      {
        id: "global-t-1",
        name: "Standard Final Exam (Engineering)",
        examType: "Term End",
        totalMarks: 100,
        durationMinutes: 180,
        sections: [
          { title: "MCQs", questionCount: 20, marks: 40 },
          { title: "Short Answer", questionCount: 5, marks: 30 },
          { title: "Descriptive", questionCount: 2, marks: 30 },
        ],
        tags: ["engineering", "standard"],
        isVerified: true,
      },
      {
        id: "global-t-2",
        name: "Quick Quiz Mockup",
        examType: "Internal Assessment",
        totalMarks: 20,
        durationMinutes: 30,
        sections: [{ title: "Objective", questionCount: 10, marks: 20 }],
        tags: ["quiz", "test"],
        isVerified: true,
      },
    ],
  };
}

export async function demoApiRequest<TResponse>(
  path: string,
  options: RequestInit & { accessToken?: string; institutionId?: string } = {},
): Promise<TResponse> {
  const method = (options.method || "GET").toUpperCase();
  const [rawPath, queryString] = path.split("?");
  const body = parseBody(options.body);

  if (method === "GET" && rawPath === "/auth/me") {
    return { user: demoState.user } as TResponse;
  }

  if (method === "GET" && rawPath === "/tenant/memberships") {
    return demoState.memberships as TResponse;
  }

  if (method === "GET" && rawPath === "/tenant/context") {
    const institutionId =
      options.institutionId || demoState.memberships[0]?.institutionId;
    const tenantContext = demoState.tenantContexts[institutionId];
    if (!tenantContext) {
      throw new Error("Institution context not found.");
    }
    return { tenantContext } as TResponse;
  }

  if (method === "GET" && rawPath === "/tenant/dashboard-summary") {
    return buildInstitutionSummary() as TResponse;
  }

  if (method === "GET" && rawPath === "/content/questions") {
    return demoState.questions as TResponse;
  }

  if (method === "POST" && rawPath === "/content/questions") {
    const created = {
      id: `q-${Date.now()}`,
      title: body?.title || "Untitled question",
      subject: body?.subject || "General",
      bloomLevel: body?.bloomLevel || "Remember",
      difficulty: body?.difficulty || "medium",
      tags: Array.isArray(body?.tags) ? body.tags : [],
      courseOutcomes: Array.isArray(body?.courseOutcomes)
        ? body.courseOutcomes
        : [],
      unitNumber: body?.unitNumber ?? null,
      departmentId: body?.departmentId ?? null,
      courseId: body?.courseId ?? null,
      status: "draft",
      createdAt: new Date().toISOString(),
    } satisfies QuestionRecord;
    demoState.questions = [created, ...demoState.questions];
    addAuditEvent("question.created", created.title);
    return created as TResponse;
  }

  if (method === "POST" && rawPath === "/content/questions/bulk") {
    const createdArray = (body?.questions || []).map(
      (q: any, i: number) =>
        ({
          id: `q-bulk-${Date.now()}-${i}`,
          title: q.title || "Untitled question",
          subject: q.subject || "General",
          bloomLevel: q.bloomLevel || "Remember",
          difficulty: q.difficulty || "medium",
          tags: Array.isArray(q.tags) ? q.tags : [],
          courseOutcomes: Array.isArray(q.courseOutcomes)
            ? q.courseOutcomes
            : [],
          unitNumber: q.unitNumber ?? null,
          departmentId: q.departmentId ?? null,
          courseId: q.courseId ?? null,
          status: "draft",
          createdAt: new Date().toISOString(),
        }) satisfies QuestionRecord,
    );

    demoState.questions = [...createdArray, ...demoState.questions];
    addAuditEvent(
      "questions.bulk_imported",
      `${createdArray.length} questions`,
    );
    return createdArray as TResponse;
  }

  const questionReviewMatch = rawPath.match(
    /^\/content\/questions\/([^/]+)\/review$/,
  );
  if (questionReviewMatch && method === "PATCH") {
    const questionId = questionReviewMatch[1];
    const question = demoState.questions.find((item) => item.id === questionId);
    if (!question) {
      throw new Error("Question not found.");
    }
    applyReview(question, body);
    return question as TResponse;
  }

  if (method === "GET" && rawPath === "/content/templates") {
    return demoState.templates as TResponse;
  }

  if (method === "GET" && rawPath === "/content/global-templates") {
    return demoState.globalTemplates as TResponse;
  }

  if (
    method === "POST" &&
    rawPath.startsWith("/content/global-templates/") &&
    rawPath.endsWith("/clone")
  ) {
    const globalId = rawPath.split("/")[3];
    const source = demoState.globalTemplates.find((t) => t.id === globalId);
    if (!source) throw new Error("Global template not found.");

    const clone = {
      id: `t-cloned-${Date.now()}`,
      name: `Copy of ${source.name}`,
      examType: source.examType,
      durationMinutes: source.durationMinutes,
      totalMarks: source.totalMarks,
      sections: source.sections,
      departmentId: null,
      courseId: null,
      subjectId: null,
      status: "draft",
      createdAt: new Date().toISOString(),
    } satisfies TemplateRecord;

    demoState.templates = [clone, ...demoState.templates];
    addAuditEvent("template.cloned", clone.name);
    return clone as TResponse;
  }

  if (method === "POST" && rawPath === "/content/templates") {
    const created = {
      id: `t-${Date.now()}`,
      name: body?.name || "Untitled template",
      examType: body?.examType || "Exam",
      durationMinutes: Number(body?.durationMinutes || 0),
      totalMarks: Number(body?.totalMarks || 0),
      sections: Array.isArray(body?.sections) ? body.sections : [],
      departmentId: body?.departmentId || null,
      courseId: body?.courseId || null,
      subjectId: body?.subjectId || null,
      status: "draft",
      createdAt: new Date().toISOString(),
    } satisfies TemplateRecord;
    demoState.templates = [created, ...demoState.templates];
    addAuditEvent("template.created", created.name);
    return created as TResponse;
  }

  const templateReviewMatch = rawPath.match(
    /^\/content\/templates\/([^/]+)\/review$/,
  );
  if (templateReviewMatch && method === "PATCH") {
    const templateId = templateReviewMatch[1];
    const template = demoState.templates.find((item) => item.id === templateId);
    if (!template) {
      throw new Error("Template not found.");
    }
    applyReview(template, body);
    return template as TResponse;
  }

  if (method === "GET" && rawPath === "/content/papers") {
    return demoState.papers as TResponse;
  }

  if (method === "POST" && rawPath === "/content/papers/generate") {
    const templateId = body?.templateId;
    const template = demoState.templates.find((t) => t.id === templateId);
    if (!template) throw new Error("Template not found.");

    const paper = {
      id: `p-${Date.now()}`,
      title: `${template.name} - Generated`,
      templateId: template.id,
      templateName: template.name,
      subject: "Science",
      totalMarks: template.totalMarks,
      status: "draft",
      sections: template.sections.map((s) => ({
        ...s,
        questions: demoState.questions.slice(0, 1).map((q) => ({
          id: q.id,
          title: q.title,
          marks: s.marks / (s.questionCount || 1),
          bloomLevel: q.bloomLevel,
          difficulty: q.difficulty,
        })),
      })),
      createdAt: new Date().toISOString(),
    } satisfies PaperRecord;

    demoState.papers = [paper, ...demoState.papers];
    addAuditEvent("paper.generated" as any, paper.title);
    return paper as TResponse;
  }

  const paperReviewMatch = rawPath.match(
    /^\/content\/papers\/([^/]+)\/review$/,
  );
  if (paperReviewMatch && method === "PATCH") {
    const paperId = paperReviewMatch[1];
    const paper = demoState.papers.find((item) => item.id === paperId);
    if (!paper) throw new Error("Paper not found.");
    applyReview(paper, body);
    return paper as TResponse;
  }

  const paperSubmitMatch = rawPath.match(
    /^\/content\/papers\/([^/]+)\/submit$/,
  );
  if (paperSubmitMatch && method === "PATCH") {
    const paperId = paperSubmitMatch[1];
    const paper = demoState.papers.find((item) => item.id === paperId);
    if (!paper) throw new Error("Paper not found.");
    paper.status = "submitted";
    addAuditEvent("paper.submitted" as any, paper.title);
    return paper as TResponse;
  }

  if (method === "GET" && rawPath === "/people/users") {
    return demoState.people as TResponse;
  }

  if (method === "POST" && rawPath === "/people/invitations") {
    const invitation = {
      id: `invite-${Date.now()}`,
      email: body?.email || "new.staff@examcraft.test",
      roleCode: body?.roleCode || "faculty",
      status: "pending",
      expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
      createdAt: new Date().toISOString(),
      rawToken: `token-${Math.random().toString(36).slice(2)}`,
    };
    demoState.people.invitations = [
      invitation,
      ...demoState.people.invitations,
    ];
    addAuditEvent(
      "invitation.created",
      `Invitation sent to ${invitation.email}`,
    );
    return { rawToken: invitation.rawToken, invitation } as TResponse;
  }

  if (rawPath === "/invitations/preview" && method === "GET") {
    const token = new URLSearchParams(queryString || "").get("token");
    const invitation = demoState.people.invitations.find(
      (item) => item.rawToken === token,
    );
    if (!invitation) {
      throw new Error("Invitation not found.");
    }
    return {
      invitation: {
        institutionId: demoState.memberships[0]?.institutionId ?? "inst-demo-1",
        institutionName:
          demoState.memberships[0]?.institutionName ?? "Demo Institute",
        email: invitation.email,
        roleCode: invitation.roleCode,
        expiresAt: invitation.expiresAt,
      },
    } as TResponse;
  }

  if (rawPath === "/invitations/accept" && method === "POST") {
    if (!body?.token) {
      throw new Error("Invitation token is required.");
    }
    const invitation = demoState.people.invitations.find(
      (item) => item.rawToken === body.token,
    );
    if (!invitation) {
      throw new Error("Invitation not found.");
    }
    invitation.status = "accepted";
    demoState.people.users = [
      {
        institutionUserId: `inst-user-${Date.now()}`,
        userId: `demo-user-${Date.now()}`,
        displayName: body?.displayName || "New staff member",
        status: "active",
        joinedAt: new Date().toISOString(),
        roleCodes: [invitation.roleCode],
      },
      ...demoState.people.users,
    ];
    addAuditEvent(
      "invitation.created",
      `Invitation accepted by ${invitation.email}`,
    );
    return {
      email: invitation.email,
      institutionId: demoState.memberships[0]?.institutionId ?? "inst-demo-1",
    } as TResponse;
  }

  if (rawPath === "/onboarding/institution" && method === "POST") {
    const institutionId = `inst-${Date.now()}`;
    const institutionName = body?.institutionName || "New Institution";
    const institutionSlug = body?.institutionSlug || "new-institution";
    demoState.memberships = [
      ...demoState.memberships,
      {
        institutionUserId: `inst-user-${Date.now()}`,
        institutionId,
        institutionName,
        institutionSlug,
        institutionType: body?.institutionType || "college",
        branding: null,
        displayName: body?.adminDisplayName || "Institution Admin",
        roleCodes: ["institution_admin"],
      },
    ];
    demoState.tenantContexts[institutionId] = {
      institutionId,
      institutionUserId:
        demoState.memberships[demoState.memberships.length - 1]
          .institutionUserId,
      roleCodes: ["institution_admin"],
      permissionCodes: ["tenant.dashboard", "people.invite", "people.read"],
    };
    demoState.platformInstitutions = [
      ...demoState.platformInstitutions,
      {
        id: institutionId,
        name: institutionName,
        slug: institutionSlug,
        institutionType: body?.institutionType || "college",
        status: "trial",
        createdAt: new Date().toISOString(),
        usage: {
          activeUsers: 1,
          pendingInvitations: 0,
          questions: 0,
          templates: 0,
        },
      },
    ];
    addAuditEvent("institution.onboarded", institutionName);
    return { institutionId } as TResponse;
  }

  // Academic Structure Mock Handlers
  if (
    method === "GET" &&
    (rawPath === "/academic/departments" ||
      rawPath === "/academic-structure/departments")
  ) {
    const instId =
      options.institutionId ||
      demoState.memberships[0]?.institutionId ||
      "inst-001";
    return {
      departments: [
        {
          id: "dept-1",
          name: "Computer Technology",
          code: "CT",
          institutionId: instId,
        },
        {
          id: "dept-2",
          name: "Information Technology",
          code: "IT",
          institutionId: instId,
        },
        {
          id: "dept-3",
          name: "Mechanical Engineering",
          code: "ME",
          institutionId: instId,
        },
      ],
    } as TResponse;
  }

  if (
    method === "GET" &&
    (rawPath === "/academic/courses" ||
      rawPath === "/academic-structure/courses")
  ) {
    const instId =
      options.institutionId ||
      demoState.memberships[0]?.institutionId ||
      "inst-001";
    return {
      courses: [
        {
          id: "course-1",
          name: "Diploma in CT",
          departmentId: "dept-1",
          institutionId: instId,
        },
        {
          id: "course-2",
          name: "Diploma in IT",
          departmentId: "dept-1",
          institutionId: instId,
        },
      ],
    } as TResponse;
  }

  if (
    method === "GET" &&
    (rawPath === "/academic/subjects" ||
      rawPath === "/academic-structure/subjects")
  ) {
    const instId =
      options.institutionId ||
      demoState.memberships[0]?.institutionId ||
      "inst-001";
    return {
      subjects: [
        {
          id: "sub-1",
          name: "Physics",
          courseId: "course-1",
          departmentId: "dept-1",
          institutionId: instId,
        },
        {
          id: "sub-2",
          name: "Mathematics",
          courseId: "course-1",
          departmentId: "dept-1",
          institutionId: instId,
        },
        {
          id: "sub-3",
          name: "Operating System",
          courseId: "course-1",
          departmentId: "dept-1",
          institutionId: instId,
        },
      ],
    } as TResponse;
  }

  if (method === "GET" && rawPath === "/academic-structure/batches") {
    const instId =
      options.institutionId ||
      demoState.memberships[0]?.institutionId ||
      "inst-001";
    return {
      batches: [
        {
          id: "batch-1",
          name: "2024-25",
          courseId: "course-1",
          institutionId: instId,
        },
      ],
    } as TResponse;
  }

  if (rawPath.startsWith("/people/users/") && method === "PATCH") {
    const userId = rawPath.split("/")[3];
    const user = demoState.people.users.find((u) => u.userId === userId);
    if (user) {
      if (body.roleCodes) user.roleCodes = body.roleCodes;
      if (body.status) user.status = body.status;
    }
    return user as TResponse;
  }

  if (rawPath === "/tenant/platform-summary" && method === "GET") {
    return buildPlatformSummary() as TResponse;
  }

  if (rawPath === "/tenant/platform-institutions" && method === "GET") {
    return demoState.platformInstitutions as TResponse;
  }

  const platformStatusMatch = rawPath.match(
    /^\/tenant\/platform-institutions\/([^/]+)\/status$/,
  );
  if (platformStatusMatch && method === "PATCH") {
    const institutionId = platformStatusMatch[1];
    const institution = demoState.platformInstitutions.find(
      (item) => item.id === institutionId,
    );
    if (!institution) {
      throw new Error("Institution not found.");
    }
    institution.status = body?.status || institution.status;
    addAuditEvent(
      "institution.status_changed",
      `Status updated to ${institution.status}: ${institution.name}`,
    );
    return institution as TResponse;
  }

  if (rawPath === "/tenant/platform-audit-feed" && method === "GET") {
    return demoState.platformAudit as TResponse;
  }

  if (rawPath === "/tenant/branding" && method === "PATCH") {
    const institutionId =
      options.institutionId || demoState.memberships[0]?.institutionId;
    const membership = demoState.memberships.find(
      (m) => m.institutionId === institutionId,
    );
    if (membership) {
      membership.branding = {
        ...membership.branding,
        ...body,
      };
    }
    return { success: true } as TResponse;
  }

  if (rawPath === "/academic/departments" && method === "GET") {
    return { departments: demoState.academic.departments } as TResponse;
  }
  if (rawPath === "/academic/departments" && method === "POST") {
    const newDept: DepartmentRecord = {
      id: `dept-${Date.now()}`,
      institution_id:
        options.institutionId || demoState.memberships[0].institutionId,
      name: body?.name,
      code: body?.code || null,
      status: "active",
      created_at: new Date().toISOString(),
    };
    demoState.academic.departments.push(newDept);
    return newDept as TResponse;
  }

  if (rawPath === "/academic/courses" && method === "GET") {
    return { courses: demoState.academic.courses } as TResponse;
  }
  if (rawPath === "/academic/courses" && method === "POST") {
    const newCourse: CourseRecord = {
      id: `course-${Date.now()}`,
      institution_id:
        options.institutionId || demoState.memberships[0].institutionId,
      department_id: body?.departmentId || null,
      name: body?.name,
      code: body?.code || null,
      status: "active",
      created_at: new Date().toISOString(),
    };
    demoState.academic.courses.push(newCourse);
    return newCourse as TResponse;
  }

  if (rawPath === "/academic/subjects" && method === "GET") {
    return { subjects: demoState.academic.subjects } as TResponse;
  }
  if (rawPath === "/academic/subjects" && method === "POST") {
    const newSubject: SubjectRecord = {
      id: `subject-${Date.now()}`,
      institution_id:
        options.institutionId || demoState.memberships[0].institutionId,
      department_id: body?.departmentId || null,
      course_id: body?.courseId || null,
      name: body?.name,
      code: body?.code || null,
      status: "active",
      created_at: new Date().toISOString(),
    };
    demoState.academic.subjects.push(newSubject);
    return newSubject as TResponse;
  }

  // DELETE question
  const deleteQuestionMatch = rawPath.match(/^\/content\/questions\/([^/]+)$/);
  if (deleteQuestionMatch && method === "DELETE") {
    const questionId = deleteQuestionMatch[1];
    demoState.questions = demoState.questions.filter(
      (q) => q.id !== questionId,
    );
    addAuditEvent("question.deleted" as any, `Question ${questionId} deleted`);
    return { success: true } as TResponse;
  }

  // Analytics summary - build from demo state
  if (rawPath === "/analytics/summary" && method === "GET") {
    const now = new Date();
    const monthData = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
      return {
        month: `${d.toLocaleString("default", { month: "short" })} ${String(d.getFullYear()).slice(2)}`,
        papers:
          i === 11 ? demoState.papers.length : Math.floor(Math.random() * 5),
        questions:
          i === 11
            ? demoState.questions.filter((q) => q.status === "ready").length
            : Math.floor(Math.random() * 20),
      };
    });
    return {
      totalPapers: demoState.papers.length,
      totalQuestions: demoState.questions.length,
      staffMembers: demoState.people.users.length,
      subjectsCovered: demoState.academic.subjects.length,
      departments: demoState.academic.departments.length,
      pending: demoState.questions.filter((q) => q.status === "draft").length,
      approved: demoState.questions.filter((q) => q.status === "ready").length,
      rejected: demoState.questions.filter((q) => q.status === "rejected")
        .length,
      papersByMonth: monthData,
      difficultyDistribution: [
        {
          name: "Easy",
          value: demoState.questions.filter((q) => q.difficulty === "easy")
            .length,
        },
        {
          name: "Medium",
          value: demoState.questions.filter((q) => q.difficulty === "medium")
            .length,
        },
        {
          name: "Hard",
          value: demoState.questions.filter((q) => q.difficulty === "hard")
            .length,
        },
      ],
    } as TResponse;
  }

  throw new Error(`Demo endpoint not implemented: ${method} ${rawPath}`);
}

function parseBody(body: RequestInit["body"]) {
  if (!body || typeof body !== "string") {
    return null;
  }
  try {
    return JSON.parse(body);
  } catch {
    return null;
  }
}

function buildInstitutionSummary(): InstitutionDashboardSummaryResponse {
  return {
    totals: {
      users: demoState.people.users.length,
      invitations: demoState.people.invitations.length,
      questions: demoState.questions.length,
      templates: demoState.templates.length,
    },
    recentInvitations: demoState.people.invitations
      .slice(0, 5)
      .map((invite) => ({
        id: invite.id,
        email: invite.email,
        roleCode: invite.roleCode,
        status: invite.status,
        createdAt: invite.createdAt,
      })),
    recentQuestions: demoState.questions.slice(0, 5),
    recentTemplates: demoState.templates.slice(0, 5),
  };
}

function buildPlatformSummary(): PlatformDashboardSummaryResponse {
  const totalInstitutions = demoState.platformInstitutions.length;
  const activeUsers = demoState.platformInstitutions.reduce(
    (sum, item) => sum + item.usage.activeUsers,
    0,
  );
  const pendingInvites = demoState.platformInstitutions.reduce(
    (sum, item) => sum + item.usage.pendingInvitations,
    0,
  );
  const totalQuestions = demoState.platformInstitutions.reduce(
    (sum, item) => sum + item.usage.questions,
    0,
  );
  const totalTemplates = demoState.platformInstitutions.reduce(
    (sum, item) => sum + item.usage.templates,
    0,
  );

  return {
    totals: {
      institutions: totalInstitutions,
      activeUsers,
      pendingInvitations: pendingInvites,
      questions: totalQuestions,
      templates: totalTemplates,
    },
    recentInstitutions: demoState.platformInstitutions
      .slice(0, 5)
      .map((institution) => ({
        id: institution.id,
        name: institution.name,
        slug: institution.slug,
        institutionType: institution.institutionType,
        status: institution.status,
        createdAt: institution.createdAt,
      })),
  };
}

function applyReview(
  item: QuestionRecord | TemplateRecord | PaperRecord,
  payload: { action?: string; comment?: string } | null,
) {
  const action = payload?.action;
  if (!action) {
    return;
  }
  const isQuestion = "bloomLevel" in item;
  const isPaper = "templateId" in item;
  if (action === "approve") {
    item.status = isQuestion ? "ready" : isPaper ? "published" : "published";
  }
  if (action === "reject") {
    item.status = "draft";
  }
  if (payload?.comment) {
    item.reviewComment = payload.comment;
    item.reviewHistory = [
      ...(item.reviewHistory ?? []),
      {
        action: action as "approve" | "reject" | "archive" | "comment",
        comment: payload.comment,
        reviewedAt: new Date().toISOString(),
        reviewedByUserId: demoState.user.id,
        reviewedByRoles: demoState.user.roleCodes,
      },
    ];
  }
}

function addAuditEvent(
  eventType: PlatformAuditEvent["eventType"],
  title: string,
) {
  const institution = demoState.platformInstitutions[0];
  demoState.platformAudit = [
    {
      id: `audit-${Date.now()}`,
      institutionId: institution.id,
      institutionName: institution.name,
      eventType,
      title,
      status: institution.status,
      createdAt: new Date().toISOString(),
    },
    ...demoState.platformAudit,
  ];
}
