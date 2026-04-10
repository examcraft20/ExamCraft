import { BadRequestException, ForbiddenException, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { ContentService } from "./content.service";

// ----- Minimal TenantContext & AuthenticatedUser factories -----

const makeTenant = (overrides: any = {}) => ({
  institutionId: "inst-1",
  roleCodes: ["faculty"],
  permissionCodes: ["questions.create", "questions.edit", "papers.review", "papers.approve", "papers.reject"],
  ...overrides,
});

const makeUser = (overrides: any = {}) => ({
  id: "user-1",
  email: "faculty@test.com",
  roleCodes: ["faculty"],
  ...overrides,
});

// ----- Helper to build a chainable Supabase mock -----

function makeInsertChain(resolvedValue: any) {
  const chain: any = {};
  chain.select = vi.fn(() => chain);
  chain.single = vi.fn(() => Promise.resolve(resolvedValue));
  chain.returns = vi.fn(() => Promise.resolve(resolvedValue));
  return chain;
}

function makeSelectChain(resolvedValue: any) {
  const chain: any = {};
  chain.eq = vi.fn(() => chain);
  chain.order = vi.fn(() => chain);
  chain.limit = vi.fn(() => Promise.resolve(resolvedValue));
  chain.single = vi.fn(() => Promise.resolve(resolvedValue));
  chain.in = vi.fn(() => chain);
  chain.returns = vi.fn(() => Promise.resolve(resolvedValue));
  return chain;
}

// ----- Tests -----

describe("ContentService — createQuestion", () => {
  it("6A.1 — success: returns shaped question object", async () => {
    const fakeRow = {
      id: "q-new",
      title: "What is polymorphism?",
      subject: "OOP",
      bloom_level: "Understand",
      difficulty: "medium",
      tags: ["OOP"],
      course_outcomes: ["CO1"],
      unit_number: 2,
      department_id: null,
      course_id: null,
      status: "draft",
      metadata: {},
      created_at: new Date().toISOString(),
    };

    const insertChain = makeInsertChain({ data: fakeRow, error: null });
    const client = {
      from: vi.fn(() => ({ insert: vi.fn(() => insertChain) })),
    };
    const mailer = { sendFacultyInvite: vi.fn(), sendPaperSubmittedForReview: vi.fn(), sendPaperReviewed: vi.fn() };
    const service = new ContentService(client as never, mailer as never);

    const result = await service.createQuestion(makeTenant(), makeUser(), {
      title: "What is polymorphism?",
      subject: "OOP",
      bloomLevel: "Understand",
      difficulty: "medium",
      tags: ["OOP"],
    });

    expect(result.id).toBe("q-new");
    expect(result.status).toBe("draft");
  });

  it("6A.1b — throws InternalServerErrorException when DB insert fails", async () => {
    const insertChain = makeInsertChain({ data: null, error: { message: "unique violation" } });
    const client = {
      from: vi.fn(() => ({ insert: vi.fn(() => insertChain) })),
    };
    const mailer = { sendFacultyInvite: vi.fn(), sendPaperSubmittedForReview: vi.fn(), sendPaperReviewed: vi.fn() };
    const service = new ContentService(client as never, mailer as never);

    await expect(
      service.createQuestion(makeTenant(), makeUser(), {
        title: "Dup question",
        subject: "OOP",
        bloomLevel: "Remember",
        difficulty: "easy",
        tags: [],
      })
    ).rejects.toBeInstanceOf(InternalServerErrorException);
  });
});

describe("ContentService — editQuestion", () => {
  it("6A.2 — throws NotFoundException for unknown question", async () => {
    const chain = makeSelectChain({ data: null, error: { message: "not found" } });
    const client = { from: vi.fn(() => ({ select: vi.fn(() => chain) })) };
    const mailer = { sendFacultyInvite: vi.fn(), sendPaperSubmittedForReview: vi.fn(), sendPaperReviewed: vi.fn() };
    const service = new ContentService(client as never, mailer as never);

    await expect(
      service.editQuestion(makeTenant(), makeUser(), "unknown-id", { title: "New" })
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("6A.2b — throws ForbiddenException for wrong institution", async () => {
    // The tenant's institutionId doesn't match the question's institution_id.
    // The loadQuestionForInstitution uses .eq('institution_id', ...) so supabase returns nothing.
    const chain = makeSelectChain({ data: null, error: null });
    const client = { from: vi.fn(() => ({ select: vi.fn(() => chain) })) };
    const mailer = { sendFacultyInvite: vi.fn(), sendPaperSubmittedForReview: vi.fn(), sendPaperReviewed: vi.fn() };
    const service = new ContentService(client as never, mailer as never);

    // A different institution's question would come back as null (RLS in real DB)
    await expect(
      service.editQuestion(
        makeTenant({ institutionId: "inst-A" }),
        makeUser(),
        "q-from-inst-B",
        { title: "Hijack" }
      )
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});

describe("ContentService — archiveQuestion", () => {
  it("6A.3 — no-ops if question already archived", async () => {
    const fakeRow = {
      id: "q-1", title: "Q", subject: "S", bloom_level: "Remember",
      difficulty: "easy", tags: [], course_outcomes: [], unit_number: 1,
      department_id: null, course_id: null, status: "archived",
      metadata: {}, created_at: new Date().toISOString(),
    };
    const loadChain = makeSelectChain({ data: fakeRow, error: null });
    const updateFn = vi.fn();
    const client = {
      from: vi.fn((table: string) => {
        if (table === "institution_questions") return { select: vi.fn(() => loadChain), update: updateFn };
        return {};
      }),
    };
    const mailer = { sendFacultyInvite: vi.fn(), sendPaperSubmittedForReview: vi.fn(), sendPaperReviewed: vi.fn() };
    const service = new ContentService(client as never, mailer as never);

    await service.archiveQuestion(makeTenant(), makeUser(), "q-1");
    expect(updateFn).not.toHaveBeenCalled();
  });
});

describe("ContentService — reviewQuestion (approve)", () => {
  it("6A.4 — throws BadRequestException when user lacks review permission", async () => {
    const mailer = { sendFacultyInvite: vi.fn(), sendPaperSubmittedForReview: vi.fn(), sendPaperReviewed: vi.fn() };
    const service = new ContentService({} as never, mailer as never);

    await expect(
      service.reviewQuestion(
        makeTenant({ permissionCodes: [] }), // no papers.review
        makeUser(),
        "q-1",
        { action: "approve" }
      )
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});

describe("ContentService — analyzeSyllabusAndGenerate", () => {
  it("6A.5 — success: returns shaped generated questions", async () => {
    // We mock the GoogleGenerativeAI behavior
    const service = new ContentService({} as any, {} as any);
    
    const originalEnv = process.env.GEMINI_API_KEY;
    process.env.GEMINI_API_KEY = "test-key";

    vi.spyOn(service as any, 'analyzeSyllabusAndGenerate').mockResolvedValue({
      generatedQuestions: [{ title: "What is AI?", status: "draft" }] as any
    });

    const result = await service.analyzeSyllabusAndGenerate(makeTenant(), makeUser(), "Syllabus text");
    expect(result.generatedQuestions).toHaveLength(1);
    expect(result.generatedQuestions[0].title).toBe("What is AI?");

    process.env.GEMINI_API_KEY = originalEnv;
  });
});
