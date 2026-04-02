import { InternalServerErrorException } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";
import { InvitationService } from "./invitation.service";

describe("InvitationService", () => {
  it("deletes a created auth user when invite acceptance fails after account creation", async () => {
    const deleteUser = vi.fn().mockResolvedValue({});
    const createUser = vi.fn().mockResolvedValue({
      data: {
        user: {
          id: "new-user-id"
        }
      },
      error: null
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
                expires_at: new Date(Date.now() + 60_000).toISOString()
              },
              error: null
            })
          })
        })
      }))
      .mockImplementationOnce(() => ({
        select: () => ({
          eq: () => ({
            single: async () => ({
              data: null,
              error: {
                message: "missing role"
              }
            })
          })
        })
      }));

    const service = new InvitationService({
      from,
      auth: {
        admin: {
          createUser,
          deleteUser
        }
      }
    } as never);

    await expect(
      service.acceptInvitation({
        token: "valid-token",
        password: "Password123!"
      })
    ).rejects.toBeInstanceOf(InternalServerErrorException);

    expect(deleteUser).toHaveBeenCalledWith("new-user-id");
  });
});
