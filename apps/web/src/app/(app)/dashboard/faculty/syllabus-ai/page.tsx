import { Metadata } from "next";
import { SyllabusAiClientPage } from "./syllabus-ai-client-page";

export const metadata: Metadata = {
  title: 'AI Syllabus Generator',
};

export default function SyllabusAiPage() {
  return <SyllabusAiClientPage />;
}
