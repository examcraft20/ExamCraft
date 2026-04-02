"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { apiRequest } from "../../lib/api";
import {
  AuthMeResponse,
  MembershipSummary,
  TenantContextResponse,
  formatRoleName,
  getRoleSummary,
  resolvePrimaryRole
} from "../../lib/dashboard";
import { getSupabaseBrowserSession } from "../../lib/supabase-browser";
import { LayoutDashboard, LogIn, Plus } from "lucide-react";
import { Button, StatusMessage, Skeleton } from "@examcraft/ui";

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

      if (!isMounted) {
        return;
      }

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

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!sessionState?.isSuperAdmin || preferredInstitutionId || memberships.length > 0) {
      return;
    }

    router.replace("/dashboard/super_admin");
  }, [memberships.length, preferredInstitutionId, router, sessionState?.isSuperAdmin]);

  const openMembership = useCallback(
    async (membership: MembershipSummary) => {
      if (!sessionState) {
        return;
      }

      setIsOpeningInstitutionId(membership.institutionId);
      setStatus(null);

      try {
        const response = await apiRequest<TenantContextResponse>("/tenant/context", {
          method: "GET",
          accessToken: sessionState.accessToken,
          institutionId: membership.institutionId
        });

        const resolvedRole = resolvePrimaryRole(response.tenantContext.roleCodes);
        if (!resolvedRole) {
          throw new Error("No supported dashboard is available for your current roles.");
        }

        router.push(
          `/dashboard/${resolvedRole}?institutionId=${encodeURIComponent(membership.institutionId)}`
        );
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Unable to open this institution.");
        setIsOpeningInstitutionId(null);
      }
    },
    [router, sessionState]
  );

  useEffect(() => {
    if (!sessionState || !autoSelectedMembership || isOpeningInstitutionId) {
      return;
    }

    void openMembership(autoSelectedMembership);
  }, [autoSelectedMembership, isOpeningInstitutionId, openMembership, sessionState]);

  return (
    <div className="dashboard-shell">
      <header className="dashboard-header">
        <div>
          <p className="dashboard-kicker">Dashboard Access</p>
          <h1 className="dashboard-title">Choose your institution workspace</h1>
          <p className="dashboard-subtitle">
            Roles are resolved from your active membership before you enter a dashboard.
          </p>
        </div>
        {sessionState?.email ? <div className="dashboard-user-chip">{sessionState.email}</div> : null}
      </header>

      {!isLoading && !sessionState ? (
        <section className="dashboard-empty-state">
          <h2>Sign in to continue</h2>
          <p>Your role-based dashboard becomes available after authentication.</p>
          <div className="dashboard-actions">
            <Button onClick={() => router.push("/login")} leftIcon={<LogIn size={18} />}>
              Sign in
            </Button>
            <Button variant="secondary" onClick={() => router.push("/signup")} leftIcon={<Plus size={18} />}>
              Create account
            </Button>
          </div>
        </section>
      ) : null}

      {isLoading ? (
        <section className="dashboard-grid" aria-label="Loading memberships">
          {[1, 2, 3].map((i) => (
            <article className="dashboard-card" key={i}>
              <div className="dashboard-card-head">
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
                  <Skeleton width="40%" height="14px" />
                  <Skeleton width="80%" height="24px" />
                </div>
                <Skeleton width="60px" height="24px" rounded />
              </div>
              <div style={{ margin: "16px 0", display: "flex", flexDirection: "column", gap: "8px" }}>
                <Skeleton width="100%" height="14px" />
                <Skeleton width="90%" height="14px" />
              </div>
              <div className="dashboard-role-list" style={{ marginBottom: "24px" }}>
                <Skeleton width="80px" height="28px" rounded />
                <Skeleton width="100px" height="28px" rounded />
              </div>
              <Skeleton width="100%" height="40px" />
            </article>
          ))}
        </section>
      ) : null}

      {status ? <StatusMessage variant="error">{status}</StatusMessage> : null}

      {!isLoading && sessionState && memberships.length === 0 ? (
        <section className="dashboard-empty-state">
          <h2>No institution membership yet</h2>
          <p>Create a new institution or accept an invitation to unlock your role dashboard.</p>
          <div className="dashboard-actions">
            <Button onClick={() => router.push("/onboarding")} leftIcon={<Plus size={18} />}>
              Create institution
            </Button>
            <Button variant="secondary" onClick={() => router.push("/invite")} leftIcon={<LogIn size={18} />}>
              Accept invitation
            </Button>
          </div>
        </section>
      ) : null}

      {!isLoading && sessionState && memberships.length > 0 ? (
        <section className="dashboard-grid">
          {sessionState.isSuperAdmin ? (
            <article className="dashboard-card">
              <div className="dashboard-card-head">
                <div>
                  <p className="dashboard-card-eyebrow">platform</p>
                  <h2>ExamCraft Platform</h2>
                </div>
                <span className="dashboard-card-slug">global</span>
              </div>
              <p className="dashboard-card-copy">
                {getRoleSummary("super_admin").description}
              </p>
              <div className="dashboard-role-list">
                <span className="dashboard-role-pill">{formatRoleName("super_admin")}</span>
              </div>
              <Button
                onClick={() => router.push("/dashboard/super_admin")}
                leftIcon={<LayoutDashboard size={18} />}
              >
                Open platform dashboard
              </Button>
            </article>
          ) : null}

          {memberships.map((membership) => {
            const role = resolvePrimaryRole(membership.roleCodes);
            const summary = role ? getRoleSummary(role) : null;

            return (
              <article className="dashboard-card" key={membership.institutionUserId}>
                <div className="dashboard-card-head">
                  <div>
                    <p className="dashboard-card-eyebrow">{membership.institutionType}</p>
                    <h2>{membership.institutionName}</h2>
                  </div>
                  <span className="dashboard-card-slug">{membership.institutionSlug}</span>
                </div>
                <p className="dashboard-card-copy">
                  {summary?.description ??
                    "This workspace is available, but a matching dashboard role has not been configured yet."}
                </p>
                <div className="dashboard-role-list">
                  {membership.roleCodes.map((roleCode) => (
                    <span className="dashboard-role-pill" key={roleCode}>
                      {formatRoleName(roleCode)}
                    </span>
                  ))}
                </div>
                <Button
                  disabled={isOpeningInstitutionId === membership.institutionId}
                  loading={isOpeningInstitutionId === membership.institutionId}
                  onClick={() => void openMembership(membership)}
                  leftIcon={<LayoutDashboard size={18} />}
                >
                  {isOpeningInstitutionId === membership.institutionId ? "Opening..." : "Open dashboard"}
                </Button>
              </article>
            );
          })}
        </section>
      ) : null}
    </div>
  );
}
