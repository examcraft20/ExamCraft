"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Spinner } from "@examcraft/ui";
import { getSupabaseBrowserSession } from "@/lib/supabase-browser";
import { apiRequest } from "@/lib/api/client";
import type { InstitutionContextResponse } from "@/lib/dashboard";

const ALLOWED_ROLES = ["faculty", "academic_head", "institution_admin", "super_admin"];

export default function FacultyLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function validateAccess() {
      const session = await getSupabaseBrowserSession();
      if (!isMounted) return;

      if (!session?.access_token) {
        router.replace("/login");
        return;
      }

      // Check current institution
      const institutionId = searchParams.get("institutionId") || localStorage.getItem("examcraft_institution_id");

      if (!institutionId) {
        // Just let them view components that don't STRICTLY need institution without erroring
        setIsValidating(false);
        return;
      }

      try {
        const ctx = await apiRequest<InstitutionContextResponse>("/institution/context", {
          method: "GET",
          accessToken: session.access_token,
          institutionId: institutionId,
        });

        if (!isMounted) return;

        const hasRole = ctx.institutionContext.roleCodes.some((r) => ALLOWED_ROLES.includes(r));

        if (!hasRole) {
          router.replace("/");
          return;
        }

        setIsValidating(false);
      } catch (err) {
        if (isMounted) {
          console.error("Faculty role validation failed", err);
          // Don't strongly block on network failure if already authenticated to avoid breaking UX
          setIsValidating(false); 
        }
      }
    }

    void validateAccess();
    return () => { isMounted = false; };
  }, [router, searchParams]);

  if (isValidating) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <Spinner size="lg" className="text-indigo-500" />
      </div>
    );
  }

  return <div className="flex flex-col gap-8">{children}</div>;
}
