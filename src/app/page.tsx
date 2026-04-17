import Link from "next/link";
import { HeroSection } from "@/components/sections/hero";
import { HowItWorksSection } from "@/components/sections/how-it-works";
import { FeaturedSkillsSection } from "@/components/sections/featured-skills";
import { CtaSection } from "@/components/sections/cta";
import { WhyChooseUsBanner } from "@/components/sections/features-grid";
import { StatCard } from "@/components/ui/stat-card";

export const metadata = {
  title: "SkillSwap AR - Discover Local Skills, Build Reputation",
  description: "A location-aware platform to exchange skills with your neighbors. Learn from local educators, earn SkillKarma, and become a community expert.",
};

export default function HomePage() {
  return (
    <div className="space-y-16 sm:space-y-20 py-8 sm:py-12">
      {/* Hero */}
      <section>
        <HeroSection/>
      </section>

      {/* Stats */}
      <section className="space-y-8">
        <div className="text-center space-y-3">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand">Community Impact</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-charcoal">Growing ecosystem of skill exchange</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard title="Neighborhoods" value="38" label="Active skill communities" />
          <StatCard title="Sessions" value="1.2K" label="Sessions completed this month" />
          <StatCard title="SkillKarma" value="4.8K" label="Reputation points earned" />
        </div>
      </section>

      {/* Features */}
      <section>
        <WhyChooseUsBanner />
      </section>

      {/* Featured Skills */}
      <section>
        <FeaturedSkillsSection />
      </section>

      {/* How It Works */}
      <section>
        <HowItWorksSection />
      </section>

      {/* Final CTA */}
      <section>
        <CtaSection />
      </section>
    </div>
  );
}

