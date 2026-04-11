import { Module } from "@nestjs/common";
import { AdminController } from "./admin.controller";
import { FlagsService } from "./flags.service";
import { AdminAuditService } from "./audit.service";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [AuthModule],
  controllers: [AdminController],
  providers: [FlagsService, AdminAuditService],
  exports: [FlagsService, AdminAuditService],
})
export class AdminModule {}
