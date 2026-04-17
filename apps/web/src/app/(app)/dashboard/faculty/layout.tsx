import { ReactNode } from "react";
import { withRoleGuard } from "@/lib/with-role-guard";

export default async function FacultyLayout({ children }: { children: ReactNode }) {
  await withRoleGuard(["faculty", "academic_head", "institution_admin"]);

  return (
    <div className="flex flex-col gap-8">
      {children}
    </div>
  );
}
