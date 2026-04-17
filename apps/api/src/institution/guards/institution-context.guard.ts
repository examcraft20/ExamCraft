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
import { InstitutionMembershipsService } from "../services/institution-memberships.service";

@Injectable()
export class InstitutionContextGuard implements CanActivate {
  constructor(private readonly institutionContextService: InstitutionMembershipsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const institutionId = request.headers["x-institution-id"];

    if (typeof institutionId !== "string" || !institutionId.trim()) {
      throw new UnauthorizedException("Missing x-institution-id header.");
    }

    if (!request.currentUser?.id) {
      throw new UnauthorizedException("Missing authenticated user.");
    }

    // resolveForUser verifies membership by querying with user_id + institution_id + status=active
    // and throws NotFoundException if the user doesn't belong to this institution
    try {
      request.institutionContext = await this.institutionContextService.resolveForUser(
        request.currentUser.id,
        institutionId
      );
    } catch {
      throw new UnauthorizedException("Access to this institution is denied.");
    }

    return true;
  }
}

export const UseInstitutionAccess = () => UseGuards(SupabaseAuthGuard, InstitutionContextGuard);
export const UseInstitutionAuthorization = () =>
  applyDecorators(UseGuards(SupabaseAuthGuard, InstitutionContextGuard, RolesGuard, PermissionsGuard));
