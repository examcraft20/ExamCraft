import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Generate Paper",
};

export default function GeneratePaperPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Generate Paper Wizard</h1>
      <p>This is a stub for generating a new paper.</p>
    </div>
  );
}
