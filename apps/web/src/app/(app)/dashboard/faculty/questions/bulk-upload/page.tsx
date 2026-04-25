"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BulkImportModal } from "@/components/shared/bulk-import-modal";
import { Card, Spinner } from "@examcraft/ui";
import { useInstitution } from "@/hooks/use-institution";
import { getSupabaseBrowserSession } from "@/lib/supabase-browser";

export default function BulkUploadPage() {
  const router = useRouter();
  const { institutionId, isLoading: isInstitutionLoading } = useInstitution();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadContext() {
      if (isInstitutionLoading) {
        return;
      }

      if (!institutionId) {
        if (isMounted) {
          setError("Select an institution before bulk uploading questions.");
          setIsLoading(false);
        }
        return;
      }

      try {
        const session = await getSupabaseBrowserSession();
        if (!isMounted) return;

        if (!session?.access_token) {
          router.replace("/login");
          return;
        }

        setAccessToken(session.access_token);
      } catch (loadError) {
        if (isMounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Failed to initialize bulk upload."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadContext();
    return () => {
      isMounted = false;
    };
  }, [institutionId, isInstitutionLoading, router]);

  const handleClose = () => {
    const target = institutionId
      ? `/dashboard/faculty/questions?institutionId=${institutionId}`
      : "/dashboard/faculty/questions";
    router.push(target);
  };

  if (isInstitutionLoading || isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error || !institutionId || !accessToken) {
    return (
      <div className="p-6">
        <Card className="!bg-zinc-900 border-white/5 !rounded-[2.5rem] p-12 flex flex-col items-center gap-4">
          <p className="text-center text-slate-400 font-medium">
            {error || "Bulk upload is unavailable right now."}
          </p>
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-all"
          >
            Back to Question Bank
          </button>
        </Card>
      </div>
    );
  }

  return (
    <BulkImportModal
      isOpen
      onClose={handleClose}
      onSuccess={() => router.refresh()}
      accessToken={accessToken}
      institutionId={institutionId}
    />
  );
}
