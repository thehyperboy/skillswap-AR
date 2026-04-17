import { SectionHeading } from "@/components/ui/section-heading";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const steps = [
  {
    step: "01",
    title: "Locate your neighborhood skills",
    description: "Browse interactive map clusters and skill tags for hyperlocal connection.",
    flavor: "Discover",
  },
  {
    step: "02",
    title: "Request or offer a session",
    description: "Send collaboration requests, schedule on-demand micro-sessions, or offer open slots.",
    flavor: "Connect",
  },
  {
    step: "03",
    title: "Exchange SkillKarma",
    description: "Rate sessions, earn reputation, and unlock community status and rewards.",
    flavor: "Grow",
  },
];

export function HowItWorksSection() {
  return (
    <section className="space-y-7 rounded-3xl border border-brand-soft bg-white p-6 shadow-glow sm:p-10">
      <SectionHeading title="How SkillSwap AR works" subtitle="3 steps to local learning" />
      <div className="grid gap-4 md:grid-cols-3">
        {steps.map((item) => (
          <Card key={item.step} variant="soft" className="p-5">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-base font-bold text-brand">{item.step}</span>
              <Badge variant={item.flavor === "Connect" ? "info" : item.flavor === "Grow" ? "success" : "neutral"}>{item.flavor}</Badge>
            </div>
            <h3 className="text-lg font-semibold text-charcoal">{item.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{item.description}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
