import { Metadata } from "next";
import { RoleDashboard } from "@/components/dashboard/shared/role-dashboard";

export const metadata: Metadata = {
  title: "Review & Approval",
};

export default function ReviewerPage() {
  return <RoleDashboard role="reviewer_approver" />;
}
