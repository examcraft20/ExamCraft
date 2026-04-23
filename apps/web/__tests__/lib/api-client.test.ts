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

describe("apiRequest (client)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should make a GET request and return parsed JSON", async () => {
    const mockData = { id: "1", name: "Test" };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify(mockData),
    });

    const { apiRequest } = await import("@/lib/api");
    const result = await apiRequest<any>("/test");

    expect(result).toEqual(mockData);
    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:4000/api/test",
      expect.objectContaining({
        headers: expect.any(Headers),
      }),
    );
  });

  it("should set Content-Type to application/json by default", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({}),
    });

    const { apiRequest } = await import("@/lib/api");
    await apiRequest<any>("/test", { method: "POST", body: JSON.stringify({}) });

    const call = (global.fetch as any).mock.calls[0];
    const headers = call[1].headers as Headers;
    expect(headers.get("Content-Type")).toBe("application/json");
  });

  it("should set Authorization header when accessToken is provided", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({}),
    });

    const { apiRequest } = await import("@/lib/api");
    await apiRequest<any>("/test", { accessToken: "my-token" });

    const call = (global.fetch as any).mock.calls[0];
    const headers = call[1].headers as Headers;
    expect(headers.get("Authorization")).toBe("Bearer my-token");
  });

  it("should set x-institution-id header when institutionId is provided", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({}),
    });

    const { apiRequest } = await import("@/lib/api");
    await apiRequest<any>("/test", { institutionId: "inst-123" });

    const call = (global.fetch as any).mock.calls[0];
    const headers = call[1].headers as Headers;
    expect(headers.get("x-institution-id")).toBe("inst-123");
  });

  it("should throw an error with message when response is not ok", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      text: async () => JSON.stringify({ message: "Bad request data" }),
    });

    const { apiRequest } = await import("@/lib/api");
    await expect(apiRequest<any>("/test")).rejects.toThrow("Bad request data");
  });

  it("should throw error with error field when message is absent", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => JSON.stringify({ error: "Internal server error" }),
    });

    const { apiRequest } = await import("@/lib/api");
    await expect(apiRequest<any>("/test")).rejects.toThrow("Internal server error");
  });

  it("should throw error for array error messages joined by comma", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 422,
      text: async () => JSON.stringify({ message: ["Field A is required", "Field B is invalid"] }),
    });

    const { apiRequest } = await import("@/lib/api");
    await expect(apiRequest<any>("/test")).rejects.toThrow("Field A is required, Field B is invalid");
  });

  it("should handle non-JSON response gracefully", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 502,
      text: async () => "Bad Gateway HTML",
    });

    const { apiRequest } = await import("@/lib/api");
    await expect(apiRequest<any>("/test")).rejects.toThrow("Invalid JSON response from server");
  });

  it("should not set Content-Type when body is FormData", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({}),
    });

    const formData = new FormData();
    formData.append("file", "test");

    const { apiRequest } = await import("@/lib/api");
    await apiRequest<any>("/upload", { method: "POST", body: formData });

    const call = (global.fetch as any).mock.calls[0];
    const headers = call[1].headers as Headers;
    expect(headers.get("Content-Type")).toBeNull();
  });

  it("should handle empty response body", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => "",
    });

    const { apiRequest } = await import("@/lib/api");
    const result = await apiRequest<any>("/test");
    expect(result).toEqual({});
  });
});
