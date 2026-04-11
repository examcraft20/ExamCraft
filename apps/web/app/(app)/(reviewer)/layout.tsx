import { ReactNode } from "react";
import { RoleGuard } from "@/components/auth/role-guard";

export default function ReviewerLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard allowedRoles={["reviewer"]}>
      {children}
    </RoleGuard>
  );
}
