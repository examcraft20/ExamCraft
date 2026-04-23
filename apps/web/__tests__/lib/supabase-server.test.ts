import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock @supabase/ssr
const mockCreateServerClient = vi.fn();
vi.mock("@supabase/ssr", () => ({
  createServerClient: (...args: any[]) => mockCreateServerClient(...args),
}));

// Mock next/headers
const mockCookieStore = {
  get: vi.fn(),
  set: vi.fn(),
};
vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue(mockCookieStore),
}));

describe("supabase-server", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "http://localhost:54321";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";
  });

  it("should create a server client with correct config", async () => {
    mockCreateServerClient.mockReturnValue({ auth: {} });

    const { createClient } = await import("@/lib/supabase-server");
    const client = await createClient();

    expect(mockCreateServerClient).toHaveBeenCalledWith(
      "http://localhost:54321",
      "test-anon-key",
      expect.objectContaining({
        cookies: expect.objectContaining({
          get: expect.any(Function),
          set: expect.any(Function),
          remove: expect.any(Function),
        }),
      }),
    );
    expect(client).toBeDefined();
  });

  it("should get cookie value from cookieStore", async () => {
    mockCookieStore.get.mockReturnValue({ value: "cookie-val" });
    mockCreateServerClient.mockImplementation((_url: string, _key: string, config: any) => {
      // Call the get method to test it
      const val = config.cookies.get("test-cookie");
      expect(val).toBe("cookie-val");
      return { auth: {} };
    });

    const { createClient } = await import("@/lib/supabase-server");
    await createClient();
  });

  it("should set cookie via cookieStore", async () => {
    mockCreateServerClient.mockImplementation((_url: string, _key: string, config: any) => {
      config.cookies.set("my-cookie", "my-value", {});
      return { auth: {} };
    });

    const { createClient } = await import("@/lib/supabase-server");
    await createClient();

    expect(mockCookieStore.set).toHaveBeenCalledWith({
      name: "my-cookie",
      value: "my-value",
    });
  });

  it("should remove cookie by setting empty value", async () => {
    mockCreateServerClient.mockImplementation((_url: string, _key: string, config: any) => {
      config.cookies.remove("my-cookie", {});
      return { auth: {} };
    });

    const { createClient } = await import("@/lib/supabase-server");
    await createClient();

    expect(mockCookieStore.set).toHaveBeenCalledWith({
      name: "my-cookie",
      value: "",
    });
  });

  it("should handle set cookie error gracefully (Server Component)", async () => {
    mockCookieStore.set.mockImplementation(() => {
      throw new Error("Cannot set cookie from Server Component");
    });

    // Should not throw - the error is silently caught
    mockCreateServerClient.mockImplementation((_url: string, _key: string, config: any) => {
      expect(() => config.cookies.set("c", "v", {})).not.toThrow();
      return { auth: {} };
    });

    const { createClient } = await import("@/lib/supabase-server");
    await createClient();
  });

  it("should handle remove cookie error gracefully", async () => {
    mockCookieStore.set.mockImplementation(() => {
      throw new Error("Cannot remove cookie from Server Component");
    });

    mockCreateServerClient.mockImplementation((_url: string, _key: string, config: any) => {
      expect(() => config.cookies.remove("c", {})).not.toThrow();
      return { auth: {} };
    });

    const { createClient } = await import("@/lib/supabase-server");
    await createClient();
  });
});
