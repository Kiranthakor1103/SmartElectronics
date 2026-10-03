"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/app/lib/redux/hooks";
import { clearWishlist } from "@/app/lib/redux/features/wishlist/wishlistSlice";
import { clearCart } from "@/app/lib/redux/features/cart/cartSlice";
import { Search, ShoppingCart, Heart, LogOut, ChevronDown, X, ArrowRight, Package, Store, ShieldCheck, User, Bell, Zap, Ticket } from "lucide-react";
import { authService } from "@/app/lib/services/authService";
import { useToast } from "./ToastProvider";
import { ApiClient } from "@/lib/api/apiClient";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface ProductPreview {
  id: number;
  title: string;
  price: number;
  brand?: string;
  category?: string;
  thumbnail: string;
}

interface CustomerNotification {
  _id: string;
  title: string;
  message: string;
  category: string;
  channel?: string;
  badge?: string;
  themeColor?: string;
  actionUrl?: string;
  actionLabel?: string;
  read?: boolean;
  isRead?: boolean;
  createdAt: string;
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const dispatch = useAppDispatch();

  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifsOpen, setNotifsOpen] = useState(false);
  const [notifications, setNotifications] = useState<CustomerNotification[]>([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [productPreviews, setProductPreviews] = useState<ProductPreview[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const cartItems = useAppSelector((state) => state.cart.items);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = useAppSelector((state) => state.wishlist.items.length);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync searchQuery with URL q param
  useEffect(() => {
    const q = searchParams.get("q");
    if (q !== null) {
      setSearchQuery(q);
    }
  }, [searchParams]);

  // Fetch suggestions with debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      setProductPreviews([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products/suggestions?q=${encodeURIComponent(searchQuery.trim())}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            setSuggestions(Array.isArray(json.suggestions) ? json.suggestions : []);
            setProductPreviews(Array.isArray(json.products) ? json.products : []);
          }
        }
      } catch (err) {
        console.error("Error fetching suggestions:", err);
      }
    }, 180);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Click outside suggestions box & dropdowns
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".search-container-el")) {
        setShowSuggestions(false);
      }
      if (!target.closest(".profile-dropdown-el")) {
        setDropdownOpen(false);
      }
      if (!target.closest(".notif-dropdown-el")) {
        setNotifsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setNotifsOpen(false);
    setDropdownOpen(false);
    setShowSuggestions(false);
  }, [pathname]);

  // Fetch customer notifications
  const fetchCustomerNotifications = async () => {
    try {
      const res = await ApiClient.get<CustomerNotification[]>("/notifications/list", { role: "customer" });
      if (res && res.success && Array.isArray(res.data)) {
        setNotifications(res.data);
        const count = typeof res.count === "number" && typeof (res as any).unreadCount === "number"
          ? (res as any).unreadCount
          : res.data.filter((n) => !n.isRead && !n.read).length;
        setUnreadNotifCount(count);
      }
    } catch (err) {
      console.error("Failed to fetch customer notifications", err);
    }
  };

  useEffect(() => {
    fetchCustomerNotifications();

    // Responsive poll every 10 seconds
    const interval = setInterval(fetchCustomerNotifications, 10000);

    // Refetch on tab focus
    const handleFocus = () => fetchCustomerNotifications();
    window.addEventListener("focus", handleFocus);

    // Live Cross-Tab BroadcastChannel
    let bc: BroadcastChannel | null = null;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        bc = new BroadcastChannel("smart_electronics_notifications");
        bc.onmessage = (event) => {
          if (event.data?.type === "NOTIFICATION_BROADCAST" || event.data?.type === "REFRESH_NOTIFICATIONS") {
            fetchCustomerNotifications();
          }
        };
      } catch {}
    }

    // Live Server-Sent Events (SSE) stream for real-time notification pushes
    let es: EventSource | null = null;
    if (typeof window !== "undefined" && "EventSource" in window) {
      try {
        const streamUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api") + "/notifications/stream";
        es = new EventSource(streamUrl);
        es.addEventListener("NOTIFICATION_BROADCAST", (e) => {
          try {
            const payload = JSON.parse(e.data);
            if (payload.role === "customer" || payload.role === "all") {
              fetchCustomerNotifications();
            }
          } catch {}
        });
      } catch {}
    }

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
      if (bc) bc.close();
      if (es) es.close();
    };
  }, []);

  const handleMarkNotifRead = async (id: string, actionUrl?: string) => {
    try {
      await ApiClient.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadNotifCount((prev) => Math.max(0, prev - 1));
      if (actionUrl) {
        setNotifsOpen(false);
        router.push(actionUrl);
      }
    } catch (err) {
      console.error("Failed to mark notification read", err);
    }
  };

  const handleMarkAllNotifsRead = async () => {
    try {
      await ApiClient.patch("/notifications/read-all", { role: "customer" });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadNotifCount(0);
      toast("All notifications marked as read.", "success");
    } catch (err) {
      console.error("Failed to mark all notifications read", err);
    }
  };

  // Fetch logged in user on mount & listen to auth changes
  useEffect(() => {
    async function checkAuth() {
      if (typeof window !== "undefined") {
        const storedUser = localStorage.getItem("user");
        if (storedUser && storedUser !== "undefined" && storedUser !== "null") {
          try {
            setUser(JSON.parse(storedUser));
          } catch (e) {
            console.error("Failed to parse stored user", e);
          }
        }
      }

      try {
        const data = await authService.getMe();
        const meUser = data?.data?.user || (data?.data && (data.data.name || data.data.email) ? data.data : null) || data?.user;
        if (data && data.success && meUser) {
          setUser(meUser);
          if (typeof window !== "undefined") {
            localStorage.setItem("user", JSON.stringify(meUser));
          }
        } else if (data && (data.status === 401 || !meUser)) {
          setUser(null);
          if (typeof window !== "undefined") {
            localStorage.removeItem("user");
          }
        }
      } catch (err) {
        console.error("Auth check failed", err);
      }
    }
    checkAuth();

    if (typeof window !== "undefined") {
      window.addEventListener("auth-change", checkAuth);
      return () => {
        window.removeEventListener("auth-change", checkAuth);
      };
    }
  }, []);

  const isDashboard = pathname.startsWith("/admin") || pathname.startsWith("/seller");
  if (isDashboard) return null;

  const executeSearch = (query: string) => {
    setShowSuggestions(false);
    const cleanQuery = query.trim();
    if (cleanQuery) {
      router.push(`/products?q=${encodeURIComponent(cleanQuery)}`);
    } else {
      router.push("/products");
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(searchQuery);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      executeSearch(searchQuery);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSuggestions([]);
    setProductPreviews([]);
    setShowSuggestions(false);
  };

  const handleLogout = async () => {
    try {
      const data = await authService.logout();
      if (data.success) {
        setUser(null);
        dispatch(clearWishlist());
        dispatch(clearCart());
        toast("Logged out successfully");
        router.push("/");
        router.refresh();
      } else {
        toast("Failed to log out", "error");
      }
    } catch {
      toast("Error logging out", "error");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-indigo-900/60 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 text-white shadow-2xl backdrop-blur-md py-1.5 transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 md:gap-8">
        
        {/* Brand Logo */}
        <Link href="/" className="group shrink-0 flex items-center gap-2.5 select-none">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white font-black text-xl shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
            <svg className="w-5.5 h-5.5 text-cyan-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="currentColor" fillOpacity="0.25" />
            </svg>
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

        {/* Dynamic Search Bar (High Visibility Border & Styling) */}
        <div className="search-container-el hidden flex-1 md:block max-w-xl relative">
          <form onSubmit={handleSearchSubmit} className="w-full">
            <div className="relative w-full group">
              {/* Left Search Icon Indicator */}
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-400 pointer-events-none">
                <Search className="h-4 w-4" />
              </div>

              <input
                type="text"
                placeholder="Search smartphones, gaming laptops, 4K TVs, audio..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onKeyDown={handleSearchKeyDown}
                onFocus={() => setShowSuggestions(true)}
                className="w-full rounded-2xl bg-white/10 border-2 border-indigo-400/50 hover:border-indigo-300 focus:border-indigo-400 px-4 py-2.5 pl-10 pr-20 text-xs font-bold text-white placeholder-slate-300 outline-none transition-all focus:bg-slate-900 focus:ring-4 focus:ring-indigo-500/30 shadow-lg shadow-black/20"
              />
              
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-13 top-0 h-full px-2 text-slate-300 hover:text-white transition"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}

              <button
                type="submit"
                className="absolute right-1 top-1 h-[calc(100%-8px)] px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 text-white hover:from-indigo-500 hover:to-violet-500 transition font-bold shadow-md shadow-indigo-500/30 hover:scale-105 active:scale-95"
                aria-label="Submit search"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
          </form>

          {/* Dynamic Search Dropdown */}
          {showSuggestions && searchQuery.trim() && (
            <div className="absolute left-0 right-0 mt-2 rounded-2xl bg-slate-900 border-2 border-indigo-500/40 shadow-2xl z-50 overflow-hidden text-slate-100 max-h-[75vh] overflow-y-auto backdrop-blur-xl">
              
              {/* Product Previews */}
              {productPreviews.length > 0 && (
                <div className="p-3 border-b border-slate-800 bg-slate-950/90">
                  <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-indigo-400 flex items-center justify-between">
                    <span>Matches ({productPreviews.length})</span>
                    <span className="text-violet-400 font-bold">Express Store Catalog</span>
                  </div>
                  <div className="grid grid-cols-1 gap-1.5 mt-1">
                    {productPreviews.map((prod) => (
                      <Link
                        key={prod.id}
                        href={`/products/${prod.id}`}
                        onClick={() => setShowSuggestions(false)}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800/80 transition-all border border-transparent hover:border-indigo-500/30 group"
                      >
                        <div className="relative h-11 w-11 shrink-0 bg-white border border-slate-700 rounded-lg overflow-hidden p-0.5">
                          <Image
                            src={prod.thumbnail || "/placeholder.svg"}
                            alt={prod.title}
                            fill
                            className="object-contain"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white truncate group-hover:text-indigo-400 transition-colors">
                            {prod.title}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400">
                            {prod.brand && <span className="font-bold text-indigo-400">{prod.brand}</span>}
                            {prod.category && <span>• {prod.category}</span>}
                          </div>
                        </div>
                        <span className="text-xs font-black text-amber-400 shrink-0">
                          ₹{prod.price.toLocaleString("en-IN")}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Text Suggestions */}
              {suggestions.length > 0 && (
                <div className="py-2">
                  <div className="px-4 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Popular Suggestions
                  </div>
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => {
                        setSearchQuery(suggestion);
                        executeSearch(suggestion);
                      }}
                      className="flex w-full items-center justify-between px-4 py-2 text-left text-xs hover:bg-indigo-950/60 transition-colors border-b border-slate-800/60 last:border-b-0"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Search className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                        <span className="font-semibold text-slate-200 truncate">{suggestion}</span>
                      </div>
                      <ArrowRight className="h-3 w-3 text-slate-500" />
                    </button>
                  ))}
                </div>
              )}

              {/* Footer Search Button */}
              <button
                type="button"
                onClick={() => executeSearch(searchQuery)}
                className="flex w-full items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 p-3 text-xs font-bold text-white hover:from-indigo-500 hover:to-violet-500 transition shadow-lg shadow-indigo-500/20"
              >
                <span>Search for &quot;{searchQuery}&quot; in all products</span>
                <ArrowRight className="h-4 w-4" />
              </button>

            </div>
          )}
        </div>

        {/* Right Navigation Actions */}
        <div className="flex items-center gap-3 text-sm font-semibold">
          {mounted && user ? (
            <div className="relative profile-dropdown-el">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 rounded-xl bg-slate-900/90 border border-slate-800 px-3.5 py-2 text-xs font-bold text-white hover:border-indigo-500 hover:bg-slate-800 transition-all shadow-xs"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-extrabold text-[11px] shadow-xs">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[90px] truncate">Hi, {user.name.split(" ")[0]}</span>
                <ChevronDown className="h-3.5 w-3.5 text-indigo-400" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-800 bg-slate-900 p-1.5 shadow-2xl z-50 text-slate-100">
                  <div className="px-4 py-2.5 text-xs text-slate-400 border-b border-slate-800 truncate">
                    <p className="font-bold text-white text-xs">{user.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                  </div>

                  <Link
                    href="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-xs text-slate-200 hover:bg-indigo-950 hover:text-indigo-300 transition-colors font-bold mt-1"
                  >
                    <User className="h-4 w-4 text-indigo-400" />
                    My Account Profile
                  </Link>

                  <Link
                    href="/orders"
                    onClick={() => setDropdownOpen(false)}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-xs text-slate-200 hover:bg-indigo-950 hover:text-indigo-300 transition-colors font-bold"
                  >
                    <Package className="h-4 w-4 text-indigo-400" />
                    My Order History
                  </Link>

                  {user.role === "admin" && (
                    <Link
                      href="/admin"
                      onClick={() => setDropdownOpen(false)}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-xs text-slate-200 hover:bg-indigo-950 hover:text-indigo-300 transition-colors font-bold"
                    >
                      <ShieldCheck className="h-4 w-4 text-indigo-400" />
                      Admin Portal
                    </Link>
                  )}
                  {user.role === "seller" && (
                    <Link
                      href="/seller/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-xs text-slate-200 hover:bg-indigo-950 hover:text-indigo-300 transition-colors font-bold"
                    >
                      <Store className="h-4 w-4 text-indigo-400" />
                      Seller Dashboard
                    </Link>
                  )}
                  {user.role === "user" && (
                    <Link
                      href="/seller/onboarding"
                      onClick={() => setDropdownOpen(false)}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-xs text-slate-200 hover:bg-amber-950/60 hover:text-amber-400 transition-colors font-bold"
                    >
                      <Store className="h-4 w-4 text-amber-400" />
                      Become a Merchant
                    </Link>
                  )}
                  
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      handleLogout();
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-xs text-rose-400 hover:bg-rose-950/50 transition-colors font-bold border-t border-slate-800 mt-1"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link href="/seller/login" className="hidden lg:block text-slate-300 hover:text-indigo-400 transition-colors font-bold text-xs">
                Sell on SmartElectronics
              </Link>
              <Link
                href="/login"
                className="rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 hover:from-indigo-500 hover:to-violet-500 text-white font-black text-xs px-4 py-2 shadow-md transition-all"
              >
                Sign In
              </Link>
            </div>
          )}
          
          {/* Notification Bell Dropdown */}
          <div className="relative notif-dropdown-el">
            <button
              type="button"
              onClick={() => {
                setNotifsOpen(!notifsOpen);
                if (!notifsOpen) fetchCustomerNotifications();
              }}
              className="relative flex items-center justify-center p-2 rounded-xl text-slate-200 hover:bg-slate-800/80 hover:text-cyan-400 transition-all focus:outline-none"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {mounted && unreadNotifCount > 0 && (
                <span
                  suppressHydrationWarning
                  className="absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-[10px] font-black text-white shadow-xs animate-pulse"
                >
                  {unreadNotifCount > 9 ? "9+" : unreadNotifCount}
                </span>
              )}
            </button>

            {notifsOpen && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 p-4 shadow-2xl shadow-black/80 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
                      <Bell className="h-3.5 w-3.5" />
                    </span>
                    <h4 className="text-xs font-black uppercase tracking-wider text-white">
                      Tech Notifications
                    </h4>
                    {unreadNotifCount > 0 && (
                      <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] font-bold text-cyan-300">
                        {unreadNotifCount} new
                      </span>
                    )}
                  </div>
                  {unreadNotifCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllNotifsRead}
                      className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="mt-3 max-h-80 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center">
                      <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-slate-400 mb-2">
                        <Bell className="h-5 w-5" />
                      </div>
                      <p className="text-xs font-semibold text-slate-300">No notifications yet</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Exclusive tech drops & tracking alerts will appear here.
                      </p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif._id}
                        onClick={() => handleMarkNotifRead(notif._id, notif.actionUrl)}
                        className={`group relative flex gap-3 p-2.5 rounded-xl border transition-all cursor-pointer ${
                          notif.isRead
                            ? "bg-slate-950/40 border-slate-800/60 hover:border-slate-700"
                            : "bg-gradient-to-r from-slate-900 to-indigo-950/40 border-cyan-500/30 hover:border-cyan-500/60 shadow-xs"
                        }`}
                      >
                        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-cyan-400 border border-indigo-500/20">
                          {notif.category === "promo" ? (
                            <Ticket className="h-3.5 w-3.5" />
                          ) : notif.category === "flash_sale" ? (
                            <Zap className="h-3.5 w-3.5 text-amber-400" />
                          ) : (
                            <Bell className="h-3.5 w-3.5" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <div className="flex items-center gap-1.5 min-w-0 truncate">
                              <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 truncate">
                                {notif.badge || notif.category}
                              </span>
                              <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60">
                                {notif.channel === "email" ? "✉️ EMAIL" : notif.channel === "push" ? "🌐 PUSH" : "🔔 IN-APP"}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-500 shrink-0">
                              {new Date(notif.createdAt).toLocaleDateString([], {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1 mt-0.5">
                            {notif.title}
                          </p>
                          <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                            {notif.message}
                          </p>
                          {notif.actionLabel && (
                            <div className="mt-1.5 flex items-center gap-1 text-[10px] font-bold text-cyan-400 group-hover:text-cyan-300">
                              <span>{notif.actionLabel}</span>
                              <ArrowRight className="h-2.5 w-2.5 group-hover:translate-x-0.5 transition-transform" />
                            </div>
                          )}
                        </div>

                        {!notif.isRead && (
                          <div className="shrink-0 flex items-center">
                            <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-xs shadow-cyan-400" />
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800 text-center">
                  <span className="text-[10px] font-semibold text-slate-500">
                    SmartElectronics Instant Alerts
                  </span>
                </div>
              </div>
            )}
          </div>

          <Link 
            href="/wishlist" 
            className="relative flex items-center justify-center p-2 rounded-xl text-slate-200 hover:bg-slate-800 hover:text-indigo-400 transition-all"
            aria-label="Wishlist"
          >
            <Heart className="h-5 w-5" />
            {mounted && wishlistCount > 0 && (
              <span
                suppressHydrationWarning
                className="absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-indigo-500 text-[10px] font-black text-white shadow-xs"
              >
                {wishlistCount}
              </span>
            )}
          </Link>

          <Link 
            href="/cart" 
            className="relative flex items-center justify-center p-2 rounded-xl text-slate-200 hover:bg-slate-800 hover:text-indigo-400 transition-all"
            aria-label="Cart"
          >
            <ShoppingCart className="h-5 w-5" />
            {mounted && cartCount > 0 && (
              <span
                suppressHydrationWarning
                className="absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-violet-500 text-[10px] font-black text-white shadow-xs"
              >
                {cartCount}
              </span>
            )}
          </Link>
        </div>

      </div>

      {/* Mobile Search Bar */}
      <div className="search-container-el block md:hidden px-4 pb-2 pt-1">
        <form onSubmit={handleSearchSubmit} className="w-full">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl bg-white/10 border-2 border-indigo-400/50 px-4 py-2 pl-3 pr-10 text-xs text-white placeholder-slate-300 outline-none focus:border-indigo-400"
            />
            <button
              type="submit"
              className="absolute right-2 top-0 h-full px-2 text-indigo-400"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </header>
  );
}
