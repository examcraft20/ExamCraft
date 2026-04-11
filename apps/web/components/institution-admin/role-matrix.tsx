"use client";

import { Card } from "@examcraft/ui";
import { Shield, ShieldCheck, User } from "lucide-react";

export function RoleMatrix() {
  return (
    <Card className="p-10 !bg-zinc-900 border-white/5 !rounded-[2.5rem] flex flex-col items-center justify-center gap-6">
      <div className="w-20 h-20 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
        <Shield size={40} />
      </div>
      <div className="text-center">
        <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Role Permissions Matrix</h3>
        <p className="text-zinc-500 font-medium text-sm mt-2">Coming soon: Granular control over faculty and reviewer permissions.</p>
      </div>
    </Card>
  );
}
