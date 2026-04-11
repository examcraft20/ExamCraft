import { AuthenticatedUser } from "../types/authenticated-request";

export type ContentReviewEntry = {
  action: string;
  comment?: string;
  reviewedAt: string;
  reviewedByUserId: string;
  reviewedByRoles: string[];
};

export function readReviewComment(metadata: Record<string, unknown> | null) {
  if (!metadata || typeof metadata !== "object") {
    return null;
  }
  return typeof metadata.reviewComment === "string" ? metadata.reviewComment : null;
}

export function readReviewHistory(metadata: Record<string, unknown> | null): ContentReviewEntry[] {
  if (
    !metadata ||
    typeof metadata !== "object" ||
    !Array.isArray(metadata.reviewHistory)
  ) {
    return [];
  }

  return (metadata.reviewHistory as any[]).map((record) => ({
    action: record.action,
    comment: record.comment,
    reviewedAt: record.reviewedAt,
    reviewedByUserId: record.reviewedByUserId,
    reviewedByRoles: record.reviewedByRoles || [],
  }));
}

export function buildNextMetadata(
  metadata: Record<string, unknown> | null,
  currentUser: AuthenticatedUser,
  payload: { action: string; comment?: string },
) {
  const currentMetadata = metadata && typeof metadata === "object" ? metadata : {};
  const reviewHistory = readReviewHistory(currentMetadata);
  const reviewEntry: ContentReviewEntry = {
    action: payload.action,
    reviewedAt: new Date().toISOString(),
    reviewedByUserId: currentUser.id,
    reviewedByRoles: currentUser.roleCodes,
  };

  if (payload.comment) {
    reviewEntry.comment = payload.comment;
  }

  return {
    ...currentMetadata,
    reviewComment: payload.comment ?? readReviewComment(currentMetadata),
    reviewHistory: [reviewEntry, ...reviewHistory].slice(0, 10),
  };
}
