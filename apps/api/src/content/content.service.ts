import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException
} from "@nestjs/common";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AuthenticatedUser, TenantContext } from "../common/types/authenticated-request";
import { SUPABASE_ADMIN_CLIENT } from "../supabase/supabase.constants";
import { CreateQuestionDto } from "./dto/create-question.dto";
import { CreateTemplateDto } from "./dto/create-template.dto";
import { ReviewContentDto } from "./dto/review-content.dto";

type QuestionRow = {
  id: string;
  title: string;
  subject: string;
  bloom_level: string;
  difficulty: string;
  tags: string[] | null;
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

@Injectable()
export class ContentService {
  constructor(
    @Inject(SUPABASE_ADMIN_CLIENT)
    private readonly supabaseAdminClient: SupabaseClient
  ) {}

  async listQuestions(tenantContext: TenantContext) {
    const { data, error } = await this.supabaseAdminClient
      .from("institution_questions")
      .select("id, title, subject, bloom_level, difficulty, tags, status, metadata, created_at")
      .eq("institution_id", tenantContext.institutionId)
      .order("created_at", { ascending: false })
      .returns<QuestionRow[]>();

    if (error || !data) {
      throw new InternalServerErrorException("Unable to load institution questions.");
    }

    return data.map((question) => ({
      id: question.id,
      title: question.title,
      subject: question.subject,
      bloomLevel: question.bloom_level,
      difficulty: question.difficulty,
      tags: question.tags ?? [],
      status: question.status,
      reviewComment: this.readReviewComment(question.metadata),
      reviewHistory: this.readReviewHistory(question.metadata),
      createdAt: question.created_at
    }));
  }

  async createQuestion(
    tenantContext: TenantContext,
    currentUser: AuthenticatedUser,
    payload: CreateQuestionDto
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
        status: "draft"
      })
      .select("id, title, subject, bloom_level, difficulty, tags, status, metadata, created_at")
      .single<QuestionRow>();

    if (error || !data) {
      throw new InternalServerErrorException("Unable to create institution question.");
    }

    return {
      id: data.id,
      title: data.title,
      subject: data.subject,
      bloomLevel: data.bloom_level,
      difficulty: data.difficulty,
      tags: data.tags ?? [],
      status: data.status,
      reviewComment: this.readReviewComment(data.metadata),
      reviewHistory: this.readReviewHistory(data.metadata),
      createdAt: data.created_at
    };
  }

  async listTemplates(tenantContext: TenantContext) {
    const { data, error } = await this.supabaseAdminClient
      .from("institution_templates")
      .select("id, name, exam_type, duration_minutes, total_marks, sections, status, metadata, created_at")
      .eq("institution_id", tenantContext.institutionId)
      .order("created_at", { ascending: false })
      .returns<TemplateRow[]>();

    if (error || !data) {
      throw new InternalServerErrorException("Unable to load institution templates.");
    }

    return data.map((template) => ({
      id: template.id,
      name: template.name,
      examType: template.exam_type,
      durationMinutes: template.duration_minutes,
      totalMarks: template.total_marks,
      sections: Array.isArray(template.sections) ? template.sections : [],
      status: template.status,
      reviewComment: this.readReviewComment(template.metadata),
      reviewHistory: this.readReviewHistory(template.metadata),
      createdAt: template.created_at
    }));
  }

  async createTemplate(
    tenantContext: TenantContext,
    currentUser: AuthenticatedUser,
    payload: CreateTemplateDto
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
        status: "draft"
      })
      .select("id, name, exam_type, duration_minutes, total_marks, sections, status, metadata, created_at")
      .single<TemplateRow>();

    if (error || !data) {
      throw new InternalServerErrorException("Unable to create institution template.");
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
      createdAt: data.created_at
    };
  }

  async reviewQuestion(
    tenantContext: TenantContext,
    currentUser: AuthenticatedUser,
    questionId: string,
    payload: ReviewContentDto
  ) {
    this.assertReviewPermission(tenantContext, payload.action);

    const existingQuestion = await this.loadQuestionForInstitution(questionId, tenantContext.institutionId);
    const nextMetadata = this.buildNextMetadata(existingQuestion.metadata, currentUser, payload);
    const nextStatus = this.resolveQuestionStatus(existingQuestion.status as QuestionReviewStatus, payload.action);

    const { data, error } = await this.supabaseAdminClient
      .from("institution_questions")
      .update({
        status: nextStatus,
        metadata: nextMetadata
      })
      .eq("id", questionId)
      .eq("institution_id", tenantContext.institutionId)
      .select("id, title, subject, bloom_level, difficulty, tags, status, metadata, created_at")
      .single<QuestionRow>();

    if (error || !data) {
      throw new InternalServerErrorException("Unable to update question review state.");
    }

    return {
      id: data.id,
      title: data.title,
      subject: data.subject,
      bloomLevel: data.bloom_level,
      difficulty: data.difficulty,
      tags: data.tags ?? [],
      status: data.status,
      reviewComment: this.readReviewComment(data.metadata),
      reviewHistory: this.readReviewHistory(data.metadata),
      createdAt: data.created_at
    };
  }

  async reviewTemplate(
    tenantContext: TenantContext,
    currentUser: AuthenticatedUser,
    templateId: string,
    payload: ReviewContentDto
  ) {
    this.assertReviewPermission(tenantContext, payload.action);

    const existingTemplate = await this.loadTemplateForInstitution(templateId, tenantContext.institutionId);
    const nextMetadata = this.buildNextMetadata(existingTemplate.metadata, currentUser, payload);
    const nextStatus = this.resolveTemplateStatus(existingTemplate.status as TemplateReviewStatus, payload.action);

    const { data, error } = await this.supabaseAdminClient
      .from("institution_templates")
      .update({
        status: nextStatus,
        metadata: nextMetadata
      })
      .eq("id", templateId)
      .eq("institution_id", tenantContext.institutionId)
      .select("id, name, exam_type, duration_minutes, total_marks, sections, status, metadata, created_at")
      .single<TemplateRow>();

    if (error || !data) {
      throw new InternalServerErrorException("Unable to update template review state.");
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
      createdAt: data.created_at
    };
  }

  private async loadQuestionForInstitution(questionId: string, institutionId: string) {
    const { data, error } = await this.supabaseAdminClient
      .from("institution_questions")
      .select("id, title, subject, bloom_level, difficulty, tags, status, metadata, created_at")
      .eq("id", questionId)
      .eq("institution_id", institutionId)
      .single<QuestionRow>();

    if (error || !data) {
      throw new NotFoundException("Question not found for the selected institution.");
    }

    return data;
  }

  private async loadTemplateForInstitution(templateId: string, institutionId: string) {
    const { data, error } = await this.supabaseAdminClient
      .from("institution_templates")
      .select("id, name, exam_type, duration_minutes, total_marks, sections, status, metadata, created_at")
      .eq("id", templateId)
      .eq("institution_id", institutionId)
      .single<TemplateRow>();

    if (error || !data) {
      throw new NotFoundException("Template not found for the selected institution.");
    }

    return data;
  }

  private assertReviewPermission(tenantContext: TenantContext, action: ReviewContentDto["action"]) {
    if (!tenantContext.permissionCodes.includes("papers.review")) {
      throw new BadRequestException("Your current role cannot review this content.");
    }

    if (action === "approve" && !tenantContext.permissionCodes.includes("papers.approve")) {
      throw new BadRequestException("Your current role cannot approve this content.");
    }

    if (action === "reject" && !tenantContext.permissionCodes.includes("papers.reject")) {
      throw new BadRequestException("Your current role cannot reject this content.");
    }
  }

  private resolveQuestionStatus(
    currentStatus: QuestionReviewStatus,
    action: ReviewContentDto["action"]
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
    action: ReviewContentDto["action"]
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

  private buildNextMetadata(
    metadata: Record<string, unknown> | null,
    currentUser: AuthenticatedUser,
    payload: ReviewContentDto
  ) {
    const currentMetadata = metadata && typeof metadata === "object" ? metadata : {};
    const reviewHistory = this.readReviewHistory(currentMetadata);
    const reviewEntry: ContentReviewEntry = {
      action: payload.action,
      reviewedAt: new Date().toISOString(),
      reviewedByUserId: currentUser.id,
      reviewedByRoles: currentUser.roleCodes
    };

    if (payload.comment) {
      reviewEntry.comment = payload.comment;
    }

    return {
      ...currentMetadata,
      reviewComment: payload.comment ?? this.readReviewComment(currentMetadata),
      reviewHistory: [reviewEntry, ...reviewHistory].slice(0, 10)
    };
  }

  private readReviewComment(metadata: Record<string, unknown> | null) {
    if (!metadata || typeof metadata !== "object") {
      return null;
    }

    return typeof metadata.reviewComment === "string" ? metadata.reviewComment : null;
  }

  private readReviewHistory(metadata: Record<string, unknown> | null): ContentReviewEntry[] {
    if (!metadata || typeof metadata !== "object" || !Array.isArray(metadata.reviewHistory)) {
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
          comment: typeof record.comment === "string" ? record.comment : undefined,
          reviewedAt: record.reviewedAt,
          reviewedByUserId: record.reviewedByUserId,
          reviewedByRoles: record.reviewedByRoles.filter(
            (value): value is string => typeof value === "string"
          )
        }
      ];
    });
  }
}
