"use client";

import { useState } from "react";
import { BrainCircuit, Search, FileText, Settings, Edit3, Cloud, ClipboardPaste, ArrowRight, Loader2, Save } from "lucide-react";
import { Button } from "@examcraft/ui";
import { apiRequest } from "@/lib/api";
import { getSupabaseBrowserSession } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";

export function SyllabusAiClient({ institutionId }: { institutionId: string }) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [activeTab, setActiveTab] = useState<"upload" | "paste">("upload");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [textInput, setTextInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);
  const [metadata, setMetadata] = useState<any>(null);

  const handleAnalyze = async () => {
    if (!textInput.trim() && activeTab === "paste") return;
    
    setIsAnalyzing(true);
    try {
      const session = await getSupabaseBrowserSession();
      if (!session) return;

      const response = await apiRequest<{ generatedQuestions: any[], metadata: any }>("/content/ai/generate-questions", {
         method: "POST",
         accessToken: session.access_token,
         institutionId,
         body: JSON.stringify({
            text: textInput || "Dummy syllabus content from file upload mock",
            count: 5
         })
      });

      setGeneratedQuestions(response.generatedQuestions);
      setMetadata(response.metadata);
      setStep(3); // Skip configure and go straight to preview/edit
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSaveToBank = async () => {
     if (!generatedQuestions || generatedQuestions.length === 0) return;
     
     setIsSaving(true);
     try {
       const session = await getSupabaseBrowserSession();
       if (!session) return;
       
       await apiRequest("/content/questions/bulk", {
         method: "POST",
         accessToken: session.access_token,
         institutionId,
         body: JSON.stringify({
            questions: generatedQuestions
         })
       });

       // Now redirect to Question Bank to see them
       router.push(`/dashboard/faculty/questions?institutionId=${institutionId}`);
     } catch (e) {
       console.error("Failed to save questions:", e);
     } finally {
       setIsSaving(false);
     }
  };

  return (
    <div className="flex flex-col w-full max-w-[1400px] gap-10 mx-auto pb-20 mt-[-10px] text-slate-300">
      
      {/* Header Line */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
         <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.3)] shrink-0">
               <BrainCircuit size={28} className="text-white" />
            </div>
            <div className="flex flex-col gap-1">
               <h1 className="text-3xl font-black text-white tracking-tight">AI from Syllabus</h1>
               <p className="text-slate-400 text-sm font-medium">
                 Upload syllabus — Get AI-generated questions — Download or submit for review
               </p>
            </div>
         </div>
      </div>

      {/* Stepper Progress */}
      <div className="flex items-center justify-center max-w-4xl mx-auto w-full mt-4">
        {/* Step 1 */}
        <div className={`flex items-center gap-3 px-5 py-2.5 rounded-full relative z-10 transition-all ${
          step >= 1 ? "bg-[#1e293b] border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.1)]" : "bg-[#0f172a] border border-slate-700/50 opacity-60 grayscale"
        }`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
            step >= 1 ? "bg-indigo-500 text-white" : "bg-slate-700 text-slate-300"
          }`}>1</div>
          <div className={`flex items-center gap-2 font-bold text-sm tracking-wide ${
            step >= 1 ? "text-white" : "text-slate-400"
          }`}>
            <FileText size={16} /> Upload Syllabus
          </div>
        </div>

        {/* Divider 1 */}
        <div className="flex-1 h-px bg-slate-700/50 max-w-[150px] relative">
           {step >= 2 && <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-px bg-gradient-to-r from-indigo-500/30 to-indigo-500/10" />}
        </div>

        {/* Step 2 */}
        <div className={`flex items-center gap-3 px-5 py-2.5 rounded-full relative z-10 transition-all ${
          step >= 2 ? "bg-[#1e293b] border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.1)]" : "bg-[#0f172a] border border-slate-700/50 opacity-60 grayscale"
        }`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
            step >= 2 ? "bg-indigo-500 text-white" : "bg-slate-700 text-slate-300"
          }`}>2</div>
          <div className={`flex items-center gap-2 font-bold text-sm tracking-wide ${
            step >= 2 ? "text-white" : "text-slate-400"
          }`}>
            <Settings size={16} /> Configure AI
          </div>
        </div>

        {/* Divider 2 */}
        <div className="flex-1 h-px bg-slate-700/50 max-w-[150px] relative">
           {step >= 3 && <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-px bg-gradient-to-r from-indigo-500/30 to-indigo-500/10" />}
        </div>

        {/* Step 3 */}
        <div className={`flex items-center gap-3 px-5 py-2.5 rounded-full relative z-10 transition-all ${
          step >= 3 ? "bg-[#1e293b] border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.1)]" : "bg-[#0f172a] border border-slate-700/50 opacity-60 grayscale"
        }`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
            step >= 3 ? "bg-indigo-500 text-white" : "bg-slate-700 text-slate-300"
          }`}>3</div>
          <div className={`flex items-center gap-2 font-bold text-sm tracking-wide ${
            step >= 3 ? "text-white" : "text-slate-400"
          }`}>
            <Edit3 size={16} /> Edit & Export
          </div>
        </div>
      </div>

      {/* Main Container Work Area */}
      <div className="max-w-4xl mx-auto w-full flex flex-col gap-6">
        
        {step === 1 && (
          <>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                 <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-black shadow-[0_0_10px_rgba(79,70,229,0.5)]">1</div>
                 <h2 className="text-2xl font-black text-white tracking-tight">Upload Your Syllabus</h2>
              </div>
              <p className="text-slate-400 text-sm font-medium ml-9">
                Provide the syllabus content — AI will generate questions from it.
              </p>
            </div>

            <div className="flex flex-col w-full rounded-3xl bg-[#131d2e]/80 border border-[#2b3952] shadow-xl overflow-hidden p-6 md:p-10 gap-8">
               <div className="flex items-center gap-2">
                 <button 
                    onClick={() => setActiveTab("upload")}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                      activeTab === "upload" ? "bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)]" : "text-slate-400 hover:text-slate-300 hover:bg-white/5"
                    }`}
                 >
                    <FileText size={16} /> Upload File
                 </button>
                 <button 
                    onClick={() => setActiveTab("paste")}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                      activeTab === "paste" ? "bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)]" : "text-slate-400 hover:text-slate-300 hover:bg-white/5"
                    }`}
                 >
                    <ClipboardPaste size={16} /> Paste Text
                 </button>
               </div>

               {activeTab === "upload" ? (
                 <div 
                    className="w-full h-80 rounded-2xl border-2 border-dashed border-slate-600/50 hover:border-indigo-500/50 transition-colors bg-[#0b1221]/50 flex flex-col items-center justify-center gap-4 cursor-pointer group"
                    onClick={handleAnalyze}
                 >
                    <div className="w-16 h-16 rounded-full bg-[#1e293b] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                       <Cloud size={32} className="text-indigo-400" />
                    </div>
                    <div className="flex flex-col items-center gap-2 text-center">
                       <span className="text-xl font-bold text-white tracking-tight">Drag & drop your syllabus here</span>
                       <span className="text-sm font-medium text-slate-500">Supports PDF, DOCX, TXT - Max 5 MB</span>
                    </div>
                    <Button 
                      className="mt-4 bg-[#1e293b] hover:bg-[#2b3952] border border-[#2b3952] hover:border-indigo-500/30 text-indigo-300 transition-all text-sm font-bold shadow-none group-hover:shadow-[0_0_20px_rgba(79,70,229,0.2)]"
                      disabled={isAnalyzing}
                    >
                      {isAnalyzing ? <Loader2 className="animate-spin" size={16} /> : "Browse File"}
                    </Button>
                 </div>
               ) : (
                 <div className="w-full rounded-2xl border border-slate-700/50 bg-[#0b1221]/50 p-1 flex flex-col h-80">
                    <textarea 
                      className="flex-1 w-full bg-transparent resize-none outline-none p-4 text-slate-300 placeholder:text-slate-600 font-medium"
                      placeholder="Paste your syllabus unit content here... Ex: Process Synchronization, Critical Section Problem, Mutex Locks..."
                      value={textInput}
                      onChange={e => setTextInput(e.target.value)}
                    />
                    <div className="p-3 border-t border-slate-700/50 flex justify-end">
                       <Button 
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm flex items-center gap-2"
                          onClick={handleAnalyze}
                          disabled={isAnalyzing || textInput.length < 10}
                       >
                         {isAnalyzing ? <><Loader2 className="animate-spin" size={16} /> Analyzing...</> : "Analyze Text"}
                       </Button>
                    </div>
                 </div>
               )}
            </div>
          </>
        )}

        {step === 3 && (
           <>
             <div className="flex flex-col gap-1 transition-all animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-black shadow-[0_0_10px_rgba(79,70,229,0.5)]">3</div>
                     <h2 className="text-2xl font-black text-white tracking-tight">Edit & Export</h2>
                  </div>
                  <Button 
                    onClick={handleSaveToBank} 
                    disabled={isSaving}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/20"
                  >
                     {isSaving ? <Loader2 className="animate-spin mr-2" size={16} /> : <Save size={16} className="mr-2" />} 
                     {isSaving ? "Saving..." : "Save to Question Bank"}
                  </Button>
               </div>
               <p className="text-emerald-400 text-sm font-medium ml-9">
                 Successfully mapped {metadata?.extractedTopics?.length || 5} topics and generated {generatedQuestions.length} questions.
               </p>
             </div>

             <div className="flex flex-col gap-4 transition-all animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
               {generatedQuestions.map((q, i) => (
                  <div key={i} className="bg-[#1e293b]/60 border border-slate-700/50 hover:bg-[#1e293b]/80 hover:border-slate-600/50 transition-all rounded-xl p-5 flex flex-col gap-3">
                     <div className="flex items-start justify-between gap-4">
                        <span className="font-mono text-xs font-bold text-slate-500 mt-0.5">Q{i + 1}</span>
                        <p className="flex-1 text-slate-200 text-sm font-medium leading-relaxed">{q.title}</p>
                     </div>
                     <div className="flex items-center gap-2 ml-8">
                        <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                          {q.difficulty}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 border border-slate-700 px-2 py-0.5 rounded">
                          {q.bloomLevel}
                        </span>
                        <span className="text-[10px] font-bold text-indigo-400 border border-indigo-500/20 bg-indigo-500/5 px-2 py-0.5 rounded ml-auto">
                          {q.tags?.[0] || 'Topic'}
                        </span>
                     </div>
                  </div>
               ))}
             </div>
           </>
        )}

      </div>
    </div>
  );
}
