"use client";

import { PaperGenerator } from "@/components/dashboard/faculty/paper-generator";
import { useInstitution } from "@/hooks/use-institution";
import { Spinner } from "@examcraft/ui";

export function NewPaperPageClient() {
  const { institutionId, isLoading } = useInstitution();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner />
      </div>
    );
  }

  return <PaperGenerator institutionId={institutionId || ""} />;
}
