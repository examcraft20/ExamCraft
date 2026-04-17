"use client";

import { Mail, Lock, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api/client";

interface InvitationData {
  id: string;
  institutionId: string;
  email: string;
  roleCode: string;
  status: string;
  expiresAt: string;
  institutionName: string;
}

interface InviteAcceptanceCardProps {
  token: string;
  initialData?: InvitationData | null;
  initialError?: string | null;
}

export function InviteAcceptanceCard({ token, initialData, initialError }: InviteAcceptanceCardProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isLoading) return;

    if (password !== confirm) {
      toast.error("Passwords don't match");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);
    try {
      await apiRequest("/invitations/accept", {
        method: "POST",
        body: JSON.stringify({ token, password, displayName: fullName }),
      });
      toast.success("Invitation accepted! Welcome to ExamCraft.");
      router.push("/dashboard");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to accept invitation";
      toast.error(message);
      setIsLoading(false);
    }
  }

  if (initialError || (!initialData && !token)) {
    return (
      <div className="min-h-screen bg-[#0A0C10] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center backdrop-blur-xl">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="text-red-500 w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Invalid or Expired Invite</h2>
          <p className="text-slate-400 mb-8">
            {initialError || "This invitation link is invalid or has already been used."}
          </p>
          <button
            onClick={() => router.push("/login")}
            className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors font-medium"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  const preview = initialData;

  if (!preview) {
    return (
      <div className="min-h-screen bg-[#0A0C10] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0C10] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-lg relative z-10 transition-all duration-1000 animate-in fade-in zoom-in-95">
        <div className="bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl rounded-[2rem] p-8 shadow-2xl">
          <div className="text-center mb-10">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white font-black flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/20 rotate-3">
              EC
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-indigo-300 text-[10px] font-black uppercase tracking-widest mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              {preview.institutionName}
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Welcome Aboard
            </h1>
            <p className="text-slate-400 mt-2 font-medium">Complete your institutional profile</p>
          </div>

          <div className="mb-10 space-y-4">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col items-center text-center">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 text-center">Allocated Role</p>
              <div className="px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-black uppercase tracking-widest mb-4">
                {preview.roleCode.replace(/_/g, " ")}
              </div>
              <div className="flex items-center gap-2 text-slate-300 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                <Mail size={14} className="text-indigo-400" />
                <span className="text-xs font-bold">{preview.email}</span>
              </div>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
                Full Display Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Dr. Jane Smith"
                className="w-full bg-white/[0.03] border border-white/10 focus:border-indigo-500/50 rounded-2xl px-5 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
                  Password
                </label>
                <div className="relative group">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/[0.03] border border-white/10 focus:border-indigo-500/50 rounded-2xl px-5 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium group-hover:border-white/20"
                    required
                  />
                  <Lock size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-500 transition-colors" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
                  Confirm
                </label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full bg-white/[0.03] border ${confirm && password !== confirm ? 'border-red-500/50' : 'border-white/10'} focus:border-indigo-500/50 rounded-2xl px-5 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium`}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 bg-white text-black hover:bg-slate-200 disabled:opacity-50 font-black py-5 rounded-[1.25rem] transition-all mt-8 group active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Synchronizing...</span>
                </>
              ) : (
                <>
                  <span>Activate Workspace</span>
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <footer className="mt-10 text-center">
            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em]">
              Secured by ExamCraft Cryptography
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
