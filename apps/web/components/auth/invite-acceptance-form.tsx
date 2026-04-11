"use client";

import { Button, Input, StatusMessage } from "@examcraft/ui";
import { 
  KeyRound, 
  Ticket, 
  UserRound, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Building2, 
  ChevronRight,
  ArrowRight,
  Fingerprint,
  Mail,
  Lock
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { apiRequest } from "#api";
import { AuthShell } from "./auth-shell";

type InvitationPreviewResponse = {
  invitation: {
    institutionId: string;
    institutionName: string;
    email: string;
    roleCode: string;
    expiresAt: string;
  };
};

type InviteAcceptanceFormProps = {
  initialToken?: string;
};

export function InviteAcceptanceForm({ initialToken = "" }: InviteAcceptanceFormProps) {
  const [token, setToken] = useState(initialToken);
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [preview, setPreview] = useState<InvitationPreviewResponse["invitation"] | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const trimmedToken = useMemo(() => token.trim(), [token]);

  useEffect(() => {
    let isMounted = true;
    async function loadPreview() {
      if (!trimmedToken) {
        setPreview(null);
        return;
      }
      setIsLoadingPreview(true);
      try {
        const response = await apiRequest<InvitationPreviewResponse>(
          `/invitations/preview?token=${encodeURIComponent(trimmedToken)}`,
          { method: "GET" }
        );
        if (isMounted) setPreview(response.invitation);
      } catch (error) {
        if (isMounted) {
          setPreview(null);
          toast.error(error instanceof Error ? error.message : "Unable to preview invitation.");
        }
      } finally {
        if (isMounted) setIsLoadingPreview(false);
      }
    }
    void loadPreview();
    return () => { isMounted = false; };
  }, [trimmedToken]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await apiRequest<{ email: string; institutionId: string }>(
        "/invitations/accept",
        {
          method: "POST",
          body: JSON.stringify({ token: trimmedToken, password, displayName })
        }
      );
      toast.success(`Invitation accepted. Identity verified for ${response.email}.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to accept invitation.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Pedagogical Invitations"
      title="Join your institution"
      subtitle="Paste your unique cryptographic token to synchronize your identity with the institution workspace."
      brandTitle={
        <>
          Verified Access
          <br />
          <span>to Academic Excellence.</span>
        </>
      }
      brandSubtitle="Your institution has reserved a role-scoped workspace for you. Complete your profile to begin orchestrating."
      features={[
        "Automatic Role-Based Provisioning",
        "Encrypted Identity Synchronization",
        "Instant Institution Nexus Integration",
        "Priority Dashboard Activation"
      ]}
    >
      <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-6">
           <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center text-zinc-500 group-focus-within:text-indigo-400 transition-colors">
                 <Ticket size={20} />
              </div>
              <input
                 type="text"
                 value={token}
                 onChange={(e) => setToken(e.target.value)}
                 required
                 aria-label="Invitation Token"
                 placeholder="Paste Cryptographic Token"
                 className="w-full bg-slate-800/60 border border-white/20 rounded-xl py-5 pl-14 pr-6 text-sm font-black text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all duration-200 placeholder:text-slate-500 shadow-2xl"
              />
           </div>

           {isLoadingPreview ? (
             <div className="p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex items-center gap-4 animate-pulse">
                <Zap size={20} className="text-indigo-400" />
                <span className="text-xs font-black uppercase tracking-widest text-indigo-300">Synchronizing Token Data...</span>
             </div>
           ) : preview ? (
             <div className="group p-8 rounded-[2.5rem] bg-zinc-900 border border-white/5 shadow-2xl relative overflow-hidden transition-all hover:border-white/10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[40px] -z-10 group-hover:bg-indigo-500/10 transition-all" />
                
                <div className="flex items-center gap-5 mb-8">
                   <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 group-hover:text-indigo-400 group-hover:bg-white/10 transition-all shadow-glow-indigo">
                      <Building2 size={28} />
                   </div>
                   <div className="flex flex-col gap-0.5">
                      <h4 className="text-xl font-black tracking-tight text-white uppercase">{preview.institutionName}</h4>
                      <div className="flex items-center gap-3">
                         <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">{preview.roleCode.replace("_", " ")}</span>
                         <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
                         <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest leading-none">Verified Recipient</span>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-6">
                   <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">Authorized Email</span>
                      <span className="text-xs font-bold text-zinc-400 truncate">{preview.email}</span>
                   </div>
                   <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">Token Integrity</span>
                      <span className="text-xs font-bold text-emerald-500">VALIDATED</span>
                   </div>
                </div>
             </div>
           ) : null}
        </div>

        {preview && (
          <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
             <div className="grid gap-6">
                <div className="relative group">
                   <div className="absolute inset-y-0 left-4 flex items-center text-zinc-500 group-focus-within:text-indigo-400 transition-colors">
                      <UserRound size={18} />
                   </div>
                   <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      aria-label="Display Name"
                      placeholder="Institutional Identity Name"
                      className="w-full bg-slate-800/60 border border-white/20 rounded-xl py-4 pl-12 pr-6 text-sm font-bold text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all duration-200 placeholder:text-slate-500 shadow-xl"
                   />
                </div>

                <div className="relative group">
                   <div className="absolute inset-y-0 left-4 flex items-center text-zinc-500 group-focus-within:text-indigo-400 transition-colors">
                      <Lock size={18} />
                   </div>
                   <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      aria-label="Password"
                      placeholder="Access Key / Password"
                      className="w-full bg-slate-800/60 border border-white/20 rounded-xl py-4 pl-12 pr-6 text-sm font-bold text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all duration-200 placeholder:text-slate-500 shadow-xl"
                   />
                </div>
             </div>

             <Button 
                loading={isSubmitting} 
                fullWidth 
                size="lg" 
                type="submit"
                className="bg-white text-black py-6 rounded-2xl font-black text-lg shadow-glow hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
             >
                {isSubmitting ? "Orchestrating Entry..." : "Finalize Workspace Access"}
                {!isSubmitting && <ArrowRight size={20} strokeWidth={3} />}
             </Button>
          </div>
        )}
      </form>
    </AuthShell>
  );
}
