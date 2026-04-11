"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const DEMO_INSTITUTION_ID = "inst-demo-1";
const DEMO_INSTITUTION_NAME = "Demo Institute of Technology";

function isDemoMode(): boolean {
  // Check the env var directly at runtime
  if (typeof window !== "undefined") {
    // In Next.js, NEXT_PUBLIC_ vars are inlined at compile time,
    // but we also check a runtime fallback
    try {
      return process.env.NEXT_PUBLIC_DEMO_MODE === "true";
    } catch {
      return false;
    }
  }
  return process.env.NEXT_PUBLIC_DEMO_MODE === "true";
}

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
        // 0. Use URL parameter if available (Highest Priority)
        if (urlInstId) {
          if (isMounted) {
            setInstitutionId(urlInstId);
            // We might not have the name yet, but setting ID is most important
            const cachedName = localStorage.getItem('examcraft_institution_name');
            if (cachedName) setInstitutionName(cachedName);
          }
        }
        // In demo mode, return the hardcoded demo institution immediately
        if (isDemoMode()) {
          if (isMounted) {
            setInstitutionId(DEMO_INSTITUTION_ID);
            setInstitutionName(DEMO_INSTITUTION_NAME);
            localStorage.setItem('examcraft_institution_id', DEMO_INSTITUTION_ID);
            localStorage.setItem('examcraft_institution_name', DEMO_INSTITUTION_NAME);
          }
          return;
        }

        // Try to get from localStorage first for fast render
        const cachedId = localStorage.getItem('examcraft_institution_id');
        const cachedName = localStorage.getItem('examcraft_institution_name');
        if (cachedId) {
          setInstitutionId(cachedId);
          if (cachedName) setInstitutionName(cachedName);
          setIsLoading(false);
        }

        // Dynamically import to avoid issues when supabase is not configured
        const { getSupabaseBrowserSession, getSupabaseBrowserClient } = await import("../lib/supabase-browser");

        const session = await getSupabaseBrowserSession();
        if (!isMounted) return;
        
        const user: any = session?.user;
        if (user?.id) {
          const supabase = getSupabaseBrowserClient();
          const { data: memberData } = await supabase
            .from('institution_users')
            .select(`
              institution_id,
              institutions (
                name
              )
            `)
            .eq('user_id', user.id)
            .eq('status', 'active')
            .limit(1)
            .maybeSingle();
            
          const typedMemberData = memberData as any;
            
          if (isMounted && typedMemberData?.institution_id) {
            setInstitutionId(typedMemberData.institution_id);
            localStorage.setItem('examcraft_institution_id', typedMemberData.institution_id);
            
            // @ts-ignore
            const name = typedMemberData.institutions?.name;
            if (name) {
              setInstitutionName(name);
              localStorage.setItem('examcraft_institution_name', name);
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
    return () => { isMounted = false; };
  }, []);

  return { institutionId, institutionName, isLoading };
}
