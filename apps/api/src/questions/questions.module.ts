import { Module } from "@nestjs/common";
import { QuestionsController } from "./questions.controller";
import { QuestionsService } from "./questions.service";
import { SupabaseModule } from "../supabase/supabase.module";
import { InstitutionModule } from "../institution/institution.module";

@Module({
  imports: [SupabaseModule, InstitutionModule],
  controllers: [QuestionsController],
  providers: [QuestionsService],
  exports: [QuestionsService],
})
export class QuestionsModule {}
