"use client";

import { useState, useMemo } from "react";
import { Search, Mail, UserCog, UserX, Trash2, MoreVertical, ShieldCheck } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Button, formatRoleName } from "@examcraft/ui";

interface Member {
  institutionUserId: string;
  userId: string;
  displayName: string | null;
  status: string;
  roleCodes: string[];
  email?: string;
}

interface TeamTableProps {
  members: Member[];
  onAction: (action: string, member: Member) => void;
  isSubmitting?: boolean;
}

export function TeamTable({ members, onAction, isSubmitting }: TeamTableProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMembers = useMemo(() => {
    const needle = searchQuery.trim().toLowerCase();
    if (!needle) return members;
    return members.filter((m) =>
      [m.displayName ?? "", m.status, (m.roleCodes || []).join(" "), m.email ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(needle)
    );
  }, [members, searchQuery]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4 p-2 rounded-2xl bg-zinc-900 border border-white/5 shadow-2xl overflow-hidden focus-within:border-indigo-500/30 transition-all">
        <div className="pl-4 text-zinc-500">
          <Search size={20} />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search team members by name, role or status..."
          className="flex-1 bg-transparent border-none py-3 px-2 text-sm font-medium text-white focus:outline-none placeholder:text-zinc-600"
        />
      </div>

      <div className="rounded-[2rem] bg-zinc-900/50 border border-white/5 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-white/5 bg-white/5">
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 py-6 pl-8">Member Identity</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Authorization</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Status</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 text-right pr-8">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMembers.map((member) => (
              <TableRow key={member.institutionUserId || member.userId} className="border-white/5 hover:bg-white/[0.02] transition-colors group">
                <TableCell className="py-6 pl-8">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold group-hover:scale-110 transition-transform">
                      {(member.displayName || member.email || "U")[0].toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-white group-hover:text-indigo-300 transition-colors uppercase tracking-tight">
                        {member.displayName || "Unidentified User"}
                      </span>
                      <span className="text-xs text-zinc-500 font-medium lowercase italic">{member.email || "no-email@examcraft.io"}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1.5">
                    {member.roleCodes.map((role) => (
                      <span key={role} className="px-2.5 py-1 rounded-lg bg-zinc-800 text-[10px] font-black uppercase tracking-widest text-zinc-400 border border-white/5">
                        {formatRoleName(role)}
                      </span>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                   <div className="flex items-center gap-2">
                     <div className={`w-1.5 h-1.5 rounded-full ${member.status === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500'}`} />
                     <span className={`text-[10px] font-black uppercase tracking-widest ${member.status === 'active' ? 'text-emerald-400' : 'text-rose-400'}`}>
                       {member.status}
                     </span>
                   </div>
                </TableCell>
                <TableCell className="text-right pr-8">
                  <MemberActionsMenu member={member} onAction={onAction} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function MemberActionsMenu({ member, onAction }: { member: Member; onAction: (action: string, member: Member) => void }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-xl hover:bg-white/5 text-zinc-600 hover:text-white transition-colors"
      >
        <MoreVertical size={18} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-zinc-950 border border-white/10 shadow-3xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
             <button 
               onClick={() => { onAction("change-role", member); setIsOpen(false); }}
               className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
             >
               <UserCog size={14} /> Change Role
             </button>
             <button 
               onClick={() => { onAction(member.status === 'active' ? 'deactivate' : 'reactivate', member); setIsOpen(false); }}
               className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
             >
               <UserX size={14} /> {member.status === 'active' ? 'Deactivate' : 'Reactivate'}
             </button>
             <div className="h-px bg-white/5 mx-2" />
             <button 
               onClick={() => { onAction("remove", member); setIsOpen(false); }}
               className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition-colors"
             >
               <Trash2 size={14} /> Remove Member
             </button>
          </div>
        </>
      )}
    </div>
  );
}
