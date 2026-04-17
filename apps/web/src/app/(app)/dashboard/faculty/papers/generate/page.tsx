"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Sparkles, 
  FileText, 
  Settings2, 
  Calendar, 
  Clock, 
  ArrowRight,
  Plus,
  Zap,
  CheckCircle2,
  FileDown,
  Wand2
} from "lucide-react";
import { Button, Card, Spinner, StatusMessage, Input } from "@examcraft/ui";
import { useAdminContext } from "@/hooks/use-admin-context";
import { apiRequest } from "#api";
import { generateExamPDF } from "@/lib/export/pdf-generator";

interface Template {
  id: string;
  name: string;
  examType: string;
  totalMarks: number;
  sections: any[];
  subjectName?: string;
  semester?: string;
}

export default function GeneratePaperWizard() {
  const router = useRouter();
  const { accessToken, institutionId, isReady } = useAdminContext();
  
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Form State
  const [paperDetails, setPaperDetails] = useState({
    title: "",
    department: "",
    semester: "",
    subject: "",
    examType: "Unit Test",
    examDate: "",
    examTime: "09:00 AM - 10:30 AM",
    totalMarks: 0
  });

  useEffect(() => {
    async function loadTemplates() {
      if (!isReady || !accessToken || !institutionId) return;
      try {
        const data = await apiRequest<Template[]>("/templates", {
          method: "GET",
          accessToken,
          institutionId
        });
        setTemplates(data || []);
      } catch (e) {
        console.error("Failed to load templates", e);
      } finally {
        setIsLoading(false);
      }
    }
    void loadTemplates();
  }, [isReady, accessToken, institutionId]);

  const handleTemplateSelect = (tpl: Template) => {
    setSelectedTemplate(tpl);
    setPaperDetails(prev => ({
      ...prev,
      title: `${tpl.name} - Generated`,
      examType: tpl.examType,
      totalMarks: tpl.totalMarks,
      semester: tpl.semester || prev.semester
    }));
  };

  const handleGenerate = async () => {
    if (!selectedTemplate || !accessToken || !institutionId) return;
    setIsGenerating(true);
    try {
      const res = await apiRequest<any>("/papers", {
        method: "POST",
        accessToken,
        institutionId,
        body: JSON.stringify({
          templateId: selectedTemplate.id,
          title: paperDetails.title,
          examType: paperDetails.examType,
          totalMarks: paperDetails.totalMarks,
          durationMinutes: 90, // placeholder
          status: "submitted"
        })
      });
      router.push(`/dashboard/faculty/papers/${res.id}?institutionId=${institutionId}`);
    } catch (e) {
      console.error(e);
      alert("Generation failed. Check question bank depth.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) return <div className="flex justify-center p-20"><Spinner size="lg" /></div>;

  return (
    <div className="flex flex-col gap-10 pb-20 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
             <Sparkles size={26} />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight uppercase italic">Generate Question Paper</h1>
            <p className="text-zinc-500 text-sm font-bold tracking-wide mt-1">Load a template, configure exam details, and auto-generate a balanced question paper.</p>
          </div>
        </div>
      </div>

      {/* Quick Load Section */}
      <section className="flex flex-col gap-6">
        <div className="flex items-center gap-3 px-2">
           <Zap size={16} className="text-amber-400" />
           <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Quick Load — Recent Templates</h3>
        </div>
        <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide px-2">
           {templates.slice(0, 6).map(tpl => (
             <button
                key={tpl.id}
                onClick={() => handleTemplateSelect(tpl)}
                className={`flex-shrink-0 w-64 p-6 rounded-[2rem] border transition-all text-left relative overflow-hidden group ${
                  selectedTemplate?.id === tpl.id 
                    ? 'bg-indigo-600/20 border-indigo-500/50 ring-1 ring-indigo-500/20 shadow-2xl' 
                    : 'bg-zinc-900 border-white/5 hover:border-white/20 hover:bg-zinc-800/80 shadow-xl'
                }`}
             >
                <div className={`absolute top-0 right-0 w-24 h-24 blur-[50px] pointer-events-none transition-opacity ${
                  selectedTemplate?.id === tpl.id ? 'bg-indigo-500/20 opacity-100' : 'bg-white/5 opacity-0 group-hover:opacity-100'
                }`} />
                <h4 className="text-sm font-black text-white mb-2 line-clamp-1 group-hover:text-indigo-400 transition-colors uppercase italic">{tpl.name}</h4>
                <div className="flex flex-wrap gap-2 mt-4">
                   <span className="text-[9px] font-black uppercase tracking-widest bg-white/5 px-2 py-1 rounded-lg text-zinc-500">{tpl.examType}</span>
                   <span className="text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded-lg text-emerald-400 border border-emerald-500/10">{tpl.totalMarks}M</span>
                   <span className="text-[9px] font-black uppercase tracking-widest bg-indigo-500/10 px-2 py-1 rounded-lg text-indigo-400 border border-indigo-500/10">{tpl.sections.length} Groups</span>
                </div>
             </button>
           ))}
           <button 
             onClick={() => router.push(`/dashboard/faculty/templates/new?institutionId=${institutionId}`)}
             className="flex-shrink-0 w-64 p-6 rounded-[2rem] border border-dashed border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all text-center flex flex-col items-center justify-center gap-3 text-zinc-500 hover:text-indigo-400"
            >
              <Plus size={24} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Create New Blueprint</span>
           </button>
        </div>
      </section>

      {/* Main Form Grid */}
      <div className="grid lg:grid-cols-2 gap-10 items-start">
        
        {/* Left: Paper Details */}
        <Card className="!bg-zinc-900 border-white/5 !rounded-[2.5rem] p-10 shadow-2xl">
          <div className="flex items-center gap-4 mb-10">
             <div className="w-10 h-10 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
               <FileText size={20} />
             </div>
             <h3 className="text-xl font-black text-white uppercase italic tracking-tight">Paper Details</h3>
          </div>

          <div className="space-y-8">
            <div className="grid sm:grid-cols-2 gap-6">
               <div className="flex flex-col gap-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Department</label>
                  <select 
                    className="w-full bg-black/40 border border-white/5 rounded-2xl h-14 px-5 text-xs text-white outline-none focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                    onChange={(e) => setPaperDetails({...paperDetails, department: e.target.value})}
                  >
                    <option value="">Select Department</option>
                    <option value="IT">Information Technology</option>
                    <option value="CS">Computer Science</option>
                  </select>
               </div>
               <div className="flex flex-col gap-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Semester</label>
                  <select 
                    value={paperDetails.semester}
                    className="w-full bg-black/40 border border-white/5 rounded-2xl h-14 px-5 text-xs text-white outline-none focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                    onChange={(e) => setPaperDetails({...paperDetails, semester: e.target.value})}
                  >
                    <option value="">Select Semester</option>
                    {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={`Semester ${s}`}>Semester {s}</option>)}
                  </select>
               </div>
            </div>

            <div className="flex flex-col gap-3">
               <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-1.5">Subject <span className="text-amber-500">🔒 ASSIGNED ONLY</span></label>
               <select className="w-full bg-black/40 border border-white/5 rounded-2xl h-14 px-5 text-xs text-white outline-none focus:border-indigo-500 transition-all appearance-none cursor-pointer">
                 <option value="">Select Subject</option>
                 <option value="DSA">Data Structures</option>
                 <option value="INFO">Information Systems</option>
               </select>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
               <div className="flex flex-col gap-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Exam Type</label>
                  <select 
                    value={paperDetails.examType}
                    className="w-full bg-black/40 border border-white/5 rounded-2xl h-14 px-5 text-xs text-white outline-none focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                    onChange={(e) => setPaperDetails({...paperDetails, examType: e.target.value})}
                  >
                    <option value="Unit Test">Unit Test</option>
                    <option value="Midterm">Midterm</option>
                    <option value="Final Exam">Final Exam</option>
                  </select>
               </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
               <div className="flex flex-col gap-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Exam Date</label>
                  <div className="relative">
                    <input 
                      type="date" 
                      className="w-full bg-black/40 border border-white/5 rounded-2xl h-14 px-5 text-xs text-white outline-none focus:border-indigo-500 transition-all" 
                    />
                    <Calendar className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={18} />
                  </div>
               </div>
               <div className="flex flex-col gap-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Exam Time</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={paperDetails.examTime}
                      onChange={(e) => setPaperDetails({...paperDetails, examTime: e.target.value})}
                      className="w-full bg-black/40 border border-white/5 rounded-2xl h-14 px-5 text-xs text-white outline-none focus:border-indigo-500 transition-all" 
                    />
                    <Clock className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={18} />
                  </div>
               </div>
            </div>

            <div className="flex flex-col gap-3">
               <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Total Marks</label>
               <input 
                 type="number"
                 placeholder="e.g. 30"
                 value={paperDetails.totalMarks}
                 onChange={(e) => setPaperDetails({...paperDetails, totalMarks: parseInt(e.target.value)})}
                 className="w-full bg-black/40 border border-white/5 rounded-2xl h-14 px-5 text-xs text-white outline-none focus:border-indigo-500 transition-all font-bold tabular-nums" 
               />
            </div>
          </div>
        </Card>

        {/* Right: OR Groups / Logic Preview */}
        <Card className="!bg-zinc-900/40 border-white/10 !rounded-[2.5rem] p-10 h-full flex flex-col">
           <div className="flex items-center gap-4 mb-10">
              <div className="w-10 h-10 rounded-xl bg-amber-600/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Settings2 size={20} />
              </div>
              <h3 className="text-xl font-black text-white uppercase italic tracking-tight">OR Groups</h3>
           </div>

           {!selectedTemplate ? (
             <div className="flex-1 flex flex-col items-center justify-center gap-6 p-10 border-2 border-dashed border-white/5 rounded-[2rem] bg-black/20">
                <div className="p-6 rounded-3xl bg-white/5 text-zinc-600 animate-pulse">
                   <FileText size={48} />
                </div>
                <div className="text-center">
                   <p className="text-sm font-black text-white uppercase tracking-widest mb-2">No Groups Loaded</p>
                   <p className="text-[10px] text-zinc-500 font-bold max-w-[200px] leading-relaxed">Quick-load a recent template above, or go to Templates to create one.</p>
                </div>
             </div>
           ) : (
             <div className="flex-1 flex flex-col gap-6">
                <div className="p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 flex items-center gap-5">
                   <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                      <CheckCircle2 size={24} />
                   </div>
                   <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-white">{selectedTemplate.name} Ready</p>
                      <p className="text-[10px] text-zinc-500 font-medium">{selectedTemplate.sections.length} Structural blocks found</p>
                   </div>
                </div>

                <div className="space-y-4">
                   {selectedTemplate.sections.map((s, i) => (
                      <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-2">
                         <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Group {i + 1}</span>
                            <span className="text-[10px] font-black text-indigo-400">{s.marks} Marks</span>
                         </div>
                         <p className="text-xs font-bold text-white uppercase tracking-tight italic">{s.title}</p>
                         <div className="flex gap-4 mt-2">
                           <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <span className="text-[9px] font-bold text-zinc-500 uppercase">Easy: {s.allowedDifficulty.includes('Easy') ? 'Enabled' : 'Restricted'}</span>
                           </div>
                           <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              <span className="text-[9px] font-bold text-zinc-500 uppercase">Mid: {s.allowedDifficulty.includes('Medium') ? 'Enabled' : 'Restricted'}</span>
                           </div>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
           )}

           <div className="mt-10 flex flex-col gap-4">
              <Button 
                onClick={handleGenerate}
                disabled={!selectedTemplate || isGenerating}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-16 rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-indigo-500/30 group disabled:opacity-50"
              >
                {isGenerating ? <Spinner size="sm" className="mr-3" /> : <Wand2 size={18} className="mr-3 group-hover:rotate-12 transition-transform" />}
                {isGenerating ? 'Engaging Matrix...' : 'Generate Question Paper'}
              </Button>
              
              <div className="grid grid-cols-2 gap-4">
                 <Button variant="secondary" className="bg-white/5 border-white/10 hover:bg-white/10 h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest text-zinc-400">
                    <FileDown size={16} className="mr-2" /> PDF Copy
                 </Button>
                 <Button variant="secondary" className="bg-white/5 border-white/10 hover:bg-white/10 h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest text-zinc-400">
                    <FileDown size={16} className="mr-2" /> Word (.docx)
                 </Button>
              </div>
           </div>
        </Card>

      </div>
    </div>
  );
}
