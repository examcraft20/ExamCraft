import { Controller, Get, UseGuards } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { SupabaseAuthGuard } from "./guards/supabase-auth.guard";
import type { AuthenticatedUser } from "../common/types/authenticated-request";

@Controller({ path: "auth", version: "1" })
@Throttle({ auth: {} })
export class AuthController {
  @Get("me")
  @UseGuards(SupabaseAuthGuard)
  getCurrentUser(@CurrentUser() user: AuthenticatedUser | undefined) {
    return {
      user
    };
  }
}

