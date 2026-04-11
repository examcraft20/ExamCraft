"use client";

import { useEffect, useState } from "react";
import { User, Mail, Shield, Building2 } from "lucide-react";
import { Spinner } from "@examcraft/ui";
import { getSupabaseBrowserSession } from "@/lib/supabase-browser";
import { useInstitution } from "@/hooks/use-institution";

export default function ProfilePage() {
  const { institutionName } = useInstitution();
  const [email, setEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      const session = await getSupabaseBrowserSession();
      if (!isMounted) return;
      setEmail(session?.user?.email ?? null);
      setIsLoading(false);
    }
    load();
    return () => { isMounted = false; };
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
            <User size={20} />
          </div>
          My Profile
        </h1>
        <p className="text-[#8b9bb4] text-sm font-medium mt-2">
          Manage your account settings and preferences.
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-[#1e293b] rounded-2xl border border-white/5 p-8 space-y-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-2xl font-black shadow-lg">
            {email ? email.charAt(0).toUpperCase() : "?"}
          </div>
          <div>
            <p className="text-xl font-bold text-white">{email ?? "Unknown User"}</p>
            <p className="text-sm text-[#8b9bb4]">Authenticated user</p>
          </div>
        </div>

        <div className="h-px bg-white/5" />

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Mail size={16} className="text-[#8b9bb4]" />
            <span className="text-sm text-[#cbd5e1]">{email ?? "—"}</span>
          </div>
          {institutionName && (
            <div className="flex items-center gap-3">
              <Building2 size={16} className="text-[#8b9bb4]" />
              <span className="text-sm text-[#cbd5e1]">{institutionName}</span>
            </div>
          )}
          <div className="flex items-center gap-3">
            <Shield size={16} className="text-[#8b9bb4]" />
            <span className="text-sm text-[#cbd5e1]">Roles managed by institution administrator</span>
          </div>
        </div>
      </div>
    </div>
  );
}
