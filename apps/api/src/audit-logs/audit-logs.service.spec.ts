import { InternalServerErrorException, NotFoundException, BadRequestException } from "@nestjs/common";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { AuditLogsService } from "./audit-logs.service";
import { AuditAction } from "./audit-action.enum";

const makeMockClient = (overrides: any = {}) => ({
  from: vi.fn(() => ({
    insert: vi.fn(() => Promise.resolve({ error: null })),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
    ...overrides.chain,
  })),
  ...overrides,
});

describe("AuditLogsService", () => {
  // 6B.1 — createAuditLog success path
  it("inserts a row and resolves without error on success", async () => {
    const insertFn = vi.fn().mockResolvedValue({ error: null });
    const client = {
      from: vi.fn(() => ({ insert: insertFn })),
    };

    const service = new AuditLogsService(client as never);

    await expect(
      service.createAuditLog({
        institutionId: "inst-1",
        userId: "user-1",
        action: AuditAction.QUESTION_CREATED,
        resourceType: "institution_questions",
        resourceId: "q-1",
        metadata: { title: "Test Q" },
      })
    ).resolves.toBeUndefined();

    expect(client.from).toHaveBeenCalledWith("audit_logs");
    expect(insertFn).toHaveBeenCalledWith(
      expect.objectContaining({
        institution_id: "inst-1",
        user_id: "user-1",
        action: AuditAction.QUESTION_CREATED,
        resource_type: "institution_questions",
        resource_id: "q-1",
      })
    );
  });

  // 6B.2 — createAuditLog swallows Supabase error without throwing
  it("swallows a Supabase error without throwing", async () => {
    const client = {
      from: vi.fn(() => ({
        insert: vi.fn().mockResolvedValue({ error: { message: "DB down" } }),
      })),
    };

    const service = new AuditLogsService(client as never);

    await expect(
      service.createAuditLog({
        institutionId: "inst-1",
        userId: "user-1",
        action: AuditAction.PAPER_CREATED,
        resourceType: "institution_papers",
      })
    ).resolves.toBeUndefined(); // must NOT throw
  });

  // 6B.3 — listAuditLogs filters by institution_id
  it("listAuditLogs queries with the correct institution_id", async () => {
    const limitFn = vi.fn().mockResolvedValue({ data: [{ id: "log-1" }], error: null });
    const orderFn = vi.fn().mockReturnValue({ limit: limitFn });
    const eqFn = vi.fn().mockReturnValue({ order: orderFn });
    const selectFn = vi.fn().mockReturnValue({ eq: eqFn });
    const client = { from: vi.fn(() => ({ select: selectFn })) };

    const service = new AuditLogsService(client as never);
    const result = await service.listAuditLogs({ institutionId: "inst-abc" } as any);

    expect(eqFn).toHaveBeenCalledWith("institution_id", "inst-abc");
    expect(result).toEqual([{ id: "log-1" }]);
  });

  // 6B.4 — listAuditLogs throws on DB error
  it("listAuditLogs throws InternalServerErrorException on DB error", async () => {
    const limitFn = vi.fn().mockResolvedValue({ data: null, error: { message: "fail" } });
    const orderFn = vi.fn().mockReturnValue({ limit: limitFn });
    const eqFn = vi.fn().mockReturnValue({ order: orderFn });
    const selectFn = vi.fn().mockReturnValue({ eq: eqFn });
    const client = { from: vi.fn(() => ({ select: selectFn })) };

    const service = new AuditLogsService(client as never);

    await expect(
      service.listAuditLogs({ institutionId: "inst-abc" } as any)
    ).rejects.toBeInstanceOf(InternalServerErrorException);
  });
});
