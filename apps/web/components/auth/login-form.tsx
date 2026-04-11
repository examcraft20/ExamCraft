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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorObj, setErrorObj] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorObj(null);

    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      setErrorObj(error.message);
      setIsSubmitting(false);
      return;
    }

    const role = data?.user?.app_metadata?.role || data?.user?.user_metadata?.role;
    
    if (role === 'super_admin') {
      router.push('/dashboard');
    } else if (role === 'academic_head') {
      router.push('/dashboard');
    } else if (role === 'reviewer_approver' || role === 'reviewer') {
      router.push('/dashboard');
    } else if (role === 'institution_admin' || role === 'faculty') {
      router.push('/dashboard');
    } else {
      router.push('/dashboard');
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
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@institution.edu"
          aria-label="Email address"
          className={`${INPUT_FIELD_CLASSES} ${errorObj ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : ''}`}
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            aria-label="Password"
            className={`${INPUT_FIELD_CLASSES} ${errorObj ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : ''} pr-12`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-1"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>
      
      {errorObj && (
        <p className="text-red-400 text-sm mt-2">{errorObj}</p>
      )}

      <div className="flex justify-end pt-1">
        <Link href="/forgot-password" aria-disabled={isSubmitting} className={`text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors ${isSubmitting ? 'pointer-events-none opacity-50' : ''}`}>
          Forgot password?
        </Link>
      </div>

      <button
        disabled={isSubmitting}
        type="submit"
        className="w-full mt-4 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold hover:brightness-110 active:scale-[0.98] focus:ring-4 focus:ring-indigo-500/30 outline-none transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(99,102,241,0.3)]"
      >
        {isSubmitting ? (
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
