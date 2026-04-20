import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
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

  @Put(":id")
  async update(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() payload: CreateTemplateDto,
  ) {
    if (!req.institutionContext || !req.currentUser)
      throw new BadRequestException("Auth context required");
    return this.templatesService.updateTemplate(
      req.institutionContext,
      id,
      payload,
    );
  }

  @Delete(":id")
  async delete(@Req() req: AuthenticatedRequest, @Param("id") id: string) {
    if (!req.institutionContext) throw new BadRequestException("Institution context required");
    return this.templatesService.deleteTemplate(req.institutionContext, id);
  }
}
