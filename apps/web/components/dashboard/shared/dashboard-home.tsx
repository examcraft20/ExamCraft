"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { apiRequest } from "#api";
import {
  AuthMeResponse,
  MembershipSummary,
  TenantContextResponse,
  formatRoleName,
  getRoleSummary,
  resolvePrimaryRole
} from "../../../lib/dashboard";
import { getSupabaseBrowserSession } from "../../../lib/supabase-browser";
import { 
  LayoutDashboard, 
  LogIn, 
  Plus, 
  Building2, 
  Globe, 
  UserRound, 
  ChevronRight,
  ShieldCheck,
  Zap,
  Sparkles,
  ArrowUpRight
} from "lucide-react";
import { Button, Card, StatusMessage, Skeleton } from "@examcraft/ui";

type SessionState = {
  accessToken: string;
  email?: string;
  roleCodes: string[];
  isSuperAdmin: boolean;
};

export function DashboardHome() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preferredInstitutionId = searchParams.get("institutionId");
  const [sessionState, setSessionState] = useState<SessionState | null>(null);
  const [memberships, setMemberships] = useState<MembershipSummary[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpeningInstitutionId, setIsOpeningInstitutionId] = useState<string | null>(null);
  const [errorOccurred, setErrorOccurred] = useState(false);

  const autoSelectedMembership = useMemo(() => {
    if (!preferredInstitutionId) {
      return memberships.length === 1 ? memberships[0] : null;
    }
    return memberships.find((membership) => membership.institutionId === preferredInstitutionId) ?? null;
  }, [memberships, preferredInstitutionId]);

  useEffect(() => {
    let isMounted = true;
    async function loadDashboardState() {
      const session = await getSupabaseBrowserSession();
      if (!isMounted) return;
      if (!session?.access_token) {
        setSessionState(null);
        setIsLoading(false);
        return;
      }

      try {
        const [authResponse, membershipResponse] = await Promise.all([
          apiRequest<AuthMeResponse>("/auth/me", {
            method: "GET",
            accessToken: session.access_token
          }),
          apiRequest<MembershipSummary[]>("/tenant/memberships", {
            method: "GET",
            accessToken: session.access_token
          })
        ]);

        if (isMounted) {
          setSessionState({
            accessToken: session.access_token,
            email: authResponse.user?.email ?? session.user.email ?? undefined,
            roleCodes: authResponse.user?.roleCodes ?? [],
            isSuperAdmin: authResponse.user?.isSuperAdmin ?? false
          });
          setMemberships(membershipResponse);
        }
      } catch (error) {
        if (isMounted) {
          setStatus(error instanceof Error ? error.message : "Unable to load your institutions.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    void loadDashboardState();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (!sessionState?.isSuperAdmin || preferredInstitutionId || memberships.length > 0) return;
    router.replace("/dashboard/super_admin");
  }, [memberships.length, preferredInstitutionId, router, sessionState?.isSuperAdmin]);

  const openMembership = useCallback(
    async (membership: MembershipSummary) => {
      if (!sessionState) return;
      setIsOpeningInstitutionId(membership.institutionId);
      setStatus(null);
      setErrorOccurred(false);
      try {
        const response = await apiRequest<TenantContextResponse>("/tenant/context", {
          method: "GET",
          accessToken: sessionState.accessToken,
          institutionId: membership.institutionId
        });

        const resolvedRole = resolvePrimaryRole(response.tenantContext.roleCodes);
        if (!resolvedRole) throw new Error("No supported dashboard is available for your current roles.");
        router.push(`/dashboard/${resolvedRole}?institutionId=${encodeURIComponent(membership.institutionId)}`);
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Unable to open this institution.");
        setIsOpeningInstitutionId(null);
        setErrorOccurred(true);
      }
    },
    [router, sessionState]
  );

  useEffect(() => {
    if (!sessionState || !autoSelectedMembership || isOpeningInstitutionId || errorOccurred) return;
    void openMembership(autoSelectedMembership);
  }, [autoSelectedMembership, isOpeningInstitutionId, openMembership, sessionState, errorOccurred]);

  return (
    <div className="min-h-screen bg-black px-6 py-16 md:py-24">
      <div className="max-w-6xl mx-auto flex flex-col gap-12 relative">
        {/* Background ambient lighting */}
        <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-full h-[500px] bg-indigo-500/5 blur-[120px] pointer-events-none -z-10" />

      <header className="flex flex-col gap-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-2">
           <Globe size={10} /> Multi-Tenant Gateway
        </div>
        <h1 className="text-5xl font-black tracking-tighter text-white drop-shadow-2xl">
          Welcome back to <span className="text-indigo-400 italic">ExamCraft.</span>
        </h1>
        <p className="text-zinc-500 font-medium max-w-xl">
          Select an authorized institution below to enter your dedicated role workspace. Contextual security is applied upon entry.
        </p>
      </header>

      {status ? <StatusMessage variant="error" className="shadow-2xl">{status}</StatusMessage> : null}

      <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* State: Unauthorized */}
        {!isLoading && !sessionState && (
          <div className="col-span-full">
            <Card className="!bg-zinc-900 border-white/5 !rounded-[2.5rem] p-12 text-center flex flex-col items-center gap-6 shadow-2xl relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
               <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 mb-4 animate-bounce">
                  <LogIn size={32} />
               </div>
               <h2 className="text-3xl font-black tracking-tight text-white">Sign in to orchestrate</h2>
               <p className="text-zinc-500 max-w-md font-medium">Your role-based pedagogical dashboards become available immediately after identity verification.</p>
               <div className="flex gap-4 pt-4">
                  <Button onClick={() => router.push("/login")} className="bg-white text-black px-8 py-6 rounded-2xl font-black text-lg shadow-2xl hover:scale-105 active:scale-95 transition-all">Sign In Now</Button>
                  <Button variant="secondary" onClick={() => router.push("/onboarding")} className="px-8 py-6 rounded-2xl font-black text-lg">Setup Institution</Button>
               </div>
            </Card>
          </div>
        )}

        {/* State: Loading Skeletons */}
        {isLoading && [1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse flex flex-col gap-4 p-8 rounded-[2rem] bg-white/5 border border-white/5 h-[320px]">
             <div className="flex justify-between">
                <div className="w-24 h-4 bg-white/10 rounded-full" />
                <div className="w-12 h-6 bg-white/10 rounded-full" />
             </div>
             <div className="w-3/4 h-8 bg-white/10 rounded-xl" />
             <div className="flex-1" />
             <div className="flex gap-2">
                <div className="w-16 h-6 bg-white/10 rounded-full" />
                <div className="w-16 h-6 bg-white/10 rounded-full" />
             </div>
             <div className="w-full h-12 bg-white/10 rounded-xl" />
          </div>
        ))}

        {/* State: Super Admin Platform Nexus */}
        {!isLoading && sessionState?.isSuperAdmin && (
          <InstitutionCard
            isSuperAdmin
            name="ExamCraft Global Nexus"
            slug="global"
            type="platform"
            roleLines={["super_admin"]}
            onOpen={() => router.push("/dashboard/super_admin")}
          />
        )}

        {/* State: Institution Memberships */}
        {!isLoading && sessionState && memberships.map((membership) => (
          <InstitutionCard
            key={membership.institutionUserId}
            name={membership.institutionName}
            slug={membership.institutionSlug}
            type={membership.institutionType}
            roleLines={membership.roleCodes}
            isOpening={isOpeningInstitutionId === membership.institutionId}
            onOpen={() => void openMembership(membership)}
          />
        ))}

        {/* Empty State: No memberships */}
        {!isLoading && sessionState && memberships.length === 0 && !sessionState.isSuperAdmin && (
          <div className="col-span-full">
            <Card className="!bg-zinc-900 border-white/5 !rounded-[2.5rem] p-12 text-center flex flex-col items-center gap-6 shadow-2xl overflow-hidden group">
               <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px]" />
               <div className="w-16 h-16 rounded-3xl bg-indigo-600 flex items-center justify-center text-white mb-4 shadow-[0_0_40px_rgba(79,70,229,0.5)]">
                  <Plus size={32} />
               </div>
               <h2 className="text-3xl font-black tracking-tight text-white px-12">No active workspace memberships found.</h2>
               <p className="text-zinc-500 max-w-sm font-medium">Create a digital campus or accept an automated invitation from your coordinator to unlock your dashboard.</p>
               <div className="flex flex-wrap gap-4 pt-4 justify-center">
                  <Button onClick={() => router.push("/onboarding")} className="bg-indigo-600 text-white px-8 py-6 rounded-2xl font-black text-lg shadow-2xl hover:scale-105 active:scale-95 transition-all">Launch Institution</Button>
                  <Button variant="secondary" onClick={() => router.push("/invite")} className="px-8 py-6 rounded-2xl font-black text-lg hover:bg-white/10">Accept Invite</Button>
               </div>
            </Card>
          </div>
        )}
      </section>
      </div>
    </div>
  );
}

