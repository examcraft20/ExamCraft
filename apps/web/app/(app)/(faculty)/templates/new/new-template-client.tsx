"use client";

import { TemplateBuilder } from '@/components/templates/builder';
import { useInstitution } from "@/hooks/use-institution";
import { Spinner } from "@examcraft/ui";

export function NewTemplatePageClient() {
  const { institutionId, isLoading } = useInstitution();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner />
      </div>
    );
  }

  return <TemplateBuilder institutionId={institutionId || ""} />;
}
