"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { apiRequest } from "../../lib/api";

type InvitationPreviewResponse = {
  invitation: {
    institutionId: string;
    institutionName: string;
    email: string;
    roleCode: string;
    expiresAt: string;
  };
};

type InviteAcceptanceFormProps = {
  initialToken?: string;
};

export function InviteAcceptanceForm({ initialToken = "" }: InviteAcceptanceFormProps) {
  const [token, setToken] = useState(initialToken);
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [preview, setPreview] = useState<InvitationPreviewResponse["invitation"] | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const trimmedToken = useMemo(() => token.trim(), [token]);

  useEffect(() => {
    let isMounted = true;

    async function loadPreview() {
      if (!trimmedToken) {
        setPreview(null);
        return;
      }

      setIsLoadingPreview(true);
      setStatus(null);

      try {
        const response = await apiRequest<InvitationPreviewResponse>(
          `/invitations/preview?token=${encodeURIComponent(trimmedToken)}`,
          { method: "GET" }
        );

        if (isMounted) {
          setPreview(response.invitation);
        }
      } catch (error) {
        if (isMounted) {
          setPreview(null);
          setStatus(error instanceof Error ? error.message : "Unable to preview invitation.");
        }
      } finally {
        if (isMounted) {
          setIsLoadingPreview(false);
        }
      }
    }

    void loadPreview();

    return () => {
      isMounted = false;
    };
  }, [trimmedToken]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    try {
      const response = await apiRequest<{ email: string; institutionId: string }>(
        "/invitations/accept",
        {
          method: "POST",
          body: JSON.stringify({
            token: trimmedToken,
            password,
            displayName
          })
        }
      );

      setStatus(
        `Invitation accepted for ${response.email}. You can now sign in and switch into institution ${response.institutionId}.`
      );
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to accept invitation.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="panel form-panel" onSubmit={handleSubmit}>
      <div>
        <p className="eyebrow">Invites</p>
        <h1>Accept your institution invitation</h1>
        <p className="subtle">
          Paste the invitation token shared by your institution admin to create your account and
          join the ExamCraft workspace.
        </p>
      </div>

      <label className="field">
        <span>Invitation token</span>
        <input
          onChange={(event) => setToken(event.target.value)}
          placeholder="Paste your invite token"
          required
          value={token}
        />
      </label>

      {preview ? (
        <div className="info-card">
          <strong>{preview.institutionName}</strong>
          <p>Email: {preview.email}</p>
          <p>Role: {preview.roleCode}</p>
          <p>Expires: {new Date(preview.expiresAt).toLocaleString()}</p>
        </div>
      ) : null}

      {isLoadingPreview ? <p className="subtle">Loading invitation details...</p> : null}

      <label className="field">
        <span>Display name</span>
        <input
          onChange={(event) => setDisplayName(event.target.value)}
          placeholder="How should your name appear?"
          value={displayName}
        />
      </label>

      <label className="field">
        <span>Password</span>
        <input
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Create your password"
          required
          type="password"
          value={password}
        />
      </label>

      <button className="primary-button" disabled={isSubmitting || !trimmedToken} type="submit">
        {isSubmitting ? "Accepting..." : "Accept invitation"}
      </button>

      {status ? <p className="status-message">{status}</p> : null}
    </form>
  );
}
