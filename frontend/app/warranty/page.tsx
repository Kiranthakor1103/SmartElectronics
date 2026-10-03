import Link from "next/link";
import {
  ShieldCheck,
  Award,
  RotateCcw,
  Headphones,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Smartphone,
  Laptop,
  Tv,
  Headphones as AudioIcon,
  HelpCircle,
} from "lucide-react";

export const metadata = {
  title: "Brand Warranty Policy | SmartElectronics",
  description:
    "Official Brand Warranty Guidelines, 100% Genuine Manufacturer Coverage, and 7-Day Replacement Policy for SmartElectronics customers.",
};

const categoryWarrantyData = [
  {
    icon: Smartphone,
    category: "Smartphones & Tablets",
    duration: "1 to 2 Years",
    coverage: "Covers internal motherboard, camera module, speaker assembly, and original charging accessories.",
    brands: "Apple, Samsung, OnePlus, Xiaomi, Realme, Vivo",
  },
  {
    icon: Laptop,
    category: "Laptops & Computing",
    duration: "1 to 3 Years",
    coverage: "Covers processor, motherboard, SSD/RAM, display panel, and built-in battery manufacturing defects.",
    brands: "Dell, HP, Lenovo, ASUS, Acer, Apple MacBook",
  },
  {
    icon: Tv,
    category: "Smart TVs & Monitors",
    duration: "1 to 3 Years",
    coverage: "Comprehensive screen panel warranty, internal power board, display controller, and remote control.",
    brands: "Sony, LG, Samsung, TCL, Xiaomi",
  },
  {
    icon: AudioIcon,
    category: "Audio, Wearables & Smart Home",
    duration: "1 Year",
    coverage: "Covers driver units, Bluetooth chipset, battery charging cases, sensors, and microphone modules.",
    brands: "Sony, boAt, Noise, JBL, Marshall, Apple AirPods",
  },
];

export default function WarrantyPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 pb-20">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 text-white border-b border-slate-800 py-14 px-4 sm:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-300 hover:text-white transition mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <div className="flex items-center justify-center gap-2 mb-2">
            <ShieldCheck className="h-5 w-5 text-cyan-400" />
            <span className="text-xs font-black uppercase tracking-wider text-cyan-300">
              100% Genuine Brand Coverage
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
            SmartElectronics Warranty Policy
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-3 max-w-2xl mx-auto leading-relaxed">
            Every product sold on SmartElectronics comes sealed in its original retail packaging with authentic
            manufacturer warranty valid across authorized service centers nationwide.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 pt-10 space-y-10">
        {/* Core Warranty Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-900">Direct Brand Warranty</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              We partner directly with authorized brand distributors. Your official GST tax invoice serves as proof of
              purchase for all manufacturer warranty claims.
            </p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-900">7-Day Replacement</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Received a defective or DOA (dead-on-arrival) gadget? SmartElectronics offers a 7-day hassle-free
              doorstep replacement or refund assistance.
            </p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-3">
            <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Headphones className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-900">Claim Concierge</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Need help contacting an OEM service center? Our SmartElectronics technical team facilitates claim
              escalations and nearest service center bookings.
            </p>
          </div>
        </div>

        {/* Category Breakdown Table */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-black text-slate-900">Standard Warranty Coverage by Hardware Category</h2>
            <p className="text-xs text-slate-500">
              Warranty duration starts from the date of tax invoice delivery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categoryWarrantyData.map((cat) => {
              const Icon = cat.icon;
              return (
                <div
                  key={cat.category}
                  className="border border-slate-200/80 rounded-2xl p-5 hover:border-blue-300 transition-colors space-y-2 bg-slate-50/50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                        <Icon className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-black text-slate-900">{cat.category}</h3>
                    </div>
                    <span className="text-xs font-black bg-blue-50 text-blue-700 border border-blue-200/80 px-2.5 py-0.5 rounded-full">
                      {cat.duration}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{cat.coverage}</p>
                  <p className="text-[11px] text-slate-400 font-semibold pt-1">
                    <span className="text-slate-600 font-bold">Partner Brands:</span> {cat.brands}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* What Is & Isn't Covered Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-black text-slate-900">What Is Covered Under Warranty</h3>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span>Manufacturing hardware defects occurring under standard usage conditions.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span>Internal component failure (CPU, RAM, GPU, display controllers, power IC).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span>In-box power adapters, factory cables, and accessories (typically 6-12 months).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span>Certified manufacturer firmware updates, official repairs, or unit replacements.</span>
              </li>
            </ul>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <XCircle className="w-5 h-5 text-rose-600" />
              <h3 className="text-sm font-black text-slate-900">What Is Excluded from Warranty</h3>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                <span>Physical accidental damage, cracked glass screens, dented chassis, or drop impact.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                <span>Liquid immersion, moisture corrosion, or electrical surge from non-standard chargers.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                <span>Unauthorized third-party repairs, bootloader modifications, or jailbreaking.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                <span>Normal cosmetic wear and tear, superficial scratches, and natural battery health degradation.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* How to Claim Warranty Guide */}
        <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-cyan-400">Step-by-Step Process</span>
            <h2 className="text-xl sm:text-2xl font-black mt-1">How to Claim Your Warranty in 3 Steps</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-cyan-400 text-slate-950 font-black flex items-center justify-center text-sm">
                1
              </div>
              <h4 className="font-bold text-sm text-white">Download Tax Invoice</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Log in to your SmartElectronics account and download your official PDF tax invoice from the Order History page.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-cyan-400 text-slate-950 font-black flex items-center justify-center text-sm">
                2
              </div>
              <h4 className="font-bold text-sm text-white">Locate Brand Center</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Visit the manufacturer&apos;s official support portal or walk into any certified service center with your device &amp; invoice.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-cyan-400 text-slate-950 font-black flex items-center justify-center text-sm">
                3
              </div>
              <h4 className="font-bold text-sm text-white">Resolution &amp; Repair</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                The brand will inspect the hardware, perform certified component repair, or issue a direct replacement under warranty.
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-white/10">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              <span>Have questions about your warranty or order date?</span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/orders"
                className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition"
              >
                View My Orders
              </Link>
              <Link
                href="/contact"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white text-xs font-black transition shadow-sm"
              >
                Contact Tech Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
