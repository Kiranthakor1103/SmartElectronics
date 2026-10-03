"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Spinner } from "@/app/components/ui/Spinner";
import { useToast } from "@/app/components/ToastProvider";
import { authService } from "@/app/lib/services/authService";
import { ShieldAlert, Users, Layers, ShieldCheck, LogOut, Home, Menu, X, BarChart2, Tag, Landmark } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminUser, setAdminUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    if (pathname === "/admin/login") {
      setLoading(false);
      return;
    }
    const verifyAdmin = async () => {
      try {
        const res = await fetch("/api/admin/sellers");

        if (res.status === 401) {
          toast("Please log in first", "error");
          router.push("/admin/login");
          return;
        }

        if (res.status === 403) {
          setIsAdmin(false);
        } else if (res.ok) {
          setIsAdmin(true);

          // Fetch real user name from auth
          try {
            const meData = await authService.getMe();
            if (meData.success && meData.user) {
              setAdminUser({ name: meData.user.name, email: meData.user.email });
            } else {
              // Fallback to localStorage
              const stored = typeof window !== "undefined" ? localStorage.getItem("user") : null;
              if (stored && stored !== "undefined" && stored !== "null") {
                try {
                  const parsed = JSON.parse(stored);
                  setAdminUser({ name: parsed.name || "Admin", email: parsed.email || "" });
                } catch {
                  setAdminUser({ name: "Admin", email: "" });
                }
              } else {
                setAdminUser({ name: "Admin", email: "" });
              }
            }
          } catch {
            setAdminUser({ name: "Admin", email: "" });
          }
        }
      } catch (err) {
        console.error("Admin verification failed:", err);
      } finally {
        setLoading(false);
      }
    };

    void verifyAdmin();
  }, [router, toast, pathname]);

  const handleLogout = async () => {
    try {
      await authService.logout();
      toast("Logged out successfully");
      router.push("/admin/login");
    } catch (err) {
      toast("Logout failed", "error");
    }
  };

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Spinner label="Verifying admin credentials…" />
      </div>
    );
  }

  // Access Denied State (Light Theme)
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-800 p-6">
        <div className="max-w-md w-full text-center space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 border border-rose-100">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Administrative Access Required</h1>
            <p className="text-sm text-slate-550">
              Your account does not possess the credentials necessary to moderate the KTStore marketplace.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Link
              href="/"
              className="rounded-xl bg-slate-100 py-3 text-sm font-semibold hover:bg-slate-200 transition text-slate-700"
            >
              Return Storefront
            </Link>
            <button
              onClick={handleLogout}
              className="rounded-xl border border-slate-200 py-3 text-sm font-semibold text-rose-600 hover:bg-rose-50 transition"
            >
              Log Out / Switch Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  const menuItems = [
    { label: "Overview", href: "/admin", icon: BarChart2 },
    { label: "Sellers / KYC", href: "/admin/sellers", icon: Users },
    { label: "Product Review", href: "/admin/products", icon: ShieldCheck },
    { label: "Categories", href: "/admin/categories", icon: Layers },
    { label: "Coupons", href: "/admin/coupons", icon: Tag },
    { label: "Payouts", href: "/admin/payouts", icon: Landmark },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 bg-white shrink-0 shadow-sm">
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-100">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-650 font-extrabold text-white text-lg">
            {adminUser?.name?.charAt(0)?.toUpperCase() || "A"}
          </span>
          <span className="font-extrabold text-lg tracking-tight text-slate-800 uppercase">
            Admin Portal
          </span>
        </div>

        <div className="p-4 border-b border-slate-100">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Logged in as</p>
          <p className="text-sm font-bold text-slate-700 mt-0.5 truncate">{adminUser?.name}</p>
          {adminUser?.email && (
            <p className="text-[10px] text-slate-400 mt-0.5 truncate">{adminUser.email}</p>
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

      {/* Sidebar - Mobile Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 md:hidden" onClick={() => setSidebarOpen(false)}>
          <aside
            className="fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 flex flex-col p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <span className="font-extrabold text-lg tracking-tight text-slate-850 uppercase font-sans">Admin Portal</span>
              <button onClick={() => setSidebarOpen(false)} className="text-slate-450 hover:text-slate-800">
                <X className="h-6 w-6" />
              </button>
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md px-6 flex items-center justify-between md:justify-end shrink-0 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden text-slate-500 hover:text-slate-800">
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex items-center gap-4">
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-650 flex items-center gap-1.5 border border-indigo-100">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
              Secure Console
            </span>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8 bg-slate-50/50">{children}</main>
      </div>
    </div>
  );
}
