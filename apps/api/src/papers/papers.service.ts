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

    this.notifyReviewers(institutionContext, data.title, currentUser.email).catch(e =>
      this.logger.warn("notifyReviewers failed silently", e)
    );

    return data;
  }

  async publishPaper(
    institutionContext: InstitutionContext,
    currentUser: AuthenticatedUser,
    paperId: string,
  ) {
    const paper = await this.getPaper(institutionContext, paperId);
    if (paper.status !== "approved") {
      throw new BadRequestException(
        "Only approved papers can be published. Current status: " + paper.status,
      );
    }

    const { data, error } = await this.supabaseAdminClient
      .from("institution_papers")
      .update({
        status: "published",
        published_at: new Date().toISOString(),
      })
      .eq("id", paperId)
      .eq("institution_id", institutionContext.institutionId)
      .select()
      .single();

    if (error || !data) {
      throw new InternalServerErrorException("Unable to publish paper.");
    }

    return data;
  }

  async deletePaper(institutionContext: InstitutionContext, paperId: string) {
    const paper = await this.getPaper(institutionContext, paperId);
    if (paper.status !== "draft") {
      throw new BadRequestException("Only draft papers can be deleted.");
    }

    const { error } = await this.supabaseAdminClient
      .from("institution_papers")
      .delete()
      .eq("id", paperId)
      .eq("institution_id", institutionContext.institutionId);

    if (error) {
      throw new InternalServerErrorException("Failed to delete paper.");
    }
  }

  async swapQuestion(
    institutionContext: InstitutionContext,
    paperId: string,
    sectionTitle: string,
    oldQuestionId: string,
    newQuestionId: string,
  ) {
    const paper = await this.getPaper(institutionContext, paperId);
    if (paper.status !== "draft" && paper.status !== "rejected") {
      throw new BadRequestException("Cannot edit non-draft papers.");
    }

    // Load new question details
    const { data: newQuestion, error: qError } = await this.supabaseAdminClient
      .from("institution_questions")
      .select("id, title, difficulty, bloom_level, metadata")
      .eq("id", newQuestionId)
      .eq("institution_id", institutionContext.institutionId)
      .single();

    if (qError || !newQuestion) {
      throw new NotFoundException("New question not found in institution bank.");
    }

    const sections = (paper.metadata as any)?.sections || [];
    let found = false;

    const updatedSections = sections.map((s: any) => {
      if (s.title === sectionTitle) {
        if (s.isOrGroup) {
          if (s.choiceA?.questions?.some((q: any) => q.id === oldQuestionId)) {
            s.choiceA.questions = s.choiceA.questions.map((q: any) =>
              q.id === oldQuestionId ? { id: newQuestion.id, title: newQuestion.title, difficulty: newQuestion.difficulty, bloomLevel: newQuestion.bloom_level, metadata: newQuestion.metadata } : q
            );
            found = true;
          } else if (s.choiceB?.questions?.some((q: any) => q.id === oldQuestionId)) {
            s.choiceB.questions = s.choiceB.questions.map((q: any) =>
              q.id === oldQuestionId ? { id: newQuestion.id, title: newQuestion.title, difficulty: newQuestion.difficulty, bloomLevel: newQuestion.bloom_level, metadata: newQuestion.metadata } : q
            );
            found = true;
          }
        } else if (s.questions?.some((q: any) => q.id === oldQuestionId)) {
          s.questions = s.questions.map((q: any) =>
            q.id === oldQuestionId ? { id: newQuestion.id, title: newQuestion.title, difficulty: newQuestion.difficulty, bloomLevel: newQuestion.bloom_level, metadata: newQuestion.metadata } : q
          );
          found = true;
        }
      }
      return s;
    });

    if (!found) {
      throw new BadRequestException("Question not found in the specified section.");
    }

    const { data, error } = await this.supabaseAdminClient
      .from("institution_papers")
      .update({
        metadata: {
          ...((paper.metadata as any) || {}),
          sections: updatedSections,
        },
      })
      .eq("id", paperId)
      .select()
      .single();

    if (error) {
      throw new InternalServerErrorException("Failed to swap question.");
    }

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
