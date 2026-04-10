"use client";

import { Mail, Lock, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { apiRequest } from "#api";

export function InviteAcceptanceCard({ token }: { token: string }) {
  const router = useRouter();
  const [preview, setPreview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiRequest<{
          invitation: {
            id: string;
            institutionId: string;
            email: string;
            roleCode: string;
            status: string;
            expiresAt: string;
            institutionName: string;
          };
        }>("/invitations/preview?token=" + encodeURIComponent(token));
        setPreview(res.invitation);
      } catch (e) {
        toast.error("Invalid or expired invite");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Passwords don't match");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be 8+ characters");
      return;
    }
    setSubmitting(true);
    try {
      await apiRequest("/invitations/accept", {
        method: "POST",
        body: JSON.stringify({ token, password, displayName: fullName }),
      });
      toast.success("Invite accepted!");
      router.push("/dashboard");
    } catch (e) {
      toast.error("Failed to accept invite");
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-slate-300">Loading...</div>
      </div>
    );
  }

  if (!preview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-red-400">Invalid invite</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-10 h-10 rounded-lg bg-white text-black font-bold flex items-center justify-center mx-auto mb-4">
              E
            </div>
            <div className="inline-block px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-4">
              {preview.institutionName}
            </div>
            <h1 className="text-2xl font-bold text-white">
              You&apos;re invited!
            </h1>
          </div>

          <div className="mb-8 space-y-3">
            <div className="text-center">
              <p className="text-slate-400 text-sm mb-1">Joining</p>
              <p className="text-white font-semibold mb-3">
                {preview.institutionName}
              </p>
              <div className="inline-block px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium">
                {preview.roleCode.replace(/_/g, " ")}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-slate-700/20 border border-slate-600/30 flex items-center gap-2">
              <Mail size={16} className="text-slate-400" />
              <span className="text-sm text-slate-300">{preview.email}</span>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
                className="w-full bg-slate-800/60 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8+ characters"
                className="w-full bg-slate-800/60 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
                required
              />
              <p className="text-xs text-slate-500 mt-1">
                At least 8 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Confirm password"
                className="w-full bg-slate-800/60 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
                required
              />
              {confirm && password !== confirm && (
                <p className="text-xs text-red-400 mt-1">
                  Passwords don&apos;t match
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all mt-6"
            >
              {submitting ? "Setting up..." : "Accept Invite & Join"}
              {!submitting && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500">
            By accepting, you agree to our Terms of Service
          </p>
        </div>
      </div>
    </div>
  );
}
