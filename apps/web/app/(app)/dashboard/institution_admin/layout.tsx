import { ReactNode } from "react";
import { RoleGuard } from "@/components/auth/role-guard";

export default function InstitutionAdminLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard allowedRoles={["institution_admin"]}>
      {children}
    </RoleGuard>
  );
}
