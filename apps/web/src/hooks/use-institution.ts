"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { getSupabaseBrowserSession } from "@/lib/supabase-browser";

export function useInstitution() {
  const searchParams = useSearchParams();
  const urlInstId = searchParams.get("institutionId") || searchParams.get("institution_id");

  const [institutionId, setInstitutionId] = useState<string | null>(null);
  const [institutionName, setInstitutionName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadInstitution() {
      try {
        // 1. URL has highest priority
        if (urlInstId) {
          if (isMounted) {
            setInstitutionId(urlInstId);
            const cachedName = localStorage.getItem("examcraft_institution_name");
            if (cachedName) setInstitutionName(cachedName);
            localStorage.setItem("examcraft_institution_id", urlInstId);
          }
          // We can optionally fetch to get the proper name, but let's proceed for speed
        } else {
          // 2. Check local storage if no URL query
          const cachedId = localStorage.getItem("examcraft_institution_id");
          const cachedName = localStorage.getItem("examcraft_institution_name");
          if (cachedId && isMounted) {
            setInstitutionId(cachedId);
            if (cachedName) setInstitutionName(cachedName);
          }
        }

        // 3. To be absolutely safe and fresh, if we don't have the ID fetched, let's fetch memberships
        // (We do this to handle cases where localStorage is cleared, and URL has no ID)
        const session = await getSupabaseBrowserSession();
        if (!isMounted || !session?.access_token) return;

        const memberships = await apiRequest<any[]>("/institution/memberships", {
          method: "GET",
          accessToken: session.access_token,
        }).catch(() => null);

        if (isMounted && memberships && memberships.length > 0) {
          // If we had a preferred ID, try to find it in memberships to get the updated name
          const currentId = urlInstId || localStorage.getItem("examcraft_institution_id");
          let targetMembership = memberships.find((m) => m.institution_id === currentId);

          // If no preferred ID or not found in memberships, default to the first one
          if (!targetMembership) {
            targetMembership = memberships[0];
          }

          if (targetMembership) {
            setInstitutionId(targetMembership.institution_id);
            localStorage.setItem("examcraft_institution_id", targetMembership.institution_id);

            const name = targetMembership.institutions?.name;
            if (name) {
              setInstitutionName(name);
              localStorage.setItem("examcraft_institution_name", name);
            }
          }
        }
      } catch (e) {
        console.error("Failed to load institution", e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadInstitution();
    return () => {
      isMounted = false;
    };
  }, [urlInstId]);

  return { institutionId, institutionName, isLoading };
}
