import { InviteAcceptanceCard } from '@/components/auth/InviteAcceptanceCard';
import { serverApiRequest } from '@/lib/api/server';
import { notFound } from 'next/navigation';

export default async function InviteTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  if (!token) {
    notFound();
  }

  // Pre-validate token server-side
  let invitationData = null;
  let validationError = null;

  try {
    const res = await serverApiRequest<{
      invitation: {
        id: string;
        institutionId: string;
        email: string;
        roleCode: string;
        status: string;
        expiresAt: string;
        institutionName: string;
      };
    }>("/invitations/preview?token=" + encodeURIComponent(token));
    invitationData = res.invitation;
  } catch (e) {
    validationError = e instanceof Error ? e.message : "Invalid or expired invite";
  }

  return (
    <InviteAcceptanceCard 
      token={token} 
      initialData={invitationData} 
      initialError={validationError} 
    />
  );
}
