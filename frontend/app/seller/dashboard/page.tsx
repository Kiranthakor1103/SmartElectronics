"use client";

import { useEffect, useState } from "react";
import { ShoppingBag, DollarSign, Percent, Landmark } from "lucide-react";
import { useToast } from "@/app/components/ToastProvider";
import { DashboardChart } from "@/app/components/ui/DashboardChart";

export default function SellerDashboardPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalSales: 0,
    totalProducts: 0,
    payoutRate: "90%",
    commissionPaid: 0,
    netBalance: 0,
  });

  const [recentPayouts, setRecentPayouts] = useState<any[]>([]);
  const [salesTrend, setSalesTrend] = useState<{ label: string; value: number }[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [ordersRes, productsRes] = await Promise.all([
          fetch("/api/seller/orders"),
          fetch("/api/products?myProducts=true"),
        ]);

        let salesSum = 0;
        let commissionSum = 0;
        let productCount = 0;
        const ordersList = [];

        // Build 7-day default trailing date map
        const dailyTrend: Record<string, number> = {};
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const label = date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
          dailyTrend[label] = 0;
        }

        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          const list = ordersData.orders || [];
          ordersList.push(...list);

          list.forEach((order: any) => {
            if (order.deliveryStatus !== "cancelled") {
              salesSum += order.subTotal;
              commissionSum += order.commissionPaid;

              // Parse date to align with trailing day trend chart
              const orderLabel = new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
              });
              if (orderLabel in dailyTrend) {
                dailyTrend[orderLabel] += order.subTotal;
              }
            }
          });

          // Generate simulated recent payouts based on actual orders
          const completedPayouts = list
            .filter((o: any) => o.deliveryStatus === "delivered")
            .map((o: any) => ({
              id: `PAY-${o._id.slice(-7).toUpperCase()}`,
              date: new Date(o.updatedAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              }),
              amount: o.netPayout,
              status: "Completed",
            }));

          const processingPayouts = list
            .filter((o: any) => ["pending", "shipped"].includes(o.deliveryStatus))
            .map((o: any) => ({
              id: `PAY-${o._id.slice(-7).toUpperCase()}`,
              date: "Pending Delivery",
              amount: o.netPayout,
              status: "Processing",
            }));

          setRecentPayouts([...processingPayouts, ...completedPayouts].slice(0, 5));
        }

        if (productsRes.ok) {
          const productsData = await productsRes.json();
          productCount = productsData.products?.length || 0;
        }

        setMetrics({
          totalSales: salesSum,
          totalProducts: productCount,
          payoutRate: "90%",
          commissionPaid: commissionSum,
          netBalance: salesSum - commissionSum,
        });

        const trendPoints = Object.entries(dailyTrend).map(([label, value]) => ({
          label,
          value,
        }));
        setSalesTrend(trendPoints);
      } catch (err) {
        toast("Failed to update dashboard statistics", "error");
      } finally {
        setLoading(false);
      }
    };

    void fetchDashboardData();
  }, [toast]);

  if (loading) {
    return (
      <div className="py-20 flex justify-center items-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-650" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">Dashboard</h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Monitor your seller account metrics, commissions, and product sales overview in real-time.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Card 1: Total Sales */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-500">Total Sales</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-50 text-emerald-600">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-slate-800">₹{metrics.totalSales.toLocaleString("en-IN")}</span>
            <p className="mt-1 text-xs text-slate-400 font-semibold uppercase tracking-wider">Gross revenue</p>
          </div>
        </div>

        {/* Card 2: Total Products */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-500">Active Products</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-500/30 bg-indigo-50 text-indigo-600">
              <ShoppingBag className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-slate-800">{metrics.totalProducts}</span>
            <p className="mt-1 text-xs text-slate-400 font-semibold uppercase tracking-wider">Listed catalog size</p>
          </div>
        </div>

        {/* Card 3: Commission Paid */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-500">Commission Paid (10%)</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-50 text-amber-600">
              <Percent className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-slate-800">₹{metrics.commissionPaid.toLocaleString("en-IN")}</span>
            <p className="mt-1 text-xs text-slate-400 font-semibold uppercase tracking-wider">KTStore platform fee</p>
          </div>
        </div>

        {/* Card 4: Net Balance */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-500">Net Balance</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-sky-500/30 bg-sky-50 text-sky-600">
              <Landmark className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-slate-800">₹{metrics.netBalance.toLocaleString("en-IN")}</span>
            <p className="mt-1 text-xs text-slate-400 font-semibold uppercase tracking-wider">Settled to your bank ({metrics.payoutRate})</p>
          </div>
        </div>
      </div>

      {/* Trailing Revenue Chart */}
      <div className="w-full bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <DashboardChart title="Sales Revenue Trailing 7 Days" data={salesTrend} />
      </div>

      {/* Payout Table & Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Payout Schedule</h2>
          {recentPayouts.length === 0 ? (
            <p className="text-sm text-slate-400 italic py-6 text-center">No settlements processed yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="text-xs text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="pb-3 font-semibold">Cycle Date</th>
                    <th className="pb-3 font-semibold">Ref ID</th>
                    <th className="pb-3 font-semibold">Amount</th>
                    <th className="pb-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentPayouts.map((pay, idx) => (
                    <tr key={idx}>
                      <td className="py-3.5 font-medium text-slate-700">{pay.date}</td>
                      <td className="py-3.5 font-mono text-xs text-slate-500">{pay.id}</td>
                      <td className="py-3.5 text-slate-800 font-semibold">₹{pay.amount.toLocaleString("en-IN")}</td>
                      <td className="py-3.5">
                        {pay.status === "Completed" ? (
                          <span className="rounded-full bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                            Completed
                          </span>
                        ) : (
                          <span className="rounded-full bg-amber-50 border border-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700 animate-pulse">
                            Processing
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Seller Quick Actions</h2>
          <div className="space-y-3">
            <a
              href="/seller/products"
              className="block w-full text-center rounded-xl bg-indigo-600 hover:bg-indigo-500 py-3 text-sm font-semibold text-white transition active:scale-95 shadow-md shadow-indigo-600/10"
            >
              Add New Product Listing
            </a>
            <a
              href="/seller/orders"
              className="block w-full text-center rounded-xl bg-slate-100 hover:bg-slate-200 py-3 text-sm font-semibold text-slate-800 transition active:scale-95"
            >
              View Order Shipments
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
