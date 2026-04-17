"use client";

import { useState } from "react";
import { Button, Card, Textarea, StatusMessage, Spinner } from "@examcraft/ui";
import { apiRequest } from "@/lib/api/client";
import { ConfirmDialog } from "./confirm-dialog";
import { ReviewHistory } from "./review-history";
import type { PaperRecord } from "@/lib/dashboard";

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
    setStatus(null);
    try {
      const comment = overallFeedback || "Paper approved";
      await apiRequest(`/approvals/papers/${paperId}/review`, {
        method: "PATCH",
        accessToken,
        institutionId,
        body: JSON.stringify({
          action: "approve",
          comment,
        }),
      });
      setStatus("Paper approved successfully. All stakeholders notified.");
      setActiveDialog(null);
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
      setStatus("Rejection reason is required for audit consistency");
      return;
    }

    setDialogIsSubmitting(true);
    setStatus(null);
    try {
      const comment = `Audit Rejection: ${rejectionReason}\n\nNotes: ${overallFeedback}`;
      await apiRequest(`/approvals/papers/${paperId}/review`, {
        method: "PATCH",
        accessToken,
        institutionId,
        body: JSON.stringify({
          action: "reject",
          comment,
        }),
      });
      setStatus("Paper rejected and returned to faculty");
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
    setStatus(null);
    try {
      const notes = Array.from(flaggedQuestions)
        .map((id) => `Q${id}: ${questionNotes[id] || ""}`)
        .join("\n");
      const comment = `Review Comments - Revision Required:\n${notes}\n\nSummary: ${overallFeedback}`;
      await apiRequest(`/approvals/papers/${paperId}/review`, {
        method: "PATCH",
        accessToken,
        institutionId,
        body: JSON.stringify({
          action: "comment",
          comment,
        }),
      });
      setStatus("Revision request successfully dispatched");
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
      <Card className="!bg-zinc-950 border-white/[0.08] !rounded-[2rem] p-8 backdrop-blur-3xl shadow-2xl relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[50px] pointer-events-none" />
        
        {/* Header */}
        <h2 className="text-xl font-black tracking-tight text-white mb-8 flex items-center gap-3">
          <span className="w-2 h-6 bg-indigo-500 rounded-full" />
          Review Command
        </h2>

        {/* Audit Summary */}
        <div className="flex flex-col gap-4 pb-8 border-b border-white/5 mb-8">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">
              Domain
            </span>
            <span className="text-xs font-bold text-zinc-300">{paper.subject || "General"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">
              Evaluation Cap
            </span>
            <span className="text-xs font-black text-indigo-400">{paper.totalMarks} Points</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">
              Structure
            </span>
            <span className="text-xs font-bold text-zinc-300">
              {paper.sections?.length || 0} Components
            </span>
          </div>
        </div>

        {/* Action Conclusion */}
        <div className="mb-8">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 block mb-3 ml-1">
            Executive Summary / Feedback
          </label>
          <Textarea
            value={overallFeedback}
            onChange={(e) => onSetOverallFeedback(e.target.value)}
            disabled={isSubmitting}
            placeholder="Document your review findings here for the instructor..."
            className="bg-zinc-900/50 border-white/10 rounded-2xl min-h-[140px] focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 text-sm font-medium transition-all"
          />
        </div>

        {/* Discovered Issues */}
        {flaggedList.length > 0 && (
          <div className="mb-8 p-5 rounded-2xl bg-amber-500/[0.03] border border-amber-500/10">
            <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-amber-500/80 mb-4 flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-amber-500" />
              Flagged Items ({flaggedList.length})
            </h3>
            <div className="flex flex-col gap-2.5 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {flaggedList.map((flagged) => (
                <div
                  key={flagged.id}
                  className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10"
                >
                  <p className="text-[10px] font-black text-amber-400 mb-1 uppercase tracking-widest">
                    ID: {flagged.id.split('-')[0]}
                  </p>
                  {flagged.note && (
                    <p className="text-xs text-amber-200/70 font-medium leading-relaxed">{flagged.note}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {status && (
          <div className="mb-6 animate-in fade-in slide-in-from-top-2">
            <StatusMessage variant={status.includes("failed") ? "error" : "info"}>{status}</StatusMessage>
          </div>
        )}

        {/* Critical Actions */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={() => setActiveDialog("revision")}
            disabled={isSubmitting || flaggedList.length === 0}
            className="w-full py-4 rounded-[1.25rem] font-black text-xs uppercase tracking-[0.15em] bg-white/[0.03] border border-amber-500/20 text-amber-500 hover:bg-amber-500 hover:text-black transition-all disabled:opacity-30 flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Spinner size="sm" /> : "Request Corrections"}
          </Button>

          <Button
            onClick={() => setActiveDialog("approve")}
            disabled={isSubmitting}
            className="w-full py-4 rounded-[1.25rem] font-black text-xs uppercase tracking-[0.15em] bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Spinner size="sm" /> : "Authorize Submission"}
          </Button>

          <button
            onClick={() => setActiveDialog("reject")}
            disabled={isSubmitting}
            className="w-full py-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 hover:text-red-400 transition-colors disabled:opacity-30 mt-2"
          >
            Decline & Revoke
          </button>
        </div>
      </Card>

      {/* Audit Log */}
      {paper.reviewHistory && paper.reviewHistory.length > 0 && (
        <ReviewHistory history={paper.reviewHistory} />
      )}

      {/* Institutional Dialogs */}
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
