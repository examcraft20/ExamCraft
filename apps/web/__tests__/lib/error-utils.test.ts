import { describe, it, expect } from "vitest";
import { extractErrorMessage } from "@/lib/error-utils";

describe("extractErrorMessage", () => {
  it("should extract message from Error objects", () => {
    const error = new Error("Something went wrong");
    expect(extractErrorMessage(error)).toBe("Something went wrong");
  });

  it("should return string errors as-is", () => {
    expect(extractErrorMessage("Network timeout")).toBe("Network timeout");
  });

  it("should stringify unknown error types", () => {
    expect(extractErrorMessage({ code: 500, detail: "Internal" })).toBe(
      '{"code":500,"detail":"Internal"}',
    );
  });

  it("should handle number errors", () => {
    expect(extractErrorMessage(404)).toBe("404");
  });

  it("should return fallback message for unstringifiable values", () => {
    // Circular reference can't be stringified
    const circular: any = {};
    circular.self = circular;
    expect(extractErrorMessage(circular)).toBe("An unexpected error occurred");
  });

  it("should handle null errors", () => {
    expect(extractErrorMessage(null)).toBe("null");
  });

  it("should handle undefined errors", () => {
    expect(extractErrorMessage(undefined)).toBeUndefined();
  });

  it("should handle boolean errors", () => {
    expect(extractErrorMessage(false)).toBe("false");
  });
});
