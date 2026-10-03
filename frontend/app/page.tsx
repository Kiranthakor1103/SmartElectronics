import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Zap, Star, TrendingUp, ShieldCheck, Truck, RefreshCcw, Headphones, Cpu, Sparkles } from "lucide-react";
import CategoryBar from "./components/CategoryBar";
import HomeProductCard from "./components/HomeProductCard";
import DealCountdown from "./components/DealCountdown";
import { CategoryService } from "@/services/categoryService";
import { ProductService } from "@/services/productService";
import { serializeDocs } from "@/lib/serialize";

function getTodayExpiry() {
  const expiresAt = new Date();
  expiresAt.setHours(23, 59, 59, 999);
  return expiresAt.toISOString();
}

const trustBadges = [
  { icon: ShieldCheck, label: "100% Genuine Brand Warranty", sub: "Direct manufacturer guarantee" },
  { icon: Truck, label: "Express Tech Delivery", sub: "Insured safe nationwide transit" },
  { icon: RefreshCcw, label: "7-Day Replacement", sub: "Hassle-free tech return policy" },
  { icon: Headphones, label: "24/7 Tech Assistance", sub: "Expert customer support" },
];

export default async function Home() {
  // Fetch categories using CategoryService (API with DB Fallback)
  let rawCategories: any[] = [];
  try {
    rawCategories = await CategoryService.getCategories();
  } catch (error) {
    console.error("[Home Page] Failed to fetch categories:", error);
  }

  const categories = (rawCategories || []).map((cat: any) => ({
    name: cat.name,
    slug: cat.slug,
    icon: cat.icon,
    subCategories: Array.isArray(cat.subCategories)
      ? cat.subCategories.map((s: any) => (typeof s === "string" ? s : s.name))
      : undefined,
    image: cat.image,
    color: cat.color || "from-blue-50 to-indigo-100",
    href: cat.href || `/products?category=${encodeURIComponent(cat.name)}`,
  }));

  // Fetch deals using ProductService (API with DB Fallback) - 4 per row layout
  let rawDeals: any[] = [];
  try {
    const res = await ProductService.getProducts({ deal: true, limit: 4 });
    rawDeals = res?.products || [];
  } catch (error) {
    console.error("[Home Page] Failed to fetch deals:", error);
  }
  const deals = serializeDocs(rawDeals);

  // Fetch flagship electronics using ProductService (API with DB Fallback) - 4 per row layout
  let rawElectronics: any[] = [];
  try {
    const res = await ProductService.getProducts({ limit: 4 });
    rawElectronics = res?.products || [];
  } catch (error) {
    console.error("[Home Page] Failed to fetch electronics:", error);
  }
  const electronics = serializeDocs(rawElectronics);

  const expiresAt = getTodayExpiry();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* ── Trust Badge Strip ── */}
      <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/80 to-cyan-50/90 text-slate-800 py-2.5 border-b border-blue-100/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-center justify-around gap-4 overflow-x-auto hide-scrollbar">
            {trustBadges.map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-center gap-2.5 shrink-0 py-0.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white shadow-2xs">
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="leading-tight">
                  <span className="text-xs font-black text-slate-900 block">{label}</span>
                  <span className="text-[10px] text-slate-500 font-semibold">{sub}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 11 Electronics Categories Row ── */}
      <CategoryBar categories={categories} />

      {/* ── Hero Banner (Dynamic Tech Presentation) ── */}
      <section className="mx-auto max-w-7xl px-4 pt-6 pb-4">
        <h1 className="sr-only">
          SmartElectronics — India&apos;s Premier Online Electronics &amp; Tech Superstore
        </h1>
        <div className="relative w-full overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 border border-slate-800 shadow-2xl p-8 md:p-12 text-white">
          {/* Ambient Tech Lighting */}
          <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-blue-500/15 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 border border-blue-400/30 px-3.5 py-1 text-xs font-bold text-cyan-300">
                <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                <span>SmartElectronics Mega Tech Fest 2026</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                Next-Gen <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-300 bg-clip-text text-transparent">Electronics</span> &amp; Flagship Tech
              </h2>
              <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
                Upgrade to Apple iPhone 15 Pro, RTX 4080 Gaming Raptops, 4K OLED Smart TVs, and Inverter Appliances with 100% Brand Warranty and zero-cost EMI.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/deals"
                  className="rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 px-6 py-3.5 text-xs font-black text-white shadow-xl shadow-blue-500/25 hover:scale-105 active:scale-95 transition-all uppercase tracking-wider"
                >
                  Explore Tech Deals ⚡
                </Link>
                <Link
                  href="/products?category=Mobile+%26+Tablets"
                  className="rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 px-6 py-3.5 text-xs font-bold text-white transition-all"
                >
                  Smartphones &amp; Tablets
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 grid grid-cols-2 gap-3">
              <Link
                href="/products/1"
                className="group relative rounded-2xl bg-slate-900/80 border border-slate-800 p-4 hover:border-blue-500/50 transition-all hover:scale-[1.02]"
              >
                <div className="relative h-28 w-full mb-2">
                  <Image
                    src="https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&auto=format&fit=crop&q=80"
                    alt="iPhone 15 Pro Max"
                    fill
                    className="object-contain"
                  />
                </div>
                <p className="text-xs font-bold text-white truncate">iPhone 15 Pro Max</p>
                <p className="text-[11px] text-cyan-400 font-extrabold">₹1,49,900</p>
              </Link>

              <Link
                href="/products/4"
                className="group relative rounded-2xl bg-slate-900/80 border border-slate-800 p-4 hover:border-blue-500/50 transition-all hover:scale-[1.02]"
              >
                <div className="relative h-28 w-full mb-2">
                  <Image
                    src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&auto=format&fit=crop&q=80"
                    alt="MacBook Pro M3 Max"
                    fill
                    className="object-contain"
                  />
                </div>
                <p className="text-xs font-bold text-white truncate">MacBook Pro M3 Max</p>
                <p className="text-[11px] text-cyan-400 font-extrabold">₹3,24,900</p>
              </Link>

              <Link
                href="/products/7"
                className="group relative rounded-2xl bg-slate-900/80 border border-slate-800 p-4 hover:border-blue-500/50 transition-all hover:scale-[1.02]"
              >
                <div className="relative h-28 w-full mb-2">
                  <Image
                    src="https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=400&auto=format&fit=crop&q=80"
                    alt="Sony 65 OLED TV"
                    fill
                    className="object-contain"
                  />
                </div>
                <p className="text-xs font-bold text-white truncate">Sony 65&quot; OLED TV</p>
                <p className="text-[11px] text-cyan-400 font-extrabold">₹1,99,990</p>
              </Link>

              <Link
                href="/products/14"
                className="group relative rounded-2xl bg-slate-900/80 border border-slate-800 p-4 hover:border-blue-500/50 transition-all hover:scale-[1.02]"
              >
                <div className="relative h-28 w-full mb-2">
                  <Image
                    src="https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400&auto=format&fit=crop&q=80"
                    alt="PS5 Slim Console"
                    fill
                    className="object-contain"
                  />
                </div>
                <p className="text-xs font-bold text-white truncate">PS5 Slim 1TB</p>
                <p className="text-[11px] text-cyan-400 font-extrabold">₹49,990</p>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Deals of the Day (4 Cards per Row) ── */}
      <section className="mx-auto max-w-7xl px-4 mb-6">
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-900/5 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 pt-6 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 shadow-md shadow-rose-500/20">
                  <Zap className="h-4.5 w-4.5 fill-white text-white" />
                </span>
                <h2 className="text-xl font-black text-slate-950 tracking-tight">
                  Hot Electronics Deals
                </h2>
              </div>
              {expiresAt && <DealCountdown expiresAt={expiresAt} />}
            </div>
            <Link
              href="/deals"
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-700 hover:to-indigo-700 px-5 py-2.5 text-xs font-black text-white shadow-md shadow-blue-500/20 transition-all active:scale-95 w-fit uppercase tracking-wider"
            >
              <span>VIEW ALL DEALS</span> <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="p-6">
            {deals.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {deals.map((deal: any) => (
                  <HomeProductCard key={deal.id} product={deal as any} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="rounded-2xl border border-slate-100 overflow-hidden animate-pulse">
                    <div className="h-48 bg-slate-200" />
                    <div className="p-4 space-y-2">
                      <div className="h-3 bg-slate-200 rounded w-1/3" />
                      <div className="h-4 bg-slate-200 rounded w-full" />
                      <div className="h-4 bg-slate-200 rounded w-3/4" />
                      <div className="h-5 bg-slate-200 rounded w-1/2" />
                      <div className="h-10 bg-slate-200 rounded-xl" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Promotional Electronics Banner Strip ── */}
      <section className="mx-auto max-w-7xl px-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              gradient: "from-slate-950 via-slate-900 to-blue-950 border-slate-800",
              icon: "📱",
              title: "Flagship Mobiles",
              sub: "iPhone 15 & Galaxy S24 Ultra",
              href: "/products?category=Mobile+%26+Tablets",
            },
            {
              gradient: "from-blue-950 via-slate-900 to-indigo-950 border-blue-900/50",
              icon: "💻",
              title: "Gaming Rigs & Laptops",
              sub: "M3 Max & RTX 4080 Models",
              href: "/products?category=Laptops+%26+Computers",
            },
            {
              gradient: "from-slate-900 via-indigo-950 to-slate-950 border-indigo-900/50",
              icon: "📺",
              title: "4K OLED & QLED TVs",
              sub: "Up to 30% off Sony & Samsung",
              href: "/products?category=TVs+%26+Entertainment",
            },
          ].map((b) => (
            <Link
              key={b.title}
              href={b.href}
              className={`flex items-center gap-4 bg-gradient-to-r ${b.gradient} border rounded-2xl px-5 py-4 text-white shadow-lg transition-transform hover:scale-[1.02]`}
            >
              <span className="text-3xl">{b.icon}</span>
              <div>
                <p className="font-extrabold text-sm">{b.title}</p>
                <p className="text-xs text-slate-300 font-medium">{b.sub}</p>
              </div>
              <ChevronRight className="h-4 w-4 ml-auto text-blue-400" />
            </Link>
          ))}
        </div>
      </section>

      {/* ── Best of Electronics (4 Cards per Row) ── */}
      <section className="mx-auto max-w-7xl px-4 mb-6">
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-900/5 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 pt-6 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 shadow-md shadow-blue-500/20">
                <TrendingUp className="h-4.5 w-4.5 text-white" />
              </span>
              <h2 className="text-xl font-black text-slate-950 tracking-tight">
                Featured Electronics
              </h2>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { name: "All", href: "/products" },
                { name: "Mobiles", href: "/products?category=Mobile+%26+Tablets" },
                { name: "Laptops", href: "/products?category=Laptops+%26+Computers" },
                { name: "TVs", href: "/products?category=TVs+%26+Entertainment" },
                { name: "Audio", href: "/products?category=Audio+Devices" },
              ].map((tab) => (
                <Link
                  key={tab.name}
                  href={tab.href}
                  className={`tab-pill ${tab.name === "All" ? "active" : ""}`}
                >
                  {tab.name}
                </Link>
              ))}
              <Link
                href="/products"
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-700 hover:to-indigo-700 px-5 py-2.5 text-xs font-black text-white shadow-md shadow-blue-500/20 transition-all active:scale-95 ml-2 uppercase tracking-wider"
              >
                <span>EXPLORE ALL</span> <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="p-6">
            {electronics.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {electronics.map((product: any) => (
                  <HomeProductCard key={product.id} product={product as any} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="rounded-2xl border border-slate-100 overflow-hidden animate-pulse">
                    <div className="h-48 bg-slate-200" />
                    <div className="p-4 space-y-2">
                      <div className="h-3 bg-slate-200 rounded w-1/3" />
                      <div className="h-4 bg-slate-200 rounded w-full" />
                      <div className="h-4 bg-slate-200 rounded w-3/4" />
                      <div className="h-5 bg-slate-200 rounded w-1/2" />
                      <div className="h-10 bg-slate-200 rounded-xl" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Brand Warranty Assurance Banner ── */}
      <section className="mx-auto max-w-7xl px-4 mb-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-8 py-10 shadow-2xl border border-slate-800">
          <div className="absolute top-0 right-0 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6 text-white">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="text-xs font-black uppercase tracking-wider text-blue-400">
                  SmartElectronics Authenticity Guarantee
                </span>
              </div>
              <h3 className="text-2xl md:text-3xl font-black leading-tight mb-2">
                100% Genuine Authorized Brand Warranty
              </h3>
              <p className="text-xs text-slate-300 max-w-md leading-relaxed">
                Shop with confidence: Apple, Samsung, Sony, ASUS, Dell, LG, Philips &amp; more — every item includes verifiable manufacturer warranty and nationwide service coverage.
              </p>
            </div>
            <Link
              href="/deals"
              className="shrink-0 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 px-6 py-3.5 text-xs font-black text-white shadow-xl hover:scale-105 transition-all uppercase tracking-wider"
            >
              Explore Tech Deals →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Electronics Category Quick Links ── */}
      <section className="mx-auto max-w-7xl px-4 mb-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { emoji: "📱", label: "Mobile & Tablets", sub: "Starting ₹12,999", href: "/products?category=Mobile+%26+Tablets" },
            { emoji: "💻", label: "Laptops & Computers", sub: "Starting ₹34,999", href: "/products?category=Laptops+%26+Computers" },
            { emoji: "📺", label: "TVs & Entertainment", sub: "Starting ₹18,999", href: "/products?category=TVs+%26+Entertainment" },
            { emoji: "🎮", label: "Gaming Zone", sub: "Consoles & Accessories", href: "/products?category=Gaming+Zone" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-4 bg-white border border-slate-200/80 rounded-2xl px-5 py-4 transition-all hover:border-blue-400 hover:shadow-lg hover:scale-[1.02]"
            >
              <span className="text-3xl">{item.emoji}</span>
              <div>
                <p className="font-extrabold text-xs text-slate-900">{item.label}</p>
                <p className="text-[10px] text-blue-600 font-bold">{item.sub}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
