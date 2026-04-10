import { Navbar } from "../components/landing/Navbar";
import { Hero } from "../components/landing/Hero";
import { SocialProof } from "../components/landing/SocialProof";
import { FeaturesGrid } from "../components/landing/FeaturesGrid";
import { HowItWorks } from "../components/landing/HowItWorks";
import { Roles } from "../components/landing/Roles";
import { CTABanner } from "../components/landing/CTABanner";
import { Footer } from "../components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans selection:bg-indigo-500/30 scroll-smooth">
      <Navbar />
      <main>
        <Hero />
        <SocialProof />
        <FeaturesGrid />
        <HowItWorks />
        <Roles />
        <CTABanner />
      </main>
      <Footer />
    </div>
  );
}
