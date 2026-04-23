import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("env module", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should use default values when env vars are not set", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    delete process.env.NEXT_PUBLIC_APP_URL;
    delete process.env.NEXT_PUBLIC_API_URL;

    const { env } = await import("@/lib/env");
    expect(env.appUrl).toBe("http://localhost:3000");
    expect(env.apiUrl).toBe("http://localhost:4000/api");
    expect(env.supabaseUrl).toBe("");
    expect(env.supabaseAnonKey).toBe("");
  });

  it("should read values from environment variables", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://supabase.example.com";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "my-anon-key";
    process.env.NEXT_PUBLIC_APP_URL = "https://app.example.com";
    process.env.NEXT_PUBLIC_API_URL = "https://api.example.com";

    const { env } = await import("@/lib/env");
    expect(env.supabaseUrl).toBe("https://supabase.example.com");
    expect(env.supabaseAnonKey).toBe("my-anon-key");
    expect(env.appUrl).toBe("https://app.example.com");
    expect(env.apiUrl).toBe("https://api.example.com");
  });

  describe("assertPublicEnv", () => {
    it("should throw when Supabase env vars are missing", async () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      const { assertPublicEnv } = await import("@/lib/env");
      expect(() => assertPublicEnv()).toThrow(
        "Missing public Supabase environment variables",
      );
    });

    it("should throw when supabaseUrl is empty string", async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = "";
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "key";

      const { assertPublicEnv } = await import("@/lib/env");
      expect(() => assertPublicEnv()).toThrow();
    });

    it("should not throw when both env vars are present", async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://supabase.example.com";
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "my-anon-key";

      const { assertPublicEnv } = await import("@/lib/env");
      expect(() => assertPublicEnv()).not.toThrow();
    });
  });
});
