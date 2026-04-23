import { describe, it, expect } from "vitest";
import {
  readReviewComment,
  readReviewHistory,
  buildNextMetadata,
} from "../../../api/src/common/utils/review.utils";

describe("review.utils", () => {
  describe("readReviewComment", () => {
    it("should return null when metadata is null", () => {
      expect(readReviewComment(null)).toBeNull();
    });

    it("should return null when reviewComment is not a string", () => {
      expect(readReviewComment({ reviewComment: 123 })).toBeNull();
    });

    it("should return the reviewComment string", () => {
      expect(readReviewComment({ reviewComment: "Needs improvement" })).toBe(
        "Needs improvement",
      );
    });
  });

  describe("readReviewHistory", () => {
    it("should return empty array when metadata is null", () => {
      expect(readReviewHistory(null)).toEqual([]);
    });

    it("should return empty array when reviewHistory is not an array", () => {
      expect(readReviewHistory({ reviewHistory: "not-array" })).toEqual([]);
    });

    it("should map review history entries with defaults", () => {
      const metadata = {
        reviewHistory: [
          {
            action: "approved",
            comment: "Looks good",
            reviewedAt: "2025-01-01T00:00:00Z",
            reviewedByUserId: "user-1",
            reviewedByRoles: ["academic_head"],
          },
        ],
      };

      const result = readReviewHistory(metadata);
      expect(result).toHaveLength(1);
      expect(result[0].action).toBe("approved");
      expect(result[0].comment).toBe("Looks good");
    });

    it("should use defaults for missing fields", () => {
      const metadata = {
        reviewHistory: [{}],
      };

      const result = readReviewHistory(metadata);
      expect(result[0].action).toBe("unknown");
      expect(result[0].reviewedByUserId).toBe("unknown");
      expect(result[0].reviewedByRoles).toEqual([]);
    });
  });

  describe("buildNextMetadata", () => {
    it("should build metadata with new review entry", () => {
      const result = buildNextMetadata(
        null,
        { id: "user-1", email: "test@test.com", roleCodes: ["faculty"], isSuperAdmin: false },
        { action: "approved", comment: "Great work" },
      );

      expect(result.reviewComment).toBe("Great work");
      expect(result.reviewHistory).toHaveLength(1);
      expect(result.reviewHistory[0].action).toBe("approved");
      expect(result.reviewHistory[0].reviewedByUserId).toBe("user-1");
    });

    it("should preserve existing metadata and prepend new entry", () => {
      const existing = {
        reviewComment: "Old comment",
        reviewHistory: [
          {
            action: "rejected",
            reviewedAt: "2025-01-01",
            reviewedByUserId: "user-2",
            reviewedByRoles: ["reviewer"],
          },
        ],
      };

      const result = buildNextMetadata(
        existing,
        { id: "user-1", email: "test@test.com", roleCodes: ["academic_head"], isSuperAdmin: false },
        { action: "approved" },
      );

      expect(result.reviewHistory).toHaveLength(2);
      expect(result.reviewHistory[0].action).toBe("approved");
      expect(result.reviewHistory[1].action).toBe("rejected");
    });

    it("should cap review history at 10 entries", () => {
      const existing = {
        reviewHistory: Array.from({ length: 12 }, (_, i) => ({
          action: "approved",
          reviewedAt: `2025-01-${i + 1}`,
          reviewedByUserId: `user-${i}`,
          reviewedByRoles: ["faculty"],
        })),
      };

      const result = buildNextMetadata(
        existing,
        { id: "user-1", email: "test@test.com", roleCodes: ["faculty"], isSuperAdmin: false },
        { action: "rejected" },
      );

      expect(result.reviewHistory.length).toBeLessThanOrEqual(10);
    });

    it("should preserve reviewComment when new action has no comment", () => {
      const existing = { reviewComment: "Keep this" };

      const result = buildNextMetadata(
        existing,
        { id: "user-1", email: "test@test.com", roleCodes: ["faculty"], isSuperAdmin: false },
        { action: "approved" },
      );

      expect(result.reviewComment).toBe("Keep this");
    });
  });
});
