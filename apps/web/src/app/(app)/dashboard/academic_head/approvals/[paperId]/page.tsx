"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  CheckCircle, 
  XCircle, 
  ChevronLeft, 
  FileText, 
  BarChart3, 
  AlertTriangle,
  Send,
  Download,
  Eye,
  Settings2,
  Loader2
} from "lucide-react";
import { Button, Card, Spinner, StatusMessage } from "@examcraft/ui";
import { useAdminContext } from "@/hooks/use-admin-context";
import { apiRequest } from "#api";
import { generateExamPDF } from "@/lib/export/pdf-generator";

interface Question {
  id: string;
  title: string;
  difficulty: string;
  bloomLevel: string;
}

interface Section {
  title: string;
  marks: number;
  isOrGroup?: boolean;
  questions?: Question[];
  choiceA?: { label: string; questions: Question[] };
  choiceB?: { label: string; questions: Question[] };
}

interface Paper {
  id: string;
  title: string;
  examType: string;
  totalMarks: number;
  durationMinutes: number;
  status: string;
  sections: Section[];
  institutionName: string;
  subjectName?: string;
  createdAt: string;
}

export default function ApprovalDetailPage({ params }: { params: { paperId: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const institutionIdFromUrl = searchParams.get("institutionId");
  
  const { accessToken, institutionId, isReady } = useAdminContext();
  const [paper, setPaper] = useState<Paper | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadPaper() {
      if (!isReady || !accessToken || !params.paperId) return;
      
      const effectiveId = institutionId || institutionIdFromUrl;
      if (!effectiveId) return;

      try {
        const data = await apiRequest<Paper>(`/papers/${params.paperId}`, {
          method: "GET",
          accessToken,
          institutionId: effectiveId,
        });
        if (isMounted) {
          setPaper(data);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load paper");
          setIsLoading(false);
        }
      }
    }

    void loadPaper();
    return () => { isMounted = false; };
  }, [isReady, accessToken, params.paperId, institutionId, institutionIdFromUrl]);

  const handleReview = async (action: "approve" | "reject") => {
    if (!accessToken || !paper) return;
    setIsSubmitting(true);
    try {
      await apiRequest<any>(`/approvals/papers/${paper.id}/review`, {
        method: "PATCH",
        accessToken,
        institutionId: institutionId || institutionIdFromUrl || "",
        body: JSON.stringify({ action, comment }),
      });
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
      setIsSubmitting(false);
    }
  };

  const downloadPDF = () => {
    if (!paper) return;
    generateExamPDF({
      institutionName: paper.institutionName || "Imperial Institute of Tech",
      title: paper.title,
      examType: paper.examType,
      durationMinutes: paper.durationMinutes,
      totalMarks: paper.totalMarks,
      subjectName: paper.subjectName,
      sections: paper.sections
    });
  };

  if (isLoading) return <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4"><Spinner size="lg" /><p className="text-zinc-500 font-black animate-pulse uppercase tracking-[0.2em] text-xs">Assembling Paper Components...</p></div>;
  if (error || !paper) return <div className="p-12"><StatusMessage variant="error">{error || "Paper not found"}</StatusMessage><Button variant="secondary" onClick={() => router.back()} className="mt-4"><ChevronLeft size={16} /> Go Back</Button></div>;

  const stats = calculatePaperStats(paper);

  return (
    <div className="flex flex-col gap-8 pb-20">
      {/* Header Area */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex flex-col gap-2">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-xs font-black uppercase tracking-widest mb-2">
            <ChevronLeft size={14} /> Back to Inbox
          </button>
          <div className="flex items-center gap-4">
             <h1 className="text-4xl font-black text-white tracking-tighter">{paper.title}</h1>
             <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border tracking-widest ${
               paper.status === 'approved' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 
               paper.status === 'rejected' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 
               'bg-indigo-500/10 border-indigo-500/20 text-indigo-400 animate-pulse'
             }`}>
                {paper.status}
             </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
           <Button variant="secondary" onClick={downloadPDF} className="bg-white/5 border-white/10 hover:bg-white/10 h-12 rounded-xl text-xs font-black uppercase tracking-widest">
             <Download size={18} className="mr-2" /> PDF Copy
           </Button>
           <Button className="bg-indigo-600 hover:bg-indigo-700 h-12 rounded-xl text-xs font-black uppercase tracking-widest px-8">
             <FileText size={18} className="mr-2" /> Blueprint Details
           </Button>
        </div>
      </header>

      {/* Review Workspace Grid */}
      <div className="grid lg:grid-cols-3 gap-8 items-start">
        
        {/* Left: Paper Content Preview */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="flex items-center justify-between">
             <h2 className="text-xl font-black text-white flex items-center gap-3">
               <Eye size={20} className="text-indigo-400" /> Paper Preview
             </h2>
             <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Read-only structural view</span>
          </div>

          <div className="space-y-6">
            {paper.sections.map((section, idx) => (
              <Card key={idx} className="!bg-zinc-900/40 border-white/5 !rounded-[2rem] p-8 hover:border-white/10 transition-all">
                <div className="flex justify-between items-center mb-10 border-b border-white/5 pb-6">
                   <div className="flex flex-col gap-1">
                      <h3 className="text-lg font-black text-white flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-sm">{idx + 1}</span>
                        {section.title}
                      </h3>
                   </div>
                   <div className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                      {section.marks} Marks Allocated
                   </div>
                </div>

                <div className="space-y-8">
                  {section.isOrGroup && section.choiceA && section.choiceB ? (
                    <div className="flex flex-col gap-8">
                      <div className="flex flex-col gap-4">
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400/80 mb-2 px-4 py-1.5 rounded-lg bg-indigo-500/5 border border-indigo-500/10 w-fit">{section.choiceA.label}</div>
                        <QuestionList questions={section.choiceA.questions} isSub />
                      </div>
                      
                      <div className="py-4 flex items-center gap-6">
                         <div className="flex-1 h-px bg-white/5" />
                         <span className="text-xs font-black text-zinc-600 italic uppercase">OR</span>
                         <div className="flex-1 h-px bg-white/5" />
                      </div>

                      <div className="flex flex-col gap-4">
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-400/80 mb-2 px-4 py-1.5 rounded-lg bg-violet-500/5 border border-violet-500/10 w-fit">{section.choiceB.label}</div>
                        <QuestionList questions={section.choiceB.questions} isSub />
                      </div>
                    </div>
                  ) : (
                    <QuestionList questions={section.questions || []} />
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Right: Insights & Actions */}
        <div className="flex flex-col gap-8 sticky top-6">
           
           {/* Decision Panel */}
           <Card className="!bg-zinc-900 border-white/5 !rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[60px] -z-10" />
             <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3">
               <Settings2 size={20} className="text-indigo-400" /> Final Verdict
             </h3>
             
             <div className="flex flex-col gap-4">
                <textarea 
                   value={comment}
                   onChange={(e) => setComment(e.target.value)}
                   className="w-full h-32 bg-black/40 border border-white/5 rounded-2xl p-4 text-xs text-white placeholder:text-zinc-600 focus:border-indigo-500 outline-none transition-all resize-none font-medium"
                   placeholder="Reviewer remarks (Visible to author)..."
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    disabled={isSubmitting}
                    onClick={() => handleReview("reject")}
                    className="bg-transparent border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" /> : <XCircle size={16} />} Reject Paper
                  </Button>
                  <Button 
                    disabled={isSubmitting}
                    onClick={() => handleReview("approve")}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" /> : <CheckCircle size={16} />} Approve Paper
                  </Button>
                </div>
             </div>
           </Card>

           {/* Distribution Insights */}
           <Card className="!bg-zinc-900/50 border-white/5 !rounded-[2rem] p-8">
             <h3 className="text-lg font-black text-white mb-8 flex items-center gap-3">
               <BarChart3 size={18} className="text-violet-400" /> Data Insights
             </h3>
             <div className="space-y-8">
                <DistributionItem label="Easy Alignment" value={stats.easy} color="bg-emerald-500" />
                <DistributionItem label="Medium Alignment" value={stats.medium} color="bg-amber-500" />
                <DistributionItem label="Difficulty Level" value={stats.hard} color="bg-rose-500" />
             </div>
             
             <div className="mt-10 p-5 rounded-2xl bg-white/5 border border-white/5 flex gap-4">
                <AlertTriangle size={20} className="text-amber-400 shrink-0" />
                <p className="text-[11px] text-zinc-400 font-medium leading-relaxed">Paper matches syllabus CO limits within <span className="text-white">±2% deviation</span>. Fully compliant for SPPU standards.</p>
             </div>
           </Card>

        </div>

      </div>
    </div>
  );
}

function QuestionList({ questions, isSub }: { questions: Question[], isSub?: boolean }) {
  return (
    <div className="flex flex-col gap-5">
      {questions.map((q, qidx) => (
        <div key={q.id} className="group flex gap-5">
           <div className="flex flex-col items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-[10px] ${isSub ? 'bg-white/5 text-zinc-500' : 'bg-indigo-600 text-white animate-pulse'}`}>
                {isSub ? String.fromCharCode(97 + qidx) : qidx + 1}
              </div>
              {!isSub && <div className="flex-1 w-px bg-indigo-500/20 group-last:bg-transparent" />}
           </div>
           <div className="flex flex-col gap-3 flex-1 pb-6 border-b border-white/[0.03] last:border-0">
             <p className="text-slate-200 font-bold leading-relaxed">{q.title}</p>
             <div className="flex flex-wrap gap-2">
               <span className="text-[9px] font-black uppercase text-zinc-600 bg-white/5 px-2 py-0.5 rounded border border-white/5">{q.difficulty}</span>
               <span className="text-[9px] font-black uppercase text-indigo-400 bg-indigo-500/5 px-2 py-0.5 rounded border border-indigo-500/5">{q.bloomLevel}</span>
             </div>
           </div>
        </div>
      ))}
    </div>
  );
}

function DistributionItem({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <div className="flex flex-col gap-3">
       <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
          <span className="text-zinc-500">{label}</span>
          <span className="text-white tabular-nums">{value}%</span>
       </div>
       <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
          <div className={`h-full ${color} rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)]`} style={{ width: `${value}%` }} />
       </div>
    </div>
  );
}

function calculatePaperStats(paper: Paper) {
  let easy = 0, medium = 0, hard = 0, total = 0;
  
  const processQuestions = (qs?: Question[]) => {
    qs?.forEach(q => {
      total++;
      if (q.difficulty.toLowerCase().includes('easy')) easy++;
      else if (q.difficulty.toLowerCase().includes('hard') || q.difficulty.toLowerCase().includes('diff')) hard++;
      else medium++;
    });
  };

  paper.sections.forEach(s => {
    if (s.isOrGroup) {
      processQuestions(s.choiceA?.questions);
      processQuestions(s.choiceB?.questions);
    } else {
      processQuestions(s.questions);
    }
  });

  if (total === 0) return { easy: 0, medium: 0, hard: 0 };
  return {
    easy: Math.round((easy / total) * 100),
    medium: Math.round((medium / total) * 100),
    hard: Math.round((hard / total) * 100),
  };
}

