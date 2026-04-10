import { Metadata } from "next";
import { NewPaperPageClient } from "./new-paper-client";

export const metadata: Metadata = {
  title: 'Generate New Paper',
};

export default function NewPaperPage() {
  return <NewPaperPageClient />;
}
