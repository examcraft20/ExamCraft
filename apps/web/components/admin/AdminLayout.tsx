"use client";

import { ReactNode, useEffect, useState } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { Button, Spinner } from "@examcraft/ui";
import { LogOut, Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseBrowserSession } from "@/lib/supabase-browser";
import { apiRequest } from "@/lib/api";
import type { AuthMeResponse } from "@/lib/dashboard";

type AdminLayoutProps = {
  children: ReactNode;
};

export function AdminLayout({ children }: AdminLayoutProps) {
  const [user, setUser] = useState<{ email?: string; name?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isValidating, setIsValidating] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const validateAndLoadUser = async () => {
      try {
        // Step 1: Get Supabase session
        const session = await getSupabaseBrowserSession();
        if (!isMounted) return;

        if (!session?.access_token) {
          router.replace("/login");
          return;
        }

        // Step 2: Validate super_admin role
        const authResponse = await apiRequest<AuthMeResponse>("/auth/me", {
          method: "GET",
          accessToken: session.access_token
        });

        if (!isMounted) return;

        // Step 3: Check if user is super admin
        if (!authResponse.user?.isSuperAdmin) {
          router.replace("/unauthorized");
          return;
        }

        // Step 4: Load user info for display
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data: { user: supabaseUser } } = await supabase.auth.getUser();
        if (isMounted && supabaseUser) {
          setUser({
            email: supabaseUser.email,
            name: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split("@")[0]
          });
          setIsValidating(false);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Admin validation error:", error);
          router.replace("/unauthorized");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    validateAndLoadUser();
    return () => { isMounted = false; };
  }, [router]);

  const handleLogout = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await supabase.auth.signOut();
    router.push("/");
  };

  // Show loading screen while validating role
  if (isValidating) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#050505]">
        <div className="flex flex-col items-center gap-6">
          <Spinner size="lg" className="text-[#a5b4fc]" />
          <p className="text-slate-400 font-bold tracking-tight animate-pulse">Establishing Secure Connection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#050505]">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden relative">
        {/* Background Ambient Glow */}
        <div className="absolute top-[-20%] right-[-10%] w-[1000px] h-[1000px] bg-gradient-to-br from-[#4f46e5]/10 via-[#7c3aed]/5 to-transparent blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[10%] w-[800px] h-[800px] bg-gradient-to-tr from-[#3b82f6]/10 via-[#4f46e5]/5 to-transparent blur-[120px] rounded-full pointer-events-none" />

        {/* TopBar */}
        <div className="sticky top-0 z-40 flex items-center justify-between border-b border-white/[0.05] bg-[#050505]/70 px-10 py-5 backdrop-blur-2xl">
          {/* Global Search Mockup */}
          <div className="flex-1 max-w-md relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-[#4f46e5]/20 to-[#7c3aed]/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative flex items-center bg-white/[0.02] border border-white/[0.05] rounded-2xl px-4 py-2.5 hover:bg-white/[0.04] transition-colors cursor-text group-hover:border-white/10">
              <svg className="w-5 h-5 text-slate-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-sm font-medium text-slate-500">Search globally...</span>
              <div className="ml-auto flex items-center gap-1.5">
                <kbd className="hidden sm:inline-block px-2 py-1 text-[10px] font-bold text-slate-400 bg-black/40 border border-white/10 rounded-md">⌘</kbd>
                <kbd className="hidden sm:inline-block px-2 py-1 text-[10px] font-bold text-slate-400 bg-black/40 border border-white/10 rounded-md">K</kbd>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 ml-auto">
            {/* Notifications */}
            <button className="relative p-3 rounded-xl bg-white/[0.02] border border-white/5 text-slate-400 hover:text-white hover:bg-white/5 hover:border-white/10 transition-all outline-none group focus-visible:ring-2 focus-visible:ring-[#4f46e5]/50">
              <Bell size={20} className="group-hover:rotate-12 transition-transform duration-300" />
              <span className="absolute top-2.5 right-3 w-2 h-2 bg-[#7c3aed] shadow-[0_0_12px_rgba(124,58,237,1)] rounded-full animate-pulse" />
            </button>

            {/* Profile */}
            {!isLoading && user && (
              <div className="flex items-center pl-6 border-l border-white/[0.05]">
                <div className="flex items-center gap-4 group cursor-pointer hover:bg-white/[0.02] p-2 pr-4 rounded-full transition-colors border border-transparent hover:border-white/[0.05]">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#7c3aed] to-[#3b82f6] rounded-full blur-[6px] opacity-60 group-hover:opacity-100 transition-opacity" />
                    <div className="relative h-11 w-11 rounded-full bg-gradient-to-tr from-[#7c3aed] to-[#3b82f6] p-[2px] shadow-glow-indigo">
                      <div className="h-full w-full rounded-full bg-[#050505] flex items-center justify-center">
                        <span className="text-base font-black text-white">{user.name?.charAt(0).toUpperCase()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-sm font-black text-white tracking-tight group-hover:text-[#a5b4fc] transition-colors">{user.name}</p>
                    <p className="text-[10px] text-[#818cf8] font-black uppercase tracking-[0.2em] mt-0.5 opacity-80">Super Admin</p>
                  </div>
                </div>
                
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  className="ml-4 p-3 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all"
                  title="Logout"
                >
                  <LogOut size={20} />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto relative z-10 scrollbar-hide">
          <div className="p-10 max-w-[1600px] mx-auto w-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
