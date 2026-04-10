import { Metadata } from "next";
import { AuthLayout } from "../../../../components/auth/AuthLayout";
import { ForgotPasswordForm } from "../../../../components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot Password | ExamCraft",
  description: "Request a password reset link.",
};

export default function ForgotPasswordPage() {
  return (
    <AuthLayout>
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
