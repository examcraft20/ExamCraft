"use client";

import { useSearchParams } from "next/navigation";
import { Clock } from "lucide-react";
import { Card } from "@examcraft/ui";

export default function ApprovalHistoryPage() {
  const searchParams = useSearchParams();
  const institutionId = searchParams.get("institutionId") ?? "";

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full pb-20">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-black text-white tracking-tight">Approval History</h2>
        <p className="text-sm font-medium text-slate-400">
          Archive of papers you have approved or rejected
        </p>
      </div>
      
      <Card className="!bg-zinc-900 border-white/5 !rounded-[2.5rem] p-20 flex flex-col items-center justify-center gap-4 border-dashed">
        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-zinc-500 mb-4">
          <Clock size={40} />
        </div>
        <h3 className="text-xl font-bold text-white">History tracking is coming soon</h3>
        <p className="text-center text-slate-400 font-medium max-w-md">
          Once you start approving and rejecting papers, the audit history will appear here with reviewer comments.
        </p>
      </Card>
    </div>
  );
}
