import Link from "next/link";

export function CTABanner() {
  return (
    <section className="py-24 relative px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="rounded-3xl bg-gradient-to-br from-indigo-900/40 via-violet-900/40 to-[#0f172a] border border-indigo-500/20 p-12 md:p-24 text-center relative overflow-hidden backdrop-blur-xl shadow-2xl">
          {/* Glowing Accents */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/20 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px]" />
          
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-8 tracking-tight drop-shadow-md">Ready to modernize your exam workflow?</h2>
            <Link href="/signup" className="inline-block px-10 py-5 rounded-xl bg-indigo-600 text-white font-bold text-lg hover:bg-indigo-500 hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(99,102,241,0.4)]">
              Get Started Free
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
