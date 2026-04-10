"use client";

import { FormEvent, useState } from "react";
import { 
  Palette, 
  Image as ImageIcon, 
  Sparkles, 
  Layout, 
  ShieldCheck, 
  Zap, 
  Building2, 
  History, 
  Rocket,
  Paintbrush2,
  FileText,
  Eye,
  CheckCircle2
} from "lucide-react";
import { Button, Card, Input, StatusMessage } from "@examcraft/ui";
import { apiRequest } from "#api";

type BrandingWorkspaceProps = {
  accessToken: string;
  institutionId: string;
  initialBranding?: any;
};

export function BrandingWorkspace({
  accessToken,
  institutionId,
  initialBranding
}: BrandingWorkspaceProps) {
  const [logoUrl, setLogoUrl] = useState(initialBranding?.logoUrl || "");
  const [primaryColor, setPrimaryColor] = useState(initialBranding?.primaryColor || "#6366f1");
  const [secondaryColor, setSecondaryColor] = useState(initialBranding?.secondaryColor || "#1e1b4b");
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    try {
      await apiRequest("/tenant/branding", {
        method: "PATCH",
        accessToken,
        institutionId,
        body: JSON.stringify({
          logoUrl,
          primaryColor,
          secondaryColor
        })
      });

      setStatus("Institutional identity synchronized successfully.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to synchronize branding.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
         <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-2">
            <Sparkles size={10} /> Brand Authority Desk
         </div>
         <h1 className="text-4xl font-black tracking-tighter text-white">Identity Studio</h1>
         <p className="text-zinc-500 font-medium max-w-xl">Configure your institutional visual signatures to propagate across all pedagogical assets and dashboards.</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_1.5fr] gap-10 items-start">
         {/* Identity Editor */}
         <Card className="!bg-zinc-900 border-white/5 !rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[40px] -z-10 group-hover:bg-indigo-500/10 transition-all" />
            
            <div className="flex items-center gap-3 mb-10">
               <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-glow-indigo">
                  <Paintbrush2 size={24} />
               </div>
               <div>
                  <h2 className="text-2xl font-black tracking-tight text-white leading-none">Visual Protocol</h2>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mt-2">Core Identity Tokens</p>
               </div>
            </div>

            <form className="flex flex-col gap-8" onSubmit={handleSave}>
               <div className="flex flex-col gap-4">
                  <Input
                    label="Master Logo URL (PNG/SVG Preferred)"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://assets.examcraft.io/logos/your-uni.png"
                    leftIcon={<ImageIcon size={18} />}
                    className="!bg-black/20 !border-white/5 !py-4"
                  />
                  <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest px-1 italic">Note: High-transparency assets provide the best cinematic result.</p>
               </div>

               <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col gap-3">
                     <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Primary Aura</label>
                     <div className="flex items-center gap-3 p-2 bg-black/20 border border-white/5 rounded-2xl group/input">
                        <input 
                           type="color"
                           value={primaryColor}
                           onChange={(e) => setPrimaryColor(e.target.value)}
                           className="w-12 h-12 rounded-xl bg-transparent border-0 cursor-pointer"
                        />
                        <span className="text-xs font-black font-mono text-zinc-400 uppercase">{primaryColor}</span>
                     </div>
                  </div>
                  <div className="flex flex-col gap-3">
                     <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Surface Accent</label>
                     <div className="flex items-center gap-3 p-2 bg-black/20 border border-white/5 rounded-2xl group/input">
                        <input 
                           type="color"
                           value={secondaryColor}
                           onChange={(e) => setSecondaryColor(e.target.value)}
                           className="w-12 h-12 rounded-xl bg-transparent border-0 cursor-pointer"
                        />
                        <span className="text-xs font-black font-mono text-zinc-400 uppercase">{secondaryColor}</span>
                     </div>
                  </div>
               </div>

               <Button 
                  type="submit" 
                  loading={isSubmitting} 
                  fullWidth 
                  className="bg-white text-black py-6 rounded-2xl font-black text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-glow"
               >
                  Authorize Identity Sync
               </Button>
            </form>

            {status && (
              <StatusMessage className="mt-8 border-indigo-500/20 bg-indigo-500/5 shadow-2xl" variant="info">
                {status}
              </StatusMessage>
            )}
         </Card>

         {/* Identity Simulation */}
         <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-1">
               <h2 className="text-2xl font-black tracking-tighter text-white flex items-center gap-3">
                  Deployment Mockup
                  <div className="px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-[8px] font-black uppercase tracking-widest text-indigo-400">Live Simulation</div>
               </h2>
               <p className="text-zinc-500 text-sm font-medium">Real-time visualization of how your identity permeates the platform.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {/* Paper Header Simulation */}
               <Card className="!bg-zinc-900 border-white/5 !rounded-[2rem] p-8 shadow-xl flex flex-col gap-6 overflow-hidden relative group">
                  <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
                     <FileText size={40} className="text-zinc-700" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Pedagogical Paper Header</span>
                  
                  <div className="p-6 rounded-2xl bg-white border border-zinc-200 flex flex-col items-center gap-4 shadow-sm">
                     {logoUrl ? (
                        <img src={logoUrl} alt="Preview" className="h-10 w-auto object-contain" />
                     ) : (
                        <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-400 font-black text-xs">LOG</div>
                     )}
                     <div className="flex flex-col items-center text-center">
                        <h4 className="text-sm font-black uppercase tracking-tight text-zinc-900 leading-none mb-1">Prestige Academy of Excellence</h4>
                        <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">Global Examination Protocol</p>
                     </div>
                     <div className="w-full h-px bg-zinc-900 mt-2" style={{ backgroundColor: primaryColor }} />
                  </div>
               </Card>

               {/* Dashboard Link Simulation */}
               <Card className="!bg-zinc-900 border-white/5 !rounded-[2rem] p-8 shadow-xl flex flex-col gap-6 overflow-hidden relative group">
                  <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
                     <Layout size={40} className="text-zinc-700" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Sidebar Link Accent</span>
                  
                  <div className="p-6 rounded-2xl bg-black/40 border border-white/5 flex items-center gap-4">
                     <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-glow" style={{ backgroundColor: primaryColor }}>
                        <Zap size={20} />
                     </div>
                     <div className="flex flex-col">
                        <span className="text-sm font-black text-white">Operations Command</span>
                        <div className="flex items-center gap-2">
                           <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: primaryColor }} />
                           <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Session Active</span>
                        </div>
                     </div>
                  </div>
               </Card>

               {/* Full Brand Palette Simulation */}
               <Card className="!bg-zinc-900 border-white/5 !rounded-[2rem] p-8 shadow-xl flex flex-col gap-6 overflow-hidden relative col-span-full">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Surface Hierarchy Reflection</span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="flex flex-col gap-4">
                        <div className="h-32 rounded-3xl p-6 flex flex-col justify-end shadow-2xl relative overflow-hidden" style={{ backgroundColor: primaryColor }}>
                           <div className="absolute top-2 right-2 p-2 opacity-20">
                              <ShieldCheck size={40} className="text-white" />
                           </div>
                           <span className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-none mb-1">Primary Elevation</span>
                           <h4 className="text-xl font-black text-white leading-none capitalize">Mission Control</h4>
                        </div>
                        <div className="h-20 rounded-3xl p-6 flex items-center gap-4 bg-white/5 border border-white/10">
                           <div className="w-3 h-3 rounded-full" style={{ backgroundColor: primaryColor }} />
                           <span className="text-sm font-bold text-white">Dynamic Status Indicator</span>
                        </div>
                     </div>

                     <div className="flex flex-col gap-4">
                         <div className="flex-1 p-8 rounded-[2rem] border-2 border-dashed border-white/5 flex flex-col items-center justify-center gap-4 grayscale group hover:grayscale-0 transition-all cursor-crosshair">
                            <History size={32} className="text-zinc-700" />
                            <div className="flex flex-col items-center">
                               <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Snapshot</span>
                               <span className="text-xs font-bold text-zinc-500">Version 1.0.4 - Prestige</span>
                            </div>
                         </div>
                     </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700 italic px-2">
                     Atmospheric Signal Verification • ExamCraft Identity Engine
                  </div>
               </Card>
            </div>
         </div>
      </div>
    </div>
  );
}
