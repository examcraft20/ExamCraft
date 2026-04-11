"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, LayoutTemplate, Plus } from "lucide-react";
import { TemplateListClient } from '@/components/templates/list';
import { apiRequest } from "@/lib/api";
import { getSupabaseBrowserSession } from "@/lib/supabase-browser";
import { useInstitution } from "@/hooks/use-institution";

interface Template {
  id: string;
  name: string;
  examType: string;
  durationMinutes: number;
  totalMarks: number;
  status: string;
  createdAt: string;
}

export function TemplatesPageClient() {
  const router = useRouter();
  const { institutionId, isLoading: isInstLoading } = useInstitution();

  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      // Wait for institution hook to finish loading first
      if (isInstLoading) return;

      // If institution resolved but is null, stop loading with an error
      if (!institutionId) {
        if (isMounted) {
          setError("No institution found. Please complete onboarding first.");
          setIsLoading(false);
        }
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const session = await getSupabaseBrowserSession();
        if (!isMounted) return;

        if (!session?.access_token) {
          router.replace("/login");
          return;
        }

        const templatesData = await apiRequest<Template[]>("/templates", {
          method: "GET",
          accessToken: session.access_token,
          institutionId
        });

        if (!isMounted) return;

        setTemplates(templatesData ?? []);
      } catch (err) {
        console.error("Failed to fetch templates:", err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load templates. Please try again.");
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

  // Skeleton loading state (replaces the plain spinner)
  if (isInstLoading || isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="h-8 w-48 bg-white/10 rounded-lg animate-pulse mb-2" />
            <div className="h-4 w-72 bg-white/5 rounded animate-pulse" />
          </div>
          <div className="h-10 w-36 bg-white/10 rounded-xl animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white/5 border border-white/10 rounded-2xl p-5 animate-pulse"
            >
              <div className="h-5 w-3/4 bg-white/10 rounded mb-3" />
              <div className="h-4 w-1/2 bg-white/5 rounded mb-4" />
              <div className="h-16 bg-white/5 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-64">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center max-w-md">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-4" />
          <h3 className="text-white font-semibold mb-2">
            Failed to load templates
          </h3>
          <p className="text-slate-400 text-sm mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty state (no templates yet)
  if (templates.length === 0) {
    return (
      <div className="p-6">
        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Paper Templates</h1>
            <p className="text-slate-400 text-sm mt-1">
              Reusable blueprints for exam paper generation
            </p>
          </div>
          <Link href="/templates/new">
            <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" />
              New Template
            </button>
          </Link>
        </div>
        {/* Empty state */}
        <div className="flex flex-col items-center justify-center min-h-64 text-center">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-10 max-w-md">
            <LayoutTemplate className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
            <h3 className="text-white font-semibold text-lg mb-2">
              No templates yet
            </h3>
            <p className="text-slate-400 text-sm mb-6">
              Create your first paper template to start generating exams
            </p>
            <Link href="/templates/new">
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors">
                Create Template
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <TemplateListClient initialTemplates={templates} institutionId={institutionId || ""} />;
}

