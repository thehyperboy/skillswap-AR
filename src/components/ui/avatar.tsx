import clsx from "clsx";
import { type FC, type HTMLAttributes } from "react";

type AvatarProps = HTMLAttributes<HTMLDivElement> & {
  src?: string;
  name: string;
  size?: "sm" | "md" | "lg";
};

const sizeMap: Record<NonNullable<AvatarProps["size"]>, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
};

function initials(name: string) {
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "?";
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const Avatar: FC<AvatarProps> = ({ src, name, size = "md", className, ...props }) => (
  <div
    {...props}
    className={clsx(
      "inline-flex relative items-center justify-center overflow-hidden rounded-full text-white font-bold",
      sizeMap[size],
      className,
    )}
    aria-label={name}
  >
    {src ? (
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${src}')` }}
      />
    ) : null}
    <div className={clsx("absolute inset-0", src ? "bg-black/25" : "bg-brand")}></div>
    <span className="relative z-10">{src ? initials(name) : initials(name)}</span>
  </div>
);
