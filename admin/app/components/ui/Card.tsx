import { ReactNode } from "react";

export interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className = "", hover = false }: CardProps) {
  return (
    <div
      className={`bg-white border border-slate-200/90 rounded-2xl shadow-xs ${
        hover ? "card-lift" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`p-5 border-b border-slate-100 flex items-center justify-between gap-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <h3 className={`font-bold text-sm text-slate-900 ${className}`}>{children}</h3>;
}

export function CardDescription({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <p className={`text-xs text-slate-400 mt-0.5 ${className}`}>{children}</p>;
}

export function CardContent({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`p-5 ${className}`}>{children}</div>;
}

export function CardFooter({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`p-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl ${className}`}>
      {children}
    </div>
  );
}

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  accentColor?: "indigo" | "emerald" | "violet" | "amber" | "rose";
  className?: string;
}

const statCardAccents = {
  indigo: {
    bg: "bg-indigo-50 border-indigo-100 text-indigo-600",
  },
  emerald: {
    bg: "bg-emerald-50 border-emerald-100 text-emerald-600",
  },
  violet: {
    bg: "bg-violet-50 border-violet-100 text-violet-600",
  },
  amber: {
    bg: "bg-amber-50 border-amber-100 text-amber-600",
  },
  rose: {
    bg: "bg-rose-50 border-rose-100 text-rose-600",
  },
};

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  accentColor = "indigo",
  className = "",
}: StatCardProps) {
  const accent = statCardAccents[accentColor];

  return (
    <div
      className={`bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs card-lift transition-all ${className}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{title}</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{value}</h3>
          {(subtitle || trend) && (
            <div className="flex items-center gap-1.5 mt-1 text-xs">
              {trend && (
                <span
                  className={`font-bold ${
                    trend.isPositive ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {trend.value}
                </span>
              )}
              {subtitle && <span className="text-slate-400 font-medium">{subtitle}</span>}
            </div>
          )}
        </div>

        <div
          className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 ${accent.bg}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

export default Card;
