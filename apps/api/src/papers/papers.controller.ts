import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  UseGuards,
  BadRequestException,
} from "@nestjs/common";
import { SupabaseAuthGuard } from "../auth/guards/supabase-auth.guard";
import { InstitutionContextGuard } from "../institution/guards/institution-context.guard";
import { PapersService } from "./papers.service";
import { GeneratePaperDto } from "./dto/generate-paper.dto";
import { AuthenticatedRequest } from "../common/types/authenticated-request";

@Controller({ path: "papers", version: "1" })
@UseGuards(SupabaseAuthGuard, InstitutionContextGuard)
export class PapersController {
  constructor(private readonly papersService: PapersService) {}

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
}
