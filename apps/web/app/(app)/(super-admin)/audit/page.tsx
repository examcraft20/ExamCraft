"use client";

import { Suspense } from "react";
import { AuditLogsTable } from '@/components/super-admin/audit-logs-table';
import { Spinner } from "@examcraft/ui";

export default function AuditLogsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black tracking-tighter text-white">Audit Logs</h1>
        <p className="text-zinc-400 font-medium">Cross-tenant activity and system events</p>
      </div>

      <Suspense
        fallback={
          <div className="flex h-96 items-center justify-center">
            <Spinner />
          </div>
        }
      >
        <AuditLogsTable />
      </Suspense>
    </div>
  );
}
