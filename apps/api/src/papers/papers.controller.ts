import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Patch,
  Param,
  Query,
  Req,
  Res,
  UseGuards,
  BadRequestException,
} from "@nestjs/common";
import { Response } from "express";
import { SupabaseAuthGuard } from "../auth/guards/supabase-auth.guard";
import { InstitutionContextGuard } from "../institution/guards/institution-context.guard";
import { PapersService } from "./papers.service";
import { PaperExportService } from "./paper-export.service";
import { GeneratePaperDto } from "./dto/generate-paper.dto";
import { SwapQuestionDto } from "./dto/swap-question.dto";
import { AuthenticatedRequest } from "../common/types/authenticated-request";

@Controller({ path: "papers", version: "1" })
@UseGuards(SupabaseAuthGuard, InstitutionContextGuard)
export class PapersController {
  constructor(
    private readonly papersService: PapersService,
    private readonly paperExportService: PaperExportService,
  ) {}

  @Get()
  async list(@Req() req: AuthenticatedRequest) {
    if (!req.institutionContext) throw new BadRequestException("Institution context required");
    return this.papersService.listPapers(req.institutionContext);
  }

  @Post("generate")
  async generate(
    @Req() req: AuthenticatedRequest,
    @Body() payload: GeneratePaperDto,
  ) {
    if (!req.institutionContext || !req.currentUser)
      throw new BadRequestException("Auth context required");
    return this.papersService.generatePaper(
      req.institutionContext,
      req.currentUser,
      payload,
    );
  }

  @Get(":id")
  async get(@Req() req: AuthenticatedRequest, @Param("id") id: string) {
    if (!req.institutionContext) throw new BadRequestException("Institution context required");
    return this.papersService.getPaper(req.institutionContext, id);
  }

  @Post(":id/submit")
  async submit(@Req() req: AuthenticatedRequest, @Param("id") id: string) {
    if (!req.institutionContext || !req.currentUser)
      throw new BadRequestException("Auth context required");
    return this.papersService.submitPaper(req.institutionContext, req.currentUser, id);
  }

  @Post(":id/publish")
  async publish(@Req() req: AuthenticatedRequest, @Param("id") id: string) {
    if (!req.institutionContext || !req.currentUser)
      throw new BadRequestException("Auth context required");
    return this.papersService.publishPaper(req.institutionContext, req.currentUser, id);
  }

  @Get(":id/export")
  async exportPaper(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string,
    @Query("format") format: string,
    @Res() res: Response,
  ) {
    if (!req.institutionContext) throw new BadRequestException("Institution context required");
    const fmt = (format || "pdf").toLowerCase();
    if (fmt === "docx") {
      return this.paperExportService.generateDocx(id, req.institutionContext.institutionId, res);
    }
    return this.paperExportService.generatePdf(id, req.institutionContext.institutionId, res);
  }

  @Delete(":id")
  async delete(@Req() req: AuthenticatedRequest, @Param("id") id: string) {
    if (!req.institutionContext) throw new BadRequestException("Institution context required");
    return this.papersService.deletePaper(req.institutionContext, id);
  }

  @Patch(":id/questions/swap")
  async swapQuestion(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() payload: SwapQuestionDto,
  ) {
    if (!req.institutionContext) throw new BadRequestException("Institution context required");
    return this.papersService.swapQuestion(
      req.institutionContext,
      id,
      payload.sectionTitle,
      payload.oldQuestionId,
      payload.newQuestionId,
    );
  }
}
