import { Module } from "@nestjs/common";
import { AIController } from "./ai.controller";
import { SyllabusService } from "./syllabus.service";
import { SuggestionsService } from "./suggestions.service";

@Module({
  controllers: [AIController],
  providers: [SyllabusService, SuggestionsService],
  exports: [SyllabusService, SuggestionsService],
})
export class AIModule {}
