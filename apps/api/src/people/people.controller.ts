import { Body, Controller, Get, InternalServerErrorException, Post } from "@nestjs/common";
import { RequirePermissions } from "../auth/decorators/permissions.decorator";
import { RequireRoles } from "../auth/decorators/roles.decorator";
import { CurrentTenant } from "../common/decorators/tenant-context.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import type { AuthenticatedUser, TenantContext } from "../common/types/authenticated-request";
import { InvitationService } from "../invitations/invitation.service";
import { UseTenantAuthorization } from "../tenant/guards/tenant-context.guard";
import { CreateStaffInvitationDto } from "./dto/create-staff-invitation.dto";
import { PeopleService } from "./people.service";

@Controller("people")
@UseTenantAuthorization()
@RequireRoles("institution_admin")
export class PeopleController {
  constructor(
    private readonly peopleService: PeopleService,
    private readonly invitationService: InvitationService
  ) {}

  @Get("users")
  @RequirePermissions("users.manage")
  getInstitutionPeople(@CurrentTenant() tenantContext: TenantContext | undefined) {
    if (!tenantContext) {
      throw new InternalServerErrorException("Missing tenant context.");
    }

    return this.peopleService.getInstitutionPeople(tenantContext);
  }

  @Post("invitations")
  @RequirePermissions("users.invite")
  createInvitation(
    @CurrentTenant() tenantContext: TenantContext | undefined,
    @CurrentUser() currentUser: AuthenticatedUser | undefined,
    @Body() body: CreateStaffInvitationDto
  ) {
    if (!tenantContext || !currentUser) {
      throw new InternalServerErrorException("Missing tenant or user context.");
    }

    return this.invitationService.createInvitation(tenantContext, currentUser.id, body);
  }
}
