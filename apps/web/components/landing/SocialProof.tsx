export function SocialProof() {
  return (
    <section className="py-12 border-y border-white/5 bg-white/[0.01]">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm font-medium text-slate-400 mb-8 tracking-widest uppercase">Trusted by academic teams at</p>
        <div className="flex flex-wrap justify-center items-center gap-x-16 gap-y-8 text-slate-500 font-bold text-xl md:text-2xl opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
          <span className="font-serif">Delhi College of Engineering</span>
          <span className="font-sans tracking-tight">Bright Minds Tuition</span>
          <span className="font-mono">Oxford Prep</span>
          <span className="italic">Global Academy</span>
          <span className="tracking-widest uppercase text-lg">Apex Institute</span>
        </div>
      </div>
    </section>
  );
}
