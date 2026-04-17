"use client";

import { createBrowserClient } from "@supabase/ssr";
import { assertPublicEnv, env } from "./env";
import type { SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;

declare global {
  interface Window {
    __EXAMCRAFT_TEST_SESSION__?: {
      accessToken: string;
      email?: string;
    };
  }
}

export function getSupabaseBrowserClient(): SupabaseClient {
  if (!browserClient) {
    assertPublicEnv();
    browserClient = createBrowserClient(env.supabaseUrl, env.supabaseAnonKey);
  }

  return browserClient;
}

export async function getSupabaseBrowserSession() {
  if (typeof window !== "undefined" && window.__EXAMCRAFT_TEST_SESSION__) {
    return {
      access_token: window.__EXAMCRAFT_TEST_SESSION__.accessToken,
      user: {
        email: window.__EXAMCRAFT_TEST_SESSION__.email
      }
    };
  }

  const supabase = getSupabaseBrowserClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  return session;
}
