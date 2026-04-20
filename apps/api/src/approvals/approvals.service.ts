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
import { ReviewContentDto } from "./dto/review-content.dto";
import { MailerService } from "../mailer/mailer.service";
import { QuestionsService } from "../questions/questions.service";
import { TemplatesService } from "../templates/templates.service";
import { buildNextMetadata } from "../common/utils/review.utils";

@Injectable()
export class ApprovalsService {
  private readonly logger = new Logger(ApprovalsService.name);

  constructor(
    @Inject(SUPABASE_ADMIN_CLIENT)
    private readonly supabaseAdminClient: SupabaseClient,
    private readonly mailerService: MailerService,
    private readonly questionsService: QuestionsService,
    private readonly templatesService: TemplatesService,
  ) {}

  async getPendingApprovals(
    context: InstitutionContext,
    limit: number = 50,
    offset: number = 0,
  ) {
    const institutionId = context.institutionId;

    const [questions, templates, papers] = await Promise.all([
      this.supabaseAdminClient
        .from("institution_questions")
        .select("id, title, created_at, status")
        .eq("institution_id", institutionId)
        .in("status", ["submitted", "in_review"])
        .order("created_at", { ascending: false })
        .range(offset, offset + (limit / 3) - 1),
      this.supabaseAdminClient
        .from("institution_templates")
        .select("id, name, created_at, status")
        .eq("institution_id", institutionId)
        .in("status", ["submitted", "in_review"])
        .order("created_at", { ascending: false })
        .range(offset, offset + (limit / 3) - 1),
      this.supabaseAdminClient
        .from("institution_papers")
        .select("id, title, created_at, status")
        .eq("institution_id", institutionId)
        .in("status", ["submitted", "in_review"])
        .order("created_at", { ascending: false })
        .range(offset, offset + (limit / 3) - 1)
    ]);

    return {
      questions: questions.data || [],
      templates: templates.data || [],
      papers: papers.data || []
    };
  }

  async reviewQuestion(
    context: InstitutionContext,
    user: AuthenticatedUser,
    id: string,
    payload: ReviewContentDto,
  ) {
    this.assertReviewPermission(context, payload.action, "question");
    const existing = await this.questionsService.loadQuestionForInstitution(id, context.institutionId);
    
    const nextMetadata = buildNextMetadata(existing.metadata, user, payload);
    const nextStatus = this.resolveStatus(existing.status, payload.action, "question");

    const { data, error } = await this.supabaseAdminClient
      .from("institution_questions")
      .update({ status: nextStatus, metadata: nextMetadata })
      .eq("id", id)
      .select().single();

    if (error) throw new InternalServerErrorException("Review failed");
    return data;
  }

  async reviewTemplate(
    context: InstitutionContext,
    user: AuthenticatedUser,
    id: string,
    payload: ReviewContentDto,
  ) {
    this.assertReviewPermission(context, payload.action, "template");
    const existing = await this.templatesService.loadTemplateForInstitution(id, context.institutionId);

    const nextMetadata = buildNextMetadata(existing.metadata, user, payload);
    const nextStatus = this.resolveStatus(existing.status, payload.action, "template");

    const { data, error } = await this.supabaseAdminClient
      .from("institution_templates")
      .update({ status: nextStatus, metadata: nextMetadata })
      .eq("id", id)
      .select().single();

    if (error) throw new InternalServerErrorException("Review failed");
    return data;
  }

  async reviewPaper(
    context: InstitutionContext,
    user: AuthenticatedUser,
    id: string,
    payload: ReviewContentDto,
  ) {
    this.assertReviewPermission(context, payload.action, "paper");
    const { data: existing, error: loadError } = await this.supabaseAdminClient
      .from("institution_papers")
      .select("*")
      .eq("id", id)
      .eq("institution_id", context.institutionId)
      .single();

    if (loadError || !existing) throw new NotFoundException("Paper not found");

    const nextMetadata = buildNextMetadata(existing.metadata, user, payload);
    const nextStatus = this.resolveStatus(existing.status, payload.action, "paper");

    const { data, error } = await this.supabaseAdminClient
      .from("institution_papers")
      .update({
        status: nextStatus,
        metadata: nextMetadata,
        reviewed_at: new Date().toISOString(),
        approved_at: payload.action === "approve" ? new Date().toISOString() : null,
      })
      .eq("id", id)
      .select().single();

    if (error) throw new InternalServerErrorException("Review failed");

    // Notification logic
    if (payload.action === "approve" || payload.action === "reject") {
        this.notifyAuthor(existing.created_by_user_id, existing.title, payload.action, payload.comment);
    }

    return data;
  }

  private resolveStatus(current: string, action: string, type: "question" | "template" | "paper") {
    if (action === "approve") {
        if (type === "template") return "published";
        if (type === "question") return "ready";
        return "approved";
    }
    if (action === "reject") return type === "paper" ? "rejected" : "draft";
    if (action === "archive") return "archived";
    if (action === "comment" && type === "paper" && current === "submitted") return "in_review";
    return current;
  }

  private assertReviewPermission(context: InstitutionContext, action: string, type: "question" | "template" | "paper") {
    let requiredPerm = "";
    if (action === "approve") {
      requiredPerm = `${type}s.approve`;
    } else if (action === "reject") {
      requiredPerm = `${type}s.reject`;
    } else {
      requiredPerm = `${type}s.review`; // for 'comment' or other non-terminal actions
    }

    if (!context.permissionCodes.includes(requiredPerm)) {
        throw new BadRequestException(`Permission denied: You do not have the "${requiredPerm}" permission.`);
    }
  }

  private async notifyAuthor(userId: string, title: string, action: string, comment?: string) {
      const { data: user } = await this.supabaseAdminClient.from("users").select("email").eq("id", userId).single();
      if (user?.email) {
          this.mailerService.sendPaperReviewed(user.email, title, action === "approve" ? "approved" : "rejected", comment || "")
            .catch(e => this.logger.error("Author notification failed", e));
      }
  }
}
