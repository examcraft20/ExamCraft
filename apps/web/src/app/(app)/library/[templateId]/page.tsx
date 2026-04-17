import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Template Details",
};

export default function TemplateDetailPage({ params }: { params: { templateId: string } }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white">Template: {params.templateId}</h1>
      <p className="text-slate-400 mt-2">
        Detailed view of this global template — sections, marks breakdown, and cloning options.
      </p>
    </div>
  );
}
