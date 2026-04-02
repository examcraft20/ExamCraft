"use client";

import { Button, Input } from "@examcraft/ui";
import { KeyRound, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { getSupabaseBrowserClient } from "../../lib/supabase-browser";
import { AuthShell } from "./auth-shell";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      toast.error(error.message);
      setIsSubmitting(false);
      return;
    }

    toast.success("Signed in successfully. Opening your dashboard...");
    router.push("/dashboard");
    setIsSubmitting(false);
  }

  return (
    <AuthShell
      eyebrow="Authentication"
      title="Welcome back"
      subtitle="Sign in to your ExamCraft account to continue."
      brandTitle={
        <>
          Your institution&apos;s
          <br />
          <span>exam command center.</span>
        </>
      }
      brandSubtitle="Sign in to access your multi-tenant workspace, manage faculty, and orchestrate assessments at scale."
      features={[
        "Supabase-backed secure authentication",
        "Role-scoped tenant access control",
        "Invitation-based faculty onboarding",
        "Backend-enforced permission guards"
      ]}
      footerLinks={[
        {
          href: "/signup",
          label: (
            <>
              New to ExamCraft? <span className="primary-link">Create account</span>
            </>
          )
        },
        { href: "/onboarding", label: "Set up institution" },
        { href: "/invite", label: "Accept invitation" }
      ]}
    >
      <form className="form-body" onSubmit={handleSubmit}>
        <Input
          autoComplete="email"
          label="Email"
          leftIcon={<Mail size={16} />}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="faculty@institution.edu"
          required
          type="email"
          value={email}
        />

        <Input
          autoComplete="current-password"
          label="Password"
          leftIcon={<KeyRound size={16} />}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter your password"
          required
          type="password"
          value={password}
        />

        <Button fullWidth loading={isSubmitting} size="lg" type="submit">
          {isSubmitting ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </AuthShell>
  );
}
