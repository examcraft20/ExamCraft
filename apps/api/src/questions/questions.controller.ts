import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  BadRequestException,
} from "@nestjs/common";
import { ParseIntPipe, DefaultValuePipe } from "@nestjs/common";
import { SupabaseAuthGuard } from "../auth/guards/supabase-auth.guard";
import { InstitutionContextGuard } from "../institution/guards/institution-context.guard";
import { QuestionsService } from "./questions.service";
import { CreateQuestionDto } from "./dto/create-question.dto";
import { EditQuestionDto } from "./dto/edit-question.dto";
import { CreateBulkQuestionsDto } from "./dto/create-bulk-questions.dto";
import { AuthenticatedRequest } from "../common/types/authenticated-request";

@Controller({ path: "questions", version: "1" })
@UseGuards(SupabaseAuthGuard, InstitutionContextGuard)
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Get()
  async list(
    @Req() req: AuthenticatedRequest,
    @Query("limit", new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query("offset", new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Query("subjectId") subjectId?: string,
    @Query("subject") subject?: string,
    @Query("difficulty") difficulty?: string,
    @Query("bloomLevel") bloomLevel?: string,
    @Query("tags") tags?: string,
  ) {
    if (!req.institutionContext) throw new BadRequestException("Institution context required");

    // Resolve subject-level access for faculty
    const assignedSubjectIds = await this.questionsService.getAssignedSubjectIds(
      req.institutionContext,
    );

    return this.questionsService.listQuestions(
      req.institutionContext,
      limit,
      offset,
      {
        subjectId,
        subject,
        difficulty,
        bloomLevel,
        tags: tags ? tags.split(",") : undefined,
        assignedSubjectIds,
      },
    );
  }

  @Post()
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() payload: CreateQuestionDto,
  ) {
    if (!req.institutionContext || !req.currentUser)
      throw new BadRequestException("Auth context required");
    return this.questionsService.createQuestion(
      req.institutionContext,
      req.currentUser,
      payload,
    );
  }

  @Post("bulk")
  async createBulk(
    @Req() req: AuthenticatedRequest,
    @Body() payload: CreateBulkQuestionsDto,
  ) {
    if (!req.institutionContext || !req.currentUser)
      throw new BadRequestException("Auth context required");
    return this.questionsService.createBulkQuestions(
      req.institutionContext,
      req.currentUser,
      payload,
    );
  }

  @Get(":id")
  async get(@Req() req: AuthenticatedRequest, @Param("id") id: string) {
    if (!req.institutionContext) throw new BadRequestException("Institution context required");
    return this.questionsService.getQuestion(req.institutionContext, id);
  }

  @Get(":id/history")
  async getHistory(@Req() req: AuthenticatedRequest, @Param("id") id: string) {
    if (!req.institutionContext) throw new BadRequestException("Institution context required");
    return this.questionsService.getQuestionHistory(req.institutionContext, id);
  }

  @Put(":id")
  async edit(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() payload: EditQuestionDto,
  ) {
    if (!req.institutionContext || !req.currentUser)
      throw new BadRequestException("Auth context required");
    return this.questionsService.editQuestion(
      req.institutionContext,
      req.currentUser,
      id,
      payload,
    );
  }

  @Delete(":id")
  async archive(@Req() req: AuthenticatedRequest, @Param("id") id: string) {
    if (!req.institutionContext || !req.currentUser)
      throw new BadRequestException("Auth context required");
    return this.questionsService.archiveQuestion(
      req.institutionContext,
      req.currentUser,
      id,
    );
  }

  @Get("duplicates/flagged")
  async listDuplicates(@Req() req: AuthenticatedRequest) {
    if (!req.institutionContext) throw new BadRequestException("Institution context required");
    return this.questionsService.listDuplicates(req.institutionContext);
  }

  @Patch("duplicates/:id/resolve")
  async resolveDuplicate(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string,
    @Body("action") action: "ignore" | "merge",
  ) {
    if (!req.institutionContext || !req.currentUser)
      throw new BadRequestException("Auth context required");
    if (!action || !["ignore", "merge"].includes(action)) {
      throw new BadRequestException("Invalid action. Must be 'ignore' or 'merge'.");
    }
    return this.questionsService.resolveDuplicate(
      req.institutionContext,
      req.currentUser,
      id,
      action,
    );
  }
}
