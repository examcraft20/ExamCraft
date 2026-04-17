import { Metadata } from "next";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset Password | ExamCraft",
  description: "Securely reset your identity access keys.",
};

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  
  return (
    <AuthLayout>
      <ResetPasswordForm token={token} />
    </AuthLayout>
  );
}
