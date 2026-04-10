"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ClipboardCheck,
  RotateCcw,
  Search,
  BookOpenCheck,
  LayoutGrid,
  FileText,
  AlertCircle,
  TrendingUp,
  Award,
  Zap,
  History,
  MessageSquareMore,
  ChevronRight,
  ShieldCheck
} from "lucide-react";
import { Button, Card, Input, Spinner, StatusMessage, Textarea } from "@examcraft/ui";
import { apiRequest } from "#api";
import { StatCard } from "../shared/StatCard";
import { ActivityFeed } from "../shared/ActivityFeed";
import { Table } from "../shared/Table";
import type {
  InstitutionDashboardSummaryResponse,
  QuestionRecord,
  TemplateRecord
} from "../../../lib/dashboard";
import { QuestionBankWorkspace } from "./question-bank-workspace";

type AcademicHeadWorkspaceProps = {
  accessToken: string;
  institutionId: string;
  institutionName?: string;
};

type ReviewAction = "approve" | "reject" | "comment";

import { useReviewWorkflow } from "../../../hooks/use-review-workflow";

export function AcademicHeadWorkspace({
  accessToken,
  institutionId,
  institutionName
}: AcademicHeadWorkspaceProps) {
  const {
    summary, questions, templates, status, setStatus, isLoading, activeActionKey, handleReview
  } = useReviewWorkflow(accessToken, institutionId);

  const [questionSearch, setQuestionSearch] = useState("");
  const [templateSearch, setTemplateSearch] = useState("");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<"questions" | "review">("questions");

  const filteredQuestions = useMemo(() => {
    const needle = questionSearch.trim().toLowerCase();
    if (!needle) return questions;
    return questions.filter((q) => [q.title, q.subject, q.bloomLevel, q.difficulty].join(" ").toLowerCase().includes(needle));
  }, [questionSearch, questions]);

  const filteredTemplates = useMemo(() => {
    const needle = templateSearch.trim().toLowerCase();
    if (!needle) return templates;
    return templates.filter((t) => [t.name, t.examType, t.status].join(" ").toLowerCase().includes(needle));
  }, [templateSearch, templates]);

  const onHandleReview = (type: "question" | "template", id: string, action: "approve" | "reject" | "comment") => {
     handleReview(type, id, action, notes[id]?.trim() || undefined);
  };

  const reviewQueue = activeTab === "review";

  return (
    <div className="flex flex-col gap-10">
      {/* Tab Navigation */}
      <nav className="flex items-center gap-2 p-1.5 rounded-2xl bg-zinc-900/50 border border-white/5 w-fit">
        {[
          { id: "questions", label: "Curriculum Repository", icon: LayoutGrid },
          { id: "review", label: "Academic Oversight", icon: BookOpenCheck }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === tab.id 
                ? "bg-white text-black shadow-2xl scale-105" 
                : "text-zinc-500 hover:text-white hover:bg-white/5"
            }`}
          >
            <tab.icon size={16} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="relative">
        {activeTab === "questions" && (
          <QuestionBankWorkspace accessToken={accessToken} institutionId={institutionId} />
        )}

        {activeTab === "review" && (
          <div className="flex flex-col gap-10">
            {/* Academic Pulse Metrics */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                icon={Award}
                number={questions.filter(q => q.status === 'ready').length}
                label="Assets Ready"
                color="indigo"
              />
              <StatCard
                icon={ShieldCheck}
                number={templates.filter(t => t.status === 'published').length}
                label="Templates Published"
                color="indigo"
              />
              <StatCard
                icon={Zap}
                number={questions.filter(q => q.status === 'submitted' || q.status === 'draft').length + templates.filter(t => t.status === 'draft').length}
                label="Awaiting Oversight"
                color="indigo"
              />
              <StatCard
                icon={TrendingUp}
                number={summary?.totals.users ?? 0}
                label="Faculty Members"
                color="indigo"
              />
            </div>

            {status && <StatusMessage variant="info" className="shadow-2xl">{status}</StatusMessage>}

            {/* Approval Desks */}
            <div className="grid lg:grid-cols-1 gap-10">
               {/* Question Desks */}
               <Card className="!bg-zinc-900 border-white/5 !rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] -z-10" />
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                     <div className="flex flex-col gap-1">
                        <h2 className="text-3xl font-black tracking-tighter text-white uppercase">Pedagogical Review Desk</h2>
                        <p className="text-zinc-500 text-sm font-medium">Verify Bloom's alignment and difficulty calibration for new submissions.</p>
                     </div>
                     <div className="w-full md:w-80 relative group">
                        <div className="absolute inset-y-0 left-4 flex items-center text-zinc-500 group-focus-within:text-indigo-400 transition-colors">
                           <Search size={18} />
                        </div>
                        <input 
                           type="text"
                           value={questionSearch}
                           onChange={(e) => setQuestionSearch(e.target.value)}
                           placeholder="Filter submissions..."
                           className="w-full bg-white/5 border border-white/5 rounded-2xl py-3.5 pl-12 pr-6 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all shadow-inner"
                        />
                     </div>
                  </div>

                  <div className="grid gap-6">
                     {isLoading ? <Spinner /> : filteredQuestions.length === 0 ? (
                        <p className="text-zinc-600 text-sm font-bold text-center py-20 italic">No submissions awaiting verification.</p>
                     ) : (
                        filteredQuestions.map((q) => (
                           <div key={q.id} className="group p-8 rounded-[2.5rem] bg-zinc-950 border border-white/5 hover:border-white/10 transition-all flex flex-col gap-8 shadow-xl relative overflow-hidden">
                              <div className="flex items-center justify-between">
                                 <div className="flex flex-col gap-1">
                                    <h4 className="text-xl font-black tracking-tight text-white group-hover:text-amber-300 transition-colors uppercase">{q.title}</h4>
                                    <div className="flex items-center gap-3">
                                       <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 text-[8px] font-black uppercase tracking-widest">{q.bloomLevel}</span>
                                       <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 text-[8px] font-black uppercase tracking-widest">{q.difficulty}</span>
                                       <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
                                       <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{q.subject}</span>
                                    </div>
                                 </div>
                                 <div className={`px-4 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest ${q.status === 'submitted' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-white/5 border-white/10 text-zinc-600'}`}>
                                    {q.status}
                                 </div>
                              </div>

                              <div className="flex flex-col md:flex-row items-center gap-6">
                                 <div className="flex-1 w-full relative group/input">
                                    <div className="absolute inset-y-0 left-4 flex items-center text-zinc-700 group-focus-within/input:text-indigo-500 transition-colors">
                                       <MessageSquareMore size={16} />
                                    </div>
                                    <input 
                                       type="text"
                                       value={notes[q.id] ?? ""}
                                       onChange={(e) => setNotes((curr) => ({ ...curr, [q.id]: e.target.value }))}
                                       placeholder="Pedagogical feedback or revision guidance..."
                                       className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all placeholder:text-zinc-800"
                                    />
                                 </div>
                                 <div className="flex items-center gap-3 w-full md:w-fit">
                                    <Button 
                                       onClick={() => onHandleReview("question", q.id, "approve")} 
                                       loading={activeActionKey === `question:${q.id}:approve`}
                                       className="bg-white text-black px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-glow"
                                    >
                                       Approve Asset
                                    </Button>
                                    <Button 
                                       variant="secondary"
                                       onClick={() => onHandleReview("question", q.id, "reject")} 
                                       loading={activeActionKey === `question:${q.id}:reject`}
                                       className="bg-white/5 border-white/5 text-zinc-500 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-all"
                                    >
                                       Request Revision
                                    </Button>
                                 </div>
                              </div>
                           </div>
                        ))
                     )}
                  </div>
               </Card>

               {/* Template Desks */}
               <Card className="!bg-zinc-900 border-white/5 !rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] -z-10" />
                  <div className="flex items-center gap-4 mb-10">
                     <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                        <FileText size={24} />
                     </div>
                     <div className="flex flex-col">
                        <h2 className="text-3xl font-black tracking-tighter text-white uppercase leading-none">Architectural Validation</h2>
                        <p className="text-zinc-500 text-sm font-medium mt-1">Review paper structures before global institution release.</p>
                     </div>
                  </div>
                  
                  <div className="grid gap-6">
                     {isLoading ? <Spinner /> : filteredTemplates.length === 0 ? (
                        <p className="text-zinc-600 text-sm font-bold text-center py-20 italic">No templates awaiting validation.</p>
                     ) : (
                        filteredTemplates.map((t) => (
                           <div key={t.id} className="p-6 rounded-3xl bg-zinc-950 border border-white/5 hover:border-white/10 transition-all flex items-center justify-between">
                              <div className="flex items-center gap-5">
                                 <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-zinc-500">
                                    <History size={20} />
                                 </div>
                                 <div className="flex flex-col">
                                    <h4 className="text-lg font-black tracking-tight text-white uppercase">{t.name}</h4>
                                    <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{t.examType} | {t.totalMarks} Marks</span>
                                 </div>
                              </div>
                              <div className="flex items-center gap-3">
                                 <Button 
                                    size="sm"
                                    onClick={() => onHandleReview("template", t.id, "approve")}
                                    loading={activeActionKey === `template:${t.id}:approve`}
                                    className="bg-indigo-600 text-white rounded-xl font-black text-[10px] px-6 py-4 uppercase tracking-widest shadow-glow-indigo"
                                 >
                                    Publish Template
                                 </Button>
                                 <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-zinc-700 hover:text-white transition-all cursor-pointer">
                                    <ChevronRight size={18} />
                                 </div>
                              </div>
                           </div>
                        ))
                     )}
                  </div>
               </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
