import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-brand-soft bg-white/90 py-8 text-sm text-slate-600">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div>
          <p className="text-sm text-slate-600">© {new Date().getFullYear()} SkillSwap AR. Built for local learning and collaboration.</p>
          <p className="mt-1 text-xs text-slate-500">Made for communities that thrive on mutual growth.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/privacy" className="rounded-md px-2 py-1 hover:bg-brand-soft hover:text-brand">
            Privacy
          </Link>
          <Link href="/terms" className="rounded-md px-2 py-1 hover:bg-brand-soft hover:text-brand">
            Terms
          </Link>
          <Link href="/help" className="rounded-md px-2 py-1 hover:bg-brand-soft hover:text-brand">
            Help
          </Link>
        </div>
      </div>
    </footer>
  );
}
