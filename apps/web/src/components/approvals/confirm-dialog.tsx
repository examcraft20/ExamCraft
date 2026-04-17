"use client";

import { useEffect, useRef } from "react";
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
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle Escape key and focus trap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };

    document.addEventListener("keydown", handleKeyDown);
    
    // Focus the modal for accessibility
    modalRef.current?.focus();
    
    // Prevent scrolling of body when modal is open
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [onCancel]);

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
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity" 
        onClick={onCancel} 
        aria-hidden="true"
      />

      {/* Modal */}
      <div 
        className="fixed inset-0 flex items-center justify-center z-[101] p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div 
          ref={modalRef}
          tabIndex={-1}
          className="bg-zinc-950 border border-white/10 rounded-[2rem] p-10 max-w-md w-full shadow-[0_0_100px_rgba(0,0,0,0.5)] focus:outline-none relative overflow-hidden"
        >
          {/* Accent decoration */}
          <div className={`absolute top-0 inset-x-0 h-1.5 ${content.buttonColor.split(' ')[0]}`} />
          
          {/* Title */}
          <h2 id="modal-title" className="text-2xl font-black tracking-tight text-white mb-4">
            {content.title}
          </h2>

          {/* Message */}
          <p className="text-zinc-400 font-medium mb-8 leading-relaxed">
            {content.message}
          </p>

          {/* Rejection Reason (if reject) */}
          {action === "reject" && (
            <div className="mb-8 group">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 block mb-3 ml-1">
                Reason for Rejection
              </label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => onSetRejectionReason?.(e.target.value)}
                placeholder="Briefly explain the quality concerns or required changes..."
                className="bg-zinc-900/50 border-white/10 rounded-2xl min-h-[120px] focus:border-red-500/50 focus:ring-4 focus:ring-red-500/10 text-sm font-medium transition-all"
                required
                autoFocus
              />
              {!rejectionReason.trim() && (
                <p className="text-[10px] text-red-500 font-bold mt-2 ml-1 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-red-500" />
                  Documentation is required for rejections
                </p>
              )}
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Button
              onClick={onCancel}
              disabled={isSubmitting}
              variant="ghost"
              className="w-full sm:flex-1 py-4 rounded-xl font-black text-xs uppercase tracking-widest border-white/5 hover:bg-white/5 text-zinc-400 hover:text-white transition-all"
            >
              Back
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isSubmitting || (action === "reject" && !rejectionReason.trim())}
              className={`w-full sm:flex-1 py-4 rounded-xl font-black text-xs uppercase tracking-widest text-white ${content.buttonColor} shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:grayscale disabled:scale-100 flex items-center justify-center gap-2`}
            >
              {isSubmitting ? (
                <>
                  <Spinner size="sm" />
                  <span>Processing...</span>
                </>
              ) : (
                content.buttonText
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
