"use client";

import { useState, useEffect } from "react";
import { Lock, ArrowRight, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { Button, Input, StatusMessage } from "@examcraft/ui";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function ResetPasswordForm({ token }: { token?: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || isSuccess) return;

    if (password !== confirmPassword) {
      setErrorStatus("Passwords do not match.");
      toast.error("Mismatch: Passwords must be identical.");
      return;
    }
    if (password.length < 8) {
      setErrorStatus("Password must be at least 8 characters.");
      toast.error("Standardization Fault: 8-character minimum required.");
      return;
    }

    setIsLoading(true);
    setErrorStatus(null);

    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setErrorStatus(error.message);
      toast.error(error.message);
      setIsLoading(false);
    } else {
      setIsSuccess(true);
      toast.success("Security keys successfully synchronized.");
      
      // Automatically redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    }
  };

  return (
    <div className="w-full max-w-[400px] animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="mb-10 text-center">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 mx-auto mb-6 shadow-2xl">
           <ShieldCheck size={32} />
        </div>
        <h2 className="text-3xl font-black text-white tracking-tight mb-2 uppercase italic">
          Reset Identity
        </h2>
        <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest mt-2">
          Synchronize new credentials with the global item bank.
        </p>
      </div>

      <form onSubmit={handleReset} className="space-y-8">
        {errorStatus && (
          <StatusMessage variant="error" className="animate-in shake">
            {errorStatus}
          </StatusMessage>
        )}

        {isSuccess && (
          <StatusMessage variant="success" className="animate-in zoom-in">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={18} />
              <span>Identity keys updated. Redirecting...</span>
            </div>
          </StatusMessage>
        )}

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 ml-1">
              New Blueprint Password
            </label>
            <Input
              type="password"
              leftIcon={<Lock size={16} className="text-zinc-500" />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading || isSuccess}
              placeholder="••••••••"
              className="bg-zinc-900/50 border-white/10 h-14 rounded-xl px-4 text-white focus:border-indigo-500/50 transition-all font-mono"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 ml-1">
              Confirm New Blueprint
            </label>
            <Input
              type="password"
              leftIcon={<Lock size={16} className="text-zinc-500" />}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading || isSuccess}
              placeholder="••••••••"
              className="bg-zinc-900/50 border-white/10 h-14 rounded-xl px-4 text-white focus:border-indigo-500/50 transition-all font-mono"
              required
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-white text-black hover:bg-zinc-200 py-6 rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95 group disabled:opacity-50 disabled:scale-100"
          disabled={isLoading || isSuccess}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : isSuccess ? (
            "KEYS SYNCHRONIZED"
          ) : (
            <div className="flex items-center gap-3">
              <span>Execute Reset</span>
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </div>
          )}
        </Button>
      </form>

      <div className="mt-12 text-center">
         <p className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.3em]">
           Secured by ExamCraft Institutional Crypto
         </p>
      </div>
    </div>
  );
}
