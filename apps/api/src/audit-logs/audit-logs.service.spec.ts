import { InternalServerErrorException } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";
import { AuditLogsService } from "./audit-logs.service";
import { AuditAction } from "./audit-action.enum";

describe("AuditLogsService", () => {
  it("6B.1 — createAuditLog resolves without error on success", async () => {
    const insertFn = vi.fn().mockResolvedValue({ error: null });
    const mockFrom = vi.fn(() => ({ insert: insertFn }));
    const client = { from: mockFrom };

    const service = new AuditLogsService(client as never);

    await expect(
      service.createAuditLog({
        institutionId: "inst-1",
        userId: "user-1",
        action: AuditAction.QUESTION_CREATED,
        resourceType: "institution_questions",
        resourceId: "q-1",
        metadata: { title: "Test Q" },
      }),
    ).resolves.toBeUndefined();

    expect(mockFrom).toHaveBeenCalledWith("institution_audit_logs");
  });

  it("6B.2 — createAuditLog swallows Supabase error without throwing", async () => {
    const mockFrom = vi.fn(() => ({
      insert: vi.fn().mockResolvedValue({ error: { message: "DB down" } }),
    }));
    const client = { from: mockFrom };

    const service = new AuditLogsService(client as never);

    await expect(
      service.createAuditLog({
        institutionId: "inst-1",
        userId: "user-1",
        action: AuditAction.PAPER_CREATED,
        resourceType: "institution_papers",
      }),
    ).resolves.toBeUndefined();
  });

  it("6B.3 — listAuditLogs returns data on success", async () => {
    const mockData = [{ id: "log-1", action: "QUESTION_CREATED" }];
    const mockFrom = vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() =>
              Promise.resolve({ data: mockData, error: null }),
            ),
          })),
        })),
      })),
    }));
    const client = { from: mockFrom };

    const service = new AuditLogsService(client as never);
    const result = await service.listAuditLogs({
      institutionId: "inst-abc",
    } as any);

    expect(result).toEqual(mockData);
  });

  it("6B.4 — listAuditLogs throws InternalServerErrorException on DB error", async () => {
    const mockFrom = vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() =>
              Promise.resolve({ data: null, error: { message: "fail" } }),
            ),
          })),
        })),
      })),
    }));
    const client = { from: mockFrom };

    const service = new AuditLogsService(client as never);

    await expect(
      service.listAuditLogs({ institutionId: "inst-abc" } as any),
    ).rejects.toBeInstanceOf(InternalServerErrorException);
  });
});
