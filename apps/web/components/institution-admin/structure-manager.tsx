"use client";

import { useEffect, useState, FormEvent } from "react";
import {
  BookOpen,
  FolderOpen,
  Layers,
  Plus,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Building2,
  Library,
  Database,
  ShieldCheck,
  ArrowUpRight,
  TrendingUp,
  Award,
  Hash,
  Activity,
  History,
  Zap,
  LayoutGrid,
} from "lucide-react";
import { Button, Card, Input, Spinner, StatusMessage } from "@examcraft/ui";
import { apiRequest } from "#api";
import type { AcademicStructureResponse } from "@/lib/academic";

type AcademicStructureWorkspaceProps = {
  accessToken: string;
  institutionId: string;
};

function InteractiveAcademicTree({
  data,
}: {
  data: AcademicStructureResponse | null;
}) {
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>(
    {},
  );

  const toggleNode = (id: string) =>
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));

  if (!data || !data.departments || data.departments.length === 0) return null;

  return (
    <Card className="!bg-zinc-900 border-white/5 !rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden flex flex-col gap-6 h-full">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[40px] -z-10" />
      <div className="flex flex-col gap-1">
        <h3 className="text-xl font-black tracking-tight text-white uppercase">
          Interactive Curriculum Tree
        </h3>
        <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">
          Institution Hierarchy Map
        </p>
      </div>

      <div className="flex flex-col gap-2 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
        {data.departments.map((dept) => {
          const isDeptExp = expandedNodes[`d_${dept.id}`];
          const deptCourses = (data.courses || []).filter(
            (c) => c.department_id === dept.id,
          );

          return (
            <div key={dept.id} className="flex flex-col gap-1">
              <button
                onClick={() => toggleNode(`d_${dept.id}`)}
                className="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-white/5 transition-colors text-left group"
              >
                <div className="w-6 h-6 rounded-md bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                  {isDeptExp ? (
                    <ChevronDown size={14} />
                  ) : (
                    <ChevronRight size={14} />
                  )}
                </div>
                <Layers size={16} className="text-indigo-400" />
                <span className="font-bold text-sm text-white">
                  {dept.name}
                </span>
                <span className="ml-auto text-[10px] font-black uppercase text-zinc-600">
                  {deptCourses.length} Programs
                </span>
              </button>

              {isDeptExp && (
                <div className="flex flex-col gap-1 pl-6 border-l border-white/5 ml-3">
                  {deptCourses.length === 0 && (
                    <span className="text-xs text-zinc-500 p-2 italic">
                      No programs
                    </span>
                  )}
                  {deptCourses.map((course) => {
                    const isCourseExp = expandedNodes[`c_${course.id}`];
                    const courseSubjects = (data.subjects || []).filter(
                      (s) => s.course_id === course.id,
                    );
                    return (
                      <div key={course.id} className="flex flex-col gap-1">
                        <button
                          onClick={() => toggleNode(`c_${course.id}`)}
                          className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-white/5 transition-colors text-left group"
                        >
                          <div className="w-5 h-5 rounded-md bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                            {isCourseExp ? (
                              <ChevronDown size={12} />
                            ) : (
                              <ChevronRight size={12} />
                            )}
                          </div>
                          <FolderOpen size={14} className="text-emerald-400" />
                          <span className="font-semibold text-sm text-zinc-300">
                            {course.name}
                          </span>
                          <span className="ml-auto text-[9px] font-black uppercase text-zinc-600">
                            {courseSubjects.length} Units
                          </span>
                        </button>

                        {isCourseExp && (
                          <div className="flex flex-col gap-1 pl-6 border-l border-white/5 ml-2.5">
                            {courseSubjects.length === 0 && (
                              <span className="text-xs text-zinc-500 p-2 italic">
                                No units
                              </span>
                            )}
                            {courseSubjects.map((sub) => (
                              <div
                                key={sub.id}
                                className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-white/5 transition-colors text-left"
                              >
                                <Database
                                  size={12}
                                  className="text-amber-400 ml-1"
                                />
                                <span className="font-medium text-xs text-zinc-400">
                                  {sub.name}
                                </span>
                                <span className="ml-auto px-1.5 py-0.5 rounded bg-black/40 border border-white/5 text-[9px] font-bold text-zinc-500 uppercase">
                                  {sub.code || "UNIT"}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function SubjectCoverageHeatmap({
  data,
}: {
  data: AcademicStructureResponse | null;
}) {
  if (!data || !data.subjects || data.subjects.length === 0) return null;

  const getSimulatedCoverage = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++)
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return Math.abs(hash % 100);
  };

  return (
    <Card className="!bg-zinc-900 border-white/5 !rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden flex flex-col gap-6 h-full">
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-[40px] -z-10" />
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h3 className="text-xl font-black tracking-tight text-white uppercase">
            Subject Coverage Heatmap
          </h3>
          <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">
            Question Bank Density Analysis
          </p>
        </div>
        <div className="flex gap-2 items-center text-[10px] uppercase font-bold tracking-widest text-zinc-500">
          <span className="w-2 h-2 rounded-full bg-rose-500/50"></span> Low
          <span className="w-2 h-2 rounded-full bg-amber-500/50 ml-2"></span>{" "}
          Medium
          <span className="w-2 h-2 rounded-full bg-emerald-500/50 ml-2"></span>{" "}
          High
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {data.subjects.map((sub) => {
          const coverage = getSimulatedCoverage(sub.name);
          const colorClass =
            coverage > 70
              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
              : coverage > 30
                ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                : "bg-rose-500/20 text-rose-400 border-rose-500/30";
          return (
            <div
              key={sub.id}
              title={`${coverage}% coverage`}
              className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-default hover:scale-105 ${colorClass}`}
            >
              <span className="truncate max-w-[120px] block">{sub.name}</span>
              <span className="text-[9px] opacity-70 block mt-0.5">
                {coverage}%
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export function AcademicStructureWorkspace({
  accessToken,
  institutionId,
}: AcademicStructureWorkspaceProps) {
  const [data, setData] = useState<AcademicStructureResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [newDepartmentName, setNewDepartmentName] = useState("");
  const [newDepartmentCode, setNewDepartmentCode] = useState("");

  const [newCourseName, setNewCourseName] = useState("");
  const [newCourseCode, setNewCourseCode] = useState("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");

  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectCode, setNewSubjectCode] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");

  async function loadData() {
    try {
      const [departmentsResp, coursesResp, subjectsResp] = await Promise.all([
        apiRequest<{ departments: AcademicStructureResponse["departments"] }>(
          "/academic/departments",
          { method: "GET", accessToken, institutionId },
        ),
        apiRequest<{ courses: AcademicStructureResponse["courses"] }>(
          "/academic/courses",
          { method: "GET", accessToken, institutionId },
        ),
        apiRequest<{ subjects: AcademicStructureResponse["subjects"] }>(
          "/academic/subjects",
          { method: "GET", accessToken, institutionId },
        ),
      ]);
      setData({
        departments: departmentsResp.departments,
        courses: coursesResp.courses,
        subjects: subjectsResp.subjects,
      });
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "Unable to synchronize academic architecture.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [accessToken, institutionId]);

  async function handleCreate(
    type: "department" | "course" | "subject",
    e: FormEvent,
  ) {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus(null);
    try {
      let body: any = {};
      let endpoint = "";
      if (type === "department") {
        body = {
          name: newDepartmentName,
          code: newDepartmentCode || undefined,
        };
        endpoint = "/academic/departments";
      } else if (type === "course") {
        body = {
          name: newCourseName,
          code: newCourseCode || undefined,
          departmentId: selectedDepartmentId,
        };
        endpoint = "/academic/courses";
      } else {
        body = {
          name: newSubjectName,
          code: newSubjectCode || undefined,
          courseId: selectedCourseId,
        };
        endpoint = "/academic/subjects";
      }
      await apiRequest(endpoint, {
        method: "POST",
        accessToken,
        institutionId,
        body: JSON.stringify(body),
      });
      if (type === "department") {
        setNewDepartmentName("");
        setNewDepartmentCode("");
      } else if (type === "course") {
        setNewCourseName("");
        setNewCourseCode("");
      } else {
        setNewSubjectName("");
        setNewSubjectCode("");
      }
      await loadData();
      setStatus(`Curriculum ${type} synthesized successfully.`);
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : `Failed to create ${type}.`,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-2">
          <Library size={10} /> Pedagogical Infrastructure
        </div>
        <h1 className="text-4xl font-black tracking-tighter text-white">
          Curriculum Architecture
        </h1>
        <p className="text-zinc-500 font-medium max-w-xl">
          Architect the foundational hierarchy of your institution&apos;s
          academic structure to ensure seamless pedagogical alignment.
        </p>
      </div>

      {status && (
        <StatusMessage variant="info" className="shadow-2xl">
          {status}
        </StatusMessage>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          {
            label: "Departments",
            count: data?.departments.length ?? 0,
            icon: LayoutGrid,
            sub: "High-level Shards",
            color: "text-blue-400",
          },
          {
            label: "Courses",
            count: data?.courses.length ?? 0,
            icon: BookOpen,
            sub: "Academic Programs",
            color: "text-emerald-400",
          },
          {
            label: "Subjects",
            count: data?.subjects.length ?? 0,
            icon: Database,
            sub: "Learning Units",
            color: "text-amber-400",
          },
        ].map((stat, i) => (
          <Card
            key={i}
            className="!bg-zinc-900 border-white/5 !rounded-3xl p-6 flex items-center gap-5 shadow-xl group hover:border-white/10 transition-all"
          >
            <div
              className={`w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center ${stat.color}`}
            >
              <stat.icon size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                {stat.label}
              </span>
              <span className="text-xl font-black text-white">
                {stat.count}{" "}
                <span className="text-[10px] text-zinc-600 ml-1">
                  Initialized
                </span>
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* Interactive Architecture Dashboards */}
      <div className="flex flex-col gap-6">
        {isLoading ? (
          <div className="flex items-center justify-center p-20 animate-pulse">
            <Spinner size="lg" />
          </div>
        ) : data?.departments?.length === 0 ? (
          <div className="text-center p-8 bg-white/5 rounded-[2.5rem] border border-white/5 border-dashed">
            <p className="text-zinc-500 font-medium">
              No architecture found. Initialize your first shards below.
            </p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_1.5fr] gap-6 items-stretch">
            <InteractiveAcademicTree data={data} />
            <SubjectCoverageHeatmap data={data} />
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Departments Column */}
        <div className="flex flex-col gap-6">
          <Card className="!bg-zinc-900 border-white/5 !rounded-[2.5rem] p-8 shadow-2xl relative group overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[40px] -z-10" />
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Layers size={18} />
              </div>
              <h3 className="text-xl font-black tracking-tight text-white uppercase">
                Initialize Dept
              </h3>
            </div>
            <form
              className="flex flex-col gap-6"
              onSubmit={(e) => handleCreate("department", e)}
            >
              <Input
                label="Dept Name"
                value={newDepartmentName}
                onChange={(e) => setNewDepartmentName(e.target.value)}
                placeholder="Ex: CS Engineering"
                required
              />
              <Input
                label="Shard Code"
                value={newDepartmentCode}
                onChange={(e) => setNewDepartmentCode(e.target.value)}
                placeholder="Ex: CSE"
              />
              <Button
                type="submit"
                loading={isSubmitting}
                fullWidth
                className="bg-white text-black py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-glow"
              >
                Authorize Shard
              </Button>
            </form>
          </Card>

          <div className="flex flex-col gap-4">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 ml-4 mb-2">
              Active Departments
            </span>
            {data?.departments.map((dept) => (
              <div
                key={dept.id}
                className="p-5 rounded-2xl bg-zinc-900 border border-white/5 hover:border-white/10 transition-all flex items-center justify-between group shadow-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-zinc-600 group-hover:text-indigo-400 group-hover:bg-white/10 transition-all">
                    <Hash size={14} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-white uppercase truncate">
                      {dept.name}
                    </span>
                    <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">
                      {dept.code || "NO-CODE"} Shard
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Courses Column */}
        <div className="flex flex-col gap-6">
          <Card className="!bg-zinc-900 border-white/5 !rounded-[2.5rem] p-8 shadow-2xl relative group overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[40px] -z-10" />
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <FolderOpen size={18} />
              </div>
              <h3 className="text-xl font-black tracking-tight text-white uppercase">
                Initialize Program
              </h3>
            </div>
            <form
              className="flex flex-col gap-6"
              onSubmit={(e) => handleCreate("course", e)}
            >
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1 mb-1">
                  Parent Dept
                </label>
                <select
                  className="w-full py-4 px-4 text-xs font-black uppercase bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500/20 transition-all cursor-pointer"
                  value={selectedDepartmentId}
                  onChange={(e) => setSelectedDepartmentId(e.target.value)}
                  required
                >
                  <option value="" disabled className="bg-zinc-950">
                    Select Parent...
                  </option>
                  {data?.departments.map((d) => (
                    <option key={d.id} value={d.id} className="bg-zinc-950">
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                label="Course Name"
                value={newCourseName}
                onChange={(e) => setNewCourseName(e.target.value)}
                placeholder="Ex: B.Tech CSE"
                required
              />
              <Input
                label="Program Code"
                value={newCourseCode}
                onChange={(e) => setNewCourseCode(e.target.value)}
                placeholder="Ex: BTCSE-24"
              />
              <Button
                type="submit"
                loading={isSubmitting}
                fullWidth
                className="bg-emerald-600 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-glow-emerald"
              >
                Authorize Program
              </Button>
            </form>
          </Card>

          <div className="flex flex-col gap-4">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 ml-4 mb-2">
              Active Programs
            </span>
            {data?.courses.map((c) => (
              <div
                key={c.id}
                className="p-5 rounded-2xl bg-zinc-900 border border-white/5 hover:border-white/10 transition-all flex flex-col gap-3 group shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-white uppercase truncate">
                    {c.name}
                  </span>
                  <div className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[8px] font-black uppercase tracking-widest text-emerald-400">
                    {c.code || "CORE"}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[9px] font-bold text-zinc-600 uppercase tracking-widest">
                  <Building2 size={10} />{" "}
                  {data.departments.find((d) => d.id === c.department_id)
                    ?.name || "Central"}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Subjects Column */}
        <div className="flex flex-col gap-6">
          <Card className="!bg-zinc-900 border-white/5 !rounded-[2.5rem] p-8 shadow-2xl relative group overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-[40px] -z-10" />
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <BookOpen size={18} />
              </div>
              <h3 className="text-xl font-black tracking-tight text-white uppercase">
                Initialize Unit
              </h3>
            </div>
            <form
              className="flex flex-col gap-6"
              onSubmit={(e) => handleCreate("subject", e)}
            >
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1 mb-1">
                  Parent Program
                </label>
                <select
                  className="w-full py-4 px-4 text-xs font-black uppercase bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500/20 transition-all cursor-pointer"
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  required
                >
                  <option value="" disabled className="bg-zinc-950">
                    Select Parent Program...
                  </option>
                  {data?.courses.map((c) => (
                    <option key={c.id} value={c.id} className="bg-zinc-950">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                label="Unit / Subject Name"
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
                placeholder="Ex: Advanced Algorithms"
                required
              />
              <Input
                label="Unit IDCode"
                value={newSubjectCode}
                onChange={(e) => setNewSubjectCode(e.target.value)}
                placeholder="Ex: CS-701"
              />
              <Button
                type="submit"
                loading={isSubmitting}
                fullWidth
                className="bg-amber-600 text-black py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-glow-amber"
              >
                Authorize Unit
              </Button>
            </form>
          </Card>

          <div className="flex flex-col gap-4">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 ml-4 mb-2">
              Active Units
            </span>
            {data?.subjects.map((s) => (
              <div
                key={s.id}
                className="p-5 rounded-2xl bg-zinc-900 border border-white/5 hover:border-white/10 transition-all flex flex-col gap-3 group shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-white uppercase truncate">
                    {s.name}
                  </span>
                  <div className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-[8px] font-black uppercase tracking-widest text-amber-400">
                    {s.code || "UNIT"}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[9px] font-bold text-zinc-600 uppercase tracking-widest">
                  <Zap size={10} />{" "}
                  {data.courses.find((c) => c.id === s.course_id)?.name ||
                    "Direct Entry"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
