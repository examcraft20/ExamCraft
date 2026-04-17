"use client";

import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { getSupabaseBrowserClient } from "../../lib/supabase-browser";
import { INPUT_FIELD_CLASSES } from "@examcraft/ui";
import Link from "next/link";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setPassword(""); // Clear password field on failed attempt
        if (error.message.includes("Invalid login credentials")) {
          setErrorMessage("Invalid email or password. Please try again.");
        } else if (error.message.includes("network")) {
          setErrorMessage("Network error. Please check your connection.");
        } else {
          setErrorMessage(error.message);
        }
        setIsLoading(false);
        return;
      }

      const searchParams = new URLSearchParams(window.location.search);
      const redirectTo = searchParams.get("redirect") || "/dashboard";
      router.push(redirectTo);
    } catch (err) {
      console.error("Login failed:", err);
      setErrorMessage("An unexpected error occurred. Please try again later.");
      setPassword("");
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="email-input" className="text-sm text-slate-400 mb-1.5 block font-medium">Email</label>
        <input
          id="email-input"
          autoComplete="email"
          type="email"
          required
          disabled={isLoading}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@institution.edu"
          aria-label="Email address"
          className={`${INPUT_FIELD_CLASSES} ${errorMessage ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : ''}`}
        />
      </div>

      <div>
        <label htmlFor="password-input" className="text-sm text-slate-400 mb-1.5 block font-medium">Password</label>
        <div className="relative">
          <input
            id="password-input"
            autoComplete="current-password"
            type={showPassword ? "text" : "password"}
            required
            disabled={isLoading}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            aria-label="Password"
            className={`${INPUT_FIELD_CLASSES} ${errorMessage ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : ''} pr-12`}
          />
          <button
            type="button"
            disabled={isLoading}
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-1"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>
      
      {errorMessage && (
        <p className="text-red-400 text-sm mt-2 font-medium" id="login-error-message">{errorMessage}</p>
      )}

      <div className="flex justify-end pt-1">
        <Link 
          href="/forgot-password" 
          aria-disabled={isLoading} 
          className={`text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors ${isLoading ? 'pointer-events-none opacity-50' : ''}`}
        >
          Forgot password?
        </Link>
      </div>

      <button
        disabled={isLoading}
        type="submit"
        className="w-full mt-4 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold hover:brightness-110 active:scale-[0.98] focus:ring-4 focus:ring-indigo-500/30 outline-none transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(99,102,241,0.3)]"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Signing in...
          </>
        ) : (
          "Sign In"
        )}
      </button>
    </form>
  );
}
