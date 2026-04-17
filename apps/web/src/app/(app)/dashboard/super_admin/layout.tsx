import { ReactNode } from "react";
import { withRoleGuard } from "@/lib/with-role-guard";

export default async function SuperAdminLayout({ children }: { children: ReactNode }) {
  await withRoleGuard("super_admin");

  return (
    <div className="flex flex-col min-h-screen">
      {children}
    </div>
  );
}
