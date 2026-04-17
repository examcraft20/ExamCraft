import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Logger,
} from "@nestjs/common";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  AuthenticatedUser,
  InstitutionContext,
} from "../common/types/authenticated-request";
import { SUPABASE_ADMIN_CLIENT } from "../supabase/supabase.constants";
import { GeneratePaperDto } from "./dto/generate-paper.dto";
import { TemplatesService } from "../templates/templates.service";
import { MailerService } from "../mailer/mailer.service";

@Injectable()
export class PapersService {
  private readonly logger = new Logger(PapersService.name);

  constructor(
    @Inject(SUPABASE_ADMIN_CLIENT)
    private readonly supabaseAdminClient: SupabaseClient,
    private readonly templatesService: TemplatesService,
    private readonly mailerService: MailerService,
  ) {}

  async generatePaper(
    institutionContext: InstitutionContext,
    currentUser: AuthenticatedUser,
    payload: GeneratePaperDto,
  ) {
    const template = await this.templatesService.loadTemplateForInstitution(
      payload.templateId,
      institutionContext.institutionId,
    );

    const sections = Array.isArray(template.sections)
      ? (template.sections as Array<{
          title: string;
          isOrGroup?: boolean;
          questionCount?: number;
          marks: number;
          choiceA?: { label: string, questionCount: number };
          choiceB?: { label: string, questionCount: number };
          allowedDifficulty?: string[];
          allowedBloomLevels?: string[];
          allowedUnitNumbers?: number[];
        }>)
      : [];
    const paperSections = await Promise.all(
      sections.map(async (section) => {
        if (section.isOrGroup && section.choiceA && section.choiceB) {
          const [questionsA, questionsB] = await Promise.all([
            this.fetchRandomQuestions(institutionContext, template, {
              ...section,
              questionCount: section.choiceA.questionCount
            }),
            this.fetchRandomQuestions(institutionContext, template, {
              ...section,
              questionCount: section.choiceB.questionCount
            })
          ]);

          return {
            title: section.title,
            marks: section.marks,
            isOrGroup: true,
            choiceA: {
              label: section.choiceA.label,
              questions: questionsA
            },
            choiceB: {
              label: section.choiceB.label,
              questions: questionsB
            }
          };
        }

        const questions = await this.fetchRandomQuestions(institutionContext, template, {
          ...section,
          questionCount: section.questionCount || 0
        });

        return {
          title: section.title,
          marks: section.marks,
          questions
        };
      })
    );

    const { data: paper, error: paperError } = await this.supabaseAdminClient
      .from("institution_papers")
      .insert({
        institution_id: institutionContext.institutionId,
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

  private async fetchRandomQuestions(
    context: InstitutionContext,
    template: any,
    section: {
      title: string;
      questionCount: number;
      allowedDifficulty?: string[];
      allowedBloomLevels?: string[];
      allowedUnitNumbers?: number[];
    }
  ) {
    const { data: questions, error } = await this.supabaseAdminClient.rpc(
      "get_random_questions",
      {
        p_institution_id: context.institutionId,
        p_limit: section.questionCount,
        p_difficulties:
          section.allowedDifficulty && section.allowedDifficulty.length > 0
            ? section.allowedDifficulty
            : null,
        p_bloom_levels:
          section.allowedBloomLevels && section.allowedBloomLevels.length > 0
            ? section.allowedBloomLevels
            : null,
        p_unit_numbers:
          section.allowedUnitNumbers && section.allowedUnitNumbers.length > 0
            ? section.allowedUnitNumbers
            : null,
        p_department_id: template.department_id || null,
        p_course_id: template.course_id || null,
        p_subject_id: template.subject_id || null,
      },
    );

    if (error || !questions || questions.length < (section.questionCount || 0)) {
      throw new BadRequestException(
        `Insufficient approved questions for section "${section.title}". Found ${questions?.length || 0}, need ${section.questionCount}.`,
      );
    }

    return (questions as Array<{
      id: string;
      title: string;
      difficulty: string;
      bloom_level: string;
      metadata: any;
    }>).map((q) => ({
      id: q.id,
      title: q.title,
      difficulty: q.difficulty,
      bloomLevel: q.bloom_level,
      metadata: q.metadata,
    }));
  }

  async listPapers(
    institutionContext: InstitutionContext,
    limit: number = 50,
    offset: number = 0,
  ) {
    const { data, error } = await this.supabaseAdminClient
      .from("institution_papers")
      .select("id, title, status, created_at")
      .eq("institution_id", institutionContext.institutionId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error || !data) {
      throw new InternalServerErrorException("Unable to load papers.");
    }

    return data.map((d) => ({
      id: d.id,
      title: d.title,
      status: d.status,
      createdAt: d.created_at,
    }));
  }

  async getPaper(institutionContext: InstitutionContext, paperId: string) {
    const { data, error } = await this.supabaseAdminClient
      .from("institution_papers")
      .select("id, title, status, metadata, created_at")
      .eq("id", paperId)
      .eq("institution_id", institutionContext.institutionId)
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
    institutionContext: InstitutionContext,
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
      .eq("institution_id", institutionContext.institutionId)
      .select()
      .single();

    if (error || !data) {
      throw new InternalServerErrorException(
        "Unable to submit paper for review.",
      );
    }

    // Notification logic...
    this.notifyReviewers(institutionContext, data.title, currentUser.email);

    return data;
  }

  private async notifyReviewers(
    context: InstitutionContext,
    title: string,
    submitterEmail?: string,
  ) {
    try {
      const { data: role } = await this.supabaseAdminClient
        .from("roles")
        .select("id")
        .eq("code", "reviewer_approver")
        .single();
      if (role) {
        const { data: reviewers } = await this.supabaseAdminClient
          .from("institution_user_roles")
          .select("institution_users(users(email))")
          .eq("role_id", role.id)
          .eq("institution_id", context.institutionId);

        if (reviewers) {
          (reviewers as unknown as Array<{
            institution_users: { users: { email: string } | null } | null;
          }>).forEach((r) => {
            const email = r.institution_users?.users?.email;
            if (email) {
              this.mailerService
                .sendPaperSubmittedForReview(email, title, submitterEmail || "A faculty member")
                .catch(e => this.logger.error("Email notification failed", e));
            }
          });
        }
      }
    } catch (e) {
      this.logger.warn("Reviewer notification failed", e);
    }
  }
}
