import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the env module
vi.mock("@/lib/env", () => ({
  env: {
    apiUrl: "http://localhost:4000/api",
    appUrl: "http://localhost:3000",
    supabaseUrl: "http://localhost:54321",
    supabaseAnonKey: "test-anon-key",
  },
}));

describe("serverApiRequest", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should make a request and return parsed JSON", async () => {
    const mockData = { success: true };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });

    const { serverApiRequest } = await import("@/lib/api/server");
    const result = await serverApiRequest<any>("/test", { accessToken: "tok" });

    expect(result).toEqual(mockData);
  });

  it("should set Authorization header from accessToken option", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    const { serverApiRequest } = await import("@/lib/api/server");
    await serverApiRequest<any>("/test", { accessToken: "server-token" });

    const call = (global.fetch as any).mock.calls[0];
    const headers = call[1].headers as Headers;
    expect(headers.get("Authorization")).toBe("Bearer server-token");
  });

  it("should set x-institution-id header when institutionId is provided", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    const { serverApiRequest } = await import("@/lib/api/server");
    await serverApiRequest<any>("/test", { accessToken: "tok", institutionId: "inst-1" });

    const call = (global.fetch as any).mock.calls[0];
    const headers = call[1].headers as Headers;
    expect(headers.get("x-institution-id")).toBe("inst-1");
  });

  it("should throw error when response is not ok with message", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ message: "Not found" }),
    });

    const { serverApiRequest } = await import("@/lib/api/server");
    await expect(serverApiRequest<any>("/test", { accessToken: "tok" })).rejects.toThrow("Not found");
  });

  it("should throw error with error field when message is absent", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Something went wrong" }),
    });

    const { serverApiRequest } = await import("@/lib/api/server");
    await expect(serverApiRequest<any>("/test", { accessToken: "tok" })).rejects.toThrow("Something went wrong");
  });

  it("should join array error messages", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ message: ["Error 1", "Error 2"] }),
    });

    const { serverApiRequest } = await import("@/lib/api/server");
    await expect(serverApiRequest<any>("/test", { accessToken: "tok" })).rejects.toThrow("Error 1, Error 2");
  });

  it("should default error message when response has no message or error", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({}),
    });

    const { serverApiRequest } = await import("@/lib/api/server");
    await expect(serverApiRequest<any>("/test", { accessToken: "tok" })).rejects.toThrow("The request failed. Please try again.");
  });

  it("should set Content-Type to application/json by default", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    const { serverApiRequest } = await import("@/lib/api/server");
    await serverApiRequest<any>("/test", { accessToken: "tok", method: "POST", body: "{}" });

    const call = (global.fetch as any).mock.calls[0];
    const headers = call[1].headers as Headers;
    expect(headers.get("Content-Type")).toBe("application/json");
  });

  it("should handle JSON parse failure gracefully", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => { throw new Error("Invalid JSON"); },
    });

    const { serverApiRequest } = await import("@/lib/api/server");
    await expect(serverApiRequest<any>("/test", { accessToken: "tok" })).rejects.toThrow("The request failed. Please try again.");
  });
});
