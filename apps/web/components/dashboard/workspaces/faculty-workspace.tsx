"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ClipboardList,
  Hash,
  Layers3,
  Search,
  BookOpenText,
  Wand2,
  Database,
  FileText,
  Globe,
  Plus,
  Sparkles,
  ChevronRight,
  ArrowUpRight,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import {
  Button,
  Card,
  Input,
  Select,
  Spinner,
  StatusMessage,
} from "@examcraft/ui";
import { apiRequest } from "#api";
import { QuestionBankWorkspace } from "./question-bank-workspace";
import { GlobalTemplateLibrary } from "./global-template-library";
import { TemplateSectionConfigurator } from "./template-section-configurator";
import { PaperWorkspace } from "./paper-workspace";
import { StatCard } from "../shared/StatCard";
import { ActivityFeed } from "../shared/ActivityFeed";
import { Table } from "../shared/Table";
import type {
  DepartmentRecord,
  CourseRecord,
  SubjectRecord,
} from "@/lib/academic";

type FacultyWorkspaceProps = {
  accessToken: string;
  institutionId: string;
  institutionName?: string;
};

type Template = {
  id: string;
  name: string;
  examType: string;
  durationMinutes: number;
  totalMarks: number;
  sections: Array<{ title: string; questionCount: number; marks: number }>;
  status: string;
  createdAt: string;
};

