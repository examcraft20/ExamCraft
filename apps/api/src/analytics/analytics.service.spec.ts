import { InternalServerErrorException } from "@nestjs/common";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { AnalyticsService } from "./analytics.service";

describe("AnalyticsService", () => {
  // 6C.1 — getSummaryStats success path
  it("calls the get_institution_stats RPC and returns data", async () => {
    const mockData = {
      totalQuestions: 10,
      papersGeneratedAllTime: 5,
      papersGeneratedLast30Days: 2,
      pendingApprovals: 1,
      approvedAndPublished: 4,
      activeFacultyCount: 3
    };

    const rpcFn = vi.fn().mockResolvedValue({ data: mockData, error: null });
    const client = { rpc: rpcFn };

    const service = new AnalyticsService(client as never);
    const result = await service.getSummaryStats("inst-123");

    expect(rpcFn).toHaveBeenCalledWith("get_institution_stats", { p_institution_id: "inst-123" });
    expect(result).toEqual(mockData);
  });

  // 6C.2 — getSummaryStats failure path
  it("throws InternalServerErrorException when RPC fails", async () => {
    const rpcFn = vi.fn().mockResolvedValue({ data: null, error: { message: "RPC failed" } });
    const client = { rpc: rpcFn };

    const service = new AnalyticsService(client as never);

    await expect(service.getSummaryStats("inst-123")).rejects.toBeInstanceOf(
      InternalServerErrorException
    );
  });
});
