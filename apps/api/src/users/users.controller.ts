import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Post,
  Patch,
  Delete,
  Param,
} from "@nestjs/common";
import { RequirePermissions } from "../auth/decorators/permissions.decorator";
import { RequireRoles } from "../auth/decorators/roles.decorator";
import { CurrentInstitution } from "../common/decorators/institution-context.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import type {
  AuthenticatedUser,
  InstitutionContext,
} from "../common/types/authenticated-request";
import { InvitationService } from "../invitations/invitation.service";
import { UseInstitutionAuthorization } from "../institution/guards/institution-context.guard";
import { CreateStaffInvitationDto } from "./dto/create-staff-invitation.dto";
import { UsersService } from "./users.service";
import { AuditLog } from "../common/decorators/audit-log.decorator";
import { AuditAction } from "../audit-logs/audit-action.enum";

@Controller({ path: "users", version: "1" })
@UseInstitutionAuthorization()
@RequireRoles("institution_admin")
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly invitationService: InvitationService,
  ) {}

  @Get("users")
  @RequirePermissions("users.manage")
  getInstitutionUsers(
    @CurrentInstitution() institutionContext: InstitutionContext | undefined,
  ) {
    if (!institutionContext) {
      throw new InternalServerErrorException("Missing institution context.");
    }

    return this.usersService.getInstitutionUsers(institutionContext);
  }

  @Post("invitations")
  @RequirePermissions("users.invite")
  @AuditLog(
    AuditAction.USER_INVITED,
    "invitations",
    (result: any) => result.invitation.id,
  )
  createInvitation(
    @CurrentInstitution() institutionContext: InstitutionContext | undefined,
    @CurrentUser() currentUser: AuthenticatedUser | undefined,
    @Body() body: CreateStaffInvitationDto,
  ) {
    if (!institutionContext || !currentUser) {
      throw new InternalServerErrorException("Missing institution or user context.");
    }

    return this.invitationService.createInvitation(
      institutionContext,
      currentUser.id,
      body,
    );
  }

  @Post("invitations/:id/resend")
  @RequirePermissions("users.invite")
  resendInvitation(
    @CurrentInstitution() institutionContext: InstitutionContext | undefined,
    @Param("id") id: string,
  ) {
    if (!institutionContext) {
      throw new InternalServerErrorException("Missing institution context.");
    }

    return this.invitationService.resendInvitation(institutionContext, id);
  }

  @Patch("users/:id")
  @RequirePermissions("users.manage")
  @AuditLog(
    AuditAction.USER_UPDATED,
    "institution_users",
    (result: any, [tc, userId]: any[]) => userId,
  )
  updateUserStatus(
    @CurrentInstitution() institutionContext: InstitutionContext | undefined,
    @CurrentUser() currentUser: AuthenticatedUser | undefined,
    @Param("id") id: string,
    @Body() body: { status?: string; displayName?: string },
  ) {
    if (!institutionContext || !currentUser) {
      throw new InternalServerErrorException("Missing institution or user context.");
    }

    return this.usersService.updateUser(institutionContext, id, body);
  }

  @Patch("users/:id/role")
  @RequirePermissions("users.manage")
  @AuditLog(
    AuditAction.USER_ROLE_CHANGED,
    "institution_user_roles",
    (result: any, [tc, userId]: any[]) => userId,
  )
  updateUserRole(
    @CurrentInstitution() institutionContext: InstitutionContext | undefined,
    @Param("id") id: string,
    @Body("roleCode") roleCode: string,
  ) {
    if (!institutionContext) {
      throw new InternalServerErrorException("Missing institution context.");
    }
    return this.usersService.updateUserRole(institutionContext, id, roleCode);
  }

  @Delete("users/:id")
  @RequirePermissions("users.manage")
  @AuditLog(
    AuditAction.USER_REMOVED,
    "institution_users",
    (result: any, [tc, userId]: any[]) => userId,
  )
  removeUser(
    @CurrentInstitution() institutionContext: InstitutionContext | undefined,
    @Param("id") id: string,
  ) {
    if (!institutionContext) {
      throw new InternalServerErrorException("Missing institution context.");
    }
    return this.usersService.removeUser(institutionContext, id);
  }
}
