"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { QuestionForm } from '@/components/question-bank/question-editor';
import { apiRequest } from "@/lib/api";
import { getSupabaseBrowserSession } from "@/lib/supabase-browser";
import { Spinner, Card } from "@examcraft/ui";
import { useInstitution } from "@/hooks/use-institution";
import { toast } from "sonner";

export function NewQuestionPageClient() {
  const router = useRouter();
  const { institutionId, isLoading: isInstLoading } = useInstitution();

  const [subjects, setSubjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      if (isInstLoading) return;
      
      try {
        const session = await getSupabaseBrowserSession();
        if (!isMounted) return;

        if (!session?.access_token || !institutionId) {
          router.replace("/login");
          return;
        }

        // Fetch subjects
        const subjectsData = await apiRequest<any[]>("/academic/subjects", {
          method: "GET",
          accessToken: session.access_token,
          institutionId: institutionId,
        }).catch(() => []);

        if (isMounted) {
          setSubjects(subjectsData);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError("Access denied or data load failure");
        }
      }
    }

    void fetchData();
    return () => {
      isMounted = false;
    };
  }, [institutionId, isInstLoading, router]);

  const handleSubmit = async (formData: any) => {
    try {
      const session = await getSupabaseBrowserSession();
      if (!session?.access_token) {
        router.replace("/login");
        return;
      }

      await apiRequest("/questions", {
        method: "POST",
        accessToken: session.access_token,
        institutionId: institutionId!,
        body: JSON.stringify(formData)
      });

      toast.success("Question created successfully!");
      router.push(`/dashboard/faculty/questions?success=created`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create question");
      throw err;
    }
  };

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
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full pb-20 mt-4">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 font-medium">
        <button onClick={() => router.push(`/dashboard/faculty?institutionId=${institutionId}`)} className="hover:text-white transition-colors">Dashboard</button>
        <span>/</span>
        <button onClick={() => router.push(`/dashboard/faculty/questions?institutionId=${institutionId}`)} className="hover:text-white transition-colors">Question Bank</button>
        <span>/</span>
        <span className="text-white">Create Question</span>
      </nav>

      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">
          Create Question
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Add a new question to your question bank
        </p>
      </div>

      <QuestionForm
        onSubmit={handleSubmit}
        subjects={subjects}
      />
    </div>
  );
}

