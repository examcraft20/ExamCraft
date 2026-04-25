"use client";

import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { INPUT_FIELD_CLASSES } from "@examcraft/ui";
import { env } from "@/lib/env";

const ROLE_MAP: Record<string, string> = {
  Faculty: "faculty",
  "Academic Head": "academic_head",
  Reviewer: "reviewer_approver",
};

export function SignupForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [institution, setInstitution] = useState("");
  const [role, setRole] = useState("Institution Admin");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isConfirmation, setIsConfirmation] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isLoading) return;

    setFieldErrors({});
    const errors: Record<string, string> = {};

    if (password.length < 8) {
      errors.password = "Password must be at least 8 characters long";
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${env.apiUrl}/v1/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          options: {
            data: {
              display_name: fullName,
              institution_name: institution,
              role: ROLE_MAP[role] || "institution_admin",
            },
          },
        }),
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        setFieldErrors({
          form: result.error?.message || "Failed to create account.",
        });
        setIsLoading(false);
        return;
      }

      setIsConfirmation(true);
      setIsLoading(false);
    } catch (error) {
      console.error("Signup failed:", error);
      setFieldErrors({
        form: "An unexpected error occurred. Please try again.",
      });
      setIsLoading(false);
    }
  }

  return (
    <>
      {isConfirmation ? (
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto">
            <svg
              className="w-8 h-8 text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white">Check your email</h2>
          <p className="text-slate-400">
            We&apos;ve sent a confirmation link to{" "}
            <span className="font-medium text-white">{email}</span>
          </p>
          <p className="text-slate-500 text-sm">
            Click the link in the email to confirm your account and get started.
          </p>
          <button
            onClick={() => router.push("/login")}
            className="w-full mt-6 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:brightness-110 active:scale-[0.98] outline-none transition-all"
          >
            Back to Sign In
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-slate-400 mb-1.5 block font-medium">
              Full Name
            </label>
            <input
              type="text"
              required
              disabled={isLoading}
              aria-label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              className={INPUT_FIELD_CLASSES}
            />
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-1.5 block font-medium">
              Work Email
            </label>
            <input
              autoComplete="email"
              type="email"
              required
              disabled={isLoading}
              aria-label="Work Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@institution.edu"
              className={INPUT_FIELD_CLASSES}
            />
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-1.5 block font-medium">
              Institution Name
            </label>
            <input
              type="text"
              required
              disabled={isLoading}
              aria-label="Institution Name"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              placeholder="Global Academy"
              className={INPUT_FIELD_CLASSES}
            />
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-1.5 block font-medium">
              Role
            </label>
            <select
              value={role}
              disabled={isLoading}
              aria-label="Select role"
              onChange={(e) => setRole(e.target.value)}
              className={`${INPUT_FIELD_CLASSES} appearance-none [&>option]:bg-slate-800`}
            >
              <option>Institution Admin</option>
              <option>Faculty</option>
              <option>Academic Head</option>
              <option>Reviewer</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-400 mb-1.5 block font-medium">
                Password
              </label>
              <div className="relative">
                <input
                  autoComplete="new-password"
                  type={showPassword ? "text" : "password"}
                  required
                  disabled={isLoading}
                  aria-label="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className={`${INPUT_FIELD_CLASSES} ${
                    fieldErrors.password
                      ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                      : ""
                  } pr-10`}
                />
                <button
                  type="button"
                  disabled={isLoading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-red-400 text-xs mt-1">
                  {fieldErrors.password}
                </p>
              )}
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1.5 block font-medium">
                Confirm
              </label>
              <input
                autoComplete="new-password"
                type={showPassword ? "text" : "password"}
                required
                disabled={isLoading}
                aria-label="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className={`${INPUT_FIELD_CLASSES} ${
                  fieldErrors.confirmPassword
                    ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                    : ""
                }`}
              />
              {fieldErrors.confirmPassword && (
                <p className="text-red-400 text-xs mt-1">
                  {fieldErrors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          {fieldErrors.form && (
            <p className="text-red-400 text-sm mt-1 text-center font-medium">
              {fieldErrors.form}
            </p>
          )}

          <button
            disabled={isLoading}
            type="submit"
            className="w-full mt-6 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold hover:brightness-110 active:scale-[0.98] outline-none transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(99,102,241,0.3)]"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>
      )}
    </>
  );
}
