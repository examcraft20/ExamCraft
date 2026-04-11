"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Spinner } from "@examcraft/ui";
import { getSupabaseBrowserSession } from "../../../../lib/supabase-browser";
import { apiRequest } from "../../../../lib/api";
import { DepartmentOverviewContent } from "../../../../components/head/DepartmentOverviewContent";
import type { TenantContextResponse } from "../../../../lib/dashboard";

export default function AcademicHeadOverviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const institutionId = searchParams.get("institutionId");
  const [isValidating, setIsValidating] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function validateAccess() {
      const session = await getSupabaseBrowserSession();

      if (!isMounted) return;

      if (!session?.access_token) {
        router.replace("/login");
        return;
      }

      if (!institutionId) {
        router.replace("/dashboard");
        return;
      }

      try {
        const contextResponse = await apiRequest<TenantContextResponse>("/tenant/context", {
          method: "GET",
          accessToken: session.access_token,
          institutionId: institutionId
        });

        if (!isMounted) return;

        // Check if user has academic_head role
        const hasAcademicHeadRole = contextResponse.tenantContext.roleCodes?.includes("academic_head");

        if (!hasAcademicHeadRole) {
          router.replace("/unauthorized");
          return;
        }

        setAccessToken(session.access_token);
        setIsValidating(false);
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to validate access");
          setIsValidating(false);
        }
      }
    }

    void validateAccess();
    return () => { isMounted = false; };
  }, [institutionId, router]);

  if (isValidating) {
    return (
      <section className="flex flex-col items-center justify-center p-20 gap-6">
        <Spinner size="lg" className="w-14 h-14" />
        <span className="text-zinc-500 font-black uppercase tracking-[0.4em] text-[10px] animate-pulse">
          Validating Access
        </span>
      </section>
    );
  }

  if (error || !accessToken || !institutionId) {
    return (
      <section className="flex flex-col items-center justify-center p-20 gap-6">
        <div className="text-red-400 text-center">
          <p className="font-bold">Access Error</p>
          <p className="text-sm text-zinc-500">{error || "Unable to load department overview"}</p>
        </div>
      </section>
    );
  }

  return (
    <DepartmentOverviewContent
      accessToken={accessToken}
      institutionId={institutionId}
    />
  );
}
