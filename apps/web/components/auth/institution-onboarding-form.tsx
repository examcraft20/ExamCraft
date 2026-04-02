"use client";

import { FormEvent, useEffect, useState } from "react";
import { apiRequest } from "../../lib/api";
import { getSupabaseBrowserClient } from "../../lib/supabase-browser";

type SessionState = {
  accessToken: string;
  userId: string;
  email?: string;
};

export function InstitutionOnboardingForm() {
  const [institutionName, setInstitutionName] = useState("");
  const [institutionSlug, setInstitutionSlug] = useState("");
  const [institutionType, setInstitutionType] = useState("college");
  const [adminDisplayName, setAdminDisplayName] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [sessionState, setSessionState] = useState<SessionState | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      const supabase = getSupabaseBrowserClient();
      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      if (session?.access_token && session.user) {
        setSessionState({
          accessToken: session.access_token,
          userId: session.user.id,
          email: session.user.email
        });
        setAdminDisplayName(
          typeof session.user.user_metadata?.display_name === "string"
            ? session.user.user_metadata.display_name
            : ""
        );
      }

      setIsLoadingSession(false);
    }

    void loadSession();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!sessionState) {
      setStatus("Please sign in first before creating an institution.");
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    try {
      const response = await apiRequest<{
        institution: {
          id: string;
          name: string;
          slug: string;
        };
        subscriptionPlan: string;
      }>("/onboarding/institution", {
        method: "POST",
        accessToken: sessionState.accessToken,
        body: JSON.stringify({
          institutionName,
          institutionSlug,
          institutionType,
          adminUserId: sessionState.userId,
          adminDisplayName,
          primaryContactEmail: sessionState.email
        })
      });

      setStatus(
        `Institution ${response.institution.name} created successfully on the ${response.subscriptionPlan} plan.`
      );
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to create institution.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="panel form-panel" onSubmit={handleSubmit}>
      <div>
        <p className="eyebrow">Onboarding</p>
        <h1>Create your institution workspace</h1>
        <p className="subtle">
          Start the free-tier tenant, assign the first institution admin, and unlock the rest of
          the ExamCraft setup flow.
        </p>
      </div>

      {isLoadingSession ? <p className="subtle">Checking your session...</p> : null}

      {!isLoadingSession && !sessionState ? (
        <div className="info-card">
          <strong>Sign in required</strong>
          <p>Use the login page first so the onboarding API can attach the new tenant to you.</p>
        </div>
      ) : null}

      <label className="field">
        <span>Institution name</span>
        <input
          onChange={(event) => setInstitutionName(event.target.value)}
          placeholder="Example College of Engineering"
          required
          value={institutionName}
        />
      </label>

      <label className="field">
        <span>Institution slug</span>
        <input
          onChange={(event) => setInstitutionSlug(event.target.value.toLowerCase())}
          placeholder="example-college"
          required
          value={institutionSlug}
        />
      </label>

      <label className="field">
        <span>Institution type</span>
        <select onChange={(event) => setInstitutionType(event.target.value)} value={institutionType}>
          <option value="college">College</option>
          <option value="school">School</option>
          <option value="coaching">Coaching Center</option>
        </select>
      </label>

      <label className="field">
        <span>Admin display name</span>
        <input
          onChange={(event) => setAdminDisplayName(event.target.value)}
          placeholder="Academic coordinator"
          value={adminDisplayName}
        />
      </label>

      <button className="primary-button" disabled={isSubmitting || !sessionState} type="submit">
        {isSubmitting ? "Creating institution..." : "Create institution"}
      </button>

      {status ? <p className="status-message">{status}</p> : null}
    </form>
  );
}
