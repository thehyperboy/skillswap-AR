import { type FC } from "react";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: React.ReactNode;
};

export const EmptyState: FC<EmptyStateProps> = ({ title, description, action }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-card">
    <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-brand-soft text-brand grid place-items-center text-2xl">📍</div>
    <h3 className="text-xl font-semibold text-charcoal">{title}</h3>
    <p className="mt-2 text-slate-600">{description}</p>
    {action && <div className="mt-4">{action}</div>}
  </div>
);
