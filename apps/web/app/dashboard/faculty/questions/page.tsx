import { Metadata } from "next";
import { QuestionsPageClient } from "./questions-client";

export const metadata: Metadata = {
  title: 'Questions Library',
};

export default function QuestionsPage() {
  return <QuestionsPageClient />;
}
