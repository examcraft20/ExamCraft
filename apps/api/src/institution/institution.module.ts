import { Global, Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { SupabaseModule } from "../supabase/supabase.module";
import { InstitutionController } from "./institution.controller";
import { InstitutionContextGuard } from "./guards/institution-context.guard";
import { InstitutionContextService } from "./institution-context.service";

@Global()
@Module({
  imports: [SupabaseModule, AuthModule],
  controllers: [InstitutionController],
  providers: [InstitutionContextService, InstitutionContextGuard],
  exports: [InstitutionContextService, InstitutionContextGuard]
})
export class InstitutionModule {}
