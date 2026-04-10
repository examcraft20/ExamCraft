"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { apiRequest } from "#api";
import { AcademicHeadWorkspace } from "../workspaces/academic-head-workspace";
import { FacultyWorkspace } from "../workspaces/faculty-workspace";
import { InstitutionAdminWorkspace } from "../workspaces/institution-admin-workspace";
import { ReviewerWorkspace } from "../workspaces/reviewer-workspace";
import { SuperAdminWorkspace } from "../workspaces/super-admin-workspace";
import {
  AppRole,
  AuthMeResponse,
  MembershipSummary,
  TenantContextResponse,
  formatRoleName,
  getRoleSummary,
  resolvePrimaryRole
} from "../../../lib/dashboard";
import { getSupabaseBrowserSession } from "../../../lib/supabase-browser";
import { Card, Spinner, StatusMessage } from "@examcraft/ui";
// CommandPalette is not yet implemented
function CommandPalette(_props: { institutionId: string | null }) { return null; }
import { 
  ArrowLeftRight, 
  Building2, 
  Command as CommandIcon, 
  ShieldCheck, 
  Sparkles, 
  UserCheck,
  ArrowRight
} from "lucide-react";

// ... existing imports ... (the tool handles this)

// I will just replace the relevant portions below


type RoleDashboardProps = {
  role: AppRole;
};

type SessionState = {
  accessToken: string;
  email?: string;
  roleCodes: string[];
  isSuperAdmin: boolean;
};

