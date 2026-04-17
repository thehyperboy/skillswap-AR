"use client";

import Link from "next/link";
import { animations, transitions, hoverEffects } from "@/lib/animations";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-brand-soft bg-gradient-to-br from-white/95 via-brand-soft/20 to-white/85 p-6 shadow-glow backdrop-blur-sm sm:p-10 lg:p-14">
      {/* Animated background gradient */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_#f3f8ff_0%,_transparent_45%),_radial-gradient(circle_at_70%_30%,_#ffecd6_0%,_transparent_45%)]" />
        <div className="absolute top-0 right-0 h-96 w-96 bg-brand-light/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 h-80 w-80 bg-brand-boost/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <div className="grid gap-10 lg:grid-cols-2 lg:items-center relative z-10">
        {/* Left content */}
        <div className="space-y-6 animate-slideInLeft">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-soft border border-brand/10 px-4 py-2 text-xs font-semibold text-brand shadow-sm hover:shadow-md transition-all duration-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand" />
            </span>
            🔥 Community-first • Live beta
          </div>

          {/* Heading */}
          <div className="space-y-3">
            <h1 className="text-4xl font-bold leading-tight text-charcoal sm:text-5xl lg:text-6xl font-heading">
              SkillSwap AR
            </h1>
            <h2 className="text-2xl sm:text-3xl font-semibold bg-gradient-to-r from-brand to-brand-boost bg-clip-text text-transparent">
              Discover, connect, and trade skills nearby.
            </h2>
          </div>

          {/* Description */}
          <p className="max-w-xl text-base text-slate-600 sm:text-lg leading-relaxed">
            A location-aware market of learning pathways. Find educators and collaborators near you, host sessions, gather SkillKarma, and become a local skill landmark.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link href="/explore" className={`inline-flex items-center justify-center rounded-lg gap-2 bg-brand px-6 py-3 text-sm font-semibold text-white shadow-soft hover:shadow-lg hover:bg-[#24913d] ${transitions.normal} group`}>
              <span>Start exploring</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
            <Link href="/dashboard" className={`inline-flex items-center justify-center rounded-lg border border-brand px-6 py-3 text-sm font-semibold text-brand bg-white hover:bg-brand-soft ${transitions.normal}`}>
              Dashboard
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="flex items-center gap-4 text-xs text-slate-600 pt-4 border-t border-slate-200/50">
            <div className="flex items-center gap-1">
              <span className="text-lg">✓</span>
              <span>Free to join</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-lg">✓</span>
              <span>No credit card</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-lg">✓</span>
              <span>Private location data</span>
            </div>
          </div>
        </div>

        {/* Right illustration */}
        <div className="relative h-72 sm:h-96 overflow-hidden rounded-2xl border border-brand-soft/50 bg-gradient-to-br from-brand-light/30 via-brand-soft/50 to-white shadow-inner animate-slideInRight">
          {/* Animated routes */}
          <div className="absolute inset-0 opacity-50">
            <svg viewBox="0 0 450 300" className="h-full w-full">
              <defs>
                <linearGradient id="route" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#56b5e5" stopOpacity=".65" />
                  <stop offset="100%" stopColor="#f2a662" stopOpacity=".65" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              {/* Main route */}
              <path
                d="M15 240 C80 180 150 250 280 186 C340 160 390 220 420 190"
                fill="none"
                stroke="url(#route)"
                strokeWidth="8"
                strokeLinecap="round"
                filter="url(#glow)"
                className="animate-pulse"
              />
              {/* Nodes */}
              <circle cx="15" cy="240" r="6" fill="#56b5e5" opacity="0.8" className="animate-bounce" />
              <circle cx="280" cy="186" r="6" fill="#f2a662" opacity="0.8" className="animate-bounce" style={{ animationDelay: "0.2s" }} />
              <circle cx="420" cy="190" r="6" fill="#2B7D3F" opacity="0.8" className="animate-bounce" style={{ animationDelay: "0.4s" }} />
            </svg>
          </div>

          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_35%,_rgba(44,137,211,0.15),_transparent_45%),_radial-gradient(circle_at_80%_40%,_rgba(242,166,98,0.2),_transparent_40%)]" />
          <div className="absolute inset-0 bg-brand-soft/50 backdrop-blur-[1px]" />

          {/* Floating elements */}
          <div className="absolute top-6 right-6 h-12 w-12 rounded-lg bg-white/80 shadow-md flex items-center justify-center text-lg animate-bounce" style={{ animationDelay: "0s" }}>
            🗺️
          </div>
          <div className="absolute bottom-6 left-6 h-12 w-12 rounded-lg bg-white/80 shadow-md flex items-center justify-center text-lg animate-bounce" style={{ animationDelay: "0.3s" }}>
            ⭐
          </div>
        </div>
      </div>
    </section>
  );
}
