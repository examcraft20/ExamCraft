import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { REQUIRED_ROLES_KEY } from "../decorators/roles.decorator";
import type { AuthenticatedRequest } from "../../common/types/authenticated-request";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles =
      this.reflector.getAllAndOverride<string[]>(REQUIRED_ROLES_KEY, [
        context.getHandler(),
        context.getClass()
      ]) ?? [];

    if (requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const roleCodes = request.tenantContext?.roleCodes ?? [];
    const hasAllowedRole = requiredRoles.some((requiredRole) => roleCodes.includes(requiredRole));

    if (!hasAllowedRole) {
      throw new ForbiddenException("You do not have one of the required roles.");
    }

    return true;
  }
}
