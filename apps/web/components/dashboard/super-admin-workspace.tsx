"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, ShieldAlert } from "lucide-react";
import { Button, Input, Select, Spinner, StatusMessage } from "@examcraft/ui";
import { apiRequest } from "../../lib/api";
import type {
  PlatformAuditEvent,
  PlatformDashboardSummaryResponse,
  PlatformInstitutionRecord
} from "../../lib/dashboard";

type SuperAdminWorkspaceProps = {
  accessToken: string;
};

const statusOptions = [
  { label: "Active", value: "active" },
  { label: "Trial", value: "trial" },
  { label: "Suspended", value: "suspended" },
  { label: "Archived", value: "archived" }
];

export function SuperAdminWorkspace({ accessToken }: SuperAdminWorkspaceProps) {
  const [summary, setSummary] = useState<PlatformDashboardSummaryResponse | null>(null);
  const [institutions, setInstitutions] = useState<PlatformInstitutionRecord[]>([]);
  const [auditEvents, setAuditEvents] = useState<PlatformAuditEvent[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [statusDrafts, setStatusDrafts] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [activeInstitutionId, setActiveInstitutionId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadWorkspace() {
      try {
        const [summaryResponse, institutionsResponse, auditResponse] = await Promise.all([
          apiRequest<PlatformDashboardSummaryResponse>("/tenant/platform-summary", {
            method: "GET",
            accessToken
          }),
          apiRequest<PlatformInstitutionRecord[]>("/tenant/platform-institutions", {
            method: "GET",
            accessToken
          }),
          apiRequest<PlatformAuditEvent[]>("/tenant/platform-audit-feed", {
            method: "GET",
            accessToken
          })
        ]);

        if (isMounted) {
          setSummary(summaryResponse);
          setInstitutions(institutionsResponse);
          setAuditEvents(auditResponse);
          setStatusDrafts(
            Object.fromEntries(institutionsResponse.map((institution) => [institution.id, institution.status]))
          );
        }
      } catch (error) {
        if (isMounted) {
          setStatus(error instanceof Error ? error.message : "Unable to load platform workspace.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadWorkspace();

    return () => {
      isMounted = false;
    };
  }, [accessToken]);

  const filteredInstitutions = useMemo(() => {
    const needle = searchValue.trim().toLowerCase();
    if (!needle) {
      return institutions;
    }

    return institutions.filter((institution) =>
      [institution.name, institution.slug, institution.institutionType, institution.status]
        .join(" ")
        .toLowerCase()
        .includes(needle)
    );
  }, [institutions, searchValue]);

  async function updateInstitutionStatus(institutionId: string) {
    setActiveInstitutionId(institutionId);
    setStatus(null);

    try {
      const updatedInstitution = await apiRequest<PlatformInstitutionRecord>(
        `/tenant/platform-institutions/${institutionId}/status`,
        {
          method: "PATCH",
          accessToken,
          body: JSON.stringify({
            status: statusDrafts[institutionId],
            note: notes[institutionId]?.trim() || undefined
          })
        }
      );

      setInstitutions((current) =>
        current.map((institution) =>
          institution.id === institutionId
            ? { ...institution, status: updatedInstitution.status }
            : institution
        )
      );
      setStatus(`Institution "${updatedInstitution.name}" updated to ${updatedInstitution.status}.`);

      const refreshedAudit = await apiRequest<PlatformAuditEvent[]>("/tenant/platform-audit-feed", {
        method: "GET",
        accessToken
      });
      setAuditEvents(refreshedAudit);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to update institution status.");
    } finally {
      setActiveInstitutionId(null);
    }
  }

  return (
    <div className="dashboard-detail-grid">
      <article className="dashboard-panel dashboard-panel-wide">
        <h2>Platform health snapshot</h2>
        {isLoading ? (
          <div className="dashboard-loading-card">
            <Spinner />
            <span>Loading platform metrics...</span>
          </div>
        ) : (
          <div className="dashboard-summary-grid">
            <div>
              <span className="dashboard-summary-label">Institutions</span>
              <strong>{summary?.totals.institutions ?? 0} tenants</strong>
            </div>
            <div>
              <span className="dashboard-summary-label">Active Users</span>
              <strong>{summary?.totals.activeUsers ?? 0} users</strong>
            </div>
            <div>
              <span className="dashboard-summary-label">Pending Invites</span>
              <strong>{summary?.totals.pendingInvitations ?? 0} invites</strong>
            </div>
            <div>
              <span className="dashboard-summary-label">Content Records</span>
              <strong>{(summary?.totals.questions ?? 0) + (summary?.totals.templates ?? 0)} items</strong>
            </div>
          </div>
        )}
      </article>

      {status ? (
        <article className="dashboard-panel dashboard-panel-wide">
          <StatusMessage variant="info">{status}</StatusMessage>
        </article>
      ) : null}

      <article className="dashboard-panel dashboard-panel-wide">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h2>Tenant controls</h2>
            <p className="dashboard-panel-copy">
              Search institutions, adjust lifecycle status, and keep a note on platform-level interventions.
            </p>
          </div>
          <div className="dashboard-user-chip">{filteredInstitutions.length} institutions</div>
        </div>

        <div className="mt-4">
          <Input
            label="Search institutions"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Search by name, slug, type, or status"
            leftIcon={<Search size={16} />}
          />
        </div>

        <div className="dashboard-table mt-4">
          {isLoading ? (
            <div className="dashboard-loading-card">
              <Spinner />
              <span>Loading institutions...</span>
            </div>
          ) : filteredInstitutions.length === 0 ? (
            <div className="info-card">
              <p className="info-card-label">No institutions found</p>
              <p className="dashboard-panel-copy">Try another search term to find a tenant workspace.</p>
            </div>
          ) : (
            filteredInstitutions.map((institution) => (
              <div className="dashboard-table-row flex-col items-stretch" key={institution.id}>
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <strong>{institution.name}</strong>
                    <div className="dashboard-row-meta">
                      {institution.slug} | {institution.institutionType}
                    </div>
                  </div>
                  <span className="dashboard-role-pill">{institution.status}</span>
                </div>

                <div className="dashboard-summary-grid">
                  <div>
                    <span className="dashboard-summary-label">Active Users</span>
                    <strong>{institution.usage.activeUsers}</strong>
                  </div>
                  <div>
                    <span className="dashboard-summary-label">Pending Invites</span>
                    <strong>{institution.usage.pendingInvitations}</strong>
                  </div>
                  <div>
                    <span className="dashboard-summary-label">Questions</span>
                    <strong>{institution.usage.questions}</strong>
                  </div>
                  <div>
                    <span className="dashboard-summary-label">Templates</span>
                    <strong>{institution.usage.templates}</strong>
                  </div>
                </div>

                <Select
                  label="Lifecycle status"
                  value={statusDrafts[institution.id] ?? institution.status}
                  onChange={(event) =>
                    setStatusDrafts((current) => ({ ...current, [institution.id]: event.target.value }))
                  }
                  options={statusOptions}
                  leftIcon={<ShieldAlert size={16} />}
                />

                <Input
                  label="Platform note"
                  value={notes[institution.id] ?? ""}
                  onChange={(event) =>
                    setNotes((current) => ({ ...current, [institution.id]: event.target.value }))
                  }
                  placeholder="Record why the status changed"
                  leftIcon={<ShieldAlert size={16} />}
                />

                <div className="dashboard-actions">
                  <Button
                    size="sm"
                    loading={activeInstitutionId === institution.id}
                    onClick={() => void updateInstitutionStatus(institution.id)}
                  >
                    Save tenant status
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </article>

      <article className="dashboard-panel dashboard-panel-wide">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h2>Platform audit feed</h2>
            <p className="dashboard-panel-copy">
              Recent cross-tenant activity from institutions, invitations, questions, and templates.
            </p>
          </div>
          <div className="dashboard-user-chip">{auditEvents.length} events</div>
        </div>

        <div className="dashboard-table mt-4">
          {isLoading ? (
            <div className="dashboard-loading-card">
              <Spinner />
              <span>Loading audit feed...</span>
            </div>
          ) : auditEvents.length === 0 ? (
            <div className="info-card">
              <p className="info-card-label">No audit activity</p>
              <p className="dashboard-panel-copy">Platform events will appear here as institutions become active.</p>
            </div>
          ) : (
            auditEvents.map((event) => (
              <div className="dashboard-table-row" key={event.id}>
                <div>
                  <strong>{event.title}</strong>
                  <div className="dashboard-row-meta">
                    {event.institutionName} | {event.eventType}
                  </div>
                </div>
                <span>{event.status}</span>
              </div>
            ))
          )}
        </div>
      </article>
    </div>
  );
}
