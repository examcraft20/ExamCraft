import { ReactNode } from "react";
import { RoleGuard } from "@/components/auth/role-guard";

export default function SuperAdminLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard allowedRoles={["super_admin"]}>
      {children}
    </RoleGuard>
  );
}
