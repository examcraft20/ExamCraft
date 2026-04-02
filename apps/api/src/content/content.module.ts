import { Module } from "@nestjs/common";
import { TenantModule } from "../tenant/tenant.module";
import { SupabaseModule } from "../supabase/supabase.module";
import { ContentController } from "./content.controller";
import { ContentService } from "./content.service";

@Module({
  imports: [SupabaseModule, TenantModule],
  controllers: [ContentController],
  providers: [ContentService]
})
export class ContentModule {}
