import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { TenantModule } from "../tenant/tenant.module";
import { SupabaseModule } from "../supabase/supabase.module";
import { ContentController } from "./content.controller";
import { ContentService } from "./content.service";
import { PaperExportService } from "./paper-export.service";

@Module({
  imports: [SupabaseModule, TenantModule, AuthModule],
  controllers: [ContentController],
  providers: [ContentService, PaperExportService]
})
export class ContentModule {}
