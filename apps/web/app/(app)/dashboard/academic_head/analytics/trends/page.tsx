import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trends",
};

export default function TrendsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white">Trends</h1>
      <p className="text-slate-400 mt-2">Question bank and paper generation trend analysis.</p>
    </div>
  );
}
