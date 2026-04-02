import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Spinner } from "@examcraft/ui";
import { RoleDashboard } from "../../../components/dashboard/role-dashboard";
import type { AppRole } from "../../../lib/dashboard";

const supportedRoles: AppRole[] = [
  "super_admin",
  "institution_admin",
  "academic_head",
  "reviewer_approver",
  "faculty"
];

export default function RoleDashboardPage({ params }: { params: { role: string } }) {
  if (!supportedRoles.includes(params.role as AppRole)) {
    notFound();
  }

  return (
    <Suspense
      fallback={
        <section className="dashboard-loading-card">
          <Spinner />
          <span>Loading role dashboard...</span>
        </section>
      }
    >
      <RoleDashboard role={params.role as AppRole} />
    </Suspense>
  );
}
