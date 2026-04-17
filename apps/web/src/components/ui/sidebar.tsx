"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useInstitution } from "@/hooks/use-institution";
import {
  LogOut,
  Settings,
  Hexagon,
  Gauge,
  FileText,
  Book,
  Layers,
  ClipboardList,
  BookOpen,
  LayoutTemplate,
  Bot,
  BarChart2,
  ShieldAlert,
  Users,
  Palette,
  CheckSquare,
  BookMarked,
  PieChart,
  LineChart,
} from "lucide-react";
import {
  getSupabaseBrowserClient,
  getSupabaseBrowserSession,
} from "@/lib/supabase-browser";
import { env } from "@/lib/env";

export function DashboardSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState<string | null>(null);
  const { institutionId, institutionName, isLoading } = useInstitution();

  // Determine role from pathname or session metadata
  // In the new flat structure, we might need a hook, but for now we attempt to detect from path
  // or use the session. Since layouts are role-guarded, the role is implicit.
  // For the sidebar to be dynamic, it needs to know the context.
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadUser() {
      const session = await getSupabaseBrowserSession();
      if (!isMounted) return;
      if (session?.user?.email) {
        setEmail(session.user.email);
        const user = session.user;
        setRole((user && 'user_metadata' in user ? user.user_metadata?.role : undefined) || "faculty");
      }
    }
    void loadUser();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSignOut = async () => {
    try {
      if (!env.demoMode) {
        const supabase = getSupabaseBrowserClient();
        await supabase.auth.signOut();
      }
      localStorage.removeItem("examcraft_institution");
      sessionStorage.clear();
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
      window.location.href = "/login";
    }
  };

  const navItems = role ? getRoleLinks(role, institutionId) : [];

  return (
    <aside className="w-64 flex-shrink-0 bg-[#0f152d] flex flex-col hidden md:flex sticky top-0 h-screen relative group/sidebar">
      <div className="px-6 py-8 pb-10 flex flex-col gap-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 group transition-transform"
        >
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full" />
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-xl font-bold">
              EC
              <div className="absolute w-2 h-2 rounded-full bg-cyan-400 blur-[1px]" />
            </div>
          </div>
          <span className="font-bold text-xl tracking-tight text-white mt-1">
            ExamCraft
          </span>
        </Link>

        {!isLoading && institutionName && (
          <div className="text-xs text-slate-500 truncate max-w-[180px] -mt-4">
            {institutionName}
          </div>
        )}
      </div>

      <div className="mx-4 border-t border-white/5" />

      <nav className="flex-1 px-4 pt-4 flex flex-col gap-1 overflow-y-auto pb-12">
        {navItems.map((item, iIdx) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <SidebarLink
              key={iIdx}
              href={item.href}
              icon={item.icon}
              label={item.label}
              isActive={isActive}
            />
          );
        })}
      </nav>

      <div className="p-6">
        <div className="w-full h-px bg-[#23314a]/50 mb-6" />
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2 w-full text-left font-bold transition-all hover:bg-white/5 rounded-xl group/logout"
        >
          <LogOut size={18} strokeWidth={2.5} className="text-[#f87171]" />
          <span className="text-[#f87171] text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
}

function SidebarLink({
  href,
  icon: Icon,
  label,
  isActive,
}: {
  href: string;
  icon: any;
  label: string;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group flex items-center justify-between px-3 py-3 rounded-xl text-sm font-semibold transition-all relative overflow-hidden ${
        isActive ? "bg-[#544bc3] text-white" : "text-[#8e9cba] hover:text-white"
      }`}
    >
      <div className="flex items-center gap-4 relative z-10">
        <div
          className={`transition-all duration-300 ${isActive ? "text-white" : "text-[#8e9cba] group-hover:text-white"}`}
        >
          <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
        </div>
        <span className="tracking-wide">{label}</span>
      </div>
      {isActive && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white rounded-full" />
      )}
    </Link>
  );
}

function getRoleLinks(role: string, instId: string | null) {
  const query = instId ? `?institutionId=${instId}` : "";

  switch (role) {
    case "faculty":
      return [
        { label: "Dashboard", href: `/dashboard${query}`, icon: Gauge },
        { label: "Generate Paper", href: `/papers/generate${query}`, icon: FileText },
        { label: "My Papers", href: `/papers${query}`, icon: Book },
        { label: "Question Bank", href: `/questions${query}`, icon: Layers },
        { label: "My Submissions", href: `/submissions${query}`, icon: ClipboardList },
        { label: "Templates", href: `/templates${query}`, icon: LayoutTemplate },
        { label: "AI Syllabus", href: `/syllabus-ai${query}`, icon: Bot },
        { label: "Settings", href: `/profile${query}`, icon: Settings },
      ];
    case "academic_head":
      return [
        { label: "Dashboard", href: `/dashboard${query}`, icon: Gauge },
        { label: "Approvals", href: `/approvals${query}`, icon: CheckSquare },
        { label: "Analytics", href: `/analytics${query}`, icon: BarChart2 },
        { label: "Audit Logs", href: `/audit-logs${query}`, icon: ShieldAlert },
        { label: "Settings", href: `/profile${query}`, icon: Settings },
      ];
    case "reviewer":
      return [
        { label: "Dashboard", href: `/dashboard${query}`, icon: Gauge },
        { label: "Review Queue", href: `/review${query}`, icon: ClipboardList },
        { label: "Settings", href: `/profile${query}`, icon: Settings },
      ];
    case "institution_admin":
      return [
        { label: "Dashboard", href: `/dashboard${query}`, icon: Gauge },
        { label: "Team", href: `/team${query}`, icon: Users },
        { label: "Approvals", href: `/approvals${query}`, icon: CheckSquare },
        { label: "Analytics", href: `/analytics${query}`, icon: PieChart },
        { label: "Academic Structure", href: `/structure${query}`, icon: BookOpen },
        { label: "Settings", href: `/settings${query}`, icon: Settings },
      ];
    case "super_admin":
      return [
        { label: "Platform Overview", href: `/dashboard${query}`, icon: Gauge },
        { label: "Tenants", href: `/tenants${query}`, icon: Hexagon },
        { label: "Subscription Plans", href: `/plans${query}`, icon: Palette },
        { label: "Feature Flags", href: `/flags${query}`, icon: Flag },
        { label: "Audit Logs", href: `/audit${query}`, icon: ShieldAlert },
      ];
    default:
      return [{ label: "Dashboard", href: `/dashboard${query}`, icon: Gauge }];
  }
}

// Missing import fix for Flag
import { Flag } from "lucide-react";
