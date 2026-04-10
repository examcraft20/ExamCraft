import { ReactNode, Suspense } from "react";
import { Spinner } from "@examcraft/ui";

export default function InstitutionAdminSubLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <Spinner size="lg" className="w-12 h-12" />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}
