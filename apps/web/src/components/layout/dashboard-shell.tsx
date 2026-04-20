"use client";

import { ReactNode, Suspense, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { DashboardSidebar } from "./dashboard-sidebar";
import { ErrorBoundary } from "@/components/error-boundary";
import { Spinner } from "@examcraft/ui";
import { getSupabaseBrowserSession } from "@/lib/supabase-browser";
import { Menu, X } from "lucide-react";

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    return () => {
      isMounted = false;
    };
  }, [pathname]);

  // Close mobile menu when navigating
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  if (!isAuthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <DashboardLoading />
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#02040a] text-zinc-100 selection:bg-indigo-500/30 overflow-hidden relative">
      {/* Cinematic Ambient Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[35%] h-[35%] rounded-full bg-blue-500/5 blur-[100px]" />
      </div>

      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-white/5 bg-[#0f152d]/80 backdrop-blur-md relative z-40">
         <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                EC
             </div>
             <span className="font-bold tracking-tight text-white">ExamCraft</span>
         </div>
         <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="p-2 rounded-lg bg-white/5 text-white hover:bg-white/10 transition-colors"
         >
           {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
         </button>
      </div>

      <div className="flex flex-1 overflow-hidden relative z-10 w-full">
        {/* Sidebar container with mobile slide-in */}
        <div className={`
          fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        `}>
          <DashboardSidebar />
        </div>
        
        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        <main className="flex-1 w-full min-w-0 relative flex flex-col h-full md:h-screen overflow-hidden">
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 lg:p-10 custom-scrollbar">
            <ErrorBoundary>
              <Suspense fallback={<DashboardLoading />}>{children}</Suspense>
            </ErrorBoundary>
          </div>
        </main>
      </div>

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
