"use client";

import { useMemo, useState } from "react";
import { FileText, Hourglass, Check, X, RefreshCw, Search, ClipboardList } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@examcraft/ui";

interface Question {
  id: string;
  title: string;
  subject: string;
  bloomLevel: string;
  difficulty: string;
  tags: string[];
  status: string; // 'draft', 'submitted', 'approved', 'rejected'
  createdAt: string;
  departmentId?: string | null;
  courseId?: string | null;
}

export function SubmissionsListClient({
  initialQuestions,
  institutionId
}: {
  initialQuestions: Question[];
  institutionId: string;
}) {
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const mappedQuestions = initialQuestions.map(q => {
    // Map internal statuses to visual statuses
    let visualStatus = "pending";
    if (q.status === "approved" || q.status === "ready") visualStatus = "approved";
    if (q.status === "rejected") visualStatus = "rejected";
    if (q.status === "draft" || q.status === "submitted") visualStatus = "pending";
    
    return { ...q, visualStatus };
  });

  const totalCount = mappedQuestions.length;
  const pendingCount = mappedQuestions.filter(q => q.visualStatus === "pending").length;
  const approvedCount = mappedQuestions.filter(q => q.visualStatus === "approved").length;
  const rejectedCount = mappedQuestions.filter(q => q.visualStatus === "rejected").length;

  const filteredQuestions = useMemo(() => {
    return mappedQuestions.filter(q => {
      const tabMatch = activeTab === "all" || q.visualStatus === activeTab;
      const searchMatch = 
        q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.subject.toLowerCase().includes(searchQuery.toLowerCase());
      
      return tabMatch && searchMatch;
    });
  }, [mappedQuestions, activeTab, searchQuery]);

  const tabs = [
    { id: "all", label: "All", count: totalCount },
    { id: "pending", label: "Pending", count: pendingCount },
    { id: "approved", label: "Approved", count: approvedCount },
    { id: "rejected", label: "Rejected", count: rejectedCount },
  ] as const;

  const getDifficultyColor = (diff: string) => {
    const d = diff.toLowerCase();
    if (d === 'easy') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (d === 'medium') return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    return 'bg-red-500/10 text-red-400 border-red-500/20';
  };

  const getReviewStatusBadge = (status: string) => {
    if (status === 'approved') return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-xs font-bold text-emerald-400">
        <Check size={12} strokeWidth={3} /> Approved
      </span>
    );
    if (status === 'rejected') return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-red-500/30 bg-red-500/10 text-xs font-bold text-red-400">
        <X size={12} strokeWidth={3} /> Rejected
      </span>
    );
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-xs font-bold text-amber-400">
        <Hourglass size={12} strokeWidth={3} /> Pending
      </span>
    );
  };

  return (
    <div className="flex flex-col w-full max-w-[1400px] gap-8 mx-auto pb-20 mt-[-10px]">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#fcb045] via-[#fd1d1d] to-[#833ab4] flex items-center justify-center shadow-lg text-white font-black opacity-90 p-[2px]">
             <div className="w-full h-full bg-[#0f172a] rounded-[10px] flex items-center justify-center">
               <ClipboardList size={20} className="text-[#fd1d1d]" />
             </div>
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-black text-white tracking-tight">My Submissions</h1>
            <p className="text-slate-400 text-sm font-medium">
              Track the review status of your uploaded questions.
            </p>
          </div>
        </div>
        
        <button 
          className="px-4 py-2.5 rounded-lg bg-[#1e293b] border border-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-800 font-bold text-xs flex items-center gap-2 transition-colors shadow-sm"
          onClick={() => window.location.reload()}
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/[0.07] transition-all duration-200 flex flex-col justify-center gap-2 shadow-sm">
           <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Total</span>
              <FileText size={16} className="text-[#a8b8d8]" />
           </div>
           <span className="text-3xl font-black text-white">{totalCount}</span>
        </div>
        
        <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/[0.07] transition-all duration-200 flex flex-col justify-center gap-2 shadow-sm">
           <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Pending</span>
              <Hourglass size={16} className="text-amber-400" />
           </div>
           <span className="text-3xl font-black text-amber-400">{pendingCount}</span>
        </div>

        <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/[0.07] transition-all duration-200 flex flex-col justify-center gap-2 shadow-sm">
           <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Approved</span>
              <Check size={16} className="text-emerald-400" strokeWidth={3} />
           </div>
           <span className="text-3xl font-black text-emerald-400">{approvedCount}</span>
        </div>

        <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/[0.07] transition-all duration-200 flex flex-col justify-center gap-2 shadow-sm">
           <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Rejected</span>
              <X size={16} className="text-red-400" strokeWidth={3} />
           </div>
           <span className="text-3xl font-black text-red-400">{rejectedCount}</span>
        </div>
      </div>

      {/* Main Table View Container */}
      <div className="flex flex-col w-full rounded-2xl bg-[#1e293b] border border-[#2b3952] shadow-xl overflow-hidden mt-2 flex-1">
        
        {/* Unified Tab and Search Top bar */}
        <div className="flex flex-col md:flex-row items-center border-b border-[#2b3952] w-full p-2 flex-wrap">
           
           {/* Tabs */}
           <div className="flex items-center gap-1 px-2 h-12 w-full md:w-auto">
             {tabs.map(tab => (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id as any)}
                 className={`h-9 px-4 rounded-full text-xs font-bold transition-all ${
                   activeTab === tab.id 
                     ? 'bg-[#6d28d9] text-white shadow-[0_0_15px_rgba(109,40,217,0.4)]' 
                     : 'text-slate-400 hover:text-white hover:bg-slate-800'
                 }`}
               >
                 {tab.label} ({tab.count})
               </button>
             ))}
           </div>
           
           {/* Divider */}
           <div className="hidden md:block w-px h-8 bg-[#2b3952] mx-2" />

           {/* Search Input */}
           <div className="relative flex-1 min-w-[200px] px-2 md:px-0">
             <input
               type="text"
               placeholder="Search questions or subjects..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full h-12 pl-10 pr-4 bg-transparent border-0 text-slate-300 placeholder:text-slate-500 text-sm font-medium focus:outline-none focus:ring-0 transition-colors"
             />
             <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569]" />
           </div>

           <div className="shrink-0 text-xs font-medium text-[#64748b] pr-4 hidden md:block">
             {filteredQuestions.length} results
           </div>
        </div>

        {/* Table Content */}
        <div className="w-full overflow-x-auto min-h-[400px]">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#23314a] text-[#8e9cba] text-[10px] font-black uppercase tracking-widest sticky top-0 z-10 backdrop-blur-md">
              <tr className="border-b border-[#2b3952]">
                <th className="px-6 py-4 w-12 text-center">#</th>
                <th className="px-6 py-4 min-w-[300px]">Question</th>
                <th className="px-6 py-4">Subject</th>
                <th className="px-6 py-4">Dept</th>
                <th className="px-6 py-4 text-center">Sem</th>
                <th className="px-6 py-4 text-center">Marks</th>
                <th className="px-6 py-4 text-center">Level</th>
                <th className="px-6 py-4 text-center">Submitted</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2b3952]/60 text-slate-300 bg-[#1e293b]">
              {filteredQuestions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-24 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 text-slate-500">
                      <FileText size={32} className="opacity-50" />
                      <p className="font-bold">No submissions found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredQuestions.map((q, i) => {
                  return (
                    <tr key={q.id} className="hover:bg-slate-800/30 transition-colors group">
                       <td className="px-6 py-5 text-slate-600 text-xs font-mono text-center">
                         {i + 1}
                       </td>
                       <td className="px-6 py-5 whitespace-normal">
                         <p className="line-clamp-2 text-sm font-medium text-slate-200 leading-relaxed pr-8 max-w-[400px]">
                           {q.title}
                         </p>
                       </td>
                       <td className="px-6 py-5">
                         <span className="text-indigo-300 font-bold text-sm tracking-tight">{q.subject}</span>
                       </td>
                       <td className="px-6 py-5 max-w-[120px] whitespace-normal leading-tight">
                         <span className="text-[#94a3b8] text-xs">{q.departmentId || "CSE"}</span>
                       </td>
                       <td className="px-6 py-5 text-center">
                         <span className="text-[#94a3b8] text-xs flex flex-col"><span className="text-white font-bold">{q.courseId || "Semester 4"}</span></span>
                       </td>
                       <td className="px-6 py-5 text-center">
                         <span className="font-black text-white">5</span>
                       </td>
                       <td className="px-6 py-5 text-center">
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${getDifficultyColor(q.difficulty)} text-[10px] font-black uppercase tracking-widest`}>
                            {q.difficulty}
                          </div>
                       </td>
                       <td className="px-6 py-5 text-center">
                         <span className="text-[#64748b] text-xs font-medium">
                            {new Date(q.createdAt).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' })}
                         </span>
                       </td>
                       <td className="px-6 py-5">
                          {getReviewStatusBadge(q.visualStatus)}
                       </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