export function FacultyWorkspace({
  accessToken,
  institutionId,
  institutionName,
}: FacultyWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<
    "questions" | "templates" | "papers" | "global"
  >("questions");

  const [templates, setTemplates] = useState<Template[]>([]);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [templateStatus, setTemplateStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [templateForm, setTemplateForm] = useState({
    name: "",
    examType: "",
    durationMinutes: "90",
    totalMarks: "100",
    departmentId: "",
    courseId: "",
    subjectId: "",
  });
  const [templateSearch, setTemplateSearch] = useState("");
  const [sections, setSections] = useState<any[]>([
    {
      title: "Section A",
      questionCount: 5,
      marks: 50,
      allowedDifficulty: ["easy", "medium"],
    },
  ]);

  const [departments, setDepartments] = useState<DepartmentRecord[]>([]);
  const [courses, setCourses] = useState<CourseRecord[]>([]);
  const [subjects, setSubjects] = useState<SubjectRecord[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadContent() {
      try {
        const [templateResponse, deptsRes, coursesRes, subsRes] =
          await Promise.all([
            apiRequest<Template[]>("/content/templates", {
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
          ]);

        if (isMounted) {
          setTemplates(templateResponse);
          setDepartments(deptsRes.departments);
          setCourses(coursesRes.courses);
          setSubjects(subsRes.subjects);
        }
      } catch (error) {
        if (isMounted) {
          setTemplateStatus(
            error instanceof Error
              ? error.message
              : "Unable to load faculty templates.",
          );
        }

        // Generate Paper Handler
        async function onGenerate() {
          setIsGenerating("generating");
          setTemplateStatus(null);
          try {
            // Paper generation engine - to be implemented in Sprint 1
            await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate delay
            setTemplateStatus(
              "Paper generation is not yet implemented in demo mode.",
            );
          } catch (error) {
            setTemplateStatus(
              error instanceof Error
                ? error.message
                : "Failed to generate paper.",
            );
          } finally {
            setIsGenerating(null);
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadContent();

    return () => {
      isMounted = false;
    };
  }, [accessToken, institutionId]);

  async function createTemplate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTemplateStatus(null);

    try {
      const createdTemplate = await apiRequest<Template>("/content/templates", {
        method: "POST",
        accessToken,
        institutionId,
        body: JSON.stringify({
          name: templateForm.name,
          examType: templateForm.examType,
          durationMinutes: Number(templateForm.durationMinutes),
          totalMarks: Number(templateForm.totalMarks),
          departmentId: templateForm.departmentId || null,
          courseId: templateForm.courseId || null,
          subjectId: templateForm.subjectId || null,
          sections,
        }),
      });

      setTemplates((current) => [createdTemplate, ...current]);
      setTemplateForm({
        name: "",
        examType: "",
        durationMinutes: "90",
        totalMarks: "100",
        departmentId: "",
        courseId: "",
        subjectId: "",
      });
      setTemplateStatus(`Template "${createdTemplate.name}" created.`);
    } catch (error) {
      setTemplateStatus(
        error instanceof Error ? error.message : "Unable to create template.",
      );
    }
  }

  const filteredCourses = useMemo(() => {
    return templateForm.departmentId
      ? courses.filter((c) => c.department_id === templateForm.departmentId)
      : [];
  }, [courses, templateForm.departmentId]);

  const filteredSubjects = useMemo(() => {
    return templateForm.courseId
      ? subjects.filter((s) => s.course_id === templateForm.courseId)
      : [];
  }, [subjects, templateForm.courseId]);

  const filteredTemplates = useMemo(() => {
    const needle = templateSearch.trim().toLowerCase();
    if (!needle) {
      return templates;
    }

    return templates.filter((template) =>
      [template.name, template.examType, template.status]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [templateSearch, templates]);

  async function handleGenerate(templateId: string, templateName: string) {
    setIsGenerating(templateId);
    setTemplateStatus(null);
    try {
      await apiRequest("/content/papers/generate", {
        method: "POST",
        accessToken,
        institutionId,
        body: JSON.stringify({
          templateId,
          title: `${templateName} - ${new Date().toLocaleDateString("en-US")}`,
        }),
      });
      setTemplateStatus(
        `Draft paper generated from "${templateName}". Check the Papers tab!`,
      );
      setActiveTab("papers");
    } catch (error) {
      setTemplateStatus(
        error instanceof Error ? error.message : "Generation failed.",
      );
    } finally {
      setIsGenerating(null);
    }
  }

  const tabs = [
    { id: "questions", label: "Question Bank", icon: Database },
    { id: "templates", label: "Paper Templates", icon: FileText },
    { id: "papers", label: "Exam Papers", icon: ClipboardList },
    { id: "global", label: "Explore Library", icon: Globe },
  ] as const;

  return (
    <div className="flex flex-col gap-10">
      {/* Quick Stats Overview */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          icon={Database}
          number={templates.length}
          label="Paper Templates"
          color="indigo"
        />
        <StatCard
          icon={FileText}
          number={Math.floor(Math.random() * 20)}
          label="Drafts in Progress"
          color="indigo"
        />
        <StatCard
          icon={CheckCircle}
          number={Math.floor(Math.random() * 5)}
          label="Submitted for Review"
          color="indigo"
        />
      </div>

      {/* Tab Navigation */}
      <nav className="flex items-center gap-2 p-1.5 rounded-2xl bg-zinc-900/50 border border-white/5 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
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

      <div className="relative">
        {activeTab === "questions" && (
          <QuestionBankWorkspace
            accessToken={accessToken}
            institutionId={institutionId}
          />
        )}

        {activeTab === "papers" && (
          <PaperWorkspace
            accessToken={accessToken}
            institutionId={institutionId}
            institutionName={institutionName}
          />
        )}

        {activeTab === "templates" && (
          <div className="grid lg:grid-cols-[1fr_1.5fr] gap-10 items-start">
            {/* Editor Sidebar */}
            <Card className="!bg-zinc-900 border-white/5 !rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[40px] -z-10 group-hover:bg-indigo-500/10 transition-all" />

              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Plus size={20} />
                </div>
                <h2 className="text-2xl font-black tracking-tight text-white">
                  Create Template
                </h2>
              </div>

              <form className="flex flex-col gap-6" onSubmit={createTemplate}>
                <div className="grid grid-cols-1 gap-4">
                  <Select
                    label="Academic Department"
                    value={templateForm.departmentId}
                    onChange={(e) =>
                      setTemplateForm({
                        ...templateForm,
                        departmentId: e.target.value,
                        courseId: "",
                        subjectId: "",
                      })
                    }
                    options={[
                      { label: "Select Department", value: "" },
                      ...departments.map((d) => ({
                        label: d.name,
                        value: d.id,
                      })),
                    ]}
                    leftIcon={<Layers3 size={16} />}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Select
                      label="Course"
                      value={templateForm.courseId}
                      onChange={(e) =>
                        setTemplateForm({
                          ...templateForm,
                          courseId: e.target.value,
                          subjectId: "",
                        })
                      }
                      options={[
                        { label: "Select Course", value: "" },
                        ...filteredCourses.map((c) => ({
                          label: c.name,
                          value: c.id,
                        })),
                      ]}
                      disabled={!templateForm.departmentId}
                      leftIcon={<BookOpenText size={16} />}
                    />
                    <Select
                      label="Subject"
                      value={templateForm.subjectId}
                      onChange={(e) =>
                        setTemplateForm({
                          ...templateForm,
                          subjectId: e.target.value,
                        })
                      }
                      options={[
                        { label: "Select Subject", value: "" },
                        ...filteredSubjects.map((s) => ({
                          label: s.name,
                          value: s.id,
                        })),
                      ]}
                      disabled={!templateForm.courseId}
                      leftIcon={<BookOpenText size={16} />}
                    />
                  </div>
                </div>

                <Input
                  label="Official Template Name"
                  required
                  value={templateForm.name}
                  onChange={(event) =>
                    setTemplateForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Ex: Mid-Semester Physics II"
                  leftIcon={<Layers3 size={16} />}
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Exam Type"
                    required
                    value={templateForm.examType}
                    onChange={(event) =>
                      setTemplateForm((current) => ({
                        ...current,
                        examType: event.target.value,
                      }))
                    }
                    placeholder="Regular / Arrear"
                    leftIcon={<ClipboardList size={16} />}
                  />
                  <Input
                    label="Duration (Mins)"
                    type="number"
                    min="15"
                    required
                    value={templateForm.durationMinutes}
                    onChange={(event) =>
                      setTemplateForm((current) => ({
                        ...current,
                        durationMinutes: event.target.value,
                      }))
                    }
                    leftIcon={<Hash size={16} />}
                  />
                </div>

                <Input
                  label="Total Potential Marks"
                  type="number"
                  min="1"
                  required
                  value={templateForm.totalMarks}
                  onChange={(event) =>
                    setTemplateForm((current) => ({
                      ...current,
                      totalMarks: event.target.value,
                    }))
                  }
                  leftIcon={<Hash size={16} />}
                />

                <div className="mt-4 p-6 rounded-2xl bg-white/5 border border-white/5">
                  <TemplateSectionConfigurator
                    sections={sections}
                    onChange={setSections}
                  />
                </div>

                <Button
                  type="submit"
                  fullWidth
                  className="bg-white text-black py-6 rounded-2xl font-black text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
                >
                  Deploy Template
                </Button>
              </form>

              {templateStatus ? (
                <StatusMessage className="mt-6 shadow-2xl" variant="info">
                  {templateStatus}
                </StatusMessage>
              ) : null}
            </Card>

            {/* Template Library */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <h2 className="text-2xl font-black tracking-tight text-white">
                    Institutional Library
                  </h2>
                  <p className="text-zinc-500 text-sm font-medium">
                    Standardized paper templates for rapid pedagogical
                    deployment.
                  </p>
                </div>
                <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  {filteredTemplates.length} Templates
                </div>
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center text-zinc-500 group-focus-within:text-indigo-400 transition-colors">
                  <Search size={18} />
                </div>
                <input
                  type="text"
                  value={templateSearch}
                  onChange={(e) => setTemplateSearch(e.target.value)}
                  placeholder="Filter by name, type, or coordination status..."
                  className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/30 transition-all"
                />
              </div>

              <div className="grid gap-4 mt-2">
                {isLoading ? (
                  <div className="flex justify-center p-20 animate-pulse">
                    <Spinner />
                  </div>
                ) : filteredTemplates.length === 0 ? (
                  <div className="p-16 rounded-[2.5rem] bg-white/5 border border-white/5 border-dashed text-center flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-zinc-600">
                      <FileText size={24} />
                    </div>
                    <p className="text-zinc-500 font-bold tracking-tight">
                      No institutional templates identified.
                    </p>
                  </div>
                ) : (
                  filteredTemplates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      isGenerating={isGenerating === template.id}
                      onGenerate={() =>
                        handleGenerate(template.id, template.name)
                      }
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "global" && (
          <GlobalTemplateLibrary
            accessToken={accessToken}
            institutionId={institutionId}
            onCloned={(newT) => {
              setTemplates((curr) => [newT, ...curr]);
              setActiveTab("templates");
              setTemplateStatus(
                `Global template "${newT.name}" imported to your institution.`,
              );
            }}
          />
        )}
      </div>
    </div>
  );
}

function TemplateCard({
  template,
  onGenerate,
  isGenerating,
}: {
  template: Template;
  onGenerate: () => void;
  isGenerating: boolean;
}) {
  return (
    <div className="p-6 rounded-[2rem] bg-zinc-900 border border-white/5 hover:border-white/10 transition-all group flex items-center justify-between gap-6 shadow-lg overflow-hidden relative">
      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-[40px] -z-10 group-hover:bg-indigo-500/10 transition-all" />

      <div className="flex items-center gap-5">
        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-500 group-hover:text-indigo-400 group-hover:bg-white/10 transition-all">
          <FileText size={22} />
        </div>
        <div className="flex flex-col gap-0.5">
          <h4 className="text-lg font-black tracking-tight text-white group-hover:text-indigo-300 transition-colors">
            {template.name}
          </h4>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
              {template.examType}
            </span>
            <div className="w-1 h-1 rounded-full bg-zinc-700" />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
              {template.totalMarks} Marks
            </span>
            <div className="w-1 h-1 rounded-full bg-zinc-700" />
            <span
              className={`text-[10px] font-black uppercase tracking-widest ${template.status === "ACTIVE" ? "text-emerald-400" : "text-amber-400"}`}
            >
              {template.status}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="secondary"
          size="sm"
          loading={isGenerating}
          onClick={onGenerate}
          className="rounded-xl border border-white/10 px-6 py-5 font-black text-xs hover:bg-white hover:text-black transition-all"
        >
          {!isGenerating && <Wand2 size={14} className="mr-2" />}
          {isGenerating ? "Orchestrating..." : "Generate Paper"}
        </Button>
        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-zinc-600 hover:text-white hover:bg-white/10 transition-all cursor-pointer">
          <ChevronRight size={18} />
        </div>
      </div>
    </div>
  );
}
