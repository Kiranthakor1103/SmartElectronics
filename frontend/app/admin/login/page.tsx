"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/app/components/ToastProvider";
import { authService } from "@/app/lib/services/authService";
import { ShieldCheck, Eye, EyeOff, Layers, Users, Landmark } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast("Please enter both credentials", "error");
      return;
    }

    setLoading(true);
    try {
      const data = await authService.login(email, password);
      if (data.success) {
        if (data.user?.role !== "admin") {
          toast("Access Denied: Not an administrator account", "error");
          await authService.logout();
          setLoading(false);
          return;
        }

        toast("Welcome to KTStore Admin Console", "success");
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("auth-change"));
        }
        router.push("/admin");
      } else {
        toast(data.message || "Invalid credentials", "error");
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
        
        {/* Left Block - Elegant Admin Showcase (Indigo-violet gradient) */}
        <div className="md:w-[42%] bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-900 p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
          <div className="absolute top-[-20%] left-[-20%] w-[80%] height-[80%] rounded-full bg-indigo-500/20 blur-3xl" />
          
          <div className="relative z-10">
            <h1 className="text-3.5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-100 to-white bg-clip-text text-transparent">
              Admin Console
            </h1>
            <p className="mt-4 text-indigo-100/90 font-medium leading-relaxed text-sm sm:text-base">
              Access the KTStore marketplace governance portal to review products, manage category listings, and oversee sellers.
            </p>
          </div>

          {/* Feature Badges list */}
          <div className="relative z-10 space-y-4 my-8">
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-md">
              <div className="p-2 bg-indigo-500/30 rounded-xl text-indigo-200">
                <Layers className="h-4.5 w-4.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-200">Market Control</h4>
                <p className="text-[11px] text-indigo-100/70">Moderate listings and categories in real-time</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-md">
              <div className="p-2 bg-indigo-500/30 rounded-xl text-indigo-200">
                <Users className="h-4.5 w-4.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-200">KYC Verification</h4>
                <p className="text-[11px] text-indigo-100/70">Review and approve new merchant applications</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-md">
              <div className="p-2 bg-indigo-500/30 rounded-xl text-indigo-200">
                <Landmark className="h-4.5 w-4.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-200">Financial Reports</h4>
                <p className="text-[11px] text-indigo-100/70">Track payouts, commission rates, and settlements</p>
              </div>
            </div>
          </div>
          
          <div className="relative z-10 text-[11px] text-indigo-200/50">
            © KT Store Admin Portal. All rights reserved.
          </div>
        </div>

        {/* Right Block - Premium Login Form */}
        <div className="flex-1 p-8 sm:p-10 flex flex-col justify-between">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Form Heading */}
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 mb-4">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">Admin Access</h2>
              <p className="text-xs text-slate-400 mt-1">Please enter your administrative credentials below</p>
            </div>

            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Admin Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none placeholder-slate-400 transition-all focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5"
                placeholder="admin@ktstore.com"
                required
              />
            </div>

            {/* Password Input with Toggle Eye */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Secret Passkey
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-11 py-3 text-sm text-slate-800 outline-none placeholder-slate-400 transition-all focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
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
              {loading ? "Unlocking Console..." : "Unlock Console"}
            </button>
          </form>

          {/* Return link */}
          <div className="mt-8 text-center text-sm font-semibold text-slate-500">
            <Link href="/" className="text-slate-400 hover:text-slate-600 hover:underline">
              Return to Storefront
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
