"use client";

import { Metadata } from "next";
import { BulkImportModal } from "@/components/shared/bulk-import-modal";

export default function BulkUploadPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Bulk Upload Questions</h1>
      <BulkImportModal />
    </div>
  );
}
