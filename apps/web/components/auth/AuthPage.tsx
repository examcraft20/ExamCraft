"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { LoginForm } from "./LoginForm";
import { SignupForm } from "./SignupForm";

export function AuthPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'signup') {
      setActiveTab('signup');
    } else {
      setActiveTab('login');
    }
  }, [searchParams]);

  const handleTabChange = (tab: 'login' | 'signup') => {
    setActiveTab(tab);
    const url = tab === 'signup' ? '/login?tab=signup' : '/login';
    window.history.replaceState({}, '', url);
  };

  return (
    <div className="p-8 sm:p-10 rounded-[2rem] bg-white/[0.02] border border-white/10 backdrop-blur-xl shadow-2xl transition-all duration-300">
      {/* Tab Switcher */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-1 flex w-full mb-8">
        <button
          onClick={() => handleTabChange('login')}
          className={`flex-1 text-center py-2 px-4 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
            activeTab === 'login' 
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Sign In
        </button>
        <button
          onClick={() => handleTabChange('signup')}
          className={`flex-1 text-center py-2 px-4 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
            activeTab === 'signup' 
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Create Account
        </button>
      </div>

      {/* Heading Section */}
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight transition-all duration-200">
          {activeTab === 'login' ? "Welcome back" : "Get started"}
        </h2>
        <p className="text-slate-400 font-light transition-all duration-200">
          {activeTab === 'login' 
            ? "Sign in to your ExamCraft account" 
            : "Set up your institution on ExamCraft"}
        </p>
      </div>

      {/* Form Content with Fade Transition */}
      <div className="animate-in fade-in duration-300">
        {activeTab === 'login' ? <LoginForm /> : <SignupForm />}
      </div>
    </div>
  );
}
