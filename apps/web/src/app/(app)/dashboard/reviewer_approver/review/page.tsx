"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Spinner, Card } from "@examcraft/ui";
import { ReviewQueueClient } from '@/components/approvals/review-queue';
import { apiRequest } from "@/lib/api";
import { getSupabaseBrowserSession } from "@/lib/supabase-browser";

interface Paper {
  id: string;
  title: string;
  status: string;
  createdAt: string;
}

export default function ReviewQueuePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const institutionId = searchParams.get("institutionId") ?? "";

  const [papers, setPapers] = useState<Paper[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const session = await getSupabaseBrowserSession();
        if (!isMounted) return;

        if (!session?.access_token) {
          router.replace("/login");
          return;
        }

        if (!institutionId || institutionId === "null") {
          router.replace("/dashboard");
          return;
        }

        const data = await apiRequest<Paper[]>("/papers", {
          method: "GET",
          accessToken: session.access_token,
          institutionId
        });

        if (!isMounted) return;

        // Filter only those awaiting review
        setPapers(data.filter(p => p.status === "submitted" || p.status === "in_review"));
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load review queue");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void loadData();
    return () => {
      isMounted = false;
    };
  }, [institutionId, router]);

  if (isLoading) {
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

  return <ReviewQueueClient initialPapers={papers} institutionId={institutionId} />;
}
