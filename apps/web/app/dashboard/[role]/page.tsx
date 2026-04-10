"use client";

import { Suspense, useEffect, useState } from "react";
import { notFound, useRouter, useSearchParams } from "next/navigation";
import { Spinner } from "@examcraft/ui";
import { RoleDashboard } from "../../../components/dashboard/shared/role-dashboard";
import type { AppRole } from "../../../lib/dashboard";
import { resolvePrimaryRole, AuthMeResponse, TenantContextResponse } from "../../../lib/dashboard";
import { getSupabaseBrowserSession } from "../../../lib/supabase-browser";
import { apiRequest } from "#api";

const supportedRoles: AppRole[] = [
  "super_admin",
  "institution_admin",
  "academic_head",
  "reviewer_approver",
  "faculty"
];

export default function RoleDashboardPage({ params }: { params: { role: string } }) {
  if (!supportedRoles.includes(params.role as AppRole)) {
    notFound();
  }

  const router = useRouter();
  const searchParams = useSearchParams();
  const institutionId = searchParams.get("institutionId");
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function validateRole() {
      const session = await getSupabaseBrowserSession();
      if (!isMounted) return;
      if (!session?.access_token) {
        router.replace("/login");
        return;
      }

      try {
        if (params.role === "super_admin") {
          const authResponse = await apiRequest<AuthMeResponse>("/auth/me", {
            method: "GET",
            accessToken: session.access_token
          });
          if (!isMounted) return;
          if (!authResponse.user?.isSuperAdmin) {
            router.replace("/unauthorized");
          } else {
            setIsValidating(false);
          }
          return;
        }

        if (!institutionId) {
          router.replace("/dashboard");
          return;
        }

        const contextResponse = await apiRequest<TenantContextResponse>("/tenant/context", {
          method: "GET",
          accessToken: session.access_token,
          institutionId: institutionId
        });

        if (!isMounted) return;

        const actualRole = resolvePrimaryRole(contextResponse.tenantContext.roleCodes);
        
        if (!actualRole || actualRole !== params.role) {
          router.replace("/unauthorized");
        } else {
          setIsValidating(false);
        }
      } catch (error) {
        if (isMounted) router.replace("/unauthorized");
      }
    }
    void validateRole();
    return () => { isMounted = false; };
  }, [params.role, institutionId, router]);

  if (isValidating) {
    return (
      <section className="flex flex-col items-center justify-center p-20 gap-6">
        <Spinner size="lg" className="w-14 h-14" />
        <span className="text-zinc-500 font-black uppercase tracking-[0.4em] text-[10px] animate-pulse">
          Validating Security Clearance
        </span>
      </section>
    );
  }

  return (
    <Suspense
      fallback={
        <section className="dashboard-loading-card flex flex-col items-center justify-center p-20 gap-6">
          <Spinner />
          <span>Loading role dashboard...</span>
        </section>
      }
    >
      <RoleDashboard role={params.role as AppRole} />
    </Suspense>
  );
}
