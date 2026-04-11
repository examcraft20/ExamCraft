import { Metadata } from "next";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset Password | ExamCraft",
  description: "Securely reset your password.",
};

export default function ResetPasswordPage({
  params,
}: {
  params: { token: string };
}) {
  return (
    <AuthLayout>
      <ResetPasswordForm token={params.token} />
    </AuthLayout>
  );
}
