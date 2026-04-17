"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BarChart2 } from "lucide-react";
import { getSupabaseBrowserSession } from "@/lib/supabase-browser";
import { apiRequest } from "@/lib/api/client";
import { AnalyticsDashboard } from '@/components/analytics/dashboard';
import type { InstitutionContextResponse } from "@/lib/dashboard";

const ALLOWED_ROLES = ["academic_head", "institution_admin", "super_admin"];

export default function AnalyticsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const institutionId = searchParams.get("institutionId");

  const [isValidating, setIsValidating] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [resolvedInstitutionId, setResolvedInstitutionId] = useState<string | null>(null);
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

      // Resolve institution from query param or localStorage
      const instId =
        institutionId ||
        (typeof window !== "undefined"
          ? localStorage.getItem("examcraft_institution_id")
          : null);

      if (!instId) {
        router.replace("/dashboard");
        return;
      }

      try {
        const ctx = await apiRequest<InstitutionContextResponse>("/institution/context", {
          method: "GET",
          accessToken: session.access_token,
          institutionId: instId,
        });

        if (!isMounted) return;

        const hasRole = ctx.institutionContext.roleCodes.some((r) =>
          ALLOWED_ROLES.includes(r)
        );

        if (!hasRole) {
          router.replace("/");
          return;
        }

        setAccessToken(session.access_token);
        setResolvedInstitutionId(instId);
        setIsValidating(false);
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Access validation failed.");
          setIsValidating(false);
        }
      }
    }

    void validateAccess();
    return () => {
      isMounted = false;
    };
  }, [institutionId, router]);

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (isValidating) {
    return (
      <section className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center animate-pulse"
          style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)" }}
        >
          <BarChart2 size={24} className="text-white" />
        </div>
        <span
          className="text-[10px] font-black uppercase tracking-[0.4em] animate-pulse"
          style={{ color: "#475569" }}
        >
          Loading Analytics
        </span>
      </section>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────────
  if (error || !accessToken || !resolvedInstitutionId) {
    return (
      <section className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div
          className="px-6 py-4 rounded-xl text-center max-w-md"
          style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.2)",
            color: "#f87171",
          }}
        >
          <p className="font-bold">Access Error</p>
          <p className="text-sm mt-1 opacity-75">
            {error || "Unable to load analytics dashboard."}
          </p>
        </div>
      </section>
    );
  }

  // ── Dashboard ─────────────────────────────────────────────────────────────────
  return (
    <div className="px-4 md:px-8 py-6">
      <AnalyticsDashboard
        accessToken={accessToken}
        institutionId={resolvedInstitutionId}
      />
    </div>
  );
}
