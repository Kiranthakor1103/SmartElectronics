import Link from "next/link";
import { type ButtonHTMLAttributes, type ReactNode } from "react";
import { Loader2 } from "lucide-react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "success"
  | "amber";

export type ButtonSize = "sm" | "md" | "lg";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 text-white hover:from-indigo-700 hover:via-violet-700 hover:to-indigo-700 shadow-md shadow-indigo-500/25 hover:shadow-lg hover:shadow-indigo-500/35 active:scale-[0.98]",
  secondary:
    "bg-slate-900 text-white hover:bg-slate-800 shadow-md shadow-slate-900/20 hover:shadow-lg hover:shadow-slate-900/30 active:scale-[0.98]",
  outline:
    "border border-slate-200 bg-white text-slate-800 hover:border-indigo-300 hover:bg-indigo-50/40 hover:text-indigo-700 shadow-2xs active:scale-[0.98]",
  ghost:
    "text-slate-600 hover:text-slate-900 hover:bg-indigo-50/70 active:scale-[0.98]",
  danger:
    "border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100/90 hover:border-rose-300 shadow-2xs active:scale-[0.98]",
  success:
    "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100/90 hover:border-emerald-300 shadow-2xs active:scale-[0.98]",
  amber:
    "bg-gradient-to-r from-amber-500 to-rose-500 text-white hover:from-amber-600 hover:to-rose-600 shadow-md shadow-amber-500/20 active:scale-[0.98]",
};

const sizes: Record<ButtonSize, string> = {
  sm: "text-xs px-3 py-1.5 rounded-xl gap-1.5 font-bold tracking-wide",
  md: "text-xs sm:text-sm px-4 py-2 rounded-xl gap-2 font-bold tracking-wide",
  lg: "text-sm sm:text-base px-6 py-2.5 rounded-2xl gap-2.5 font-extrabold tracking-wide",
};

type BaseProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  loading?: boolean;
};

export type ButtonProps = BaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

export type ButtonLinkProps = BaseProps & {
  href: string;
  external?: boolean;
  onClick?: () => void;
};

export function Button({
  variant = "primary",
  size = "md",
  children,
  className = "",
  icon,
  iconPosition = "left",
  loading = false,
  disabled,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      disabled={isDisabled}
      className={`inline-flex flex-row items-center justify-center whitespace-nowrap font-bold transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 cursor-pointer disabled:opacity-50 disabled:pointer-events-none select-none shrink-0 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        icon && iconPosition === "left" && <span className="shrink-0 inline-flex items-center">{icon}</span>
      )}
      {children}
      {!loading && icon && iconPosition === "right" && <span className="shrink-0 inline-flex items-center">{icon}</span>}
    </button>
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  children,
  className = "",
  icon,
  iconPosition = "left",
  external,
  onClick,
}: ButtonLinkProps) {
  const classes = `inline-flex flex-row items-center justify-center whitespace-nowrap font-bold transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 cursor-pointer select-none shrink-0 ${variants[variant]} ${sizes[size]} ${className}`;

  const content = (
    <>
      {icon && iconPosition === "left" && <span className="shrink-0 inline-flex items-center">{icon}</span>}
      {children}
      {icon && iconPosition === "right" && <span className="shrink-0 inline-flex items-center">{icon}</span>}
    </>
  );

  const isExternal =
    external || href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:");

  if (isExternal) {
    return (
      <a
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
        className={classes}
        onClick={onClick}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} onClick={onClick}>
      {content}
    </Link>
  );
}
