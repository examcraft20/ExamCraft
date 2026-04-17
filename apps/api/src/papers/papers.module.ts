import { Module } from "@nestjs/common";
import { PapersController } from "./papers.controller";
import { PapersService } from "./papers.service";
import { SupabaseModule } from "../supabase/supabase.module";
import { InstitutionModule } from "../institution/institution.module";
import { TemplatesModule } from "../templates/templates.module";
import { MailerModule } from "../mailer/mailer.module";
import { PaperExportService } from "./paper-export.service";

@Module({
  imports: [SupabaseModule, InstitutionModule, TemplatesModule, MailerModule],
  controllers: [PapersController],
  providers: [PapersService, PaperExportService],
  exports: [PapersService, PaperExportService],
})
export class PapersModule {}
