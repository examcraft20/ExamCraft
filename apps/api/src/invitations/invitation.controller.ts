import {
  BadRequestException,
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Post,
  Query
} from "@nestjs/common";
import { RequirePermissions } from "../auth/decorators/permissions.decorator";
import { RequireRoles } from "../auth/decorators/roles.decorator";
import { CurrentTenant } from "../common/decorators/tenant-context.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import type {
  AuthenticatedUser,
  TenantContext
} from "../common/types/authenticated-request";
import { UseTenantAuthorization } from "../tenant/guards/tenant-context.guard";
import type { AcceptInvitationDto, CreateInvitationDto } from "./dto/create-invitation.dto";
import { InvitationService } from "./invitation.service";

@Controller("invitations")
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  @Get("preview")
  previewInvitation(@Query("token") token?: string) {
    if (!token) {
      throw new BadRequestException("Missing invitation token.");
    }

    return this.invitationService.previewInvitation(token);
  }

  @Post()
  @UseTenantAuthorization()
  @RequireRoles("institution_admin")
  @RequirePermissions("users.invite")
  createInvitation(
    @CurrentTenant() tenantContext: TenantContext | undefined,
    @CurrentUser() currentUser: AuthenticatedUser | undefined,
    @Body() body: CreateInvitationDto
  ) {
    if (!tenantContext || !currentUser) {
      throw new InternalServerErrorException("Missing tenant or user context.");
    }

    return this.invitationService.createInvitation(tenantContext, currentUser.id, body);
  }

  @Post("accept")
  acceptInvitation(@Body() body: AcceptInvitationDto) {
    return this.invitationService.acceptInvitation(body);
  }
}
