import { BadRequestException, InternalServerErrorException } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";
import { InvitationService } from "./invitation.service";

/** Helper that creates a minimal Supabase `from()` returning a chain ending in `.single()` */
function singleReturning(data: any, error: any = null) {
  return vi.fn().mockReturnValue({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data, error }),
  });
}

const mockMailer = () => ({
  sendFacultyInvite: vi.fn().mockResolvedValue(undefined),
  sendPaperSubmittedForReview: vi.fn(),
  sendPaperReviewed: vi.fn(),
});

// ── Original test ───────────────────────────────────────────────────────────

describe("InvitationService — acceptInvitation", () => {
  it("cleans up created auth user when acceptance fails after account creation", async () => {
    const deleteUser = vi.fn().mockResolvedValue({});
    const createUser = vi.fn().mockResolvedValue({
      data: { user: { id: "new-user-id" } },
      error: null,
    });

    const from = vi
      .fn()
      .mockImplementationOnce(() => ({
        select: () => ({
          eq: () => ({
            single: async () => ({
              data: {
                id: "invite-id",
                institution_id: "institution-1",
                email: "faculty@example.com",
                role_code: "faculty",
                status: "pending",
                expires_at: new Date(Date.now() + 60_000).toISOString(),
              },
              error: null,
            }),
          }),
        }),
      }))
      .mockImplementationOnce(() => ({
        select: () => ({
          eq: () => ({
            single: async () => ({ data: null, error: { message: "missing role" } }),
          }),
        }),
      }));

    const service = new InvitationService(
      { from, auth: { admin: { createUser, deleteUser } } } as never,
      mockMailer() as never
    );

    await expect(
      service.acceptInvitation({ token: "valid-token", password: "Password123!" })
    ).rejects.toBeInstanceOf(InternalServerErrorException);

    expect(deleteUser).toHaveBeenCalledWith("new-user-id");
  });

  // 6C.1 — Expired invite is rejected before creating a user
  it("6C.1 — rejects an expired invitation before calling createUser", async () => {
    const createUser = vi.fn();
    const from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          id: "invite-id",
          institution_id: "inst-1",
          email: "expired@test.com",
          role_code: "faculty",
          status: "pending",
          expires_at: new Date(Date.now() - 1_000).toISOString(), // already expired
        },
        error: null,
      }),
    });

    const service = new InvitationService(
      { from, auth: { admin: { createUser, deleteUser: vi.fn() } } } as never,
      mockMailer() as never
    );

    await expect(
      service.acceptInvitation({ token: "expired-token", password: "Pass123!" })
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(createUser).not.toHaveBeenCalled();
  });

  // 6C.2 — Non-pending invitation is rejected
  it("6C.2 — rejects an already-accepted invitation with BadRequestException", async () => {
    const from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          id: "invite-id",
          institution_id: "inst-1",
          email: "already@test.com",
          role_code: "faculty",
          status: "accepted", // not pending
          expires_at: new Date(Date.now() + 60_000).toISOString(),
        },
        error: null,
      }),
    });

    const service = new InvitationService(
      { from, auth: { admin: { createUser: vi.fn(), deleteUser: vi.fn() } } } as never,
      mockMailer() as never
    );

    await expect(
      service.acceptInvitation({ token: "used-token", password: "Pass123!" })
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});

// ── Duplicate invite prevention ─────────────────────────────────────────────

describe("InvitationService — createInvitation", () => {
  // 6C.3 — Supabase unique constraint error maps to InternalServerErrorException
  it("6C.3 — throws when DB reports a conflict (duplicate invite)", async () => {
    const from = vi.fn().mockReturnValue({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: null,
        error: { message: "duplicate key value violates unique constraint" },
      }),
    });

    const service = new InvitationService(
      { from, auth: { admin: {} } } as never,
      mockMailer() as never
    );

    const tenantCtx = { institutionId: "inst-1", roleCodes: ["institution_admin"], permissionCodes: [] };

    await expect(
      service.createInvitation(tenantCtx as any, "admin-user-id", {
        institutionId: "inst-1",
        email: "duplicate@test.com",
        roleCode: "faculty",
      })
    ).rejects.toBeInstanceOf(InternalServerErrorException);
  });
});

