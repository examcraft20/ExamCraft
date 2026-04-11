import {
  Controller,
  Post,
  Body,
  Param,
  Req,
  UseGuards,
  BadRequestException,
} from "@nestjs/common";
import { SupabaseAuthGuard } from "../auth/guards/supabase-auth.guard";
import { InstitutionContextGuard } from "../institution/guards/institution-context.guard";
import { ApprovalsService } from "./approvals.service";
import { ReviewContentDto } from "./dto/review-content.dto";
import { AuthenticatedRequest } from "../common/types/authenticated-request";

@Controller({ path: "approvals", version: "1" })
@UseGuards(SupabaseAuthGuard, InstitutionContextGuard)
export class ApprovalsController {
  constructor(private readonly approvalsService: ApprovalsService) {}

  @Post("questions/:id/review")
  async reviewQuestion(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() payload: ReviewContentDto,
  ) {
    if (!req.institutionContext || !req.currentUser)
      throw new BadRequestException("Auth context required");
    return this.approvalsService.reviewQuestion(
      req.institutionContext,
      req.currentUser,
      id,
      payload,
    );
  }

  @Post("templates/:id/review")
  async reviewTemplate(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() payload: ReviewContentDto,
  ) {
    if (!req.institutionContext || !req.currentUser)
      throw new BadRequestException("Auth context required");
    return this.approvalsService.reviewTemplate(
      req.institutionContext,
      req.currentUser,
      id,
      payload,
    );
  }

  @Post("papers/:id/review")
  async reviewPaper(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() payload: ReviewContentDto,
  ) {
    if (!req.institutionContext || !req.currentUser)
      throw new BadRequestException("Auth context required");
    return this.approvalsService.reviewPaper(
      req.institutionContext,
      req.currentUser,
      id,
      payload,
    );
  }
}
