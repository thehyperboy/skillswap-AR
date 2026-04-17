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
            {
              icon: "📅",
              title: "Flexible Scheduling",
              description: "Online, offline, or hybrid sessions to fit your lifestyle"
            },
            {
              icon: "💬",
              title: "In-App Messaging",
              description: "Communicate seamlessly with other members before and after sessions"
            },
            {
              icon: "🎯",
              title: "Real Outcomes",
              description: "Learn actual skills from local experts and share your own expertise"
            }
          ].map((feature, idx) => (
            <Card key={idx} className="p-6 text-center hover:shadow-lg transition">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-charcoal">{feature.title}</h3>
              <p className="mt-2 text-slate-600 text-sm">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <HowItWorksSection />

      <FeaturedSkillsSection />

      {/* Testimonials Section */}
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-charcoal sm:text-4xl">What members say</h2>
          <p className="mt-2 text-lg text-slate-600">Join thousands learning and teaching locally</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              quote: "I learned Spanish from my neighbor and taught her web design. Best exchange ever!",
              author: "Sarah M.",
              skill: "Spanish Learner"
            },
            {
              quote: "SkillSwap AR helped me build my photography portfolio while helping others. Amazing!",
              author: "James K.",
              skill: "Photography Instructor"
            },
            {
              quote: "Found a local piano teacher within 2km. The whole process was seamless!",
              author: "Marina P.",
              skill: "Music Enthusiast"
            }
          ].map((testimonial, idx) => (
            <Card key={idx} className="p-6 bg-gradient-to-br from-brand-soft to-white">
              <p className="text-slate-700 italic">&quot;{testimonial.quote}&quot;</p>
              <div className="mt-4 border-t border-slate-200 pt-4">
                <p className="font-semibold text-charcoal">{testimonial.author}</p>
                <p className="text-sm text-brand">{testimonial.skill}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <CtaSection />

      {/* Final CTA */}
      <section className="rounded-2xl border border-brand-soft bg-gradient-to-r from-brand/5 to-transparent p-8 sm:p-12">
        <div className="grid gap-8 md:grid-cols-2 items-center">
          <div>
            <h3 className="text-3xl font-bold text-charcoal">Ready to begin?</h3>
            <p className="mt-2 text-lg text-slate-600">Join your local skill exchange community today and unlock unlimited learning opportunities.</p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link href="/signup">
                <Button className="bg-brand hover:bg-[#2a6f3b] text-white px-6 py-3">
                  Get Started Free
                </Button>
              </Link>
              <Link href="/how-it-works">
                <Button variant="outline" className="border-brand text-brand px-6 py-3">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
          <div className="hidden md:block text-center">
            <div className="inline-block bg-gradient-to-br from-brand/20 to-brand/5 rounded-full p-12">
              <div className="text-6xl">🚀</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

