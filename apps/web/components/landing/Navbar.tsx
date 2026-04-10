import Link from "next/link";
import { BookOpen } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0f172a]/70 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <BookOpen className="h-6 w-6 text-indigo-500 group-hover:text-indigo-400 transition-colors" />
          <span className="text-xl font-bold text-white tracking-tight">ExamCraft</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <Link href="#features" className="hover:text-white transition-colors">Features</Link>
          <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
          <Link href="#about" className="hover:text-white transition-colors">About</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
            Login
          </Link>
          <Link href="/signup" className="text-sm font-medium px-5 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20">
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
