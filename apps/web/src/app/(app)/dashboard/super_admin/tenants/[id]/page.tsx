import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tenant Details",
};

export default function TenantDetailsPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Tenant Details: {params.id}</h1>
      <p>This is a stub for the tenant specifics.</p>
    </div>
  );
}
