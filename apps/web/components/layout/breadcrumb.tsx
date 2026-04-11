"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

export function Breadcrumb() {
  const pathname = usePathname();
  const paths = pathname.split("/").filter(Boolean);

  return (
    <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4">
      <Link href="/" className="hover:text-white transition-colors flex items-center gap-1.5">
        <Home size={12} />
        Home
      </Link>
      {paths.map((path, idx) => {
        const href = `/${paths.slice(0, idx + 1).join("/")}`;
        const isLast = idx === paths.length - 1;
        const label = path.replace(/-/g, " ");

        return (
          <div key={path} className="flex items-center gap-2">
            <ChevronRight size={10} className="text-zinc-700" />
            <Link
              href={href}
              className={`transition-colors ${isLast ? "text-indigo-400 pointer-events-none" : "hover:text-white"}`}
            >
              {label}
            </Link>
          </div>
        );
      })}
    </nav>
  );
}
