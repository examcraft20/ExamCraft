"use client";

import Link from "next/link";
import { Card } from "@examcraft/ui";
import { ShieldX, ArrowLeft } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
      <Card className="w-full max-w-md !bg-zinc-900/80 border-white/10 !rounded-[2rem] p-10 text-center shadow-2xl relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-red-500/5 blur-[80px] -z-10" />

        {/* Icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
          <ShieldX size={32} className="text-red-400" />
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Access Denied</h1>

        {/* Subtext */}
        <p className="text-zinc-400 font-medium mb-8">
          You don't have permission to access this area. This section is reserved for platform administrators only.
        </p>

        {/* Button */}
        <Link href="/dashboard">
          <button className="w-full px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-95">
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
        </Link>
      </Card>
    </div>
  );
}
