import { Module } from "@nestjs/common";
import { ApprovalsController } from "./approvals.controller";
import { ApprovalsService } from "./approvals.service";
import { SupabaseModule } from "../supabase/supabase.module";
import { InstitutionModule } from "../institution/institution.module";
import { QuestionsModule } from "../questions/questions.module";
import { TemplatesModule } from "../templates/templates.module";
import { MailerModule } from "../mailer/mailer.module";

@Module({
  imports: [
    SupabaseModule,
    InstitutionModule,
    QuestionsModule,
    TemplatesModule,
    MailerModule,
  ],
  controllers: [ApprovalsController],
  providers: [ApprovalsService],
  exports: [ApprovalsService],
})
export class ApprovalsModule {}
