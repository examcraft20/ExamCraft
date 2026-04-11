import { Suspense } from "react";
import { Spinner } from "@examcraft/ui";
import { DashboardHome } from '@/components/layout/dashboard-home';

function DashboardPageFallback() {
  return (
    <section className="dashboard-loading-card">
      <Spinner />
      <span>Loading dashboard access...</span>
    </section>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardPageFallback />}>
      <DashboardHome />
    </Suspense>
  );
}
