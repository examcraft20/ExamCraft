import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

// Mock next/navigation
const mockGet = vi.fn();
vi.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: mockGet,
  }),
}));

// Mock apiRequest
const mockApiRequest = vi.fn();
vi.mock("@/lib/api", () => ({
  apiRequest: (...args: any[]) => mockApiRequest(...args),
}));

// Mock supabase-browser
const mockGetSession = vi.fn();
vi.mock("@/lib/supabase-browser", () => ({
  getSupabaseBrowserSession: () => mockGetSession(),
}));

describe("useInstitution", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset localStorage
    const store: Record<string, string> = {};
    global.localStorage = {
      getItem: vi.fn((key: string) => store[key] ?? null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        for (const k of Object.keys(store)) delete store[k];
      }),
      get length() {
        return Object.keys(store).length;
      },
      key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
    } as any;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should set institutionId from URL search param when available", async () => {
    mockGet.mockImplementation((key: string) => {
      if (key === "institutionId") return "inst-from-url";
      return null;
    });
    mockGetSession.mockResolvedValue({ access_token: "tok" });
    mockApiRequest.mockResolvedValue([]);

    const { useInstitution } = await import("@/hooks/use-institution");
    const { result } = renderHook(() => useInstitution());

    await waitFor(() => {
      expect(result.current.institutionId).toBe("inst-from-url");
    });
  });

  it("should fall back to localStorage when URL has no institutionId", async () => {
    mockGet.mockReturnValue(null);
    (localStorage.getItem as any).mockImplementation((key: string) => {
      if (key === "examcraft_institution_id") return "inst-from-storage";
      if (key === "examcraft_institution_name") return "Test School";
      return null;
    });
    mockGetSession.mockResolvedValue({ access_token: "tok" });
    mockApiRequest.mockResolvedValue([]);

    const { useInstitution } = await import("@/hooks/use-institution");
    const { result } = renderHook(() => useInstitution());

    await waitFor(() => {
      expect(result.current.institutionId).toBe("inst-from-storage");
      expect(result.current.institutionName).toBe("Test School");
    });
  });

  it("should fetch memberships and set institution from API response", async () => {
    mockGet.mockReturnValue(null);
    (localStorage.getItem as any).mockReturnValue(null);
    mockGetSession.mockResolvedValue({ access_token: "tok" });
    mockApiRequest.mockResolvedValue([
      {
        institution_id: "inst-api",
        institutions: { name: "API School" },
      },
    ]);

    const { useInstitution } = await import("@/hooks/use-institution");
    const { result } = renderHook(() => useInstitution());

    await waitFor(() => {
      expect(result.current.institutionId).toBe("inst-api");
      expect(result.current.institutionName).toBe("API School");
    });
  });

  it("should set isLoading to false after loading completes", async () => {
    mockGet.mockReturnValue("inst-1");
    mockGetSession.mockResolvedValue({ access_token: "tok" });
    mockApiRequest.mockResolvedValue([]);

    const { useInstitution } = await import("@/hooks/use-institution");
    const { result } = renderHook(() => useInstitution());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it("should handle API request failure gracefully", async () => {
    mockGet.mockReturnValue(null);
    (localStorage.getItem as any).mockReturnValue(null);
    mockGetSession.mockResolvedValue({ access_token: "tok" });
    mockApiRequest.mockRejectedValue(new Error("Network error"));

    const { useInstitution } = await import("@/hooks/use-institution");
    const { result } = renderHook(() => useInstitution());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it("should prefer URL param institution in memberships", async () => {
    mockGet.mockImplementation((key: string) => {
      if (key === "institutionId") return "preferred-inst";
      return null;
    });
    mockGetSession.mockResolvedValue({ access_token: "tok" });
    mockApiRequest.mockResolvedValue([
      { institution_id: "preferred-inst", institutions: { name: "Preferred School" } },
      { institution_id: "other-inst", institutions: { name: "Other School" } },
    ]);

    const { useInstitution } = await import("@/hooks/use-institution");
    const { result } = renderHook(() => useInstitution());

    await waitFor(() => {
      expect(result.current.institutionId).toBe("preferred-inst");
    });
  });

  it("should return null institutionId when no session is available", async () => {
    mockGet.mockReturnValue(null);
    (localStorage.getItem as any).mockReturnValue(null);
    mockGetSession.mockResolvedValue(null);

    const { useInstitution } = await import("@/hooks/use-institution");
    const { result } = renderHook(() => useInstitution());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.institutionId).toBeNull();
    });
  });
});
