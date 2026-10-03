import { ReactNode } from "react";

export type BadgeVariant =
  | "success"
  | "danger"
  | "warning"
  | "indigo"
  | "sky"
  | "neutral";

export interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  dot?: boolean;
  className?: string;
  size?: "sm" | "md";
}

const badgeVariants: Record<BadgeVariant, { bg: string; dot: string }> = {
  success: {
    bg: "bg-emerald-50 text-emerald-700 border-emerald-200/90",
    dot: "bg-emerald-500",
  },
  danger: {
    bg: "bg-rose-50 text-rose-700 border-rose-200/90",
    dot: "bg-rose-500",
  },
  warning: {
    bg: "bg-amber-50 text-amber-700 border-amber-200/90",
    dot: "bg-amber-500",
  },
  indigo: {
    bg: "bg-indigo-50 text-indigo-700 border-indigo-200/90",
    dot: "bg-indigo-600",
  },
  sky: {
    bg: "bg-sky-50 text-sky-700 border-sky-200/90",
    dot: "bg-sky-500",
  },
  neutral: {
    bg: "bg-slate-100 text-slate-700 border-slate-200",
    dot: "bg-slate-400",
  },
};

export function Badge({
  variant = "neutral",
  children,
  dot = false,
  className = "",
  size = "md",
}: BadgeProps) {
  const styles = badgeVariants[variant];
  const sizeClasses =
    size === "sm"
      ? "text-[10px] px-2 py-0.5 rounded-md gap-1 font-extrabold tracking-wide"
      : "text-xs px-2.5 py-1 rounded-lg gap-1.5 font-bold tracking-wide";

  return (
    <span
      className={`inline-flex items-center border capitalize select-none ${styles.bg} ${sizeClasses} ${className}`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${styles.dot} shrink-0`} />}
      <span>{children}</span>
    </span>
  );
}

export default Badge;
