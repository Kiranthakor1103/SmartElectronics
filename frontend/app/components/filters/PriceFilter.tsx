"use client";

import React, { useState } from "react";
import { Tag, ChevronDown, ChevronUp } from "lucide-react";

export interface PriceFilterProps {
  minPrice: number;
  maxPrice: number;
  maxProductPrice: number;
  onPriceChange: (min: number, max: number) => void;
}

export function PriceFilter({
  minPrice,
  maxPrice,
  maxProductPrice,
  onPriceChange,
}: PriceFilterProps) {
  const [open, setOpen] = useState(true);

  const priceTiers = [
    { label: "Under ₹10K", min: 0, max: 10000 },
    { label: "₹10K – ₹30K", min: 10000, max: 30000 },
    { label: "₹30K – ₹75K", min: 30000, max: 75000 },
    { label: "₹75K – ₹1.5L", min: 75000, max: 150000 },
    { label: "Above ₹1.5L", min: 150000, max: maxProductPrice },
    { label: "All Prices", min: 0, max: maxProductPrice },
  ];

  const leftPercent = Math.min(100, Math.max(0, (minPrice / maxProductPrice) * 100));
  const rightPercent = Math.min(100, Math.max(0, 100 - (maxPrice / maxProductPrice) * 100));

  return (
    <div className="border-b border-slate-100 last:border-none">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between py-3 text-left group"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-700 group-hover:text-blue-600 transition">
          <Tag className="h-3 w-3 text-blue-600" />
          Price Range
        </span>
        {open ? (
          <ChevronUp className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-600 shrink-0 transition" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-600 shrink-0 transition" />
        )}
      </button>

      {open && (
        <div className="pb-3.5 space-y-3.5">
          {/* Price Range Badges */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 bg-slate-50 border border-slate-200/90 rounded-xl px-2.5 py-1.5 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block leading-none mb-0.5">
                Min
              </span>
              <span className="text-xs font-black text-slate-900">
                ₹{minPrice.toLocaleString("en-IN")}
              </span>
            </div>
            <span className="text-xs font-bold text-slate-300">to</span>
            <div className="flex-1 bg-blue-50/80 border border-blue-200 rounded-xl px-2.5 py-1.5 text-center">
              <span className="text-[10px] uppercase font-bold text-blue-500 block leading-none mb-0.5">
                Max
              </span>
              <span className="text-xs font-black text-blue-900">
                ₹{maxPrice.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* Interactive Dual Slider Track */}
          <div className="relative pt-2 pb-1">
            <div className="relative h-2 w-full rounded-full bg-slate-200">
              <div
                className="absolute h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600"
                style={{
                  left: `${leftPercent}%`,
                  right: `${rightPercent}%`,
                }}
              />
            </div>

            {/* Min & Max Range Inputs layered */}
            <div className="relative h-6 -mt-4">
              <input
                type="range"
                min={0}
                max={maxProductPrice}
                step={1000}
                value={minPrice}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val <= maxPrice - 2000) {
                    onPriceChange(val, maxPrice);
                  }
                }}
                className="absolute inset-0 w-full appearance-none bg-transparent pointer-events-auto cursor-pointer range-slider-thumb z-10"
                aria-label="Minimum price"
              />
              <input
                type="range"
                min={0}
                max={maxProductPrice}
                step={1000}
                value={maxPrice}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val >= minPrice + 2000) {
                    onPriceChange(minPrice, val);
                  }
                }}
                className="absolute inset-0 w-full appearance-none bg-transparent pointer-events-auto cursor-pointer range-slider-thumb z-20"
                aria-label="Maximum price"
              />
            </div>
          </div>

          {/* Popular Price Brackets (Flipkart Style Grid) */}
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
              Popular Price Brackets
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {priceTiers.map((tier) => {
                const isActive =
                  tier.label === "All Prices"
                    ? minPrice === 0 && maxPrice === maxProductPrice
                    : minPrice === tier.min && maxPrice === tier.max;
                return (
                  <button
                    key={tier.label}
                    type="button"
                    onClick={() => onPriceChange(tier.min, tier.max)}
                    className={`px-2 py-1.5 rounded-xl text-[11px] font-bold transition-all text-center border ${
                      isActive
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs shadow-blue-500/20"
                        : "bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border-slate-200/80 hover:border-blue-200"
                    }`}
                  >
                    {tier.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PriceFilter;
