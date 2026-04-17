import { Metadata } from "next";
import { NewQuestionPageClient } from "./new-question-client";

export const metadata: Metadata = {
  title: 'Add New Question',
};

export default function NewQuestionPage() {
  return <NewQuestionPageClient />;
}
