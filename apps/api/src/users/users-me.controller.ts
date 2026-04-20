import {
  Controller,
  Delete,
  InternalServerErrorException,
  UseGuards,
  Req,
} from "@nestjs/common";
import { SupabaseAuthGuard } from "../auth/guards/supabase-auth.guard";
import { UsersService } from "./users.service";
import type { AuthenticatedRequest } from "../common/types/authenticated-request";
import { AuditLog } from "../common/decorators/audit-log.decorator";
import { AuditAction } from "../audit-logs/audit-action.enum";

@Controller({ path: "users/me", version: "1" })
@UseGuards(SupabaseAuthGuard)
export class UsersMeController {
  constructor(private readonly usersService: UsersService) {}

  @Delete("delete")
  @AuditLog(
    AuditAction.USER_REMOVED, 
    "users", 
    (result: any, args: any[]) => args[0].currentUser.id
  )
  async deleteMyData(@Req() req: AuthenticatedRequest) {
    if (!req.currentUser) {
      throw new InternalServerErrorException("Missing authentication context.");
    }

    await this.usersService.deleteGdprUser(req.currentUser.id);

    return { 
      success: true, 
      message: "Your personal data has been completely and irreversibly erased according to GDPR retention policies." 
    };
  }
}
