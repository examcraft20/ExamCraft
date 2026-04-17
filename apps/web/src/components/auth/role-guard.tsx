"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter, redirect } from "next/navigation";
import { getSupabaseBrowserSession } from "@/lib/supabase-browser";
import { Spinner } from "@examcraft/ui";

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: string[];
}

interface UserMetadata {
  roles?: string[];
  role?: string;
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      try {
        const session = await getSupabaseBrowserSession();
        
        if (!isMounted) return;

        if (!session) {
          console.warn('RoleGuard: No session found, redirecting to login');
          router.push("/login"); // router.push is safer for non-throwing behavior if desired, but redirect is requested
          return;
        }

        const user = session.user;
        const metadata = (user.app_metadata || {}) as UserMetadata;
        
        // 1. Check Metadata
        const myRoles = (Array.isArray(metadata.roles) 
          ? metadata.roles 
          : metadata.role ? [metadata.role] : []) as string[];
        
        const isSuperAdmin = myRoles.includes('super_admin');
        const hasMetadataRole = myRoles.some(r => allowedRoles.includes(r));
        
        if (isSuperAdmin || hasMetadataRole) {
          setIsAuthorized(true);
          setIsLoading(false);
          return;
        }

        // 2. If no role in metadata, check institution context from API if institutionId is in URL
        const searchParams = new URLSearchParams(window.location.search);
        const urlInstitutionId = searchParams.get("institutionId") || searchParams.get("institution_id");

        if (urlInstitutionId) {
          const { apiRequest } = await import("../../lib/api/client");
          try {
            const response = await apiRequest<{ institutionContext: { roleCodes: string[] } }>("/institution/context", {
              method: "GET",
              accessToken: session.access_token,
              institutionId: urlInstitutionId,
            });

            if (!isMounted) return;

            const roleCodes = response.institutionContext?.roleCodes || [];
            const hasAllowedRole = roleCodes.some((r: string) => allowedRoles.includes(r));
            
            if (hasAllowedRole) {
              setIsAuthorized(true);
              setIsLoading(false);
              return;
            }
          } catch (err) {
            console.error('RoleGuard: API context check failed:', err);
          }
        }

        // If we get here, they are not authorized
        if (isMounted) {
          redirect("/unauthorized");
        }
      } catch (error) {
        console.error("RoleGuard: Auth check failed with exception:", error);
        if (isMounted) {
          redirect("/unauthorized");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void checkAuth();
    return () => { isMounted = false; };
  }, [allowedRoles, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] w-full">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" className="w-12 h-12 text-indigo-500" />
          <p className="text-slate-400 animate-pulse text-sm font-medium">Verifying access permissions...</p>
        </div>
      </div>
    );
  }

  return isAuthorized ? <>{children}</> : null;
}
