"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useInstitution } from "../../../hooks/use-institution";
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
  LineChart
} from "lucide-react";
import { getSupabaseBrowserClient, getSupabaseBrowserSession } from "../../../lib/supabase-browser";
import { env } from "../../../lib/env";

export function DashboardSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState<string | null>(null);
  const { institutionId, institutionName, isLoading } = useInstitution();
  
  const paramRole = undefined; // Removed useParams string matching for simplify here
  const pathnameRole = (() => {
    const match = pathname.match(/^\/dashboard\/([^/]+)/);
    if (!match) return undefined;
    const seg = match[1];
    const knownRoles = ["faculty", "head", "reviewer", "super_admin", "institution_admin", "reviewer_approver", "academic_head"];
    return knownRoles.includes(seg) ? seg : undefined;
  })();
  const role = paramRole ?? pathnameRole;

  useEffect(() => {
    let isMounted = true;
    async function loadUser() {
      const session = await getSupabaseBrowserSession();
      if (!isMounted) return;
      if (session?.user?.email) {
        setEmail(session.user.email);
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
      
      // 2. Clear any local storage items
      localStorage.removeItem('examcraft_institution');
      localStorage.removeItem('examcraft_template_draft');
      localStorage.removeItem('sb-access-token');
      localStorage.removeItem('sb-refresh-token');
      
      // 3. Clear session storage
      sessionStorage.clear();
      
      // 4. Hard redirect
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/login';
    }
  };

  const navItems = role ? getRoleLinks(role, institutionId) : [];

  return (
    <aside className="w-64 flex-shrink-0 bg-[#0f152d] flex flex-col hidden md:flex sticky top-0 h-screen relative group/sidebar">
      {/* Signature Logo Area - ExamCraft */}
      <div className="px-6 py-8 pb-10 flex flex-col gap-6">
        <Link href="/dashboard" className="flex items-center gap-3 group transition-transform">
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
        
        {/* Institution Name */}
        {!isLoading && institutionName && (
          <div className="text-xs text-slate-500 truncate max-w-[180px] -mt-4">
            {institutionName}
          </div>
        )}
        {isLoading && (
          <div className="animate-pulse bg-white/10 rounded h-3 w-24 -mt-4" />
        )}
      </div>

      <div className="mx-4 border-t border-white/5" />
      
      <nav className="flex-1 px-4 pt-4 flex flex-col gap-1 overflow-y-auto pb-12 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {navItems.map((item, iIdx) => {
          const hrefParts = item.href.split("?");
          const hrefPath = hrefParts[0];
          const hrefQuery = hrefParts[1] || "";
          const hrefSearch = new URLSearchParams(hrefQuery);
          
          let isActive = false;
          
          const currentTab = searchParams.get("tab");
          const targetTab = hrefSearch.get("tab");
          
          const isRootRolePath = hrefPath.endsWith(`/${role}`);
          
          if (hrefPath === pathname) {
            // Exact path match
            if (targetTab) {
              isActive = currentTab === targetTab;
            } else {
              isActive = !currentTab;
            }
          } else if (!isRootRolePath && !item.href.includes("?") && pathname.startsWith(hrefPath + "/")) {
            // Prefix match for deep pages, but don't let root dashboard match sub-pages
            isActive = true;
          }

          if ((item as any).isActive !== undefined) isActive = (item as any).isActive;

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

      {/* User Footer Card - Logout Only */}
      <div className="p-6">
         <div className="w-full h-px bg-[#23314a]/50 mb-6" />
         <button 
           onClick={handleSignOut}
           className="flex items-center gap-3 px-3 py-2 w-full text-left font-bold transition-all hover:bg-white/5 rounded-xl group/logout"
         >
           <LogOut size={18} strokeWidth={2.5} className="text-[#f87171] group-hover/logout:scale-110 transition-transform" />
           <span className="text-[#f87171] text-sm">Logout</span>
         </button>
      </div>
    </aside>
  );
}

function SidebarLink({ href, icon: Icon, label, isActive }: { href: string; icon: any; label: string; isActive: boolean; }) {
  return (
    <Link
      href={href}
      className={`group flex items-center justify-between px-3 py-3 rounded-xl text-sm font-semibold transition-all relative overflow-hidden ${
        isActive 
          ? "bg-[#544bc3] text-white" 
          : "text-[#8e9cba] hover:text-white"
      }`}
    >
      <div className="flex items-center gap-4 relative z-10">
        <div className={`transition-all duration-300 ${isActive ? "text-white" : "text-[#8e9cba] group-hover:text-white"}`}>
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
  const base = `/dashboard/${role}`;

  // Fix 7 - No longer appending institutionId to the navigation links.
  switch (role) {
    case "faculty":
      return [
        { label: "Dashboard", href: `${base}${instId ? `?institutionId=${instId}` : ""}`, icon: Gauge },
        { label: "Generate Paper", href: `/dashboard/faculty/papers/new${instId ? `?institutionId=${instId}` : ""}`, icon: FileText },
        { label: "My Papers", href: `/dashboard/faculty/papers${instId ? `?institutionId=${instId}` : ""}`, icon: Book },
        { label: "Question Bank", href: `/dashboard/faculty/questions${instId ? `?institutionId=${instId}` : ""}`, icon: Layers },
        { label: "My Submissions", href: `/dashboard/faculty/submissions${instId ? `?institutionId=${instId}` : ""}`, icon: ClipboardList },
        { label: "My Subjects", href: `/dashboard/faculty/subjects${instId ? `?institutionId=${instId}` : ""}`, icon: BookOpen },
        { label: "Templates", href: `/dashboard/faculty/templates${instId ? `?institutionId=${instId}` : ""}`, icon: LayoutTemplate },
        { label: "AI from Syllabus", href: `/dashboard/faculty/syllabus-ai${instId ? `?institutionId=${instId}` : ""}`, icon: Bot },
        { label: "Settings", href: `/dashboard/faculty/settings${instId ? `?institutionId=${instId}` : ""}`, icon: Settings },
      ];
    case "head":
    case "academic_head":
      return [
        { label: "Overview", href: `${base}/overview${instId ? `?institutionId=${instId}` : ""}`, icon: Gauge },
        { label: "Analytics", href: `/dashboard/head/analytics${instId ? `?institutionId=${instId}` : ""}`, icon: BarChart2 },
        { label: "Audit Logs", href: `/dashboard/head/audit-logs${instId ? `?institutionId=${instId}` : ""}`, icon: ShieldAlert }
      ];
    case "institution_admin":
      return [
        { label: "Dashboard", href: `${base}${instId ? `?institutionId=${instId}` : ""}`, icon: Gauge },
        { label: "Manage Faculty", href: `/dashboard/institution_admin/manage-faculty${instId ? `?institutionId=${instId}` : ""}`, icon: Users },
        { label: "Approve Questions", href: `/dashboard/institution_admin/approve-questions${instId ? `?institutionId=${instId}` : ""}`, icon: CheckSquare },
        { label: "Approve Papers", href: `/dashboard/institution_admin/approve-papers${instId ? `?institutionId=${instId}` : ""}`, icon: BookMarked },
        { label: "Manage Questions", href: `/dashboard/institution_admin/manage-questions${instId ? `?institutionId=${instId}` : ""}`, icon: Layers },
        { label: "Analytics", href: `/dashboard/institution_admin/analytics${instId ? `?institutionId=${instId}` : ""}`, icon: PieChart },
        { label: "Reports", href: `/dashboard/institution_admin/reports${instId ? `?institutionId=${instId}` : ""}`, icon: LineChart },
        { label: "Subjects", href: `/dashboard/institution_admin/subjects${instId ? `?institutionId=${instId}` : ""}`, icon: BookOpen },
        { label: "Settings", href: `/dashboard/institution_admin/settings${instId ? `?institutionId=${instId}` : ""}`, icon: Settings },
      ];
    default:
      return [{ label: "Workspace Home", href: base, icon: Gauge }];
  }
}
