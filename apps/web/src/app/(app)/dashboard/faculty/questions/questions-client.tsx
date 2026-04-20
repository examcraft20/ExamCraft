"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner, Card } from "@examcraft/ui";
import { QuestionListClient } from '@/components/question-bank/question-list';
import { apiRequest } from "@/lib/api";
import { getSupabaseBrowserSession } from "@/lib/supabase-browser";
import { useInstitution } from "@/hooks/use-institution";
import type { DepartmentRecord, SubjectRecord } from "@/lib/academic";

interface Question {
  id: string;
  title: string;
  subject: string;
  bloomLevel: string;
  difficulty: string;
  tags: string[];
  unitNumber?: number | null;
  departmentId?: string | null;
  courseId?: string | null;
  marks?: number;
  courseOutcomes?: string[];
  status: string;
  createdAt: string;
}

export function QuestionsPageClient() {
  const router = useRouter();
  const { institutionId, isLoading: isInstLoading } = useInstitution();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [subjects, setSubjects] = useState<SubjectRecord[]>([]);
  const [departments, setDepartments] = useState<DepartmentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | undefined>();

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      // Wait for institution ID to be available
      if (isInstLoading) return;
      if (!institutionId) {
        if (isMounted) setIsLoading(false);
        return;
      }

      try {
        const session = await getSupabaseBrowserSession();
        if (!isMounted) return;

        if (!session?.access_token) {
          router.replace("/login");
          return;
        }

        setAccessToken(session.access_token);

        // Fetch questions, subjects, and departments in parallel
        const [questionsData, subjectsData, departmentsData] = await Promise.all([
          apiRequest<Question[]>("/questions", {
            method: "GET",
            accessToken: session.access_token,
            institutionId: institutionId
          }).catch(() => []),
          apiRequest<{ subjects: SubjectRecord[] }>("/academic/subjects", {
            method: "GET",
            accessToken: session.access_token,
            institutionId: institutionId
          }).catch(() => ({ subjects: [] })),
          apiRequest<{ departments: DepartmentRecord[] }>("/academic/departments", {
            method: "GET",
            accessToken: session.access_token,
            institutionId: institutionId
          }).catch(() => ({ departments: [] }))
        ]);

        if (!isMounted) return;

        setQuestions(questionsData);
        setSubjects(subjectsData?.subjects || []);
        setDepartments(departmentsData?.departments || []);
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load questions");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void loadData();
    return () => {
      isMounted = false;
    };
  }, [institutionId, isInstLoading, router]);

  if (isInstLoading || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="!bg-zinc-900 border-white/5 !rounded-[2.5rem] p-12 flex flex-col items-center gap-4">
        <p className="text-center text-slate-400 font-medium">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-all"
        >
          Retry
        </button>
      </Card>
    );
  }

  return (
    <QuestionListClient
      initialQuestions={questions}
      subjects={subjects}
      departments={departments}
      institutionId={institutionId as string}
      accessToken={accessToken}
    />
  );
}
