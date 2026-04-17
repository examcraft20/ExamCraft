"use client";

import { Clock } from "lucide-react";
import { Table } from '@/components/ui/data-table';

interface FacultyActivity {
  name: string;
  questionsAdded: number;
  drafts: number;
  submitted: number;
  lastActive: string | null;
}

interface FacultyActivityTableProps {
  data: FacultyActivity[];
}

export function FacultyActivityTable({ data }: FacultyActivityTableProps) {
  const formatLastActive = (dateStr: string | null) => {
    if (!dateStr) return "Never";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US");
  };

  return (
    <Table<FacultyActivity>
      columns={[
        {
          key: "name",
          label: "Faculty Name",
          render: (value) => (
            <span className="font-bold text-white">{value}</span>
          ),
        },
        {
          key: "questionsAdded",
          label: "Questions Added",
          render: (value) => (
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-indigo-400">
                {value}
              </span>
            </div>
          ),
        },
        {
          key: "drafts",
          label: "Drafts",
          render: (value) => (
            <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg bg-amber-500/10 text-amber-400 font-bold text-sm">
              {value}
            </span>
          ),
        },
        {
          key: "submitted",
          label: "Submitted",
          render: (value) => (
            <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold text-sm">
              {value}
            </span>
          ),
        },
        {
          key: "lastActive",
          label: "Last Active",
          render: (value) => (
            <div className="flex items-center gap-2 text-zinc-400 text-sm">
              <Clock size={14} />
              <span className="font-medium">{formatLastActive(value)}</span>
            </div>
          ),
        },
      ]}
      data={data}
    />
  );
}
