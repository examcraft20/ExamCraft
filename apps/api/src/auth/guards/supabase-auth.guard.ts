import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException
} from "@nestjs/common";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ADMIN_CLIENT } from "../../supabase/supabase.constants";
import type { AuthenticatedRequest } from "../../common/types/authenticated-request";

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(
    @Inject(SUPABASE_ADMIN_CLIENT)
    private readonly supabaseAdminClient: SupabaseClient
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
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

    request.currentUser = {
      id: data.user.id,
      email: data.user.email
    };

    return true;
  }
}
