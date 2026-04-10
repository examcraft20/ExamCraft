"use client";

import { Mail, Trash2, PlusCircle } from "lucide-react";

interface TeamInvite {
  email: string;
  role: string;
}

interface InviteTeamProps {
  data: {
    invites: TeamInvite[];
  };
  onChange: (field: string, value: TeamInvite[]) => void;
}

const roleOptions = [
  { value: "faculty", label: "Faculty" },
  { value: "academic_head", label: "Academic Head" },
  { value: "reviewer", label: "Reviewer" }
];

export function InviteTeam({ data, onChange }: InviteTeamProps) {
  const handleAddInvite = () => {
    if (data.invites.length < 5) {
      onChange("invites", [...data.invites, { email: "", role: "faculty" }]);
    }
  };

  const handleRemoveInvite = (index: number) => {
    onChange("invites", data.invites.filter((_, i) => i !== index));
  };

  const handleInviteChange = (index: number, field: "email" | "role", value: string) => {
    const updated = [...data.invites];
    updated[index] = { ...updated[index], [field]: value };
    onChange("invites", updated);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "faculty":
        return "bg-indigo-500/10 border-indigo-500/30 text-indigo-300";
      case "academic_head":
        return "bg-emerald-500/10 border-emerald-500/30 text-emerald-300";
      case "reviewer":
        return "bg-violet-500/10 border-violet-500/30 text-violet-300";
      default:
        return "bg-slate-500/10 border-slate-500/30 text-slate-300";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Invite your core team</h2>
        <p className="text-sm text-slate-400">You can always add more people later from your dashboard</p>
      </div>

      <div className="space-y-3">
        {data.invites.map((invite, index) => (
          <div key={index} className="flex gap-3">
            {/* Email */}
            <div className="flex-1 relative">
              <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-500 pointer-events-none" />
              <input
                type="email"
                value={invite.email}
                onChange={(e) => handleInviteChange(index, "email", e.target.value)}
                placeholder="colleague@example.com"
                className="w-full bg-slate-800/60 border border-white/20 rounded-xl px-4 py-3 pl-12 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all"
              />
            </div>

            {/* Role */}
            <select
              value={invite.role}
              onChange={(e) => handleInviteChange(index, "role", e.target.value)}
              className="bg-slate-800/60 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all appearance-none min-w-[140px]"
            >
              {roleOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Remove */}
            <button
              type="button"
              onClick={() => handleRemoveInvite(index)}
              className="p-3 hover:bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 hover:text-red-300 transition-all"
            >
              <Trash2 size={20} />
            </button>
          </div>
        ))}
      </div>

      {/* Role Legend */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
        {roleOptions.map((role) => (
          <div
            key={role.value}
            className={`px-3 py-2 rounded-lg border text-xs font-medium text-center ${getRoleColor(role.value)}`}
          >
            {role.label}
          </div>
        ))}
      </div>

      {/* Add Another Button */}
      {data.invites.length < 5 && (
        <button
          type="button"
          onClick={handleAddInvite}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-dashed border-indigo-500/30 rounded-xl text-indigo-400 hover:bg-indigo-500/5 transition-all text-sm font-medium"
        >
          <PlusCircle size={18} />
          Add another team member
        </button>
      )}

      {data.invites.length === 5 && (
        <p className="text-xs text-slate-500 text-center">Maximum 5 invites per session. Add more later from dashboard.</p>
      )}

      {data.invites.length === 0 && (
        <div className="p-4 rounded-xl bg-slate-700/20 border border-slate-600/30 text-center">
          <p className="text-sm text-slate-400">No team members added yet. You can skip this for now.</p>
        </div>
      )}
    </div>
  );
}
