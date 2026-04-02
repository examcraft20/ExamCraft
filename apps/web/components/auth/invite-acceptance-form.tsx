"use client";

import { Button, Input, StatusMessage } from "@examcraft/ui";
import { KeyRound, Ticket, UserRound } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { apiRequest } from "../../lib/api";
import { AuthShell } from "./auth-shell";

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
          toast.error(error instanceof Error ? error.message : "Unable to preview invitation.");
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

      toast.success(
        `Invitation accepted for ${response.email}. You can now sign in and switch into institution ${response.institutionId}.`
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to accept invitation.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Invites"
      title="Accept your invitation"
      subtitle="Paste the invitation token shared by your institution admin to create your account and join the ExamCraft workspace."
      brandTitle={
        <>
          You have been invited
          <br />
          <span>to an institution.</span>
        </>
      }
      brandSubtitle="Paste your invitation token to preview the details and join your institution workspace with a single click."
      features={[
        "Role-scoped access granted automatically",
        "Institution linked on acceptance",
        "Preview token before committing",
        "Single sign-in after acceptance"
      ]}
    >
      <form className="form-body" onSubmit={handleSubmit}>
        <Input
          label="Invitation token"
          leftIcon={<Ticket size={16} />}
          onChange={(event) => setToken(event.target.value)}
          placeholder="Paste your invite token here"
          required
          value={token}
        />

        {isLoadingPreview ? (
          <StatusMessage variant="info">Loading invitation details...</StatusMessage>
        ) : null}

        {preview && !isLoadingPreview ? (
          <div className="info-card">
            <div className="info-card-label">Invitation Preview</div>
            <div className="info-card-row">
              <strong>Institution</strong>
              <span>{preview.institutionName}</span>
            </div>
            <div className="info-card-row">
              <strong>Email</strong>
              <span>{preview.email}</span>
            </div>
            <div className="info-card-row">
              <strong>Role</strong>
              <span>{preview.roleCode}</span>
            </div>
            <div className="info-card-row">
              <strong>Expires</strong>
              <span>{new Date(preview.expiresAt).toLocaleString()}</span>
            </div>
          </div>
        ) : null}

        <Input
          label="Display name"
          leftIcon={<UserRound size={16} />}
          onChange={(event) => setDisplayName(event.target.value)}
          placeholder="How should your name appear?"
          value={displayName}
        />

        <Input
          label="Password"
          leftIcon={<KeyRound size={16} />}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Create your password"
          required
          type="password"
          value={password}
        />

        <Button disabled={!trimmedToken} fullWidth loading={isSubmitting} size="lg" type="submit">
          {isSubmitting ? "Accepting invitation..." : "Accept invitation"}
        </Button>
      </form>
    </AuthShell>
  );
}
