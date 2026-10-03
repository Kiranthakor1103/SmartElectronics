"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/app/lib/redux/hooks";
import {
  applyCoupon,
  removeCoupon,
} from "@/app/lib/redux/features/cart/cartSlice";
import { useToast } from "./ToastProvider";
import { Ticket, CheckCircle2, XCircle, Tag, Sparkles } from "lucide-react";

interface PublicCoupon {
  code: string;
  label: string;
  type: "percent" | "flat";
  value: number;
  minOrder?: number;
}

interface PromoCodeInputProps {
  userEmail?: string;
  userId?: string;
}

export default function PromoCodeInput({ userEmail, userId }: PromoCodeInputProps = {}) {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const subtotal = useAppSelector((s) => s.cart.subtotal);
  const appliedCoupon = useAppSelector((s) => s.cart.coupon);
  const [mounted, setMounted] = useState(false);
  const [code, setCode] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);
  const [error, setError] = useState("");
  const [validating, setValidating] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState<PublicCoupon[]>([
    { code: "SAVE10", label: "10% off", type: "percent", value: 10, minOrder: 500 },
    { code: "WELCOME20", label: "20% off", type: "percent", value: 20, minOrder: 1500 },
    { code: "FLAT100", label: "₹100 off", type: "flat", value: 100, minOrder: 799 },
  ]);

  // Fetch live active promotional coupons from API
  useEffect(() => {
    async function loadPublicCoupons() {
      try {
        const res = await fetch("/api/coupons/public");
        if (res.ok) {
          const data = await res.json();
          const list = data.data?.coupons || data.coupons;
          if (Array.isArray(list) && list.length > 0) {
            setAvailableCoupons(list);
          }
        }
      } catch (err) {
        // Fallback default suggestions remain active
      }
    }
    loadPublicCoupons();
  }, []);

  const cartItems = useAppSelector((s) => s.cart.items);

  const handleApply = async (codeToApply?: string) => {
    const targetCode = (codeToApply || code).trim().toUpperCase();
    if (!targetCode) return;

    setError("");
    setValidating(true);
    try {
      const queryParams = new URLSearchParams({
        code: targetCode,
        subtotal: String(subtotal),
      });

      if (Array.isArray(cartItems) && cartItems.length > 0) {
        queryParams.set(
          "items",
          JSON.stringify(
            cartItems.map((it) => ({
              id: it.id,
              _id: (it as any)._id,
              price: it.price,
              quantity: it.quantity,
              couponCode: (it as any).couponCode,
            }))
          )
        );
      }

      let activeUserId = userId;
      let activeUserEmail = userEmail;

      if (typeof window !== "undefined") {
        try {
          const userStr = localStorage.getItem("user");
          if (userStr) {
            const userObj = JSON.parse(userStr);
            if (!activeUserId) activeUserId = userObj._id || userObj.id;
            if (!activeUserEmail) activeUserEmail = userObj.email;
          }
        } catch {}
      }

      if (activeUserId) queryParams.set("userId", String(activeUserId));
      if (activeUserEmail) queryParams.set("email", String(activeUserEmail));

      const res = await fetch(`/api/coupons/validate?${queryParams.toString()}`);
      const data = await res.json();
      const coupon = data.data?.coupon || data.coupon;

      if (!res.ok || !data.success || !coupon) {
        const errorMsg = data.message || "Invalid or ineligible coupon code";
        setError(errorMsg);
        toast(errorMsg, "error");
        return;
      }

      dispatch(applyCoupon(coupon));
      toast(`Promocode ${coupon.code} applied successfully!`, "success");
      setCode("");
    } catch (err) {
      setError("Failed to validate coupon");
      toast("An error occurred during coupon validation", "error");
    } finally {
      setValidating(false);
    }
  };


  if (mounted && appliedCoupon) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-xs text-emerald-900 bg-white border border-emerald-200 px-2 py-0.5 rounded-md">
                  {appliedCoupon.code}
                </span>
                <span className="text-[10px] font-bold text-emerald-700 uppercase">
                  Applied
                </span>
              </div>
              <p className="text-xs text-emerald-800 font-medium mt-0.5">
                {appliedCoupon.label}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              dispatch(removeCoupon());
              toast("Promocode removed", "info");
            }}
            className="text-xs font-bold text-rose-600 hover:text-rose-800 hover:underline transition cursor-pointer p-1"
          >
            Remove
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label htmlFor="promo-code" className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <Ticket className="w-3.5 h-3.5 text-indigo-600" />
          <span>Promo Code</span>
        </label>
        <span className="text-[10px] text-slate-400 font-semibold">Special Offers</span>
      </div>

      <div className="flex gap-2">
        <input
          id="promo-code"
          type="text"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setError("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleApply();
            }
          }}
          placeholder="e.g. SAVE10"
          className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-mono font-bold uppercase text-slate-900 placeholder:normal-case placeholder:font-sans placeholder:font-normal outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition"
        />
        <button
          type="button"
          onClick={() => handleApply()}
          disabled={!code.trim() || validating}
          className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 transition disabled:opacity-40 cursor-pointer"
        >
          {validating ? "Checking…" : "Apply"}
        </button>
      </div>

      {error && (
        <p className="flex items-center gap-1 text-[11px] font-semibold text-rose-600 mt-1">
          <XCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}

      {/* Dynamic Available Offers Pills */}
      {availableCoupons.length > 0 && (
        <div className="pt-1 space-y-1.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Available Deals (Click to Apply):</span>
          </p>
          <div className="flex flex-wrap gap-1.5">
            {availableCoupons.map((coupon) => (
              <button
                key={coupon.code}
                type="button"
                onClick={() => {
                  setCode(coupon.code);
                  handleApply(coupon.code);
                }}
                className="group inline-flex items-center gap-1 text-[11px] font-bold bg-indigo-50/70 hover:bg-indigo-100 border border-indigo-100 text-indigo-700 px-2.5 py-1 rounded-lg transition cursor-pointer"
                title={`Click to apply ${coupon.label}`}
              >
                <Tag className="w-3 h-3 text-indigo-500 group-hover:rotate-12 transition-transform" />
                <span className="font-mono">{coupon.code}</span>
                <span className="text-[9px] text-indigo-500 font-normal">
                  ({coupon.type === "percent" ? `${coupon.value}% off` : `₹${coupon.value} off`})
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
