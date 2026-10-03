import Link from "next/link";
import { type ButtonHTMLAttributes, type ReactNode } from "react";

type Variant = "primary" | "secondary" | "amber" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 text-white hover:from-indigo-700 hover:via-violet-700 hover:to-indigo-700 shadow-md shadow-indigo-500/25 hover:shadow-lg hover:shadow-indigo-500/35 active:scale-[0.98]",
  secondary:
    "bg-slate-900 text-white hover:bg-slate-800 shadow-md shadow-slate-900/20 hover:shadow-lg hover:shadow-slate-900/30 active:scale-[0.98]",
  amber:
    "bg-gradient-to-r from-amber-500 to-rose-500 text-white hover:from-amber-600 hover:to-rose-600 shadow-md shadow-amber-500/20 hover:shadow-lg hover:shadow-amber-500/30 active:scale-[0.98]",
  ghost:
    "text-slate-600 hover:text-slate-900 hover:bg-indigo-50/70 active:scale-[0.98]",
  outline:
    "border border-slate-200 bg-white text-slate-900 hover:border-indigo-300 hover:bg-indigo-50/40 hover:text-indigo-800 active:scale-[0.98]",
};

const sizes: Record<Size, string> = {
  sm: "text-xs px-3.5 py-1.5 rounded-lg gap-1.5 font-bold tracking-wide",
  md: "text-sm px-5 py-2.5 rounded-xl gap-2 font-bold tracking-wide",
  lg: "text-base px-7 py-3.5 rounded-2xl gap-2.5 font-extrabold tracking-wide",
};

type BaseProps = {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
};

type ButtonProps = BaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type LinkButtonProps = BaseProps & {
  href: string;
  external?: boolean;
};

export function Button({
  variant = "primary",
  size = "md",
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center font-bold transition-all duration-200 focus-ring disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  children,
  className = "",
  external,
}: LinkButtonProps) {
  const classes = `inline-flex items-center justify-center font-bold transition-all duration-200 focus-ring ${variants[variant]} ${sizes[size]} ${className}`;

  const isExternal =
    external || href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:");

  if (isExternal) {
    return (
      <a
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
        className={classes}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
