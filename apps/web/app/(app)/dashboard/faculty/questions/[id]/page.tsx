import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Question Detail",
};

export default function QuestionDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Question Details: {params.id}</h1>
      <p>This is a stub for the question detail.</p>
    </div>
  );
}
