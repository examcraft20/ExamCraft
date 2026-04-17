"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  FileText, 
  Plus, 
  Settings, 
  CheckCircle, 
  Clock, 
  ChevronRight,
  LayoutTemplate,
  Zap,
  ArrowUpRight,
  Database,
  BarChart3
} from "lucide-react";
import { Button, Card, Skeleton } from "@examcraft/ui";
import { useInstitution } from "@/hooks/use-institution";
import { apiRequest } from "@/lib/api";
import { getSupabaseBrowserSession } from "@/lib/supabase-browser";

interface Stats {
  totalQuestions: number;
  totalTemplates: number;
  pendingPapers: number;
  approvedPapers: number;
}

interface Template {
  id: string;
  name: string;
  examType: string;
  totalMarks: number;
  createdAt: string;
}

export default function FacultyDashboard() {
  const { institutionId, isLoading: isInstLoading } = useInstitution();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentTemplates, setRecentTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadDashboardData() {
      if (isInstLoading || !institutionId) return;

      try {
        const session = await getSupabaseBrowserSession();
        if (!session?.access_token || !isMounted) return;

        // Fetch stats and templates in parallel
        const [templatesData, questionsData, papersData] = await Promise.all([
          apiRequest<Template[]>("/templates", {
            method: "GET",
            accessToken: session.access_token,
            institutionId
          }),
          apiRequest<any[]>("/questions", {
            method: "GET",
            accessToken: session.access_token,
            institutionId
          }),
          apiRequest<any[]>("/papers", {
            method: "GET",
            accessToken: session.access_token,
            institutionId
          })
        ]);

        if (isMounted) {
          setRecentTemplates((templatesData || []).slice(0, 6));
          setStats({
            totalQuestions: questionsData?.length || 0,
            totalTemplates: templatesData?.length || 0,
            pendingPapers: (papersData || []).filter(p => p.status === 'submitted').length,
            approvedPapers: (papersData || []).filter(p => p.status === 'approved').length,
          });
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Dashboard load failed", err);
        if (isMounted) setIsLoading(false);
      }
    }

    void loadDashboardData();
    return () => { isMounted = false; };
  }, [institutionId, isInstLoading]);

  if (isLoading || isInstLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="flex flex-col gap-10 max-w-[1400px] mx-auto pb-20 mt-[-10px]">
      
      {/* Header & Stats */}
      <header className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-black text-white tracking-tight">Faculty Nexus</h1>
            <p className="text-slate-400 font-medium">Orchestrate assessments with multi-tenant precision.</p>
          </div>
          <div className="flex items-center gap-3">
             <Link href={`/dashboard/faculty/papers/new?institutionId=${institutionId}`}>
               <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 px-6 rounded-xl shadow-2xl transition-all hover:scale-105 active:scale-95">
                 <Zap size={18} className="mr-2 fill-white" /> Generate Paper
               </Button>
             </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<Database size={20} className="text-indigo-400" />} label="Question Bank" value={stats?.totalQuestions || 0} />
          <StatCard icon={<LayoutTemplate size={20} className="text-violet-400" />} label="Blueprints" value={stats?.totalTemplates || 0} />
          <StatCard icon={<Clock size={20} className="text-amber-400" />} label="In Review" value={stats?.pendingPapers || 0} />
          <StatCard icon={<CheckCircle size={20} className="text-emerald-400" />} label="Approved" value={stats?.approvedPapers || 0} />
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Recents Section */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-white flex items-center gap-3">
              <FileText size={20} className="text-indigo-400" /> Recent Templates
            </h2>
            <Link href={`/dashboard/faculty/templates?institutionId=${institutionId}`} className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              View All <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {recentTemplates.length > 0 ? (
              recentTemplates.map(template => (
                <TemplateCard key={template.id} template={template} institutionId={institutionId || ""} />
              ))
            ) : (
              <div className="col-span-full p-12 rounded-[2rem] bg-white/5 border border-white/5 flex flex-col items-center justify-center text-center gap-4 border-dashed">
                 <LayoutTemplate size={40} className="text-slate-700" />
                 <p className="text-slate-500 font-bold">No blueprints found.</p>
                 <Link href={`/dashboard/faculty/templates/new?institutionId=${institutionId}`}>
                   <Button variant="secondary" size="sm">Create First Blueprint</Button>
                 </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Insights / Action column */}
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-6">
            <h2 className="text-xl font-black text-white flex items-center gap-3">
              <BarChart3 size={20} className="text-violet-400" /> Quick Actions
            </h2>
            <div className="flex flex-col gap-3">
               <ActionItem 
                  title="Bulk Import" 
                  desc="Sync Excel question banks" 
                  href={`/dashboard/faculty/questions?institutionId=${institutionId}`} 
                  icon={<ArrowUpRight size={16} />}
                />
               <ActionItem 
                  title="Smart Syllabus" 
                  desc="AI-driven paper drafting" 
                  href={`/dashboard/faculty/syllabus-ai?institutionId=${institutionId}`} 
                  icon={<Zap size={16} />}
                />
               <ActionItem 
                  title="Audit Trail" 
                  desc="Review generation history" 
                  href={`/dashboard/faculty/papers?institutionId=${institutionId}`} 
                  icon={<ChevronRight size={16} />}
                />
            </div>
          </div>
          
          <Card className="!bg-indigo-600/10 border-indigo-500/20 p-8 rounded-[2rem] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-[60px] -z-10 group-hover:scale-110 transition-transform" />
            <Sparkles size={24} className="text-indigo-400 mb-4" />
            <h3 className="text-lg font-black text-white mb-2">Upgrade to Pro</h3>
            <p className="text-slate-400 text-sm font-medium mb-6">Unlock AI difficulty balancing and one-click SPPU compliance mapping.</p>
            <Button className="w-full bg-white text-black font-black text-xs uppercase tracking-widest rounded-xl hover:bg-white/90">Learn More</Button>
          </Card>
        </div>

      </div>

    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: number }) {
  return (
    <Card className="!bg-[#1e293b]/50 border-white/5 !rounded-[1.5rem] p-6 flex flex-col gap-4 group hover:bg-[#1e293b]/70 transition-all border-l-4 hover:border-l-indigo-500">
      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
        {icon}
      </div>
      <div className="flex flex-col gap-0.5">
         <span className="text-3xl font-black text-white tabular-nums tracking-tighter">{value}</span>
         <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.15em]">{label}</span>
      </div>
    </Card>
  );
}

