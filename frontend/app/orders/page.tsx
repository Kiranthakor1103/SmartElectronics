'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getOrderHistory, type LocalOrder } from '@/app/hooks/useOrderHistory';
import { Loader } from '@/app/components/ui/Loader';
import { ButtonLink } from '@/app/components/ui/Button';
import {
  Package,
  Truck,
  CheckCircle2,
  FileText,
  ChevronRight,
  ShoppingBag,
  MapPin,
  Calendar,
  CreditCard,
  Check,
  RotateCw,
  Sparkles,
  ShieldCheck,
  Clock,
} from 'lucide-react';

export default function OrdersPage() {
  const [orders, setOrders] = useState<LocalOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');
  const isSyncingRef = useRef(false);

  const syncOrders = useCallback(async (showIndicator = false) => {
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    if (showIndicator) setIsSyncing(true);

    try {
      // 1. Load local orders from localStorage
      const localOrders = getOrderHistory();
      const combined: LocalOrder[] = Array.isArray(localOrders) ? [...localOrders] : [];

      // 2. Gather identifiers: sessionIds and user email
      const sessionIds = combined.map((o) => o.sessionId).filter(Boolean);

      let userEmail = '';
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            userEmail = JSON.parse(storedUser)?.email || '';
          } catch {}
        }
      }
      if (!userEmail && combined.length > 0) {
        userEmail = combined[0].userEmail || combined[0].customerEmail || '';
      }

      // 3. Query Express backend for LIVE status in MongoDB
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') || localStorage.getItem('authToken') : null;
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const queryParams = new URLSearchParams();
      if (sessionIds.length > 0) {
        queryParams.set('sessionIds', sessionIds.join(','));
      }
      if (userEmail) {
        queryParams.set('email', userEmail);
      }

      const res = await fetch(`/api/orders?${queryParams.toString()}`, {
        headers,
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        const remoteList = data.orders || data.data || [];

        if (Array.isArray(remoteList) && remoteList.length > 0) {
          // Merge LIVE status from MongoDB into each order
          remoteList.forEach((remoteOrder: any) => {
            const sId = remoteOrder.sessionId || remoteOrder.stripeSessionId || remoteOrder._id;
            const idx = combined.findIndex(
              (o) =>
                o.sessionId === sId ||
                (remoteOrder.orderNumber && o.orderNumber === remoteOrder.orderNumber) ||
                (remoteOrder._id && o.sessionId === remoteOrder._id)
            );

            const isRemoteDelivered = remoteOrder.status === 'delivered';
            const updatedOrder: LocalOrder = {
              sessionId: sId,
              orderNumber: remoteOrder.orderNumber,
              amount: remoteOrder.amount || remoteOrder.total || 0,
              itemCount: remoteOrder.itemCount || (remoteOrder.items ? remoteOrder.items.length : 1),
              date:
                remoteOrder.date ||
                (remoteOrder.createdAt ? new Date(remoteOrder.createdAt).toLocaleDateString('en-IN') : 'Recent'),
              status: remoteOrder.status || 'placed',
              paymentStatus:
                remoteOrder.paymentStatus ||
                (isRemoteDelivered || remoteOrder.status === 'paid' ? 'paid' : 'pending'),
              paymentMethod: remoteOrder.paymentMethod || 'Stripe Card',
              items:
                remoteOrder.items && remoteOrder.items.length > 0
                  ? remoteOrder.items
                  : idx !== -1
                  ? combined[idx].items
                  : [],
              shippingAddress:
                remoteOrder.shippingAddress || (idx !== -1 ? combined[idx].shippingAddress : undefined),
              customerEmail: remoteOrder.customer?.email || userEmail,
              userEmail: remoteOrder.userEmail || userEmail,
            };

            // Keep deliveredAt if available
            (updatedOrder as any).deliveredAt = remoteOrder.deliveredAt;

            if (idx !== -1) {
              // Live update the existing local order with newest status from MongoDB!
              combined[idx] = {
                ...combined[idx],
                ...updatedOrder,
                status: remoteOrder.status, // Ensure live status wins!
              };
            } else {
              combined.unshift(updatedOrder);
            }
          });

          // Save updated live statuses back to localStorage
          try {
            localStorage.setItem('kt_order_history', JSON.stringify(combined));
          } catch {}
        }
      }

      setOrders(combined);
      setLastSyncTime(
        new Date().toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    } catch (err) {
      console.error('Failed to sync live orders:', err);
    } finally {
      isSyncingRef.current = false;
      setLoading(false);
      if (showIndicator) setIsSyncing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    void syncOrders(false);
  }, [syncOrders]);

  // LIVE Auto-Polling: poll every 10 seconds for real-time status updates from Admin
  useEffect(() => {
    const interval = setInterval(() => {
      void syncOrders(false);
    }, 10000);

    // Also sync whenever the user tabs back to the window
    const onFocus = () => {
      void syncOrders(true);
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void syncOrders(true);
      }
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [syncOrders]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-slate-50">
        <Loader
          size="lg"
          label="Loading live order tracker…"
          sublabel="Syncing with SmartElectronics fulfillment database"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/70 py-8 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Page Header */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 mb-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  My Orders
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time tracking of order fulfillment, dispatch &amp; doorstep delivery
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Live Refresh Button */}
            <button
              type="button"
              onClick={() => void syncOrders(true)}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50/80 border border-slate-200 hover:border-indigo-200 transition cursor-pointer disabled:opacity-60"
              title="Check live order status now"
            >
              <RotateCw className={`w-3.5 h-3.5 text-indigo-600 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing…' : 'Refresh Status'}</span>
              {lastSyncTime && (
                <span className="text-[10px] font-normal text-slate-400 hidden md:inline">
                  ({lastSyncTime})
                </span>
              )}
            </button>

            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs px-5 py-2 rounded-xl shadow-xs transition"
            >
              <ShoppingBag className="w-4 h-4" />
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400 mb-4">
              <Package className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No Orders Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
              You haven&apos;t placed any orders yet. Explore our products and order your favorite items!
            </p>
            <ButtonLink href="/products" variant="primary">
              Explore Store
            </ButtonLink>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => {
              const displayTxId =
                order.orderNumber ||
                (order.sessionId.length > 24
                  ? `${order.sessionId.substring(0, 14)}...${order.sessionId.slice(-8)}`
                  : order.sessionId);

              const isCod =
                order.paymentMethod?.toLowerCase().includes('cod') ||
                order.paymentMethod?.toLowerCase().includes('cash');

              // Status step indexing
              const statusKey = (order.status || 'placed').toLowerCase();
              const isDelivered = statusKey === 'delivered';
              const isPaid =
                isDelivered ||
                statusKey === 'paid' ||
                (order.paymentStatus as string) === 'paid';

              const steps = [
                { key: 'placed', label: 'Placed' },
                { key: 'confirmed', label: 'Confirmed' },
                { key: 'shipped', label: 'Shipped' },
                { key: 'out_for_delivery', label: 'Out for Delivery' },
                { key: 'delivered', label: 'Delivered' },
              ];

              const currentStepIdx =
                statusKey === 'delivered'
                  ? 4
                  : statusKey === 'out_for_delivery'
                  ? 3
                  : statusKey === 'shipped'
                  ? 2
                  : statusKey === 'processing' || statusKey === 'confirmed' || statusKey === 'paid'
                  ? 1
                  : 0;

              const itemsList = order.items && order.items.length > 0 ? order.items : [];

              return (
                <div
                  key={order.sessionId}
                  className={`bg-white rounded-2xl border overflow-hidden shadow-xs hover:shadow-md transition-all ${
                    isDelivered ? 'border-emerald-200 ring-2 ring-emerald-500/10' : 'border-slate-200/80'
                  }`}
                >
                  {/* Order Top Bar */}
                  <div
                    className={`p-4 sm:px-6 flex flex-wrap items-center justify-between gap-3 text-xs border-b ${
                      isDelivered
                        ? 'bg-emerald-50/50 border-emerald-100'
                        : 'bg-slate-50 border-slate-100'
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-4">
                      <div>
                        <span className="text-slate-400 uppercase font-bold text-[10px] block">Order Placed</span>
                        <span className="font-semibold text-slate-700">{order.date}</span>
                      </div>

                      <div className="hidden sm:block border-l border-slate-200 h-6" />

                      <div>
                        <span className="text-slate-400 uppercase font-bold text-[10px] block">Total Amount</span>
                        <span className="font-black text-slate-900 text-sm">
                          ₹{Number(order.amount).toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div className="hidden sm:block border-l border-slate-200 h-6" />

                      <div>
                        <span className="text-slate-400 uppercase font-bold text-[10px] block">Payment Method</span>
                        <span className="font-semibold text-slate-700 flex items-center gap-1">
                          <CreditCard className="w-3 h-3 text-slate-400" />
                          {isCod ? 'Cash on Delivery (COD)' : order.paymentMethod || 'Stripe Card'}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-2">
                      {isDelivered ? (
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-xs animate-in fade-in duration-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          DELIVERED
                          {(order as any).deliveredAt && (
                            <span className="text-[10px] font-bold text-emerald-700/80 ml-1">
                              ({new Date((order as any).deliveredAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                              })})
                            </span>
                          )}
                        </span>
                      ) : statusKey === 'out_for_delivery' ? (
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-purple-100 text-purple-800 border border-purple-300 shadow-xs">
                          <Truck className="w-4 h-4 text-purple-600 shrink-0 animate-bounce" />
                          OUT FOR DELIVERY
                        </span>
                      ) : statusKey === 'shipped' ? (
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-sky-100 text-sky-800 border border-sky-300 shadow-xs">
                          <Truck className="w-4 h-4 text-sky-600 shrink-0" />
                          SHIPPED (IN TRANSIT)
                        </span>
                      ) : statusKey === 'cancelled' ? (
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-rose-100 text-rose-800 border border-rose-300 shadow-xs">
                          CANCELLED
                        </span>
                      ) : isPaid ? (
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-blue-100 text-blue-800 border border-blue-300 shadow-xs">
                          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                          CONFIRMED (PAID)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-300 shadow-xs">
                          <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          ORDER PLACED (COD)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 5-Step Order Progress Tracker */}
                  <div className="p-4 sm:px-8 border-b border-slate-100 bg-white">
                    <div className="relative flex items-center justify-between max-w-2xl mx-auto py-3">
                      {/* Connecting Line Container */}
                      <div className="absolute left-6 right-6 top-6 h-1 -translate-y-1/2 bg-slate-100 rounded-full overflow-hidden">
                        {/* Dynamic Active Fill Line */}
                        <div
                          className={`h-full transition-all duration-700 ease-out rounded-full ${
                            isDelivered
                              ? 'bg-emerald-600'
                              : 'bg-gradient-to-r from-blue-600 to-indigo-600'
                          }`}
                          style={{
                            width: `${(currentStepIdx / (steps.length - 1)) * 100}%`,
                          }}
                        />
                      </div>

                      {steps.map((step, idx) => {
                        const isCompleted = idx <= currentStepIdx;
                        const isCurrent = idx === currentStepIdx;
                        const isThisDelivered = isDelivered && idx === 4;

                        return (
                          <div key={step.key} className="relative z-10 flex flex-col items-center">
                            <div
                              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                                isThisDelivered
                                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30 ring-4 ring-emerald-100 scale-110'
                                  : isCompleted
                                  ? 'bg-indigo-600 text-white shadow-xs ring-4 ring-indigo-50'
                                  : 'bg-white border-2 border-slate-300 text-slate-400'
                              } ${isCurrent && !isThisDelivered ? 'ring-4 ring-indigo-200 animate-pulse' : ''}`}
                            >
                              {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : idx + 1}
                            </div>
                            <span
                              className={`mt-2 text-[10px] sm:text-xs font-black text-center capitalize tracking-tight ${
                                isThisDelivered
                                  ? 'text-emerald-700 font-extrabold'
                                  : isCompleted
                                  ? 'text-slate-900 font-bold'
                                  : 'text-slate-400 font-medium'
                              }`}
                            >
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Explainer Box */}
                  <div className="px-4 sm:px-6 pt-4">
                    {isDelivered ? (
                      <div className="bg-emerald-50/90 border border-emerald-200 p-3.5 rounded-2xl text-xs text-emerald-900 flex items-center justify-between gap-3 shadow-xs animate-in fade-in duration-300">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                            <CheckCircle2 className="w-4.5 h-4.5" />
                          </div>
                          <div>
                            <span className="font-extrabold text-sm block text-emerald-950">
                              Package Delivered Successfully!
                            </span>
                            <span className="text-[11px] text-emerald-800">
                              Your order has been completed and handed over at your delivery address. Thank you for choosing SmartElectronics!
                            </span>
                          </div>
                        </div>
                        <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-200/70 text-emerald-900 font-black text-[10px] uppercase tracking-wider shrink-0">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                          Verified
                        </span>
                      </div>
                    ) : isCod ? (
                      isPaid ? (
                        <div className="bg-emerald-50 border border-emerald-200/80 p-3 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>
                            <strong>Payment Received:</strong> ₹{Number(order.amount).toLocaleString('en-IN')} collected via Cash on Delivery upon doorstep delivery.
                          </span>
                        </div>
                      ) : (
                        <div className="bg-amber-50 border border-amber-200/80 p-3 rounded-xl text-xs text-amber-900 flex items-center gap-2">
                          <Truck className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>
                            <strong>Cash on Delivery (COD):</strong> Please keep ₹{Number(order.amount).toLocaleString('en-IN')} ready in cash or scan the delivery agent&apos;s UPI QR code upon arrival.
                          </span>
                        </div>
                      )
                    ) : (
                      <div className="bg-blue-50 border border-blue-200/80 p-3 rounded-xl text-xs text-blue-900 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>
                          <strong>Prepaid Order:</strong> 100% payment verified online via Stripe gateway. 100% contact-free doorstep delivery.
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Order Details Body */}
                  <div className="p-4 sm:p-6 space-y-4">
                    {/* Items List */}
                    {itemsList.length > 0 ? (
                      <div className="space-y-3">
                        {itemsList.map((item: any, idx: number) => {
                          const thumb = item.thumbnail || item.images?.[0] || '/placeholder.svg';
                          const itemPrice = Number(item.price || 0);
                          const itemQty = Number(item.quantity || 1);

                          return (
                            <div
                              key={idx}
                              className="flex gap-4 items-center pb-3 border-b border-slate-100 last:border-0 last:pb-0"
                            >
                              <div className="relative w-16 h-16 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shrink-0">
                                <Image
                                  src={thumb}
                                  alt={item.title || 'Product'}
                                  fill
                                  className="object-contain p-1.5"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-slate-800 truncate">
                                  {item.title || 'SmartElectronics Product'}
                                </h4>
                                <p className="text-xs text-slate-400 mt-0.5">Quantity: {itemQty}</p>
                                <p className="text-xs font-extrabold text-slate-900 mt-1">
                                  ₹{itemPrice.toLocaleString('en-IN')}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 py-2">
                        <Package className="w-5 h-5 text-slate-400" />
                        <span className="text-xs font-medium text-slate-600">
                          {order.itemCount} Item{order.itemCount > 1 ? 's' : ''} in Order (#{displayTxId})
                        </span>
                      </div>
                    )}

                    {/* Delivery Address Preview */}
                    {order.shippingAddress && (
                      <div className="bg-slate-50/70 border border-slate-100 p-3 rounded-xl text-xs text-slate-600 flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-slate-800">Delivery Address: </span>
                          <span>
                            {order.shippingAddress.fullName} ({order.shippingAddress.phone}) —{' '}
                            {order.shippingAddress.address || order.shippingAddress.street},{' '}
                            {order.shippingAddress.city}, {order.shippingAddress.state} -{' '}
                            {order.shippingAddress.pincode || order.shippingAddress.postalCode}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Order Footer Actions */}
                  <div className="bg-slate-50/50 border-t border-slate-100 p-3 px-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-[11px] font-mono text-slate-400 truncate">
                      REF: {displayTxId}
                    </div>

                    <div className="flex items-center gap-3">
                      <Link
                        href={`/success?session_id=${encodeURIComponent(order.sessionId)}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-xl transition"
                      >
                        <FileText className="w-4 h-4" />
                        View Receipt &amp; PDF
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
