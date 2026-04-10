import { InviteAcceptanceCard } from '../../../components/auth/InviteAcceptanceCard';

export default function InviteTokenPage({
  params,
}: {
  params: { token: string };
}) {
  return <InviteAcceptanceCard token={params.token} />;
}
