import clsx from "clsx";
import { type TextareaHTMLAttributes, type FC } from "react";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea: FC<TextareaProps> = ({ className, ...props }) => (
  <textarea
    {...props}
    className={clsx(
      "w-full min-h-[120px] rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition duration-200 placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:cursor-not-allowed disabled:opacity-60",
      className,
    )}
  />
);
