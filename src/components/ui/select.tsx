import clsx from "clsx";
import { type SelectHTMLAttributes, type FC } from "react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export const Select: FC<SelectProps> = ({ className, ...props }) => (
  <select
    {...props}
    className={clsx(
      "w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-800 outline-none transition duration-200 focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:cursor-not-allowed disabled:opacity-60",
      className,
    )}
  />
);
