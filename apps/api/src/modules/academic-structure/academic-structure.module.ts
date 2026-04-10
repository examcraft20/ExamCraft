import { Module } from '@nestjs/common';
import { AcademicStructureController } from './academic-structure.controller';
import { AcademicStructureService } from './academic-structure.service';

import { AuthModule } from '../../auth/auth.module';
import { SupabaseModule } from '../../supabase/supabase.module';
import { TenantModule } from '../../tenant/tenant.module';

@Module({
  imports: [SupabaseModule, AuthModule, TenantModule],
  controllers: [AcademicStructureController],
  providers: [AcademicStructureService],
  exports: [AcademicStructureService],
})
export class AcademicStructureModule {}
