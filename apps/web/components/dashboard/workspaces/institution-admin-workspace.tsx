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
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Button,
  Card,
  Input,
  Select,
  Spinner,
  StatusMessage,
  formatRoleName,
} from "@examcraft/ui";
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
  { label: "Institution Admin", value: "institution_admin" },
];

function MemberActionsMenu({
  member,
  onAction,
}: {
  member: any;
  onAction: (action: string, member: any) => void;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
            onClick={() => {
              onAction("change-role", member);
              setOpen(false);
            }}
            className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white flex items-center gap-2 transition-colors"
          >
            <UserCog className="w-4 h-4" /> Change Role
          </button>
          {member.status === "pending" && (
            <button
              onClick={() => {
                onAction("resend-invite", member);
                setOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white flex items-center gap-2 transition-colors"
            >
              <Mail className="w-4 h-4" /> Resend Invite
            </button>
          )}
          <button
            onClick={() => {
              onAction(
                member.status === "active" ? "deactivate" : "reactivate",
                member,
              );
              setOpen(false);
            }}
            className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white flex items-center gap-2 transition-colors"
          >
            <UserX className="w-4 h-4" />{" "}
            {member.status === "active" ? "Deactivate" : "Reactivate"}
          </button>
          <div className="border-t border-white/5 my-1" />
          <button
            onClick={() => {
              onAction("remove", member);
              setOpen(false);
            }}
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
  institutionName,
}: InstitutionAdminWorkspaceProps) {
  const [people, setPeople] = useState<PeopleResponse | null>(null);
  const [email, setEmail] = useState("");
  const [roleCode, setRoleCode] = useState("faculty");
  const [questions, setQuestions] = useState<any[]>([]);
  const [papers, setPapers] = useState<any[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "academic" | "branding"
  >("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [invitationSearch, setInvitationSearch] = useState("");
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as any;

  useEffect(() => {
    if (tabParam && ["overview", "academic", "branding"].includes(tabParam)) {
      setActiveTab(tabParam);
    } else if (!tabParam) {
      setActiveTab("overview");
    }
  }, [tabParam]);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [peopleRes, questionsRes, papersRes] = await Promise.all([
          apiRequest<PeopleResponse>("/people/users", {
            method: "GET",
            accessToken,
            institutionId,
          }),
          apiRequest<any[]>("/content/questions", {
            method: "GET",
            accessToken,
            institutionId,
          }),
          apiRequest<any[]>("/content/papers", {
            method: "GET",
            accessToken,
            institutionId,
          }),
        ]);
        if (isMounted) {
          setPeople(peopleRes);
          setQuestions(Array.isArray(questionsRes) ? questionsRes : []);
          setPapers(Array.isArray(papersRes) ? papersRes : []);
        }
      } catch (error) {
        if (isMounted)
          setStatus(
            error instanceof Error
              ? error.message
              : "Unable to load institution operations.",
          );
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    void loadData();
    return () => {
      isMounted = false;
    };
  }, [accessToken, institutionId]);

  async function handleInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus(null);
    try {
      const response = await apiRequest<{
        rawToken: string;
        invitation: { email: string };
      }>("/people/invitations", {
        method: "POST",
        accessToken,
        institutionId,
        body: JSON.stringify({ institutionId, email, roleCode }),
      });
      const refreshed = await apiRequest<PeopleResponse>("/people/users", {
        method: "GET",
        accessToken,
        institutionId,
      });
      setPeople(refreshed);
      setEmail("");
      setRoleCode("faculty");
      setStatus(
        `Institutional invite dispatched to ${response.invitation.email}.`,
      );
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Invitation failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const filteredUsers = useMemo(() => {
    const needle = userSearch.trim().toLowerCase();
    if (!needle) return people?.users ?? [];
    return (people?.users ?? []).filter((u) =>
      [u.displayName ?? "", u.status, u.roleCodes.join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [people?.users, userSearch]);

  const filteredInvitations = useMemo(() => {
    const needle = invitationSearch.trim().toLowerCase();
    if (!needle) return people?.invitations ?? [];
    return (people?.invitations ?? []).filter((inv) =>
      [inv.email, inv.roleCode, inv.status]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [invitationSearch, people?.invitations]);

  const tabs = [
    { id: "overview", label: "Command Deck", icon: Zap },
    { id: "academic", label: "Curriculum", icon: Database },
    { id: "branding", label: "Identity", icon: Palette },
  ] as const;

  const handleMemberAction = async (action: string, member: any) => {
    setStatus(null);
    setIsSubmitting(true);

    try {
      switch (action) {
        case "deactivate":
          await apiRequest(`/people/users/${member.institutionUserId}`, {
            method: "PATCH",
            accessToken,
            institutionId,
            body: JSON.stringify({ status: "disabled" }),
          });
          setStatus(
            `Member ${member.displayName || member.email} has been deactivated.`,
          );
          break;
        case "reactivate":
          await apiRequest(`/people/users/${member.institutionUserId}`, {
            method: "PATCH",
            accessToken,
            institutionId,
            body: JSON.stringify({ status: "active" }),
          });
          setStatus(
            `Member ${member.displayName || member.email} has been reactivated.`,
          );
          break;
        case "resend-invite":
          await apiRequest(
            `/people/invitations/${member.invitationId}/resend`,
            {
              method: "POST",
              accessToken,
              institutionId,
            },
          );
          setStatus(`Invite resent to ${member.email}.`);
          break;
        case "remove":
          if (
            confirm(
              `Remove ${member.displayName || member.email} from institution? This cannot be undone.`,
            )
          ) {
            await apiRequest(`/people/users/${member.institutionUserId}`, {
              method: "DELETE",
              accessToken,
              institutionId,
            });
            setStatus(
              `${member.displayName || member.email} has been removed from the institution.`,
            );
          }
          break;
        case "change-role":
          const newRole = prompt(
            `Enter new role for ${member.displayName || member.email} (faculty, academic_head, reviewer_approver, institution_admin):`,
          );
          if (
            newRole &&
            [
              "faculty",
              "academic_head",
              "reviewer_approver",
              "institution_admin",
            ].includes(newRole)
          ) {
            await apiRequest(`/people/users/${member.institutionUserId}/role`, {
              method: "PATCH",
              accessToken,
              institutionId,
              body: JSON.stringify({ roleCode: newRole }),
            });
            setStatus(
              `Role updated to ${newRole} for ${member.displayName || member.email}.`,
            );
          } else if (newRole) {
            setStatus("Invalid role specified.");
            return;
          }
          break;
        default:
          setStatus("Unknown action.");
      }

      const refreshed = await apiRequest<PeopleResponse>("/people/users", {
        method: "GET",
        accessToken,
        institutionId,
      });
      setPeople(refreshed);
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : `Action failed: ${action}`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-10">
      {/* Sub-Header with Action Button */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-2">
            <Building2 size={10} /> {institutionName ?? "Institutional"} Nexus
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-white">
            Operations Command
          </h1>
          <p className="text-zinc-500 font-medium max-w-xl">
            Orchestrate your institution's pedagogical landscape, manage
            authority, and synchronize brand identity.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            className="px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2"
          >
            <History size={14} /> Audit Archive
          </Button>
          <Button
            onClick={() => setActiveTab("team")}
            className="bg-white text-black px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-glow"
          >
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

      {status && (
        <StatusMessage variant="info" className="shadow-2xl">
          {status}
        </StatusMessage>
      )}

      <div className="relative">
        {activeTab === "overview" && (
          <div className="flex flex-col gap-10">
            {/* Dynamic Analytics Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                icon={TrendingUp}
                number={
                  questions.length > 0 ? questions.length.toString() : "0"
                }
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
                number={papers.length > 0 ? papers.length.toString() : "0"}
                label="Papers Generated"
                color="indigo"
              />
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col gap-4">
              <h3 className="text-xl font-black text-white uppercase tracking-tighter">
                Command Protocols
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link
                  href={`/dashboard/institution_admin/manage-faculty${institutionId ? `?institutionId=${institutionId}` : ""}`}
                  className="w-full h-full block"
                >
                  <Button
                    variant="secondary"
                    className="justify-start gap-3 h-auto py-4 rounded-[1.5rem] bg-zinc-900 border-white/5 hover:bg-white/5 hover:border-white/10 group w-full"
                  >
                    <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
                      <UserPlus size={20} className="drop-shadow-lg" />
                    </div>
                    <div className="flex flex-col items-start leading-none gap-1">
                      <span className="font-bold text-sm text-white text-left">
                        Assign Staff
                      </span>
                      <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">
                        Manage Roles
                      </span>
                    </div>
                  </Button>
                </Link>
                <Button
                  variant="secondary"
                  className="justify-start gap-3 h-auto py-4 rounded-[1.5rem] bg-zinc-900 border-white/5 hover:bg-white/5 hover:border-white/10 group"
                >
                  <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
                    <ShieldCheck size={20} className="drop-shadow-lg" />
                  </div>
                  <div className="flex flex-col items-start leading-none gap-1">
                    <span className="font-bold text-sm text-white text-left">
                      Review Queue
                    </span>
                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">
                      Pending Tasks
                    </span>
                  </div>
                </Button>
                <Button
                  variant="secondary"
                  className="justify-start gap-3 h-auto py-4 rounded-[1.5rem] bg-zinc-900 border-white/5 hover:bg-white/5 hover:border-white/10 group"
                >
                  <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 group-hover:scale-110 transition-transform">
                    <FileText size={20} className="drop-shadow-lg" />
                  </div>
                  <div className="flex flex-col items-start leading-none gap-1">
                    <span className="font-bold text-sm text-white text-left">
                      Generate Paper
                    </span>
                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">
                      Admin Override
                    </span>
                  </div>
                </Button>
                <Button
                  variant="secondary"
                  className="justify-start gap-3 h-auto py-4 rounded-[1.5rem] bg-zinc-900 border-white/5 hover:bg-white/5 hover:border-white/10 group"
                >
                  <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
                    <Activity size={20} className="drop-shadow-lg" />
                  </div>
                  <div className="flex flex-col items-start leading-none gap-1">
                    <span className="font-bold text-sm text-white text-left">
                      View Analytics
                    </span>
                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">
                      System Pulse
                    </span>
                  </div>
                </Button>
              </div>
            </div>

            <div className="grid lg:grid-cols-[1.5fr_1fr] gap-10">
              {/* Recent Activity Blueprint */}
              <Card className="!bg-zinc-900 border-white/5 !rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] -z-10" />
                <div className="flex items-center justify-between gap-4 mb-10">
                  <div>
                    <h2 className="text-3xl font-black tracking-tighter text-white uppercase">
                      Operational Activity
                    </h2>
                    <p className="text-zinc-500 text-sm font-medium mt-1">
                      Live feed of institutional events and pedagogical
                      progress.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Authorized Feed
                    </span>
                  </div>
                </div>

                <ActivityFeed
                  activities={questions
                    .slice(0, 2)
                    .map((q) => ({
                      type: "question_created" as const,
                      description: `New question: ${q.title?.slice(0, 30) || "Untitled"}...`,
                      actor: "Faculty",
                      timestamp: new Date(q.createdAt),
                    }))
                    .concat(
                      papers.slice(0, 2).map((p) => ({
                        type: "paper_generated" as const,
                        description: `Paper: ${p.title || "Untitled"}`,
                        actor: "System",
                        timestamp: new Date(p.createdAt),
                      })),
                    )}
                  maxItems={4}
                />

                <Button
                  variant="ghost"
                  fullWidth
                  className="mt-8 border-white/5 py-4 rounded-xl text-zinc-600 font-black text-[10px] uppercase tracking-[0.3em] hover:text-white transition-all"
                >
                  Load Extended Audit Records
                </Button>
              </Card>

              {/* Recent Papers Sidebar */}
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-1 px-2">
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter">
                    Recent Papers
                  </h3>
                  <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                    Latest generation iterations
                  </p>
                </div>

                <Card className="!bg-zinc-900 border-white/5 !rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden flex flex-col gap-4">
                  {papers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-zinc-500">
                      <FileText size={32} className="mb-2 opacity-50" />
                      <span className="text-sm font-medium">
                        No papers generated yet
                      </span>
                    </div>
                  ) : (
                    papers.slice(0, 4).map((paper, i) => {
                      const statusLabel =
                        paper.status === "approved"
                          ? "Approved"
                          : paper.status === "rejected"
                            ? "Rejected"
                            : paper.status === "published"
                              ? "Published"
                              : paper.status === "submitted"
                                ? "Pending Review"
                                : "Draft";
                      const createdDate = new Date(paper.createdAt);
                      const now = new Date();
                      const diffDays = Math.floor(
                        (now.getTime() - createdDate.getTime()) /
                          (1000 * 60 * 60 * 24),
                      );
                      const dateLabel =
                        diffDays === 0
                          ? "Today"
                          : diffDays === 1
                            ? "Yesterday"
                            : diffDays < 7
                              ? `${diffDays} days ago`
                              : createdDate.toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                });

                      return (
                        <div
                          key={paper.id || i}
                          className="flex justify-between items-center p-4 rounded-2xl bg-black/20 hover:bg-black/40 transition-colors cursor-pointer group border border-white/5 hover:border-white/10"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-zinc-400 group-hover:text-white group-hover:scale-110 transition-all">
                              <FileText size={18} />
                            </div>
                            <div className="flex flex-col leading-none gap-2">
                              <span className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                                {paper.title || "Untitled Paper"}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-zinc-500 font-bold uppercase">
                                  {dateLabel}
                                </span>
                                <span
                                  className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest ${paper.status === "approved" || paper.status === "published" ? "bg-emerald-500/10 text-emerald-400" : paper.status === "rejected" ? "bg-red-500/10 text-red-400" : paper.status === "submitted" ? "bg-amber-500/10 text-amber-400" : "bg-blue-500/10 text-blue-400"}`}
                                >
                                  {statusLabel}
                                </span>
                              </div>
                            </div>
                          </div>
                          <ChevronRight
                            size={18}
                            className="text-zinc-600 group-hover:text-white transition-colors"
                          />
                        </div>
                      );
                    })
                  )}
                  <Button
                    variant="ghost"
                    fullWidth
                    className="mt-2 border-white/5 py-4 rounded-xl text-zinc-600 font-black text-[10px] uppercase tracking-[0.3em] hover:text-white transition-all"
                  >
                    View All Generated Papers
                  </Button>
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
          <AcademicStructureWorkspace
            accessToken={accessToken}
            institutionId={institutionId}
          />
        )}
      </div>
    </div>
  );
}
