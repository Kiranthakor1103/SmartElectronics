"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authService } from "@/app/lib/services/authService";
import { useToast } from "@/app/components/ToastProvider";
import { useAppDispatch } from "@/app/lib/redux/hooks";
import { clearWishlist } from "@/app/lib/redux/features/wishlist/wishlistSlice";
import { clearCart } from "@/app/lib/redux/features/cart/cartSlice";
import { User, Mail, Phone, MapPin, ShieldCheck, Save, ArrowLeft, Package, Heart, LogOut, CheckCircle2 } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await authService.getMe();
        if (res && res.success) {
          const userObj = res.data?.user || (res.data && (res.data.name || res.data.email) ? res.data : null) || res.user;
          setUser(userObj);
          setFormData({
            name: userObj?.name || "",
            email: userObj?.email || "",
            phone: userObj?.phone || "",
            address: userObj?.address || "",
          });
        } else {
          // Fallback to localStorage
          const stored = localStorage.getItem("user");
          if (stored && stored !== "undefined") {
            const parsed = JSON.parse(stored);
            setUser(parsed);
            setFormData({
              name: parsed.name || "",
              email: parsed.email || "",
              phone: parsed.phone || "",
              address: parsed.address || "",
            });
          } else {
            toast("Please sign in to access your account profile", "error");
            router.push("/login");
          }
        }
      } catch (err) {
        console.error("Profile load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [router, toast]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast("Name cannot be empty", "error");
      return;
    }

    setSaving(true);
    try {
      const res = await authService.updateProfile({
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
      });

      if (res && res.success) {
        const updatedUser = res.data?.user || (res.data && (res.data.name || res.data.email) ? res.data : null) || res.user;
        if (updatedUser) {
          setUser(updatedUser);
          if (typeof window !== "undefined") {
            localStorage.setItem("user", JSON.stringify(updatedUser));
            window.dispatchEvent(new Event("auth-change"));
          }
        }
        toast("Profile details updated successfully!", "success");
        router.push("/");
      } else {
        // Fallback for local session update
        const stored = typeof window !== "undefined" ? localStorage.getItem("user") : null;
        if (stored && stored !== "undefined" && stored !== "null") {
          try {
            const parsed = JSON.parse(stored);
            const merged = { ...parsed, name: formData.name, phone: formData.phone, address: formData.address };
            localStorage.setItem("user", JSON.stringify(merged));
            setUser(merged);
            window.dispatchEvent(new Event("auth-change"));
            toast("Profile details updated successfully!", "success");
            router.push("/");
            return;
          } catch {}
        }
        toast(res?.message || "Failed to update profile", "error");
      }
    } catch (err: any) {
      const stored = typeof window !== "undefined" ? localStorage.getItem("user") : null;
      if (stored && stored !== "undefined" && stored !== "null") {
        try {
          const parsed = JSON.parse(stored);
          const merged = { ...parsed, name: formData.name, phone: formData.phone, address: formData.address };
          localStorage.setItem("user", JSON.stringify(merged));
          setUser(merged);
          window.dispatchEvent(new Event("auth-change"));
          toast("Profile details updated successfully!", "success");
          router.push("/");
          return;
        } catch {}
      }
      toast(err.message || "An error occurred while saving profile", "error");
    } finally {
      setSaving(false);
    }
  };

  const dispatch = useAppDispatch();

  const handleLogout = async () => {
    await authService.logout();
    dispatch(clearWishlist());
    dispatch(clearCart());
    toast("Logged out successfully");
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4 bg-white/5 backdrop-blur-xl border border-white/10 px-10 py-8 rounded-3xl shadow-2xl">
          {/* Dual ring spinner */}
          <div className="relative flex items-center justify-center">
            <div className="absolute h-16 w-16 rounded-full bg-gradient-to-tr from-blue-500/30 via-indigo-500/20 to-cyan-400/20 blur-xl" />
            <div className="h-14 w-14 rounded-full border-[3px] border-slate-700 border-t-blue-500 border-r-indigo-500 animate-spin" style={{ animationDuration: "0.9s" }} />
            <div className="absolute h-8 w-8 rounded-full border-2 border-transparent border-b-cyan-400 border-l-violet-500 animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.3s" }} />
            <div className="absolute flex items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 p-1.5 shadow-lg shadow-blue-500/30 animate-pulse">
              <span className="text-white text-base font-black leading-none">⚡</span>
            </div>
          </div>

          {/* SmartElectronics Brand */}
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-lg font-black tracking-tight text-white flex items-center gap-1">
              Smart<span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-300 bg-clip-text text-transparent">Electronics</span>
              <span className="text-cyan-400 font-extrabold text-sm">⚡</span>
            </span>
            <span className="text-[10px] font-bold tracking-widest text-cyan-300/80 uppercase">Loading Account Details…</span>
          </div>

          {/* Animated wave dots */}
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mesh text-slate-900 pb-20">
      
      {/* Top Banner Header (Midnight Indigo matching Header & Footer) */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 text-white border-b border-indigo-900/60 py-12 px-4 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-300 hover:text-white transition mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-indigo-500 text-white font-black text-2xl shadow-xl shadow-indigo-500/30 border border-indigo-400/30">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-white">{user?.name || "My Account"}</h1>
                  <span className="capitalize rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider">
                    {user?.role || "Customer"}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-indigo-400" /> {user?.email}
                </p>
              </div>
            </div>

            {/* Quick Action Navigation */}
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href="/orders"
                className="flex items-center gap-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500 px-4 py-2 text-xs font-bold text-white transition shadow-sm"
              >
                <Package className="h-4 w-4 text-indigo-400" />
                <span>Orders</span>
              </Link>
              <Link
                href="/wishlist"
                className="flex items-center gap-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500 px-4 py-2 text-xs font-bold text-white transition shadow-sm"
              >
                <Heart className="h-4 w-4 text-indigo-400" />
                <span>Wishlist</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-xl bg-rose-950/60 border border-rose-900/60 hover:bg-rose-900 px-4 py-2 text-xs font-bold text-rose-300 transition shadow-sm"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 pt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Account Navigation & Badges */}
        <div className="space-y-4 lg:col-span-1">
          
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-indigo-600 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" /> Account Overview
            </h3>
            
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <span className="text-slate-500 font-medium">Account Status</span>
                <span className="font-extrabold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Verified Active
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <span className="text-slate-500 font-medium">Primary Role</span>
                <span className="font-extrabold text-indigo-600 capitalize">{user?.role || "User"}</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <span className="text-slate-500 font-medium">Security Vault</span>
                <span className="font-extrabold text-slate-800">256-Bit Encrypted</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-3xl p-6 shadow-lg space-y-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-amber-400">Need Assistance?</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Contact our 24/7 dedicated support team for any order or account inquiries.
            </p>
            <Link
              href="/contact"
              className="inline-block pt-2 text-xs font-bold text-indigo-300 hover:text-white hover:underline"
            >
              Get Priority Help →
            </Link>
          </div>

        </div>

        {/* Right Side: Edit Personal Details Form */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-indigo-600" />
                <h2 className="text-lg font-black text-slate-950">Edit Account Details</h2>
              </div>
              <span className="text-[11px] font-extrabold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-xl">
                Personal Info
              </span>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              
              {/* Full Name */}
              <div>
                <label htmlFor="account-name" className="block text-xs font-extrabold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-indigo-600" /> Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  id="account-name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your full name"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-xs font-bold text-slate-900 outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all"
                />
              </div>

              {/* Email Address */}
              <div>
                <label htmlFor="account-email" className="block text-xs font-extrabold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-indigo-600" /> Email Address (Verified)
                </label>
                <input
                  id="account-email"
                  type="email"
                  disabled
                  value={formData.email}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-100/80 px-4 py-3 text-xs font-bold text-slate-500 cursor-not-allowed outline-none"
                />
                <span className="text-[10px] text-slate-400 font-semibold mt-1 block">
                  Email is locked to your authenticated SmartElectronics account.
                </span>
              </div>

              {/* Phone Number */}
              <div>
                <label htmlFor="account-phone" className="block text-xs font-extrabold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-indigo-600" /> Mobile / Phone Number
                </label>
                <input
                  id="account-phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-xs font-bold text-slate-900 outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all"
                />
              </div>

              {/* Delivery Shipping Address */}
              <div>
                <label htmlFor="account-address" className="block text-xs font-extrabold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-indigo-600" /> Default Shipping Address
                </label>
                <textarea
                  id="account-address"
                  rows={3}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="House No, Street, City, State, Pincode"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-xs font-bold text-slate-900 outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all resize-none"
                />
              </div>

              {/* Save Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 px-6 py-3.5 text-xs font-black text-white shadow-md hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50 cursor-pointer w-full sm:w-auto"
                >
                  {saving ? (
                    <span>Saving Profile Changes...</span>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Save Profile Details</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
