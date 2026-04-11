import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { REQUIRED_PERMISSIONS_KEY } from "../decorators/permissions.decorator";
import type { AuthenticatedRequest } from "../../common/types/authenticated-request";

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions =
      this.reflector.getAllAndOverride<string[]>(REQUIRED_PERMISSIONS_KEY, [
        context.getHandler(),
        context.getClass()
      ]) ?? [];

    if (requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const permissionCodes = request.institutionContext?.permissionCodes ?? [];
    const hasRequiredPermissions = requiredPermissions.every((requiredPermission) =>
      permissionCodes.includes(requiredPermission)
    );

    if (!hasRequiredPermissions) {
      throw new ForbiddenException("You do not have the required permissions.");
    }

    return true;
  }
}
