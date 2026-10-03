"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Spinner } from "@/app/components/ui/Spinner";
import { useToast } from "@/app/components/ToastProvider";
import { authService } from "@/app/lib/services/authService";
import { LayoutDashboard, ShoppingBag, ShoppingCart, LogOut, Home, Menu, X, Wallet } from "lucide-react";

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sellerName, setSellerName] = useState("");
  const [sellerEmail, setSellerEmail] = useState("");

  useEffect(() => {
    if (pathname === "/seller/login" || pathname === "/seller/register" || pathname === "/seller/onboarding") {
      setLoading(false);
      return;
    }
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/seller/onboard");
        if (res.status === 401) {
          toast("Please log in first", "error");
          router.push("/seller/login");
          return;
        }

        if (res.ok) {
          const data = await res.json();
          if (!data.success || !data.data.hasApplied) {
            toast("Please complete your onboarding profile first", "info");
            router.push("/seller/onboarding");
            return;
          }

          if (data.data.seller.kycStatus !== "approved") {
            toast("Your KYC application is pending approval", "info");
            router.push("/seller/onboarding");
            return;
          }

          setSellerName(data.data.seller.companyName);

          // Fetch real user email from auth
          try {
            const meData = await authService.getMe();
            if (meData.success && meData.user) {
              setSellerEmail(meData.user.email);
              // Use user's real name for avatar if company name is not set
              if (!data.data.seller.companyName) {
                setSellerName(meData.user.name);
              }
            }
          } catch {
            // email is optional, ignore
          }
        }
      } catch (err) {
        console.error("Failed to check auth status:", err);
      } finally {
        loading && setLoading(false);
      }
    };

    void checkAuth();
  }, [router, toast, pathname]);

  const handleLogout = async () => {
    try {
      await authService.logout();
      toast("Logged out successfully");
      router.push("/seller/login");
    } catch (err) {
      toast("Logout failed", "error");
    }
  };

  if (pathname === "/seller/login" || pathname === "/seller/register" || pathname === "/seller/onboarding") {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Spinner label="Verifying seller account…" />
      </div>
    );
  }

  const menuItems = [
    { label: "Dashboard", href: "/seller/dashboard", icon: LayoutDashboard },
    { label: "Products", href: "/seller/products", icon: ShoppingBag },
    { label: "Orders", href: "/seller/orders", icon: ShoppingCart },
    { label: "Wallet", href: "/seller/wallet", icon: Wallet },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 bg-white shrink-0 shadow-sm">
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-100">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-650 font-extrabold text-white text-lg">
            {sellerName?.charAt(0)?.toUpperCase() || "S"}
          </span>
          <span className="font-extrabold text-lg tracking-tight text-slate-800 uppercase">
            Seller Portal
          </span>
        </div>

        <div className="p-4 border-b border-slate-100">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Logged in as</p>
          <p className="text-sm font-bold text-slate-700 mt-0.5 truncate">{sellerName}</p>
          {sellerEmail && (
            <p className="text-[10px] text-slate-400 mt-0.5 truncate">{sellerEmail}</p>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  active
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                    : "text-slate-500 hover:bg-slate-50 hover:text-indigo-600"
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-2">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-550 hover:bg-slate-50 hover:text-slate-800 transition-colors"
          >
            <Home className="h-5 w-5" />
            Storefront
          </Link>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Sidebar - Mobile drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 md:hidden" onClick={() => setSidebarOpen(false)}>
          <aside
            className="fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 flex flex-col p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <span className="font-extrabold text-lg tracking-tight text-slate-800 uppercase">Seller Portal</span>
              <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="py-3 border-b border-slate-100 mb-6">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Merchant</p>
              <p className="text-sm font-bold text-slate-700 mt-0.5 truncate">{sellerName}</p>
            </div>

            <nav className="flex-1 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      active ? "bg-indigo-600 text-white" : "text-slate-500 hover:bg-slate-50 hover:text-indigo-600"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="pt-6 border-t border-slate-100 space-y-2">
              <Link
                href="/"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-550 hover:bg-slate-50 hover:text-slate-800"
              >
                <Home className="h-5 w-5" />
                Storefront
              </Link>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700"
              >
                <LogOut className="h-5 w-5" />
                Logout
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md px-6 flex items-center justify-between md:justify-end shrink-0 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden text-slate-500 hover:text-slate-800">
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex items-center gap-4">
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600 flex items-center gap-1.5 border border-emerald-100">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              KYC Verified
            </span>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8 bg-slate-50/50">{children}</main>
      </div>
    </div>
  );
}
