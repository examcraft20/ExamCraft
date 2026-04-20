"use client";

import { useEffect, useState } from "react";
import { BookOpen, GraduationCap, Hash, ChevronRight } from "lucide-react";
import { useInstitution } from "@/hooks/use-institution";
import { getSupabaseBrowserSession } from "@/lib/supabase-browser";
import { apiRequest } from "@/lib/api";
import { Card, Spinner } from "@examcraft/ui";
import Link from "next/link";

interface Subject {
  id: string;
  name: string;
  code: string;
  courseName?: string;
  departmentName?: string;
}

export default function FacultySubjectsPage() {
  const { institutionId, isLoading: instLoading } = useInstitution();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function loadSubjects() {
      if (instLoading || !institutionId) return;
      try {
        const session = await getSupabaseBrowserSession();
        if (!session?.access_token || !mounted) return;

        const data = await apiRequest<any[]>("/academic/subjects", {
          method: "GET",
          accessToken: session.access_token,
          institutionId,
        });

        if (mounted) {
          setSubjects(data || []);
          setIsLoading(false);
        }
      } catch (err: any) {
        console.error("Failed to load subjects:", err);
        if (mounted) {
          setError(err?.message || "Failed to load subjects");
          setIsLoading(false);
        }
      }
    }

    void loadSubjects();
    return () => { mounted = false; };
  }, [institutionId, instLoading]);

  if (isLoading || instLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" className="w-12 h-12" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-10 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
            <BookOpen size={20} className="text-violet-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">My Subjects</h1>
            <p className="text-[#8b9bb4] text-sm font-medium">
              Subjects assigned to your department
            </p>
          </div>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="px-5 py-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 text-sm font-medium">
          ❌ {error}
        </div>
      )}

      {/* Subjects Grid */}
      {subjects.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((subject) => (
            <Card
              key={subject.id}
              className="!bg-[#1e293b]/80 border-white/5 !rounded-2xl p-6 hover:border-violet-500/30 transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 blur-[40px] -z-10 group-hover:bg-violet-500/10 transition-all" />
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-lg font-bold text-white leading-tight">
                      {subject.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Hash size={12} className="text-violet-400" />
                      <span className="text-xs font-mono font-bold text-violet-400">
                        {subject.code}
                      </span>
                    </div>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                    <GraduationCap size={16} className="text-violet-400" />
                  </div>
                </div>

                {(subject.courseName || subject.departmentName) && (
                  <div className="pt-3 border-t border-white/5 flex flex-col gap-1">
                    {subject.departmentName && (
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#8b9bb4]">
                        {subject.departmentName}
                      </span>
                    )}
                    {subject.courseName && (
                      <span className="text-xs text-[#8b9bb4]">{subject.courseName}</span>
                    )}
                  </div>
                )}

                <Link
                  href={`/dashboard/faculty/questions?institutionId=${institutionId}&subjectId=${subject.id}`}
                  className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-violet-500/10 hover:bg-violet-500/20 transition-all group/link"
                >
                  <span className="text-xs font-bold text-violet-300">View Questions</span>
                  <ChevronRight
                    size={14}
                    className="text-violet-400 group-hover/link:translate-x-1 transition-transform"
                  />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="p-16 rounded-2xl bg-[#1e293b]/50 border border-white/5 border-dashed flex flex-col items-center justify-center text-center gap-4">
          <BookOpen size={48} className="text-slate-700" />
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-bold text-white">No Subjects Found</h3>
            <p className="text-sm text-[#8b9bb4] max-w-sm">
              Subjects are managed by your institution admin. They will appear here once the
              academic structure is configured.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
