"use client";

import { useState } from "react";
import { PaperViewer } from "./PaperViewer";
import { ReviewPanel } from "./ReviewPanel";
import type { PaperRecord } from "../../../lib/dashboard";

interface ReviewContentProps {
  paper: PaperRecord;
  accessToken: string;
  institutionId: string;
  paperId: string;
}

export function ReviewContent({
  paper,
  accessToken,
  institutionId,
  paperId
}: ReviewContentProps) {
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const [questionNotes, setQuestionNotes] = useState<Record<string, string>>({});
  const [overallFeedback, setOverallFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleFlag = (questionId: string) => {
    const newFlagged = new Set(flaggedQuestions);
    if (newFlagged.has(questionId)) {
      newFlagged.delete(questionId);
      const newNotes = { ...questionNotes };
      delete newNotes[questionId];
      setQuestionNotes(newNotes);
    } else {
      newFlagged.add(questionId);
    }
    setFlaggedQuestions(newFlagged);
  };

  const setQuestionNote = (questionId: string, note: string) => {
    setQuestionNotes(prev => ({
      ...prev,
      [questionId]: note
    }));
  };

  return (
    <div className="grid lg:grid-cols-[1fr_380px] gap-8">
      {/* Left Panel: Paper Viewer (65%) */}
      <PaperViewer
        paper={paper}
        flaggedQuestions={flaggedQuestions}
        onToggleFlag={toggleFlag}
      />

      {/* Right Panel: Review Interface (35%, sticky) */}
      <ReviewPanel
        paper={paper}
        paperId={paperId}
        flaggedQuestions={flaggedQuestions}
        questionNotes={questionNotes}
        onSetQuestionNote={setQuestionNote}
        overallFeedback={overallFeedback}
        onSetOverallFeedback={setOverallFeedback}
        accessToken={accessToken}
        institutionId={institutionId}
        isSubmitting={isSubmitting}
        onSetIsSubmitting={setIsSubmitting}
      />
    </div>
  );
}
