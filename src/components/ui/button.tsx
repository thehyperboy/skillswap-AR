import clsx from "clsx";
import { type ButtonHTMLAttributes, type FC } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline" | "cta";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
};

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-brand text-white hover:bg-[#24913d] focus-visible:ring-brand/70",
  secondary: "bg-white text-charcoal border border-brand/20 hover:bg-brand-soft focus-visible:ring-brand/70",
  ghost: "bg-transparent text-charcoal hover:bg-slate-100 focus-visible:ring-brand/50",
  outline: "bg-transparent text-brand border border-brand hover:bg-brand-soft focus-visible:ring-brand/70",
  cta: "bg-brand-boost text-white shadow-card hover:bg-[#e69142] focus-visible:ring-[#f2a662]/70",
};

const sizeStyles: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-3 text-base",
};

export const Button: FC<ButtonProps> = ({
  className,
  variant = "primary",
  size = "md",
  ...props
}) => {
  return (
    <button
      {...props}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
    />
  );
};
