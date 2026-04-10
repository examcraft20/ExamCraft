import { Building, Database, LayoutTemplate, Library, GitPullRequest, BarChart } from "lucide-react";

const features = [
  {
    title: "Multi-Tenant Institution Management",
    desc: "Manage multiple branches or institutes with isolated branding, users, and settings.",
    icon: Building
  },
  {
    title: "Question Bank with Bulk Import",
    desc: "Easily upload thousands of questions via CSV and manage difficulties, topics, and outcomes.",
    icon: Database
  },
  {
    title: "Blueprint & Template Builder",
    desc: "Create comprehensive exam patterns with dynamic mark and difficulty distributions.",
    icon: LayoutTemplate
  },
  {
    title: "Global Template Library",
    desc: "Get started instantly with standard board and university formats from our extensive library.",
    icon: Library
  },
  {
    title: "Approval Workflow",
    desc: "Review, reject, or approve drafted exams before they are securely locked and published.",
    icon: GitPullRequest
  },
  {
    title: "Analytics & Reporting",
    desc: "Deep insights into question usage, faculty contribution, and syllabus coverage rates.",
    icon: BarChart
  }
];

export function FeaturesGrid() {
  return (
    <section id="features" className="py-24 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Everything you need to run exams</h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">The complete toolset to transition from manual spreadsheets to a fully automated academic platform.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="group p-8 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-sm hover:bg-white/[0.04] hover:border-white/20 transition-all duration-300 shadow-lg">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all duration-300">
                  <Icon className="w-6 h-6 text-indigo-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{f.title}</h3>
                <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
