import { Metadata } from "next";
import { RoleDashboard } from "@/components/dashboard/shared/role-dashboard";

export const metadata: Metadata = {
  title: "Academic Oversight",
};

export default function AcademicHeadPage() {
  return <RoleDashboard role="academic_head" />;
}
