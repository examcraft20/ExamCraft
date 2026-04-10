"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, MessageSquareMore, RotateCcw, Search, ShieldCheck, ClipboardCheck, History, Database, FileText, ChevronRight, AlertCircle, Sparkles, TrendingUp } from "lucide-react";
import { Button, Card, Input, Spinner, StatusMessage } from "@examcraft/ui";
import { apiRequest } from "#api";
import { PaperPreviewModal } from "../shared/paper-preview-modal";
import type { InstitutionDashboardSummaryResponse, QuestionRecord, TemplateRecord, PaperRecord } from "../../../lib/dashboard";

type ReviewerWorkspaceProps = {
  accessToken: string;
  institutionId: string;
  institutionName?: string;
};

type ReviewAction = "approve" | "reject" | "comment";

import { useReviewWorkflow } from "../../../hooks/use-review-workflow";

export function ReviewerWorkspace({ accessToken, institutionId, institutionName }: ReviewerWorkspaceProps) {
  const { 
    summary, questions, templates, papers, status, setStatus, isLoading, activeActionKey, handleReview, setPapers 
  } = useReviewWorkflow(accessToken, institutionId);

  const [searchValue, setSearchValue] = useState("");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [selectedPaper, setSelectedPaper] = useState<PaperRecord | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Filter papers for Reviewer
  const reviewPapers = useMemo(() => papers.filter(p => ["submitted", "in_review"].includes(p.status)), [papers]);

  const reviewQueue = useMemo(() => {
    const items = [
      ...questions.map((question) => ({
        id: question.id,
        kind: "question" as const,
        title: question.title,
        subtitle: `${question.subject} | ${question.bloomLevel} | ${question.difficulty}`,
        status: question.status,
        reviewComment: question.reviewComment ?? null
      })),
      ...templates.map((template) => ({
        id: template.id,
        kind: "template" as const,
        title: template.name,
        subtitle: `${template.examType} | ${template.durationMinutes} min | ${template.totalMarks} marks`,
        status: template.status,
        reviewComment: template.reviewComment ?? null
      })),
      ...reviewPapers.map((paper) => ({
        id: paper.id,
        kind: "paper" as const,
        title: paper.title,
        subtitle: `Exam Draft | ${new Date(paper.createdAt).toLocaleDateString('en-US')}`,
        status: paper.status,
        reviewComment: paper.reviewComment ?? null
      }))
    ];

    const filteredByStatus = items.filter((item) => ["submitted", "draft", "in_review"].includes(item.status) || item.reviewComment);
    const needle = searchValue.trim().toLowerCase();
    if (!needle) return filteredByStatus;
    return filteredByStatus.filter((item) => [item.title, item.subtitle, item.status].join(" ").toLowerCase().includes(needle));
  }, [questions, searchValue, templates, reviewPapers]);

  const onHandleReview = (item: (typeof reviewQueue)[number], action: "approve" | "reject" | "comment") => {
     handleReview(item.kind, item.id, action, notes[item.id]?.trim() || undefined);
  };

  return (
    <div className="flex flex-col gap-10">
      {/* Statistics Oversight */}
      <div className="grid md:grid-cols-4 gap-6">
         {[
           { label: "Active Review Queue", value: reviewQueue.length, icon: ClipboardCheck, color: "text-indigo-400" },
           { label: "Questions Verified", value: questions.filter(q => q.status === 'ready').length, icon: Database, color: "text-emerald-400" },
           { label: "Templates Released", value: templates.filter(t => t.status === 'published').length, icon: FileText, color: "text-blue-400" },
           { label: "QA Performance", value: "Optimal", icon: TrendingUp, color: "text-amber-400" }
         ].map((stat, i) => (
            <Card key={i} className="!bg-zinc-900 border-white/5 !rounded-3xl p-6 flex items-center gap-5 shadow-xl group hover:border-white/10 transition-all">
               <div className={`w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center ${stat.color}`}>
                  <stat.icon size={20} />
               </div>
               <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{stat.label}</span>
                  <span className="text-xl font-black text-white">{stat.value}</span>
               </div>
            </Card>
         ))}
      </div>

      {status && <StatusMessage variant="info" className="shadow-2xl">{status}</StatusMessage>}

      <Card className="!bg-zinc-900 border-white/5 !rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] -z-10" />
         
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div className="flex flex-col gap-1">
               <h2 className="text-3xl font-black tracking-tighter text-white flex items-center gap-3">
                  Quality Assurance Queue
                  <div className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-black uppercase tracking-widest text-indigo-400">Live Feedback</div>
               </h2>
               <p className="text-zinc-500 text-sm font-medium">Verify pedagogical integrity and release approved examination assets.</p>
            </div>

            <div className="w-full md:w-80 relative group">
               <div className="absolute inset-y-0 left-4 flex items-center text-zinc-500 group-focus-within:text-indigo-400 transition-colors">
                  <Search size={18} />
               </div>
               <input 
                 type="text"
                 value={searchValue}
                 onChange={(e) => setSearchValue(e.target.value)}
                 placeholder="Search entries..."
                 className="w-full bg-white/5 border border-white/5 rounded-2xl py-3.5 pl-12 pr-6 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all placeholder:text-zinc-700 shadow-inner"
               />
            </div>
         </div>

         <div className="grid gap-6">
            {isLoading ? (
               <div className="flex justify-center p-20 animate-pulse">
                  <Spinner size="lg" />
               </div>
            ) : reviewQueue.length === 0 ? (
               <div className="p-32 rounded-[2.5rem] bg-white/5 border border-white/5 border-dashed text-center flex flex-col items-center gap-6">
                  <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center text-zinc-800">
                     <ShieldCheck size={32} />
                  </div>
                  <div className="flex flex-col gap-1">
                     <h4 className="text-xl font-bold text-zinc-600 tracking-tight">Assurance queue clear.</h4>
                     <p className="text-zinc-500 text-sm font-medium">All pending institutional assets have been synchronized and successfully released.</p>
                  </div>
               </div>
            ) : (
               reviewQueue.map((item) => (
                  <div key={`${item.kind}-${item.id}`} className="group p-8 rounded-[2.5rem] bg-zinc-950 border border-white/5 hover:border-white/10 transition-all flex flex-col gap-8 shadow-xl relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[60px] -z-10 group-hover:bg-indigo-500/10 transition-all" />
                     
                     <div className="flex items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                           <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-zinc-500 group-hover:text-indigo-400 group-hover:bg-white/10 transition-all">
                              {item.kind === 'question' ? <Database size={24} /> : item.kind === 'template' ? <FileText size={24} /> : <ClipboardCheck size={24} />}
                           </div>
                           <div className="flex flex-col gap-1">
                              <h4 className="text-xl font-black tracking-tight text-white group-hover:text-indigo-300 transition-colors uppercase">{item.title}</h4>
                              <div className="flex items-center gap-3">
                                 <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">{item.kind} Registry</span>
                                 <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
                                 <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{item.subtitle}</span>
                              </div>
                           </div>
                        </div>
                        <div className={`px-4 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${item.status === 'submitted' || item.status === 'in_review' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 animate-pulse' : 'bg-white/5 border-white/10 text-zinc-600'}`}>
                           {item.status}
                        </div>
                     </div>

                     {item.reviewComment && (
                        <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-3">
                           <AlertCircle className="text-amber-500 shrink-0" size={14} />
                           <p className="text-xs font-bold text-amber-400/80 leading-relaxed italic truncate">
                              Reviewer Annotation: {item.reviewComment}
                           </p>
                        </div>
                     )}

                     <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="flex-1 w-full relative group/input">
                           <div className="absolute inset-y-0 left-4 flex items-center text-zinc-700 group-focus-within/input:text-indigo-500 transition-colors">
                              <MessageSquareMore size={16} />
                           </div>
                           <input 
                             type="text"
                             value={notes[item.id] ?? ""}
                             onChange={(e) => setNotes((current) => ({ ...current, [item.id]: e.target.value }))}
                             placeholder="Provide quality assurance annotations or guidance..."
                             className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all placeholder:text-zinc-800"
                           />
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-fit">
                           {item.kind === 'paper' && (
                              <Button 
                                variant="ghost"
                                onClick={() => {
                                   const p = papers.find(pap => pap.id === item.id);
                                   if (p) {
                                      setSelectedPaper(p);
                                      setIsPreviewOpen(true);
                                   }
                                }}
                                className="text-indigo-400 font-black text-[10px] uppercase tracking-widest hover:bg-indigo-500/10"
                              >
                                 View Live Draft
                              </Button>
                           )}
                           <Button 
                             onClick={() => void onHandleReview(item, "approve")} 
                             loading={activeActionKey === `${item.kind}:${item.id}:approve`}
                             className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-glow-emerald hover:scale-105 active:scale-95 transition-all flex items-center gap-2 whitespace-nowrap"
                           >
                              {!activeActionKey && <CheckCircle2 size={16} />} Approve Release
                           </Button>
                           <Button 
                             variant="secondary"
                             onClick={() => void onHandleReview(item, "reject")} 
                             loading={activeActionKey === `${item.kind}:${item.id}:reject`}
                             className="bg-white/5 border-white/5 text-zinc-500 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-all flex items-center gap-2"
                           >
                              {!activeActionKey && <RotateCcw size={16} />} Return
                           </Button>
                        </div>
                     </div>
                  </div>
               ))
            )}
         </div>
      </Card>

      {selectedPaper && (
         <PaperPreviewModal 
            isOpen={isPreviewOpen}
            onClose={() => setIsPreviewOpen(false)}
            paper={selectedPaper}
            institutionName={institutionName}
         />
      )}
    </div>
  );
}
