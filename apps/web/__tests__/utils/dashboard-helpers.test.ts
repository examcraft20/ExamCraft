import { describe, it, expect } from "vitest";
import { resolvePrimaryRole, formatRoleName, getRoleSummary } from "../../lib/dashboard";

describe("Dashboard Utilities", () => {
  describe("resolvePrimaryRole", () => {
    it("returns super_admin when present", () => {
      const roles = ["faculty", "super_admin", "institution_admin"];
      expect(resolvePrimaryRole(roles)).toBe("super_admin");
    });

    it("returns institution_admin as highest when super_admin absent", () => {
      const roles = ["faculty", "institution_admin", "academic_head"];
      expect(resolvePrimaryRole(roles)).toBe("institution_admin");
    });

    it("returns academic_head when higher roles absent", () => {
      const roles = ["faculty", "academic_head"];
      expect(resolvePrimaryRole(roles)).toBe("academic_head");
    });

    it("returns reviewer_approver when only lower roles present", () => {
      const roles = ["faculty", "reviewer_approver"];
      expect(resolvePrimaryRole(roles)).toBe("reviewer_approver");
    });

    it("returns faculty as lowest priority role", () => {
      const roles = ["faculty"];
      expect(resolvePrimaryRole(roles)).toBe("faculty");
    });

    it("returns null for empty role array", () => {
      expect(resolvePrimaryRole([])).toBe(null);
    });

    it("returns null for undefined/unrecognized roles", () => {
      const roles = ["unknown_role", "invalid_role"];
      expect(resolvePrimaryRole(roles)).toBe(null);
    });

    it("prioritizes super_admin over all other roles", () => {
      const roles = ["faculty", "institution_admin", "super_admin", "academic_head"];
      expect(resolvePrimaryRole(roles)).toBe("super_admin");
    });
  });

  describe("formatRoleName", () => {
    it("converts snake_case to Title Case", () => {
      expect(formatRoleName("super_admin")).toBe("Super Admin");
    });

    it("converts single word roles", () => {
      expect(formatRoleName("faculty")).toBe("Faculty");
    });

    it("handles multiple underscores", () => {
      expect(formatRoleName("institution_admin")).toBe("Institution Admin");
    });

    it("handles reviewer_approver correctly", () => {
      expect(formatRoleName("reviewer_approver")).toBe("Reviewer Approver");
    });

    it("handles academic_head correctly", () => {
      expect(formatRoleName("academic_head")).toBe("Academic Head");
    });

    it("preserves capitalization for first letters", () => {
      const result = formatRoleName("test_role_name");
      expect(result).toBe("Test Role Name");
      expect(result[0]).toEqual(result[0].toUpperCase());
    });
  });

  describe("getRoleSummary", () => {
    it("returns summary for super_admin role", () => {
      const summary = getRoleSummary("super_admin");
      expect(summary.title).toBe("Platform control center");
      expect(summary.description).toContain("Monitor tenants");
    });

    it("returns summary for institution_admin role", () => {
      const summary = getRoleSummary("institution_admin");
      expect(summary.title).toBe("Institution operations hub");
      expect(summary.description).toContain("Manage users");
    });

    it("returns summary for academic_head role", () => {
      const summary = getRoleSummary("academic_head");
      expect(summary.title).toBe("Academic oversight workspace");
      expect(summary.description).toContain("Review question quality");
    });

    it("returns summary for reviewer_approver role", () => {
      const summary = getRoleSummary("reviewer_approver");
      expect(summary.title).toBe("Review and approval desk");
      expect(summary.description).toContain("Evaluate submitted papers");
    });

    it("returns summary for faculty role", () => {
      const summary = getRoleSummary("faculty");
      expect(summary.title).toBe("Faculty authoring workspace");
      expect(summary.description).toContain("Create questions");
    });

    it("all summaries have title and description", () => {
      const roles = ["super_admin", "institution_admin", "academic_head", "reviewer_approver", "faculty"] as const;
      roles.forEach((role) => {
        const summary = getRoleSummary(role);
        expect(summary).toHaveProperty("title");
        expect(summary).toHaveProperty("description");
        expect(summary.title.length).toBeGreaterThan(0);
        expect(summary.description.length).toBeGreaterThan(0);
      });
    });
  });
});
