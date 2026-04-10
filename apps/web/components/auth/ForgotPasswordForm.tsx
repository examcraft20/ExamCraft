"use client";

import { useState } from "react";
import { Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button, Input, StatusMessage } from "@examcraft/ui";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { env } from "@/lib/env";
import Link from "next/link";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setStatus(null);

    const supabase = getSupabaseBrowserClient();

    // Redirect goes to the reset-password page we just built
    const redirectUrl = `${window.location.origin}/auth/reset-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (error) {
      setStatus({ type: "error", message: error.message });
      setIsLoading(false);
    } else {
      setStatus({
        type: "success",
        message:
          "If an account exists, a password reset link has been sent to your email.",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[400px]">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-black text-white tracking-tight mb-2">
          Forgot Password?
        </h2>
        <p className="text-slate-400 font-medium text-sm">
          No worries. Enter your email and we&apos;ll send you reset
          instructions.
        </p>
      </div>

      <form onSubmit={handleResetRequest} className="space-y-6">
        {status && (
          <StatusMessage variant={status.type} className="mb-4">
            {status.type === "success" && (
              <CheckCircle2 size={16} className="inline mr-2" />
            )}
            {status.message}
          </StatusMessage>
        )}

        <div className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            leftIcon={<Mail size={16} />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading || status?.type === "success"}
            placeholder="name@institution.edu"
            required
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white py-6 rounded-xl font-black shadow-glow group"
          disabled={isLoading || status?.type === "success"}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">Sending...</span>
          ) : status?.type === "success" ? (
            "Email Sent"
          ) : (
            <span className="flex items-center gap-2">
              Send Reset Link
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </span>
          )}
        </Button>
      </form>

      <div className="mt-8 text-center">
        <Link
          href="/login"
          className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
}
