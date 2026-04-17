import { Controller, Post, UploadedFile, UseInterceptors, UseGuards, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { SyllabusService } from "./syllabus.service";
import { SupabaseAuthGuard } from "../auth/guards/supabase-auth.guard";
import { InstitutionContextGuard } from "../institution/guards/institution-context.guard";
import { RequirePermissions } from "../auth/decorators/permissions.decorator";

@Controller({ path: "ai", version: "1" })
@UseGuards(SupabaseAuthGuard, InstitutionContextGuard)
export class AIController {
  constructor(
    private readonly syllabusService: SyllabusService,
  ) {}

  @Post("extract-syllabus")
  @UseInterceptors(FileInterceptor("file"))
  @RequirePermissions("ai.use")
  async extractSyllabus(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: /(pdf|text\/plain|application\/pdf)/ }),
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.syllabusService.extractTopics(file.buffer);
  }
}
