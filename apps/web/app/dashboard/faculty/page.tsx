import { Metadata } from "next";
import { FacultyDashboardClient } from "@/components/dashboard/faculty/home";

export const metadata: Metadata = {
  title: 'Dashboard',
}

export default function FacultyPage() {
  return <FacultyDashboardClient />;
}
