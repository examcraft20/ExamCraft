"use client";

import { Button, Input } from "@examcraft/ui";
import { KeyRound, Mail, UserRound } from "lucide-react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { getSupabaseBrowserClient } from "../../lib/supabase-browser";
import { AuthShell } from "./auth-shell";

export function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName
        }
      }
    });

    if (error) {
      toast.error(error.message);
      setIsSubmitting(false);
      return;
    }

    toast.success("Account created. If email confirmation is disabled, you can sign in immediately.");
    setIsSubmitting(false);
  }

  return (
    <AuthShell
      eyebrow="Create Account"
      title="Join ExamCraft"
      subtitle="Your account becomes the first institution admin when you create a new tenant."
      brandTitle={
        <>
          Start your institution&apos;s
          <br />
          <span>digital exam journey.</span>
        </>
      }
      brandSubtitle="Creating an account is the first step to setting up your multi-tenant ExamCraft institution workspace."
      features={[
        "Become the first institution admin",
        "Free-tier tenant activation",
        "Full ExamCraft setup flow unlocked",
        "Invite faculty and coordinators"
      ]}
      footerLinks={[
        {
          href: "/login",
          label: (
            <>
              Already have an account? <span className="primary-link">Sign in</span>
            </>
          )
        },
        { href: "/onboarding", label: "Go to institution onboarding" }
      ]}
    >
      <form className="form-body" onSubmit={handleSubmit}>
        <Input
          label="Display name"
          leftIcon={<UserRound size={16} />}
          onChange={(event) => setDisplayName(event.target.value)}
          placeholder="Academic coordinator"
          value={displayName}
        />

        <Input
          autoComplete="email"
          label="Email"
          leftIcon={<Mail size={16} />}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="admin@institution.edu"
          required
          type="email"
          value={email}
        />

        <Input
          autoComplete="new-password"
          label="Password"
          leftIcon={<KeyRound size={16} />}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Create a secure password"
          required
          type="password"
          value={password}
        />

        <Button fullWidth loading={isSubmitting} size="lg" type="submit">
          {isSubmitting ? "Creating account..." : "Create account"}
        </Button>
      </form>
    </AuthShell>
  );
}
