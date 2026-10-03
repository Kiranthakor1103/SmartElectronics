import Link from "next/link";
import { ShieldCheck, Truck, Sparkles, Award, ArrowLeft, Headphones, Zap, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "About Us | SmartElectronics",
  description: "Learn about SmartElectronics - India's Premier Online Electronics & Tech Superstore",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-mesh text-slate-900 pb-20">
      {/* Hero Banner Header */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 text-white border-b border-slate-800 py-16 px-4 sm:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-300 hover:text-white transition mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <span className="text-xs font-black uppercase tracking-widest text-cyan-400 block mb-2">
            About SmartElectronics
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Redefining High-Speed{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-300">
              Digital Tech Shopping
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
            SmartElectronics is built to deliver 100% genuine, manufacturer-backed electronics, premium computing
            hardware, smart gadgets, and audio equipment with instant checkouts, dedicated tech support, and nationwide
            express shipping.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 pt-12 space-y-12">
        {/* Core Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs hover:border-blue-400 hover:shadow-lg transition-all text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-2xs">
              <Award className="h-6 w-6" />
            </div>
            <h3 className="text-base font-black text-slate-900">100% Authentic Brands</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Direct partnerships with verified global brands including Apple, Samsung, Sony, Dell, HP, Asus, boAt,
              and Dyson to ensure authentic quality and official warranty.
            </p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs hover:border-blue-400 hover:shadow-lg transition-all text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-2xs">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-base font-black text-slate-900">Encrypted Transactions</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Integrated with Stripe card checkout infrastructure, keeping your payments 256-bit encrypted and safe from
              fraudulent risks.
            </p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs hover:border-blue-400 hover:shadow-lg transition-all text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-2xs">
              <Truck className="h-6 w-6" />
            </div>
            <h3 className="text-base font-black text-slate-900">Express Insured Delivery</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Optimized seller logistics network for rapid dispatch and shockproof doorstep delivery across major metros
              and regional tech hubs.
            </p>
          </div>
        </div>

        {/* Feature Highlight Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-8 sm:p-12 text-white border border-slate-800 shadow-2xl">
          <div className="absolute top-0 right-0 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <span className="text-xs font-black uppercase tracking-wider text-cyan-300">Our Mission</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black leading-tight">
              Customer First. Genuine Tech Always.
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              We founded SmartElectronics to solve the online tech retail clutter — providing a streamlined, high-speed
              interface where shoppers can discover and purchase top electronic products with complete confidence,
              accurate technical specs, and verified brand warranties.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 px-6 py-3 text-xs font-black text-white shadow-xl hover:scale-105 transition-all"
              >
                Browse Tech Catalog →
              </Link>
              <Link
                href="/warranty"
                className="inline-flex items-center gap-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 px-6 py-3 text-xs font-black text-white transition-all"
              >
                Warranty Guidelines
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
