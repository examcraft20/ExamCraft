"use client";

import { useEffect, useState } from "react";
import { FileText, Search, ExternalLink, Clock, Send, Download, FileCheck2, ShieldAlert, BadgeCheck, FileDown, Rocket, History, ChevronRight } from "lucide-react";
import { Card, Input, Spinner, StatusMessage, Button } from "@examcraft/ui";
import { StatusBadge } from "@examcraft/ui";
import { apiRequest } from "#api";
import { PaperRecord } from "../../../lib/dashboard";
import { env } from "../../../lib/env";
import { PaperPreviewModal } from "../shared/paper-preview-modal";

type PaperWorkspaceProps = {
  accessToken: string;
  institutionId: string;
  institutionName?: string;
};

type PaperResponse = {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  templateName?: string;
};

export function PaperWorkspace({ accessToken, institutionId, institutionName }: PaperWorkspaceProps) {
  const [papers, setPapers] = useState<PaperRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedPaper, setSelectedPaper] = useState<PaperRecord | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    async function loadPapers() {
      try {
        const response = await apiRequest<PaperRecord[]>("/content/papers", {
          method: "GET",
          accessToken,
          institutionId
        });
        setPapers(response);
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Unable to synchronize paper registry.");
      } finally {
        setIsLoading(false);
      }
    }
    void loadPapers();
  }, [accessToken, institutionId]);

  const filteredPapers = papers.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) || 
    p.status.toLowerCase().includes(search.toLowerCase())
  );

  async function handleSubmit(paperId: string) {
    try {
        await apiRequest(`/content/papers/${paperId}/submit`, {
            method: "PATCH",
            accessToken,
            institutionId
        });
        const response = await apiRequest<PaperRecord[]>("/content/papers", {
            method: "GET",
            accessToken,
            institutionId
        });
        setPapers(response);
    } catch (error) {
        setStatus(error instanceof Error ? error.message : "Submission protocol failed.");
    }
  }

  async function handleDownloadPdf(paperId: string) {
    const url = `${env.apiUrl}/content/papers/${paperId}/pdf?institutionId=${institutionId}`;
    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'x-institution-id': institutionId
            }
        });
        if (!response.ok) throw new Error("PDF generation stream failed.");
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.setAttribute('download', `ExamPaper_${paperId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
    } catch (error) {
        setStatus(error instanceof Error ? error.message : "Download link generation failed.");
    }
  }

  async function handleDownloadDocx(paperId: string) {
    const url = `${env.apiUrl}/content/papers/${paperId}/docx?institutionId=${institutionId}`;
    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'x-institution-id': institutionId
            }
        });
        if (!response.ok) throw new Error("DOCX generation stream failed.");
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.setAttribute('download', `ExamPaper_${paperId}.docx`);
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
    } catch (error) {
        setStatus(error instanceof Error ? error.message : "DOCX generation failed.");
    }
  }

  return (
    <div className="flex flex-col gap-10">
      {/* Header & Status Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
         <div className="flex flex-col gap-1">
            <h2 className="text-3xl font-black tracking-tighter text-white">Production Pipeline</h2>
            <p className="text-zinc-500 text-sm font-medium">Verify, coordinate, and export mission-critical examination assets.</p>
         </div>
         <div className="flex items-center gap-3 bg-zinc-900 border border-white/5 p-2 rounded-2xl">
            <div className="px-4 py-2 border-r border-white/5 flex flex-col gap-0.5">
               <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Registry</span>
               <span className="text-sm font-bold text-white">{papers.length} Papers</span>
            </div>
            <div className="px-4 py-2 flex flex-col gap-0.5">
               <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Pending</span>
               <span className="text-sm font-bold text-indigo-400">{papers.filter(p => p.status === 'draft').length} Drafts</span>
            </div>
         </div>
      </div>

      <div className="w-full relative group max-w-xl">
         <div className="absolute inset-y-0 left-4 flex items-center text-zinc-500 group-focus-within:text-indigo-400 transition-colors">
            <Search size={18} />
         </div>
         <input 
           type="text"
           value={search}
           onChange={(e) => setSearch(e.target.value)}
           placeholder="Filter your papers by title or coordination status..."
           className="w-full bg-zinc-900 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500/20 transition-all placeholder:text-zinc-600 shadow-xl"
         />
      </div>

      {status && <StatusMessage variant="error" className="shadow-2xl">{status}</StatusMessage>}

      <div className="grid gap-6">
        {isLoading ? (
          <div className="flex justify-center p-20 animate-pulse">
            <Spinner size="lg" />
          </div>
        ) : filteredPapers.length === 0 ? (
          <div className="p-32 rounded-[2.5rem] bg-white/5 border border-white/5 border-dashed text-center flex flex-col items-center gap-6 shadow-sm">
            <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center text-zinc-800">
              <FileText size={32} />
            </div>
            <div className="flex flex-col gap-1">
               <h4 className="text-xl font-bold text-zinc-600 tracking-tight">Zero matching papers generated.</h4>
               <p className="text-zinc-500 text-sm font-medium">Head to 'Paper Templates' to synchronize a new draft from an authorized template.</p>
            </div>
          </div>
        ) : (
          filteredPapers.map((paper) => (
            <div key={paper.id} className="group p-8 rounded-[2.5rem] bg-zinc-900 border border-white/5 hover:border-white/10 transition-all flex items-center justify-between gap-8 relative overflow-hidden shadow-xl">
               <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] -z-10 opacity-0 group-hover:opacity-10 transition-all ${paper.status === 'published' ? 'bg-emerald-500' : paper.status === 'draft' ? 'bg-zinc-500' : 'bg-indigo-500'}`} />
               
               <div className="flex items-center gap-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all ${paper.status === 'published' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-white/5 border-white/10 text-zinc-500 group-hover:text-indigo-400 group-hover:bg-white/10'}`}>
                     <FileText size={24} strokeWidth={2.5} />
                  </div>
                  <div className="flex flex-col gap-1">
                     <h4 className="text-xl font-black tracking-tight text-white group-hover:text-indigo-300 transition-colors uppercase decoration-zinc-700 underline-offset-4">{paper.title}</h4>
                     <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                        <div className="flex items-center gap-1.5 ">
                           <History size={10} /> {new Date(paper.createdAt).toLocaleDateString('en-US')}
                        </div>
                        <div className="w-1 h-1 rounded-full bg-zinc-700" />
                        <StatusBadge status={paper.status || 'unconfigured'} />
                     </div>
                  </div>
               </div>

               <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
                  {paper.status === 'draft' ? (
                     <Button 
                       onClick={() => handleSubmit(paper.id)} 
                       className="bg-white text-black px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all shadow-glow flex items-center gap-2"
                     >
                        <Rocket size={14} /> Submit for Review
                     </Button>
                  ) : (
                     <div className="flex items-center gap-2">
                       <Button 
                         onClick={() => handleDownloadPdf(paper.id)} 
                         className="bg-indigo-600 text-white px-6 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-glow-indigo flex items-center gap-2"
                       >
                          <FileDown size={14} /> PDF
                       </Button>
                       <Button 
                         onClick={() => handleDownloadDocx(paper.id)} 
                         className="bg-[#2563eb] text-white px-6 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-glow-indigo flex items-center gap-2"
                       >
                          <FileDown size={14} /> DOCX
                       </Button>
                     </div>
                  )}
                   <div 
                      onClick={() => {
                        setSelectedPaper(paper);
                        setIsPreviewOpen(true);
                      }}
                      className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-zinc-600 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                   >
                      <ChevronRight size={20} />
                   </div>
               </div>
            </div>
          ))
        )}
      </div>

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
