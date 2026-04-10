"use client";

import { Suspense } from "react";
import { PlatformOverviewContent } from "@/components/admin/PlatformOverviewContent";
import { Spinner } from "@examcraft/ui";

export default function PlatformOverviewPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black tracking-tighter text-white">Platform Overview</h1>
        <p className="text-zinc-400 font-medium">Real-time insights across all tenants</p>
      </div>

      <Suspense
        fallback={
          <div className="flex h-96 items-center justify-center">
            <Spinner />
          </div>
        }
      >
        <PlatformOverviewContent />
      </Suspense>
    </div>
  );
}
