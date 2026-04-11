import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Approval Detail",
};

export default function ApprovalDetailPage({ params }: { params: { paperId: string } }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white">Paper Approval: {params.paperId}</h1>
      <p className="text-slate-400 mt-2">Review and approve/reject this paper submission.</p>
    </div>
  );
}
