"use client";

import { useState, useEffect } from "react";
import { Lock, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button, Input, StatusMessage } from "@examcraft/ui";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

export function ResetPasswordForm({ token }: { token?: string }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // When Supabase processes the #access_token=... hash from the reset email,
  // it establishes a session automatically if it's valid.

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setStatus({ type: "error", message: "Passwords do not match." });
      return;
    }
    if (password.length < 6) {
      setStatus({
        type: "error",
        message: "Password must be at least 6 characters.",
      });
      return;
    }

    setIsLoading(true);
    setStatus(null);

    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setStatus({ type: "error", message: error.message });
      setIsLoading(false);
    } else {
      setStatus({
        type: "success",
        message:
          "Password updated successfully. You can now log in with your new password.",
      });
      setIsLoading(false);
      // Automatically redirect to login after 3 seconds
      setTimeout(() => {
        window.location.href = "/login";
      }, 3000);
    }
  };

  return (
    <div className="w-full max-w-[400px]">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-black text-white tracking-tight mb-2">
          Reset Password
        </h2>
        <p className="text-slate-400 font-medium text-sm">
          Enter your new password to secure your account.
        </p>
      </div>

      <form onSubmit={handleReset} className="space-y-6">
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
            label="New Password"
            type="password"
            leftIcon={<Lock size={16} />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading || status?.type === "success"}
            placeholder="••••••••"
            required
          />

          <Input
            label="Confirm New Password"
            type="password"
            leftIcon={<Lock size={16} />}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isLoading || status?.type === "success"}
            placeholder="••••••••"
            required
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white py-6 rounded-xl font-black shadow-glow group"
          disabled={isLoading || status?.type === "success"}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">Updating...</span>
          ) : status?.type === "success" ? (
            "Password Updated"
          ) : (
            <span className="flex items-center gap-2">
              Update Password
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </span>
          )}
        </Button>
      </form>
    </div>
  );
}
