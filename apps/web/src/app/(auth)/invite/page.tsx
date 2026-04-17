import { InviteAcceptanceCard } from "@/components/auth/InviteAcceptanceCard";
import { redirect } from "next/navigation";

export default async function InvitePage({
  searchParams
}: {
  searchParams: Promise<{
    token?: string;
  }>;
}) {
  const params = await searchParams;
  
  // Support legacy query param route - redirect to dynamic route
  if (params.token) {
    redirect(`/invite/${encodeURIComponent(params.token)}`);
  }

  // No token provided - show error state
  return <InviteAcceptanceCard token="" initialError="No invitation token provided. Please check the link in your email." />;
}
