"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, MessageSquareMore, RotateCcw, Search } from "lucide-react";
import { Button, Input, Spinner, StatusMessage } from "@examcraft/ui";
import { apiRequest } from "../../lib/api";
import type { InstitutionDashboardSummaryResponse, QuestionRecord, TemplateRecord } from "../../lib/dashboard";

type ReviewerWorkspaceProps = {
  accessToken: string;
  institutionId: string;
};

type ReviewAction = "approve" | "reject" | "comment";

export function ReviewerWorkspace({ accessToken, institutionId }: ReviewerWorkspaceProps) {
  const [summary, setSummary] = useState<InstitutionDashboardSummaryResponse | null>(null);
  const [questions, setQuestions] = useState<QuestionRecord[]>([]);
  const [templates, setTemplates] = useState<TemplateRecord[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [activeActionKey, setActiveActionKey] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadWorkspace() {
      try {
        const [summaryResponse, questionResponse, templateResponse] = await Promise.all([
          apiRequest<InstitutionDashboardSummaryResponse>("/tenant/dashboard-summary", {
            method: "GET",
            accessToken,
            institutionId
          }),
          apiRequest<QuestionRecord[]>("/content/questions", {
            method: "GET",
            accessToken,
            institutionId
          }),
          apiRequest<TemplateRecord[]>("/content/templates", {
            method: "GET",
            accessToken,
            institutionId
          })
        ]);

        if (isMounted) {
          setSummary(summaryResponse);
          setQuestions(questionResponse);
          setTemplates(templateResponse);
        }
      } catch (error) {
        if (isMounted) {
          setStatus(error instanceof Error ? error.message : "Unable to load reviewer workspace.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadWorkspace();

    return () => {
      isMounted = false;
    };
  }, [accessToken, institutionId]);

  const reviewQueue = useMemo(() => {
    const items = [
      ...questions.map((question) => ({
        id: question.id,
        kind: "question" as const,
        title: question.title,
        subtitle: `${question.subject} | ${question.bloomLevel} | ${question.difficulty}`,
        status: question.status,
        reviewComment: question.reviewComment ?? null
      })),
      ...templates.map((template) => ({
        id: template.id,
        kind: "template" as const,
        title: template.name,
        subtitle: `${template.examType} | ${template.durationMinutes} min | ${template.totalMarks} marks`,
        status: template.status,
        reviewComment: template.reviewComment ?? null
      }))
    ];

    const filteredByStatus = items.filter((item) => item.status === "draft" || item.reviewComment);
    const needle = searchValue.trim().toLowerCase();

    if (!needle) {
      return filteredByStatus;
    }

    return filteredByStatus.filter((item) =>
      [item.title, item.subtitle, item.status].join(" ").toLowerCase().includes(needle)
    );
  }, [questions, searchValue, templates]);

  async function handleReview(item: (typeof reviewQueue)[number], action: ReviewAction) {
    const actionKey = `${item.kind}:${item.id}:${action}`;
    setActiveActionKey(actionKey);
    setStatus(null);

    try {
      if (item.kind === "question") {
        const updatedQuestion = await apiRequest<QuestionRecord>(`/content/questions/${item.id}/review`, {
          method: "PATCH",
          accessToken,
          institutionId,
          body: JSON.stringify({
            action,
            comment: notes[item.id]?.trim() || undefined
          })
        });

        setQuestions((current) =>
          current.map((question) => (question.id === item.id ? updatedQuestion : question))
        );
        setStatus(`Question "${updatedQuestion.title}" reviewed as ${updatedQuestion.status}.`);
      } else {
        const updatedTemplate = await apiRequest<TemplateRecord>(`/content/templates/${item.id}/review`, {
          method: "PATCH",
          accessToken,
          institutionId,
          body: JSON.stringify({
            action,
            comment: notes[item.id]?.trim() || undefined
          })
        });

        setTemplates((current) =>
          current.map((template) => (template.id === item.id ? updatedTemplate : template))
        );
        setStatus(`Template "${updatedTemplate.name}" reviewed as ${updatedTemplate.status}.`);
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to save reviewer decision.");
    } finally {
      setActiveActionKey(null);
    }
  }

  return (
    <div className="dashboard-detail-grid">
      <article className="dashboard-panel dashboard-panel-wide">
        <h2>Release quality snapshot</h2>
        {isLoading ? (
          <div className="dashboard-loading-card">
            <Spinner />
            <span>Loading reviewer metrics...</span>
          </div>
        ) : (
          <div className="dashboard-summary-grid">
            <div>
              <span className="dashboard-summary-label">Review Queue</span>
              <strong>{reviewQueue.length} items</strong>
            </div>
            <div>
              <span className="dashboard-summary-label">Pending Invites</span>
              <strong>{summary?.recentInvitations.filter((invite) => invite.status === "pending").length ?? 0}</strong>
            </div>
            <div>
              <span className="dashboard-summary-label">Questions Ready</span>
              <strong>{questions.filter((question) => question.status === "ready").length}</strong>
            </div>
            <div>
              <span className="dashboard-summary-label">Templates Published</span>
              <strong>{templates.filter((template) => template.status === "published").length}</strong>
            </div>
          </div>
        )}
      </article>

      {status ? (
        <article className="dashboard-panel dashboard-panel-wide">
          <StatusMessage variant="info">{status}</StatusMessage>
        </article>
      ) : null}

      <article className="dashboard-panel dashboard-panel-wide">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h2>Review queue</h2>
            <p className="dashboard-panel-copy">
              Add reviewer comments, approve release-ready content, or send items back for revision.
            </p>
          </div>
          <div className="dashboard-user-chip">{reviewQueue.length} queued</div>
        </div>

        <div className="mt-4">
          <Input
            label="Search queue"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Search questions, templates, or statuses"
            leftIcon={<Search size={16} />}
          />
        </div>

        <div className="dashboard-table mt-4">
          {isLoading ? (
            <div className="dashboard-loading-card">
              <Spinner />
              <span>Loading review queue...</span>
            </div>
          ) : reviewQueue.length === 0 ? (
            <div className="info-card">
              <p className="info-card-label">Review queue is clear</p>
              <p className="dashboard-panel-copy">
                New draft questions and templates will appear here when they need approval support.
              </p>
            </div>
          ) : (
            reviewQueue.map((item) => (
              <div className="dashboard-table-row flex-col items-stretch" key={`${item.kind}-${item.id}`}>
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <strong>{item.title}</strong>
                    <div className="dashboard-row-meta">
                      {item.kind} | {item.subtitle}
                    </div>
                    {item.reviewComment ? (
                      <p className="dashboard-panel-copy mt-2">Latest note: {item.reviewComment}</p>
                    ) : null}
                  </div>
                  <span className="dashboard-role-pill">{item.status}</span>
                </div>

                <Input
                  label="Reviewer comment"
                  value={notes[item.id] ?? ""}
                  onChange={(event) =>
                    setNotes((current) => ({ ...current, [item.id]: event.target.value }))
                  }
                  placeholder="Record reviewer guidance or release comments"
                  leftIcon={<MessageSquareMore size={16} />}
                />

                <div className="dashboard-actions">
                  <Button
                    size="sm"
                    leftIcon={<CheckCircle2 size={16} />}
                    loading={activeActionKey === `${item.kind}:${item.id}:approve`}
                    onClick={() => void handleReview(item, "approve")}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    leftIcon={<RotateCcw size={16} />}
                    loading={activeActionKey === `${item.kind}:${item.id}:reject`}
                    onClick={() => void handleReview(item, "reject")}
                  >
                    Return
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    loading={activeActionKey === `${item.kind}:${item.id}:comment`}
                    onClick={() => void handleReview(item, "comment")}
                  >
                    Save comment
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </article>
    </div>
  );
}
