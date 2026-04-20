"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { 
  Users, 
  Search, 
  UserPlus, 
  Mail, 
  UserCog, 
  UserX, 
  Trash2,
  RefreshCw,
  ArrowRight
} from "lucide-react";
import { useAdminContext } from "@/hooks/use-admin-context";
import { apiRequest } from "#api";
import { Button, Card, Spinner, StatusMessage, RoleBadge, StatusBadge, Modal } from "@examcraft/ui";

type UsersResponse = {
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

type Subject = {
  id: string;
  name: string;
  code: string;
};

export default function ManageFacultyPage() {
  const { accessToken, institutionId, isReady } = useAdminContext();
  const [people, setPeople] = useState<UsersResponse | null>(null);
  const [email, setEmail] = useState("");
  const [roleCode, setRoleCode] = useState("faculty");
  const [status, setStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [subjectSearch, setSubjectSearch] = useState("");
  
  // Manage Modal State
  const [managingUser, setManagingUser] = useState<UsersResponse['users'][0] | null>(null);
  const [editRoleCode, setEditRoleCode] = useState<string>("");
  const [editStatus, setEditStatus] = useState<string>("");
  const [editSubjectIds, setEditSubjectIds] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  const load = async (token: string, instId: string) => {
    setIsLoading(true);
    try {
      const response = await apiRequest<UsersResponse>("/users/users", { 
        method: "GET", 
        accessToken: token, 
        institutionId: instId 
      });
      setPeople(response);

      const subjects = await apiRequest<Subject[]>("/academic/subjects", {
        method: "GET",
        accessToken: token,
        institutionId: instId
      });
      setAllSubjects(subjects);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to load staff members.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isReady) {
      if (accessToken && institutionId) {
        load(accessToken, institutionId);
      } else {
        setIsLoading(false);
        if (!institutionId) {
          setStatus("No institution context found. Please return to the dashboard.");
        }
      }
    }
  }, [accessToken, institutionId, isReady]);

  async function handleInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken || !institutionId) return;
    
    setIsSubmitting(true);
    setStatus(null);
    try {
      const response = await apiRequest<{ rawToken: string; invitation: { email: string } }>(
        "/users/invitations", { 
          method: "POST", 
          accessToken, 
          institutionId, 
          body: JSON.stringify({ institutionId, email, roleCode }) 
        }
      );
      await load(accessToken, institutionId);
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
    return (people?.users ?? []).filter((u) => 
      [u.displayName ?? "", u.status, u.roleCodes.join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(needle)
    );
  }, [people?.users, userSearch]);

  const openManageModal = async (user: UsersResponse['users'][0]) => {
    setManagingUser(user);
    setEditRoleCode(user.roleCodes[0] || "faculty");
    setEditStatus(user.status);
    setSubjectSearch("");
    
    // Fetch user-specific subjects
    if (accessToken && institutionId) {
      try {
        const assignedIds = await apiRequest<string[]>(`/users/users/${user.institutionUserId}/subjects`, {
          method: "GET",
          accessToken,
          institutionId
        });
        setEditSubjectIds(assignedIds);
      } catch (e) {
        console.error("Failed to load user subjects", e);
        setEditSubjectIds([]);
      }
    }
  };

  const handleUpdateUser = async () => {
    if (!accessToken || !institutionId || !managingUser) return;
    setIsUpdating(true);
    setStatus(null);
    try {
      // If role changed
      if (editRoleCode !== managingUser.roleCodes[0]) {
        await apiRequest(`/users/users/${managingUser.institutionUserId}/role`, {
          method: "PATCH",
          accessToken,
          institutionId,
          body: JSON.stringify({ roleCode: editRoleCode })
        });
      }
      
      // If status changed
      if (editStatus !== managingUser.status) {
        await apiRequest(`/users/users/${managingUser.institutionUserId}`, {
          method: "PATCH",
          accessToken,
          institutionId,
          body: JSON.stringify({ status: editStatus })
        });
      }

      // Sync subjects
      await apiRequest(`/users/users/${managingUser.institutionUserId}/subjects`, {
        method: "PATCH",
        accessToken,
        institutionId,
        body: JSON.stringify({ subjectIds: editSubjectIds })
      });

      await load(accessToken, institutionId);
      setManagingUser(null);
      setStatus(`Successfully updated access for ${managingUser.displayName || 'user'}.`);
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Failed to update user.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (!accessToken || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" className="w-12 h-12" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Users size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">Manage Faculty</h1>
            <p className="text-[#8b9bb4] text-sm font-medium">Assign subjects, semesters and roles to staff members</p>
          </div>
        </div>
        <button onClick={() => accessToken && institutionId && load(accessToken, institutionId)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1e293b] border border-white/10 text-sm font-bold text-[#8b9bb4] hover:text-white transition-all">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {status && <StatusMessage variant="info" className="shadow-xl">{status}</StatusMessage>}

      {/* Provision Staff Card */}
      <Card className="!bg-[#1e293b] border-white/5 !rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] -z-10" />
        <h3 className="text-xl font-black text-white uppercase tracking-tight mb-6 flex items-center gap-3">
          <UserPlus size={20} className="text-indigo-400" /> Provision New Staff
        </h3>
        <form onSubmit={handleInvite} className="flex flex-col md:flex-row items-end gap-4">
          <div className="flex-1 flex flex-col gap-2 w-full">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Email Address</label>
            <input 
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="faculty@institution.edu"
              className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3.5 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 placeholder:text-zinc-700"
            />
          </div>
          <div className="w-full md:w-64 flex flex-col gap-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Authority Level</label>
            <select 
              value={roleCode}
              onChange={(e) => setRoleCode(e.target.value)}
              className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3.5 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {roleOptions.map(opt => <option key={opt.value} value={opt.value} className="bg-[#1e293b]">{opt.label}</option>)}
            </select>
          </div>
          <Button 
            type="submit" 
            loading={isSubmitting}
            className="bg-white text-black px-8 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-glow"
          >
            Send Invitation
          </Button>
        </form>
      </Card>

      {/* Stats and Table */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#1e293b] rounded-2xl p-6 border border-white/5">
          <p className="text-[10px] font-black text-[#8b9bb4] uppercase tracking-widest mb-1">Total Staff</p>
          <p className="text-3xl font-black text-white">{people?.users.length ?? 0}</p>
        </div>
        <div className="bg-[#1e293b] rounded-2xl p-6 border border-white/5">
          <p className="text-[10px] font-black text-[#8b9bb4] uppercase tracking-widest mb-1">Admins</p>
          <p className="text-3xl font-black text-indigo-400">{people?.users.filter(u => u.roleCodes.includes('institution_admin')).length ?? 0}</p>
        </div>
        <div className="bg-[#1e293b] rounded-2xl p-6 border border-white/5">
          <p className="text-[10px] font-black text-[#8b9bb4] uppercase tracking-widest mb-1">Academic Heads</p>
          <p className="text-3xl font-black text-amber-400">{people?.users.filter(u => u.roleCodes.includes('academic_head')).length ?? 0}</p>
        </div>
        <div className="bg-[#1e293b] rounded-2xl p-6 border border-white/5">
          <p className="text-[10px] font-black text-[#8b9bb4] uppercase tracking-widest mb-1">Reviewers</p>
          <p className="text-3xl font-black text-emerald-400">{people?.users.filter(u => u.roleCodes.includes('reviewer_approver')).length ?? 0}</p>
        </div>
      </div>

      <div className="bg-[#1e293b] rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-sm font-black text-white uppercase tracking-widest">Active Institution Members</h3>
          <div className="relative w-full md:w-80">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input 
              type="text"
              placeholder="Search faculty..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="w-full bg-black/20 border border-white/5 rounded-xl py-2.5 pl-12 pr-4 text-xs font-bold text-white focus:outline-none"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-black/20 text-[10px] font-black uppercase tracking-widest text-zinc-500">
              <tr>
                <th className="px-8 py-5">Faculty Member</th>
                <th className="px-8 py-5">Role</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5">Joined At</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map((user) => (
                <tr key={user.institutionUserId} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-black text-sm">
                        {(user.displayName || "U").charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col leading-tight">
                        <span className="font-bold text-white">{user.displayName || "Unregistered"}</span>
                        <span className="text-[10px] text-zinc-500 font-medium">ID: {user.userId.slice(0, 8)}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-wrap gap-1">
                      {user.roleCodes.map((rc) => (
                        <RoleBadge key={rc} role={rc} />
                      ))}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <StatusBadge status={user.status} />
                  </td>
                  <td className="px-8 py-5 text-xs text-zinc-500 font-medium">
                    {user.joinedAt ? new Date(user.joinedAt).toLocaleDateString() : 'Pending'}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button 
                      onClick={() => openManageModal(user)}
                      className="p-2 rounded-lg bg-white/5 text-zinc-500 hover:text-white transition-colors">
                      <UserCog size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-zinc-600 font-bold italic">No faculty members found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manage User Modal */}
      {managingUser && (
        <Modal 
          isOpen={!!managingUser} 
          onClose={() => !isUpdating && setManagingUser(null)}
          title={`Manage: ${managingUser.displayName || "User"}`}
        >
          <div className="flex flex-col gap-6 w-full max-w-md">
            <p className="text-sm text-zinc-400 mt-1">
              Update roles and access permissions for this faculty member.
            </p>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Authority Role</label>
              <div className="grid grid-cols-2 gap-2">
                {roleOptions.map((role) => (
                  <button
                    key={role.value}
                    onClick={() => setEditRoleCode(role.value)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      editRoleCode === role.value 
                        ? "bg-indigo-600 border-indigo-500 text-white shadow-lg" 
                        : "bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {role.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium">
              ✓ Institution Admin and Academic Head get full access. All users have access to all institution subjects by default.
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white">Account Active</span>
                <span className="text-xs text-zinc-500">Disabled users cannot log in.</span>
              </div>
              <button
                onClick={() => setEditStatus(editStatus === "active" ? "disabled" : "active")}
                className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                  editStatus === "active" ? "bg-indigo-600" : "bg-[#2D3748]"
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
                    editStatus === "active" ? "translate-x-7" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Authorized Subjects</label>
                <span className="text-[10px] font-bold text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded-full">
                  {editSubjectIds.length} Assigned
                </span>
              </div>
              
              <div className="relative">
                <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input 
                  type="text"
                  placeholder="Filter subjects..."
                  value={subjectSearch}
                  onChange={(e) => setSubjectSearch(e.target.value)}
                  className="w-full bg-black/20 border border-white/5 rounded-xl py-2 pl-9 pr-4 text-[11px] font-bold text-white focus:outline-none"
                />
              </div>

              <div className="max-h-40 overflow-y-auto pr-2 flex flex-col gap-1 custom-scrollbar">
                {allSubjects
                  .filter(s => s.name.toLowerCase().includes(subjectSearch.toLowerCase()) || s.code.toLowerCase().includes(subjectSearch.toLowerCase()))
                  .map((sub) => {
                    const isSelected = editSubjectIds.includes(sub.id);
                    return (
                      <button
                        key={sub.id}
                        onClick={() => {
                          setEditSubjectIds(prev => 
                            isSelected ? prev.filter(id => id !== sub.id) : [...prev, sub.id]
                          );
                        }}
                        className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                          isSelected 
                            ? "bg-indigo-500/10 border-indigo-500/30 text-white" 
                            : "bg-white/5 border-transparent text-zinc-500 hover:bg-white/10"
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="text-[11px] font-bold leading-none">{sub.name}</span>
                          <span className="text-[9px] font-medium opacity-50 uppercase tracking-tighter mt-1">{sub.code}</span>
                        </div>
                        <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                          isSelected ? "bg-indigo-500 border-indigo-400" : "border-white/10"
                        }`}>
                          {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-sm" />}
                        </div>
                      </button>
                    );
                  })}
                {allSubjects.length === 0 && (
                  <p className="text-[10px] text-zinc-600 italic py-4 text-center">No subjects created yet.</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <Button 
                variant="secondary" 
                onClick={() => setManagingUser(null)}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button 
                className="bg-indigo-600 hover:bg-indigo-500 text-white"
                onClick={handleUpdateUser}
                loading={isUpdating}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
