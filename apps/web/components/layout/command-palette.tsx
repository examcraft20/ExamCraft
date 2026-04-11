"use client";

import { useEffect, useState, useMemo } from "react";
import { 
  Search, 
  Command, 
  Zap, 
  Building2, 
  BookOpen, 
  Plus, 
  Settings, 
  Users, 
  ShieldCheck, 
  History,
  FileText,
  Palette,
  Database
} from "lucide-react";
import { useRouter } from "next/navigation";

type Action = {
  id: string;
  title: string;
  subtitle: string;
  icon: any;
  category: "Navigation" | "Creation" | "Management" | "System";
  shortcut?: string;
  onSelect: () => void;
};

export function CommandPalette({ institutionId }: { institutionId?: string | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  const actions: Action[] = useMemo(() => [
    {
      id: "qbank",
      title: "Open Question Bank",
      subtitle: "Access institutional pedagogical repository",
      icon: Database,
      category: "Navigation",
      shortcut: "G Q",
      onSelect: () => router.push(`/dashboard/faculty?institutionId=${institutionId}`)
    },
    {
      id: "new-paper",
      title: "Synthesize New Paper",
      subtitle: "Launch exam paper creation workflow",
      icon: Plus,
      category: "Creation",
      shortcut: "N P",
      onSelect: () => router.push(`/dashboard/faculty?institutionId=${institutionId}`)
    },
    {
      id: "identity",
      title: "Brand Identity Studio",
      subtitle: "Configure institutional visual protocol",
      icon: Palette,
      category: "Management",
      onSelect: () => router.push(`/dashboard/institution_admin?institutionId=${institutionId}`)
    },
    {
      id: "curriculum",
      title: "Curriculum Architect",
      subtitle: "Manage departments and courses",
      icon: BookOpen,
      category: "Management",
      onSelect: () => router.push(`/dashboard/institution_admin?institutionId=${institutionId}`)
    },
    {
      id: "team",
      title: "Staff & Authority",
      subtitle: "Manage institutional team members",
      icon: Users,
      category: "Management",
      onSelect: () => router.push(`/dashboard/institution_admin?institutionId=${institutionId}`)
    },
    {
      id: "switch",
      title: "Switch Workspace",
      subtitle: "Return to institution nexus",
      icon: Building2,
      category: "Navigation",
      shortcut: "S W",
      onSelect: () => router.push("/dashboard")
    }
  ], [institutionId, router]);

  const filteredActions = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return actions;
    return actions.filter(a => 
      a.title.toLowerCase().includes(q) || 
      a.subtitle.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q)
    );
  }, [query, actions]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-black/60 animate-in fade-in duration-300">
      <div 
        className="w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-[2.5rem] shadow-[0_0_100px_rgba(99,102,241,0.2)] overflow-hidden animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="relative group border-b border-white/5">
           <div className="absolute inset-y-0 left-8 flex items-center text-indigo-400">
              <Command size={22} className="group-focus-within:animate-pulse" />
           </div>
           <input 
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Command institutional operations..."
              className="w-full bg-transparent py-10 pl-20 pr-8 text-xl font-black text-white placeholder:text-zinc-700 outline-none uppercase tracking-tighter"
           />
           <div className="absolute inset-y-0 right-8 flex items-center gap-2">
              <kbd className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-black text-zinc-500 uppercase tracking-widest">ESC</kbd>
           </div>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto p-4 custom-scrollbar">
           {Object.entries(
             filteredActions.reduce((acc, action) => {
               if (!acc[action.category]) acc[action.category] = [];
               acc[action.category].push(action);
               return acc;
             }, {} as Record<string, Action[]>)
           ).map(([category, items]) => (
             <div key={category} className="mb-6 last:mb-0">
                <div className="px-4 mb-3">
                   <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">{category}</h4>
                </div>
                <div className="grid gap-2">
                   {items.map((action) => (
                      <button
                        key={action.id}
                        onClick={() => {
                          action.onSelect();
                          setIsOpen(false);
                        }}
                        className="group w-full p-4 rounded-2xl bg-transparent hover:bg-white/5 border border-transparent hover:border-white/5 transition-all flex items-center justify-between text-left"
                      >
                         <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-zinc-600 group-hover:text-indigo-400 group-hover:bg-white/10 group-hover:shadow-glow-indigo transition-all">
                               <action.icon size={20} />
                            </div>
                            <div className="flex flex-col">
                               <span className="text-sm font-black text-white group-hover:text-indigo-300 transition-colors uppercase tracking-tight">{action.title}</span>
                               <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{action.subtitle}</span>
                            </div>
                         </div>
                         {action.shortcut && (
                            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                               {action.shortcut.split(' ').map((key, i) => (
                                  <kbd key={i} className="px-2 py-0.5 rounded-md bg-white/10 border border-white/10 text-[8px] font-black text-zinc-400">{key}</kbd>
                               ))}
                            </div>
                         )}
                      </button>
                   ))}
                </div>
             </div>
           ))}

           {filteredActions.length === 0 && (
             <div className="py-20 flex flex-col items-center justify-center gap-4 animate-in fade-in slide-in-from-top-4">
                <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-center text-zinc-700">
                   <Search size={32} />
                </div>
                <p className="text-zinc-500 font-black uppercase tracking-widest text-xs text-center">No matching protocols identified in this shard.</p>
             </div>
           )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-black/20 border-t border-white/5 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-zinc-700">
           <div className="flex items-center gap-6">
              <span className="flex items-center gap-2"><ArrowDown size={12} /> <ArrowUp size={12} /> Navigate</span>
              <span className="flex items-center gap-2">Enter Select</span>
           </div>
           <div className="flex items-center gap-2 text-indigo-500/40">
              <Zap size={10} /> Authorized Command Layer
           </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.1); }
      `}</style>
    </div>
  );
}

// Icons for footer
function ArrowUp({ size }: { size: number }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>; }
function ArrowDown({ size }: { size: number }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>; }
