import { useState, useCallback, useEffect } from "react";
import { apiRequest } from "#api";
import type { 
  InstitutionDashboardSummaryResponse, 
  QuestionRecord, 
  TemplateRecord, 
  PaperRecord 
} from "../lib/dashboard";

type ReviewAction = "approve" | "reject" | "comment";

export function useReviewWorkflow(accessToken: string, institutionId: string) {
  const [summary, setSummary] = useState<InstitutionDashboardSummaryResponse | null>(null);
  const [questions, setQuestions] = useState<QuestionRecord[]>([]);
  const [templates, setTemplates] = useState<TemplateRecord[]>([]);
  const [papers, setPapers] = useState<PaperRecord[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeActionKey, setActiveActionKey] = useState<string | null>(null);

  const loadWorkspace = useCallback(async () => {
    setIsLoading(true);
    setStatus(null);
    try {
      const [summaryRes, questionsRes, templatesRes, papersRes] = await Promise.all([
        apiRequest<InstitutionDashboardSummaryResponse>("/tenant/dashboard-summary", { method: "GET", accessToken, institutionId }),
        apiRequest<QuestionRecord[]>("/content/questions", { method: "GET", accessToken, institutionId }),
        apiRequest<TemplateRecord[]>("/content/templates", { method: "GET", accessToken, institutionId }),
        apiRequest<PaperRecord[]>("/content/papers", { method: "GET", accessToken, institutionId })
      ]);
      setSummary(summaryRes);
      setQuestions(questionsRes);
      setTemplates(templatesRes);
      setPapers(papersRes);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to synchronize workflow data.");
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, institutionId]);

  useEffect(() => {
    void loadWorkspace();
  }, [loadWorkspace]);

  const handleReview = async (
    kind: "question" | "template" | "paper", 
    id: string, 
    action: ReviewAction, 
    comment?: string
  ) => {
    const actionKey = `${kind}:${id}:${action}`;
    setActiveActionKey(actionKey);
    setStatus(null);
    try {
      const endpoint = kind === "question" ? `/content/questions/${id}/review` : kind === "template" ? `/content/templates/${id}/review` : `/content/papers/${id}/review`;
      const response = await apiRequest<any>(endpoint, {
        method: "PATCH",
        accessToken,
        institutionId,
        body: JSON.stringify({ action, comment })
      });

      if (kind === "question") {
        setQuestions(prev => prev.map(q => q.id === id ? response : q));
      } else if (kind === "template") {
        setTemplates(prev => prev.map(t => t.id === id ? response : t));
      } else {
        setPapers(prev => prev.map(p => p.id === id ? response : p));
      }
      setStatus(`Asset synchronized as ${response.status}.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Quality assurance transmission failed.");
    } finally {
      setActiveActionKey(null);
    }
  };

  return {
    summary,
    questions,
    templates,
    papers,
    status,
    isLoading,
    activeActionKey,
    handleReview,
    refresh: loadWorkspace,
    setQuestions,
    setTemplates,
    setPapers,
    setStatus
  };
}
