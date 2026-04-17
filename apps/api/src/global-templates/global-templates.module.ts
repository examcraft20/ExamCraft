import { Module } from "@nestjs/common";
import { SupabaseModule } from "../supabase/supabase.module";
import { GlobalTemplatesController } from "./global-templates.controller";
import { GlobalTemplatesService } from "./global-templates.service";

@Module({
  imports: [SupabaseModule],
  controllers: [GlobalTemplatesController],
  providers: [GlobalTemplatesService]
})
export class GlobalTemplatesModule {}
