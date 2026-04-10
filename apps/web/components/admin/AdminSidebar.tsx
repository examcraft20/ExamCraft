"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Zap,
  Building2,
  Users,
  Flag,
  History,
  HelpCircle,
  Settings,
  Shield,
  Activity,
  ChevronRight
} from "lucide-react";

const navLinks = [
  { href: "/admin/dashboard", label: "Overview", icon: Zap },
  { href: "/admin/institutions", label: "Institutions", icon: Building2 },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/flags", label: "Features", icon: Flag },
  { href: "/admin/logs", label: "Audit Logs", icon: History },
  { href: "/admin/support", label: "Support", icon: HelpCircle },
  { href: "/admin/settings", label: "Settings", icon: Settings }
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-[300px] border-r border-[#ffffff0a] bg-gradient-to-b from-[#050505] to-[#020202] flex flex-col overflow-y-auto relative z-50">
      {/* Decorative Top Gradient */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#4f46e5]/10 to-transparent pointer-events-none" />
      
      {/* Logo Section */}
      <div className="p-8 pb-6 relative z-10">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-[16px] bg-gradient-to-br from-[#7c3aed] via-[#4f46e5] to-[#3b82f6] p-[1px] shadow-[0_0_20px_rgba(124,58,237,0.3)]">
            <div className="w-full h-full bg-[#050505] rounded-[15px] flex items-center justify-center">
              <Shield size={22} className="text-[#a5b4fc]" strokeWidth={2.5} />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400 tracking-tighter leading-none">
              ExamCraft
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#818cf8] mt-1.5 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#818cf8] animate-pulse" />
              Nexus Admin
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 flex flex-col gap-1.5 relative z-10">
        <div className="px-4 mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Platform Management</div>
        {navLinks.map((link) => {
          const isActive = pathname.startsWith(link.href);
          const Icon = link.icon;

          return (
            <Link key={link.href} href={link.href}>
              <button
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 relative group overflow-hidden ${
                  isActive
                    ? "bg-[#4f46e5]/10 border border-[#4f46e5]/30 shadow-[0_0_20px_rgba(79,70,229,0.1)]"
                    : "border border-transparent hover:bg-white/[0.03] hover:border-white/[0.05]"
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-[#7c3aed] to-[#3b82f6] rounded-r-full shadow-[0_0_10px_rgba(124,58,237,0.8)]" />
                )}
                
                <div className={`p-1.5 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? "bg-[#4f46e5]/20 text-white shadow-inner border border-[#4f46e5]/30" 
                    : "bg-white/[0.02] text-slate-500 group-hover:text-slate-300 border border-white/[0.05]"
                }`}>
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                
                <span className={`text-sm font-bold tracking-tight transition-colors duration-300 ${
                  isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"
                }`}>
                  {link.label}
                </span>

                {isActive && (
                  <ChevronRight size={16} className="ml-auto text-[#818cf8] opacity-70" />
                )}
              </button>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-6 mt-auto relative z-10">
        <div className="rounded-[1.5rem] bg-gradient-to-br from-[#0c0c0c] to-[#050505] border border-white/[0.08] p-5 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.15)] group-hover:scale-110 transition-transform duration-500">
              <Activity size={20} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Infrastructure</span>
              <span className="text-sm font-bold text-white flex items-center gap-2">
                Operational
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
