"use client";

import { Suspense } from "react";
import { FeatureFlagsTable } from "@/components/admin/FeatureFlagsTable";
import { Spinner } from "@examcraft/ui";

export default function FeatureFlagsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black tracking-tighter text-white">Feature Flags</h1>
        <p className="text-zinc-400 font-medium">Manage platform features and experiments</p>
      </div>

      <Suspense
        fallback={
          <div className="flex h-96 items-center justify-center">
            <Spinner />
          </div>
        }
      >
        <FeatureFlagsTable />
      </Suspense>
    </div>
  );
}