function InstitutionCard({ name, slug, type, roleLines, onOpen, isOpening, isSuperAdmin }: any) {
  return (
    <Card 
      onClick={!isOpening ? onOpen : undefined}
      className={`group relative p-8 !rounded-[2.5rem] !bg-zinc-900/50 border-white/5 hover:border-white/20 transition-all flex flex-col gap-8 h-[360px] cursor-pointer shadow-xl overflow-hidden ${isOpening ? "opacity-60 grayscale" : "hover:translate-y-[-4px]"}`}
    >
      {/* Dynamic Background Hover Glow */}
      <div className={`absolute inset-0 bg-gradient-to-br transition-opacity opacity-0 group-hover:opacity-100 ${isSuperAdmin ? "from-violet-500/10 via-transparent" : "from-indigo-500/10 via-transparent" } -z-10`} />

      <div className="flex justify-between items-start">
        <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">
           {type}
        </div>
        <div className="text-[10px] font-mono text-indigo-400 font-bold opacity-50 tracking-tighter">
           /{slug}
        </div>
      </div>

      <div className="flex flex-col gap-2">
         <h3 className="text-2xl font-black tracking-tight text-white group-hover:text-indigo-300 transition-colors">{name}</h3>
         <p className="text-zinc-500 text-xs font-medium leading-relaxed line-clamp-3">
            {isSuperAdmin ? "Manage global institution infrastructure and audit logs." : `Full access to orchestrate exam operations within the ${name} workspace.`}
         </p>
      </div>

      <div className="flex-1" />

      <div className="flex flex-wrap gap-2 mb-2">
         {roleLines.map((r: string) => (
           <span key={r} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-bold uppercase tracking-wider text-indigo-300">
              {r.replace("_", " ")}
           </span>
         ))}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-white/5 group-hover:border-white/10 transition-colors">
         <span className={`text-sm font-black uppercase tracking-widest ${isSuperAdmin ? "text-violet-400" : "text-white"}`}>
            {isOpening ? "Initializing..." : "Enter Workspace"}
         </span>
         <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isSuperAdmin ? "bg-violet-600 text-white" : "bg-white text-black group-hover:bg-indigo-600 group-hover:text-white"}`}>
            <ArrowUpRight size={20} strokeWidth={2.5} />
         </div>
      </div>
    </Card>
  );
}
