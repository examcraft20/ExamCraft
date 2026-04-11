import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Subscription Plans",
};

export default function PlansPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Subscription Plans</h1>
      <p>This is a stub for the subscription plan editor.</p>
    </div>
  );
}
