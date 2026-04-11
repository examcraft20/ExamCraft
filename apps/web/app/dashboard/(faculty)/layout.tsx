import { ReactNode } from "react";

export default function FacultyLayout({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-8">{children}</div>;
}
