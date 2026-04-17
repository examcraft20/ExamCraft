"use client";

import { useEffect, useState } from "react";
import { 
  Globe, 
  Copy, 
  CheckCircle2, 
  Search, 
  Clock, 
  Award,
  Filter,
  ExternalLink
} from "lucide-react";
import { Button, Card, Input, Spinner, StatusMessage } from "@examcraft/ui";
import { apiRequest } from "#api";

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

type GlobalTemplateLibraryProps = {
  accessToken: string;
  institutionId: string;
  onCloned?: (newTemplate: any) => void;
};

export function GlobalTemplateLibrary({ accessToken, institutionId, onCloned }: GlobalTemplateLibraryProps) {
  const [templates, setTemplates] = useState<GlobalTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [cloningId, setCloningId] = useState<string|null>(null);

  useEffect(() => {
    async function loadGlobalTemplates() {
      try {
        const data = await apiRequest<GlobalTemplate[]>("/global-templates", {
          method: "GET",
          accessToken,
          institutionId
        });
        setTemplates(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load global library.");
      } finally {
        setIsLoading(false);
      }
    }
    loadGlobalTemplates();
  }, [accessToken, institutionId]);

  async function handleClone(templateId: string) {
    setCloningId(templateId);
    setError(null);
    try {
      const cloned = await apiRequest<any>(`/global-templates/${templateId}/clone`, {
        method: "POST",
        accessToken,
        institutionId
      });
      if (onCloned) onCloned(cloned);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to clone template.");
    } finally {
      setCloningId(null);
    }
  }

  const filtered = templates.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
  );

  if (isLoading) return <div className="flex justify-center p-8"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Globe className="text-blue-500" size={24} />
            Global Template Library
          </h2>
          <p className="text-slate-500 text-sm">Browse and import verified examination frameworks from across the platform.</p>
        </div>
        <div className="relative w-full md:w-64">
          <Input 
            placeholder="Search verified templates..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            leftIcon={<Search size={16} />}
          />
        </div>
      </div>

      {error && <StatusMessage variant="error">{error}</StatusMessage>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(t => (
          <Card key={t.id} className="group hover:border-blue-200 transition-all shadow-sm hover:shadow-md">
            <div className="flex justify-between items-start mb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {t.name}
                  </h3>
                  {t.isVerified && <CheckCircle2 size={16} className="text-blue-500" />}
                </div>
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{t.examType}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 py-3 border-y border-slate-50 mb-4">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                < Award size={16} className="text-amber-500" />
                <span>{t.totalMarks} Marks</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Clock size={16} className="text-indigo-500" />
                <span>{t.durationMinutes}m</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-6">
              {t.tags.map(tag => (
                <span key={tag} className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-medium">#{tag}</span>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Button 
                variant="primary" 
                className="flex-1 gap-2" 
                onClick={() => handleClone(t.id)}
                disabled={cloningId === t.id}
              >
                {cloningId === t.id ? <Spinner size="sm" /> : <><Copy size={14} /> Import Copy</>}
              </Button>
              <Button variant="secondary" className="p-2 aspect-square">
                <ExternalLink size={14} />
              </Button>
            </div>
          </Card>
        ))}
      </div>
      
      {filtered.length === 0 && (
        <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
          <Globe size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500 font-medium">No templates match your search.</p>
          <p className="text-slate-400 text-sm mt-1">Try different keywords or check out the featured templates.</p>
        </div>
      )}
    </div>
  );
}

