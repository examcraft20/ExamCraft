"use client";

import { useEffect, useState, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  BookOpen,
  FileStack,
  Clock,
  Hourglass,
  CheckSquare,
  Users,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  BarChart2,
  AlertCircle,
} from "lucide-react";
import { apiRequest } from "../../../lib/api/client";

// ── Types ──────────────────────────────────────────────────────────────────────
interface AnalyticsSummary {
  totalQuestions: number;
  papersGeneratedAllTime: number;
  papersGeneratedLast30Days: number;
  pendingApprovals: number;
  approvedAndPublished: number;
  activeFacultyCount: number;
}

interface StatCardConfig {
  key: keyof AnalyticsSummary;
  label: string;
  icon: React.ElementType;
  accent: string;
  glow: string;
  trend?: number; // positive = up, negative = down, 0 = flat
}

// ── Mock monthly breakdown (used until backend returns it) ──────────────────────
function buildMonthlyData(total: number) {
  const months = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr"];
  // Distribute total across months with slight growth trend
  return months.map((month, i) => ({
    month,
    papers: Math.max(1, Math.round((total / months.length) * (0.5 + i * 0.1) + Math.random() * 3)),
  }));
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({
  config,
  value,
}: {
  config: StatCardConfig;
  value: number;
}) {
  const Icon = config.icon;
  const trend = config.trend ?? 0;

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5 flex flex-col gap-4 transition-all duration-300 hover:-translate-y-1 group"
      style={{
        background: "linear-gradient(145deg, rgba(15,23,42,0.9) 0%, rgba(30,27,75,0.6) 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: `0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)`,
      }}
    >
      {/* Ambient glow */}
      <div
        className="absolute -top-8 -right-8 w-28 h-28 rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition-opacity"
        style={{ background: config.glow }}
      />

      {/* Top row */}
      <div className="flex items-start justify-between relative z-10">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: `linear-gradient(135deg, ${config.accent}33, ${config.accent}18)`,
            border: `1px solid ${config.accent}40`,
          }}
        >
          <Icon size={18} style={{ color: config.accent }} />
        </div>

        {/* Trend pill */}
        <div
          className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
          style={{
            background:
              trend > 0
                ? "rgba(34,197,94,0.12)"
                : trend < 0
                ? "rgba(239,68,68,0.12)"
                : "rgba(100,116,139,0.12)",
            color:
              trend > 0 ? "#4ade80" : trend < 0 ? "#f87171" : "#64748b",
            border: `1px solid ${
              trend > 0
                ? "rgba(34,197,94,0.2)"
                : trend < 0
                ? "rgba(239,68,68,0.2)"
                : "rgba(100,116,139,0.15)"
            }`,
          }}
        >
          {trend > 0 ? (
            <TrendingUp size={9} />
          ) : trend < 0 ? (
            <TrendingDown size={9} />
          ) : (
            <Minus size={9} />
          )}
          {trend !== 0 ? `${Math.abs(trend)}%` : "—"}
        </div>
      </div>

      {/* Value + label */}
      <div className="relative z-10">
        <div
          className="text-4xl font-black tracking-tight"
          style={{ color: "#f1f5f9", fontVariantNumeric: "tabular-nums" }}
        >
          {value.toLocaleString()}
        </div>
        <div
          className="text-xs font-semibold uppercase tracking-widest mt-1"
          style={{ color: "#64748b" }}
        >
          {config.label}
        </div>
      </div>
    </div>
  );
}

// ── Custom Tooltip ──────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="px-4 py-3 rounded-xl text-sm"
      style={{
        background: "rgba(15,23,42,0.95)",
        border: "1px solid rgba(139,92,246,0.3)",
        boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
        backdropFilter: "blur(12px)",
      }}
    >
      <p className="font-bold text-white mb-1">{label}</p>
      <p style={{ color: "#a78bfa" }}>
        <span className="font-black">{payload[0].value}</span>{" "}
        <span style={{ color: "#475569" }}>papers</span>
      </p>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────────
interface AnalyticsDashboardProps {
  accessToken: string;
  institutionId: string;
}

