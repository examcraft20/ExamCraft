export function HowItWorks() {
  const steps = [
    { step: "1", title: "Set up your institution", desc: "Configure your academic structure, subjects, and invite your team members." },
    { step: "2", title: "Build your question bank", desc: "Import your questions and construct dynamic paper templates easily." },
    { step: "3", title: "Generate & approve", desc: "Automate paper generation, run approvals, and export exam papers." }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-[#1e293b]/30 border-y border-white/5">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-20">How It Works</h2>
        <div className="flex flex-col lg:flex-row items-start justify-between relative max-w-6xl mx-auto">
          {/* Horizontal Connecting Line */}
          <div className="hidden lg:block absolute top-[1.5rem] left-[10%] right-[10%] h-px bg-gradient-to-r from-indigo-500/0 via-indigo-500/50 to-indigo-500/0" />
          {/* Vertical Connecting Line for Mobile */}
          <div className="block lg:hidden absolute top-10 bottom-10 left-1/2 -translate-x-1/2 w-px bg-gradient-to-b from-indigo-500/0 via-indigo-500/50 to-indigo-500/0" />
          
          {steps.map((item, idx) => (
            <div key={idx} className="relative z-10 flex flex-col items-center flex-1 mb-16 lg:mb-0 px-4 group">
              <div className="w-12 h-12 rounded-full bg-[#0f172a] border-2 border-indigo-500/50 flex items-center justify-center text-xl font-bold text-indigo-400 mb-8 shadow-[0_0_20px_rgba(99,102,241,0.2)] group-hover:border-indigo-400 group-hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] group-hover:scale-110 transition-all duration-300">
                {item.step}
              </div>
              <h3 className="text-xl font-semibold text-white mb-4 tracking-wide">{item.title}</h3>
              <p className="text-slate-400 max-w-xs">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
