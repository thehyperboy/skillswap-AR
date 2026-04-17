import { type FC } from "react";

type StatCardProps = {
  title: string;
  value: string;
  label: string;
  icon?: React.ReactNode;
};

export const StatCard: FC<StatCardProps> = ({ title, value, label, icon }) => (
  <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-medium">
    <div className="flex items-start gap-3">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-soft text-brand text-lg">
        {icon || "⭐"}
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
        <p className="text-2xl font-bold text-charcoal">{value}</p>
        <p className="text-sm text-slate-600">{label}</p>
      </div>
    </div>
  </article>
);
