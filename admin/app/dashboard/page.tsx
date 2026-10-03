'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import { ApiClient } from '../lib/apiClient';
import { useToast } from '../components/ToastProvider';
import { StatCard, Badge, Loader } from '../components/ui';
import {
  Users,
  Package,
  ShoppingBag,
  IndianRupee,
  Store,
  TrendingUp,
  Clock,
  ArrowRight,
  ShieldCheck,
  PlusCircle,
  FileCheck,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [metrics, setMetrics] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [metricsRes, ordersRes] = await Promise.all([
          ApiClient.get('/admin/metrics'),
          ApiClient.get('/admin/orders'),
        ]);

        if (metricsRes.success) {
          setMetrics(metricsRes.data);
        } else {
          toast(metricsRes.message || 'Failed to load metrics', 'error');
          if (metricsRes.message?.includes('authorized') || metricsRes.message?.includes('expired')) {
            router.push('/login');
          }
        }

        if (ordersRes.success) {
          setRecentOrders(ordersRes.data.slice(0, 5));
        }
      } catch (err) {
        toast('Connection error loading metrics', 'error');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router, toast]);

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-900">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader title="Executive Overview" subtitle="Real-time performance metrics and catalog status" />

        <main className="p-4 sm:p-6 space-y-6 flex-1">
          
          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              title="Total Revenue"
              value={`₹${metrics?.totalRevenue?.toLocaleString() || '0'}`}
              icon={<IndianRupee className="w-6 h-6" />}
              accentColor="emerald"
              subtitle="Calculated from completed sales"
            />
            <StatCard
              title="Total Orders"
              value={metrics?.totalOrders || 0}
              icon={<ShoppingBag className="w-6 h-6" />}
              accentColor="indigo"
              subtitle="Store customer purchases"
            />
            <StatCard
              title="Active Products"
              value={metrics?.totalProducts || 0}
              icon={<Package className="w-6 h-6" />}
              accentColor="violet"
              subtitle="Live in catalog"
            />
            <StatCard
              title="Registered Users"
              value={metrics?.totalUsers || 0}
              icon={<Users className="w-6 h-6" />}
              accentColor="amber"
              subtitle="Customer & merchant accounts"
            />
          </div>

          {/* Action Callouts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Quick Actions Panel */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Quick Actions</h3>
              <div className="space-y-2.5">
                <Link
                  href="/products/new"
                  className="flex items-center justify-between p-3.5 rounded-xl bg-indigo-50/80 border border-indigo-100 text-indigo-700 hover:bg-indigo-100 transition text-xs font-bold shadow-2xs"
                >
                  <div className="flex items-center gap-2.5">
                    <PlusCircle className="w-4 h-4 text-indigo-600" />
                    <span>Add New Product to Store</span>
                  </div>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/sellers"
                  className="flex items-center justify-between p-3.5 rounded-xl bg-amber-50/80 border border-amber-100 text-amber-800 hover:bg-amber-100 transition text-xs font-bold shadow-2xs"
                >
                  <div className="flex items-center gap-2.5">
                    <Store className="w-4 h-4 text-amber-600" />
                    <span>Review Seller Merchant KYC</span>
                  </div>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/orders"
                  className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-100 text-emerald-800 hover:bg-emerald-100 transition text-xs font-bold shadow-2xs"
                >
                  <div className="flex items-center gap-2.5">
                    <ShoppingBag className="w-4 h-4 text-emerald-600" />
                    <span>View &amp; Update Order Fulfillment</span>
                  </div>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/users"
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-700 hover:bg-slate-100 transition text-xs font-bold shadow-2xs"
                >
                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4 text-slate-600" />
                    <span>Manage User Accounts &amp; Roles</span>
                  </div>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Recent Orders Overview */}
            <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Recent Customer Orders</h3>
                <Link href="/orders" className="text-xs font-bold text-indigo-600 hover:underline">View All Orders →</Link>
              </div>

              {loading ? (
                <Loader size="md" label="Loading recent transactions..." sublabel="Connecting to live order stream" />
              ) : recentOrders.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">No recent orders recorded yet.</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {recentOrders.map((order) => (
                    <div key={order._id} className="py-3 flex items-center justify-between text-xs hover:bg-slate-50/50 px-2 rounded-xl transition">
                      <div>
                        <p className="font-bold text-slate-900">Order #{order._id?.slice(-6)?.toUpperCase()}</p>
                        <p className="text-slate-500 text-[11px]">{order.userId?.email || 'Guest Customer'}</p>
                      </div>
                      <div className="text-right flex items-center gap-3">
                        <p className="font-black text-slate-900">₹{order.amount?.toLocaleString()}</p>
                        <Badge
                          variant={
                            order.status === 'delivered' || order.status === 'paid'
                              ? 'success'
                              : order.status === 'shipped' || order.status === 'processing'
                              ? 'indigo'
                              : order.status === 'cancelled' || order.status === 'failed'
                              ? 'danger'
                              : 'warning'
                          }
                          size="sm"
                          dot
                        >
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </main>
      </div>
    </div>
  );
}
