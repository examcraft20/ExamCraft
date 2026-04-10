"use client";

import { use } from "react";
import { useSearchParams } from "next/navigation";
import { PaperReviewPanel } from "@/components/dashboard/reviewer/paper-review-panel";

export default function PaperReviewPage({
  params
}: {
  params: Promise<{ paperId: string }>;
}) {
  const resolvedParams = use(params);
  const searchParams = useSearchParams();
  const institutionId = searchParams.get("institutionId") ?? "";

  return (
    <PaperReviewPanel
      paperId={resolvedParams.paperId}
      institutionId={institutionId}
    />
  );
}
