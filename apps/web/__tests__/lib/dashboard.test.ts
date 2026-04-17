import { describe, it, expect } from "vitest";
import { resolvePrimaryRole, formatRoleName, getRoleSummary } from "../../lib/dashboard";

describe("Dashboard Library Utilities", () => {
  it("resolves the primary role correctly according to priority", () => {
    // Priority order: super_admin, institution_admin, academic_head, reviewer_approver, faculty
    expect(resolvePrimaryRole(["faculty", "super_admin"])).toBe("super_admin");
    expect(resolvePrimaryRole(["academic_head", "faculty"])).toBe("academic_head");
    expect(resolvePrimaryRole(["faculty", "reviewer_approver"])).toBe("reviewer_approver");
    expect(resolvePrimaryRole(["unknown_role"])).toBeNull();
    expect(resolvePrimaryRole([])).toBeNull();
  });

  it("formats role names nicely", () => {
    expect(formatRoleName("super_admin")).toBe("Super Admin");
    expect(formatRoleName("academic_head")).toBe("Academic Head");
    expect(formatRoleName("faculty")).toBe("Faculty");
  });

  it("returns correct role summaries", () => {
    const summary = getRoleSummary("institution_admin");
    expect(summary.title).toBe("Institution operations hub");
    expect(summary.description).toContain("Manage users");
  });
});
