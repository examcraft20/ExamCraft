import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  UseGuards,
  applyDecorators
} from "@nestjs/common";
import { SupabaseAuthGuard } from "../../auth/guards/supabase-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { PermissionsGuard } from "../../auth/guards/permissions.guard";
import type { AuthenticatedRequest } from "../../common/types/authenticated-request";
import { TenantContextService } from "../tenant-context.service";

@Injectable()
export class TenantContextGuard implements CanActivate {
  constructor(private readonly tenantContextService: TenantContextService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const institutionId = request.headers["x-institution-id"];

    if (typeof institutionId !== "string" || !institutionId.trim()) {
      throw new UnauthorizedException("Missing x-institution-id header.");
    }

    if (!request.currentUser?.id) {
      throw new UnauthorizedException("Missing authenticated user.");
    }

    request.tenantContext = await this.tenantContextService.resolveForUser(
      request.currentUser.id,
      institutionId
    );

    return true;
  }
}

export const UseTenantAccess = () => UseGuards(SupabaseAuthGuard, TenantContextGuard);
export const UseTenantAuthorization = () =>
  applyDecorators(UseGuards(SupabaseAuthGuard, TenantContextGuard, RolesGuard, PermissionsGuard));
