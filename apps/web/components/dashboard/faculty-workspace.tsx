"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  BookOpenText,
  ClipboardList,
  Hash,
  Layers3,
  Scale,
  Search,
  Sparkles,
  Tags
} from "lucide-react";
import { Button, Input, Select, Spinner, StatusMessage } from "@examcraft/ui";
import { apiRequest } from "../../lib/api";

type FacultyWorkspaceProps = {
  accessToken: string;
  institutionId: string;
};

type Question = {
  id: string;
  title: string;
  subject: string;
  bloomLevel: string;
  difficulty: string;
  tags: string[];
  status: string;
  createdAt: string;
};

type Template = {
  id: string;
  name: string;
  examType: string;
  durationMinutes: number;
  totalMarks: number;
  sections: Array<{ title: string; questionCount: number; marks: number }>;
  status: string;
  createdAt: string;
};

const difficultyOptions = [
  { label: "Easy", value: "easy" },
  { label: "Medium", value: "medium" },
  { label: "Hard", value: "hard" }
];

export function FacultyWorkspace({ accessToken, institutionId }: FacultyWorkspaceProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [questionStatus, setQuestionStatus] = useState<string | null>(null);
  const [templateStatus, setTemplateStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [questionForm, setQuestionForm] = useState({
    title: "",
    subject: "",
    bloomLevel: "",
    difficulty: "medium",
    tags: ""
  });
  const [templateForm, setTemplateForm] = useState({
    name: "",
    examType: "",
    durationMinutes: "90",
    totalMarks: "100"
  });
  const [questionSearch, setQuestionSearch] = useState("");
  const [templateSearch, setTemplateSearch] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadContent() {
      try {
        const [questionResponse, templateResponse] = await Promise.all([
          apiRequest<Question[]>("/content/questions", {
            method: "GET",
            accessToken,
            institutionId
          }),
          apiRequest<Template[]>("/content/templates", {
            method: "GET",
            accessToken,
            institutionId
          })
        ]);

        if (isMounted) {
          setQuestions(questionResponse);
          setTemplates(templateResponse);
        }
      } catch (error) {
        if (isMounted) {
          setQuestionStatus(error instanceof Error ? error.message : "Unable to load faculty content.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadContent();

    return () => {
      isMounted = false;
    };
  }, [accessToken, institutionId]);

  async function createQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setQuestionStatus(null);

    try {
      const createdQuestion = await apiRequest<Question>("/content/questions", {
        method: "POST",
        accessToken,
        institutionId,
        body: JSON.stringify({
          title: questionForm.title,
          subject: questionForm.subject,
          bloomLevel: questionForm.bloomLevel,
          difficulty: questionForm.difficulty,
          tags: questionForm.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        })
      });

      setQuestions((current) => [createdQuestion, ...current]);
      setQuestionForm({
        title: "",
        subject: "",
        bloomLevel: "",
        difficulty: "medium",
        tags: ""
      });
      setQuestionStatus(`Question "${createdQuestion.title}" created.`);
    } catch (error) {
      setQuestionStatus(error instanceof Error ? error.message : "Unable to create question.");
    }
  }

  async function createTemplate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTemplateStatus(null);

    try {
      const createdTemplate = await apiRequest<Template>("/content/templates", {
        method: "POST",
        accessToken,
        institutionId,
        body: JSON.stringify({
          name: templateForm.name,
          examType: templateForm.examType,
          durationMinutes: Number(templateForm.durationMinutes),
          totalMarks: Number(templateForm.totalMarks),
          sections: [
            {
              title: "Section A",
              questionCount: 5,
              marks: Math.max(5, Math.floor(Number(templateForm.totalMarks) / 2))
            }
          ]
        })
      });

      setTemplates((current) => [createdTemplate, ...current]);
      setTemplateForm({
        name: "",
        examType: "",
        durationMinutes: "90",
        totalMarks: "100"
      });
      setTemplateStatus(`Template "${createdTemplate.name}" created.`);
    } catch (error) {
      setTemplateStatus(error instanceof Error ? error.message : "Unable to create template.");
    }
  }

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

  return (
    <div className="dashboard-detail-grid">
      <article className="dashboard-panel">
        <h2>Create question</h2>
        <form className="form-body compact-form" onSubmit={createQuestion}>
          <Input
            label="Title"
            required
            value={questionForm.title}
            onChange={(event) =>
              setQuestionForm((current) => ({ ...current, title: event.target.value }))
            }
            leftIcon={<ClipboardList size={16} />}
          />
          <Input
            label="Subject"
            required
            value={questionForm.subject}
            onChange={(event) =>
              setQuestionForm((current) => ({ ...current, subject: event.target.value }))
            }
            leftIcon={<BookOpenText size={16} />}
          />
          <Input
            label="Bloom level"
            required
            value={questionForm.bloomLevel}
            onChange={(event) =>
              setQuestionForm((current) => ({ ...current, bloomLevel: event.target.value }))
            }
            leftIcon={<Sparkles size={16} />}
          />
          <Select
            label="Difficulty"
            value={questionForm.difficulty}
            onChange={(event) =>
              setQuestionForm((current) => ({ ...current, difficulty: event.target.value }))
            }
            options={difficultyOptions}
            leftIcon={<Scale size={16} />}
          />
          <Input
            label="Tags"
            value={questionForm.tags}
            onChange={(event) =>
              setQuestionForm((current) => ({ ...current, tags: event.target.value }))
            }
            placeholder="midterm, algebra"
            leftIcon={<Tags size={16} />}
          />
          <Button type="submit" fullWidth>
            Save question
          </Button>
        </form>
        {questionStatus ? (
          <StatusMessage className="mt-4" variant="info">
            {questionStatus}
          </StatusMessage>
        ) : null}
      </article>

      <article className="dashboard-panel">
        <h2>Create template</h2>
        <form className="form-body compact-form" onSubmit={createTemplate}>
          <Input
            label="Template name"
            required
            value={templateForm.name}
            onChange={(event) =>
              setTemplateForm((current) => ({ ...current, name: event.target.value }))
            }
            leftIcon={<Layers3 size={16} />}
          />
          <Input
            label="Exam type"
            required
            value={templateForm.examType}
            onChange={(event) =>
              setTemplateForm((current) => ({ ...current, examType: event.target.value }))
            }
            leftIcon={<ClipboardList size={16} />}
          />
          <Input
            label="Duration (minutes)"
            type="number"
            min="15"
            required
            value={templateForm.durationMinutes}
            onChange={(event) =>
              setTemplateForm((current) => ({ ...current, durationMinutes: event.target.value }))
            }
            leftIcon={<Hash size={16} />}
          />
          <Input
            label="Total marks"
            type="number"
            min="1"
            required
            value={templateForm.totalMarks}
            onChange={(event) =>
              setTemplateForm((current) => ({ ...current, totalMarks: event.target.value }))
            }
            leftIcon={<Hash size={16} />}
          />
          <Button type="submit" fullWidth>
            Save template
          </Button>
        </form>
        {templateStatus ? (
          <StatusMessage className="mt-4" variant="info">
            {templateStatus}
          </StatusMessage>
        ) : null}
      </article>

      <article className="dashboard-panel">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h2>Recent questions</h2>
            <p className="dashboard-panel-copy">Search authored questions and keep an eye on review status.</p>
          </div>
          <div className="dashboard-user-chip">{filteredQuestions.length} questions</div>
        </div>
        <div className="mt-4">
          <Input
            label="Search questions"
            value={questionSearch}
            onChange={(event) => setQuestionSearch(event.target.value)}
            placeholder="Search by title, subject, or difficulty"
            leftIcon={<Search size={16} />}
          />
        </div>
        {isLoading ? (
          <div className="dashboard-loading-card mt-4">
            <Spinner />
            <span>Loading questions...</span>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="info-card mt-4">
            <p className="info-card-label">No questions yet</p>
            <p className="dashboard-panel-copy">Create your first question to start building the bank.</p>
          </div>
        ) : (
          <div className="dashboard-table mt-4">
            {filteredQuestions.map((question) => (
              <div className="dashboard-table-row" key={question.id}>
                <div>
                  <strong>{question.title}</strong>
                  <div className="dashboard-row-meta">
                    {question.subject} | {question.bloomLevel} | {question.difficulty}
                  </div>
                </div>
                <span>{question.status}</span>
              </div>
            ))}
          </div>
        )}
      </article>

      <article className="dashboard-panel">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h2>Recent templates</h2>
            <p className="dashboard-panel-copy">Search templates by exam type and track publishing progress.</p>
          </div>
          <div className="dashboard-user-chip">{filteredTemplates.length} templates</div>
        </div>
        <div className="mt-4">
          <Input
            label="Search templates"
            value={templateSearch}
            onChange={(event) => setTemplateSearch(event.target.value)}
            placeholder="Search by name, type, or status"
            leftIcon={<Search size={16} />}
          />
        </div>
        {isLoading ? (
          <div className="dashboard-loading-card mt-4">
            <Spinner />
            <span>Loading templates...</span>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="info-card mt-4">
            <p className="info-card-label">No templates yet</p>
            <p className="dashboard-panel-copy">Create a template to standardize paper generation.</p>
          </div>
        ) : (
          <div className="dashboard-table mt-4">
            {filteredTemplates.map((template) => (
              <div className="dashboard-table-row" key={template.id}>
                <div>
                  <strong>{template.name}</strong>
                  <div className="dashboard-row-meta">
                    {template.examType} | {template.durationMinutes} min | {template.totalMarks} marks
                  </div>
                </div>
                <span>{template.status}</span>
              </div>
            ))}
          </div>
        )}
      </article>
    </div>
  );
}
