"use client";

import React, { useState } from "react";
import { ArrowUpDown, Zap, Star, Tag, ChevronDown, ChevronUp, Check } from "lucide-react";

export type SortOption =
  | "featured"
  | "price-asc"
  | "price-desc"
  | "rating"
  | "name";

export interface SortOptionItem {
  value: SortOption;
  label: string;
  shortLabel?: string;
  icon?: React.ReactNode;
}

export const SORT_OPTIONS: SortOptionItem[] = [
  {
    value: "featured",
    label: "Featured Deals",
    shortLabel: "Featured",
    icon: <Zap className="h-3.5 w-3.5 text-amber-500" />,
  },
  {
    value: "price-asc",
    label: "Price: Low → High",
    shortLabel: "Price ↑",
    icon: <ArrowUpDown className="h-3.5 w-3.5 text-blue-500" />,
  },
  {
    value: "price-desc",
    label: "Price: High → Low",
    shortLabel: "Price ↓",
    icon: <ArrowUpDown className="h-3.5 w-3.5 text-indigo-500" />,
  },
  {
    value: "rating",
    label: "Highest Rated",
    shortLabel: "Top Rated",
    icon: <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-400" />,
  },
  {
    value: "name",
    label: "Name: A to Z",
    shortLabel: "A → Z",
    icon: <Tag className="h-3.5 w-3.5 text-slate-500" />,
  },
];

export interface SortFilterProps {
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
  variant?: "sidebar" | "pills" | "dropdown";
  className?: string;
}

export function SortFilter({
  sort,
  onSortChange,
  variant = "sidebar",
  className = "",
}: SortFilterProps) {
  const [open, setOpen] = useState(true);

  if (variant === "dropdown") {
    return (
      <select
        value={sort}
        onChange={(e) => onSortChange(e.target.value as SortOption)}
        className={`text-xs font-bold border border-slate-200 rounded-xl px-2.5 py-2 bg-white text-slate-700 focus:outline-none focus:border-blue-500 transition cursor-pointer ${className}`}
        aria-label="Sort products"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  }

  if (variant === "pills") {
    return (
      <div className={`flex items-center gap-1.5 flex-wrap ${className}`}>
        {SORT_OPTIONS.map((opt) => {
          const isActive = sort === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSortChange(opt.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? "bg-blue-600 text-white shadow-xs shadow-blue-500/25"
                  : "bg-white border border-slate-200 text-slate-700 hover:border-blue-400 hover:text-blue-700"
              }`}
            >
              {opt.icon}
              <span>{opt.shortLabel || opt.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // Default "sidebar" layout
  return (
    <div className={`border-b border-slate-100 last:border-none ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between py-3 text-left group"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-700 group-hover:text-blue-600 transition">
          <ArrowUpDown className="h-3 w-3 text-blue-600" />
          Sort By
        </span>
        {open ? (
          <ChevronUp className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-600 shrink-0 transition" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-600 shrink-0 transition" />
        )}
      </button>

      {open && (
        <div className="pb-3.5 space-y-1">
          {SORT_OPTIONS.map((opt) => {
            const isSelected = sort === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onSortChange(opt.value)}
                className={`flex items-center justify-between w-full py-1.5 px-2 rounded-xl text-xs font-semibold transition ${
                  isSelected
                    ? "bg-blue-50 text-blue-800 font-bold border border-blue-200"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span className="flex items-center gap-2">
                  {opt.icon}
                  <span>{opt.label}</span>
                </span>
                {isSelected && <Check className="h-3.5 w-3.5 text-blue-600 stroke-[3]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default SortFilter;
