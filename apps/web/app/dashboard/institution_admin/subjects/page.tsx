"use client";

import { useEffect, useState } from "react";
import { BookOpen, RefreshCw, Layers, BookMarked } from "lucide-react";
import { apiRequest } from "#api";
import { Spinner } from "@examcraft/ui";
import type {
  DepartmentRecord,
  CourseRecord,
  SubjectRecord,
} from "../../../../lib/academic";

import { useAdminContext } from "../../../../hooks/use-admin-context";

export default function SubjectsPage() {
  const { accessToken, institutionId, isReady } = useAdminContext();

  const [departments, setDepartments] = useState<DepartmentRecord[]>([]);
  const [courses, setCourses] = useState<CourseRecord[]>([]);
  const [subjects, setSubjects] = useState<SubjectRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState<
    "departments" | "courses" | "subjects"
  >("departments");

  // Create forms
  const [creating, setCreating] = useState<
    "dept" | "course" | "subject" | null
  >(null);
  const [deptForm, setDeptForm] = useState({ name: "", code: "" });
  const [courseForm, setCourseForm] = useState({
    name: "",
    code: "",
    departmentId: "",
  });
  const [subjectForm, setSubjectForm] = useState({
    name: "",
    code: "",
    departmentId: "",
    courseId: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const load = (token: string, instId: string) => {
    setIsLoading(true);
    Promise.all([
      apiRequest<{ departments: DepartmentRecord[] }>("/academic/departments", {
        method: "GET",
        accessToken: token,
        institutionId: instId,
      }),
      apiRequest<{ courses: CourseRecord[] }>("/academic/courses", {
        method: "GET",
        accessToken: token,
        institutionId: instId,
      }),
      apiRequest<{ subjects: SubjectRecord[] }>("/academic/subjects", {
        method: "GET",
        accessToken: token,
        institutionId: instId,
      }),
    ])
      .then(([d, c, s]) => {
        setDepartments(d?.departments || []);
        setCourses(c?.courses || []);
        setSubjects(s?.subjects || []);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    if (!isReady) return;
    if (!accessToken || !institutionId) {
      setIsLoading(false);
      return;
    }
    load(accessToken, institutionId);
  }, [accessToken, institutionId, isReady]);

  const createDept = async () => {
    if (!accessToken || !institutionId || !deptForm.name) return;
    setIsSaving(true);
    try {
      const res = await apiRequest<DepartmentRecord>("/academic/departments", {
        method: "POST",
        accessToken,
        institutionId,
        body: JSON.stringify({
          name: deptForm.name,
          code: deptForm.code || null,
        }),
      });
      setDepartments((prev) => [...prev, res]);
      setDeptForm({ name: "", code: "" });
      setCreating(null);
      setStatusMsg("Department created.");
    } catch (e) {
      setStatusMsg(e instanceof Error ? e.message : "Failed.");
    } finally {
      setIsSaving(false);
    }
  };

  const createCourse = async () => {
    if (
      !accessToken ||
      !institutionId ||
      !courseForm.name ||
      !courseForm.departmentId
    )
      return;
    setIsSaving(true);
    try {
      const res = await apiRequest<CourseRecord>("/academic/courses", {
        method: "POST",
        accessToken,
        institutionId,
        body: JSON.stringify({
          name: courseForm.name,
          code: courseForm.code || null,
          departmentId: courseForm.departmentId,
        }),
      });
      setCourses((prev) => [...prev, res]);
      setCourseForm({ name: "", code: "", departmentId: "" });
      setCreating(null);
      setStatusMsg("Course created.");
    } catch (e) {
      setStatusMsg(e instanceof Error ? e.message : "Failed.");
    } finally {
      setIsSaving(false);
    }
  };

  const createSubject = async () => {
    if (
      !accessToken ||
      !institutionId ||
      !subjectForm.name ||
      !subjectForm.courseId
    )
      return;
    setIsSaving(true);
    try {
      const res = await apiRequest<SubjectRecord>("/academic/subjects", {
        method: "POST",
        accessToken,
        institutionId,
        body: JSON.stringify({
          name: subjectForm.name,
          code: subjectForm.code || null,
          departmentId: subjectForm.departmentId || null,
          courseId: subjectForm.courseId,
        }),
      });
      setSubjects((prev) => [...prev, res]);
      setSubjectForm({ name: "", code: "", departmentId: "", courseId: "" });
      setCreating(null);
      setStatusMsg("Subject created.");
    } catch (e) {
      setStatusMsg(e instanceof Error ? e.message : "Failed.");
    } finally {
      setIsSaving(false);
    }
  };

  const VIEWS = [
    {
      id: "departments",
      label: "Departments",
      icon: Layers,
      count: departments.length,
    },
    {
      id: "courses",
      label: "Courses / Programs",
      icon: BookMarked,
      count: courses.length,
    },
    {
      id: "subjects",
      label: "Subjects",
      icon: BookOpen,
      count: subjects.length,
    },
  ] as const;

  if (!accessToken)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" className="w-12 h-12" />
      </div>
    );

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
            <BookOpen size={20} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">
              Subjects
            </h1>
            <p className="text-[#8b9bb4] text-sm font-medium">
              Manage departments, courses, and subjects for your institution
            </p>
          </div>
        </div>
        <button
          onClick={() =>
            accessToken && institutionId && load(accessToken, institutionId)
          }
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1e293b] border border-white/10 text-sm font-bold text-[#8b9bb4] hover:text-white transition-all"
        >
          <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />{" "}
          Refresh
        </button>
      </div>

      {/* Status */}
      {statusMsg && (
        <div className="px-5 py-3 rounded-xl text-sm font-medium bg-green-500/10 border border-green-500/20 text-green-400">
          ✅ {statusMsg}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        {VIEWS.map((v) => (
          <button
            key={v.id}
            onClick={() => setActiveView(v.id as any)}
            className={`rounded-2xl p-6 flex items-center gap-4 border transition-all text-left ${activeView === v.id ? "bg-indigo-500/10 border-indigo-500/30" : "bg-[#1e293b] border-white/5 hover:border-white/10"}`}
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${activeView === v.id ? "bg-indigo-500/20 text-indigo-400" : "bg-white/5 text-[#8b9bb4]"}`}
            >
              <v.icon size={22} />
            </div>
            <div>
              <p className="text-2xl font-black text-white">{v.count}</p>
              <p className="text-xs text-[#8b9bb4] font-bold uppercase tracking-widest mt-0.5">
                {v.label}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Add Button */}
      <div className="flex justify-end">
        <button
          onClick={() =>
            setCreating(
              activeView === "departments"
                ? "dept"
                : activeView === "courses"
                  ? "course"
                  : "subject",
            )
          }
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black text-sm font-black hover:scale-105 transition-all shadow-lg"
        >
          <Plus size={16} /> Add{" "}
          {activeView === "departments"
            ? "Department"
            : activeView === "courses"
              ? "Course"
              : "Subject"}
        </button>
      </div>

      {/* Create Forms */}
      {creating === "dept" && (
        <div className="bg-[#1e293b] border border-indigo-500/20 rounded-2xl p-6 flex flex-col gap-4 animate-in fade-in slide-in-from-top-2">
          <h3 className="text-sm font-black text-white uppercase tracking-widest">
            New Department
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <input
              value={deptForm.name}
              onChange={(e) =>
                setDeptForm({ ...deptForm, name: e.target.value })
              }
              placeholder="Department name *"
              className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#8b9bb4] focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <input
              value={deptForm.code}
              onChange={(e) =>
                setDeptForm({ ...deptForm, code: e.target.value })
              }
              placeholder="Code (e.g. CS)"
              className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#8b9bb4] focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setCreating(null)}
              className="px-4 py-2 rounded-xl text-sm font-bold text-[#8b9bb4] hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={createDept}
              disabled={isSaving || !deptForm.name}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-500 transition-all disabled:opacity-50"
            >
              {isSaving ? <Spinner size="sm" /> : null} Create
            </button>
          </div>
        </div>
      )}

      {creating === "course" && (
        <div className="bg-[#1e293b] border border-indigo-500/20 rounded-2xl p-6 flex flex-col gap-4 animate-in fade-in slide-in-from-top-2">
          <h3 className="text-sm font-black text-white uppercase tracking-widest">
            New Course / Program
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <select
              value={courseForm.departmentId}
              onChange={(e) =>
                setCourseForm({ ...courseForm, departmentId: e.target.value })
              }
              className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">Select Department *</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <input
              value={courseForm.name}
              onChange={(e) =>
                setCourseForm({ ...courseForm, name: e.target.value })
              }
              placeholder="Course name *"
              className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#8b9bb4] focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <input
              value={courseForm.code}
              onChange={(e) =>
                setCourseForm({ ...courseForm, code: e.target.value })
              }
              placeholder="Code (e.g. BSC)"
              className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#8b9bb4] focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setCreating(null)}
              className="px-4 py-2 rounded-xl text-sm font-bold text-[#8b9bb4] hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={createCourse}
              disabled={
                isSaving || !courseForm.name || !courseForm.departmentId
              }
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-500 transition-all disabled:opacity-50"
            >
              {isSaving ? <Spinner size="sm" /> : null} Create
            </button>
          </div>
        </div>
      )}

      {creating === "subject" && (
        <div className="bg-[#1e293b] border border-indigo-500/20 rounded-2xl p-6 flex flex-col gap-4 animate-in fade-in slide-in-from-top-2">
          <h3 className="text-sm font-black text-white uppercase tracking-widest">
            New Subject
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <select
              value={subjectForm.departmentId}
              onChange={(e) => {
                setCourseForm({ ...courseForm, departmentId: e.target.value });
                setSubjectForm({
                  ...subjectForm,
                  departmentId: e.target.value,
                  courseId: "",
                });
              }}
              className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">Select Department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <select
              value={subjectForm.courseId}
              onChange={(e) =>
                setSubjectForm({ ...subjectForm, courseId: e.target.value })
              }
              className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">Select Course *</option>
              {courses
                .filter(
                  (c) =>
                    !subjectForm.departmentId ||
                    c.department_id === subjectForm.departmentId,
                )
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
            <input
              value={subjectForm.name}
              onChange={(e) =>
                setSubjectForm({ ...subjectForm, name: e.target.value })
              }
              placeholder="Subject name *"
              className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#8b9bb4] focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <input
              value={subjectForm.code}
              onChange={(e) =>
                setSubjectForm({ ...subjectForm, code: e.target.value })
              }
              placeholder="Code (e.g. CS101)"
              className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#8b9bb4] focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setCreating(null)}
              className="px-4 py-2 rounded-xl text-sm font-bold text-[#8b9bb4] hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={createSubject}
              disabled={isSaving || !subjectForm.name || !subjectForm.courseId}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-500 transition-all disabled:opacity-50"
            >
              {isSaving ? <Spinner size="sm" /> : null} Create
            </button>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="rounded-2xl bg-[#1e293b] border border-white/5 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center p-20">
            <Spinner />
          </div>
        ) : activeView === "departments" ? (
          <table className="w-full text-left text-sm">
            <thead className="bg-[#2D3748] text-[10px] uppercase font-black tracking-widest text-[#8b9bb4]">
              <tr>
                <th className="px-6 py-4">#</th>
                <th className="px-6 py-4">Department Name</th>
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Courses</th>
                <th className="px-6 py-4">Subjects</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {departments.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-[#8b9bb4]"
                  >
                    No departments yet. Add one above.
                  </td>
                </tr>
              ) : (
                departments.map((d, i) => (
                  <tr
                    key={d.id}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-6 py-4 text-xs text-[#8b9bb4]">
                      {i + 1}
                    </td>
                    <td className="px-6 py-4 font-bold text-white">{d.name}</td>
                    <td className="px-6 py-4 text-xs font-mono text-indigo-400">
                      {d.code || "—"}
                    </td>
                    <td className="px-6 py-4 text-xs text-[#cbd5e1]">
                      {courses.filter((c) => c.department_id === d.id).length}
                    </td>
                    <td className="px-6 py-4 text-xs text-[#cbd5e1]">
                      {subjects.filter((s) => s.department_id === d.id).length}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full border capitalize ${d.status === "active" ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-[#2D3748] text-[#8b9bb4] border-white/10"}`}
                      >
                        {d.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : activeView === "courses" ? (
          <table className="w-full text-left text-sm">
            <thead className="bg-[#2D3748] text-[10px] uppercase font-black tracking-widest text-[#8b9bb4]">
              <tr>
                <th className="px-6 py-4">#</th>
                <th className="px-6 py-4">Course Name</th>
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Subjects</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {courses.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-[#8b9bb4]"
                  >
                    No courses yet. Add one above.
                  </td>
                </tr>
              ) : (
                courses.map((c, i) => (
                  <tr
                    key={c.id}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-6 py-4 text-xs text-[#8b9bb4]">
                      {i + 1}
                    </td>
                    <td className="px-6 py-4 font-bold text-white">{c.name}</td>
                    <td className="px-6 py-4 text-xs font-mono text-indigo-400">
                      {c.code || "—"}
                    </td>
                    <td className="px-6 py-4 text-xs text-[#cbd5e1]">
                      {departments.find((d) => d.id === c.department_id)
                        ?.name || "—"}
                    </td>
                    <td className="px-6 py-4 text-xs text-[#cbd5e1]">
                      {subjects.filter((s) => s.course_id === c.id).length}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full border capitalize ${c.status === "active" ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-[#2D3748] text-[#8b9bb4] border-white/10"}`}
                      >
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-[#2D3748] text-[10px] uppercase font-black tracking-widest text-[#8b9bb4]">
              <tr>
                <th className="px-6 py-4">#</th>
                <th className="px-6 py-4">Subject Name</th>
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Course</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {subjects.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-[#8b9bb4]"
                  >
                    No subjects yet. Add one above.
                  </td>
                </tr>
              ) : (
                subjects.map((s, i) => (
                  <tr
                    key={s.id}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-6 py-4 text-xs text-[#8b9bb4]">
                      {i + 1}
                    </td>
                    <td className="px-6 py-4 font-bold text-white">{s.name}</td>
                    <td className="px-6 py-4 text-xs font-mono text-indigo-400">
                      {s.code || "—"}
                    </td>
                    <td className="px-6 py-4 text-xs text-[#cbd5e1]">
                      {courses.find((c) => c.id === s.course_id)?.name || "—"}
                    </td>
                    <td className="px-6 py-4 text-xs text-[#cbd5e1]">
                      {departments.find((d) => d.id === s.department_id)
                        ?.name || "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full border capitalize ${s.status === "active" ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-[#2D3748] text-[#8b9bb4] border-white/10"}`}
                      >
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
