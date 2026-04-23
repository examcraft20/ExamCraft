import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock @supabase/ssr
const mockCreateBrowserClient = vi.fn();
vi.mock("@supabase/ssr", () => ({
  createBrowserClient: (...args: any[]) => mockCreateBrowserClient(...args),
}));

// Mock env module
vi.mock("@/lib/env", () => ({
  env: {
    supabaseUrl: "http://localhost:54321",
    supabaseAnonKey: "test-anon-key",
    apiUrl: "http://localhost:4000/api",
    appUrl: "http://localhost:3000",
  },
  assertPublicEnv: vi.fn(),
}));

describe("supabase-browser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset module cache to allow fresh imports
    vi.resetModules();
  });

  describe("getSupabaseBrowserClient", () => {
    it("should create a browser client with correct config", async () => {
      mockCreateBrowserClient.mockReturnValue({ auth: {} });

      const { getSupabaseBrowserClient } = await import("@/lib/supabase-browser");
      const client = getSupabaseBrowserClient();

      expect(mockCreateBrowserClient).toHaveBeenCalledWith(
        "http://localhost:54321",
        "test-anon-key",
      );
      expect(client).toBeDefined();
    });

    it("should return the same client on subsequent calls (singleton)", async () => {
      mockCreateBrowserClient.mockReturnValue({ auth: {} });

      const { getSupabaseBrowserClient } = await import("@/lib/supabase-browser");
      const client1 = getSupabaseBrowserClient();
      const client2 = getSupabaseBrowserClient();

      expect(client1).toBe(client2);
      expect(mockCreateBrowserClient).toHaveBeenCalledTimes(1);
    });
  });

  describe("getSupabaseBrowserSession", () => {
    it("should return test session when __EXAMCRAFT_TEST_SESSION__ is set", async () => {
      (window as any).__EXAMCRAFT_TEST_SESSION__ = {
        accessToken: "test-access-token",
        email: "test@example.com",
      };

      const { getSupabaseBrowserSession } = await import("@/lib/supabase-browser");
      const session = await getSupabaseBrowserSession();

      expect(session).toEqual({
        access_token: "test-access-token",
        user: { email: "test@example.com" },
      });

      delete (window as any).__EXAMCRAFT_TEST_SESSION__;
    });

    it("should get session from supabase client when no test session", async () => {
      delete (window as any).__EXAMCRAFT_TEST_SESSION__;

      const mockSession = { access_token: "real-token" };
      mockCreateBrowserClient.mockReturnValue({
        auth: {
          getSession: vi.fn().mockResolvedValue({ data: { session: mockSession } }),
        },
      });

      const { getSupabaseBrowserSession } = await import("@/lib/supabase-browser");
      const session = await getSupabaseBrowserSession();

      expect(session).toEqual(mockSession);
    });

    it("should return null when no session exists", async () => {
      delete (window as any).__EXAMCRAFT_TEST_SESSION__;

      mockCreateBrowserClient.mockReturnValue({
        auth: {
          getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
        },
      });

      const { getSupabaseBrowserSession } = await import("@/lib/supabase-browser");
      const session = await getSupabaseBrowserSession();

      expect(session).toBeNull();
    });
  });
});
