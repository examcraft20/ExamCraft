"use client";

import { FormEvent, useEffect, useMemo, useState, useRef } from "react";
import {
  Mail,
  Search,
  ShieldCheck,
  Users,
  Building2,
  Palette,
  Database,
  Plus,
  History,
  Sparkles,
  ChevronRight,
  UserPlus,
  Fingerprint,
  Zap,
  TrendingUp,
  Activity,
  LayoutGrid,
  FileText,
  Clock,
  ArrowUpRight,
  ArrowRight,
  MoreVertical,
  UserCog,
  UserX,
  Trash2
} from "lucide-react";
import { Button, Card, Input, Select, Spinner, StatusMessage, formatRoleName } from "@examcraft/ui";
import { apiRequest } from "#api";
import { AcademicStructureWorkspace } from "./academic-structure-workspace";
import { BrandingWorkspace } from "./branding-workspace";
import { MembershipSummary } from "../../../lib/dashboard";
import { StatCard } from "../shared/StatCard";
import { ActivityFeed } from "../shared/ActivityFeed";
import { Table } from "../shared/Table";

type InstitutionAdminWorkspaceProps = {
  accessToken: string;
  institutionId: string;
  membership?: MembershipSummary | null;
  institutionName?: string;
};

type PeopleResponse = {
  users: Array<{
    institutionUserId: string;
    userId: string;
    displayName: string | null;
    status: string;
    joinedAt: string | null;
    roleCodes: string[];
  }>;
  invitations: Array<{
    id: string;
    email: string;
    roleCode: string;
    status: string;
    expiresAt: string;
    createdAt: string;
  }>;
};

const roleOptions = [
  { label: "Faculty Member", value: "faculty" },
  { label: "Academic Head", value: "academic_head" },
  { label: "Reviewer Approver", value: "reviewer_approver" },
  { label: "Institution Admin", value: "institution_admin" }
];

function MemberActionsMenu({ member, onAction }: { member: any; onAction: (action: string, member: any) => void }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
      >
        <MoreVertical className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-8 z-50 w-48 bg-[#1e293b] border border-white/10 rounded-xl shadow-xl py-1 overflow-hidden">
          <button
            onClick={() => { onAction('change-role', member); setOpen(false); }}
            className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white flex items-center gap-2 transition-colors"
          >
            <UserCog className="w-4 h-4" /> Change Role
          </button>
          {member.status === 'pending' && (
            <button
              onClick={() => { onAction('resend-invite', member); setOpen(false); }}
              className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white flex items-center gap-2 transition-colors"
            >
              <Mail className="w-4 h-4" /> Resend Invite
            </button>
          )}
          <button
            onClick={() => { 
              onAction(member.status === 'active' ? 'deactivate' : 'reactivate', member);
              setOpen(false); 
            }}
            className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white flex items-center gap-2 transition-colors"
          >
            <UserX className="w-4 h-4" /> {member.status === 'active' ? 'Deactivate' : 'Reactivate'}
          </button>
          <div className="border-t border-white/5 my-1" />
          <button
            onClick={() => { onAction('remove', member); setOpen(false); }}
            className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
          >
            <Trash2 className="w-4 h-4" /> Remove from Institution
          </button>
        </div>
      )}
    </div>
  );
}

