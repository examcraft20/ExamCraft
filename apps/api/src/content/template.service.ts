import { Injectable, Inject, InternalServerErrorException, NotFoundException, BadRequestException } from "@nestjs/common";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ADMIN_CLIENT } from "../supabase/supabase.constants";
import type { AuthenticatedUser, TenantContext } from "../common/types/authenticated-request";
import { CreateTemplateDto } from "./dto/create-template.dto";
import { ReviewContentDto } from "./dto/review-content.dto";

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

type TemplateReviewStatus = "draft" | "published" | "archived";

@Injectable()
export class TemplateService {
  constructor(
    @Inject(SUPABASE_ADMIN_CLIENT)
    private readonly supabaseAdminClient: SupabaseClient
  ) {}

  async listTemplates(tenantContext: TenantContext) {
    const { data, error } = await this.supabaseAdminClient
      .from("institution_templates")
      .select("id, name, exam_type, duration_minutes, total_marks, sections, department_id, course_id, subject_id, status, metadata, created_at")
      .eq("institution_id", tenantContext.institutionId)
      .order("created_at", { ascending: false })
      .returns<TemplateRow[]>();

    if (error || !data) {
      throw new InternalServerErrorException("Unable to load institution templates.");
    }

    return data.map((template) => ({
      id: template.id,
      name: template.name,
      status: template.status,
      createdAt: template.created_at
      // ... mapping logic
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
        department_id: payload.departmentId ?? null,
        course_id: payload.courseId ?? null,
        subject_id: payload.subjectId ?? null,
        status: "draft"
      })
      .select()
      .single<TemplateRow>();

    if (error || !data) {
      throw new InternalServerErrorException("Unable to create institution template.");
    }

    return data;
  }

  // More template methods...
}
