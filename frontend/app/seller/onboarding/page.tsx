"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/app/components/ToastProvider";
import { Loader } from "@/app/components/ui/Loader";
import { ShieldAlert, CheckCircle, FileText, Landmark, Building, ArrowRight } from "lucide-react";

interface SellerProfile {
  companyName: string;
  gstNumber: string;
  panNumber: string;
  bankAccount: string;
  bankIfsc: string;
  kycStatus: "pending" | "approved" | "rejected";
}

export default function SellerOnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ hasApplied: boolean; seller?: SellerProfile } | null>(null);

  // Form states
  const [companyName, setCompanyName] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [bankIfsc, setBankIfsc] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/seller/onboard");
        if (res.status === 401) {
          toast("Please log in to register as a seller", "error");
          router.push("/login?redirect=/seller/onboarding");
          return;
        }

        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setStatus(data.data);
            if (data.data.hasApplied && data.data.seller?.kycStatus === "approved") {
              router.push("/seller/dashboard");
            }
          }
        }
      } catch (err) {
        console.error("Failed to load onboarding status:", err);
      } finally {
        setLoading(false);
      }
    };

    void fetchStatus();
  }, [router, toast]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;

    if (!companyName.trim()) newErrors.companyName = "Company name is required";
    if (!gstRegex.test(gstNumber.trim().toUpperCase())) {
      newErrors.gstNumber = "Invalid GSTIN format (e.g., 22AAAAA1111A1Z1)";
    }
    if (!panRegex.test(panNumber.trim().toUpperCase())) {
      newErrors.panNumber = "Invalid PAN format (e.g., ABCDE1234F)";
    }
    if (bankAccount.trim().length < 9 || bankAccount.trim().length > 18) {
      newErrors.bankAccount = "Bank account must be between 9 and 18 digits";
    }
    if (!ifscRegex.test(bankIfsc.trim().toUpperCase())) {
      newErrors.bankIfsc = "Invalid IFSC code format (e.g., SBIN0001234)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/seller/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          gstNumber: gstNumber.toUpperCase(),
          panNumber: panNumber.toUpperCase(),
          bankAccount,
          bankIfsc: bankIfsc.toUpperCase(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast("Application submitted successfully!", "success");
        setStatus({ hasApplied: true, seller: data.data });
      } else {
        toast(data.message || "Onboarding submission failed", "error");
      }
    } catch (err) {
      toast("An error occurred during submission", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader
          size="lg"
          label="Loading onboarding records…"
          sublabel="Verifying GST and merchant account data"
        />
      </div>
    );
  }

  // Application Pending Screen
  if (status?.hasApplied && status.seller?.kycStatus === "pending") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-xl sm:p-10">
          <div className="absolute left-0 right-0 top-0 h-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-indigo-500 animate-pulse" />

          <div className="relative mb-6 flex justify-center">
            <div className="absolute h-24 w-24 animate-pulse rounded-full bg-amber-500/10" />
            <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-50 text-amber-500">
              <ShieldAlert className="h-10 w-10 animate-bounce" />
            </div>
          </div>

          <h1 className="text-center text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
            KYC Review Pending
          </h1>
          <p className="mt-3 text-center text-sm leading-relaxed text-slate-500 sm:text-base">
            Your onboarding application for <strong className="text-slate-800">{status.seller.companyName}</strong> has been received. Our compliance team is verifying your Tax Credentials (GSTIN/PAN) and Bank Account details.
          </p>

          <div className="mt-8 space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Verification Steps</span>
              <span className="rounded-full bg-amber-50 border border-amber-100 px-2.5 py-0.5 text-[10px] font-semibold text-amber-700 uppercase tracking-wide">
                Under Review
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-xs text-slate-600">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <span>Onboarding Profile Saved</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-600">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-amber-500" />
                <span>GSTIN & PAN validation in progress</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <div className="h-4 w-4 rounded-full border-2 border-slate-200" />
                <span>Bank Settlement Verification (Pending KYC approval)</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => router.push("/")}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 py-4 text-sm font-semibold transition"
          >
            Return to Storefront
          </button>
        </div>
      </div>
    );
  }

  // Application Rejected Screen
  if (status?.hasApplied && status.seller?.kycStatus === "rejected") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-xl sm:p-10">
          <div className="absolute left-0 right-0 top-0 h-1.5 bg-rose-500" />

          <div className="relative mb-6 flex justify-center">
            <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-2xl border border-rose-500/30 bg-rose-50 text-rose-600">
              <ShieldAlert className="h-10 w-10" />
            </div>
          </div>

          <h1 className="text-center text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
            KYC Verification Rejected
          </h1>
          <p className="mt-3 text-center text-sm leading-relaxed text-slate-500">
            Unfortunately, your seller registration could not be verified due to inconsistencies in the documents provided.
          </p>

          <button
            onClick={() => setStatus(null)}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-rose-605 hover:bg-rose-500 py-4 text-sm font-semibold text-white transition shadow-md shadow-rose-600/10"
          >
            Re-submit Application
          </button>
        </div>
      </div>
    );
  }

  // Onboarding Form Screen
  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4 flex items-center justify-center">
      <div className="w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight sm:text-4xl">
            Partner with KTStore
          </h1>
          <p className="mt-2.5 text-sm text-slate-500 max-w-lg mx-auto">
            Onboard as an authorized marketplace merchant to list electronic products, track custom payout reports, and manage multi-vendor orders.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            
            {/* Company Info */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Business Info
              </label>
              <div className="relative">
                <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Registered Company Name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className={`w-full rounded-xl border ${
                    errors.companyName ? "border-rose-500" : "border-slate-200"
                  } bg-slate-50 py-3.5 pl-11 pr-4 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:bg-white transition-colors`}
                />
              </div>
              {errors.companyName && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.companyName}</p>}
            </div>

            {/* GST Number */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                GSTIN (15-digit Tax Code)
              </label>
              <div className="relative">
                <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. 22AAAAA1111A1Z1"
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value)}
                  className={`w-full rounded-xl border ${
                    errors.gstNumber ? "border-rose-500" : "border-slate-200"
                  } bg-slate-50 py-3.5 pl-11 pr-4 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:bg-white transition-colors uppercase`}
                />
              </div>
              {errors.gstNumber && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.gstNumber}</p>}
            </div>

            {/* PAN Number */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Business PAN Card
              </label>
              <div className="relative">
                <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. ABCDE1234F"
                  value={panNumber}
                  onChange={(e) => setPanNumber(e.target.value)}
                  className={`w-full rounded-xl border ${
                    errors.panNumber ? "border-rose-500" : "border-slate-200"
                  } bg-slate-50 py-3.5 pl-11 pr-4 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:bg-white transition-colors uppercase`}
                />
              </div>
              {errors.panNumber && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.panNumber}</p>}
            </div>

            {/* Bank details header */}
            <div className="md:col-span-2 pt-2 border-t border-slate-100">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-550">
                Settlement Bank Account
              </label>
            </div>

            {/* Bank Account */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-2">
                Account Number
              </label>
              <div className="relative">
                <Landmark className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Account Number (9-18 digits)"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  className={`w-full rounded-xl border ${
                    errors.bankAccount ? "border-rose-500" : "border-slate-200"
                  } bg-slate-50 py-3.5 pl-11 pr-4 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:bg-white transition-colors`}
                />
              </div>
              {errors.bankAccount && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.bankAccount}</p>}
            </div>

            {/* IFSC Code */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-2">
                IFSC Code
              </label>
              <div className="relative">
                <Landmark className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. SBIN0001234"
                  value={bankIfsc}
                  onChange={(e) => setBankIfsc(e.target.value)}
                  className={`w-full rounded-xl border ${
                    errors.bankIfsc ? "border-rose-500" : "border-slate-200"
                  } bg-slate-50 py-3.5 pl-11 pr-4 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:bg-white transition-colors uppercase`}
                />
              </div>
              {errors.bankIfsc && <p className="mt-1.5 text-xs text-rose-500 font-medium">{errors.bankIfsc}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 py-4 text-sm font-bold text-white transition shadow-md shadow-indigo-600/10 active:scale-[0.98] disabled:opacity-50"
          >
            {submitting ? "Submitting Application…" : "Register Merchant Profile"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
