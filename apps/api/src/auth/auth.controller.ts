import { Controller, Get, Post, Body, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { SupabaseAuthGuard } from "./guards/supabase-auth.guard";
import { Public } from "./decorators/public.decorator";
import type { AuthenticatedUser } from "../common/types/authenticated-request";
import { AuthService } from "./auth.service";

@Controller({ path: "auth", version: "1" })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get("me")
  @UseGuards(SupabaseAuthGuard)
  getCurrentUser(@CurrentUser() user: AuthenticatedUser | undefined) {
    return {
      user,
    };
  }

  @Post("signup")
  @Public()
  async signup(@Body() body: any) {
    return this.authService.signUp(body);
  }

  @Post("password-reset")
  @Public()
  async passwordReset(@Body() body: { email: string; redirectTo: string }) {
    return this.authService.resetPasswordForEmail(body.email, body.redirectTo);
  }
}
