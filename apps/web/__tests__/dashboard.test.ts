import { describe, expect, it } from "vitest";
import { formatRoleName, resolvePrimaryRole, getRoleSummary } from "../lib/dashboard";

describe("dashboard role helpers", () => {
  it("prioritizes super admin over institution roles", () => {
    expect(resolvePrimaryRole(["faculty", "super_admin", "institution_admin"])).toBe("super_admin");
  });

  it("prioritizes institution admin over faculty", () => {
    expect(resolvePrimaryRole(["faculty", "institution_admin"])).toBe("institution_admin");
  });

  it("returns null for empty role codes", () => {
    expect(resolvePrimaryRole([])).toBe(null);
  });

  it("returns null for unrecognized roles", () => {
    expect(resolvePrimaryRole(["unknown_role"])).toBe(null);
  });

  it("formats snake case role labels for UI", () => {
    expect(formatRoleName("reviewer_approver")).toBe("Reviewer Approver");
  });

  it("formats single word roles", () => {
    expect(formatRoleName("faculty")).toBe("Faculty");
  });

  it("formats multiple underscores", () => {
    expect(formatRoleName("academic_head")).toBe("Academic Head");
  });

  it("returns correct summary for super_admin", () => {
    const summary = getRoleSummary("super_admin");
    expect(summary.title).toBe("Platform control center");
    expect(summary.description).toContain("Monitor tenants");
  });

  it("returns correct summary for institution_admin", () => {
    const summary = getRoleSummary("institution_admin");
    expect(summary.title).toBe("Institution operations hub");
    expect(summary.description).toContain("Manage users");
  });

  it("returns correct summary for faculty", () => {
    const summary = getRoleSummary("faculty");
    expect(summary.title).toBe("Question crafting studio");
    expect(summary.description).toContain("Create and manage questions");
  });
});
