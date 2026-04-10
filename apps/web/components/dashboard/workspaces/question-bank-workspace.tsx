"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import Papa from "papaparse";
import {
  BookOpenText,
  ClipboardList,
  Filter,
  Plus,
  Scale,
  Search,
  Sparkles,
  Layers3,
  CheckCircle2,
  ListTodo,
  FileUp,
  Database,
  ArrowRight,
  TrendingUp,
  CircleDashed,
  X,
  ChevronDown,
  CloudUpload,
  Bold,
  Italic,
  Underline,
  Sigma,
  Image as ImageIcon,
  Code,
  Type,
  LayoutList,
  CheckCircle,
  Circle,
} from "lucide-react";
import {
  Button,
  Card,
  Input,
  Select,
  Spinner,
  StatusMessage,
  Textarea,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@examcraft/ui";
import { apiRequest } from "#api";
import type {
  DepartmentRecord,
  CourseRecord,
  SubjectRecord,
} from "../../../lib/academic";

type QuestionBankWorkspaceProps = {
  accessToken: string;
  institutionId: string;
};

type Question = {
  id: string;
  title: string;
  subject: string;
  bloomLevel: string;
  difficulty: string;
  tags: string[];
  courseOutcomes?: string[];
  unitNumber?: number | null;
  departmentId?: string | null;
  courseId?: string | null;
  status: string;
  createdAt: string;
};

const difficultyOptions = [
  { label: "Level: Easy", value: "easy" },
  { label: "Level: Medium", value: "medium" },
  { label: "Level: Hard", value: "hard" },
];

export function QuestionBankWorkspace({
  accessToken,
  institutionId,
}: QuestionBankWorkspaceProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [departments, setDepartments] = useState<DepartmentRecord[]>([]);
  const [courses, setCourses] = useState<CourseRecord[]>([]);
  const [subjects, setSubjects] = useState<SubjectRecord[]>([]);

  const [status, setStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const [questionType, setQuestionType] = useState<"subjective" | "mcq">(
    "subjective",
  );
  const [mcqOptions, setMcqOptions] = useState([
    { id: "1", text: "", isCorrect: true },
    { id: "2", text: "", isCorrect: false },
    { id: "3", text: "", isCorrect: false },
    { id: "4", text: "", isCorrect: false },
  ]);

  const [form, setForm] = useState({
    title: "",
    departmentId: "",
    courseId: "",
    subjectId: "",
    bloomLevel: "",
    difficulty: "medium",
    tags: "",
    courseOutcomes: "",
    unitNumber: "",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("");
  const [isDrafting, setIsDrafting] = useState(false);
  const [draftingMode, setDraftingMode] = useState<"manual" | "bulk">("manual");
  const [bulkCsvData, setBulkCsvData] = useState<any[] | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [questionsRes, deptsRes, coursesRes, subsRes] = await Promise.all(
          [
            apiRequest<Question[]>("/content/questions", {
              method: "GET",
              accessToken,
              institutionId,
            }),
            apiRequest<{ departments: DepartmentRecord[] }>(
              "/academic/departments",
              { method: "GET", accessToken, institutionId },
            ),
            apiRequest<{ courses: CourseRecord[] }>("/academic/courses", {
              method: "GET",
              accessToken,
              institutionId,
            }),
            apiRequest<{ subjects: SubjectRecord[] }>("/academic/subjects", {
              method: "GET",
              accessToken,
              institutionId,
            }),
          ],
        );

        if (isMounted) {
          setQuestions(questionsRes);
          setDepartments(deptsRes.departments);
          setCourses(coursesRes.courses);
          setSubjects(subsRes.subjects);
        }
      } catch (error) {
        if (isMounted)
          setStatus(
            error instanceof Error
              ? error.message
              : "Unable to load Question Bank data.",
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

  const filteredCourses = useMemo(() => {
    return form.departmentId
      ? courses.filter((c) => c.department_id === form.departmentId)
      : [];
  }, [courses, form.departmentId]);

  const filteredSubjects = useMemo(() => {
    return form.courseId
      ? subjects.filter((s) => s.course_id === form.courseId)
      : [];
  }, [subjects, form.courseId]);

  async function createQuestion(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    setIsCreating(true);
    try {
      if (questionType === "mcq") {
        const filledOptions = mcqOptions.filter((option) => option.text.trim());
        const hasCorrectOption = filledOptions.some((option) => option.isCorrect);

        if (filledOptions.length < 2 || !hasCorrectOption) {
          setStatus(
            "MCQ questions require at least 2 options and one correct answer.",
          );
          return;
        }
      }

      const selectedSubject = subjects.find((s) => s.id === form.subjectId);
      const mcqPayload =
        questionType === "mcq"
          ? mcqOptions
              .filter((option) => option.text.trim())
              .map(({ text, isCorrect }) => ({
                text: text.trim(),
                isCorrect,
              }))
          : undefined;

      const createdQuestion = await apiRequest<Question>("/content/questions", {
        method: "POST",
        accessToken,
        institutionId,
        body: JSON.stringify({
          title: form.title,
          questionType,
          subject: selectedSubject?.name || "General",
          departmentId: form.departmentId,
          courseId: form.courseId,
          bloomLevel: form.bloomLevel,
          difficulty: form.difficulty,
          unitNumber: form.unitNumber ? parseInt(form.unitNumber, 10) : null,
          courseOutcomes: form.courseOutcomes
            .split(",")
            .map((co) => co.trim())
            .filter(Boolean),
          tags: form.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
          ...(mcqPayload ? { mcqOptions: mcqPayload } : {}),
        }),
      });
      setQuestions([createdQuestion, ...questions]);
      setIsDrafting(false);
      setForm({
        ...form,
        title: "",
        bloomLevel: "",
        tags: "",
        courseOutcomes: "",
        unitNumber: "",
      });
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Unable to add question.",
      );
    } finally {
      setIsCreating(false);
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results: any) => {
        setBulkCsvData(results.data);
      },
      error: (err: any) => {
        setStatus(`Error reading CSV: ${err.message}`);
      },
    });
  };

  async function submitBulkImport() {
    if (!bulkCsvData || bulkCsvData.length === 0) return;
    if (!form.departmentId || !form.courseId || !form.subjectId) {
      setStatus(
        "Please specify coordination context (Dept/Course/Subject) first.",
      );
      return;
    }
    setStatus(null);
    setIsImporting(true);
    try {
      const selectedSubject = subjects.find((s) => s.id === form.subjectId);
      const transformedQuestions = bulkCsvData.map((row) => ({
        title:
          row["Question Text"] || row["Question"] || row["Title"] || "Untitled",
        subject: selectedSubject?.name || "General",
        departmentId: form.departmentId,
        courseId: form.courseId,
        bloomLevel:
          row["Bloom's Level"] || row["Bloom"] || form.bloomLevel || "Remember",
        difficulty: (
          row["Difficulty"] ||
          form.difficulty ||
          "medium"
        ).toLowerCase(),
        unitNumber: row["Unit"]
          ? parseInt(row["Unit"], 10)
          : form.unitNumber
            ? parseInt(form.unitNumber, 10)
            : null,
        courseOutcomes: row["Course Outcomes"]
          ? row["Course Outcomes"].split(",").map((c: string) => c.trim())
          : [],
        tags: row["Tags"]
          ? row["Tags"].split(",").map((t: string) => t.trim())
          : [],
      }));

      const createdQuestions = await apiRequest<Question[]>(
        "/content/questions/bulk",
        {
          method: "POST",
          accessToken,
          institutionId,
          body: JSON.stringify({ questions: transformedQuestions }),
        },
      );
      setQuestions([...createdQuestions, ...questions]);
      setIsDrafting(false);
      setBulkCsvData(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setStatus(
        `Successfully imported ${createdQuestions.length} pedagogical assets.`,
      );
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Bulk import sync failed.",
      );
    } finally {
      setIsImporting(false);
    }
  }

  const filteredList = useMemo(() => {
    const needle = searchQuery.toLowerCase();
    return questions.filter((q) => {
      const matchSearch = [
        q.title,
        q.subject,
        q.bloomLevel,
        (q.courseOutcomes || []).join(" "),
      ]
        .join(" ")
        .toLowerCase()
        .includes(needle);
      const matchDiff = filterDifficulty
        ? q.difficulty === filterDifficulty
        : true;
      return matchSearch && matchDiff;
    });
  }, [questions, searchQuery, filterDifficulty]);

  return (
    <div className="flex flex-col gap-10">
      {/* Search & Statistics Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
        <div className="lg:col-span-3 flex items-center gap-4 p-2 rounded-2xl bg-zinc-900 border border-white/5 shadow-2xl overflow-hidden group focus-within:border-indigo-500/30 transition-all">
          <div className="pl-4 text-zinc-500 group-focus-within:text-indigo-400 transition-colors">
            <Search size={20} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by topic, outcome, or Bloom's level..."
            className="flex-1 bg-transparent border-none py-4 px-2 text-sm font-medium text-white focus:outline-none placeholder:text-zinc-600"
          />
          <div className="pr-2 border-l border-white/5 flex items-center">
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-zinc-500 focus:outline-none cursor-pointer hover:text-white px-4 py-2"
            >
              <option value="">All Difficulties</option>
              <option value="easy">Level: Easy</option>
              <option value="medium">Level: Medium</option>
              <option value="hard">Level: Hard</option>
            </select>
          </div>
        </div>

        <Button
          onClick={() => setIsDrafting(!isDrafting)}
          className={`${isDrafting ? "bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20" : "bg-white text-black hover:scale-105 shadow-glow"} font-black py-4.5 rounded-2xl flex items-center justify-center gap-2 transition-all w-full`}
        >
          {isDrafting ? (
            <>
              <X size={18} /> Cancel
            </>
          ) : (
            <>
              <Plus size={18} /> Add Questions
            </>
          )}
        </Button>
      </div>

      {status && (
        <StatusMessage
          variant={
            status.includes("sync") ||
            status.includes("failed") ||
            status.includes("spec")
              ? "error"
              : "success"
          }
          className="shadow-2xl"
        >
          {status}
        </StatusMessage>
      )}

      {isDrafting && (
        <Card className="!bg-zinc-900 border-white/5 !rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="absolute top-0 left-1/4 w-[50%] h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] -z-10" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div className="flex flex-col gap-1">
              <h3 className="text-2xl font-black tracking-tight text-white flex items-center gap-3">
                {draftingMode === "manual"
                  ? "Draft Pedagogical Asset"
                  : "Mass Asset Import"}
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              </h3>
              <p className="text-zinc-500 text-xs font-medium uppercase tracking-[0.2em]">
                Synchronization Mode Selection
              </p>
            </div>

            <div className="flex p-1 rounded-xl bg-white/5 border border-white/10 w-fit">
              {["manual", "bulk"].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setDraftingMode(mode as any)}
                  className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${draftingMode === mode ? "bg-white text-black shadow-xl" : "text-zinc-500 hover:text-white"}`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 p-6 rounded-3xl bg-white/5 border border-white/5">
            <Select
              label="Target Department"
              value={form.departmentId}
              onChange={(e) =>
                setForm({
                  ...form,
                  departmentId: e.target.value,
                  courseId: "",
                  subjectId: "",
                })
              }
              options={[
                { label: "Select Department", value: "" },
                ...departments.map((d) => ({ label: d.name, value: d.id })),
              ]}
              leftIcon={<Layers3 size={16} />}
            />
            <Select
              label="Target Course"
              value={form.courseId}
              onChange={(e) =>
                setForm({ ...form, courseId: e.target.value, subjectId: "" })
              }
              options={[
                { label: "Select Course", value: "" },
                ...filteredCourses.map((c) => ({ label: c.name, value: c.id })),
              ]}
              disabled={!form.departmentId}
              leftIcon={<BookOpenText size={16} />}
            />
            <Select
              label="Target Subject"
              value={form.subjectId}
              onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
              options={[
                { label: "Select Subject", value: "" },
                ...filteredSubjects.map((s) => ({
                  label: s.name,
                  value: s.id,
                })),
              ]}
              disabled={!form.courseId}
              leftIcon={<BookOpenText size={16} />}
            />
          </div>

          {draftingMode === "manual" ? (
            <form
              onSubmit={createQuestion}
              className="flex flex-col xl:flex-row gap-8"
            >
              {/* Left Column: Notion-style Rich Editor */}
              <div className="flex-1 flex flex-col gap-6">
                <div className="flex flex-col gap-2 relative group/editor">
                  <div className="flex items-center justify-between pb-2 border-b border-white/5">
                    <div className="flex items-center gap-1 opacity-50 group-focus-within/editor:opacity-100 transition-opacity">
                      <div className="p-2 hover:bg-white/10 rounded-lg cursor-pointer transition-colors">
                        <Bold size={14} />
                      </div>
                      <div className="p-2 hover:bg-white/10 rounded-lg cursor-pointer transition-colors">
                        <Italic size={14} />
                      </div>
                      <div className="p-2 hover:bg-white/10 rounded-lg cursor-pointer transition-colors">
                        <Underline size={14} />
                      </div>
                      <div className="w-px h-4 bg-white/10 mx-1" />
                      <div className="p-2 hover:bg-white/10 rounded-lg cursor-pointer transition-colors">
                        <Sigma size={14} />
                      </div>
                      <div className="p-2 hover:bg-white/10 rounded-lg cursor-pointer transition-colors">
                        <ImageIcon size={14} />
                      </div>
                      <div className="p-2 hover:bg-white/10 rounded-lg cursor-pointer transition-colors">
                        <Code size={14} />
                      </div>
                    </div>
                    <div className="flex bg-zinc-900 border border-white/10 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setQuestionType("subjective")}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${questionType === "subjective" ? "bg-white/10 text-white" : "text-zinc-500 hover:text-white"}`}
                      >
                        <Type size={12} /> Text
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuestionType("mcq")}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${questionType === "mcq" ? "bg-white/10 text-white" : "text-zinc-500 hover:text-white"}`}
                      >
                        <LayoutList size={12} /> MCQ
                      </button>
                    </div>
                  </div>

                  <Textarea
                    required
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    placeholder="Type your question prompt here... (LaTeX supported)"
                    className="!bg-transparent !border-none !py-6 !text-xl !font-medium !text-white placeholder:text-zinc-700 focus:!outline-none !resize-none !min-h-[120px] transition-all"
                  />
                </div>

                {questionType === "mcq" && (
                  <div className="flex flex-col gap-3 mt-4 animate-in fade-in slide-in-from-bottom-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">
                      Response Options
                    </label>
                    <div className="flex flex-col gap-3">
                      {mcqOptions.map((opt, idx) => (
                        <div
                          key={opt.id}
                          className={`flex items-center gap-4 p-3 rounded-2xl border transition-all ${opt.isCorrect ? "bg-emerald-500/10 border-emerald-500/30" : "bg-white/5 border-white/5 hover:border-white/10"}`}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              setMcqOptions(
                                mcqOptions.map((o) => ({
                                  ...o,
                                  isCorrect: o.id === opt.id,
                                })),
                              )
                            }
                            className={`flex shrink-0 w-8 h-8 rounded-full items-center justify-center transition-colors ${opt.isCorrect ? "bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]" : "bg-zinc-800 text-zinc-500 hover:text-white hover:bg-zinc-700"}`}
                          >
                            {opt.isCorrect ? (
                              <CheckCircle size={16} />
                            ) : (
                              <Circle size={16} />
                            )}
                          </button>
                          <div className="flex flex-col flex-1">
                            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1">
                              Option {String.fromCharCode(65 + idx)}
                            </span>
                            <input
                              type="text"
                              value={opt.text}
                              onChange={(e) =>
                                setMcqOptions(
                                  mcqOptions.map((o) =>
                                    o.id === opt.id
                                      ? { ...o, text: e.target.value }
                                      : o,
                                  ),
                                )
                              }
                              placeholder={`Type option ${String.fromCharCode(65 + idx)}...`}
                              className="w-full bg-transparent border-none text-sm font-bold text-white placeholder:text-zinc-600 focus:outline-none"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Cognitive Metadata Panel */}
              <div className="xl:w-80 flex shrink-0 flex-col gap-6 p-6 rounded-[2rem] bg-zinc-950 border border-white/5 h-fit shadow-xl">
                <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                  <Sparkles size={16} className="text-indigo-400" />
                  <h4 className="text-sm font-black tracking-widest uppercase text-white">
                    Cognitive Metadata
                  </h4>
                </div>

                <Select
                  label="Difficulty"
                  value={form.difficulty}
                  onChange={(e) =>
                    setForm({ ...form, difficulty: e.target.value })
                  }
                  options={difficultyOptions}
                  leftIcon={<Scale size={16} />}
                />

                <div className="relative">
                  <Input
                    label="Bloom Taxonomy"
                    required
                    placeholder="Apply / Analyze"
                    value={form.bloomLevel}
                    onChange={(e) =>
                      setForm({ ...form, bloomLevel: e.target.value })
                    }
                    leftIcon={<Sparkles size={16} />}
                  />
                  {/* Bloom Level Hint */}
                  <div className="absolute right-4 top-10 flex gap-1">
                    {["Know", "Apply", "Analyze", "Evaluate"].map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setForm({ ...form, bloomLevel: level })}
                        className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${form.bloomLevel.toLowerCase().includes(level.toLowerCase()) ? "bg-indigo-500 text-white" : "bg-white/5 text-zinc-500 hover:text-white"}`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <Input
                  label="Unit Designation"
                  type="number"
                  placeholder="Ex: 1"
                  value={form.unitNumber}
                  onChange={(e) =>
                    setForm({ ...form, unitNumber: e.target.value })
                  }
                />

                <Input
                  label="Outcomes (COs)"
                  placeholder="CO1, CO2"
                  value={form.courseOutcomes}
                  onChange={(e) =>
                    setForm({ ...form, courseOutcomes: e.target.value })
                  }
                  leftIcon={<ListTodo size={16} />}
                />

                <Input
                  label="Metadata Tags"
                  placeholder="energy, metabolism"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  leftIcon={<Filter size={16} />}
                />

                <Button
                  type="submit"
                  disabled={isCreating}
                  className="bg-white text-black py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-glow hover:scale-[1.02] active:scale-95 transition-all mt-2 w-full"
                >
                  {isCreating ? <Spinner size="sm" /> : "Deploy Asset"}
                </Button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col gap-10">
              <div
                className={`p-16 rounded-[2.5rem] border-2 border-dashed transition-all flex flex-col items-center gap-6 text-center group/uploader cursor-pointer relative overflow-hidden ${bulkCsvData ? "border-indigo-500/40 bg-indigo-500/5" : "border-white/5 hover:border-white/20 hover:bg-white/5"}`}
                onClick={() => fileInputRef.current?.click()}
              >
                <div
                  className={`w-20 h-20 rounded-3xl flex items-center justify-center transition-all ${bulkCsvData ? "bg-indigo-600 text-white" : "bg-white/5 text-zinc-600 group-hover/uploader:text-white group-hover/uploader:bg-white/10"}`}
                >
                  <CloudUpload size={40} />
                </div>
                <div className="flex flex-col gap-2">
                  <h4 className="text-xl font-bold text-white tracking-tight">
                    {bulkCsvData
                      ? `Sync Ready: ${bulkCsvData.length} records detected`
                      : "Select Coordinate CSV"}
                  </h4>
                  <p className="text-zinc-500 max-w-sm text-sm font-medium leading-relaxed">
                    Required Headers: Question Text, Difficulty, Bloom&apos;s
                    Level, Unit, Course Outcomes, Tags
                  </p>
                </div>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  ref={fileInputRef}
                  className="hidden"
                />
              </div>

              {bulkCsvData && bulkCsvData.length > 0 && (
                <div className="flex justify-center">
                  <Button
                    variant="primary"
                    disabled={isImporting}
                    onClick={submitBulkImport}
                    className="bg-white text-black px-12 py-5 rounded-2xl font-black text-lg shadow-2xl hover:scale-105 transition-all"
                  >
                    {isImporting ? (
                      <Spinner size="sm" />
                    ) : (
                      `Synchronize ${bulkCsvData.length} Assets`
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {/* Main Repository Grid */}
      <Card className="!bg-zinc-900 border-white/5 !rounded-[2.5rem] p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-500">
              <Database size={20} />
            </div>
            <div className="flex flex-col">
              <h3 className="text-xl font-black tracking-tight text-white">
                Central Repository
              </h3>
              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">
                {filteredList.length} Verified Assets Identified
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-indigo-400 group">
            <TrendingUp
              size={12}
              className="group-hover:translate-x-1 transition-transform"
            />{" "}
            Repository Health: Optimal
          </div>
        </div>

        <div className="grid gap-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[45%]">Pedagogical Content</TableHead>
                <TableHead>Sharding Context</TableHead>
                <TableHead>Cognition</TableHead>
                <TableHead>Taxonomy</TableHead>
                <TableHead className="text-right pr-12">
                  Orchestration
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredList.map((q) => (
                <TableRow key={q.id}>
                  <TableCell className="max-w-md">
                    <div className="flex flex-col gap-1">
                      <span className="font-black text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight leading-relaxed">
                        {q.title}
                      </span>
                      <div className="flex items-center gap-3">
                        {q.status === "ready" || q.status === "approved" ? (
                          <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Verified Asset
                          </span>
                        ) : (
                          <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded bg-zinc-800 text-zinc-500 border border-white/5">
                            Unsynchronized Draft
                          </span>
                        )}
                        <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">
                          ID: {q.id.slice(0, 8)}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-zinc-200">
                        {q.subject}
                      </span>
                      <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">
                        UNIT {q.unitNumber || "N/A"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest ${q.difficulty === "hard" ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"}`}
                    >
                      {q.difficulty}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.1em]">
                      {q.bloomLevel}
                    </span>
                  </TableCell>
                  <TableCell className="text-right pr-12">
                    <Button
                      variant="secondary"
                      className="!rounded-xl border border-white/5 hover:border-white/20 transition-all !text-[9px] !font-black !uppercase !px-6"
                    >
                      Refine Asset
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}

function QuestionRow({ question }: { question: Question }) {
  return (
    <div className="group p-6 rounded-[2rem] bg-zinc-950 border border-white/5 hover:border-white/10 transition-all flex items-center justify-between gap-8 relative overflow-hidden">
      {/* Ambient accent based on status */}
      <div
        className={`absolute top-0 right-0 w-32 h-32 blur-[60px] -z-10 opacity-0 group-hover:opacity-10 transition-all ${question.status === "approved" || question.status === "ready" ? "bg-emerald-500" : "bg-zinc-500"}`}
      />

      <div className="flex-1 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <h4 className="text-lg font-black tracking-tight text-white group-hover:text-indigo-300 transition-colors">
            {question.title}
          </h4>
          {question.status === "ready" || question.status === "approved" ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black uppercase tracking-widest text-emerald-400 animate-pulse">
              <CheckCircle2 size={10} /> Verified
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-500/10 border border-zinc-500/20 text-[9px] font-black uppercase tracking-widest text-zinc-500">
              <CircleDashed size={10} /> Draft
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-x-8 gap-y-3">
          <Stat
            icon={BookOpenText}
            label="Pedagogy"
            value={`${question.subject} ${question.unitNumber ? `(U${question.unitNumber})` : ""}`}
          />
          <Stat
            icon={Scale}
            label="Cognition"
            value={question.difficulty}
            isCapital
          />
          <Stat icon={Sparkles} label="Taxonomy" value={question.bloomLevel} />
          {question.courseOutcomes && question.courseOutcomes.length > 0 && (
            <Stat
              icon={ListTodo}
              label="Alignment"
              value={question.courseOutcomes.join(", ")}
              isIndigo
            />
          )}
        </div>
      </div>

      <div className="opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
        <Button
          variant="secondary"
          className="rounded-xl border border-white/10 px-6 py-4 font-black text-xs hover:bg-white hover:text-black transition-all"
        >
          Refine Code
        </Button>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, isCapital, isIndigo }: any) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`w-7 h-7 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center ${isIndigo ? "text-indigo-400" : "text-zinc-600"}`}
      >
        <Icon size={12} strokeWidth={2.5} />
      </div>
      <div className="flex flex-col">
        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-700">
          {label}
        </span>
        <span
          className={`text-[10px] font-bold tracking-tight ${isIndigo ? "text-indigo-300" : isCapital ? "text-zinc-300 capitalize" : "text-zinc-400"}`}
        >
          {value}
        </span>
      </div>
    </div>
  );
}
