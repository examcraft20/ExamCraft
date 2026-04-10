import {
  BadRequestException,
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  Patch,
  Post,
  Delete,
  Res
} from "@nestjs/common";
import { Response } from "express";
import { RequirePermissions } from "../auth/decorators/permissions.decorator";
import { RequireRoles } from "../auth/decorators/roles.decorator";
import { CurrentTenant } from "../common/decorators/tenant-context.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import type { AuthenticatedUser, TenantContext } from "../common/types/authenticated-request";
import { UseTenantAuthorization } from "../tenant/guards/tenant-context.guard";
import { ContentService } from "./content.service";
import { PaperExportService } from "./paper-export.service";
import { CreateQuestionDto } from "./dto/create-question.dto";
import { EditQuestionDto } from "./dto/edit-question.dto";
import { CreateBulkQuestionsDto } from "./dto/create-bulk-questions.dto";
import { CreateTemplateDto } from "./dto/create-template.dto";
import { ReviewContentDto } from "./dto/review-content.dto";
import { GeneratePaperDto } from "./dto/generate-paper.dto";
import { AuditLog } from "../common/decorators/audit-log.decorator";
import { AuditAction } from "../audit-logs/audit-action.enum";

@Controller({ path: "content", version: "1" })
@UseTenantAuthorization()
@RequireRoles("faculty", "academic_head", "institution_admin", "reviewer_approver")
export class ContentController {
  constructor(
    private readonly contentService: ContentService,
    private readonly paperExportService: PaperExportService
  ) {}

  @Get("questions")
  @RequirePermissions("questions.read")
  listQuestions(@CurrentTenant() tenantContext: TenantContext | undefined) {
    if (!tenantContext) {
      throw new InternalServerErrorException("Missing tenant context.");
    }

    return this.contentService.listQuestions(tenantContext);
  }

  @Post("questions")
  @RequirePermissions("questions.create")
  @AuditLog(AuditAction.QUESTION_CREATED, 'institution_questions', (result: any) => result.id)
  createQuestion(
    @CurrentTenant() tenantContext: TenantContext | undefined,
    @CurrentUser() currentUser: AuthenticatedUser | undefined,
    @Body() body: CreateQuestionDto
  ) {
    if (!tenantContext || !currentUser) {
      throw new InternalServerErrorException("Missing tenant or user context.");
    }

    return this.contentService.createQuestion(tenantContext, currentUser, body);
  }

  @Get("questions/:questionId")
  @RequirePermissions("questions.read")
  getQuestion(
    @CurrentTenant() tenantContext: TenantContext | undefined,
    @Param("questionId") questionId: string
  ) {
    if (!tenantContext) {
      throw new InternalServerErrorException("Missing tenant context.");
    }

    return this.contentService.getQuestion(tenantContext, questionId);
  }

  @Patch("questions/:questionId")
  @RequirePermissions("questions.write")
  @AuditLog(AuditAction.QUESTION_UPDATED, 'institution_questions', (result: any) => result.id)
  editQuestion(
    @CurrentTenant() tenantContext: TenantContext | undefined,
    @CurrentUser() currentUser: AuthenticatedUser | undefined,
    @Param("questionId") questionId: string,
    @Body() body: EditQuestionDto
  ) {
    if (!tenantContext || !currentUser) {
      throw new InternalServerErrorException("Missing tenant or user context.");
    }

    return this.contentService.editQuestion(tenantContext, currentUser, questionId, body);
  }

  @Delete("questions/:questionId")
  @RequirePermissions("questions.write")
  @AuditLog(AuditAction.QUESTION_DELETED, 'institution_questions', (result, [tc, u, qId]: any[]) => qId)
  archiveQuestion(
    @CurrentTenant() tenantContext: TenantContext | undefined,
    @CurrentUser() currentUser: AuthenticatedUser | undefined,
    @Param("questionId") questionId: string
  ) {
    if (!tenantContext || !currentUser) {
      throw new InternalServerErrorException("Missing tenant or user context.");
    }

    return this.contentService.archiveQuestion(tenantContext, currentUser, questionId);
  }

  @Post("questions/bulk")
  @RequirePermissions("questions.create")
  createBulkQuestions(
    @CurrentTenant() tenantContext: TenantContext | undefined,
    @CurrentUser() currentUser: AuthenticatedUser | undefined,
    @Body() body: CreateBulkQuestionsDto
  ) {
    if (!tenantContext || !currentUser) {
      throw new InternalServerErrorException("Missing tenant or user context.");
    }

    return this.contentService.createBulkQuestions(tenantContext, currentUser, body);
  }

  @Get("templates")
  @RequirePermissions("templates.read")
  listTemplates(@CurrentTenant() tenantContext: TenantContext | undefined) {
    if (!tenantContext) {
      throw new InternalServerErrorException("Missing tenant context.");
    }

    return this.contentService.listTemplates(tenantContext);
  }

  @Post("templates")
  @RequirePermissions("templates.create")
  createTemplate(
    @CurrentTenant() tenantContext: TenantContext | undefined,
    @CurrentUser() currentUser: AuthenticatedUser | undefined,
    @Body() body: CreateTemplateDto
  ) {
    if (!tenantContext || !currentUser) {
      throw new InternalServerErrorException("Missing tenant or user context.");
    }

    return this.contentService.createTemplate(tenantContext, currentUser, body);
  }

