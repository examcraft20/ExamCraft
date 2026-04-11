"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { QuestionForm } from '@/components/question-bank/question-editor';
import { apiRequest } from "@/lib/api";
import { getSupabaseBrowserSession } from "@/lib/supabase-browser";
import { Spinner, Card } from "@examcraft/ui";
import { useInstitution } from "@/hooks/use-institution";

interface Question {
  id: string;
  title: string;
  subject: string;
  bloomLevel: string;
  difficulty: string;
  tags: string[];
  courseOutcomes?: string[];
  unitNumber?: number | null;
  status: string;
  createdAt: string;
}

export function EditQuestionPageClient({ id }: { id: string }) {
  const router = useRouter();
  const { institutionId, isLoading: isInstLoading } = useInstitution();

  const [question, setQuestion] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadQuestion() {
      if (isInstLoading) return;
      if (!institutionId || !id) return;

      try {
        const session = await getSupabaseBrowserSession();
        if (!isMounted) return;

        if (!session?.access_token) {
          router.replace("/login");
          return;
        }

        const data = await apiRequest<Question>(
          `/questions/${id}`,
          {
            method: "GET",
            accessToken: session.access_token,
            institutionId
          }
        );

        if (isMounted) {
          setQuestion(data);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load question");
          setIsLoading(false);
        }
      }
    }

    void loadQuestion();
    return () => {
      isMounted = false;
    };
  }, [id, institutionId, isInstLoading, router]);

  const handleSubmit = async (formData: any) => {
    try {
      const session = await getSupabaseBrowserSession();
      if (!session?.access_token) {
        router.replace("/login");
        return;
      }

      await apiRequest(`/questions/${id}`, {
        method: "PATCH",
        accessToken: session.access_token,
        institutionId: institutionId!,
        body: JSON.stringify(formData)
      });

      router.push(`/questions?success=updated`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update question");
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
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-all"
        >
          Retry
        </button>
      </Card>
    );
  }

  if (!question) {
    return (
      <Card className="!bg-zinc-900 border-white/5 !rounded-[2.5rem] p-12 flex flex-col items-center gap-4">
        <p className="text-center text-slate-400 font-medium">
          Question not found
        </p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">
          Edit Question
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Make changes to your question
        </p>
      </div>

      <QuestionForm
        initialData={{
          id: question.id,
          title: question.title,
          questionType: "subjective",
          questionBody: "",
          difficulty: question.difficulty,
          bloomLevel: question.bloomLevel,
          unitNumber: question.unitNumber || null,
          courseOutcomes: question.courseOutcomes || [],
          tags: question.tags || []
        }}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
