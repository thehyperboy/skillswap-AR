import { type FC, type HTMLAttributes } from "react";

type SectionHeadingProps = HTMLAttributes<HTMLDivElement> & {
  title: string;
  subtitle?: string;
};

export const SectionHeading: FC<SectionHeadingProps> = ({ title, subtitle, className, ...props }) => (
  <div {...props} className={`mb-8 ${className ?? ""}`}>
    <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-brand">{subtitle}</p>
    <h2 className="text-3xl font-extrabold tracking-tight text-charcoal sm:text-4xl">{title}</h2>
  </div>
);
