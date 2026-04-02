"use client";

import { createClient } from "@supabase/supabase-js";
import { assertPublicEnv, env } from "./env";

let browserClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseBrowserClient() {
  if (!browserClient) {
    assertPublicEnv();
    browserClient = createClient(env.supabaseUrl, env.supabaseAnonKey);
  }

  return browserClient;
}