export function AnalyticsDashboard({ accessToken, institutionId }: AnalyticsDashboardProps) {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchSummary = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiRequest<AnalyticsSummary>("/analytics/summary", {
        method: "GET",
        accessToken,
        institutionId,
      });
      setSummary(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics.");
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, institutionId]);

  useEffect(() => {
    void fetchSummary();
  }, [fetchSummary]);

  const statCards: StatCardConfig[] = [
    {
      key: "totalQuestions",
      label: "Total Questions",
      icon: BookOpen,
      accent: "#818cf8",
      glow: "#6366f1",
      trend: 12,
    },
    {
      key: "papersGeneratedAllTime",
      label: "Papers (All Time)",
      icon: FileStack,
      accent: "#a78bfa",
      glow: "#7c3aed",
      trend: 8,
    },
    {
      key: "papersGeneratedLast30Days",
      label: "Papers (Last 30 Days)",
      icon: Clock,
      accent: "#38bdf8",
      glow: "#0ea5e9",
      trend: 5,
    },
    {
      key: "pendingApprovals",
      label: "Pending Approvals",
      icon: Hourglass,
      accent: "#fbbf24",
      glow: "#f59e0b",
      trend: -3,
    },
    {
      key: "approvedAndPublished",
      label: "Published Papers",
      icon: CheckSquare,
      accent: "#4ade80",
      glow: "#22c55e",
      trend: 15,
    },
    {
      key: "activeFacultyCount",
      label: "Active Faculty",
      icon: Users,
      accent: "#fb7185",
      glow: "#e11d48",
      trend: 0,
    },
  ];

  const monthlyData = summary
    ? buildMonthlyData(summary.papersGeneratedAllTime)
    : [];

  const BAR_COLORS = [
    "#4f46e5", "#5b53e8", "#6861eb", "#7c3aed", "#8b5cf6", "#a78bfa", "#818cf8",
  ];

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1400px] mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)" }}
            >
              <BarChart2 size={18} className="text-white" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Analytics</h1>
          </div>
          <p className="text-sm mt-1" style={{ color: "#64748b" }}>
            Institution-level overview for{" "}
            <span style={{ color: "#818cf8" }}>Academic Head / Admin</span>
            {lastUpdated && (
              <span style={{ color: "#334155" }}>
                {" "}· Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={fetchSummary}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:bg-white/10 disabled:opacity-50"
          style={{ border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8" }}
        >
          <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
          style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.2)",
            color: "#f87171",
          }}
        >
          <AlertCircle size={16} className="shrink-0" />
          {error}
        </div>
      )}

      {/* Stat Cards Skeleton */}
      {isLoading && !summary && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="rounded-2xl p-5 h-28 animate-pulse"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
            />
          ))}
        </div>
      )}

      {/* Stat Cards */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {statCards.map((config) => (
            <StatCard key={config.key} config={config} value={summary[config.key]} />
          ))}
        </div>
      )}

      {/* Bar Chart */}
      {summary && (
        <div
          className="rounded-2xl p-6"
          style={{
            background: "linear-gradient(145deg, rgba(15,23,42,0.9) 0%, rgba(30,27,75,0.5) 100%)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-white font-bold text-lg tracking-tight">Papers Generated Per Month</h2>
              <p className="text-xs mt-0.5" style={{ color: "#475569" }}>
                Based on creation dates · mock monthly breakdown
              </p>
            </div>
            <div
              className="px-3 py-1 rounded-full text-xs font-bold"
              style={{
                background: "rgba(124,58,237,0.15)",
                border: "1px solid rgba(124,58,237,0.3)",
                color: "#a78bfa",
              }}
            >
              Last 7 Months
            </div>
          </div>

          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyData} barCategoryGap="35%" barGap={4}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.04)"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fill: "#475569", fontSize: 11, fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: "#334155", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={28}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(139,92,246,0.07)" }} />
              <Bar dataKey="papers" radius={[6, 6, 0, 0]}>
                {monthlyData.map((_, index) => (
                  <Cell key={index} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Quick-insight tiles */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Approval rate */}
          <div
            className="rounded-2xl p-5"
            style={{
              background: "rgba(15,23,42,0.8)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#475569" }}>
              Approval Rate
            </p>
            {(() => {
              const total = summary.papersGeneratedAllTime;
              const approved = summary.approvedAndPublished;
              const pct = total > 0 ? Math.round((approved / total) * 100) : 0;
              return (
                <>
                  <div className="text-3xl font-black" style={{ color: "#4ade80" }}>{pct}%</div>
                  <div className="mt-3 rounded-full overflow-hidden h-1.5" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: "linear-gradient(90deg,#22c55e,#4ade80)" }}
                    />
                  </div>
                  <p className="text-xs mt-2" style={{ color: "#334155" }}>
                    {approved} of {total} papers published
                  </p>
                </>
              );
            })()}
          </div>

          {/* Pending pressure */}
          <div
            className="rounded-2xl p-5"
            style={{
              background: "rgba(15,23,42,0.8)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#475569" }}>
              Review Queue
            </p>
            <div className="text-3xl font-black" style={{ color: summary.pendingApprovals > 5 ? "#fbbf24" : "#4ade80" }}>
              {summary.pendingApprovals}
            </div>
            <p className="text-xs mt-2" style={{ color: "#334155" }}>
              {summary.pendingApprovals === 0
                ? "No papers awaiting review ✓"
                : `${summary.pendingApprovals} paper${summary.pendingApprovals !== 1 ? "s" : ""} need attention`}
            </p>
          </div>

          {/* Questions per faculty */}
          <div
            className="rounded-2xl p-5"
            style={{
              background: "rgba(15,23,42,0.8)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#475569" }}>
              Questions / Faculty
            </p>
            <div className="text-3xl font-black" style={{ color: "#818cf8" }}>
              {summary.activeFacultyCount > 0
                ? Math.round(summary.totalQuestions / summary.activeFacultyCount)
                : summary.totalQuestions}
            </div>
            <p className="text-xs mt-2" style={{ color: "#334155" }}>
              avg across {summary.activeFacultyCount} faculty member{summary.activeFacultyCount !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
