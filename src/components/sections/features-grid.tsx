"use client";

import { transitions } from "@/lib/animations";

interface Feature {
  icon: string;
  title: string;
  description: string;
  color: "brand" | "boost" | "map" | "sky";
}

const colorClasses = {
  brand: "from-brand/10 via-brand-soft/20",
  boost: "from-brand-boost/10 via-orange-50/20",
  map: "from-mapBlue/10 via-blue-50/20",
  sky: "from-sky/10 via-cyan-50/20",
};

interface FeaturesGridProps {
  title: string;
  subtitle?: string;
  features: Feature[];
}

/**
 * FeaturesGrid: Reusable features grid with consistent styling and motion
 */
export function FeaturesGrid({ title, subtitle, features }: FeaturesGridProps) {
  return (
    <section className="space-y-8">
      <div className="text-center space-y-3">
        <h2 className="text-3xl sm:text-4xl font-bold text-charcoal font-heading">{title}</h2>
        {subtitle && (
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">{subtitle}</p>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-3">
        {features.map((feature, idx) => (
          <div
            key={feature.title}
            className="animate-slideInUp"
            style={{ animationDelay: `${idx * 0.1}s` }}
          >
            <div
              className={`group h-full rounded-2xl border border-slate-200/50 bg-gradient-to-br ${colorClasses[feature.color]} p-6 sm:p-8 ${transitions.normal} hover:shadow-lg hover:border-slate-300/80 hover:-translate-y-2 cursor-pointer`}
            >
              {/* Icon */}
              <div className="mb-4 text-4xl group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>

              {/* Content */}
              <h3 className="text-lg font-bold text-charcoal mb-2 group-hover:text-brand transition-colors">
                {feature.title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {feature.description}
              </p>

              {/* Hover indicator */}
              <div className="mt-4 flex items-center gap-2 text-brand text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Learn more</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * WhyChooseUs: Specific features section for landing page
 */
export function WhyChooseUsBanner() {
  const features: Feature[] = [
    {
      icon: "🗺️",
      title: "Location-Based Discovery",
      description: "Find skill exchange opportunities within your neighborhood with precision location matching",
      color: "map",
    },
    {
      icon: "⭐",
      title: "SkillKarma Reputation",
      description: "Build your reputation and unlock badges through successful exchanges and community trust",
      color: "boost",
    },
    {
      icon: "🤝",
      title: "Vetted Community",
      description: "Connect with verified members and build meaningful local relationships with confidence",
      color: "sky",
    },
    {
      icon: "📅",
      title: "Availability Matching",
      description: "See when collaborators are free and find perfect meeting times automatically",
      color: "brand",
    },
    {
      icon: "💬",
      title: "Skill Reviews",
      description: "Get transparent feedback from collaborators to improve and showcase your expertise",
      color: "boost",
    },
    {
      icon: "🚀",
      title: "Zero Cost",
      description: "Start connecting immediately with no fees or credit card required. Pure skill exchange.",
      color: "sky",
    },
  ];

  return <FeaturesGrid title="Why choose SkillSwap AR?" subtitle="Everything you need for skill exchange, right in your neighborhood" features={features} />;
}
