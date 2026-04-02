"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../../lib/api";
import { AcademicHeadWorkspace } from "./academic-head-workspace";
import { FacultyWorkspace } from "./faculty-workspace";
import { InstitutionAdminWorkspace } from "./institution-admin-workspace";
import { ReviewerWorkspace } from "./reviewer-workspace";
import { SuperAdminWorkspace } from "./super-admin-workspace";
import {
  AppRole,
  AuthMeResponse,
  MembershipSummary,
  TenantContextResponse,
  formatRoleName,
  getRoleSummary,
  resolvePrimaryRole
} from "../../lib/dashboard";
import { getSupabaseBrowserSession } from "../../lib/supabase-browser";
import { StatusMessage } from "@examcraft/ui";

type RoleDashboardProps = {
  role: AppRole;
};

type SessionState = {
  accessToken: string;
  email?: string;
  roleCodes: string[];
  isSuperAdmin: boolean;
};

const roleActionMap: Record<AppRole, string[]> = {
  super_admin: [
    "Inspect tenant health and subscription posture",
    "Manage global templates and platform operations",
    "Support cross-institution governance workflows"
  ],
  institution_admin: [
    "Invite and manage institution users",
    "Control academic structure and institution settings",
    "Review, approve, and publish final papers"
  ],
  academic_head: [
    "Oversee academic readiness and template quality",
    "Review draft submissions from faculty",
    "Approve or reject papers before release"
  ],
  reviewer_approver: [
    "Review submitted papers with focused approval authority",
    "Add review feedback and decision outcomes",
    "Support export-ready release quality"
  ],
  faculty: [
    "Create and edit questions",
    "Build templates and draft papers",
    "Submit completed drafts for review"
  ]
};

export function RoleDashboard({ role }: RoleDashboardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const institutionId = searchParams.get("institutionId");
  const [sessionState, setSessionState] = useState<SessionState | null>(null);
  const [membership, setMembership] = useState<MembershipSummary | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [resolvedRole, setResolvedRole] = useState<AppRole | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const roleSummary = getRoleSummary(role);
  const visiblePermissions = useMemo(() => permissions.slice().sort(), [permissions]);

  useEffect(() => {
    let isMounted = true;

    async function loadRoleDashboard() {
      if (role !== "super_admin" && !institutionId) {
        router.replace("/dashboard");
        return;
      }

      const session = await getSupabaseBrowserSession();

      if (!isMounted) {
        return;
      }

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

        if (!isMounted) {
          return;
        }

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
            setPermissions([
              "platform.tenants.read",
              "platform.templates.manage",
              "platform.support.access"
            ]);
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

        if (!isMounted) {
          return;
        }

        const currentMembership =
          membershipResponse.find((item) => item.institutionId === institutionId) ?? null;
        const currentRole = resolvePrimaryRole(contextResponse.tenantContext.roleCodes);

        setMembership(currentMembership);
        setPermissions(contextResponse.tenantContext.permissionCodes);
        setResolvedRole(currentRole);

        if (!currentRole) {
          setStatus("No supported dashboard is available for this institution membership.");
        } else if (currentRole !== role) {
          router.replace(
            `/dashboard/${currentRole}?institutionId=${encodeURIComponent(institutionId ?? "")}`
          );
          return;
        }
      } catch (error) {
        if (isMounted) {
          setStatus(error instanceof Error ? error.message : "Unable to load the dashboard.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadRoleDashboard();

    return () => {
      isMounted = false;
    };
  }, [institutionId, role, router]);

  return (
    <div className="dashboard-shell">
      <header className="dashboard-header">
        <div>
          <p className="dashboard-kicker">{formatRoleName(role)}</p>
          <h1 className="dashboard-title">{roleSummary.title}</h1>
          <p className="dashboard-subtitle">{roleSummary.description}</p>
        </div>
        <div className="dashboard-header-meta">
          {membership ? <div className="dashboard-user-chip">{membership.institutionName}</div> : null}
          {sessionState?.email ? <div className="dashboard-user-chip">{sessionState.email}</div> : null}
        </div>
      </header>

      <div className="dashboard-actions">
        <Link className="secondary-button" href="/dashboard">
          Switch institution
        </Link>
      </div>

      {isLoading ? (
        <section className="dashboard-loading-card">
          <span className="spinner" />
          <span>Loading {formatRoleName(role)} dashboard...</span>
        </section>
      ) : null}

      {status ? <StatusMessage variant="error">{status}</StatusMessage> : null}

      {!isLoading && !status && resolvedRole === role ? (
        <section className="dashboard-detail-grid">
          {role === "super_admin" && sessionState ? (
            <div className="dashboard-panel-wide">
              <SuperAdminWorkspace accessToken={sessionState.accessToken} />
            </div>
          ) : null}

          {role === "institution_admin" && sessionState && institutionId ? (
            <div className="dashboard-panel-wide">
              <InstitutionAdminWorkspace
                accessToken={sessionState.accessToken}
                institutionId={institutionId}
              />
            </div>
          ) : null}

          {role === "academic_head" && sessionState && institutionId ? (
            <div className="dashboard-panel-wide">
              <AcademicHeadWorkspace
                accessToken={sessionState.accessToken}
                institutionId={institutionId}
              />
            </div>
          ) : null}

          {role === "reviewer_approver" && sessionState && institutionId ? (
            <div className="dashboard-panel-wide">
              <ReviewerWorkspace
                accessToken={sessionState.accessToken}
                institutionId={institutionId}
              />
            </div>
          ) : null}

          {role === "faculty" && sessionState && institutionId ? (
            <div className="dashboard-panel-wide">
              <FacultyWorkspace
                accessToken={sessionState.accessToken}
                institutionId={institutionId}
              />
            </div>
          ) : null}

          <article className="dashboard-panel">
            <h2>Role focus</h2>
            <ul className="dashboard-bullet-list">
              {roleActionMap[role].map((action) => (
                <li key={action}>{action}</li>
              ))}
            </ul>
          </article>

          <article className="dashboard-panel">
            <h2>Active permissions</h2>
            <div className="dashboard-role-list">
              {visiblePermissions.map((permission) => (
                <span className="dashboard-role-pill" key={permission}>
                  {permission}
                </span>
              ))}
            </div>
          </article>

          <article className="dashboard-panel dashboard-panel-wide">
            <h2>Workspace summary</h2>
            <div className="dashboard-summary-grid">
              <div>
                <span className="dashboard-summary-label">Institution</span>
                <strong>{role === "super_admin" ? "ExamCraft Platform" : membership?.institutionName ?? "Unavailable"}</strong>
              </div>
              <div>
                <span className="dashboard-summary-label">Slug</span>
                <strong>{role === "super_admin" ? "global" : membership?.institutionSlug ?? "Unavailable"}</strong>
              </div>
              <div>
                <span className="dashboard-summary-label">Institution Type</span>
                <strong>{role === "super_admin" ? "platform" : membership?.institutionType ?? "Unavailable"}</strong>
              </div>
              <div>
                <span className="dashboard-summary-label">Resolved Role</span>
                <strong>{resolvedRole ? formatRoleName(resolvedRole) : "Unavailable"}</strong>
              </div>
            </div>
          </article>
        </section>
      ) : null}
    </div>
  );
}
