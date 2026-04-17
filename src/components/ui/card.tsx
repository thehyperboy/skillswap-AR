import clsx from "clsx";
import { type FC, type HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "accent" | "soft";
};

const cardStyles: Record<NonNullable<CardProps["variant"]>, string> = {
  default: "bg-white border border-slate-200 shadow-card",
  accent: "bg-gradient-to-r from-brand-soft to-[#fff7eb] border border-brand/20 shadow-medium",
  soft: "bg-[#f9fbfd] border border-slate-100 shadow-low",
};

export const Card: FC<CardProps> = ({ className, variant = "default", ...props }) => (
  <div
    {...props}
    className={clsx("rounded-xl p-5", cardStyles[variant], className)}
  />
);
