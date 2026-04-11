import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Preview Paper",
};

export default function PaperPreviewPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Preview Paper: {params.id}</h1>
      <p>This is a stub for previewing a generated paper.</p>
    </div>
  );
}
