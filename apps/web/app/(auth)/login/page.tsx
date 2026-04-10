import { Suspense } from "react";
import { AuthPage } from "../../../components/auth/AuthPage";

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="w-full min-h-[400px] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <AuthPage />
    </Suspense>
  );
}
