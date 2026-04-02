"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { getSupabaseBrowserClient } from "../../lib/supabase-browser";

export function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

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
      setStatus(error.message);
      setIsSubmitting(false);
      return;
    }

    setStatus("Account created. If email confirmation is disabled, you can sign in immediately.");
    setIsSubmitting(false);
  }

  return (
    <form className="panel form-panel" onSubmit={handleSubmit}>
      <div>
        <p className="eyebrow">Auth</p>
        <h1>Create your ExamCraft account</h1>
        <p className="subtle">
          This account becomes the first institution admin when you create a new tenant in the
          onboarding flow.
        </p>
      </div>

      <label className="field">
        <span>Display name</span>
        <input
          onChange={(event) => setDisplayName(event.target.value)}
          placeholder="Academic coordinator"
          value={displayName}
        />
      </label>

      <label className="field">
        <span>Email</span>
        <input
          autoComplete="email"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="admin@institution.edu"
          required
          type="email"
          value={email}
        />
      </label>

      <label className="field">
        <span>Password</span>
        <input
          autoComplete="new-password"
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Create a secure password"
          required
          type="password"
          value={password}
        />
      </label>

      <button className="primary-button" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Creating account..." : "Create account"}
      </button>

      {status ? <p className="status-message">{status}</p> : null}

      <div className="inline-links">
        <Link href="/login">Already have an account?</Link>
        <Link href="/onboarding">Go to institution onboarding</Link>
      </div>
    </form>
  );
}
