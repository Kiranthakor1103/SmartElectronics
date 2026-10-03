"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/app/components/ToastProvider";
import { authService } from "@/app/lib/services/authService";
import { Lock, Eye, EyeOff, Zap, ShieldCheck, CheckCircle2, ArrowRight, AlertCircle } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const token = searchParams.get("token") || "";
  const emailParam = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Strength score calculation
  const hasMinLength = password.length >= 6;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast("Invalid or missing password reset token. Please request a new link.", "error");
      return;
    }

    if (password.length < 6) {
      toast("Password must be at least 6 characters long.", "error");
      return;
    }

    if (password !== confirmPassword) {
      toast("Passwords do not match. Please re-check.", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await authService.resetPassword(token, password, confirmPassword);
      if (res.success) {
        setSuccess(true);
        toast("Password successfully reset! You can now sign in.", "success");
        setTimeout(() => {
          router.push("/login");
        }, 2200);
      } else {
        toast(res.message || "Failed to reset password. Token may have expired.", "error");
      }
    } catch {
      toast("Could not connect to authentication server. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="bg-slate-900/90 backdrop-blur-2xl border border-rose-500/30 rounded-3xl p-8 sm:p-10 shadow-2xl text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-black text-white">Invalid Reset Link</h3>
        <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
          The reset link you followed is missing a valid security token or has already been consumed.
        </p>
        <div className="pt-2">
          <Link
            href="/forgot-password"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-2.5 transition"
          >
            Request New Reset Link &rarr;
          </Link>
        </div>
      </div>
    );
  }

  return (
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
            CREDENTIALS
          </span>
        </div>

        <h3 className="text-base font-bold text-slate-200 mt-2">
          {success ? "Password Updated!" : "Set New Password"}
        </h3>
        {emailParam && !success && (
          <p className="text-xs text-slate-400">
            Resetting password for: <span className="font-mono text-cyan-400 font-bold">{emailParam}</span>
          </p>
        )}
      </div>

      {!success ? (
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* New Password */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider block">
              New Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter at least 6 characters"
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-10 pr-10 py-3 text-xs font-bold text-white placeholder-slate-500 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
              />
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 transition"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider block">
              Confirm New Password *
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type your password"
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-10 pr-10 py-3 text-xs font-bold text-white placeholder-slate-500 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
              />
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 transition"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Strength Indicators */}
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1.5 text-[11px]">
            <div className="flex items-center gap-1.5 font-bold">
              <span className={`w-1.5 h-1.5 rounded-full ${hasMinLength ? "bg-emerald-400" : "bg-slate-600"}`} />
              <span className={hasMinLength ? "text-emerald-400" : "text-slate-400"}>At least 6 characters</span>
            </div>
            <div className="flex items-center gap-1.5 font-bold">
              <span className={`w-1.5 h-1.5 rounded-full ${hasNumber && hasLetter ? "bg-emerald-400" : "bg-slate-600"}`} />
              <span className={hasNumber && hasLetter ? "text-emerald-400" : "text-slate-400"}>Letters and numbers</span>
            </div>
            {confirmPassword && (
              <div className="flex items-center gap-1.5 font-bold">
                <span className={`w-1.5 h-1.5 rounded-full ${passwordsMatch ? "bg-emerald-400" : "bg-rose-400"}`} />
                <span className={passwordsMatch ? "text-emerald-400" : "text-rose-400"}>
                  {passwordsMatch ? "Passwords match" : "Passwords do not match"}
                </span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !hasMinLength || !passwordsMatch}
            className="w-full mt-2 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 hover:from-indigo-500 hover:to-violet-500 text-white font-black text-xs uppercase tracking-wider py-3.5 shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
          >
            {loading ? "Updating Credentials..." : "Update Password"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      ) : (
        <div className="space-y-5 text-center pt-2">
          <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7" />
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 text-xs text-slate-300 space-y-1">
            <p className="font-bold text-white">Your password has been changed successfully.</p>
            <p className="text-[11px] text-slate-400">
              Redirecting you to the Sign In page in a few seconds...
            </p>
          </div>

          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider px-6 py-3 shadow-lg shadow-indigo-600/25 transition"
          >
            Sign In Now &rarr;
          </Link>
        </div>
      )}

      {/* Footer */}
      <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
        <Link
          href="/login"
          className="font-bold text-slate-400 hover:text-white transition"
        >
          &larr; Back to Login
        </Link>

        <div className="flex items-center gap-1 text-[11px] text-slate-500 font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Bcrypt Salt Protection</span>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[85vh] bg-slate-950 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="max-w-md w-full relative z-10">
        <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading security parameters...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
