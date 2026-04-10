"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { notFound, useRouter } from "next/navigation";
import { Spinner } from "@examcraft/ui";
import { RoleDashboard } from "@/components/dashboard/shared/role-dashboard";
import type { AppRole } from "@/lib/dashboard";
import {
  resolvePrimaryRole,
  AuthMeResponse,
  TenantContextResponse,
} from "@/lib/dashboard";
import { getSupabaseBrowserSession } from "@/lib/supabase-browser";
import { apiRequest } from "#api";

const supportedRoles: AppRole[] = [
  "super_admin",
  "institution_admin",
  "academic_head",
  "reviewer_approver",
  "faculty",
];

export default function RoleDashboardPage({
  params,
  searchParams,
}: {
  params: { role: string };
  searchParams: { institutionId?: string };
}) {
  const router = useRouter();
  const institutionId = searchParams.institutionId ?? null;
  const [isValidating, setIsValidating] = useState(true);
  const [isInvalidRole, setIsInvalidRole] = useState(false);

  useEffect(() => {
    if (!supportedRoles.includes(params.role as AppRole)) {
      setIsInvalidRole(true);
      return;
    }
  }, [params.role]);

  if (isInvalidRole) {
    notFound();
  }

  const validateRole = useCallback(async () => {
    const session = await getSupabaseBrowserSession();
    if (!session?.access_token) {
      router.replace("/login");
      return;
    }

    try {
      if (params.role === "super_admin") {
        const authResponse = await apiRequest<AuthMeResponse>("/auth/me", {
          method: "GET",
          accessToken: session.access_token,
        });
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

      const contextResponse = await apiRequest<TenantContextResponse>(
        "/tenant/context",
        {
          method: "GET",
          accessToken: session.access_token,
          institutionId: institutionId,
        },
      );

      const actualRole = resolvePrimaryRole(
        contextResponse.tenantContext.roleCodes,
      );

      if (!actualRole || actualRole !== params.role) {
        router.replace("/unauthorized");
      } else {
        setIsValidating(false);
      }
    } catch (error) {
      router.replace("/unauthorized");
    }
  }, [params.role, institutionId, router]);

  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      validateRole();
    }
    return () => {
      isMounted = false;
    };
  }, [validateRole]);

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
