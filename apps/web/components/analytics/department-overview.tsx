"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Users,
  FileCheck,
  BarChart3,
  ChevronDown,
} from "lucide-react";
import { Button, Card, Spinner, StatusMessage } from "@examcraft/ui";
import { apiRequest } from "#api";
import { StatCard } from '@/components/ui/stat-card';
import { Table } from '@/components/ui/data-table';
import { CoverageCard } from "./coverage-chart";
import { FacultyActivityTable } from "./faculty-table";
import type {
  InstitutionDashboardSummaryResponse,
  PaperRecord,
} from "@/lib/dashboard";

type DepartmentOverviewContentProps = {
  accessToken: string;
  institutionId: string;
};

type DepartmentStats = {
  totalQuestions: number;
  facultyCount: number;
  pendingApprovals: number;
  publishedPapers: number;
};

type SubjectCoverage = {
  subject: string;
  current: number;
  target: number;
  difficulty: {
    easy: number;
    medium: number;
    hard: number;
  };
};

type FacultyActivity = {
  name: string;
  questionsAdded: number;
  drafts: number;
  submitted: number;
  lastActive: string | null;
};

export function DepartmentOverviewContent({
  accessToken,
  institutionId,
}: DepartmentOverviewContentProps) {
  const [summary, setSummary] =
    useState<InstitutionDashboardSummaryResponse | null>(null);
  const [papers, setPapers] = useState<PaperRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState("current");

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const [summaryResponse, papersResponse] = await Promise.all([
          apiRequest<InstitutionDashboardSummaryResponse>(
            "/analytics/summary",
            {
              method: "GET",
              accessToken,
              institutionId,
            },
          ),
          apiRequest<PaperRecord[]>("/papers", {
            method: "GET",
            accessToken,
            institutionId,
          }),
        ]);

        if (isMounted) {
          setSummary(summaryResponse);
          setPapers(papersResponse);
        }
      } catch (error) {
        if (isMounted) {
          setStatus(
            error instanceof Error
              ? error.message
              : "Failed to load department data",
          );
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void loadData();
    return () => {
      isMounted = false;
    };
  }, [accessToken, institutionId]);

  // Aggregate stats
  const stats = useMemo<DepartmentStats>(
    () => ({
      totalQuestions: summary?.totals.questions ?? 0,
      facultyCount: summary?.totals.users ?? 0,
      pendingApprovals: papers.filter((p) =>
        ["submitted", "in_review"].includes(p.status),
      ).length,
      publishedPapers: papers.filter((p) => p.status === "published").length,
    }),
    [summary, papers],
  );

  // Calculate subject coverage
  const subjectCoverage = useMemo<SubjectCoverage[]>(() => {
    const coverage: Record<string, SubjectCoverage> = {};

    papers.forEach((paper) => {
      const subject = paper.subject || "Unspecified";
      if (!coverage[subject]) {
        coverage[subject] = {
          subject,
          current: 0,
          target: 100,
          difficulty: { easy: 0, medium: 0, hard: 0 },
        };
      }

      // Count questions and difficulty
      paper.sections?.forEach((section) => {
        section.questions?.forEach((q) => {
          coverage[subject].current++;
          if (q.difficulty === "easy") coverage[subject].difficulty.easy++;
          else if (q.difficulty === "medium")
            coverage[subject].difficulty.medium++;
          else if (q.difficulty === "hard") coverage[subject].difficulty.hard++;
        });
      });
    });

    return Object.values(coverage).sort((a, b) => b.current - a.current);
  }, [papers]);

  // Prepare faculty activity data
  const facultyActivity = useMemo<FacultyActivity[]>(() => {
    const faculty: Record<string, FacultyActivity> = {};

    summary?.recentQuestions?.forEach((q) => {
      // Would need createdBy info from API - placeholder for now
      const name = "Faculty Member";
      if (!faculty[name]) {
        faculty[name] = {
          name,
          questionsAdded: 0,
          drafts: 0,
          submitted: 0,
          lastActive: null,
        };
      }
      faculty[name].questionsAdded++;
      if (q.status === "draft") faculty[name].drafts++;
      else if (q.status === "submitted") faculty[name].submitted++;
      faculty[name].lastActive = new Date().toISOString();
    });

    return Object.values(faculty);
  }, [summary]);

  // Pending approvals table data
  const pendingApprovals = useMemo(() => {
    return papers
      .filter((p) => ["submitted", "in_review"].includes(p.status))
      .map((p) => ({
        id: p.id,
        title: p.title,
        faculty: "Faculty Name", // From API normally
        subject: p.subject,
        submitted: new Date(p.createdAt).toLocaleDateString("en-US"),
        status: p.status,
      }));
  }, [papers]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-6">
        <Spinner size="lg" className="w-14 h-14" />
        <span className="text-zinc-500 font-black uppercase tracking-[0.4em] text-[10px]">
          Loading Department Overview
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-2">
            <Building2 size={10} /> Department Overview
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-white">
            Department Overview
          </h1>
          <p className="text-zinc-500 font-medium max-w-xl">
            Monitor question coverage and faculty activity
          </p>
        </div>
        <div className="relative group">
          <Button className="px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 bg-white/5 border border-white/10 text-white hover:bg-white/10">
            <BarChart3 size={14} />
            {selectedPeriod === "current" ? "Current Semester" : "All Time"}
            <ChevronDown size={14} />
          </Button>
        </div>
      </div>

      {status && (
        <StatusMessage variant="info" className="shadow-2xl">
          {status}
        </StatusMessage>
      )}

      {/* Stats Row */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={BarChart3}
          number={stats.totalQuestions}
          label="Total Questions"
          color="indigo"
        />
        <StatCard
          icon={Users}
          number={stats.facultyCount}
          label="Faculty Members"
          color="indigo"
        />
        <StatCard
          icon={FileCheck}
          number={stats.pendingApprovals}
          label="Pending Approval"
          color="indigo"
        />
        <StatCard
          icon={Building2}
          number={stats.publishedPapers}
          label="Published Papers"
          color="indigo"
        />
      </div>

      {/* Subject Coverage Section */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black tracking-tight text-white">
            Subject Coverage
          </h2>
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
            {subjectCoverage.length} Subjects
          </span>
        </div>

        {subjectCoverage.length === 0 ? (
          <Card className="!bg-white/5 border-white/5 border-dashed !rounded-2xl p-12 text-center">
            <p className="text-zinc-500 font-bold">No subject data available</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjectCoverage.map((coverage) => (
              <CoverageCard
                key={coverage.subject}
                subject={coverage.subject}
                current={coverage.current}
                target={coverage.target}
                difficulty={coverage.difficulty}
              />
            ))}
          </div>
        )}
      </div>

      {/* Faculty Activity Table */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black tracking-tight text-white">
            Faculty Activity
          </h2>
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
            {facultyActivity.length} Members
          </span>
        </div>

        {facultyActivity.length === 0 ? (
          <Card className="!bg-white/5 border-white/5 border-dashed !rounded-2xl p-12 text-center">
            <p className="text-zinc-500 font-bold">No faculty activity</p>
          </Card>
        ) : (
          <FacultyActivityTable data={facultyActivity} />
        )}
      </div>

      {/* Pending Approvals */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black tracking-tight text-white">
            Pending Approvals
          </h2>
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
            {pendingApprovals.length} Papers
          </span>
        </div>

        {pendingApprovals.length === 0 ? (
          <Card className="!bg-white/5 border-white/5 border-dashed !rounded-2xl p-12 text-center">
            <p className="text-zinc-500 font-bold">
              No papers pending approval
            </p>
          </Card>
        ) : (
          <Table<(typeof pendingApprovals)[0]>
            columns={[
              {
                key: "title",
                label: "Paper Title",
                render: (value) => (
                  <span className="font-bold text-white line-clamp-1">
                    {value}
                  </span>
                ),
              },
              {
                key: "faculty",
                label: "Faculty",
                render: (value) => (
                  <span className="text-zinc-400">{value}</span>
                ),
              },
              {
                key: "subject",
                label: "Subject",
                render: (value) => (
                  <span className="text-zinc-400">{value}</span>
                ),
              },
              {
                key: "submitted",
                label: "Submitted",
                render: (value) => (
                  <span className="text-xs text-zinc-500">{value}</span>
                ),
              },
              {
                key: "status",
                label: "Status",
                render: (value) => (
                  <span
                    className={`text-xs font-bold uppercase tracking-wide px-2 py-1 rounded ${
                      value === "submitted"
                        ? "bg-amber-500/10 text-amber-400"
                        : "bg-indigo-500/10 text-indigo-400"
                    }`}
                  >
                    {value}
                  </span>
                ),
              },
            ]}
            data={pendingApprovals}
          />
        )}
      </div>
    </div>
  );
}
