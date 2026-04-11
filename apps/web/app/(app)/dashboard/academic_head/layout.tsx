import { ReactNode } from "react";
import { RoleGuard } from "@/components/auth/role-guard";

export default function AcademicHeadLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard allowedRoles={["academic_head", "institution_admin"]}>
      {children}
    </RoleGuard>
  );
}
