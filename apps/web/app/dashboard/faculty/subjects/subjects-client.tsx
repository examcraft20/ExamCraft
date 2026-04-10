"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner, Card } from "@examcraft/ui";
import { SubjectsListClient } from "@/components/dashboard/faculty/subjects-list";
import { apiRequest } from "@/lib/api";
import { getSupabaseBrowserSession } from "@/lib/supabase-browser";
import { useInstitution } from "@/hooks/use-institution";

interface Question {
  id: string;
  title: string;
  subject: string;
  bloomLevel: string;
  difficulty: string;
  tags: string[];
  status: string;
  createdAt: string;
}

export function SubjectsPageClient() {
  const router = useRouter();
  const { institutionId, isLoading: isInstLoading } = useInstitution();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      if (isInstLoading) return;
      if (!institutionId) return;

      try {
        const session = await getSupabaseBrowserSession();
        if (!isMounted) return;

        if (!session?.access_token) {
          router.replace("/login");
          return;
        }

        const data = await apiRequest<Question[]>("/content/questions", {
          method: "GET",
          accessToken: session.access_token,
          institutionId
        });

        if (!isMounted) return;
        setQuestions(data);
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load subjects");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void loadData();
    return () => { isMounted = false; };
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

  return <SubjectsListClient initialQuestions={questions} institutionId={institutionId || ""} />;
}
