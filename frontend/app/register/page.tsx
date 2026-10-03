"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/app/components/ToastProvider";
import { authService } from "@/app/lib/services/authService";
import { Eye, EyeOff, ShieldCheck, Zap, ArrowLeft, CheckCircle2, User, Mail, Lock } from "lucide-react";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/";

  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast("Please fill in all required fields", "error");
      return;
    }

    setLoading(true);
    try {
      const data = await authService.register(name, email, password);
      if (data.success) {
        toast(data.message || "Registration successful! Welcome to SmartElectronics.");
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("auth-change"));
        }
        router.push(redirectPath);
      } else {
        toast(data.message || "Registration failed. Please check details.", "error");
      }
    } catch {
      toast("An error occurred during registration. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-mesh flex items-center justify-center p-4 sm:p-6 md:p-8">
      
      {/* KTExpress Signature Split Card */}
      <div className="w-full max-w-[940px] bg-white rounded-3xl shadow-2xl shadow-indigo-950/10 border border-slate-200/80 overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Block - KTExpress Dark Slate Indigo Theme */}
        <div className="md:w-[44%] bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden select-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.2),rgba(255,255,255,0))]" />
          <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-indigo-500/10 blur-3xl" />

          <div className="relative z-10 space-y-3">
            <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-indigo-300 hover:text-white mb-2 transition">
              <ArrowLeft className="w-4 h-4" /> Return to Store
            </Link>

            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white font-black text-lg shadow-md shadow-blue-500/30">
                SE
              </div>
              <span className="text-2xl font-black tracking-tight text-white flex items-center gap-1">
                SmartElectronics <span className="text-cyan-400 font-extrabold text-xs">⚡</span>
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white pt-2">
              Join SmartElectronics Today
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Create your account to unlock member deals, order tracking, and express fulfillment.
            </p>
          </div>

          {/* Feature Badges */}
          <div className="relative z-10 space-y-3 my-6">
            <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 backdrop-blur-md">
              <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-white">100% Verified Merchandise</h4>
                <p className="text-[10px] text-slate-400">Authentic products from official distributors</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 backdrop-blur-md">
              <Zap className="w-5 h-5 text-violet-400 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-white">Express 3-Day Delivery</h4>
                <p className="text-[10px] text-slate-400">Fast doorstep fulfillment</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 backdrop-blur-md">
              <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-white">Encrypted Vault Protection</h4>
                <p className="text-[10px] text-slate-400">Stripe & SSL 256-bit security</p>
              </div>
            </div>
          </div>

          <div className="relative z-10 text-[11px] text-slate-400 font-medium">
            &copy; {new Date().getFullYear()} SmartElectronics. All rights reserved.
          </div>
        </div>

        {/* Right Block - Registration Form */}
        <div className="flex-1 p-8 sm:p-10 flex flex-col justify-between bg-white">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <h3 className="text-2xl font-black text-slate-950 tracking-tight">Create Account</h3>
              <p className="text-xs text-slate-500 mt-1">Register for a new SmartElectronics member account</p>
            </div>

            {/* Name Input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider block">
                Full Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Thakor Kiran"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs font-bold text-slate-900 outline-none transition focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  required
                />
                <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider block">
                Email Address *
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="kiran@example.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs font-bold text-slate-900 outline-none transition focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  required
                />
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            {/* Password Input with Toggle */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider block">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create password"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-11 py-3 text-xs font-bold text-slate-900 outline-none transition focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  required
                />
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                  aria-label="Toggle Password Visibility"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
              By registering, you agree to SmartElectronics&apos;s{" "}
              <Link href="/terms" className="text-indigo-600 font-bold hover:underline">Terms of Service</Link> and{" "}
              <Link href="/privacy" className="text-indigo-600 font-bold hover:underline">Privacy Policy</Link>.
            </p>

            {/* KTExpress Indigo CTA Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 hover:from-indigo-700 hover:via-violet-700 hover:to-indigo-700 py-3.5 text-xs font-black text-white shadow-lg shadow-indigo-500/25 transition-all uppercase tracking-wider disabled:opacity-50 active:scale-[0.98]"
            >
              {loading ? "Creating Account…" : "CREATE ACCOUNT"}
            </button>
          </form>

          {/* Link to Login */}
          <div className="mt-6 text-center text-xs font-bold text-slate-500">
            Already have an account?{" "}
            <Link
              href={redirectPath !== "/" ? `/login?redirect=${encodeURIComponent(redirectPath)}` : "/login"}
              className="text-indigo-600 font-extrabold hover:underline"
            >
              Sign In
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
