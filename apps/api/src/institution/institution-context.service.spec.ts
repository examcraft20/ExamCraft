import { describe, expect, it, vi } from "vitest";
import { InstitutionContextService } from "./institution-context.service";

describe("InstitutionContextService", () => {
  it("deduplicates permission codes when resolving institution context", async () => {
    const from = vi
      .fn()
      .mockImplementationOnce(() => ({
        select: () => ({
          eq: () => ({
            eq: () => ({
              eq: () => ({
                single: async () => ({
                  data: {
                    id: "institution-user-1",
                    institution_id: "institution-1",
                    institution_user_roles: [
                      { role_id: "role-1", roles: { code: "faculty" } },
                      { role_id: "role-2", roles: { code: "academic_head" } }
                    ]
                  },
                  error: null
                })
              })
            })
          })
        })
      }))
      .mockImplementationOnce(() => ({
        select: () => ({
          in: () => ({
            returns: async () => ({
              data: [
                { permissions: { code: "questions.create" } },
                { permissions: { code: "questions.create" } },
                { permissions: { code: "templates.create" } }
              ],
              error: null
            })
          })
        })
      }));

    const service = new InstitutionContextService({ from } as never);
    const result = await service.resolveForUser("user-1", "institution-1");

    expect(result.roleCodes).toEqual(["faculty", "academic_head"]);
    expect(result.permissionCodes).toEqual(["questions.create", "templates.create"]);
  });
});
