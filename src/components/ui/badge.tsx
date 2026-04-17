import clsx from "clsx";
import { type FC, type HTMLAttributes } from "react";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: "neutral" | "success" | "info" | "warning";
};

const badgeStyles: Record<NonNullable<BadgeProps["variant"]>, string> = {
  neutral: "bg-slate-100 text-slate-700",
  success: "bg-green-100 text-green-800",
  info: "bg-blue-100 text-blue-800",
  warning: "bg-amber-100 text-amber-800",
};

export const Badge: FC<BadgeProps> = ({ className, variant = "neutral", ...props }) => (
  <span
    {...props}
    className={clsx("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold", badgeStyles[variant], className)}
  />
);
