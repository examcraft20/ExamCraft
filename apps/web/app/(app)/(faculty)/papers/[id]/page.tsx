import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Paper Editor",
};

export default function PaperEditorPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Paper Editor: {params.id}</h1>
      <p>This is a stub for formatting a paper draft.</p>
    </div>
  );
}