  @Patch("questions/:questionId/review")
  @RequirePermissions("papers.review")
  @AuditLog(AuditAction.QUESTION_APPROVED, 'institution_questions', (result: any) => result.id)
  reviewQuestion(
    @CurrentTenant() tenantContext: TenantContext | undefined,
    @CurrentUser() currentUser: AuthenticatedUser | undefined,
    @Param("questionId") questionId: string,
    @Body() body: ReviewContentDto
  ) {
    if (!tenantContext || !currentUser) {
      throw new InternalServerErrorException("Missing tenant or user context.");
    }

    return this.contentService.reviewQuestion(tenantContext, currentUser, questionId, body);
  }

  @Patch("templates/:templateId/review")
  @RequirePermissions("papers.review")
  reviewTemplate(
    @CurrentTenant() tenantContext: TenantContext | undefined,
    @CurrentUser() currentUser: AuthenticatedUser | undefined,
    @Param("templateId") templateId: string,
    @Body() body: ReviewContentDto
  ) {
    if (!tenantContext || !currentUser) {
      throw new InternalServerErrorException("Missing tenant or user context.");
    }

    return this.contentService.reviewTemplate(tenantContext, currentUser, templateId, body);
  }

  @Patch("papers/:paperId/submit")
  @RequirePermissions("papers.submit")
  submitPaper(
    @CurrentTenant() tenantContext: TenantContext | undefined,
    @CurrentUser() currentUser: AuthenticatedUser | undefined,
    @Param("paperId") paperId: string
  ) {
    if (!tenantContext || !currentUser) {
      throw new InternalServerErrorException("Missing tenant or user context.");
    }

    return this.contentService.submitPaper(tenantContext, currentUser, paperId);
  }

  @Patch("papers/:paperId/review")
  @RequirePermissions("papers.review")
  reviewPaper(
    @CurrentTenant() tenantContext: TenantContext | undefined,
    @CurrentUser() currentUser: AuthenticatedUser | undefined,
    @Param("paperId") paperId: string,
    @Body() body: ReviewContentDto
  ) {
    if (!tenantContext || !currentUser) {
      throw new InternalServerErrorException("Missing tenant or user context.");
    }

    return this.contentService.reviewPaper(tenantContext, currentUser, paperId, body);
  }

  @Get("papers")
  @RequirePermissions("papers.read")
  listPapers(@CurrentTenant() tenantContext: TenantContext | undefined) {
    if (!tenantContext) {
      throw new InternalServerErrorException("Missing tenant context.");
    }

    return this.contentService.listPapers(tenantContext);
  }

  @Get("papers/:paperId")
  @RequirePermissions("papers.read")
  getPaper(
    @CurrentTenant() tenantContext: TenantContext | undefined,
    @Param("paperId") paperId: string
  ) {
    if (!tenantContext) {
      throw new InternalServerErrorException("Missing tenant context.");
    }

    return this.contentService.getPaper(tenantContext, paperId);
  }

  @Get("papers/:paperId/pdf")
  @RequirePermissions("papers.read")
  async getPaperPdf(
    @CurrentTenant() tenantContext: TenantContext | undefined,
    @Param("paperId") paperId: string,
    @Res() res: Response
  ) {
    if (!tenantContext) {
      throw new InternalServerErrorException("Missing tenant context.");
    }

    return this.paperExportService.generatePdf(paperId, tenantContext.institutionId, res);
  }

  @Get("papers/:paperId/docx")
  @RequirePermissions("papers.read")
  async getPaperDocx(
    @CurrentTenant() tenantContext: TenantContext | undefined,
    @Param("paperId") paperId: string,
    @Res() res: Response
  ) {
    if (!tenantContext) {
      throw new InternalServerErrorException("Missing tenant context.");
    }

    return this.paperExportService.generateDocx(paperId, tenantContext.institutionId, res);
  }

  @Post("papers/generate")
  @RequirePermissions("papers.generate")
  generatePaper(
    @CurrentTenant() tenantContext: TenantContext | undefined,
    @CurrentUser() currentUser: AuthenticatedUser | undefined,
    @Body() body: GeneratePaperDto
  ) {
    if (!tenantContext || !currentUser) {
      throw new InternalServerErrorException("Missing tenant or user context.");
    }

    return this.contentService.generatePaper(tenantContext, currentUser, body);
  }

  @Post("ai/generate-questions")
  @RequirePermissions("questions.write")
  async generateQuestionsFromSyllabus(
    @CurrentTenant() tenantContext: TenantContext | undefined,
    @CurrentUser() currentUser: AuthenticatedUser | undefined,
    @Body() body: any // using any here for quick schema skip, ideally use AnalyzeSyllabusDto
  ) {
    if (!tenantContext || !currentUser) {
      throw new InternalServerErrorException("Missing tenant or user context.");
    }
    return this.contentService.analyzeSyllabusAndGenerate(tenantContext, currentUser, body.text, body.subject, body.count);
  }
}
