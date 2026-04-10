"use client";

import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { getSupabaseBrowserClient } from "../../lib/supabase-browser";
import Link from "next/link";

export function SignupForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [institution, setInstitution] = useState("");
  const [role, setRole] = useState("Institution Admin");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorObj, setErrorObj] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorObj(null);
    
    if (password !== confirmPassword) {
      setErrorObj("Passwords do not match");
      return;
    }
    
    setIsSubmitting(true);

    const supabase = getSupabaseBrowserClient();
    
    let roleKey = 'institution_admin';
    if (role === 'Faculty') roleKey = 'faculty';
    if (role === 'Academic Head') roleKey = 'academic_head';
    if (role === 'Reviewer') roleKey = 'reviewer';
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: fullName,
          institution_name: institution,
          role: roleKey
        }
      }
    });

    if (error) {
      setErrorObj(error.message);
      setIsSubmitting(false);
      return;
    }

    router.push("/login?registered=true");
    setIsSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm text-slate-400 mb-1.5 block font-medium">Full Name</label>
        <input
          type="text"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="John Doe"
          className="bg-slate-800/60 border border-white/20 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 outline-none w-full transition-all duration-200"
        />
      </div>
      
      <div>
        <label className="text-sm text-slate-400 mb-1.5 block font-medium">Work Email</label>
        <input
          autoComplete="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@institution.edu"
          className="bg-slate-800/60 border border-white/20 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 outline-none w-full transition-all duration-200"
        />
      </div>

      <div>
        <label className="text-sm text-slate-400 mb-1.5 block font-medium">Institution Name</label>
        <input
          type="text"
          required
          value={institution}
          onChange={(e) => setInstitution(e.target.value)}
          placeholder="Global Academy"
          className="bg-slate-800/60 border border-white/20 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 outline-none w-full transition-all duration-200"
        />
      </div>

      <div>
         <label className="text-sm text-slate-400 mb-1.5 block font-medium">Role</label>
         <select
           value={role}
           onChange={(e) => setRole(e.target.value)}
           className="bg-slate-800/60 border border-white/20 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 rounded-xl px-4 py-3 text-white outline-none w-full transition-all duration-200 appearance-none [&>option]:bg-slate-800"
         >
           <option>Institution Admin</option>
           <option>Faculty</option>
           <option>Academic Head</option>
           <option>Reviewer</option>
         </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-slate-400 mb-1.5 block font-medium">Password</label>
          <div className="relative">
            <input
              autoComplete="new-password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={`bg-slate-800/60 border ${errorObj ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : 'border-white/20 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30'} rounded-xl px-4 py-3 pr-10 text-white placeholder:text-slate-500 outline-none w-full transition-all duration-200`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <div>
          <label className="text-sm text-slate-400 mb-1.5 block font-medium">Confirm</label>
          <input
            autoComplete="new-password"
            type={showPassword ? "text" : "password"}
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className={`bg-slate-800/60 border ${errorObj ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : 'border-white/20 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30'} rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:ring-2 outline-none w-full transition-all duration-200`}
          />
        </div>
      </div>
      
      {errorObj && (
        <p className="text-red-400 text-sm mt-1">{errorObj}</p>
      )}

      <button
        disabled={isSubmitting}
        type="submit"
        className="w-full mt-6 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold hover:brightness-110 active:scale-[0.98] outline-none transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(99,102,241,0.3)]"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Creating account...
          </>
        ) : (
          "Create Account"
        )}
      </button>
    </form>
  );
}
