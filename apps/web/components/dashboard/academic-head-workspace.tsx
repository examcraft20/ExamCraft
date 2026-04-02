"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ClipboardCheck, RotateCcw, Search } from "lucide-react";
import { Button, Input, Spinner, StatusMessage } from "@examcraft/ui";
import { apiRequest } from "../../lib/api";
import type {
  InstitutionDashboardSummaryResponse,
  QuestionRecord,
  TemplateRecord
} from "../../lib/dashboard";

type AcademicHeadWorkspaceProps = {
  accessToken: string;
  institutionId: string;
};

type ReviewAction = "approve" | "reject" | "comment";

export function AcademicHeadWorkspace({
  accessToken,
  institutionId
}: AcademicHeadWorkspaceProps) {
  const [summary, setSummary] = useState<InstitutionDashboardSummaryResponse | null>(null);
  const [questions, setQuestions] = useState<QuestionRecord[]>([]);
  const [templates, setTemplates] = useState<TemplateRecord[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [questionSearch, setQuestionSearch] = useState("");
  const [templateSearch, setTemplateSearch] = useState("");
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
          setStatus(error instanceof Error ? error.message : "Unable to load academic oversight data.");
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

  const filteredQuestions = useMemo(() => {
    const needle = questionSearch.trim().toLowerCase();
    if (!needle) {
      return questions;
    }

    return questions.filter((question) =>
      [question.title, question.subject, question.bloomLevel, question.difficulty]
        .join(" ")
        .toLowerCase()
        .includes(needle)
    );
  }, [questionSearch, questions]);

  const filteredTemplates = useMemo(() => {
    const needle = templateSearch.trim().toLowerCase();
    if (!needle) {
      return templates;
    }

    return templates.filter((template) =>
      [template.name, template.examType, template.status].join(" ").toLowerCase().includes(needle)
    );
  }, [templateSearch, templates]);

  async function handleReview(
    contentType: "questions" | "templates",
    contentId: string,
    action: ReviewAction
  ) {
    const actionKey = `${contentType}:${contentId}:${action}`;
    setActiveActionKey(actionKey);
    setStatus(null);

    try {
      const payload = {
        action,
        comment: notes[contentId]?.trim() || undefined
      };

      if (contentType === "questions") {
        const updatedQuestion = await apiRequest<QuestionRecord>(`/content/questions/${contentId}/review`, {
          method: "PATCH",
          accessToken,
          institutionId,
          body: JSON.stringify(payload)
        });

        setQuestions((current) =>
          current.map((question) => (question.id === contentId ? updatedQuestion : question))
        );
        setStatus(`Question "${updatedQuestion.title}" updated to ${updatedQuestion.status}.`);
      } else {
        const updatedTemplate = await apiRequest<TemplateRecord>(`/content/templates/${contentId}/review`, {
          method: "PATCH",
          accessToken,
          institutionId,
          body: JSON.stringify(payload)
        });

        setTemplates((current) =>
          current.map((template) => (template.id === contentId ? updatedTemplate : template))
        );
        setStatus(`Template "${updatedTemplate.name}" updated to ${updatedTemplate.status}.`);
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to update review decision.");
    } finally {
      setActiveActionKey(null);
    }
  }

  return (
    <div className="dashboard-detail-grid">
      <article className="dashboard-panel dashboard-panel-wide">
        <h2>Academic readiness snapshot</h2>
        {isLoading ? (
          <div className="dashboard-loading-card">
            <Spinner />
            <span>Loading oversight metrics...</span>
          </div>
        ) : (
          <div className="dashboard-summary-grid">
            <div>
              <span className="dashboard-summary-label">Ready Questions</span>
              <strong>{questions.filter((question) => question.status === "ready").length}</strong>
            </div>
            <div>
              <span className="dashboard-summary-label">Published Templates</span>
              <strong>{templates.filter((template) => template.status === "published").length}</strong>
            </div>
            <div>
              <span className="dashboard-summary-label">Needs Review</span>
              <strong>
                {questions.filter((question) => question.status === "draft").length +
                  templates.filter((template) => template.status === "draft").length}
              </strong>
            </div>
            <div>
              <span className="dashboard-summary-label">Open Invitations</span>
              <strong>
                {summary?.recentInvitations.filter((invite) => invite.status === "pending").length ?? 0}
              </strong>
            </div>
          </div>
        )}
      </article>

      {status ? (
        <article className="dashboard-panel dashboard-panel-wide">
          <StatusMessage variant="info">{status}</StatusMessage>
        </article>
      ) : null}

      <article className="dashboard-panel">
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <h2>Question approvals</h2>
              <p className="dashboard-panel-copy">
                Search the bank, add a note, then approve or return questions for revision.
              </p>
            </div>
            <div className="dashboard-user-chip">{filteredQuestions.length} visible</div>
          </div>

          <Input
            label="Search questions"
            value={questionSearch}
            onChange={(event) => setQuestionSearch(event.target.value)}
            placeholder="Search by title, subject, or difficulty"
            leftIcon={<Search size={16} />}
          />
        </div>

        <div className="dashboard-table mt-4">
          {isLoading ? (
            <div className="dashboard-loading-card">
              <Spinner />
              <span>Loading question queue...</span>
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="info-card">
              <p className="info-card-label">No questions found</p>
              <p className="dashboard-panel-copy">Try a different search or wait for new faculty submissions.</p>
            </div>
          ) : (
            filteredQuestions.map((question) => (
              <div className="dashboard-table-row flex-col items-stretch" key={question.id}>
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <strong>{question.title}</strong>
                    <div className="dashboard-row-meta">
                      {question.subject} | {question.bloomLevel} | {question.difficulty}
                    </div>
                    {question.reviewComment ? (
                      <p className="dashboard-panel-copy mt-2">Latest note: {question.reviewComment}</p>
                    ) : null}
                  </div>
                  <span className="dashboard-role-pill">{question.status}</span>
                </div>

                <Input
                  label="Review note"
                  value={notes[question.id] ?? ""}
                  onChange={(event) =>
                    setNotes((current) => ({ ...current, [question.id]: event.target.value }))
                  }
                  placeholder="Share quality guidance or approval context"
                  leftIcon={<ClipboardCheck size={16} />}
                />

                <div className="dashboard-actions">
                  <Button
                    size="sm"
                    leftIcon={<CheckCircle2 size={16} />}
                    loading={activeActionKey === `questions:${question.id}:approve`}
                    onClick={() => void handleReview("questions", question.id, "approve")}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    leftIcon={<RotateCcw size={16} />}
                    loading={activeActionKey === `questions:${question.id}:reject`}
                    onClick={() => void handleReview("questions", question.id, "reject")}
                  >
                    Return to draft
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    loading={activeActionKey === `questions:${question.id}:comment`}
                    onClick={() => void handleReview("questions", question.id, "comment")}
                  >
                    Save note
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </article>

      <article className="dashboard-panel">
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <h2>Template approvals</h2>
              <p className="dashboard-panel-copy">
                Promote strong templates to published status or send them back for revision.
              </p>
            </div>
            <div className="dashboard-user-chip">{filteredTemplates.length} visible</div>
          </div>

          <Input
            label="Search templates"
            value={templateSearch}
            onChange={(event) => setTemplateSearch(event.target.value)}
            placeholder="Search by template name or exam type"
            leftIcon={<Search size={16} />}
          />
        </div>

        <div className="dashboard-table mt-4">
          {isLoading ? (
            <div className="dashboard-loading-card">
              <Spinner />
              <span>Loading template queue...</span>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="info-card">
              <p className="info-card-label">No templates found</p>
              <p className="dashboard-panel-copy">Templates awaiting oversight will appear here.</p>
            </div>
          ) : (
            filteredTemplates.map((template) => (
              <div className="dashboard-table-row flex-col items-stretch" key={template.id}>
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <strong>{template.name}</strong>
                    <div className="dashboard-row-meta">
                      {template.examType} | {template.durationMinutes} min | {template.totalMarks} marks
                    </div>
                    {template.reviewComment ? (
                      <p className="dashboard-panel-copy mt-2">Latest note: {template.reviewComment}</p>
                    ) : null}
                  </div>
                  <span className="dashboard-role-pill">{template.status}</span>
                </div>

                <Input
                  label="Approval note"
                  value={notes[template.id] ?? ""}
                  onChange={(event) =>
                    setNotes((current) => ({ ...current, [template.id]: event.target.value }))
                  }
                  placeholder="Share release guidance or requested edits"
                  leftIcon={<ClipboardCheck size={16} />}
                />

                <div className="dashboard-actions">
                  <Button
                    size="sm"
                    leftIcon={<CheckCircle2 size={16} />}
                    loading={activeActionKey === `templates:${template.id}:approve`}
                    onClick={() => void handleReview("templates", template.id, "approve")}
                  >
                    Publish
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    leftIcon={<RotateCcw size={16} />}
                    loading={activeActionKey === `templates:${template.id}:reject`}
                    onClick={() => void handleReview("templates", template.id, "reject")}
                  >
                    Return to draft
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    loading={activeActionKey === `templates:${template.id}:comment`}
                    onClick={() => void handleReview("templates", template.id, "comment")}
                  >
                    Save note
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
