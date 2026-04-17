"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

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

        // 1. We ONLY trust the server for resolution; client cache is untrusted
        const { getSupabaseBrowserClient } = await import("../lib/supabase-browser");

        const supabase = getSupabaseBrowserClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!isMounted) return;
        
        if (user?.id) {
          let query = supabase
            .from('institution_users')
            .select(`
              institution_id,
              institutions (
                name
              )
            `)
            .eq('user_id', user.id)
            .eq('status', 'active');
            
          if (urlInstId) {
            query = query.eq('institution_id', urlInstId);
          }
          
          const { data: memberData } = await query.limit(1).maybeSingle();
            
          const typedMemberData = memberData as {
            institution_id: string;
            institutions: { name: string } | null;
          } | null;
            
          if (isMounted && typedMemberData?.institution_id) {
            setInstitutionId(typedMemberData.institution_id);
            localStorage.setItem('examcraft_institution_id', typedMemberData.institution_id);
            
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
  }, [urlInstId]);

  return { institutionId, institutionName, isLoading };
}
