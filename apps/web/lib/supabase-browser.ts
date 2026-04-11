"use client";

import { createBrowserClient } from "@supabase/ssr";
import { assertPublicEnv, env } from "./env";

let browserClient: ReturnType<typeof createBrowserClient> | null = null;
let demoClient: ReturnType<typeof createBrowserClient> | null = null;
const demoStorageKey = "examcraft.demo.session";
const demoFallbackEmail = "demo.user@examcraft.test";

declare global {
  interface Window {
    __EXAMCRAFT_TEST_SESSION__?: {
      accessToken: string;
      email?: string;
    };
  }
}

export function getSupabaseBrowserClient() {
  if (env.demoMode) {
    if (!demoClient) {
      demoClient = createDemoClient() as any;
    }
    return demoClient;
  }
  if (!browserClient) {
    assertPublicEnv();
    browserClient = createBrowserClient(env.supabaseUrl, env.supabaseAnonKey);
  }

  return browserClient as any;
}

export async function getSupabaseBrowserSession() {
  if (env.demoMode) {
    return loadDemoSession() ?? createAndStoreDemoSession(demoFallbackEmail);
  }
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

function loadDemoSession() {
  if (typeof window === "undefined") {
    return null;
  }

  if (window.__EXAMCRAFT_TEST_SESSION__?.accessToken) {
    return {
      access_token: window.__EXAMCRAFT_TEST_SESSION__.accessToken,
      user: {
        email: window.__EXAMCRAFT_TEST_SESSION__.email
      }
    };
  }

  const stored = window.localStorage?.getItem(demoStorageKey);
  if (!stored) {
    return null;
  }

  try {
    const parsed = JSON.parse(stored) as { access_token: string; email?: string };
    return {
      access_token: parsed.access_token,
      user: {
        email: parsed.email
      }
    };
  } catch {
    return null;
  }
}

function persistDemoSession(session: { access_token: string; user: { email?: string } }) {
  if (typeof window === "undefined") {
    return;
  }

  window.__EXAMCRAFT_TEST_SESSION__ = {
    accessToken: session.access_token,
    email: session.user.email
  };

  if (window.localStorage) {
    window.localStorage.setItem(
      demoStorageKey,
      JSON.stringify({ access_token: session.access_token, email: session.user.email })
    );
  }
}

function createAndStoreDemoSession(email: string, displayName?: string) {
  const session = {
    access_token: `demo-${Math.random().toString(36).slice(2)}`,
    user: {
      email,
      user_metadata: {
        display_name: displayName
      }
    }
  };

  persistDemoSession(session);
  return session;
}

function createDemoClient() {
  return {
    auth: {
      signInWithPassword: async ({ email }: { email: string }) => {
        createAndStoreDemoSession(email);
        return { data: { session: loadDemoSession() }, error: null };
      },
      signUp: async ({
        email,
        options
      }: {
        email: string;
        options?: { data?: { display_name?: string } };
      }) => {
        createAndStoreDemoSession(email, options?.data?.display_name);
        return { data: { user: { email } }, error: null };
      },
      getSession: async () => {
        return { data: { session: loadDemoSession() ?? createAndStoreDemoSession(demoFallbackEmail) } };
      },
      signOut: async () => {
        if (typeof window !== "undefined") {
          window.__EXAMCRAFT_TEST_SESSION__ = undefined;
          window.localStorage?.removeItem(demoStorageKey);
        }
        return { error: null };
      }
    }
  } as unknown as ReturnType<typeof createClient>;
}
