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
import { CurrentTenant } from "../common/decorators/tenant-context.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import type {
  AuthenticatedUser,
  TenantContext,
} from "../common/types/authenticated-request";
import { InvitationService } from "../invitations/invitation.service";
import { UseTenantAuthorization } from "../tenant/guards/tenant-context.guard";
import { CreateStaffInvitationDto } from "./dto/create-staff-invitation.dto";
import { PeopleService } from "./people.service";
import { AuditLog } from "../common/decorators/audit-log.decorator";
import { AuditAction } from "../audit-logs/audit-action.enum";

@Controller({ path: "people", version: "1" })
@UseTenantAuthorization()
@RequireRoles("institution_admin")
export class PeopleController {
  constructor(
    private readonly peopleService: PeopleService,
    private readonly invitationService: InvitationService,
  ) {}

  @Get("users")
  @RequirePermissions("users.manage")
  getInstitutionPeople(
    @CurrentTenant() tenantContext: TenantContext | undefined,
  ) {
    if (!tenantContext) {
      throw new InternalServerErrorException("Missing tenant context.");
    }

    return this.peopleService.getInstitutionPeople(tenantContext);
  }

  @Post("invitations")
  @RequirePermissions("users.invite")
  @AuditLog(
    AuditAction.USER_INVITED,
    "invitations",
    (result: any) => result.invitation.id,
  )
  createInvitation(
    @CurrentTenant() tenantContext: TenantContext | undefined,
    @CurrentUser() currentUser: AuthenticatedUser | undefined,
    @Body() body: CreateStaffInvitationDto,
  ) {
    if (!tenantContext || !currentUser) {
      throw new InternalServerErrorException("Missing tenant or user context.");
    }

    return this.invitationService.createInvitation(
      tenantContext,
      currentUser.id,
      body,
    );
  }

  @Post("invitations/:id/resend")
  @RequirePermissions("users.invite")
  resendInvitation(
    @CurrentTenant() tenantContext: TenantContext | undefined,
    @Param("id") id: string,
  ) {
    if (!tenantContext) {
      throw new InternalServerErrorException("Missing tenant context.");
    }

    return this.invitationService.resendInvitation(tenantContext, id);
  }

  @Patch("users/:id")
  @RequirePermissions("users.manage")
  @AuditLog(
    AuditAction.USER_UPDATED,
    "institution_users",
    (result: any, [tc, userId]: any[]) => userId,
  )
  updateUserStatus(
    @CurrentTenant() tenantContext: TenantContext | undefined,
    @CurrentUser() currentUser: AuthenticatedUser | undefined,
    @Param("id") id: string,
    @Body() body: { status?: string; displayName?: string },
  ) {
    if (!tenantContext || !currentUser) {
      throw new InternalServerErrorException("Missing tenant or user context.");
    }

    return this.peopleService.updateUser(tenantContext, id, body);
  }

  @Patch("users/:id/role")
  @RequirePermissions("users.manage")
  @AuditLog(
    AuditAction.USER_ROLE_CHANGED,
    "institution_user_roles",
    (result: any, [tc, userId]: any[]) => userId,
  )
  updateUserRole(
    @CurrentTenant() tenantContext: TenantContext | undefined,
    @Param("id") id: string,
    @Body("roleCode") roleCode: string,
  ) {
    if (!tenantContext) {
      throw new InternalServerErrorException("Missing tenant context.");
    }
    return this.peopleService.updateUserRole(tenantContext, id, roleCode);
  }

  @Delete("users/:id")
  @RequirePermissions("users.manage")
  @AuditLog(
    AuditAction.USER_REMOVED,
    "institution_users",
    (result: any, [tc, userId]: any[]) => userId,
  )
  removeUser(
    @CurrentTenant() tenantContext: TenantContext | undefined,
    @Param("id") id: string,
  ) {
    if (!tenantContext) {
      throw new InternalServerErrorException("Missing tenant context.");
    }
    return this.peopleService.removeUser(tenantContext, id);
  }
}
