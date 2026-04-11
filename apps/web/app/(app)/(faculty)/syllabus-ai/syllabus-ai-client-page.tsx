"use client";

import { SyllabusAiClient } from '@/components/ai/syllabus-analysis-client';
import { useInstitution } from "@/hooks/use-institution";
import { Spinner } from "@examcraft/ui";

export function SyllabusAiClientPage() {
  const { institutionId, isLoading } = useInstitution();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner />
      </div>
    );
  }

  return <SyllabusAiClient institutionId={institutionId || ""} />;
}
