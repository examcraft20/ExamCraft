import { Module } from "@nestjs/common";
import { TemplatesController } from "./templates.controller";
import { TemplatesService } from "./templates.service";
import { SupabaseModule } from "../supabase/supabase.module";
import { InstitutionModule } from "../institution/institution.module";

@Module({
  imports: [SupabaseModule, InstitutionModule],
  controllers: [TemplatesController],
  providers: [TemplatesService],
  exports: [TemplatesService],
})
export class TemplatesModule {}
