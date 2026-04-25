import { ReactNode } from "react";
import { withRoleGuard } from "@/lib/with-role-guard";

export default async function ReviewerLayout({ children }: { children: ReactNode }) {
  await withRoleGuard(["reviewer_approver", "academic_head", "institution_admin"]);

  return (
    <div className="flex flex-col min-h-screen">
      {children}
    </div>
  );
}
