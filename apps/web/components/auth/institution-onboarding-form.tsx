"use client";

import { Button, Input, Select, StatusMessage } from "@examcraft/ui";
import { Building2, Hash, School2, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { apiRequest } from "../../lib/api";
import { getSupabaseBrowserClient } from "../../lib/supabase-browser";
import { AuthShell } from "./auth-shell";

type SessionState = {
  accessToken: string;
  email?: string;
};

export function InstitutionOnboardingForm() {
  const router = useRouter();
  const [institutionName, setInstitutionName] = useState("");
  const [institutionSlug, setInstitutionSlug] = useState("");
  const [institutionType, setInstitutionType] = useState("college");
  const [adminDisplayName, setAdminDisplayName] = useState("");
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
      toast.info("Please sign in first before creating an institution.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiRequest<{
        institution: { id: string; name: string; slug: string };
        subscriptionPlan: string;
      }>("/onboarding/institution", {
        method: "POST",
        accessToken: sessionState.accessToken,
        body: JSON.stringify({
          institutionName,
          institutionSlug,
          institutionType,
          adminDisplayName,
          primaryContactEmail: sessionState.email
        })
      });

      toast.success(
        `Institution "${response.institution.name}" created successfully on the ${response.subscriptionPlan} plan.`
      );
      router.push(`/dashboard?institutionId=${encodeURIComponent(response.institution.id)}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create institution.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Onboarding"
      title="Create your institution"
      subtitle="Start the free-tier tenant, assign the first institution admin, and unlock the rest of the ExamCraft setup flow."
      brandTitle={
        <>
          Set up your
          <br />
          <span>institution workspace.</span>
        </>
      }
      brandSubtitle="Register your institution to unlock exam orchestration, faculty management, and the full ExamCraft feature suite."
      features={[
        "Free-tier tenant provisioned instantly",
        "Slug-based institution identity",
        "Admin user linked automatically",
        "Supports colleges, schools, and coaching centers"
      ]}
    >
      {isLoadingSession ? (
        <StatusMessage style={{ marginBottom: "24px" }} variant="info">
          Checking your session...
        </StatusMessage>
      ) : null}

      {!isLoadingSession && !sessionState ? (
        <StatusMessage style={{ marginBottom: "24px" }} variant="warning">
          Sign in first so onboarding can attach the new tenant to your account.
        </StatusMessage>
      ) : null}

      <form className="form-body" onSubmit={handleSubmit}>
        <Input
          label="Institution name"
          leftIcon={<Building2 size={16} />}
          onChange={(event) => setInstitutionName(event.target.value)}
          placeholder="Example College of Engineering"
          required
          value={institutionName}
        />

        <Input
          label="Institution slug"
          leftIcon={<Hash size={16} />}
          onChange={(event) => setInstitutionSlug(event.target.value.toLowerCase())}
          placeholder="example-college"
          required
          value={institutionSlug}
        />

        <Select
          label="Institution type"
          leftIcon={<School2 size={16} />}
          onChange={(event) => setInstitutionType(event.target.value)}
          options={[
            { label: "College", value: "college" },
            { label: "School", value: "school" },
            { label: "Coaching Center", value: "coaching" }
          ]}
          value={institutionType}
        />

        <Input
          label="Admin display name"
          leftIcon={<UserRound size={16} />}
          onChange={(event) => setAdminDisplayName(event.target.value)}
          placeholder="Academic coordinator"
          value={adminDisplayName}
        />

        <Button disabled={!sessionState} fullWidth loading={isSubmitting} size="lg" type="submit">
          {isSubmitting ? "Creating institution..." : "Create institution"}
        </Button>
      </form>
    </AuthShell>
  );
}
