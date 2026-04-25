"use client";

import { Button } from "@examcraft/ui";
import { 
  Ticket, 
  UserRound, 
  Zap, 
  Building2, 
  ArrowRight,
  Lock,
  AlertCircle,
  Loader2
} from "lucide-react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api/client";
import { AuthShell } from "./auth-shell";
import { useRouter } from "next/navigation";

interface InvitationData {
  institutionId: string;
  institutionName: string;
  email: string;
  roleCode: string;
  expiresAt: string;
}

interface InviteAcceptanceFormProps {
  initialToken?: string;
  initialData?: InvitationData | null;
  initialError?: string | null;
}

export function InviteAcceptanceForm({ 
  initialToken = "", 
  initialData = null, 
  initialError = null 
}: InviteAcceptanceFormProps) {
  const router = useRouter();
  const [token, setToken] = useState(initialToken);
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isLoading) return;

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiRequest<{ email: string; institutionId: string }>(
        "/invitations/accept",
        {
          method: "POST",
          body: JSON.stringify({ token, password, displayName })
        }
      );
      toast.success(`Invitation accepted for ${response.email}. Redirecting to workspace...`);
      router.push("/dashboard");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to accept invitation";
      toast.error(message);
      setIsLoading(false);
    }
  }

  if (initialError) {
    return (
      <AuthShell
        eyebrow="Invitation Access"
        title="Invalid Invitation"
        subtitle="The invitation token is invalid or has expired."
        brandTitle={
          <>
            Invitation token
            <br />
            <span>could not be verified.</span>
          </>
        }
        brandSubtitle="This access link is no longer valid. Ask your institution admin to resend the invitation."
        features={[
          "Time-bound invitation tokens",
          "Institution-scoped workspace access",
          "Role-based onboarding validation",
          "Secure identity provisioning"
        ]}
      >
        <div className="p-8 rounded-2xl bg-red-500/10 border border-red-500/20 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-white font-bold mb-6">{initialError}</p>
          <Button onClick={() => router.push("/login")} fullWidth>
            Back to Login
          </Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="Pedagogical Invitations"
      title="Join your institution"
      subtitle="Complete your profile to synchronize your identity with the institution workspace."
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
                 disabled={!!initialData}
                 onChange={(e) => setToken(e.target.value)}
                 required
                 aria-label="Invitation Token"
                 placeholder="Invitation Token"
                 className="w-full bg-slate-800/60 border border-white/20 rounded-xl py-5 pl-14 pr-6 text-sm font-black text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all duration-200 placeholder:text-slate-500 shadow-2xl disabled:opacity-50"
              />
           </div>

           {initialData && (
             <div className="group p-8 rounded-[2.5rem] bg-zinc-900 border border-white/5 shadow-2xl relative overflow-hidden transition-all hover:border-white/10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[40px] -z-10 group-hover:bg-indigo-500/10 transition-all" />
                
                <div className="flex items-center gap-5 mb-8">
                   <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 group-hover:text-indigo-400 group-hover:bg-white/10 transition-all">
                      <Building2 size={28} />
                   </div>
                   <div className="flex flex-col gap-0.5">
                      <h4 className="text-xl font-black tracking-tight text-white uppercase">{initialData.institutionName}</h4>
                      <div className="flex items-center gap-3">
                         <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">{initialData.roleCode.replace("_", " ")}</span>
                         <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
                         <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest leading-none">Verified Recipient</span>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-6">
                   <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">Authorized Email</span>
                      <span className="text-xs font-bold text-zinc-400 truncate">{initialData.email}</span>
                   </div>
                   <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">Token Integrity</span>
                      <span className="text-xs font-bold text-emerald-500">VALIDATED</span>
                   </div>
                </div>
             </div>
           )}
        </div>

        {initialData && (
          <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
             <div className="grid gap-6">
                <div className="relative group">
                   <div className="absolute inset-y-0 left-4 flex items-center text-zinc-500 group-focus-within:text-indigo-400 transition-colors">
                      <UserRound size={18} />
                   </div>
                   <input
                      type="text"
                      value={displayName}
                      disabled={isLoading}
                      onChange={(e) => setDisplayName(e.target.value)}
                      required
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
                      disabled={isLoading}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      aria-label="Password"
                      placeholder="Access Key / Password"
                      className="w-full bg-slate-800/60 border border-white/20 rounded-xl py-4 pl-12 pr-6 text-sm font-bold text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all duration-200 placeholder:text-slate-500 shadow-xl"
                   />
                </div>
             </div>

             <Button 
                loading={isLoading} 
                fullWidth 
                size="lg" 
                type="submit"
                className="bg-white text-black py-6 rounded-2xl font-black text-lg shadow-glow hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
             >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Orchestrating Entry...
                  </>
                ) : (
                  <>
                    Finalize Workspace Access
                    <ArrowRight size={20} strokeWidth={3} />
                  </>
                )}
             </Button>
          </div>
        )}
      </form>
    </AuthShell>
  );
}
