import { describe, expect, it } from "vitest";
import { formatRoleName, resolvePrimaryRole } from "./dashboard";

describe("dashboard role helpers", () => {
  it("prioritizes super admin over institution roles", () => {
    expect(resolvePrimaryRole(["faculty", "super_admin", "institution_admin"])).toBe("super_admin");
  });

  it("formats snake case role labels for UI", () => {
    expect(formatRoleName("reviewer_approver")).toBe("Reviewer Approver");
  });
});
