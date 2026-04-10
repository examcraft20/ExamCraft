import Link from "next/link";
import { BookOpen } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#0f172a] pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <BookOpen className="h-6 w-6 text-indigo-500 group-hover:text-indigo-400 transition-colors" />
              <span className="text-xl font-bold text-white tracking-tight">ExamCraft</span>
            </Link>
            <p className="text-slate-400 max-w-sm font-light leading-relaxed">
              The modern platform for academic assessment and exam operations. Building better workflows for institutions everywhere.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-6 tracking-wide">Product</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><Link href="#features" className="hover:text-indigo-400 transition-colors">Features</Link></li>
              <li><Link href="#pricing" className="hover:text-indigo-400 transition-colors">Pricing</Link></li>
              <li><Link href="#" className="hover:text-indigo-400 transition-colors">Global Templates</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-6 tracking-wide">Company</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><Link href="#" className="hover:text-indigo-400 transition-colors">About</Link></li>
              <li><Link href="#" className="hover:text-indigo-400 transition-colors">Support</Link></li>
              <li><Link href="#" className="hover:text-indigo-400 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <p>© {new Date().getFullYear()} ExamCraft. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
