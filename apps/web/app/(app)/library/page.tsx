"use client";

import { useEffect, useState } from "react";
import {
  Globe,
  Copy,
  CheckCircle2,
  Search,
  Clock,
  Award,
  ExternalLink,
} from "lucide-react";
import { Button, Card, Input, Spinner, StatusMessage } from "@examcraft/ui";
import { apiRequest } from "#api";
import { getSupabaseBrowserSession } from "@/lib/supabase-browser";
import { useInstitution } from "@/hooks/use-institution";
import Link from "next/link";

type GlobalTemplate = {
  id: string;
  name: string;
  examType: string;
  totalMarks: number;
  durationMinutes: number;
  sections: any[];
  tags: string[];
  isVerified: boolean;
};

export default function LibraryPage() {
  const { institutionId } = useInstitution();
  const [templates, setTemplates] = useState<GlobalTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [cloningId, setCloningId] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function init() {
      const session = await getSupabaseBrowserSession();
      if (!isMounted) return;
      if (!session?.access_token) return;
      setAccessToken(session.access_token);
    }
    init();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (!accessToken || !institutionId) return;
    let isMounted = true;
    async function loadGlobalTemplates() {
      try {
        const data = await apiRequest<GlobalTemplate[]>("/global-templates", {
          method: "GET",
          accessToken: accessToken!,
          institutionId: institutionId!,
        });
        if (isMounted) setTemplates(data);
      } catch (err) {
        if (isMounted) setError(err instanceof Error ? err.message : "Failed to load global library.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadGlobalTemplates();
    return () => { isMounted = false; };
  }, [accessToken, institutionId]);

  async function handleClone(templateId: string) {
    if (!accessToken || !institutionId) return;
    setCloningId(templateId);
    setError(null);
    try {
      await apiRequest<any>(`/global-templates/${templateId}/clone`, {
        method: "POST",
        accessToken,
        institutionId,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to clone template.");
    } finally {
      setCloningId(null);
    }
  }

  const filtered = templates.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Globe size={20} />
            </div>
            Global Template Library
          </h1>
          <p className="text-[#8b9bb4] text-sm font-medium mt-2">
            Browse and import verified examination frameworks from across the platform.
          </p>
        </div>
        <div className="relative w-full md:w-72">
          <Input
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search size={16} />}
          />
        </div>
      </div>

      {error && <StatusMessage variant="error">{error}</StatusMessage>}

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((t) => (
          <div
            key={t.id}
            className="group bg-[#1e293b] border border-white/5 rounded-2xl p-6 hover:border-indigo-500/30 transition-all"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-white group-hover:text-indigo-400 transition-colors">
                    {t.name}
                  </h3>
                  {t.isVerified && (
                    <CheckCircle2 size={16} className="text-blue-400" />
                  )}
                </div>
                <span className="text-[10px] font-bold text-[#8b9bb4] uppercase tracking-widest">
                  {t.examType}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 py-3 border-y border-white/5 mb-4">
              <div className="flex items-center gap-2 text-sm text-[#cbd5e1]">
                <Award size={16} className="text-amber-400" />
                <span>{t.totalMarks} Marks</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#cbd5e1]">
                <Clock size={16} className="text-indigo-400" />
                <span>{t.durationMinutes}m</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-6">
              {t.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-full bg-white/5 text-[#8b9bb4] text-[10px] font-medium border border-white/5"
                >
                  #{tag}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-sm font-bold text-indigo-400 hover:bg-indigo-500/30 transition-all disabled:opacity-50"
                onClick={() => handleClone(t.id)}
                disabled={cloningId === t.id}
              >
                {cloningId === t.id ? (
                  <Spinner size="sm" />
                ) : (
                  <>
                    <Copy size={14} /> Import Copy
                  </>
                )}
              </button>
              <Link
                href={`/library/${t.id}`}
                className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-[#8b9bb4] hover:text-white hover:border-white/10 transition-all"
              >
                <ExternalLink size={14} />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 bg-[#1e293b] rounded-2xl border-2 border-dashed border-white/10">
          <Globe size={48} className="mx-auto text-[#8b9bb4] mb-4" />
          <p className="text-[#8b9bb4] font-medium">No templates match your search.</p>
          <p className="text-[#8b9bb4]/60 text-sm mt-1">
            Try different keywords or check out the featured templates.
          </p>
        </div>
      )}
    </div>
  );
}

