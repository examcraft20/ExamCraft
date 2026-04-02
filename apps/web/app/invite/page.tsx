import { InviteAcceptanceForm } from "../../components/auth/invite-acceptance-form";

export default function InvitePage({
  searchParams
}: {
  searchParams?: {
    token?: string;
  };
}) {
  return (
    <main className="page-shell">
      <InviteAcceptanceForm initialToken={searchParams?.token} />
    </main>
  );
}
