"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Tag, Percent, Landmark } from "lucide-react";
import { useToast } from "@/app/components/ToastProvider";

interface Coupon {
  _id: string;
  code: string;
  label: string;
  type: "percent" | "flat";
  value: number;
  minOrder?: number;
  active: boolean;
  createdAt: string;
}

export default function AdminCouponsPage() {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [code, setCode] = useState("");
  const [label, setLabel] = useState("");
  const [type, setType] = useState<"percent" | "flat">("percent");
  const [value, setValue] = useState("");
  const [minOrder, setMinOrder] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchCoupons = async () => {
    try {
      const res = await fetch("/api/coupons");
      if (res.ok) {
        const data = await res.json();
        setCoupons(data.coupons || []);
      }
    } catch (err) {
      toast("Failed to load discount coupons", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchCoupons();
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!code.trim()) newErrors.code = "Coupon code is required";
    if (!label.trim()) newErrors.label = "Coupon label is required";
    if (!value || Number(value) <= 0) newErrors.value = "Discount value must be positive";
    if (type === "percent" && Number(value) > 100) newErrors.value = "Percentage discount cannot exceed 100%";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          label: label.trim(),
          type,
          value: Number(value),
          minOrder: minOrder ? Number(minOrder) : undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast("Promo code generated successfully!", "success");
        setCode("");
        setLabel("");
        setValue("");
        setMinOrder("");
        void fetchCoupons();
      } else {
        toast(data.message || "Failed to create coupon", "error");
      }
    } catch (err) {
      toast("An error occurred during submission", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this coupon?")) return;

    try {
      const res = await fetch(`/api/coupons/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast("Coupon deleted successfully");
        setCoupons((prev) => prev.filter((c) => c._id !== id));
      } else {
        const data = await res.json();
        toast(data.message || "Failed to delete coupon", "error");
      }
    } catch (err) {
      toast("An error occurred deleting this coupon", "error");
    }
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      {/* Left Columns: Coupons Table */}
      <div className="lg:col-span-2 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">Coupons & Promotions</h1>
          <p className="mt-1.5 text-sm text-slate-555">
            Define promotional discount codes, manage value rules, and enforce minimum checkout terms.
          </p>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center items-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />
          </div>
        ) : coupons.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 border-dashed bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-400 mb-4">
              <Tag className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No active coupons</h3>
            <p className="mt-1.5 text-sm text-slate-500 max-w-sm mx-auto">
              Create a promo code on the right panel to kick off a marketplace campaign.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="text-xs text-slate-500 uppercase tracking-wider border-b border-slate-100 bg-slate-50/50">
                <tr>
                  <th className="px-6 py-4 font-semibold">Promo Code</th>
                  <th className="px-6 py-4 font-semibold">Details / Offer</th>
                  <th className="px-6 py-4 font-semibold">Type</th>
                  <th className="px-6 py-4 font-semibold">Value</th>
                  <th className="px-6 py-4 font-semibold">Min Order</th>
                  <th className="px-6 py-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {coupons.map((coupon) => (
                  <tr key={coupon._id} className="hover:bg-slate-50/30 transition-colors">
                    {/* Code */}
                    <td className="px-6 py-4 font-mono font-bold text-indigo-600 text-sm">
                      {coupon.code}
                    </td>
                    {/* Label */}
                    <td className="px-6 py-4 text-slate-800 font-medium">{coupon.label}</td>
                    {/* Type */}
                    <td className="px-6 py-4">
                      {coupon.type === "percent" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-100 px-2 py-0.5 text-[10px] font-bold uppercase text-indigo-700">
                          <Percent className="h-3 w-3" /> Percentage
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-700">
                          <Landmark className="h-3 w-3" /> Flat INR
                        </span>
                      )}
                    </td>
                    {/* Value */}
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {coupon.type === "percent" ? `${coupon.value}%` : `₹${coupon.value}`}
                    </td>
                    {/* Min Order */}
                    <td className="px-6 py-4 text-slate-600">
                      {coupon.minOrder ? `₹${coupon.minOrder}` : "None"}
                    </td>
                    {/* Delete action */}
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeleteCoupon(coupon._id)}
                        className="p-2 text-rose-600 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition active:scale-95"
                        title="Delete coupon"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Right Column: Add Coupon Form */}
      <div>
        <div className="sticky top-24 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Create Coupon</h2>
          <form onSubmit={handleAddCoupon} className="space-y-5">
            {/* Promo Code */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Promo Code
              </label>
              <input
                type="text"
                placeholder="e.g. FLASH30, FESTIVE500"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className={`w-full rounded-xl border ${
                  errors.code ? "border-rose-500" : "border-slate-200"
                } bg-slate-50 py-3 px-4 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:bg-white transition-all font-mono uppercase`}
              />
              {errors.code && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.code}</p>}
            </div>

            {/* Label */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Display Label / Offer Name
              </label>
              <input
                type="text"
                placeholder="e.g. 30% off on first purchase"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className={`w-full rounded-xl border ${
                  errors.label ? "border-rose-500" : "border-slate-200"
                } bg-slate-50 py-3 px-4 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:bg-white transition-all`}
              />
              {errors.label && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.label}</p>}
            </div>

            {/* Type */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Discount Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setType("percent")}
                  className={`rounded-xl border py-2.5 text-xs font-bold transition-all ${
                    type === "percent"
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-md shadow-indigo-100"
                      : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300"
                  }`}
                >
                  Percentage (%)
                </button>
                <button
                  type="button"
                  onClick={() => setType("flat")}
                  className={`rounded-xl border py-2.5 text-xs font-bold transition-all ${
                    type === "flat"
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-md shadow-emerald-100"
                      : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300"
                  }`}
                >
                  Flat Rate (₹)
                </button>
              </div>
            </div>

            {/* Value */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Discount Value {type === "percent" ? "(%)" : "(₹)"}
              </label>
              <input
                type="number"
                placeholder={type === "percent" ? "e.g. 10, 20" : "e.g. 100, 250"}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className={`w-full rounded-xl border ${
                  errors.value ? "border-rose-500" : "border-slate-200"
                } bg-slate-50 py-3 px-4 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:bg-white transition-all`}
              />
              {errors.value && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.value}</p>}
            </div>

            {/* Min Order */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Min Order Amount (Optional)
              </label>
              <input
                type="number"
                placeholder="e.g. 499, 999"
                value={minOrder}
                onChange={(e) => setMinOrder(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:bg-white transition-all"
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-555 py-3.5 text-sm font-bold text-white transition active:scale-95 disabled:opacity-50 shadow-md shadow-indigo-650/10"
            >
              <Plus className="h-4.5 w-4.5" />
              {submitting ? "Generating Code…" : "Create Coupon"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
