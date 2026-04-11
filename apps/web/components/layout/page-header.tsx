"use client";

import { ReactNode } from "react";
import { Breadcrumb } from "./breadcrumb";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  icon?: ReactNode;
  badge?: string;
}

export function PageHeader({ title, description, actions, icon, badge }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-6 mb-10">
      <Breadcrumb />
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-1">
          {badge && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-2 w-fit">
              {icon && <span className="text-current">{icon}</span>}
              {badge}
            </div>
          )}
          <h1 className="text-4xl font-black tracking-tighter text-white">
            {title}
          </h1>
          {description && (
            <p className="text-zinc-500 font-medium max-w-xl mt-1">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </div>
  );
}
