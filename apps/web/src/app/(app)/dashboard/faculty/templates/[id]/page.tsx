import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Template Detail",
};

export default function TemplateDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Template Detail: {params.id}</h1>
      <p>This is a stub for template details.</p>
    </div>
  );
}
