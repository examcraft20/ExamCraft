import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ADMIN_CLIENT } from "./supabase.constants";

@Module({
  providers: [
    {
      provide: SUPABASE_ADMIN_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): SupabaseClient => {
        const supabaseUrl = configService.get<string>("NEXT_PUBLIC_SUPABASE_URL");
        const serviceRoleKey = configService.get<string>("SUPABASE_SERVICE_ROLE_KEY");

        if (!supabaseUrl || !serviceRoleKey) {
          throw new Error(
            "Missing Supabase configuration. Expected NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
          );
        }

        return createClient(supabaseUrl, serviceRoleKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        });
      }
    }
  ],
  exports: [SUPABASE_ADMIN_CLIENT]
})
export class SupabaseModule {}
