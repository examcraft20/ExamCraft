import { Controller, Post, Body, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { SyllabusService } from "./syllabus.service";
import { SuggestionsService } from "./suggestions.service";

@Controller({ path: "ai", version: "1" })
export class AIController {
  constructor(
    private readonly syllabusService: SyllabusService,
    private readonly suggestionsService: SuggestionsService,
  ) {}

  @Post("extract-syllabus")
  @UseInterceptors(FileInterceptor("file"))
  async extractSyllabus(@UploadedFile() file: any) {
    if (!file || !file.buffer) {
      return { error: "No file uploaded" };
    }
    return this.syllabusService.extractTopics(file.buffer);
  }

  @Post("check-duplicates")
  async checkDuplicates(@Body("content") content: string) {
    return this.suggestionsService.detectDuplicates(content);
  }

  @Post("rebalance-difficulty")
  async rebalanceDifficulty(@Body("questions") questions: any[]) {
    return this.suggestionsService.rebalanceDifficulty(questions);
  }
}
