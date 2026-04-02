import { InviteAcceptanceForm } from "../../components/auth/invite-acceptance-form";

export default function InvitePage({
  searchParams
}: {
  searchParams?: {
    token?: string;
  };
}) {
  return <InviteAcceptanceForm initialToken={searchParams?.token} />;
}
