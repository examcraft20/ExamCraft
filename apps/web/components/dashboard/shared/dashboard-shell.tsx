"use client";

import { ReactNode, Suspense, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { DashboardSidebar } from "./dashboard-sidebar";
import { ErrorBoundary } from "../../error-boundary";
import { Spinner } from "@examcraft/ui";
import { getSupabaseBrowserSession } from "../../../lib/supabase-browser";

function DashboardLoading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Spinner size="lg" className="w-12 h-12" />
    </div>
  );
}

export function DashboardShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    let isMounted = true;
    getSupabaseBrowserSession().then((session) => {
      if (!isMounted) return;
      if (!session?.access_token && !session?.user?.email) {
        window.location.href = "/login";
      } else {
        setIsAuthorized(true);
      }
    });
    return () => { isMounted = false; };
  }, [pathname]);

  if (!isAuthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <DashboardLoading />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-black text-zinc-100 selection:bg-indigo-500/30 overflow-hidden">
      {/* Cinematic Ambient Background */}
      <div className="fixed inset-0 pointer-events-none -z-10 bg-[#02040a]">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[35%] h-[35%] rounded-full bg-blue-500/5 blur-[100px]" />
      </div>

      <DashboardSidebar />
      <main className="flex-1 w-full min-w-0 relative flex flex-col h-screen overflow-hidden">
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 lg:p-10 custom-scrollbar">
          <ErrorBoundary>
            <Suspense fallback={<DashboardLoading />}>
              {children}
            </Suspense>
          </ErrorBoundary>
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
}
