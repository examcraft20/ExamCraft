import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  UseGuards,
  BadRequestException,
} from "@nestjs/common";
import { SupabaseAuthGuard } from "../auth/guards/supabase-auth.guard";
import { InstitutionContextGuard } from "../institution/guards/institution-context.guard";
import { TemplatesService } from "./templates.service";
import { CreateTemplateDto } from "./dto/create-template.dto";
import { AuthenticatedRequest } from "../common/types/authenticated-request";

@Controller({ path: "templates", version: "1" })
@UseGuards(SupabaseAuthGuard, InstitutionContextGuard)
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Get()
  async list(@Req() req: AuthenticatedRequest) {
    if (!req.institutionContext) throw new BadRequestException("Institution context required");
    return this.templatesService.listTemplates(req.institutionContext);
  }

  @Post()
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() payload: CreateTemplateDto,
  ) {
    if (!req.institutionContext || !req.currentUser)
      throw new BadRequestException("Auth context required");
    return this.templatesService.createTemplate(
      req.institutionContext,
      req.currentUser,
      payload,
    );
  }
}
