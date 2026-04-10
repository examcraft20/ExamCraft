import { InviteAcceptanceCard } from "../../components/auth/InviteAcceptanceCard";
import { redirect } from "next/navigation";

export default function InvitePage({
  searchParams
}: {
  searchParams?: {
    token?: string;
  };
}) {
  // Support legacy query param route - redirect to dynamic route
  if (searchParams?.token) {
    redirect(`/invite/${encodeURIComponent(searchParams.token)}`);
  }

  // No token provided - show error state
  return <InviteAcceptanceCard token="" />;
}
