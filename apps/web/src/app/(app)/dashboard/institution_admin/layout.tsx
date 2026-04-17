import { ReactNode } from "react";
import { withRoleGuard } from "@/lib/with-role-guard";

export default async function InstitutionAdminLayout({ children }: { children: ReactNode }) {
  await withRoleGuard("institution_admin");

  return (
    <div className="flex flex-col min-h-screen">
      {children}
    </div>
  );
}
