import React from "react";
import { Zap } from "lucide-react";

export interface LoaderProps {
  size?: "sm" | "md" | "lg" | "xl";
  label?: string;
  sublabel?: string;
  fullPage?: boolean;
  overlay?: boolean;
  className?: string;
}

export function Loader({
  size = "md",
  label,
  sublabel,
  fullPage = false,
  overlay = false,
  className = "",
}: LoaderProps) {
  // Dimension tokens
  const sizeMap = {
    sm: {
      outer: "h-6 w-6 border-2",
      inner: "h-3.5 w-3.5 border-2",
      icon: "h-2.5 w-2.5",
      text: "text-xs",
      subtext: "text-[10px]",
    },
    md: {
      outer: "h-11 w-11 border-[2.5px]",
      inner: "h-6 w-6 border-2",
      icon: "h-4 w-4",
      text: "text-sm",
      subtext: "text-xs",
    },
    lg: {
      outer: "h-16 w-16 border-[3px]",
      inner: "h-9 w-9 border-2",
      icon: "h-5 w-5",
      text: "text-base",
      subtext: "text-xs",
    },
    xl: {
      outer: "h-20 w-20 border-[3.5px]",
      inner: "h-11 w-11 border-[2.5px]",
      icon: "h-6 w-6",
      text: "text-lg",
      subtext: "text-sm",
    },
  };

  const currentSize = sizeMap[size];

  const content = (
    <div
      className={`flex flex-col items-center justify-center gap-3.5 ${className}`}
      role="status"
      aria-live="polite"
    >
      {/* Dual Concentric Glowing Gradient Rings */}
      <div className="relative flex items-center justify-center">
        {/* Ambient Glow */}
        <div
          className={`absolute rounded-full bg-gradient-to-tr from-indigo-500/25 via-violet-500/25 to-amber-500/20 blur-lg ${
            size === "sm" ? "h-8 w-8" : size === "md" ? "h-14 w-14" : size === "lg" ? "h-20 w-20" : "h-24 w-24"
          }`}
        />

        {/* Outer Clockwise Rotating Ring */}
        <div
          className={`${currentSize.outer} rounded-full border-slate-200 border-t-indigo-600 border-r-violet-600 animate-spin`}
          style={{ animationDuration: "1s" }}
        />

        {/* Inner Counter-Clockwise Rotating Ring */}
        <div
          className={`absolute ${currentSize.inner} rounded-full border-transparent border-b-amber-500 border-l-rose-500 animate-spin`}
          style={{ animationDirection: "reverse", animationDuration: "1.4s" }}
        />

        {/* Pulsing Core Brand Icon */}
        <div className="absolute flex items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 shadow-md shadow-indigo-500/30 p-1 animate-pulse">
          <Zap className={`${currentSize.icon} text-white fill-white`} />
        </div>
      </div>

      {/* Label and Sublabel */}
      {(label || sublabel) && (
        <div className="flex flex-col items-center text-center max-w-xs px-2">
          {label && (
            <p className={`font-extrabold text-slate-800 tracking-tight ${currentSize.text}`}>
              {label}
            </p>
          )}
          {sublabel && (
            <p className={`font-semibold text-slate-400 mt-0.5 ${currentSize.subtext}`}>
              {sublabel}
            </p>
          )}

          {/* SmartElectronics Brand Keyword Watermark */}
          <div className="flex items-center gap-1 mt-1 opacity-75">
            <span className="text-[9px] font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500 uppercase select-none">
              Smart
            </span>
            <span className="text-cyan-500 font-black text-[9px] animate-pulse select-none">⚡</span>
            <span className="text-[9px] font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-indigo-500 to-blue-600 uppercase select-none">
              Electronics
            </span>
          </div>
        </div>
      )}

      <span className="sr-only">{label ?? "Loading content..."}</span>
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-md transition-all">
        <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-8 shadow-2xl shadow-indigo-500/10 flex flex-col items-center gap-2">
          {content}
          <div className="mt-1 flex items-center gap-1.5 border-t border-slate-100 pt-3">
            <span className="text-[10px] font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-indigo-600 to-cyan-500 uppercase select-none">SmartElectronics</span>
            <span className="text-[10px] text-cyan-500 font-black select-none animate-pulse">⚡</span>
          </div>
        </div>
      </div>
    );
  }

  if (overlay) {
    return (
      <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/75 backdrop-blur-xs rounded-2xl transition-all">
        {content}
      </div>
    );
  }

  return <div className="py-12 flex justify-center items-center w-full">{content}</div>;
}

// ── Skeletons for Rich Lazy Loading ──

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs overflow-hidden animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-4 w-14 rounded-md bg-slate-200" />
        <div className="h-7 w-7 rounded-full bg-slate-100" />
      </div>
      <div className="relative mb-4 h-44 w-full rounded-xl bg-slate-100 flex items-center justify-center">
        <Zap className="h-8 w-8 text-slate-200" />
      </div>
      <div className="space-y-2 mb-4 flex-1">
        <div className="h-3 w-16 rounded bg-slate-100" />
        <div className="h-4 w-full rounded bg-slate-200" />
        <div className="h-4 w-3/4 rounded bg-slate-200" />
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div className="h-5 w-20 rounded bg-slate-200" />
        <div className="h-8 w-24 rounded-xl bg-slate-200" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-xs animate-pulse">
      <div className="bg-slate-50 border-b border-slate-200/80 px-6 py-4 flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-4 flex-1 rounded bg-slate-200" />
        ))}
      </div>
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="px-6 py-4 flex gap-4 items-center">
            {Array.from({ length: cols }).map((_, c) => (
              <div
                key={c}
                className={`h-4 rounded bg-slate-100 ${c === 0 ? "w-1/4" : "flex-1"}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
