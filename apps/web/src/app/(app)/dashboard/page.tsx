import { Suspense } from "react";
import { Spinner } from "@examcraft/ui";
import { DashboardHome } from '@/components/layout/dashboard-home';

function DashboardPageFallback() {
  return (
    <div className="p-8 space-y-6 w-full animate-pulse">
      <div className="h-10 w-64 bg-zinc-800 rounded-lg"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-zinc-800 rounded-xl border border-zinc-800/50"></div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-96 bg-zinc-800 rounded-xl border border-zinc-800/50"></div>
        <div className="h-96 bg-zinc-800 rounded-xl border border-zinc-800/50"></div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardPageFallback />}>
      <DashboardHome />
    </Suspense>
  );
}
