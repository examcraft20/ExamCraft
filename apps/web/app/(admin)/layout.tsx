"use client";

import { ReactNode } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";

type AdminLayoutRootProps = {
  children: ReactNode;
};

export default function AdminLayoutRoot({ children }: AdminLayoutRootProps) {
  return <AdminLayout>{children}</AdminLayout>;
}
