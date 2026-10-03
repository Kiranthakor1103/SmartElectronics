import type { Metadata } from "next";
import Link from "next/link";
import { Zap, ArrowLeft, Tag, ShieldCheck, Flame, Percent } from "lucide-react";
import ProductCard from "../components/ProductCard";
import DealCountdown from "../components/DealCountdown";
import { ProductService } from "@/services/productService";
import { serializeDocs } from "@/lib/serialize";

export const metadata: Metadata = {
  title: "Exclusive Flash Deals & Special Discounts | SmartElectronics",
  description:
    "Grab massive discounts on smartphones, laptops, 4K TVs, and smart devices. Limited-time tech flash sales with up to 70% OFF only on SmartElectronics.",
  keywords: ["Deals of the Day", "Discount Offers", "Flash Sale", "Electronics Sale", "SmartElectronics Deals"],
  openGraph: {
    title: "Today's Exclusive Tech Deals & Discounts | SmartElectronics",
    description: "Limited-time price drops and mega clearance offers across top electronics brands.",
    url: "https://smartelectronics.com/deals",
  },
  alternates: {
    canonical: "https://smartelectronics.com/deals",
  },
};

function getTodayExpiry() {
  const expiresAt = new Date();
  expiresAt.setHours(23, 59, 59, 999);
  return expiresAt.toISOString();
}

export default async function DealsPage() {
  let rawDeals: any[] = [];
  try {
    const res = await ProductService.getProducts({ deal: true, limit: 100 });
    rawDeals = res?.products || [];
  } catch (error) {
    console.error("[Deals Page] Failed to fetch deals:", error);
  }

  const deals = serializeDocs(rawDeals);
  const expiresAt = getTodayExpiry();

  return (
    <div className="min-h-screen bg-mesh text-slate-900 pb-20">
      
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 text-white border-b border-slate-800 py-10 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-300 hover:text-white transition mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 px-3.5 py-1 text-[11px] font-black text-white shadow-lg uppercase tracking-wider">
                <Flame className="h-3.5 w-3.5 fill-current" />
                SmartElectronics Exclusive Deals
              </span>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                Big Tech Deals &amp; Unbeatable Savings
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                Shop top-tier smartphones, laptops, 4K TVs, audio gear, and smart appliances with verified discount prices up to 70% off.
              </p>
            </div>

            {/* Countdown Box */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 backdrop-blur-md shrink-0 flex flex-col items-center sm:items-start gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-400 flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-amber-400 fill-amber-400" /> Flash Deals Expire In:
              </span>
              <DealCountdown expiresAt={expiresAt} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-8">
        
        <div className="flex items-center justify-between gap-4 mb-6 border-b border-slate-200/80 pb-4">
          <div className="flex items-center gap-2">
            <Percent className="h-5 w-5 text-indigo-600" />
            <h2 className="text-lg font-black text-slate-950">
              Active Flash Discount Products ({deals.length})
            </h2>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs">
            100% Authentic Guaranteed
          </span>
        </div>

        {deals.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {deals.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <Tag className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No deals available right now</h3>
            <p className="text-xs text-slate-500 mt-1">Check back soon for the next flash sale drop.</p>
            <Link
              href="/products"
              className="inline-block mt-4 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-700 transition"
            >
              Browse All Products
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
