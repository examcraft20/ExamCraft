import { Module } from "@nestjs/common";
import { AIController } from "./ai.controller";
import { SyllabusService } from "./syllabus.service";

@Module({
  controllers: [AIController],
  providers: [SyllabusService],
  exports: [SyllabusService],
})
export class AIModule {}
