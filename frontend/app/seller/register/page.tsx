"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/app/components/ToastProvider";
import { ShoppingBag, Eye, EyeOff, Zap, Tag, ShieldCheck } from "lucide-react";

export default function SellerRegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast("Please fill in all fields", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role: "seller" }),
      });

      const data = await res.json();
      if (res.ok) {
        toast("Seller account registered successfully! Please log in.", "success");
        router.push("/seller/login");
      } else {
        toast(data.message || "Registration failed", "error");
      }
    } catch {
      toast("An unexpected connection error occurred", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-100 via-indigo-50/30 to-slate-100 flex items-center justify-center p-4 sm:p-6 md:p-10">
      
      {/* Split Card Layout with Premium styling */}
      <div className="w-full max-w-[900px] min-h-[550px] bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_20px_50px_rgba(79,70,229,0.08)] border border-slate-100 overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Block - Elegant Brand Showcase (Indigo-violet gradient) */}
        <div className="md:w-[42%] bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-900 p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
          <div className="absolute top-[-20%] left-[-20%] w-[80%] height-[80%] rounded-full bg-indigo-500/20 blur-3xl" />
          
          <div className="relative z-10">
            <h1 className="text-3.5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-100 to-white bg-clip-text text-transparent">
              Start Selling
            </h1>
            <p className="mt-4 text-indigo-100/90 font-medium leading-relaxed text-sm sm:text-base">
              Register your business on KTStore and reach millions of customers looking for premium electronics and products.
            </p>
          </div>

          {/* Feature Badges list */}
          <div className="relative z-10 space-y-4 my-8">
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-md">
              <div className="p-2 bg-indigo-500/30 rounded-xl text-indigo-200">
                <Zap className="h-4.5 w-4.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-200">Quick Onboarding</h4>
                <p className="text-[11px] text-indigo-100/70">Simple 2-step verification process to get you live</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-md">
              <div className="p-2 bg-indigo-500/30 rounded-xl text-indigo-200">
                <Tag className="h-4.5 w-4.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-200">Zero Hidden Fees</h4>
                <p className="text-[11px] text-indigo-100/70">Transparent pricing model with minimal commission rates</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-md">
              <div className="p-2 bg-indigo-500/30 rounded-xl text-indigo-200">
                <ShieldCheck className="h-4.5 w-4.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-200">Merchant Support</h4>
                <p className="text-[11px] text-indigo-100/70">Dedicated seller support team to assist your growth</p>
              </div>
            </div>
          </div>
          
          <div className="relative z-10 text-[11px] text-indigo-200/50">
            © KT Store Merchant Portal. All rights reserved.
          </div>
        </div>

        {/* Right Block - Premium Register Form */}
        <div className="flex-1 p-8 sm:p-10 flex flex-col justify-between">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Form Heading */}
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-650 border border-indigo-100 mb-4">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">Register Business</h2>
              <p className="text-xs text-slate-400 mt-1">Create your merchant account to begin onboarding</p>
            </div>

            {/* Name Input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Company / Owner Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none placeholder-slate-400 transition-all focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5"
                placeholder="e.g. Acme Corporation"
                required
              />
            </div>

            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Business Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none placeholder-slate-400 transition-all focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5"
                placeholder="billing@acme.com"
                required
              />
            </div>

            {/* Password Input with Toggle Eye */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-550 uppercase tracking-wider block">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-11 py-3 text-sm text-slate-800 outline-none placeholder-slate-400 transition-all focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5"
                  placeholder="Minimum 6 characters"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-650 transition-colors focus:outline-none"
                  aria-label="Toggle Password Visibility"
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>

            {/* Submit CTA Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-655 hover:to-amber-600 py-3.5 text-sm font-semibold text-white shadow-md active:scale-[0.98] transition-all disabled:opacity-50 uppercase tracking-wider"
            >
              {loading ? "Registering business..." : "Register Business"}
            </button>
          </form>

          {/* Login link */}
          <div className="mt-6 text-center text-sm font-semibold text-slate-500 space-y-3">
            <p className="text-slate-500">
              Already registered?{" "}
              <Link href="/seller/login" className="font-bold text-indigo-600 hover:underline">
                Log in here
              </Link>
            </p>
            <div>
              <Link href="/" className="text-slate-405 hover:text-slate-600 hover:underline">
                Return to Storefront
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
