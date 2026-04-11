"use client";

import { Button, Textarea, Spinner } from "@examcraft/ui";

interface ConfirmDialogProps {
  action: "approve" | "reject" | "revision";
  rejectionReason?: string;
  onSetRejectionReason?: (reason: string) => void;
  isSubmitting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  flaggedCount?: number;
}

export function ConfirmDialog({
  action,
  rejectionReason = "",
  onSetRejectionReason,
  isSubmitting,
  onConfirm,
  onCancel,
  flaggedCount = 0
}: ConfirmDialogProps) {
  const getContent = () => {
    switch (action) {
      case "approve":
        return {
          title: "Confirm Approval",
          message: "This paper will be marked as approved and ready for publishing.",
          buttonText: "Approve",
          buttonColor: "bg-emerald-600 hover:bg-emerald-500"
        };
      case "reject":
        return {
          title: "Confirm Rejection",
          message: "The paper will be rejected and sent back to the author with feedback.",
          buttonText: "Reject",
          buttonColor: "bg-red-600 hover:bg-red-500",
          showReason: true
        };
      case "revision":
        return {
          title: "Request Revision",
          message: `Send revision request for ${flaggedCount} flagged question${flaggedCount !== 1 ? "s" : ""}. The author will be notified.`,
          buttonText: "Send for Revision",
          buttonColor: "bg-amber-600 hover:bg-amber-500"
        };
    }
  };

  const content = getContent();

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onCancel} />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-zinc-900 border border-white/10 rounded-2xl p-8 max-w-md shadow-2xl">
          {/* Title */}
          <h2 className="text-2xl font-black tracking-tight text-white mb-3">{content.title}</h2>

          {/* Message */}
          <p className="text-zinc-400 font-bold mb-6 leading-relaxed">{content.message}</p>

          {/* Rejection Reason (if reject) */}
          {action === "reject" && (
            <div className="mb-6">
              <label className="text-xs font-black uppercase tracking-widest text-zinc-600 block mb-2">
                Reason for Rejection
              </label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => onSetRejectionReason?.(e.target.value)}
                placeholder="Explain why this paper is being rejected..."
                className="bg-slate-800/60 border-white/20 rounded-xl min-h-24 focus:border-red-500 focus:ring-red-500/30"
                required
              />
              {!rejectionReason.trim() && action === "reject" && (
                <p className="text-xs text-red-400 mt-2">Rejection reason is required</p>
              )}
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center gap-3">
            <Button
              onClick={onCancel}
              disabled={isSubmitting}
              variant="ghost"
              className="flex-1 py-3 rounded-lg font-black text-sm uppercase tracking-widest border-white/20 hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isSubmitting || (action === "reject" && !rejectionReason.trim())}
              className={`flex-1 py-3 rounded-lg font-black text-sm uppercase tracking-widest text-white ${content.buttonColor} disabled:opacity-50 flex items-center justify-center gap-2`}
            >
              {isSubmitting ? <Spinner /> : content.buttonText}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
