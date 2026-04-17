import clsx from "clsx";
import { type FC, type HTMLAttributes } from "react";

type PillProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "skill" | "highlight";
};

const pillStyles: Record<NonNullable<PillProps["variant"]>, string> = {
  default: "bg-slate-100 text-slate-700",
  skill: "bg-brand-soft text-brand",
  highlight: "bg-amber-100 text-amber-800",
};

export const Pill: FC<PillProps> = ({ className, variant = "default", ...props }) => (
  <span
    {...props}
    className={clsx("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold", pillStyles[variant], className)}
  />
);
