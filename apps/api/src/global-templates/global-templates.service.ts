import { Injectable, Inject, InternalServerErrorException, NotFoundException, BadRequestException } from "@nestjs/common";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ADMIN_CLIENT } from "../supabase/supabase.constants";

@Injectable()
export class GlobalTemplatesService {
  constructor(
    @Inject(SUPABASE_ADMIN_CLIENT)
    private readonly supabaseAdminClient: SupabaseClient
  ) {}

  async listGlobalTemplates() {
    const { data, error } = await this.supabaseAdminClient
      .from("global_templates")
      .select("*")
      .eq("is_verified", true)
      .order("created_at", { ascending: false });

    if (error) {
      throw new InternalServerErrorException("Failed to load global templates.");
    }
    return data;
  }

  async cloneTemplate(institutionId: string, userId: string, globalTemplateId: string) {
    // 1. Fetch the global template
    const { data: globalTemplate, error: fetchError } = await this.supabaseAdminClient
      .from("global_templates")
      .select("*")
      .eq("id", globalTemplateId)
      .single();

    if (fetchError || !globalTemplate) {
      throw new NotFoundException("Global template not found.");
    }

    // 2. Insert into institution_templates
    const { data: newTemplate, error: insertError } = await this.supabaseAdminClient
      .from("institution_templates")
      .insert({
        institution_id: institutionId,
        created_by_user_id: userId,
        name: `[Cloned] ${globalTemplate.name}`,
        exam_type: globalTemplate.exam_type,
        duration_minutes: globalTemplate.duration_minutes,
        total_marks: globalTemplate.total_marks,
        status: "draft",
        metadata: {
          cloned_from: globalTemplateId,
          original_name: globalTemplate.name
        }
      })
      .select("id")
      .single();

    if (insertError || !newTemplate) {
      throw new InternalServerErrorException("Failed to clone global template.");
    }

    // 3. Clone sections
    const sections = globalTemplate.sections || [];
    if (sections.length > 0) {
      const sectionInserts = sections.map((s: any, idx: number) => ({
        template_id: newTemplate.id,
        title: s.title || `Section ${idx + 1}`,
        description: s.description || null,
        question_count: s.question_count || 10,
        marks_per_question: s.marks_per_question || 1,
        section_order: idx,
        auto_select_rules: s.auto_select_rules || {}
      }));

      const { error: sectionError } = await this.supabaseAdminClient
        .from("institution_template_sections")
        .insert(sectionInserts);

      if (sectionError) {
        // Rollback template creation (manual cleanup)
        await this.supabaseAdminClient.from("institution_templates").delete().eq("id", newTemplate.id);
        throw new InternalServerErrorException("Failed to clone template sections.");
      }
    }

    return { success: true, newTemplateId: newTemplate.id };
  }
}
