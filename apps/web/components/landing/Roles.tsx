export function Roles() {
  const roles = [
    { title: "Institution Admin", desc: "Manage overarching users, settings, branding, and billing for the entire platform." },
    { title: "Faculty", desc: "Create and submit new questions to the bank and draft exam papers for review." },
    { title: "Academic Head", desc: "Oversee department coverage, manage templates, and review all submissions." },
    { title: "Reviewer", desc: "Approve or reject draft papers before locking them down for secure publishing." }
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-900/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Built for every role in your institution</h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">Role-based access control ensures everyone sees exactly what they need to get their job done securely.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {roles.map((r, i) => (
            <div key={i} className="p-8 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.01] border border-white/10 backdrop-blur hover:border-white/20 transition-all shadow-lg">
              <h3 className="text-xl font-semibold text-indigo-300 mb-3">{r.title}</h3>
              <p className="text-slate-300 font-light leading-relaxed">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
