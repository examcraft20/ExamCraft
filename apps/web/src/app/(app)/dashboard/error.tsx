"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button, Card, StatusMessage } from "@examcraft/ui";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error for debugging and monitoring (e.g., Sentry integration)
    console.error("Dashboard caught error:", error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[50vh] p-4">
      <Card className="max-w-md w-full">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
            <AlertCircle size={24} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-textPrimary m-0 mb-1">
              Something went wrong
            </h2>
            <p className="text-textMuted text-sm m-0">
              The dashboard encountered an unexpected error.
            </p>
          </div>
          
          <StatusMessage variant="error" className="w-full text-left">
            {error.message || "An unknown error occurred."}
          </StatusMessage>

          <Button
            onClick={() => reset()}
            leftIcon={<RotateCcw size={16} />}
            className="w-full mt-2"
          >
            Try again
          </Button>
        </div>
      </Card>
    </div>
  );
}
