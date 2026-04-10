import { Metadata } from "next";
import { AuthLayout } from "../../../../components/auth/AuthLayout";
import { ResetPasswordForm } from "../../../../components/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset Password | ExamCraft",
  description: "Securely reset your password.",
};

export default function ResetPasswordPage() {
  return (
    <AuthLayout>
      <ResetPasswordForm />
    </AuthLayout>
  );
}
