import { describe, it, expect } from "vitest";
import { extractErrorMessage } from "../../lib/error-utils";

describe("extractErrorMessage", () => {
  it("extracts message from Error objects", () => {
    const error = new Error("Test error message");
    expect(extractErrorMessage(error)).toBe("Test error message");
  });

  it("handles string errors", () => {
    const error = "Simple string error";
    expect(extractErrorMessage(error)).toBe("Simple string error");
  });

  it("stringifies object errors", () => {
    const error = { message: "Object error", code: 500 };
    expect(extractErrorMessage(error)).toBe('{"message":"Object error","code":500}');
  });

  it("returns default message for circular references", () => {
    const circularObj = { name: "test" } as any;
    circularObj.self = circularObj;
    expect(extractErrorMessage(circularObj)).toBe("An unexpected error occurred");
  });

  it("handles undefined errors", () => {
    expect(extractErrorMessage(undefined)).toBe("undefined");
  });

  it("handles null errors", () => {
    expect(extractErrorMessage(null)).toBe("null");
  });

  it("handles TypeError objects", () => {
    const error = new TypeError("Type mismatch");
    expect(extractErrorMessage(error)).toBe("Type mismatch");
  });

  it("handles custom error instances", () => {
    class CustomError extends Error {
      constructor(message: string) {
        super(message);
        this.name = "CustomError";
      }
    }
    const error = new CustomError("Custom error occurred");
    expect(extractErrorMessage(error)).toBe("Custom error occurred");
  });
});