export function InstitutionAdminWorkspace({
  accessToken,
  institutionId,
  membership,
  institutionName
}: InstitutionAdminWorkspaceProps) {
  const [people, setPeople] = useState<PeopleResponse | null>(null);
  const [email, setEmail] = useState("");
  const [roleCode, setRoleCode] = useState("faculty");
  const [status, setStatus] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "team" | "academic" | "branding">("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [invitationSearch, setInvitationSearch] = useState("");

  useEffect(() => {
    let isMounted = true;
    async function loadPeople() {
      try {
        const response = await apiRequest<PeopleResponse>("/people/users", { method: "GET", accessToken, institutionId });
        if (isMounted) setPeople(response);
      } catch (error) {
        if (isMounted) setStatus(error instanceof Error ? error.message : "Unable to load institution operations.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    void loadPeople();
    return () => { isMounted = false; };
  }, [accessToken, institutionId]);

  async function handleInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus(null);
    try {
      const response = await apiRequest<{ rawToken: string; invitation: { email: string } }>(
        "/people/invitations", { method: "POST", accessToken, institutionId, body: JSON.stringify({ institutionId, email, roleCode }) }
      );
      const refreshed = await apiRequest<PeopleResponse>("/people/users", { method: "GET", accessToken, institutionId });
      setPeople(refreshed);
      setEmail("");
      setRoleCode("faculty");
      setStatus(`Institutional invite dispatched to ${response.invitation.email}.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Invitation failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const filteredUsers = useMemo(() => {
    const needle = userSearch.trim().toLowerCase();
    if (!needle) return people?.users ?? [];
    return (people?.users ?? []).filter((u) => [u.displayName ?? "", u.status, u.roleCodes.join(" ")].join(" ").toLowerCase().includes(needle));
  }, [people?.users, userSearch]);

  const filteredInvitations = useMemo(() => {
    const needle = invitationSearch.trim().toLowerCase();
    if (!needle) return people?.invitations ?? [];
    return (people?.invitations ?? []).filter((inv) => [inv.email, inv.roleCode, inv.status].join(" ").toLowerCase().includes(needle));
  }, [invitationSearch, people?.invitations]);

  const tabs = [
    { id: "overview", label: "Command Deck", icon: Zap },
    { id: "team", label: "Staff & Team", icon: Users },
    { id: "academic", label: "Curriculum", icon: Database },
    { id: "branding", label: "Identity", icon: Palette }
  ] as const;

  const handleMemberAction = async (action: string, member: any) => {
    switch (action) {
      case "deactivate":
      case "reactivate":
        setStatus(`Member ${member.displayName} ${action}d (Simulation)`);
        break;
      case "resend-invite":
        setStatus(`Invite resent to ${member.displayName} (Simulation)`);
        break;
      case "remove":
        if (confirm(`Remove ${member.displayName} from institution?`)) {
          setStatus(`${member.displayName} removed (Simulation)`);
        }
        break;
      case "change-role":
        setStatus(`Change role for ${member.displayName} (Simulation)`);
        break;
    }
  };

  return (
    <div className="flex flex-col gap-10">
      {/* Sub-Header with Action Button */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
         <div className="flex flex-col gap-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-2">
               <Building2 size={10} /> {institutionName ?? 'Institutional'} Nexus
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-white">Operations Command</h1>
            <p className="text-zinc-500 font-medium max-w-xl">Orchestrate your institution's pedagogical landscape, manage authority, and synchronize brand identity.</p>
         </div>
         <div className="flex items-center gap-3">
            <Button variant="secondary" className="px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
               <History size={14} /> Audit Archive
            </Button>
            <Button onClick={() => setActiveTab('team')} className="bg-white text-black px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-glow">
               <UserPlus size={14} /> Provision Staff
            </Button>
         </div>
      </div>

      <nav className="flex items-center gap-2 p-1.5 rounded-2xl bg-zinc-900/50 border border-white/5 w-fit">
        {tabs.map((tab) => (
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

      {status && <StatusMessage variant="info" className="shadow-2xl">{status}</StatusMessage>}

      <div className="relative">
        {activeTab === "overview" && (
          <div className="flex flex-col gap-10">
             {/* Dynamic Analytics Grid */}
             <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  icon={TrendingUp}
                  number="348"
                  label="Questions Synthesized"
                  color="indigo"
                />
                <StatCard
                  icon={Users}
                  number={people?.users.length ?? 0}
                  label="Active Faculty"
                  color="indigo"
                />
                <StatCard
                  icon={Mail}
                  number={people?.invitations.length ?? 0}
                  label="Pending Invites"
                  color="indigo"
                />
                <StatCard
                  icon={Zap}
                  number="99.9%"
                  label="System Uptime"
                  color="indigo"
                />
             </div>

             <div className="grid lg:grid-cols-[1.5fr_1fr] gap-10">
                {/* Recent Activity Blueprint */}
                <Card className="!bg-zinc-900 border-white/5 !rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] -z-10" />
                   <div className="flex items-center justify-between gap-4 mb-10">
                      <div>
                         <h2 className="text-3xl font-black tracking-tighter text-white uppercase">Operational Activity</h2>
                         <p className="text-zinc-500 text-sm font-medium mt-1">Live feed of institutional events and pedagogical progress.</p>
                      </div>
                      <div className="flex items-center gap-2 text-emerald-400">
                         <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                         <span className="text-[10px] font-black uppercase tracking-widest">Authorized Feed</span>
                      </div>
                   </div>

                   <ActivityFeed
                     activities={[
                       { type: "question_created", description: "New Question Set Finalized", actor: "Dr. Sarah Mitchell", timestamp: new Date(Date.now() - 12 * 60000) },
                       { type: "paper_generated", description: "Reviewer Assigned: End Term Draft", actor: "Admin Protocol", timestamp: new Date(Date.now() - 60 * 60000) },
                       { type: "user_added", description: "New Faculty Identity Synchronized", actor: "mark.v@unive.edu", timestamp: new Date(Date.now() - 3 * 60 * 60000) },
                       { type: "paper_approved", description: "Exam Paper Blueprint Validated", actor: "Prof. Alan Turing", timestamp: new Date(Date.now() - 5 * 60 * 60000) }
                     ]}
                     maxItems={4}
                   />

                   <Button variant="ghost" fullWidth className="mt-8 border-white/5 py-4 rounded-xl text-zinc-600 font-black text-[10px] uppercase tracking-[0.3em] hover:text-white transition-all">
                      Load Extended Audit Records
                   </Button>
                </Card>

                {/* Shard Health Sidebar */}
                <div className="flex flex-col gap-8">
                   <div className="flex flex-col gap-1 px-2">
                      <h3 className="text-xl font-black text-white uppercase tracking-tighter">Curriculum Shards</h3>
                      <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Active Department Velocity</p>
                   </div>
                   
                   <div className="grid gap-4">
                      {[
                        { name: "Computer Science", questions: 124, velocity: "+12%", color: "bg-blue-500" },
                        { name: "Mechanical Engineering", questions: 89, velocity: "+5%", color: "bg-emerald-500" },
                        { name: "Liberal Arts", questions: 54, velocity: "+22%", color: "bg-amber-500" }
                      ].map((shard, i) => (
                         <div key={i} className="p-6 rounded-3xl bg-zinc-900 border border-white/5 hover:border-white/10 transition-all flex flex-col gap-4 shadow-lg group">
                            <div className="flex items-center justify-between">
                               <span className="text-sm font-black text-white uppercase">{shard.name}</span>
                               <span className="text-[10px] font-black text-emerald-400">{shard.velocity}</span>
                            </div>
                            <div className="flex flex-col gap-2">
                               <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-zinc-600">
                                  <span>Questions Synthesized</span>
                                  <span>{shard.questions} / 200 Target</span>
                               </div>
                               <div className="w-full h-1.5 rounded-full bg-black/40 overflow-hidden border border-white/5">
                                  <div className={`h-full ${shard.color} transition-all duration-1000 group-hover:shadow-[0_0_10px_rgba(99,102,241,0.5)]`} style={{ width: `${(shard.questions/200)*100}%` }} />
                               </div>
                            </div>
                         </div>
                      ))}
                   </div>

                   <Card className="!bg-indigo-600 !rounded-[2rem] p-6 shadow-glow-indigo group relative overflow-hidden cursor-pointer active:scale-95 transition-all">
                      <div className="absolute top-[-20px] left-[-20px] w-32 h-32 bg-white/10 blur-[40px] rotate-12" />
                      <div className="flex items-center gap-4 relative z-10">
                         <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-indigo-600 shadow-2xl">
                            <Sparkles size={24} />
                         </div>
                         <div className="flex flex-col">
                            <span className="text-sm font-black text-white uppercase tracking-tight leading-none mb-1">Generate Insights</span>
                            <span className="text-[10px] font-bold text-white/60">Launch AI Growth Projection</span>
                         </div>
                         <ArrowRight size={20} className="ml-auto text-white" />
                      </div>
                   </Card>
                </div>
             </div>
          </div>
        )}

        {activeTab === "branding" && (
          <BrandingWorkspace 
            accessToken={accessToken} 
            institutionId={institutionId} 
            initialBranding={membership?.branding} 
          />
        )}
        
        {activeTab === "academic" && (
          <AcademicStructureWorkspace accessToken={accessToken} institutionId={institutionId} />
        )}
        
        {activeTab === "team" && (
          <div className="grid lg:grid-cols-[1fr_1.5fr] gap-10 items-start">
             {/* Operations Sidebar */}
             <Card className="!bg-zinc-900 border-white/5 !rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[40px] -z-10 group-hover:bg-indigo-500/10 transition-all" />
                
                <div className="flex items-center gap-3 mb-8">
                   <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                      <UserPlus size={20} />
                   </div>
                   <h2 className="text-2xl font-black tracking-tight text-white">Invite Staff</h2>
                </div>

                <form className="flex flex-col gap-6" onSubmit={handleInvite}>
                  <Input
                    label="Official Email Address"
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="coordinator@institution.edu"
                    leftIcon={<Mail size={16} />}
                  />

                  <Select
                    label="Assigned Authority Level"
                    required
                    value={roleCode}
                    onChange={(event) => setRoleCode(event.target.value)}
                    options={roleOptions}
                    leftIcon={<ShieldCheck size={16} />}
                  />

                  <Button type="submit" loading={isSubmitting} fullWidth className="bg-white text-black py-6 rounded-2xl font-black text-lg shadow-2xl hover:scale-[1.02] active:scale-95 transition-all mt-4 uppercase tracking-widest">
                    {isSubmitting ? "Dispatching..." : "Send Invitation"}
                  </Button>
                </form>
             </Card>

             {/* Team List & Invites Grid */}
             <div className="flex flex-col gap-10">
                {/* Active Team */}
                <div className="flex flex-col gap-6">
                   <div className="flex items-center justify-between gap-4">
                      <div className="flex flex-col gap-1">
                         <h3 className="text-2xl font-black tracking-tight text-white">Active Team Directory</h3>
                         <p className="text-zinc-500 text-sm font-medium">Verified institutional users with authorized pedagogical access.</p>
                      </div>
                      <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                         {filteredUsers.length} Staff Members
                      </div>
                   </div>

                   <div className="relative group">
                      <div className="absolute inset-y-0 left-4 flex items-center text-zinc-500 group-focus-within:text-indigo-400 transition-colors">
                         <Search size={18} />
                      </div>
                      <input 
                        type="text"
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        placeholder="Search by name, authority, or coordination status..."
                        className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-xl"
                      />
                   </div>

                   <div className="grid gap-4">
                      {isLoading ? (
                        <div className="flex justify-center p-20 animate-pulse"><Spinner /></div>
                      ) : filteredUsers.length === 0 ? (
                        <div className="p-16 rounded-[2.5rem] bg-white/5 border border-white/5 border-dashed text-center flex flex-col items-center gap-4">
                           <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-zinc-600"><Users size={24} /></div>
                           <p className="text-zinc-500 font-bold tracking-tight">No institutional staff identified.</p>
                        </div>
                      ) : (
                        <Table<typeof filteredUsers[0]>
                          columns={[
                            {
                              key: "displayName",
                              label: "Name",
                              render: (value) => (
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-zinc-500">
                                    <Fingerprint size={16} />
                                  </div>
                                  <span className="font-bold text-white">{value ?? "Unauthorized Name"}</span>
                                </div>
                              )
                            },
                            {
                              key: "roleCodes",
                              label: "Role",
                              render: (value: string[]) => (
                                <span className="text-indigo-400 font-bold text-sm">{value.map(formatRoleName).join(", ")}</span>
                              )
                            },
                            {
                              key: "status",
                              label: "Status",
                              render: (value) => (
                                <span className={`text-xs font-bold uppercase tracking-wide ${value === "active" ? "text-emerald-400" : "text-amber-400"}`}>
                                  {value}
                                </span>
                              )
                            },
                            {
                              key: "joinedAt",
                              label: "Joined",
                              render: (value) => (
                                <span className="text-xs text-zinc-400">{value ? new Date(value).toLocaleDateString("en-US") : "PENDING"}</span>
                              )
                            },
                            {
                              key: "actions",
                              label: "",
                              render: (_, member) => <MemberActionsMenu member={member} onAction={handleMemberAction} />
                            }
                          ]}
                          data={filteredUsers}
                        />
                      )}
                   </div>
                </div>

                {/* Invitations History */}
                <div className="flex flex-col gap-6 pt-10 border-t border-white/5">
                   <div className="flex flex-col gap-1">
                      <h3 className="text-xl font-black tracking-tight text-white leading-none">Invitation History & Audit</h3>
                      <p className="text-zinc-600 text-xs font-medium uppercase tracking-widest mt-1">Registry of pending and past staff authorizations.</p>
                   </div>
                   
                   <div className="grid gap-3">
                      {filteredInvitations.length === 0 ? (
                        <div className="p-8 rounded-2xl bg-white/5 border border-white/5 border-dashed text-center flex flex-col items-center gap-2">
                           <p className="text-zinc-500 font-medium text-sm">No pending invitations.</p>
                        </div>
                      ) : (
                        <Table<typeof filteredInvitations[0]>
                          columns={[
                            {
                              key: "email",
                              label: "Email",
                              render: (value) => (
                                <div className="flex items-center gap-2">
                                  <Mail size={14} className="text-zinc-500" />
                                  <span className="font-medium text-zinc-300">{value}</span>
                                </div>
                              )
                            },
                            {
                              key: "roleCode",
                              label: "Role",
                              render: (value) => (
                                <span className="text-xs font-bold uppercase tracking-wide text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded">{value}</span>
                              )
                            },
                            {
                              key: "status",
                              label: "Status",
                              render: (value) => (
                                <span className="text-xs font-bold uppercase text-zinc-500">{value}</span>
                              )
                            },
                            {
                              key: "expiresAt",
                              label: "Expires",
                              render: (value) => (
                                <span className="text-xs text-zinc-600">{new Date(value).toLocaleDateString("en-US")}</span>
                              )
                            },
                            {
                              key: "actions",
                              label: "",
                              render: (_, member) => <MemberActionsMenu member={member} onAction={handleMemberAction} />
                            }
                          ]}
                          data={filteredInvitations}
                        />
                      )}
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
