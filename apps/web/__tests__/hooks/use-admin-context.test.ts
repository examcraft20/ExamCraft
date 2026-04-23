import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

// Mock next/navigation
const mockGet = vi.fn();
const mockReplace = vi.fn();
vi.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: mockGet,
  }),
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

// Mock supabase-browser
const mockGetSession = vi.fn();
vi.mock("@/lib/supabase-browser", () => ({
  getSupabaseBrowserSession: () => mockGetSession(),
}));

describe("useAdminContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

  it("should set institutionId from URL search param", async () => {
    mockGet.mockImplementation((key: string) => {
      if (key === "institutionId") return "inst-url";
      return null;
    });
    mockGetSession.mockResolvedValue({ access_token: "valid-token" });

    const { useAdminContext } = await import("@/hooks/use-admin-context");
    const { result } = renderHook(() => useAdminContext());

    await waitFor(() => {
      expect(result.current.institutionId).toBe("inst-url");
    });
  });

  it("should set accessToken from session", async () => {
    mockGet.mockReturnValue("inst-1");
    mockGetSession.mockResolvedValue({ access_token: "my-access-token" });

    const { useAdminContext } = await import("@/hooks/use-admin-context");
    const { result } = renderHook(() => useAdminContext());

    await waitFor(() => {
      expect(result.current.accessToken).toBe("my-access-token");
    });
  });

  it("should redirect to /login when no session is available", async () => {
    mockGet.mockReturnValue("inst-1");
    mockGetSession.mockResolvedValue(null);

    const { useAdminContext } = await import("@/hooks/use-admin-context");
    renderHook(() => useAdminContext());

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/login");
    });
  });

  it("should redirect to /dashboard when no institutionId is available", async () => {
    mockGet.mockReturnValue(null);
    (localStorage.getItem as any).mockReturnValue(null);
    mockGetSession.mockResolvedValue({ access_token: "valid-token" });

    const { useAdminContext } = await import("@/hooks/use-admin-context");
    renderHook(() => useAdminContext());

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("should set isReady to true when both token and institutionId are available", async () => {
    mockGet.mockReturnValue("inst-1");
    mockGetSession.mockResolvedValue({ access_token: "token-1" });

    const { useAdminContext } = await import("@/hooks/use-admin-context");
    const { result } = renderHook(() => useAdminContext());

    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
      expect(result.current.accessToken).toBe("token-1");
      expect(result.current.institutionId).toBe("inst-1");
    });
  });

  it("should use localStorage as fallback for institutionId", async () => {
    mockGet.mockReturnValue(null);
    (localStorage.getItem as any).mockImplementation((key: string) => {
      if (key === "examcraft_institution_id") return "inst-local";
      return null;
    });
    mockGetSession.mockResolvedValue({ access_token: "token-1" });

    const { useAdminContext } = await import("@/hooks/use-admin-context");
    const { result } = renderHook(() => useAdminContext());

    await waitFor(() => {
      expect(result.current.institutionId).toBe("inst-local");
      expect(result.current.isReady).toBe(true);
    });
  });
});
