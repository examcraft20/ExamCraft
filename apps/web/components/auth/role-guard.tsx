"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserSession } from "@/lib/supabase-browser";
import { Spinner } from "@examcraft/ui";

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: string[];
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const router = useRouter();
  const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const urlInstitutionId = searchParams?.get("institutionId") || searchParams?.get("institution_id");

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const { getSupabaseBrowserClient, getSupabaseBrowserSession } = await import("@/lib/supabase-browser");
        const session = await getSupabaseBrowserSession();
        
        if (!session) {
          console.warn('RoleGuard: No session found, redirecting to login');
          router.push("/login");
          return;
        }

        const user: any = session.user;
        
        // 1. Check Metadata (Fastest)
        let role = (user?.app_metadata?.role || user?.user_metadata?.role) as string;
        console.log('RoleGuard: Current user metadata role:', role);
        
        // 2. API Fallback (More reliable for multi-tenant roles)
        if (!role || !allowedRoles.includes(role)) {
          if (!urlInstitutionId) {
            console.warn('RoleGuard: Metadata role insufficient and no institutionId in URL');
            if (role !== 'super_admin') {
              router.push("/unauthorized");
              return;
            }
          } else {
            const { apiRequest } = await import("../../lib/api/client");

            console.log('RoleGuard: Metadata role insufficient, checking API context...');
            
            try {
              const response = await apiRequest<any>("/institution/context", {
                method: "GET",
                accessToken: session.access_token,
                institutionId: urlInstitutionId,
              });

              const roleCodes = response.institutionContext?.roleCodes || [];
              console.log('RoleGuard: Found API role codes:', roleCodes);
              
              const hasAllowedRole = roleCodes.some((r: string) => allowedRoles.includes(r));
              
              if (!hasAllowedRole && role !== 'super_admin') {
                console.warn(`RoleGuard: User role codes [${roleCodes.join(',')}] do not include any of [${allowedRoles.join(',')}] for institution ${urlInstitutionId}`);
                router.push("/unauthorized");
                return;
              }
            } catch (err) {
              console.error('RoleGuard: API context check failed:', err);
              if (role !== 'super_admin') {
                router.push("/unauthorized");
                return;
              }
            }
          }
        }

        console.log('RoleGuard: Authorization successful');
        setIsAuthorized(true);
      } catch (error) {
        console.error("RoleGuard: Auth check failed with exception:", error);
        router.push("/unauthorized");
      } finally {
        setIsLoading(false);
      }
    }

    void checkAuth();
  }, [router, allowedRoles]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" className="w-12 h-12" />
      </div>
    );
  }

  return isAuthorized ? <>{children}</> : null;
}
