"use client";

import { useState } from "react";
import { Card } from "@examcraft/ui";
import { ToggleSwitch } from "../ui/toggle-switch";
import { Flag, ShieldAlert } from "lucide-react";

type FeatureFlag = {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  scope: "global" | "per_tenant";
};

const mockFlags: FeatureFlag[] = [
  {
    id: "1",
    name: "CSV Bulk Import",
    description: "Allow institutions to bulk import questions via CSV",
    enabled: true,
    scope: "global"
  },
  {
    id: "2",
    name: "Paper Templates",
    description: "Enable exam paper generation from templates",
    enabled: true,
    scope: "global"
  },
  {
    id: "3",
    name: "AI Question Generator",
    description: "Generate questions using AI models",
    enabled: false,
    scope: "per_tenant"
  },
  {
    id: "4",
    name: "Advanced Analytics",
    description: "Show advanced platform analytics dashboard",
    enabled: false,
    scope: "global"
  },
  {
    id: "5",
    name: "Collaborative Reviews",
    description: "Allow multiple reviewers on same paper",
    enabled: true,
    scope: "per_tenant"
  },
  {
    id: "6",
    name: "Mobile App",
    description: "Access via mobile app",
    enabled: false,
    scope: "global"
  }
];

export function FeatureFlagsTable() {
  const [flags, setFlags] = useState<FeatureFlag[]>(mockFlags);

  const handleToggle = async (id: string) => {
    setFlags(flags.map(flag =>
      flag.id === id ? { ...flag, enabled: !flag.enabled } : flag
    ));

    // TODO: Call API to persist change
    // await apiRequest(`/admin/flags/${id}`, {
    //   method: "PATCH",
    //   body: JSON.stringify({ enabled: !flag.enabled })
    // });
  };

  return (
    <Card className="!bg-[#080808] border-white/[0.05] !rounded-[2.5rem] p-8 shadow-[0_0_40px_rgba(0,0,0,0.5)] relative overflow-hidden group/card">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-[#ec4899]/10 via-[#7c3aed]/5 to-transparent blur-[100px] rounded-full pointer-events-none opacity-50 group-hover/card:opacity-100 transition-opacity duration-700" />
      
      <div className="flex items-center justify-between mb-8 relative z-10 flex-shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-2xl font-black text-white tracking-tighter relative inline-block">
              Feature Matrix
            </h2>
            <div className="px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-[10px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
              <ShieldAlert size={12} strokeWidth={3} />
              Admin Only
            </div>
          </div>
          <p className="text-slate-400 text-sm font-medium">Control global capability releases and tenant-specific features</p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto relative z-10 rounded-[1.5rem] border border-white/[0.05] bg-[#0c0c0c]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02]">
              <th className="py-4 px-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Capability</th>
              <th className="py-4 px-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Description</th>
              <th className="py-4 px-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">State</th>
              <th className="py-4 px-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Scope</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {flags.map((flag) => (
              <tr key={flag.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="py-5 px-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/[0.05] border border-white/10 group-hover:border-[#7c3aed]/30 group-hover:bg-[#7c3aed]/10 transition-colors">
                      <Flag size={14} className="text-slate-300 group-hover:text-[#a5b4fc] transition-colors" />
                    </div>
                    <p className="font-bold text-white tracking-tight">{flag.name}</p>
                  </div>
                </td>
                <td className="py-5 px-6">
                  <p className="text-sm text-slate-400 font-medium">{flag.description}</p>
                </td>
                <td className="py-5 px-6">
                  <ToggleSwitch
                    enabled={flag.enabled}
                    onChange={() => handleToggle(flag.id)}
                  />
                  <span className={`text-[10px] uppercase font-black tracking-widest mt-1 block ${flag.enabled ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {flag.enabled ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td className="py-5 px-6">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border inline-block ${
                    flag.scope === "global" 
                      ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                      : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                  }`}>
                    {flag.scope === "global" ? "Global" : "Tenant Limited"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
