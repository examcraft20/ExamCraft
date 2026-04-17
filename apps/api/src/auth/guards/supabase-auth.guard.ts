import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ADMIN_CLIENT } from "../../supabase/supabase.constants";
import type { AuthenticatedRequest } from "../../common/types/authenticated-request";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(
    @Inject(SUPABASE_ADMIN_CLIENT)
    private readonly supabaseAdminClient: SupabaseClient,
    private readonly reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      throw new UnauthorizedException("Missing bearer token.");
    }

    const accessToken = authHeader.replace("Bearer ", "").trim();
    const { data, error } = await this.supabaseAdminClient.auth.getUser(accessToken);

    if (error || !data.user) {
      throw new UnauthorizedException("Invalid access token.");
    }

    const appMetadata = data.user.app_metadata ?? {};
    
    // Support both singular 'role' and plural 'roles' in app_metadata
    const rolesFromMetadata = appMetadata.roles || (appMetadata.role ? [appMetadata.role] : []);
    const roleCodes = Array.isArray(rolesFromMetadata)
      ? rolesFromMetadata.filter((v): v is string => typeof v === "string")
      : typeof rolesFromMetadata === "string" 
        ? [rolesFromMetadata] 
        : [];

    const isSuperAdmin = !!appMetadata.isSuperAdmin || roleCodes.includes("super_admin");

    request.currentUser = {
      id: data.user.id,
      email: data.user.email,
      roleCodes: Array.from(new Set(roleCodes)),
      isSuperAdmin
    };

    return true;
  }
}
