"use client";

import Link from "next/link";
import { useState } from "react";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-brand-soft/90 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-brand to-mapBlue text-white shadow-card text-xl" aria-hidden="true">
            📍
          </span>
          <div>
            <p className="text-lg font-extrabold text-charcoal">SkillSwap AR</p>
            <p className="text-xs font-semibold tracking-wider text-slate-600">Local skill exchange</p>
          </div>
        </Link>

        <button
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-charcoal hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/70 lg:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-label="Toggle site navigation"
        >
          ☰ Menu
        </button>

        <nav className="hidden items-center gap-2 text-sm font-medium text-slate-700 lg:flex">
          {[
            { href: "/explore", label: "Explore" },
            { href: "/requests/inbox", label: "Requests" },
            { href: "/how-it-works", label: "How it works" },
            { href: "/dashboard", label: "Dashboard" },
          ].map(({ href, label }) => (
            <Link key={href} href={href} className="rounded-lg px-3 py-2 transition hover:bg-brand-soft">
              {label}
            </Link>
          ))}
          <Link href="/login" className="rounded-lg border border-brand px-3 py-2 text-brand transition hover:bg-brand-soft">
            Sign in
          </Link>
        </nav>
      </div>

      {open && (
        <div className="lg:hidden border-t border-brand-soft bg-white/95 px-4 py-4 shadow-card">
          <div className="flex flex-col gap-2">
            <Link href="/explore" className="rounded-lg px-3 py-2 text-sm text-charcoal hover:bg-brand-soft">
              Explore
            </Link>
            <Link href="/how-it-works" className="rounded-lg px-3 py-2 text-sm text-charcoal hover:bg-brand-soft">
              How it works
            </Link>
            <Link href="/dashboard" className="rounded-lg px-3 py-2 text-sm text-charcoal hover:bg-brand-soft">
              Dashboard
            </Link>
            <Link href="/login" className="rounded-lg border border-brand px-3 py-2 text-sm text-brand hover:bg-brand-soft">
              Sign in
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