export function RoleDashboard({ role }: RoleDashboardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const institutionId = searchParams.get("institutionId");
  const [sessionState, setSessionState] = useState<SessionState | null>(null);
  const [membership, setMembership] = useState<MembershipSummary | null>(null);
  const [resolvedRole, setResolvedRole] = useState<AppRole | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const roleSummary = getRoleSummary(role);

  useEffect(() => {
    let isMounted = true;

    async function loadRoleDashboard() {
      if (role !== "super_admin" && !institutionId) {
        router.replace("/dashboard");
        return;
      }

      const session = await getSupabaseBrowserSession();
      if (!isMounted) return;

      if (!session?.access_token) {
        setIsLoading(false);
        setStatus("Please sign in to access this dashboard.");
        return;
      }

      try {
        const authResponse = await apiRequest<AuthMeResponse>("/auth/me", {
          method: "GET",
          accessToken: session.access_token
        });

        if (!isMounted) return;

        setSessionState({
          accessToken: session.access_token,
          email: authResponse.user?.email ?? session.user.email ?? undefined,
          roleCodes: authResponse.user?.roleCodes ?? [],
          isSuperAdmin: authResponse.user?.isSuperAdmin ?? false
        });

        if (role === "super_admin") {
          if (!authResponse.user?.isSuperAdmin) {
            setStatus("You do not have access to the platform dashboard.");
          } else {
            setResolvedRole("super_admin");
          }
          return;
        }

        const [membershipResponse, contextResponse] = await Promise.all([
          apiRequest<MembershipSummary[]>("/tenant/memberships", {
            method: "GET",
            accessToken: session.access_token
          }),
          apiRequest<TenantContextResponse>("/tenant/context", {
            method: "GET",
            accessToken: session.access_token,
            institutionId: institutionId ?? undefined
          })
        ]);

        if (!isMounted) return;

        const currentMembership = membershipResponse.find((item) => item.institutionId === institutionId) ?? null;
        const currentRole = resolvePrimaryRole(contextResponse.tenantContext.roleCodes);

        setMembership(currentMembership);
        setResolvedRole(currentRole);

        if (!currentRole) {
          setStatus("No supported dashboard is available for this institution membership.");
        } else if (currentRole !== role) {
          router.replace(`/dashboard/${currentRole}?institutionId=${encodeURIComponent(institutionId ?? "")}`);
          return;
        }
      } catch (error) {
        if (isMounted) setStatus(error instanceof Error ? error.message : "Unable to load the dashboard.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void loadRoleDashboard();
    return () => { isMounted = false; };
  }, [institutionId, role, router]);

  return (
    <div className="flex flex-col gap-10">
      {/* Prestige Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/5 relative">
        <div className="flex flex-col gap-2">
           <div className="flex items-center gap-3 mb-2">
              <div className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">
                {formatRoleName(role)}
              </div>
              {membership && (
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                   <Building2 size={12} strokeWidth={2.5} />
                   {membership.institutionName}
                </div>
              )}
           </div>
           <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-white drop-shadow-xl">{roleSummary.title}</h1>
           <p className="text-zinc-500 font-medium max-w-2xl">{roleSummary.description}</p>
        </div>

        <div className="flex items-center gap-3">
           <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 mr-4 group hover:border-indigo-500/30 transition-all cursor-help">
              <CommandIcon size={12} className="text-zinc-600 group-hover:text-indigo-400" />
              <span className="text-[10px] font-black text-zinc-600 group-hover:text-zinc-400 uppercase tracking-widest">K for Actions</span>
           </div>
           {sessionState?.email && (
             <div className="hidden lg:flex flex-col items-end mr-4">
                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Active Identity</span>
                <span className="text-xs font-bold text-white">{sessionState.email}</span>
             </div>
           )}
           <Link 
            href="/dashboard"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-white hover:bg-white/10 hover:border-white/20 transition-all group"
           >
             <ArrowLeftRight size={16} className="group-hover:rotate-180 transition-transform duration-500" />
             Switch Workspace
           </Link>
        </div>
      </header>

      {isLoading ? (
        <section className="flex flex-col items-center justify-center p-20 gap-6">
          <Spinner size="lg" className="w-14 h-14" />
          <span className="text-zinc-500 font-black uppercase tracking-[0.4em] text-[10px] animate-pulse">Synchronizing Workspace Shard</span>
        </section>
      ) : null}

      {status ? <StatusMessage variant="error" className="shadow-2xl">{status}</StatusMessage> : null}

      {!isLoading && !status && resolvedRole === role ? (
        <div className="flex flex-col gap-12">
          <section className="relative">
            {role === "super_admin" && sessionState ? (
              <SuperAdminWorkspace accessToken={sessionState.accessToken} />
            ) : null}

            {role === "institution_admin" && sessionState && institutionId ? (
              <InstitutionAdminWorkspace
                accessToken={sessionState.accessToken}
                institutionId={institutionId}
                membership={membership}
                institutionName={membership?.institutionName}
              />
            ) : null}

            {role === "academic_head" && sessionState && institutionId ? (
              <AcademicHeadWorkspace
                accessToken={sessionState.accessToken}
                institutionId={institutionId}
                institutionName={membership?.institutionName}
              />
            ) : null}

            {role === "reviewer_approver" && sessionState && institutionId ? (
              <ReviewerWorkspace
                accessToken={sessionState.accessToken}
                institutionId={institutionId}
                institutionName={membership?.institutionName}
              />
            ) : null}

            {role === "faculty" && sessionState && institutionId ? (
              <FacultyWorkspace
                accessToken={sessionState.accessToken}
                institutionId={institutionId}
                institutionName={membership?.institutionName}
              />
            ) : null}
          </section>

          {/* Workspace Insight Panel */}
          <footer className="grid grid-cols-2 md:grid-cols-4 gap-4 p-8 rounded-[2rem] bg-zinc-900 border border-white/5 relative overflow-hidden group">
             <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
             
             {[
               { label: "Campus", value: role === "super_admin" ? "Platform Control" : membership?.institutionName },
               { label: "Shard", value: role === "super_admin" ? "global" : membership?.institutionSlug },
               { label: "Tenancy", value: role === "super_admin" ? "platform" : membership?.institutionType },
               { label: "Authority", value: resolvedRole ? formatRoleName(resolvedRole) : "Configuring..." }
             ].map((stat, i) => (
                <div key={i} className="flex flex-col gap-1 relative z-10">
                   <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">{stat.label}</span>
                   <span className="text-sm font-bold text-white truncate">{stat.value ?? "Initializing..."}</span>
                </div>
             ))}
          </footer>
          <CommandPalette institutionId={institutionId} />
        </div>
      ) : null}
    </div>
  );
}
