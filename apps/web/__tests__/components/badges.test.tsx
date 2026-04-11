import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RoleBadge, StatusBadge } from "@examcraft/ui";

describe("RoleBadge Component", () => {
  it("renders with correct role text", () => {
    render(<RoleBadge role="faculty" />);
    expect(screen.getByText("Faculty")).toBeInTheDocument();
  });

  it("formats snake_case roles to Title Case", () => {
    render(<RoleBadge role="institution_admin" />);
    expect(screen.getByText("Institution Admin")).toBeInTheDocument();
  });

  it("renders with super_admin styling", () => {
    const { container } = render(<RoleBadge role="super_admin" />);
    const badge = container.firstChild;
    expect(badge).toHaveClass("inline-flex");
    expect(badge).toHaveClass("rounded-full");
  });

  it("renders with fallback styling for unknown roles", () => {
    const { container } = render(<RoleBadge role="unknown_role" />);
    const badge = container.firstChild as HTMLSpanElement;
    expect(badge.className).toContain("slate-500");
  });

  it("renders with correct badge structure", () => {
    const { container } = render(<RoleBadge role="faculty" />);
    const badge = container.querySelector("span");
    expect(badge).toHaveClass("inline-flex");
    expect(badge).toHaveClass("items-center");
    expect(badge).toHaveClass("px-2.5");
    expect(badge).toHaveClass("py-0.5");
    expect(badge).toHaveClass("rounded-full");
    expect(badge).toHaveClass("text-xs");
    expect(badge).toHaveClass("font-medium");
    expect(badge).toHaveClass("border");
  });
});

describe("StatusBadge Component", () => {
  it("renders status text correctly", () => {
    render(<StatusBadge status="draft" />);
    expect(screen.getByText("draft")).toBeInTheDocument();
  });

  it("converts underscores to spaces in status display", () => {
    render(<StatusBadge status="in_review" />);
    expect(screen.getByText("in review")).toBeInTheDocument();
  });

  it("uses custom label when provided", () => {
    render(<StatusBadge status="draft" label="Draft Version" />);
    expect(screen.getByText("Draft Version")).toBeInTheDocument();
    expect(screen.queryByText("draft")).not.toBeInTheDocument();
  });

  it("renders with fallback styling for unknown status", () => {
    const { container } = render(<StatusBadge status="unknown_status" />);
    const badge = container.firstChild as HTMLSpanElement;
    expect(badge.className).toContain("slate-500");
  });

  it("applies capitalize class", () => {
    const { container } = render(<StatusBadge status="published" />);
    const badge = container.querySelector("span");
    expect(badge).toHaveClass("capitalize");
  });

  it("handles multiple underscores", () => {
    render(<StatusBadge status="ready_for_approval" />);
    expect(screen.getByText("ready for approval")).toBeInTheDocument();
  });
});
