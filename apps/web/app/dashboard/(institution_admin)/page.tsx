import { Metadata } from "next";
import { RoleDashboard } from "@/components/dashboard/shared/role-dashboard";

export const metadata: Metadata = {
  title: "Institution Administration",
};

export default function InstitutionAdminPage() {
  return <RoleDashboard role="institution_admin" />;
}
