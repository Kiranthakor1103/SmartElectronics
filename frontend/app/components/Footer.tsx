"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, Truck, RotateCcw, Headphones, Send, Zap, Award, CheckCircle2, Loader2 } from "lucide-react";
import { useToast } from "@/app/components/ToastProvider";
import { ApiClient } from "@/lib/api/apiClient";

const footerLinks = {
  Categories: [
    { label: "Mobile & Tablets", href: "/products?category=Mobile+%26+Tablets" },
    { label: "Laptops & Computers", href: "/products?category=Laptops+%26+Computers" },
    { label: "TVs & Entertainment", href: "/products?category=TVs+%26+Entertainment" },
    { label: "Audio Devices", href: "/products?category=Audio+Devices" },
    { label: "Smart Devices", href: "/products?category=Smart+Devices" },
    { label: "Gaming Zone", href: "/products?category=Gaming+Zone" },
    { label: "Home Appliances", href: "/products?category=Home+Appliances" },
  ],
  Account: [
    { label: "My Account", href: "/profile" },
    { label: "Order History", href: "/orders" },
    { label: "Shopping Cart", href: "/cart" },
    { label: "Saved Wishlist", href: "/wishlist" },
    { label: "Merchant Portal", href: "/seller/login" },
  ],
  Company: [
    { label: "About SmartElectronics", href: "/about" },
    { label: "Brand Warranty Policy", href: "/warranty" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Contact Tech Support", href: "/contact" },
  ],
};

export default function Footer() {
  const pathname = usePathname();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const isDashboard = pathname.startsWith("/seller") || pathname.startsWith("/admin");
  if (isDashboard) return null;

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      toast("Please enter your email address.", "error");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      toast("Please enter a valid email address.", "error");
      return;
    }

    try {
      setIsLoading(true);
      const res = await ApiClient.post<{ alreadySubscribed?: boolean }>("/newsletter/subscribe", {
        email: cleanEmail,
        source: "footer_tech_drop_alerts",
      });

      if (res.success) {
        const isAlready = Boolean(res.data?.alreadySubscribed || (res as unknown as Record<string, unknown>).alreadySubscribed);
        if (isAlready) {
          toast(res.message || "You're already subscribed to tech drop alerts!", "info");
        } else {
          toast(res.message || "🎉 Subscribed to exclusive tech drop alerts!", "success");
        }
        setIsSuccess(true);
        setEmail("");
        setTimeout(() => setIsSuccess(false), 5000);
      } else {
        toast(res.message || "Unable to subscribe right now. Please try again.", "error");
      }
    } catch {
      toast("Connection error. Please check your internet and try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <footer className="border-t border-slate-200/80 bg-white">
      {/* ── Unique Trust Badges Bar (Tech Blue Gradient) ── */}
      <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/80 to-cyan-50/90 border-b border-blue-100/80 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-blue-600 border border-blue-100 shadow-xs">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h5 className="text-xs font-black text-slate-900">100% Genuine Tech</h5>
              <p className="text-[11px] text-slate-500 font-semibold">Authorized Brand Warranty</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-blue-600 border border-blue-100 shadow-xs">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <h5 className="text-xs font-black text-slate-900">Express Tech Delivery</h5>
              <p className="text-[11px] text-slate-500 font-semibold">Insured safe packaging</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-blue-600 border border-blue-100 shadow-xs">
              <RotateCcw className="h-5 w-5" />
            </div>
            <div>
              <h5 className="text-xs font-black text-slate-900">Easy Replacement</h5>
              <p className="text-[11px] text-slate-500 font-semibold">7-day hassle-free replacement</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-blue-600 border border-blue-100 shadow-xs">
              <Headphones className="h-5 w-5" />
            </div>
            <div>
              <h5 className="text-xs font-black text-slate-900">24/7 Tech Assistance</h5>
              <p className="text-[11px] text-slate-500 font-semibold">Dedicated product experts</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Electronics Footer Section ── */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-300 relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-14 md:py-16 z-10">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">
            {/* Brand Info & Newsletter */}
            <div className="lg:col-span-2 space-y-4">
              <Link href="/" className="group inline-flex items-center gap-2.5 select-none">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white font-black text-xl shadow-lg shadow-blue-500/30">
                  <Zap className="h-5 w-5 text-cyan-200 fill-current" />
                </div>
                <div className="flex flex-col leading-none">
                  <span className="text-xl font-black tracking-tight text-white flex items-center gap-1">
                    Smart<span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-300 bg-clip-text text-transparent">Electronics</span>
                    <span className="text-cyan-400 font-extrabold text-xs">⚡</span>
                  </span>
                  <span className="text-[9px] font-extrabold tracking-widest text-cyan-300/90 uppercase mt-0.5">
                    PREMIER TECH STORE
                  </span>
                </div>
              </Link>

              <p className="max-w-sm text-xs leading-relaxed text-slate-300 font-medium">
                SmartElectronics is your premier tech marketplace for flagship smartphones, gaming rigs, 4K OLED TVs, premium audio, and home appliances — featuring 100% brand warranty and express nationwide delivery.
              </p>

              {/* Newsletter Box */}
              <div className="pt-2">
                <p className="text-xs font-extrabold text-white mb-2">Subscribe for exclusive tech drop alerts</p>
                <form onSubmit={handleSubscribe} className="flex max-w-sm gap-2">
                  <div className="relative flex-1">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      placeholder={isSuccess ? "Subscribed to Tech Alerts! ⚡" : "Enter your email address"}
                      aria-label="Email address for tech drop alerts"
                      className={`w-full rounded-xl bg-slate-900/90 border px-4 py-2.5 text-xs font-semibold text-white placeholder-slate-400 outline-none transition ${
                        isSuccess
                          ? "border-emerald-500/80 bg-emerald-950/30 text-emerald-300 placeholder-emerald-400"
                          : "border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      }`}
                    />
                    {isSuccess && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400">
                        <CheckCircle2 className="h-4 w-4" />
                      </span>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    aria-label="Subscribe to newsletter"
                    className={`rounded-xl px-4 py-2.5 text-xs font-black text-white transition shadow-md flex items-center justify-center cursor-pointer shrink-0 ${
                      isSuccess
                        ? "bg-emerald-600 shadow-emerald-500/25"
                        : "bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-blue-500/25 disabled:opacity-60"
                    }`}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-white" />
                    ) : isSuccess ? (
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </button>
                </form>
                {isSuccess ? (
                  <p className="text-[11px] font-bold text-emerald-400 mt-1.5 flex items-center gap-1 animate-fade-in">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                    <span>Welcome to VIP Alerts! Check your inbox for updates.</span>
                  </p>
                ) : (
                  <p className="text-[10px] text-slate-400 mt-1.5">
                    No spam ever. Unsubscribe at any time with 1-click.
                  </p>
                )}
              </div>
            </div>

            {/* Links Columns */}
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <h4 className="text-xs font-black uppercase tracking-wider text-blue-400 mb-4">
                  {title}
                </h4>
                <ul className="space-y-2.5">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-xs font-semibold text-slate-300 transition-colors hover:text-white hover:underline"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom Copyright Strip */}
          <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-slate-800/80 pt-8 sm:flex-row text-xs text-slate-400 font-medium">
            <p>
              &copy; {new Date().getFullYear()} SmartElectronics Retail Pvt Ltd. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-1.5 text-slate-300 font-bold">
                <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                100% Genuine Brand Guaranteed
              </span>
              <span className="flex items-center gap-1.5 text-slate-300 font-bold">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                256-Bit SSL Checkout
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
