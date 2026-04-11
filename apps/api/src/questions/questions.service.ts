import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  AuthenticatedUser,
  InstitutionContext,
} from "../common/types/authenticated-request";
import { SUPABASE_ADMIN_CLIENT } from "../supabase/supabase.constants";
import { CreateQuestionDto } from "./dto/create-question.dto";
import { EditQuestionDto } from "./dto/edit-question.dto";
import { CreateBulkQuestionsDto } from "./dto/create-bulk-questions.dto";
import { readReviewComment, readReviewHistory } from "../common/utils/review.utils";

export type QuestionRow = {
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

@Injectable()
export class QuestionsService {
  constructor(
    @Inject(SUPABASE_ADMIN_CLIENT)
    private readonly supabaseAdminClient: SupabaseClient,
  ) {}

  async listQuestions(institutionContext: InstitutionContext) {
    const { data, error } = await this.supabaseAdminClient
      .from("institution_questions")
      .select(
        "id, title, subject, bloom_level, difficulty, tags, course_outcomes, unit_number, department_id, course_id, status, metadata, created_at",
      )
      .eq("institution_id", institutionContext.institutionId)
      .order("created_at", { ascending: false })
      .returns<QuestionRow[]>();

    if (error || !data) {
      throw new InternalServerErrorException(
        "Unable to load institution questions.",
      );
    }

    return data.map((question) => ({
      ...this.mapRowToDto(question),
    }));
  }

  async createQuestion(
    institutionContext: InstitutionContext,
    currentUser: AuthenticatedUser,
    payload: CreateQuestionDto,
  ) {
    const { data, error } = await this.supabaseAdminClient
      .from("institution_questions")
      .insert({
        institution_id: institutionContext.institutionId,
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

    return this.mapRowToDto(data);
  }

  async getQuestion(institutionContext: InstitutionContext, questionId: string) {
    const existing = await this.loadQuestionForInstitution(
      questionId,
      institutionContext.institutionId,
    );
    return this.mapRowToDto(existing);
  }

  async editQuestion(
    institutionContext: InstitutionContext,
    currentUser: AuthenticatedUser,
    questionId: string,
    payload: EditQuestionDto,
  ) {
    await this.loadQuestionForInstitution(
      questionId,
      institutionContext.institutionId,
    );

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
      .eq("institution_id", institutionContext.institutionId)
      .select(
        "id, title, subject, bloom_level, difficulty, tags, course_outcomes, unit_number, department_id, course_id, status, metadata, created_at",
      )
      .single<QuestionRow>();

    if (error || !data) {
      throw new InternalServerErrorException(
        "Unable to update institution question.",
      );
    }

    return this.mapRowToDto(data);
  }

  async archiveQuestion(
    institutionContext: InstitutionContext,
    currentUser: AuthenticatedUser,
    questionId: string,
  ) {
    const existing = await this.loadQuestionForInstitution(
      questionId,
      institutionContext.institutionId,
    );

    if (existing.status === "archived") {
      return;
    }

    const { error } = await this.supabaseAdminClient
      .from("institution_questions")
      .update({ status: "archived" })
      .eq("id", questionId)
      .eq("institution_id", institutionContext.institutionId);

    if (error) {
      throw new InternalServerErrorException(
        "Unable to archive institution question.",
      );
    }
  }

  async createBulkQuestions(
    institutionContext: InstitutionContext,
    currentUser: AuthenticatedUser,
    payload: CreateBulkQuestionsDto,
  ) {
    const MAX_BATCH_SIZE = 500;

    if (!payload.questions || payload.questions.length === 0) {
      return [];
    }

    if (payload.questions.length > MAX_BATCH_SIZE) {
      throw new BadRequestException(
        `Cannot create more than ${MAX_BATCH_SIZE} questions at once.`,
      );
    }

    const rowsToInsert = payload.questions.map((q) => ({
      institution_id: institutionContext.institutionId,
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
      throw new InternalServerErrorException("Unable to bulk create questions.");
    }

    return data.map((d) => this.mapRowToDto(d));
  }

  async loadQuestionForInstitution(questionId: string, institutionId: string) {
    const { data, error } = await this.supabaseAdminClient
      .from("institution_questions")
      .select(
        "id, title, subject, bloom_level, difficulty, tags, course_outcomes, unit_number, department_id, course_id, status, metadata, created_at",
      )
      .eq("id", questionId)
      .eq("institution_id", institutionId)
      .single<QuestionRow>();

    if (error || !data) {
      throw new NotFoundException("Question not found.");
    }

    return data;
  }

  private mapRowToDto(question: QuestionRow) {
    return {
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
      reviewComment: readReviewComment(question.metadata),
      reviewHistory: readReviewHistory(question.metadata),
      createdAt: question.created_at,
    };
  }
}
