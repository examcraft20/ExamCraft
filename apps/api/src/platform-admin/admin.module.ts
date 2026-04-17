import { Module } from "@nestjs/common";
import { AdminController } from "./admin.controller";
import { AdminAuditService } from "./audit.service";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [AuthModule],
  controllers: [AdminController],
  providers: [AdminAuditService],
  exports: [AdminAuditService],
})
export class AdminModule {}
