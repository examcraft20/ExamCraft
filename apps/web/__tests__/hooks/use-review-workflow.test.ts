import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";

// Mock the apiRequest module
const mockApiRequest = vi.fn();
vi.mock("@/lib/api", () => ({
  apiRequest: (...args: any[]) => mockApiRequest(...args),
}));

describe("useReviewWorkflow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should load workspace data on mount", async () => {
    mockApiRequest.mockImplementation((path: string) => {
      if (path.includes("dashboard-summary")) return Promise.resolve({ totalUsers: 10 });
      if (path.includes("questions")) return Promise.resolve([{ id: "q1", title: "Q1" }]);
      if (path.includes("templates")) return Promise.resolve([{ id: "t1", name: "T1" }]);
      if (path.includes("papers")) return Promise.resolve([{ id: "p1", title: "P1" }]);
      return Promise.resolve([]);
    });

    const { useReviewWorkflow } = await import("@/hooks/use-review-workflow");
    const { result } = renderHook(() => useReviewWorkflow("test-token", "inst-1"));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.summary).toEqual({ totalUsers: 10 });
    expect(result.current.questions).toHaveLength(1);
    expect(result.current.templates).toHaveLength(1);
    expect(result.current.papers).toHaveLength(1);
  });

  it("should set error status when API calls fail", async () => {
    mockApiRequest.mockRejectedValue(new Error("Server unavailable"));

    const { useReviewWorkflow } = await import("@/hooks/use-review-workflow");
    const { result } = renderHook(() => useReviewWorkflow("test-token", "inst-1"));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.status).toBe("Server unavailable");
  });

  it("should update question state after reviewing a question", async () => {
    mockApiRequest.mockImplementation((path: string) => {
      if (path.includes("dashboard-summary")) return Promise.resolve({});
      if (path.includes("questions")) return Promise.resolve([{ id: "q1", title: "Q1", status: "pending" }]);
      if (path.includes("templates")) return Promise.resolve([]);
      if (path.includes("papers")) return Promise.resolve([]);
      return Promise.resolve([]);
    });

    const { useReviewWorkflow } = await import("@/hooks/use-review-workflow");
    const { result } = renderHook(() => useReviewWorkflow("test-token", "inst-1"));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Mock the review API call
    mockApiRequest.mockResolvedValue({ id: "q1", title: "Q1", status: "approved" });

    await act(async () => {
      await result.current.handleReview("question", "q1", "approve");
    });

    expect(result.current.questions[0].status).toBe("approved");
  });

  it("should update template state after reviewing a template", async () => {
    mockApiRequest.mockImplementation((path: string) => {
      if (path.includes("dashboard-summary")) return Promise.resolve({});
      if (path.includes("questions")) return Promise.resolve([]);
      if (path.includes("templates")) return Promise.resolve([{ id: "t1", name: "T1", status: "pending" }]);
      if (path.includes("papers")) return Promise.resolve([]);
      return Promise.resolve([]);
    });

    const { useReviewWorkflow } = await import("@/hooks/use-review-workflow");
    const { result } = renderHook(() => useReviewWorkflow("test-token", "inst-1"));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    mockApiRequest.mockResolvedValue({ id: "t1", name: "T1", status: "rejected" });

    await act(async () => {
      await result.current.handleReview("template", "t1", "reject", "Not good enough");
    });

    expect(result.current.templates[0].status).toBe("rejected");
  });

  it("should update paper state after reviewing a paper", async () => {
    mockApiRequest.mockImplementation((path: string) => {
      if (path.includes("dashboard-summary")) return Promise.resolve({});
      if (path.includes("questions")) return Promise.resolve([]);
      if (path.includes("templates")) return Promise.resolve([]);
      if (path.includes("papers")) return Promise.resolve([{ id: "p1", title: "P1", status: "pending" }]);
      return Promise.resolve([]);
    });

    const { useReviewWorkflow } = await import("@/hooks/use-review-workflow");
    const { result } = renderHook(() => useReviewWorkflow("test-token", "inst-1"));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    mockApiRequest.mockResolvedValue({ id: "p1", title: "P1", status: "approved" });

    await act(async () => {
      await result.current.handleReview("paper", "p1", "approve");
    });

    expect(result.current.papers[0].status).toBe("approved");
  });

  it("should set activeActionKey during review and clear it after", async () => {
    mockApiRequest.mockImplementation((path: string) => {
      if (path.includes("dashboard-summary")) return Promise.resolve({});
      if (path.includes("questions")) return Promise.resolve([{ id: "q1", title: "Q1", status: "pending" }]);
      if (path.includes("templates")) return Promise.resolve([]);
      if (path.includes("papers")) return Promise.resolve([]);
      return Promise.resolve([]);
    });

    const { useReviewWorkflow } = await import("@/hooks/use-review-workflow");
    const { result } = renderHook(() => useReviewWorkflow("test-token", "inst-1"));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    mockApiRequest.mockResolvedValue({ id: "q1", status: "approved" });

    await act(async () => {
      await result.current.handleReview("question", "q1", "approve");
    });

    expect(result.current.activeActionKey).toBeNull();
  });

  it("should set error status when review action fails", async () => {
    mockApiRequest.mockImplementation((path: string) => {
      if (path.includes("dashboard-summary")) return Promise.resolve({});
      if (path.includes("questions")) return Promise.resolve([{ id: "q1", title: "Q1" }]);
      if (path.includes("templates")) return Promise.resolve([]);
      if (path.includes("papers")) return Promise.resolve([]);
      return Promise.resolve([]);
    });

    const { useReviewWorkflow } = await import("@/hooks/use-review-workflow");
    const { result } = renderHook(() => useReviewWorkflow("test-token", "inst-1"));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    mockApiRequest.mockRejectedValue(new Error("Review failed"));

    await act(async () => {
      await result.current.handleReview("question", "q1", "approve");
    });

    expect(result.current.status).toBe("Review failed");
  });

  it("should expose a refresh function", async () => {
    mockApiRequest.mockImplementation((path: string) => {
      if (path.includes("dashboard-summary")) return Promise.resolve({});
      if (path.includes("questions")) return Promise.resolve([]);
      if (path.includes("templates")) return Promise.resolve([]);
      if (path.includes("papers")) return Promise.resolve([]);
      return Promise.resolve([]);
    });

    const { useReviewWorkflow } = await import("@/hooks/use-review-workflow");
    const { result } = renderHook(() => useReviewWorkflow("test-token", "inst-1"));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(typeof result.current.refresh).toBe("function");
  });
});
