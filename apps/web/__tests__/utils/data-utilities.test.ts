import { describe, it, expect } from "vitest";

describe("Data Type Guards and Validators", () => {
  describe("Is Valid UUID", () => {
    const isValidUUID = (uuid: string): boolean => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      return uuidRegex.test(uuid);
    };

    it("validates correct UUIDs", () => {
      expect(isValidUUID("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
      expect(isValidUUID("123e4567-e89b-12d3-a456-426614174000")).toBe(true);
    });

    it("rejects invalid UUIDs", () => {
      expect(isValidUUID("not-a-uuid")).toBe(false);
      expect(isValidUUID("12345678-1234-1234-1234-12345678")).toBe(false);
    });

    it("case-insensitive UUID validation", () => {
      expect(isValidUUID("550E8400-E29B-41D4-A716-446655440000")).toBe(true);
    });
  });

  describe("Date Validation", () => {
    const isValidDate = (dateString: string): boolean => {
      const date = new Date(dateString);
      return date instanceof Date && !isNaN(date.getTime());
    };

    it("validates ISO date strings", () => {
      expect(isValidDate("2026-04-11T00:00:00Z")).toBe(true);
      expect(isValidDate("2026-04-11")).toBe(true);
    });

    it("rejects invalid date strings", () => {
      expect(isValidDate("invalid-date")).toBe(false);
      expect(isValidDate("2026-13-01")).toBe(false);
    });

    it("validates current date", () => {
      expect(isValidDate(new Date().toISOString())).toBe(true);
    });
  });

  describe("Number Validation", () => {
    const isValidNumber = (value: any): value is number => {
      return typeof value === "number" && !isNaN(value) && isFinite(value);
    };

    it("validates real numbers", () => {
      expect(isValidNumber(42)).toBe(true);
      expect(isValidNumber(3.14)).toBe(true);
      expect(isValidNumber(0)).toBe(true);
      expect(isValidNumber(-100)).toBe(true);
    });

    it("rejects invalid numbers", () => {
      expect(isValidNumber(NaN)).toBe(false);
      expect(isValidNumber(Infinity)).toBe(false);
      expect(isValidNumber("42")).toBe(false);
      expect(isValidNumber(null)).toBe(false);
    });
  });

  describe("Array Validation", () => {
    const isNonEmptyArray = (value: any): value is any[] => {
      return Array.isArray(value) && value.length > 0;
    };

    it("validates non-empty arrays", () => {
      expect(isNonEmptyArray([1, 2, 3])).toBe(true);
      expect(isNonEmptyArray(["a"])).toBe(true);
    });

    it("rejects empty arrays", () => {
      expect(isNonEmptyArray([])).toBe(false);
    });

    it("rejects non-array values", () => {
      expect(isNonEmptyArray("string")).toBe(false);
      expect(isNonEmptyArray(42)).toBe(false);
      expect(isNonEmptyArray(null)).toBe(false);
    });
  });

  describe("Object Validation", () => {
    const hasProperty = (obj: any, prop: string): boolean => {
      return Object.prototype.hasOwnProperty.call(obj, prop);
    };

    const isObjectEmpty = (obj: any): boolean => {
      return Object.keys(obj).length === 0;
    };

    it("checks for object properties", () => {
      expect(hasProperty({ name: "test" }, "name")).toBe(true);
      expect(hasProperty({ name: "test" }, "id")).toBe(false);
    });

    it("detects empty objects", () => {
      expect(isObjectEmpty({})).toBe(true);
      expect(isObjectEmpty({ name: "test" })).toBe(false);
    });

    it("differentiates between null and object", () => {
      expect(typeof null).toBe("object");
      expect(isObjectEmpty(null)).toBe(false); // Since null.keys() throws
    });
  });
});

describe("Data Transformation Utilities", () => {
  describe("Capitalize First Letter", () => {
    const capitalize = (str: string): string => {
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    it("capitalizes first letter", () => {
      expect(capitalize("hello")).toBe("Hello");
      expect(capitalize("WORLD")).toBe("World");
    });

    it("handles single character", () => {
      expect(capitalize("a")).toBe("A");
    });

    it("handles empty string", () => {
      expect(capitalize("")).toBe("");
    });
  });

  describe("Truncate String", () => {
    const truncate = (str: string, maxLength: number): string => {
      return str.length > maxLength ? str.slice(0, maxLength) + "..." : str;
    };

    it("truncates long strings", () => {
      expect(truncate("This is a very long string", 10)).toBe("This is a ...");
    });

    it("leaves short strings unchanged", () => {
      expect(truncate("Hi", 10)).toBe("Hi");
    });

    it("handles exact length", () => {
      expect(truncate("12345", 5)).toBe("12345");
    });
  });

  describe("Parse Query Parameters", () => {
    const parseQuery = (queryString: string): Record<string, string> => {
      const params = new URLSearchParams(queryString);
      const result: Record<string, string> = {};
      params.forEach((value, key) => {
        result[key] = value;
      });
      return result;
    };

    it("parses query string", () => {
      const result = parseQuery("name=John&age=30");
      expect(result.name).toBe("John");
      expect(result.age).toBe("30");
    });

    it("handles empty query string", () => {
      const result = parseQuery("");
      expect(Object.keys(result).length).toBe(0);
    });
  });

  describe("Merge Objects", () => {
    const mergeObjects = (...objs: Record<string, any>[]): Record<string, any> => {
      return Object.assign({}, ...objs);
    };

    it("merges multiple objects", () => {
      const result = mergeObjects({ a: 1 }, { b: 2 }, { c: 3 });
      expect(result).toEqual({ a: 1, b: 2, c: 3 });
    });

    it("later objects override earlier ones", () => {
      const result = mergeObjects({ a: 1 }, { a: 2 });
      expect(result.a).toBe(2);
    });
  });
});

describe("Filtering and Sorting Utilities", () => {
  describe("Filter By Property", () => {
    const filterByProperty = <T extends Record<string, any>>(
      items: T[],
      property: keyof T,
      value: any
    ): T[] => {
      return items.filter((item) => item[property] === value);
    };

    it("filters items by property value", () => {
      const items = [
        { id: 1, status: "active" },
        { id: 2, status: "inactive" },
        { id: 3, status: "active" }
      ];
      const result = filterByProperty(items, "status", "active");
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
    });

    it("returns empty array when no matches", () => {
      const items = [{ id: 1, status: "active" }];
      const result = filterByProperty(items, "status", "pending");
      expect(result).toHaveLength(0);
    });
  });

  describe("Sort By Property", () => {
    const sortByProperty = <T extends Record<string, any>>(
      items: T[],
      property: keyof T,
      ascending = true
    ): T[] => {
      return [...items].sort((a, b) => {
        const aVal = a[property];
        const bVal = b[property];
        return ascending ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
      });
    };

    it("sorts items ascending", () => {
      const items = [{ name: "Charlie" }, { name: "Alice" }, { name: "Bob" }];
      const result = sortByProperty(items, "name");
      expect(result[0].name).toBe("Alice");
      expect(result[1].name).toBe("Bob");
      expect(result[2].name).toBe("Charlie");
    });

    it("sorts items descending", () => {
      const items = [{ id: 1 }, { id: 3 }, { id: 2 }];
      const result = sortByProperty(items, "id", false);
      expect(result[0].id).toBe(3);
      expect(result[2].id).toBe(1);
    });
  });
});
