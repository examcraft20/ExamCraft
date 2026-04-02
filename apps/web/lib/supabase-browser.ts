"use client";

import { createClient } from "@supabase/supabase-js";
import { assertPublicEnv, env } from "./env";

let browserClient: ReturnType<typeof createClient> | null = null;

declare global {
  interface Window {
    __EXAMCRAFT_TEST_SESSION__?: {
      accessToken: string;
      email?: string;
    };
  }
}

export function getSupabaseBrowserClient() {
  if (!browserClient) {
    assertPublicEnv();
    browserClient = createClient(env.supabaseUrl, env.supabaseAnonKey);
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
