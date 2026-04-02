import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  Patch,
  Post
} from "@nestjs/common";
import { RequirePermissions } from "../auth/decorators/permissions.decorator";
import { RequireRoles } from "../auth/decorators/roles.decorator";
import { CurrentTenant } from "../common/decorators/tenant-context.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import type { AuthenticatedUser, TenantContext } from "../common/types/authenticated-request";
import { UseTenantAuthorization } from "../tenant/guards/tenant-context.guard";
import { ContentService } from "./content.service";
import { CreateQuestionDto } from "./dto/create-question.dto";
import { CreateTemplateDto } from "./dto/create-template.dto";
import { ReviewContentDto } from "./dto/review-content.dto";

@Controller("content")
@UseTenantAuthorization()
@RequireRoles("faculty", "academic_head", "institution_admin", "reviewer_approver")
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get("questions")
  @RequirePermissions("questions.create")
  listQuestions(@CurrentTenant() tenantContext: TenantContext | undefined) {
    if (!tenantContext) {
      throw new InternalServerErrorException("Missing tenant context.");
    }

    return this.contentService.listQuestions(tenantContext);
  }

  @Post("questions")
  @RequirePermissions("questions.create")
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

  @Get("templates")
  @RequirePermissions("templates.create")
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
}
