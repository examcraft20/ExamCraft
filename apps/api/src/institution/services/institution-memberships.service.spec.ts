import { InstitutionMembershipsService } from "./institution-memberships.service";

describe("InstitutionMembershipsService", () => {
  it("deduplicates permission codes when resolving institution context", async () => {
    const from = jest
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
                { role_id: "role-1", permissions: { code: "questions.create" } },
                { role_id: "role-1", permissions: { code: "questions.create" } },
                { role_id: "role-1", permissions: { code: "templates.create" } }
              ],
              error: null
            })
          })
        })
      }));

    const service = new InstitutionMembershipsService({ from } as never);
    const result = await service.resolveForUser("user-1", "institution-1");

    expect(result.roleCodes).toEqual(["faculty", "academic_head"]);
    expect(result.permissionCodes).toEqual(["questions.create", "templates.create"]);
  });
});
