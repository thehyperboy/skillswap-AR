"use client";

import Link from "next/link";
import { transitions } from "@/lib/animations";

export function CtaSection() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-brand-soft/40 bg-gradient-to-r from-brand-soft/50 via-white/80 to-[#ffeee5]/50 p-6 shadow-glow sm:p-10 lg:p-14 backdrop-blur-sm">
      {/* Animated background elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 w-72 h-72 bg-brand-boost/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <div className="grid gap-8 md:grid-cols-2 md:items-center relative z-10">
        {/* Left: Content  */}
        <div className="space-y-4 animate-slideInLeft">
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-charcoal sm:text-4xl lg:text-5xl font-heading">
              Ready to swap skills?
            </h2>
            <p className="inline-block text-lg font-semibold bg-gradient-to-r from-brand to-brand-boost bg-clip-text text-transparent">
              Join your local skill community today
            </p>
          </div>
          <p className="max-w-xl text-base text-slate-600 leading-relaxed">
            Whether you're teaching a specialty or leveling up your toolkit, SkillSwap AR makes it easy to swap value and earn reputation in your community.
          </p>

          {/* Trust indicators */}
          <div className="space-y-2 pt-4">
            <div className="flex items-center gap-3 text-sm text-charcoal">
              <span className="text-lg">✓</span>
              <span>Set up takes less than 5 minutes</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-charcoal">
              <span className="text-lg">✓</span>
              <span>Meet educators in your neighborhood</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-charcoal">
              <span className="text-lg">✓</span>
              <span>Earn SkillKarma and local credibility</span>
            </div>
          </div>
        </div>

        {/* Right: CTAs */}
        <div className="flex flex-col gap-3 animate-slideInRight space-y-3">
          <Link href="/signup" className={`inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-brand to-[#1f6b2f] px-6 py-4 text-base font-bold text-white shadow-lg hover:shadow-xl hover:-translate-y-1 ${transitions.normal} group`}>
            <span>Create a profile for free</span>
            <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
          </Link>

          <Link href="/explore" className={`inline-flex items-center justify-center rounded-lg border border-brand/30 bg-white/60 backdrop-blur-sm px-6 py-4 text-base font-semibold text-charcoal hover:bg-white hover:border-brand hover:shadow-md ${transitions.normal}`}>
            Explore local skills instead
          </Link>

          {/* Secondary info */}
          <p className="text-xs text-slate-600 text-center pt-2">
            No credit card required. Start connecting today.
          </p>
        </div>
      </div>
    </section>
  );
}
