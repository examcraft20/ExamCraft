"use client";

import { createBrowserClient } from "@supabase/ssr";
import { assertPublicEnv, env } from "./env";
import type { SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;

type BrowserSessionUser = {
  id?: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
  app_metadata?: Record<string, unknown>;
};

export type BrowserSession = {
  access_token: string;
  user: BrowserSessionUser;
};

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

export async function getSupabaseBrowserSession(): Promise<BrowserSession | null> {
  if (typeof window !== "undefined" && window.__EXAMCRAFT_TEST_SESSION__) {
    return {
      access_token: window.__EXAMCRAFT_TEST_SESSION__.accessToken,
      user: {
        email: window.__EXAMCRAFT_TEST_SESSION__.email,
        user_metadata: {},
        app_metadata: {},
      },
    };
  }

  const supabase = getSupabaseBrowserClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return null;
  }

  return {
    access_token: session.access_token,
    user: {
      id: session.user.id,
      email: session.user.email,
      user_metadata: (session.user.user_metadata ?? {}) as Record<string, unknown>,
      app_metadata: (session.user.app_metadata ?? {}) as Record<string, unknown>,
    },
  };
}
