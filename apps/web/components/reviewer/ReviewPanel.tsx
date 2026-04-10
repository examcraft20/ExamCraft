"use client";

import { useState } from "react";
import { Button, Card, Textarea, StatusMessage, Spinner } from "@examcraft/ui";
import { apiRequest } from "#api";
import { ConfirmDialog } from "./ConfirmDialog";
import { ReviewHistory } from "./ReviewHistory";
import type { PaperRecord, ReviewHistoryEntry } from "@/lib/dashboard";

interface ReviewPanelProps {
  paper: PaperRecord;
  paperId: string;
  flaggedQuestions: Set<string>;
  questionNotes: Record<string, string>;
  onSetQuestionNote: (questionId: string, note: string) => void;
  overallFeedback: string;
  onSetOverallFeedback: (feedback: string) => void;
  accessToken: string;
  institutionId: string;
  isSubmitting: boolean;
  onSetIsSubmitting: (submitting: boolean) => void;
}

type DialogAction = "approve" | "reject" | "revision" | null;

export function ReviewPanel({
  paper,
  paperId,
  flaggedQuestions,
  questionNotes,
  onSetQuestionNote,
  overallFeedback,
  onSetOverallFeedback,
  accessToken,
  institutionId,
  isSubmitting,
  onSetIsSubmitting,
}: ReviewPanelProps) {
  const [activeDialog, setActiveDialog] = useState<DialogAction>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [dialogIsSubmitting, setDialogIsSubmitting] = useState(false);

  const getFlaggedQuestionsWithNotes = () => {
    const flagged: Array<{ id: string; note: string }> = [];
    flaggedQuestions.forEach((id) => {
      flagged.push({ id, note: questionNotes[id] || "" });
    });
    return flagged;
  };

  const handleApprove = async () => {
    setDialogIsSubmitting(true);
    try {
      const comment = overallFeedback || "Paper approved";
      await apiRequest(`/content/papers/${paperId}/review`, {
        method: "PATCH",
        accessToken,
        institutionId,
        body: JSON.stringify({
          action: "approve",
          comment,
        }),
      });
      setStatus("Paper approved successfully");
      setActiveDialog(null);
      // Could redirect or show success state
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Failed to approve paper",
      );
    } finally {
      setDialogIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setStatus("Rejection reason is required");
      return;
    }

    setDialogIsSubmitting(true);
    try {
      const comment = `Rejection: ${rejectionReason}\n\nFeedback: ${overallFeedback}`;
      await apiRequest(`/content/papers/${paperId}/review`, {
        method: "PATCH",
        accessToken,
        institutionId,
        body: JSON.stringify({
          action: "reject",
          comment,
        }),
      });
      setStatus("Paper rejected");
      setActiveDialog(null);
      setRejectionReason("");
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Failed to reject paper",
      );
    } finally {
      setDialogIsSubmitting(false);
    }
  };

  const handleRevision = async () => {
    setDialogIsSubmitting(true);
    try {
      const notes = Array.from(flaggedQuestions)
        .map((id) => `Q${id}: ${questionNotes[id] || ""}`)
        .join("\n");
      const comment = `Revision Required:\n${notes}\n\nGeneral Feedback: ${overallFeedback}`;
      await apiRequest(`/content/papers/${paperId}/review`, {
        method: "PATCH",
        accessToken,
        institutionId,
        body: JSON.stringify({
          action: "comment",
          comment,
        }),
      });
      setStatus("Revision request sent to faculty");
      setActiveDialog(null);
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "Failed to send revision request",
      );
    } finally {
      setDialogIsSubmitting(false);
    }
  };

  const flaggedList = getFlaggedQuestionsWithNotes();

  return (
    <div className="flex flex-col gap-6 sticky top-6">
      {/* Review Panel Card */}
      <Card className="!bg-zinc-900/80 border-white/10 !rounded-2xl p-6 backdrop-blur-xl shadow-2xl">
        {/* Header */}
        <h2 className="text-xl font-black tracking-tight text-white mb-6">
          Review Actions
        </h2>

        {/* Metadata */}
        <div className="flex flex-col gap-3 pb-6 border-b border-white/10 mb-6">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-600 font-bold uppercase tracking-widest">
              Subject
            </span>
            <span className="text-white font-bold">{paper.subject}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-600 font-bold uppercase tracking-widest">
              Total Marks
            </span>
            <span className="text-white font-bold">{paper.totalMarks}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-600 font-bold uppercase tracking-widest">
              Sections
            </span>
            <span className="text-white font-bold">
              {paper.sections?.length || 0}
            </span>
          </div>
        </div>

        {/* Overall Feedback */}
        <div className="mb-6">
          <label className="text-xs font-black uppercase tracking-widest text-zinc-600 block mb-2">
            Overall Feedback
          </label>
          <Textarea
            value={overallFeedback}
            onChange={(e) => onSetOverallFeedback(e.target.value)}
            placeholder="Add your review notes..."
            className="bg-slate-800/60 border-white/20 rounded-xl min-h-32 focus:border-indigo-500 focus:ring-indigo-500/30"
          />
        </div>

        {/* Flagged Questions */}
        {flaggedList.length > 0 && (
          <div className="mb-6 pb-6 border-b border-white/10">
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-600 mb-3">
              Flagged Questions ({flaggedList.length})
            </h3>
            <div className="flex flex-col gap-2">
              {flaggedList.map((flagged) => (
                <div
                  key={flagged.id}
                  className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20"
                >
                  <p className="text-xs font-bold text-amber-400 mb-1">
                    Question {flagged.id}
                  </p>
                  {flagged.note && (
                    <p className="text-xs text-amber-200">{flagged.note}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {status && (
          <div className="mb-4">
            <StatusMessage variant="info">{status}</StatusMessage>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={() => setActiveDialog("revision")}
            disabled={isSubmitting || flaggedList.length === 0}
            className="w-full py-3 rounded-xl font-black text-sm uppercase tracking-widest bg-gradient-to-r from-amber-600 to-amber-500 text-white hover:from-amber-500 hover:to-amber-400 disabled:opacity-50"
          >
            {isSubmitting ? <Spinner /> : "Request Revision"}
          </Button>

          <Button
            onClick={() => setActiveDialog("reject")}
            disabled={isSubmitting}
            variant="ghost"
            className="w-full py-3 rounded-xl font-black text-sm uppercase tracking-widest text-red-400 border-red-500/30 hover:bg-red-500/10"
          >
            Reject Paper
          </Button>

          <Button
            onClick={() => setActiveDialog("approve")}
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl font-black text-sm uppercase tracking-widest bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-50"
          >
            {isSubmitting ? <Spinner /> : "Approve & Publish"}
          </Button>
        </div>
      </Card>

      {/* Review History */}
      {paper.reviewHistory && paper.reviewHistory.length > 0 && (
        <ReviewHistory history={paper.reviewHistory} />
      )}

      {/* Dialogs */}
      {activeDialog === "approve" && (
        <ConfirmDialog
          action="approve"
          isSubmitting={dialogIsSubmitting}
          onConfirm={handleApprove}
          onCancel={() => setActiveDialog(null)}
        />
      )}

      {activeDialog === "reject" && (
        <ConfirmDialog
          action="reject"
          rejectionReason={rejectionReason}
          onSetRejectionReason={setRejectionReason}
          isSubmitting={dialogIsSubmitting}
          onConfirm={handleReject}
          onCancel={() => {
            setActiveDialog(null);
            setRejectionReason("");
          }}
        />
      )}

      {activeDialog === "revision" && (
        <ConfirmDialog
          action="revision"
          isSubmitting={dialogIsSubmitting}
          onConfirm={handleRevision}
          onCancel={() => setActiveDialog(null)}
          flaggedCount={flaggedList.length}
        />
      )}
    </div>
  );
}
