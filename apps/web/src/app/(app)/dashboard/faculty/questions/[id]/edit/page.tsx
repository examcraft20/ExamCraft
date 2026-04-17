import { Metadata } from "next";
import { EditQuestionPageClient } from "./edit-question-client";

export const metadata: Metadata = {
  title: 'Edit Question',
};

export default function EditQuestionPage({
  params
}: {
  params: { id: string };
}) {
  return <EditQuestionPageClient id={params.id} />;
}
