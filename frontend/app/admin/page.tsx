"use client";

import { useEffect, useState } from "react";
import { Users, ShieldAlert, ShoppingBag, AlertCircle } from "lucide-react";
import { useToast } from "@/app/components/ToastProvider";
import { DashboardChart } from "@/app/components/ui/DashboardChart";

interface Seller {
  _id: string;
  kycStatus: string;
}

interface Product {
  id: number;
  status: string;
  category: string;
}

export default function AdminDashboardOverview() {
  const { toast } = useToast();
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryTrend, setCategoryTrend] = useState<{ label: string; value: number }[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [sellersRes, productsRes] = await Promise.all([
          fetch("/api/admin/sellers"),
          fetch("/api/admin/products"),
        ]);

        let sList: Seller[] = [];
        let pList: Product[] = [];

        if (sellersRes.ok) {
          const sData = await sellersRes.json();
          sList = sData.sellers || [];
          setSellers(sList);
        }
        if (productsRes.ok) {
          const pData = await productsRes.json();
          pList = pData.products || [];
          setProducts(pList);
        }

        // Calculate distribution of products across categories
        const catMap: Record<string, number> = {};
        pList.forEach((prod) => {
          const cat = prod.category || "Uncategorized";
          catMap[cat] = (catMap[cat] || 0) + 1;
        });

        const points = Object.entries(catMap).map(([label, value]) => ({
          label,
          value,
        }));

        // Default points if catalog empty
        if (points.length === 0) {
          setCategoryTrend([
            { label: "Electronics", value: 0 },
            { label: "Fashion", value: 0 },
            { label: "Home", value: 0 },
            { label: "Books", value: 0 },
          ]);
        } else {
          setCategoryTrend(points);
        }
      } catch (err) {
        toast("Failed to retrieve dashboard metrics", "error");
      } finally {
        setLoading(false);
      }
    };
    void loadData();
  }, [toast]);

  const pendingSellers = sellers.filter((s) => s.kycStatus === "pending").length;
  const activeSellers = sellers.filter((s) => s.kycStatus === "approved").length;
  const pendingProducts = products.filter((p) => p.status === "pending").length;
  const activeProducts = products.filter((p) => p.status === "approved").length;

  if (loading) {
    return (
      <div className="py-20 flex justify-center items-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-650" />
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Merchants",
      value: sellers.length,
      subtext: `${activeSellers} active · ${pendingSellers} pending`,
      icon: Users,
      color: "text-indigo-600 bg-indigo-50 border-indigo-100",
    },
    {
      label: "KYC Verification Requests",
      value: pendingSellers,
      subtext: pendingSellers > 0 ? "Needs immediate review" : "All caught up!",
      icon: ShieldAlert,
      color: pendingSellers > 0 ? "text-amber-600 bg-amber-50 border-amber-105" : "text-slate-500 bg-slate-50 border-slate-200/70",
    },
    {
      label: "Total Catalog Listings",
      value: products.length,
      subtext: `${activeProducts} approved · ${products.length - activeProducts} unlisted`,
      icon: ShoppingBag,
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
    },
    {
      label: "Product Moderation Queue",
      value: pendingProducts,
      subtext: pendingProducts > 0 ? `${pendingProducts} pending approval` : "0 pending approval",
      icon: AlertCircle,
      color: pendingProducts > 0 ? "text-rose-600 bg-rose-50 border-rose-105" : "text-slate-500 bg-slate-50 border-slate-200/70",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">Moderation Console</h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Monitor system metrics, review onboarding requests, and approve vendor catalog changes.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`rounded-2xl border bg-white p-6 shadow-sm ${card.color.split(" ")[2] || "border-slate-200"}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-500">{card.label}</span>
                <div className={`rounded-xl p-2.5 ${card.color.split(" ")[1]} ${card.color.split(" ")[0]}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-extrabold text-slate-800">{card.value}</span>
                <p className="mt-1 text-xs text-slate-400 font-semibold uppercase tracking-wider">{card.subtext}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trailing Catalog Category Distribution Chart */}
      <div className="w-full bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <DashboardChart title="Catalog Inventory by Category" data={categoryTrend} prefix="" />
      </div>

      {/* Info Notice */}
      <div className="rounded-2xl border border-indigo-100 bg-indigo-50/30 p-6 flex gap-4">
        <AlertCircle className="h-6 w-6 text-indigo-500 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold text-slate-800">Administrative Overview</h4>
          <p className="mt-1 text-xs leading-relaxed text-slate-500 max-w-2xl">
            You are viewing the administration control center. Use the sidebar to approve seller KYC documents, verify incoming catalog submissions, and manage inventory categories.
          </p>
        </div>
      </div>
    </div>
  );
}
