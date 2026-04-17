"use client";

import { Suspense } from "react";
import { AnalyticsDashboard } from "@/components/analytics/dashboard";
import { useAdminContext } from "@/hooks/use-admin-context";
import { Spinner } from "@examcraft/ui";

function DashboardLoading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Spinner size="lg" />
    </div>
  );
}

function InstitutionAdminDashboardContent() {
  const { accessToken, institutionId, isReady } = useAdminContext();

  if (!isReady || !accessToken || !institutionId) {
    return <DashboardLoading />;
  }

  return (
    <AnalyticsDashboard 
      accessToken={accessToken} 
      institutionId={institutionId} 
    />
  );
}

export default function InstitutionAdminDashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <InstitutionAdminDashboardContent />
    </Suspense>
  );
}
