"use client";

import { SectionHeading } from "@/components/ui/section-heading";
import { Card } from "@/components/ui/card";
import { Pill } from "@/components/ui/pill";
import { transitions } from "@/lib/animations";

const skills = [
  { name: "Urban Gardening", proficiency: 28, tag: "Green", icon: "🌱" },
  { name: "Mobile Photography", proficiency: 16, tag: "Creative", icon: "📸" },
  { name: "Intro to JavaScript", proficiency: 34, tag: "Dev", icon: "💻" },
  { name: "Small Business Planning", proficiency: 22, tag: "Business", icon: "📈" },
];

export function FeaturedSkillsSection() {
  return (
    <section className="space-y-8 rounded-3xl border border-brand-soft/30 bg-gradient-to-br from-white via-brand-soft/10 to-white p-6 shadow-glow sm:p-10">
      <SectionHeading 
        title="Featured local skills" 
        subtitle="What your neighborhood is teaching right now" 
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {skills.map((skill, idx) => (
          <div
            key={skill.name}
            className="animate-slideInUp"
            style={{ animationDelay: `${idx * 0.1}s` }}
          >
            <Card 
              variant="default" 
              className={`border-brand-soft/40 bg-white/70 backdrop-blur-sm p-5 h-full group cursor-pointer ${transitions.normal} hover:shadow-lg hover:-translate-y-1`}
            >
              {/* Icon */}
              <div className="mb-4 h-12 w-12 rounded-lg bg-brand-soft/50 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                {skill.icon}
              </div>

              <div className="mb-3 flex items-start justify-between gap-2">
                <h3 className="text-lg font-semibold text-charcoal group-hover:text-brand transition-colors">{skill.name}</h3>
                <Pill variant="skill">{skill.tag}</Pill>
              </div>

              <p className="text-sm text-slate-600 mb-4">{skill.proficiency}+ local learners in the last 30 days</p>

              {/* Progress bar */}
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-brand to-brand-boost transition-all duration-1000 ease-out"
                  style={{ width: `${Math.min(skill.proficiency * 2.5, 100)}%` }} 
                />
              </div>

              {/* Hover indicator */}
              <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-brand font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                View teachers →
              </div>
            </Card>
          </div>
        ))}
      </div>
    </section>
  );
}
