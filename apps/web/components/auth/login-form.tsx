"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { getSupabaseBrowserClient } from "../../lib/supabase-browser";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      setStatus(error.message);
      setIsSubmitting(false);
      return;
    }

    setStatus("Signed in successfully. Continue to institution onboarding.");
    setIsSubmitting(false);
  }

  return (
    <form className="panel form-panel" onSubmit={handleSubmit}>
      <div>
        <p className="eyebrow">Auth</p>
        <h1>Sign in to ExamCraft</h1>
        <p className="subtle">
          Use your Supabase-backed account to access onboarding, tenant setup, and invited
          institution workflows.
        </p>
      </div>

      <label className="field">
        <span>Email</span>
        <input
          autoComplete="email"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="faculty@institution.edu"
          required
          type="email"
          value={email}
        />
      </label>

      <label className="field">
        <span>Password</span>
        <input
          autoComplete="current-password"
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter your password"
          required
          type="password"
          value={password}
        />
      </label>

      <button className="primary-button" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>

      {status ? <p className="status-message">{status}</p> : null}

      <div className="inline-links">
        <Link href="/signup">Create a new account</Link>
        <Link href="/onboarding">Create institution workspace</Link>
        <Link href="/invite">Accept invitation</Link>
      </div>
    </form>
  );
}
