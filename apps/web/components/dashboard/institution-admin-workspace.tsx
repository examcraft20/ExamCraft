"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Mail, Search, ShieldCheck } from "lucide-react";
import { Button, Input, Select, Spinner, StatusMessage } from "@examcraft/ui";
import { apiRequest } from "../../lib/api";

type InstitutionAdminWorkspaceProps = {
  accessToken: string;
  institutionId: string;
};

type PeopleResponse = {
  users: Array<{
    institutionUserId: string;
    userId: string;
    displayName: string | null;
    status: string;
    joinedAt: string | null;
    roleCodes: string[];
  }>;
  invitations: Array<{
    id: string;
    email: string;
    roleCode: string;
    status: string;
    expiresAt: string;
    createdAt: string;
  }>;
};

const roleOptions = [
  { label: "Faculty", value: "faculty" },
  { label: "Academic Head", value: "academic_head" },
  { label: "Reviewer Approver", value: "reviewer_approver" },
  { label: "Institution Admin", value: "institution_admin" }
];

export function InstitutionAdminWorkspace({
  accessToken,
  institutionId
}: InstitutionAdminWorkspaceProps) {
  const [people, setPeople] = useState<PeopleResponse | null>(null);
  const [email, setEmail] = useState("");
  const [roleCode, setRoleCode] = useState("faculty");
  const [status, setStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [invitationSearch, setInvitationSearch] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadPeople() {
      try {
        const response = await apiRequest<PeopleResponse>("/people/users", {
          method: "GET",
          accessToken,
          institutionId
        });

        if (isMounted) {
          setPeople(response);
        }
      } catch (error) {
        if (isMounted) {
          setStatus(error instanceof Error ? error.message : "Unable to load institution team.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadPeople();

    return () => {
      isMounted = false;
    };
  }, [accessToken, institutionId]);

  async function handleInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    try {
      const response = await apiRequest<{ rawToken: string; invitation: { email: string } }>(
        "/people/invitations",
        {
          method: "POST",
          accessToken,
          institutionId,
          body: JSON.stringify({
            institutionId,
            email,
            roleCode
          })
        }
      );

      const refreshed = await apiRequest<PeopleResponse>("/people/users", {
        method: "GET",
        accessToken,
        institutionId
      });

      setPeople(refreshed);
      setEmail("");
      setRoleCode("faculty");
      setStatus(`Invitation created for ${response.invitation.email}. Token: ${response.rawToken}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to create invitation.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const filteredUsers = useMemo(() => {
    const needle = userSearch.trim().toLowerCase();
    if (!needle) {
      return people?.users ?? [];
    }

    return (people?.users ?? []).filter((user) =>
      [user.displayName ?? "", user.status, user.roleCodes.join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(needle)
    );
  }, [people?.users, userSearch]);

  const filteredInvitations = useMemo(() => {
    const needle = invitationSearch.trim().toLowerCase();
    if (!needle) {
      return people?.invitations ?? [];
    }

    return (people?.invitations ?? []).filter((invitation) =>
      [invitation.email, invitation.roleCode, invitation.status].join(" ").toLowerCase().includes(needle)
    );
  }, [invitationSearch, people?.invitations]);

  return (
    <div className="dashboard-detail-grid">
      <article className="dashboard-panel">
        <h2>Invite staff</h2>
        <p className="dashboard-panel-copy">
          Create institution invites for academic heads, faculty members, or reviewers.
        </p>
        <form className="form-body compact-form" onSubmit={handleInvite}>
          <Input
            label="Email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="faculty@institution.edu"
            leftIcon={<Mail size={16} />}
          />

          <Select
            label="Role"
            required
            value={roleCode}
            onChange={(event) => setRoleCode(event.target.value)}
            options={roleOptions}
            leftIcon={<ShieldCheck size={16} />}
          />

          <Button type="submit" loading={isSubmitting} fullWidth>
            {isSubmitting ? "Creating invitation..." : "Create invitation"}
          </Button>
        </form>
        {status ? (
          <StatusMessage className="mt-4" variant="info">
            {status}
          </StatusMessage>
        ) : null}
      </article>

      <article className="dashboard-panel">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h2>Institution users</h2>
            <p className="dashboard-panel-copy">Search current memberships and confirm role coverage quickly.</p>
          </div>
          <div className="dashboard-user-chip">{filteredUsers.length} members</div>
        </div>
        <div className="mt-4">
          <Input
            label="Search users"
            value={userSearch}
            onChange={(event) => setUserSearch(event.target.value)}
            placeholder="Search by name, status, or role"
            leftIcon={<Search size={16} />}
          />
        </div>
        {isLoading ? (
          <div className="dashboard-loading-card mt-4">
            <Spinner />
            <span>Loading users...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="info-card mt-4">
            <p className="info-card-label">No users found</p>
            <p className="dashboard-panel-copy">Try another search term or invite new staff members.</p>
          </div>
        ) : (
          <div className="dashboard-table mt-4">
            {filteredUsers.map((user) => (
              <div className="dashboard-table-row" key={user.institutionUserId}>
                <div>
                  <strong>{user.displayName ?? "Unnamed staff member"}</strong>
                  <div className="dashboard-row-meta">
                    {user.roleCodes.join(", ")} | {user.status}
                  </div>
                </div>
                <span>{user.joinedAt ? new Date(user.joinedAt).toLocaleDateString() : "Pending"}</span>
              </div>
            ))}
          </div>
        )}
      </article>

      <article className="dashboard-panel dashboard-panel-wide">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h2>Pending and past invites</h2>
            <p className="dashboard-panel-copy">Track open invitations and verify which roles are still waiting.</p>
          </div>
          <div className="dashboard-user-chip">{filteredInvitations.length} invites</div>
        </div>
        <div className="mt-4">
          <Input
            label="Search invitations"
            value={invitationSearch}
            onChange={(event) => setInvitationSearch(event.target.value)}
            placeholder="Search by email, role, or status"
            leftIcon={<Search size={16} />}
          />
        </div>
        <div className="dashboard-table mt-4">
          {filteredInvitations.length > 0 ? (
            filteredInvitations.map((invitation) => (
              <div className="dashboard-table-row" key={invitation.id}>
                <div>
                  <strong>{invitation.email}</strong>
                  <div className="dashboard-row-meta">
                    {invitation.roleCode} | {invitation.status}
                  </div>
                </div>
                <span>{new Date(invitation.expiresAt).toLocaleDateString()}</span>
              </div>
            ))
          ) : (
            <p className="dashboard-panel-copy">No invitations yet.</p>
          )}
        </div>
      </article>
    </div>
  );
}
