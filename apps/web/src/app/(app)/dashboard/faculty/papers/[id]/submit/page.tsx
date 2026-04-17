import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Submit Paper",
};

export default function PaperSubmitPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Submit Paper: {params.id}</h1>
      <p>This is a stub for finalizing and submitting a paper.</p>
    </div>
  );
}