function ActionItem({ title, desc, href, icon }: { title: string, desc: string, href: string, icon: React.ReactNode }) {
  return (
    <Link href={href}>
      <div className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all group flex items-center justify-between">
        <div className="flex flex-col gap-1">
           <h4 className="text-sm font-black text-white group-hover:text-indigo-400 transition-colors">{title}</h4>
           <p className="text-[11px] text-slate-500 font-medium">{desc}</p>
        </div>
        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-zinc-500 group-hover:text-white group-hover:bg-indigo-600/50 transition-all">
          {icon}
        </div>
      </div>
    </Link>
  );
}

function TemplateCard({ template, institutionId }: { template: Template, institutionId: string }) {
  return (
    <Card className="!bg-[#1e293b]/80 border-white/5 !rounded-[2rem] p-6 hover:border-indigo-500/30 transition-all group overflow-hidden relative">
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 group-hover:bg-indigo-500/5 blur-[40px] transition-all -z-10" />
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-start">
           <div className="flex flex-col gap-1">
             <h3 className="text-lg font-black text-white leading-tight">{template.name}</h3>
             <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">{template.examType}</span>
           </div>
           <Link href={`/dashboard/faculty/papers/new?institutionId=${institutionId}&templateId=${template.id}`}>
             <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-90 transition-all">
               <Zap size={18} fill="currentColor" />
             </div>
           </Link>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-white/5">
           <div className="flex flex-col">
              <span className="text-xl font-black text-white tracking-tighter">{template.totalMarks}</span>
              <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Marks</span>
           </div>
           <Button variant="secondary" className="bg-white/5 border-0 hover:bg-white/10 h-8 text-[10px] font-black uppercase tracking-widest px-4 rounded-lg">Details</Button>
        </div>
      </div>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-10 max-w-[1400px] mx-auto pb-20 animate-pulse">
      <div className="flex flex-col gap-4">
        <div className="h-10 w-48 bg-white/10 rounded-xl" />
        <div className="h-4 w-72 bg-white/5 rounded-lg" />
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-white/10 rounded-[1.5rem]" />)}
      </div>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-48 bg-white/10 rounded-[2rem]" />)}
        </div>
        <div className="flex flex-col gap-4">
           {[1, 2, 3, 4].map(i => <div key={i} className="h-16 bg-white/5 rounded-2xl" />)}
        </div>
      </div>
    </div>
  );
}

function Sparkles(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  )
}
