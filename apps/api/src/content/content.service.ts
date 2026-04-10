import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Logger,
} from "@nestjs/common";
import type { SupabaseClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type {
  AuthenticatedUser,
  TenantContext,
} from "../common/types/authenticated-request";
import { SUPABASE_ADMIN_CLIENT } from "../supabase/supabase.constants";
import { CreateQuestionDto } from "./dto/create-question.dto";
import { EditQuestionDto } from "./dto/edit-question.dto";
import { CreateBulkQuestionsDto } from "./dto/create-bulk-questions.dto";
import { CreateTemplateDto } from "./dto/create-template.dto";
import { ReviewContentDto } from "./dto/review-content.dto";
import { GeneratePaperDto } from "./dto/generate-paper.dto";
import { MailerService } from "../modules/mailer/mailer.service";

type QuestionRow = {
  id: string;
  title: string;
  subject: string;
  bloom_level: string;
  difficulty: string;
  tags: string[] | null;
  course_outcomes: string[] | null;
  unit_number: number | null;
  department_id: string | null;
  course_id: string | null;
  status: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

type TemplateRow = {
  id: string;
  name: string;
  exam_type: string;
  duration_minutes: number;
  total_marks: number;
  sections: unknown;
  department_id: string | null;
  course_id: string | null;
  subject_id: string | null;
  status: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

type ContentReviewEntry = {
  action: ReviewContentDto["action"];
  comment?: string;
  reviewedAt: string;
  reviewedByUserId: string;
  reviewedByRoles: string[];
};

type QuestionReviewStatus = "draft" | "ready" | "archived";
type TemplateReviewStatus = "draft" | "published" | "archived";
type PaperReviewStatus =
  | "draft"
  | "submitted"
  | "in_review"
  | "approved"
  | "rejected"
  | "published"
  | "archived";

@Injectable()
export class ContentService {
  constructor(
    @Inject(SUPABASE_ADMIN_CLIENT)
    private readonly supabaseAdminClient: SupabaseClient,
    private readonly mailerService: MailerService,
  ) {}

  async listQuestions(tenantContext: TenantContext) {
    const { data, error } = await this.supabaseAdminClient
      .from("institution_questions")
      .select(
        "id, title, subject, bloom_level, difficulty, tags, course_outcomes, unit_number, department_id, course_id, status, metadata, created_at",
      )
      .eq("institution_id", tenantContext.institutionId)
      .order("created_at", { ascending: false })
      .returns<QuestionRow[]>();

    if (error || !data) {
      throw new InternalServerErrorException(
        "Unable to load institution questions.",
      );
    }

    return data.map((question) => ({
      id: question.id,
      title: question.title,
      subject: question.subject,
      bloomLevel: question.bloom_level,
      difficulty: question.difficulty,
      tags: question.tags ?? [],
      courseOutcomes: question.course_outcomes ?? [],
      unitNumber: question.unit_number,
      departmentId: question.department_id,
      courseId: question.course_id,
      status: question.status,
      reviewComment: this.readReviewComment(question.metadata),
      reviewHistory: this.readReviewHistory(question.metadata),
      createdAt: question.created_at,
    }));
  }

  async createQuestion(
    tenantContext: TenantContext,
    currentUser: AuthenticatedUser,
    payload: CreateQuestionDto,
  ) {
    const { data, error } = await this.supabaseAdminClient
      .from("institution_questions")
      .insert({
        institution_id: tenantContext.institutionId,
        created_by_user_id: currentUser.id,
        title: payload.title,
        subject: payload.subject,
        bloom_level: payload.bloomLevel,
        difficulty: payload.difficulty,
        tags: payload.tags ?? [],
        course_outcomes: payload.courseOutcomes ?? [],
        unit_number: payload.unitNumber ?? null,
        department_id: payload.departmentId ?? null,
        course_id: payload.courseId ?? null,
        status: "draft",
      })
      .select(
        "id, title, subject, bloom_level, difficulty, tags, course_outcomes, unit_number, department_id, course_id, status, metadata, created_at",
      )
      .single<QuestionRow>();

    if (error || !data) {
      throw new InternalServerErrorException(
        "Unable to create institution question.",
      );
    }

    return {
      id: data.id,
      title: data.title,
      subject: data.subject,
      bloomLevel: data.bloom_level,
      difficulty: data.difficulty,
      tags: data.tags ?? [],
      courseOutcomes: data.course_outcomes ?? [],
      unitNumber: data.unit_number,
      departmentId: data.department_id,
      courseId: data.course_id,
      status: data.status,
      reviewComment: this.readReviewComment(data.metadata),
      reviewHistory: this.readReviewHistory(data.metadata),
      createdAt: data.created_at,
    };
  }

  async getQuestion(tenantContext: TenantContext, questionId: string) {
    const existing = await this.loadQuestionForInstitution(
      questionId,
      tenantContext.institutionId,
    );
    return {
      id: existing.id,
      title: existing.title,
      subject: existing.subject,
      bloomLevel: existing.bloom_level,
      difficulty: existing.difficulty,
      tags: existing.tags ?? [],
      courseOutcomes: existing.course_outcomes ?? [],
      unitNumber: existing.unit_number,
      departmentId: existing.department_id,
      courseId: existing.course_id,
      status: existing.status,
      reviewComment: this.readReviewComment(existing.metadata),
      reviewHistory: this.readReviewHistory(existing.metadata),
      createdAt: existing.created_at,
    };
  }

  async editQuestion(
    tenantContext: TenantContext,
    currentUser: AuthenticatedUser,
    questionId: string,
    payload: EditQuestionDto,
  ) {
    const existing = await this.loadQuestionForInstitution(
      questionId,
      tenantContext.institutionId,
    );

    // Assuming we only allow editing draft or ready questions
    if (existing.status === "archived") {
      throw new BadRequestException("Cannot edit an archived question.");
    }

    const updates: Record<string, unknown> = {};
    if (payload.title !== undefined) updates.title = payload.title;
    if (payload.subject !== undefined) updates.subject = payload.subject;
    if (payload.bloomLevel !== undefined)
      updates.bloom_level = payload.bloomLevel;
    if (payload.difficulty !== undefined)
      updates.difficulty = payload.difficulty;
    if (payload.tags !== undefined) updates.tags = payload.tags;
    if (payload.courseOutcomes !== undefined)
      updates.course_outcomes = payload.courseOutcomes;
    if (payload.unitNumber !== undefined)
      updates.unit_number = payload.unitNumber;
    if (payload.departmentId !== undefined)
      updates.department_id = payload.departmentId;
    if (payload.courseId !== undefined) updates.course_id = payload.courseId;

    const { data, error } = await this.supabaseAdminClient
      .from("institution_questions")
      .update(updates)
      .eq("id", questionId)
      .eq("institution_id", tenantContext.institutionId)
      .select(
        "id, title, subject, bloom_level, difficulty, tags, course_outcomes, unit_number, department_id, course_id, status, metadata, created_at",
      )
      .single<QuestionRow>();

    if (error || !data) {
      throw new InternalServerErrorException(
        "Unable to update institution question.",
      );
    }

    return {
      id: data.id,
      title: data.title,
      subject: data.subject,
      bloomLevel: data.bloom_level,
      difficulty: data.difficulty,
      tags: data.tags ?? [],
      courseOutcomes: data.course_outcomes ?? [],
      unitNumber: data.unit_number,
      departmentId: data.department_id,
      courseId: data.course_id,
      status: data.status,
      reviewComment: this.readReviewComment(data.metadata),
      reviewHistory: this.readReviewHistory(data.metadata),
      createdAt: data.created_at,
    };
  }

  async archiveQuestion(
    tenantContext: TenantContext,
    currentUser: AuthenticatedUser,
    questionId: string,
  ) {
    const existing = await this.loadQuestionForInstitution(
      questionId,
      tenantContext.institutionId,
    );

    if (existing.status === "archived") {
      return;
    }

    const { error } = await this.supabaseAdminClient
      .from("institution_questions")
      .update({ status: "archived" })
      .eq("id", questionId)
      .eq("institution_id", tenantContext.institutionId);

    if (error) {
      throw new InternalServerErrorException(
        "Unable to archive institution question.",
      );
    }
  }

  async createBulkQuestions(
    tenantContext: TenantContext,
    currentUser: AuthenticatedUser,
    payload: CreateBulkQuestionsDto,
  ) {
    const MAX_BATCH_SIZE = 500;

    if (!payload.questions || payload.questions.length === 0) {
      return [];
    }

    if (payload.questions.length > MAX_BATCH_SIZE) {
      throw new BadRequestException(
        `Cannot create more than ${MAX_BATCH_SIZE} questions at once. Please split your request into smaller batches.`,
      );
    }

    const rowsToInsert = payload.questions.map((q) => ({
      institution_id: tenantContext.institutionId,
      created_by_user_id: currentUser.id,
      title: q.title,
      subject: q.subject,
      bloom_level: q.bloomLevel,
      difficulty: q.difficulty,
      tags: q.tags ?? [],
      course_outcomes: q.courseOutcomes ?? [],
      unit_number: q.unitNumber ?? null,
      department_id: q.departmentId ?? null,
      course_id: q.courseId ?? null,
      status: "draft",
    }));

    const { data, error } = await this.supabaseAdminClient
      .from("institution_questions")
      .insert(rowsToInsert)
      .select(
        "id, title, subject, bloom_level, difficulty, tags, course_outcomes, unit_number, department_id, course_id, status, metadata, created_at",
      )
      .returns<QuestionRow[]>();

    if (error || !data) {
      throw new InternalServerErrorException(
        "Unable to create institution questions.",
      );
    }

    return data.map((d) => ({
      id: d.id,
      title: d.title,
      subject: d.subject,
      bloomLevel: d.bloom_level,
      difficulty: d.difficulty,
      tags: d.tags ?? [],
      courseOutcomes: d.course_outcomes ?? [],
      unitNumber: d.unit_number,
      departmentId: d.department_id,
      courseId: d.course_id,
      status: d.status,
      reviewComment: this.readReviewComment(d.metadata),
      reviewHistory: this.readReviewHistory(d.metadata),
      createdAt: d.created_at,
    }));
  }

  async listTemplates(tenantContext: TenantContext) {
    const { data, error } = await this.supabaseAdminClient
      .from("institution_templates")
      .select(
        "id, name, exam_type, duration_minutes, total_marks, sections, department_id, course_id, subject_id, status, metadata, created_at",
      )
      .eq("institution_id", tenantContext.institutionId)
      .order("created_at", { ascending: false })
      .returns<TemplateRow[]>();

    if (error || !data) {
      throw new InternalServerErrorException(
        "Unable to load institution templates.",
      );
    }

    return data.map((template) => ({
      id: template.id,
      name: template.name,
      examType: template.exam_type,
      durationMinutes: template.duration_minutes,
      totalMarks: template.total_marks,
      sections: Array.isArray(template.sections) ? template.sections : [],
      departmentId: template.department_id,
      courseId: template.course_id,
      subjectId: template.subject_id,
      status: template.status,
      reviewComment: this.readReviewComment(template.metadata),
      reviewHistory: this.readReviewHistory(template.metadata),
      createdAt: template.created_at,
    }));
  }

  async createTemplate(
    tenantContext: TenantContext,
    currentUser: AuthenticatedUser,
    payload: CreateTemplateDto,
  ) {
    const { data, error } = await this.supabaseAdminClient
      .from("institution_templates")
      .insert({
        institution_id: tenantContext.institutionId,
        created_by_user_id: currentUser.id,
        name: payload.name,
        exam_type: payload.examType,
        duration_minutes: payload.durationMinutes,
        total_marks: payload.totalMarks,
        sections: payload.sections ?? [],
        department_id: payload.departmentId ?? null,
        course_id: payload.courseId ?? null,
        subject_id: payload.subjectId ?? null,
        status: "draft",
      })
      .select(
        "id, name, exam_type, duration_minutes, total_marks, sections, department_id, course_id, subject_id, status, metadata, created_at",
      )
      .single<TemplateRow>();

    if (error || !data) {
      throw new InternalServerErrorException(
        "Unable to create institution template.",
      );
    }

    return {
      id: data.id,
      name: data.name,
      examType: data.exam_type,
      durationMinutes: data.duration_minutes,
      totalMarks: data.total_marks,
      sections: Array.isArray(data.sections) ? data.sections : [],
      departmentId: data.department_id,
      courseId: data.course_id,
      subjectId: data.subject_id,
      status: data.status,
      reviewComment: this.readReviewComment(data.metadata),
      reviewHistory: this.readReviewHistory(data.metadata),
      createdAt: data.created_at,
    };
  }

  async reviewQuestion(
    tenantContext: TenantContext,
    currentUser: AuthenticatedUser,
    questionId: string,
    payload: ReviewContentDto,
  ) {
    this.assertReviewPermission(tenantContext, payload.action);

    const existingQuestion = await this.loadQuestionForInstitution(
      questionId,
      tenantContext.institutionId,
    );
    const nextMetadata = this.buildNextMetadata(
      existingQuestion.metadata,
      currentUser,
      payload,
    );
    const nextStatus = this.resolveQuestionStatus(
      existingQuestion.status as QuestionReviewStatus,
      payload.action,
    );

    const { data, error } = await this.supabaseAdminClient
      .from("institution_questions")
      .update({
        status: nextStatus,
        metadata: nextMetadata,
      })
      .eq("id", questionId)
      .eq("institution_id", tenantContext.institutionId)
      .select(
        "id, title, subject, bloom_level, difficulty, tags, course_outcomes, unit_number, department_id, course_id, status, metadata, created_at",
      )
      .single<QuestionRow>();

    if (error || !data) {
      throw new InternalServerErrorException(
        "Unable to update question review state.",
      );
    }

    return {
      id: data.id,
      title: data.title,
      subject: data.subject,
      bloomLevel: data.bloom_level,
      difficulty: data.difficulty,
      tags: data.tags ?? [],
      courseOutcomes: data.course_outcomes ?? [],
      unitNumber: data.unit_number,
      departmentId: data.department_id,
      courseId: data.course_id,
      status: data.status,
      reviewComment: this.readReviewComment(data.metadata),
      reviewHistory: this.readReviewHistory(data.metadata),
      createdAt: data.created_at,
    };
  }

  async reviewTemplate(
    tenantContext: TenantContext,
    currentUser: AuthenticatedUser,
    templateId: string,
    payload: ReviewContentDto,
  ) {
    this.assertReviewPermission(tenantContext, payload.action);

    const existingTemplate = await this.loadTemplateForInstitution(
      templateId,
      tenantContext.institutionId,
    );
    const nextMetadata = this.buildNextMetadata(
      existingTemplate.metadata,
      currentUser,
      payload,
    );
    const nextStatus = this.resolveTemplateStatus(
      existingTemplate.status as TemplateReviewStatus,
      payload.action,
    );

    const { data, error } = await this.supabaseAdminClient
      .from("institution_templates")
      .update({
        status: nextStatus,
        metadata: nextMetadata,
      })
      .eq("id", templateId)
      .eq("institution_id", tenantContext.institutionId)
      .select(
        "id, name, exam_type, duration_minutes, total_marks, sections, status, metadata, created_at",
      )
      .single<TemplateRow>();

    if (error || !data) {
      throw new InternalServerErrorException(
        "Unable to update template review state.",
      );
    }

    return {
      id: data.id,
      name: data.name,
      examType: data.exam_type,
      durationMinutes: data.duration_minutes,
      totalMarks: data.total_marks,
      sections: Array.isArray(data.sections) ? data.sections : [],
      status: data.status,
      reviewComment: this.readReviewComment(data.metadata),
      reviewHistory: this.readReviewHistory(data.metadata),
      createdAt: data.created_at,
    };
  }

  async generatePaper(
    tenantContext: TenantContext,
    currentUser: AuthenticatedUser,
    payload: GeneratePaperDto,
  ) {
    const template = await this.loadTemplateForInstitution(
      payload.templateId,
      tenantContext.institutionId,
    );
    const sections = Array.isArray(template.sections)
      ? (template.sections as any[])
      : [];
    const paperSections = [];

    for (const section of sections) {
      const { data: questions, error } = await this.supabaseAdminClient.rpc(
        "get_random_questions",
        {
          p_institution_id: tenantContext.institutionId,
          p_limit: section.questionCount,
          p_difficulties:
            section.allowedDifficulty?.length > 0
              ? section.allowedDifficulty
              : null,
          p_bloom_levels:
            section.allowedBloomLevels?.length > 0
              ? section.allowedBloomLevels
              : null,
          p_unit_numbers:
            section.allowedUnitNumbers?.length > 0
              ? section.allowedUnitNumbers
              : null,
          p_department_id: template.department_id || null,
          p_course_id: template.course_id || null,
          p_subject_id: template.subject_id || null,
        },
      );

      if (
        error ||
        !questions ||
        questions.length < (section.questionCount || 0)
      ) {
        throw new BadRequestException(
          `Insufficient approved questions for section "${section.title}". Found ${questions?.length || 0}, need ${section.questionCount}.`,
        );
      }

      paperSections.push({
        title: section.title,
        marks: section.marks,
        questions: questions.map((q: any) => ({
          id: q.id,
          title: q.title,
          difficulty: q.difficulty,
          bloomLevel: q.bloom_level,
          metadata: q.metadata,
        })),
      });
    }

    const { data: paper, error: paperError } = await this.supabaseAdminClient
      .from("institution_papers")
      .insert({
        institution_id: tenantContext.institutionId,
        created_by_user_id: currentUser.id,
        template_id: payload.templateId,
        title: payload.title,
        status: "draft",
        metadata: {
          sections: paperSections,
        },
      })
      .select()
      .single();

    if (paperError) {
      throw new InternalServerErrorException(
        "Failed to save the generated paper.",
      );
    }

    return paper;
  }

  async listPapers(tenantContext: TenantContext) {
    const { data, error } = await this.supabaseAdminClient
      .from("institution_papers")
      .select("id, title, status, created_at")
      .eq("institution_id", tenantContext.institutionId)
      .order("created_at", { ascending: false });

    if (error || !data) {
      throw new InternalServerErrorException(
        "Unable to load institution papers.",
      );
    }

    return data.map((d) => ({
      id: d.id,
      title: d.title,
      status: d.status,
      createdAt: d.created_at,
    }));
  }

  async getPaper(tenantContext: TenantContext, paperId: string) {
    const { data, error } = await this.supabaseAdminClient
      .from("institution_papers")
      .select("id, title, status, metadata, created_at")
      .eq("id", paperId)
      .eq("institution_id", tenantContext.institutionId)
      .single();

    if (error || !data) {
      throw new NotFoundException("Paper not found.");
    }

    return {
      id: data.id,
      title: data.title,
      status: data.status,
      metadata: data.metadata,
      createdAt: data.created_at,
    };
  }

  async submitPaper(
    tenantContext: TenantContext,
    currentUser: AuthenticatedUser,
    paperId: string,
  ) {
    const { data, error } = await this.supabaseAdminClient
      .from("institution_papers")
      .update({
        status: "submitted",
        submitted_at: new Date().toISOString(),
      })
      .eq("id", paperId)
      .eq("institution_id", tenantContext.institutionId)
      .select()
      .single();

    if (error || !data) {
      throw new InternalServerErrorException(
        "Unable to submit paper for review.",
      );
    }

    try {
      // Find reviewers in this institution to notify
      const { data: roles } = await this.supabaseAdminClient
        .from("roles")
        .select("id")
        .eq("code", "reviewer")
        .single();

      if (roles) {
        const { data: reviewers } = await this.supabaseAdminClient
          .from("institution_user_roles")
          .select("institution_users(users(email))")
          .eq("role_id", roles.id);

        if (reviewers && reviewers.length > 0) {
          const emails = reviewers
            .map((r: any) => r.institution_users?.users?.email)
            .filter(Boolean);
          for (const email of emails) {
            this.mailerService
              .sendPaperSubmittedForReview(
                email,
                data.title,
                currentUser.email || "A faculty member",
              )
              .catch((e) =>
                this.logger.error("Failed to send paper submitted email", e),
              );
          }
        }
      }
    } catch (e) {
      this.logger.warn("Failed to lookup reviewers for email notification", e);
    }

    return data;
  }

  async reviewPaper(
    tenantContext: TenantContext,
    currentUser: AuthenticatedUser,
    paperId: string,
    payload: ReviewContentDto,
  ) {
    this.assertReviewPermission(tenantContext, payload.action);

    const { data: existingPaper, error: loadError } =
      await this.supabaseAdminClient
        .from("institution_papers")
        .select("status, metadata, created_by_user_id, title")
        .eq("id", paperId)
        .eq("institution_id", tenantContext.institutionId)
        .single();

    if (loadError || !existingPaper) {
      throw new NotFoundException("Paper not found.");
    }

    const nextMetadata = this.buildNextMetadata(
      existingPaper.metadata,
      currentUser,
      payload,
    );
    const nextStatus = this.resolvePaperStatus(
      existingPaper.status as PaperReviewStatus,
      payload.action,
    );

    const { data, error } = await this.supabaseAdminClient
      .from("institution_papers")
      .update({
        status: nextStatus,
        metadata: nextMetadata,
        reviewed_at: new Date().toISOString(),
        approved_at:
          payload.action === "approve" ? new Date().toISOString() : null,
      })
      .eq("id", paperId)
      .eq("institution_id", tenantContext.institutionId)
      .select()
      .single();

    if (error || !data) {
      throw new InternalServerErrorException(
        "Unable to update paper review state.",
      );
    }

    try {
      if (payload.action === "approve" || payload.action === "reject") {
        const { data: submitterUser } = await this.supabaseAdminClient
          .from("users")
          .select("email")
          .eq("id", existingPaper.created_by_user_id)
          .single();

        if (submitterUser?.email) {
          this.mailerService
            .sendPaperReviewed(
              submitterUser.email,
              existingPaper.title,
              payload.action === "approve" ? "approved" : "rejected",
              payload.comment || "",
            )
            .catch((e) =>
              this.logger.error("Failed to send paper reviewed email", e),
            );
        }
      }
    } catch (e) {
      this.logger.warn("Failed to notify paper author", e);
    }

    return data;
  }

  private async loadQuestionForInstitution(
    questionId: string,
    institutionId: string,
  ) {
    const { data, error } = await this.supabaseAdminClient
      .from("institution_questions")
      .select(
        "id, title, subject, bloom_level, difficulty, tags, course_outcomes, unit_number, department_id, course_id, status, metadata, created_at",
      )
      .eq("id", questionId)
      .eq("institution_id", institutionId)
      .single<QuestionRow>();

    if (error || !data) {
      throw new NotFoundException(
        "Question not found for the selected institution.",
      );
    }

    return data;
  }

  private async loadTemplateForInstitution(
    templateId: string,
    institutionId: string,
  ) {
    const { data, error } = await this.supabaseAdminClient
      .from("institution_templates")
      .select(
        "id, name, exam_type, duration_minutes, total_marks, sections, status, metadata, created_at",
      )
      .eq("id", templateId)
      .eq("institution_id", institutionId)
      .single<TemplateRow>();

    if (error || !data) {
      throw new NotFoundException(
        "Template not found for the selected institution.",
      );
    }

    return data;
  }

  private assertReviewPermission(
    tenantContext: TenantContext,
    action: ReviewContentDto["action"],
  ) {
    if (!tenantContext.permissionCodes.includes("papers.review")) {
      throw new BadRequestException(
        "Your current role cannot review this content.",
      );
    }

    if (
      action === "approve" &&
      !tenantContext.permissionCodes.includes("papers.approve")
    ) {
      throw new BadRequestException(
        "Your current role cannot approve this content.",
      );
    }

    if (
      action === "reject" &&
      !tenantContext.permissionCodes.includes("papers.reject")
    ) {
      throw new BadRequestException(
        "Your current role cannot reject this content.",
      );
    }
  }

  private resolveQuestionStatus(
    currentStatus: QuestionReviewStatus,
    action: ReviewContentDto["action"],
  ): QuestionReviewStatus {
    switch (action) {
      case "approve":
        return "ready";
      case "reject":
        return "draft";
      case "archive":
        return "archived";
      case "comment":
      default:
        return currentStatus;
    }
  }

  private resolveTemplateStatus(
    currentStatus: TemplateReviewStatus,
    action: ReviewContentDto["action"],
  ): TemplateReviewStatus {
    switch (action) {
      case "approve":
        return "published";
      case "reject":
        return "draft";
      case "archive":
        return "archived";
      case "comment":
      default:
        return currentStatus;
    }
  }

  private resolvePaperStatus(
    currentStatus: PaperReviewStatus,
    action: ReviewContentDto["action"],
  ): PaperReviewStatus {
    switch (action) {
      case "approve":
        return "approved";
      case "reject":
        return "rejected";
      case "archive":
        return "archived";
      case "comment":
        return currentStatus === "submitted" ? "in_review" : currentStatus;
      default:
        return currentStatus;
    }
  }

  private buildNextMetadata(
    metadata: Record<string, unknown> | null,
    currentUser: AuthenticatedUser,
    payload: ReviewContentDto,
  ) {
    const currentMetadata =
      metadata && typeof metadata === "object" ? metadata : {};
    const reviewHistory = this.readReviewHistory(currentMetadata);
    const reviewEntry: ContentReviewEntry = {
      action: payload.action,
      reviewedAt: new Date().toISOString(),
      reviewedByUserId: currentUser.id,
      reviewedByRoles: currentUser.roleCodes,
    };

    if (payload.comment) {
      reviewEntry.comment = payload.comment;
    }

    return {
      ...currentMetadata,
      reviewComment: payload.comment ?? this.readReviewComment(currentMetadata),
      reviewHistory: [reviewEntry, ...reviewHistory].slice(0, 10),
    };
  }

  private readReviewComment(metadata: Record<string, unknown> | null) {
    if (!metadata || typeof metadata !== "object") {
      return null;
    }

    return typeof metadata.reviewComment === "string"
      ? metadata.reviewComment
      : null;
  }

  private readReviewHistory(
    metadata: Record<string, unknown> | null,
  ): ContentReviewEntry[] {
    if (
      !metadata ||
      typeof metadata !== "object" ||
      !Array.isArray(metadata.reviewHistory)
    ) {
      return [];
    }

    return metadata.reviewHistory.flatMap((entry) => {
      if (!entry || typeof entry !== "object") {
        return [];
      }

      const record = entry as Record<string, unknown>;
      if (
        typeof record.action !== "string" ||
        typeof record.reviewedAt !== "string" ||
        typeof record.reviewedByUserId !== "string" ||
        !Array.isArray(record.reviewedByRoles)
      ) {
        return [];
      }

      return [
        {
          action: record.action as ContentReviewEntry["action"],
          comment:
            typeof record.comment === "string" ? record.comment : undefined,
          reviewedAt: record.reviewedAt,
          reviewedByUserId: record.reviewedByUserId,
          reviewedByRoles: record.reviewedByRoles.filter(
            (value): value is string => typeof value === "string",
          ),
        },
      ];
    });
  }

  private readonly logger = new Logger(ContentService.name);

  // ── Gemini helpers ────────────────────────────────────────────────────────────

  private buildSyllabusPrompt(
    text: string,
    subject: string,
    count: number,
  ): string {
    return `You are an expert academic question-paper designer.

Given the following syllabus extract, generate exactly ${count} unique exam questions as a JSON array.

Syllabus:
---
${text.slice(0, 4000)}
---

Rules:
- Subject: "${subject}"
- Each question must be answerable in an exam setting.
- Vary bloom_level across: Remember, Understand, Apply, Analyze, Evaluate, Create
- Vary difficulty across: Easy, Medium, Hard
- tags must be an array of 1–4 relevant keywords from the syllabus.
- unit_number must be an integer 1–5 based on context (default 1 if unknown).
- Return ONLY a raw JSON array — no markdown, no code fences, no explanation.

Required JSON schema per question:
{
  "title": "<question text>",
  "bloom_level": "<one of Remember|Understand|Apply|Analyze|Evaluate|Create>",
  "difficulty": "<one of Easy|Medium|Hard>",
  "subject": "<subject string>",
  "tags": ["<tag1>", "<tag2>"],
  "unit_number": <integer>
}

Output: JSON array of ${count} objects only.`;
  }

  private parseGeminiJson(raw: string): any[] {
    // Strip markdown code fences if present
    let cleaned = raw.trim();
    cleaned = cleaned
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed)) {
      throw new Error("Gemini did not return a JSON array");
    }
    return parsed;
  }

  async analyzeSyllabusAndGenerate(
    tenantContext: TenantContext,
    currentUser: AuthenticatedUser,
    text: string,
    subject = "General",
    count = 5,
  ) {
    const apiKey = process.env["GEMINI_API_KEY"];
    if (!apiKey) {
      throw new InternalServerErrorException(
        "GEMINI_API_KEY is not configured. Please add it to your environment variables.",
      );
    }

    let generatedQuestions: any[];

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = this.buildSyllabusPrompt(text, subject, count);
      const result = await model.generateContent(prompt);
      const raw = result.response.text();
      const items = this.parseGeminiJson(raw);

      generatedQuestions = items.slice(0, count).map((item: any) => ({
        title:
          typeof item.title === "string"
            ? item.title.trim()
            : "Untitled question",
        subject: typeof item.subject === "string" ? item.subject : subject,
        bloomLevel: [
          "Remember",
          "Understand",
          "Apply",
          "Analyze",
          "Evaluate",
          "Create",
        ].includes(item.bloom_level)
          ? item.bloom_level
          : "Understand",
        difficulty: ["Easy", "Medium", "Hard"].includes(item.difficulty)
          ? item.difficulty
          : "Medium",
        tags: Array.isArray(item.tags)
          ? item.tags.filter((t: unknown) => typeof t === "string").slice(0, 6)
          : ["AI Generated"],
        courseOutcomes: ["CO1"],
        unitNumber: Number.isInteger(item.unit_number) ? item.unit_number : 1,
        departmentId: null,
        courseId: null,
        status: "draft",
      }));
    } catch (err) {
      this.logger.error("Gemini syllabus generation failed", err);
      throw new InternalServerErrorException(
        "AI generation failed. Please try again or check your GEMINI_API_KEY.",
      );
    }

    // Optionally bulk-insert the generated questions into the question bank
    // (They are returned to the client for preview; client decides whether to save)
    return {
      generatedQuestions,
      metadata: {
        wordCount: text.length,
        model: "gemini-1.5-flash",
        requestedCount: count,
        returnedCount: generatedQuestions.length,
      },
    };
  }
}
