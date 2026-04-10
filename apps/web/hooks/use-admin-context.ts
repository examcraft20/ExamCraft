"use client";

/**
 * useAdminContext
 * Resolves the accessToken + institutionId for institution_admin sub-pages.
 * Priority: URL search param → localStorage → Supabase DB via useInstitution hook
 */

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowserSession } from "../lib/supabase-browser";

export function useAdminContext() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const spInstId = searchParams.get("institutionId");

  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [institutionId, setInstitutionId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function init() {
      // Resolve institutionId: URL param first, then localStorage
      const localId =
        typeof window !== "undefined"
          ? localStorage.getItem("examcraft_institution_id")
          : null;
      const instId = spInstId || localId;

      if (instId && mounted) setInstitutionId(instId);

      // Get session
      const session = await getSupabaseBrowserSession();
      if (!mounted) return;

      if (!session?.access_token) {
        router.replace("/login");
        return;
      }

      setAccessToken(session.access_token);
      setIsReady(true);
    }

    void init();
    return () => {
      mounted = false;
    };
  }, [spInstId, router]);

  return { accessToken, institutionId, isReady };
}
