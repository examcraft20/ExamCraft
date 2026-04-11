import {
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
import { CreateTemplateDto } from "./dto/create-template.dto";
import { readReviewComment, readReviewHistory } from "../common/utils/review.utils";

export type TemplateRow = {
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

@Injectable()
export class TemplatesService {
  constructor(
    @Inject(SUPABASE_ADMIN_CLIENT)
    private readonly supabaseAdminClient: SupabaseClient,
  ) {}

  async listTemplates(institutionContext: InstitutionContext) {
    const { data, error } = await this.supabaseAdminClient
      .from("institution_templates")
      .select(
        "id, name, exam_type, duration_minutes, total_marks, sections, department_id, course_id, subject_id, status, metadata, created_at",
      )
      .eq("institution_id", institutionContext.institutionId)
      .order("created_at", { ascending: false })
      .returns<TemplateRow[]>();

    if (error || !data) {
      throw new InternalServerErrorException("Unable to load templates.");
    }

    return data.map((template) => this.mapRowToDto(template));
  }

  async createTemplate(
    institutionContext: InstitutionContext,
    currentUser: AuthenticatedUser,
    payload: CreateTemplateDto,
  ) {
    const { data, error } = await this.supabaseAdminClient
      .from("institution_templates")
      .insert({
        institution_id: institutionContext.institutionId,
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
      throw new InternalServerErrorException("Unable to create template.");
    }

    return this.mapRowToDto(data);
  }

  async loadTemplateForInstitution(templateId: string, institutionId: string) {
    const { data, error } = await this.supabaseAdminClient
      .from("institution_templates")
      .select(
        "id, name, exam_type, duration_minutes, total_marks, sections, department_id, course_id, subject_id, status, metadata, created_at",
      )
      .eq("id", templateId)
      .eq("institution_id", institutionId)
      .single<TemplateRow>();

    if (error || !data) {
      throw new NotFoundException("Template not found.");
    }

    return data;
  }

  private mapRowToDto(template: TemplateRow) {
    return {
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
      reviewComment: readReviewComment(template.metadata),
      reviewHistory: readReviewHistory(template.metadata),
      createdAt: template.created_at,
    };
  }
}
