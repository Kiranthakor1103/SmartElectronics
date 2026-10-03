"use client";

import Link from "next/link";
import { useState } from "react";
import { useToast } from "@/app/components/ToastProvider";
import { authService } from "@/app/lib/services/authService";
import { Mail, ArrowLeft, Zap, ShieldCheck, CheckCircle2, ArrowRight } from "lucide-react";

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast("Please enter your account email address", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await authService.forgotPassword(email.trim(), "customer");
      if (res.success) {
        setSubmitted(true);
        toast("Password recovery email dispatched successfully!", "success");
      } else {
        toast(res.message || "Failed to send reset link. Please try again.", "error");
      }
    } catch {
      toast("Could not connect to authentication service. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-slate-950 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        <div className="bg-slate-900/90 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-black/80 space-y-6 animate-fade-in-up">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-500 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-600/30 mx-auto mb-3">
              <Zap className="w-7 h-7 text-cyan-200 fill-current" />
            </div>
            
            <div className="flex items-center justify-center gap-1.5">
              <h2 className="text-2xl font-black text-white tracking-tight">
                Smart<span className="text-cyan-400">Electronics</span>
              </h2>
              <span className="text-[10px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.5 rounded-md">
                SECURITY
              </span>
            </div>

            <h3 className="text-base font-bold text-slate-200 mt-2">
              {submitted ? "Check Your Inbox" : "Recover Your Password"}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
              {submitted
                ? "We have dispatched a time-sensitive recovery link to your registered email address."
                : "Enter your registered email address to receive a secure link to reset your password."}
            </p>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4 pt-1">
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider block">
                  Registered Email Address *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs font-bold text-white placeholder-slate-500 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                  />
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 hover:from-indigo-500 hover:to-violet-500 text-white font-black text-xs uppercase tracking-wider py-3.5 shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? "Sending Recovery Link..." : "Send Reset Link"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <div className="space-y-5 text-center pt-2">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 text-xs text-slate-300 space-y-1">
                <p className="text-slate-400 font-medium">Recovery instructions sent to:</p>
                <p className="font-bold text-white font-mono break-all">{email}</p>
                <p className="text-[11px] text-indigo-300 font-medium pt-1">
                  ⏱️ Link expires in 60 minutes for security.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition underline underline-offset-2"
              >
                Didn&apos;t receive email? Try again or check spam
              </button>
            </div>
          )}

          {/* Footer Back Link */}
          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 font-bold text-slate-400 hover:text-white transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </Link>

            <div className="flex items-center gap-1 text-[11px] text-slate-500 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>256-Bit Protection</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
