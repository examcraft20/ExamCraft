import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Faculty Analytics",
};

export default function FacultyAnalyticsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white">Faculty Analytics</h1>
      <p className="text-slate-400 mt-2">Per-faculty contribution and performance analytics.</p>
    </div>
  );
}
