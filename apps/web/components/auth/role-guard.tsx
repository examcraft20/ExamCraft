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
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const session = await getSupabaseBrowserSession();
        if (!session) {
          router.push("/login");
          return;
        }

        const user = session.user;
        const role = (user && 'user_metadata' in user ? user.user_metadata?.role : undefined) as string;
        if (!role || !allowedRoles.includes(role)) {
          router.push("/unauthorized");
          return;
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error("Auth check failed:", error);
        router.push("/login");
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
