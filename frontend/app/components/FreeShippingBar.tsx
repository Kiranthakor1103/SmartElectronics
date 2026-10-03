"use client";

import { FREE_SHIPPING_THRESHOLD } from "@/app/lib/constants/ecommerce";

export default function FreeShippingBar({ subtotal }: { subtotal: number }) {
  if (subtotal <= 0) return null;

  const remaining = FREE_SHIPPING_THRESHOLD - subtotal;
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  if (remaining <= 0) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
        <span className="font-semibold">Free shipping unlocked!</span> Your order qualifies for free delivery.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 px-4 py-3">
      <p className="text-sm text-slate-700">
        Add <span className="font-bold text-indigo-600">₹{remaining.toLocaleString()}</span> more for{" "}
        <span className="font-semibold">free shipping</span>
      </p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-indigo-100">
        <div
          className="h-full rounded-full bg-indigo-600 transition-all duration-500"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progress toward free shipping"
        />
      </div>
    </div>
  );
}
