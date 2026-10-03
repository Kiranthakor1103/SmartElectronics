"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { Package, Truck, CheckCircle, XCircle, User, MapPin, BadgePercent, Landmark } from "lucide-react";
import { useToast } from "@/app/components/ToastProvider";
import { Loader, TableSkeleton } from "@/app/components/ui/Loader";

interface OrderItem {
  _id: string;
  productId: {
    _id: string;
    title: string;
    image: string;
    price: number;
    brand?: string;
  };
  quantity: number;
  price: number;
}

interface SubOrder {
  _id: string;
  orderId: {
    _id: string;
    createdAt: string;
    status: string;
    stripeSessionId: string;
    userId?: {
      name: string;
      email: string;
    };
  };
  items: OrderItem[];
  subTotal: number;
  commissionPaid: number;
  netPayout: number;
  deliveryStatus: "pending" | "shipped" | "delivered" | "cancelled";
  payoutStatus: "pending" | "paid";
  shippingAddress?: {
    line1?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
}

export default function SellerOrdersPage() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<SubOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/seller/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch {
      toast("Failed to load merchant orders", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void fetchOrders();
  }, [fetchOrders]);

  const updateStatus = async (subOrderId: string, newStatus: SubOrder["deliveryStatus"]) => {
    try {
      const res = await fetch(`/api/seller/orders/${subOrderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        toast(`Fulfillment status updated to ${newStatus}`);
        setOrders((prev) =>
          prev.map((o) =>
            o._id === subOrderId ? { ...o, deliveryStatus: newStatus } : o
          )
        );
      } else {
        const data = await res.json();
        toast(data.message || "Failed to update status", "error");
      }
    } catch {
      toast("An error occurred updating fulfillment status", "error");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            <CheckCircle className="h-3.5 w-3.5" />
            Delivered
          </span>
        );
      case "shipped":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
            <Truck className="h-3.5 w-3.5" />
            Shipped / In Transit
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
            <XCircle className="h-3.5 w-3.5" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 animate-pulse">
            <Package className="h-3.5 w-3.5" />
            Pending Dispatch
          </span>
        );
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">Order Fulfillment</h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Track customer shipments, manage package dispatches, and review payout details.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Loader size="lg" label="Loading customer orders…" sublabel="Connecting to order fulfillment records" />
          <TableSkeleton rows={5} cols={5} />
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 border-dashed bg-white p-12 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-400 mb-4">
            <Package className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No orders yet</h3>
          <p className="mt-1.5 text-sm text-slate-500 max-w-sm mx-auto">
            Your products are active in the customer storefront. Incoming orders will show up here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const truncatedSessionId = order.orderId?.stripeSessionId
              ? `${order.orderId.stripeSessionId.slice(0, 16)}...`
              : order._id;

            const orderDate = order.orderId?.createdAt
              ? new Date(order.orderId.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "N/A";

            return (
              <div
                key={order._id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-slate-300 shadow-sm"
              >
                {/* Header card info */}
                <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                        Order Date
                      </span>
                      <span className="font-semibold text-slate-700">{orderDate}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                        Stripe Ref
                      </span>
                      <span className="font-mono text-xs text-indigo-600 font-medium">
                        {truncatedSessionId}
                      </span>
                    </div>
                  </div>
                  <div>{getStatusBadge(order.deliveryStatus)}</div>
                </div>

                <div className="grid grid-cols-1 divide-y divide-slate-100 lg:grid-cols-3 lg:divide-y-0 lg:divide-x">
                  {/* Left Column: Products List */}
                  <div className="p-6 lg:col-span-2 space-y-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-450 mb-2">
                      Products Ordered
                    </h3>
                    {order.items.map((item) => (
                      <div key={item._id} className="flex gap-4 items-center">
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center">
                          {item.productId?.image ? (
                            <Image
                              src={item.productId.image}
                              alt={item.productId.title || "Product"}
                              fill
                              className="object-contain p-1"
                              sizes="48px"
                            />
                          ) : (
                            <Package className="h-5 w-5 text-slate-400" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-bold text-slate-800 truncate">
                            {item.productId?.title || "Unknown Product"}
                          </h4>
                          <p className="text-xs text-slate-450">
                            ₹{item.price.toLocaleString("en-IN")} x {item.quantity} units
                          </p>
                        </div>
                      </div>
                    ))}

                    {/* Customer info */}
                    <div className="border-t border-slate-100 pt-4 mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {order.orderId?.userId && (
                        <div className="space-y-1">
                          <span className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                            <User className="h-3.5 w-3.5" /> Buyer Details
                          </span>
                          <p className="text-sm font-semibold text-slate-700">
                            {order.orderId.userId.name}
                          </p>
                          <p className="text-xs text-slate-450">
                            {order.orderId.userId.email}
                          </p>
                        </div>
                      )}

                      {order.shippingAddress && (
                        <div className="space-y-1">
                          <span className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                            <MapPin className="h-3.5 w-3.5" /> Shipping Address
                          </span>
                          <p className="text-xs leading-relaxed text-slate-600">
                            {order.shippingAddress.line1}, {order.shippingAddress.city},{" "}
                            {order.shippingAddress.state} - {order.shippingAddress.postal_code},{" "}
                            {order.shippingAddress.country}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Financials & Action Buttons */}
                  <div className="p-6 bg-slate-50/30 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-450 mb-4">
                        Financial Summary
                      </h3>
                      <div className="space-y-2.5 text-sm">
                        <div className="flex justify-between text-slate-500">
                          <span>Gross Sale</span>
                          <span className="font-semibold text-slate-700">
                            ₹{order.subTotal.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span className="flex items-center gap-1 text-xs">
                            <BadgePercent className="h-3.5 w-3.5" /> Commission (10%)
                          </span>
                          <span className="font-semibold text-rose-600">
                            -₹{order.commissionPaid.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <div className="flex justify-between border-t border-slate-100 pt-2 text-base font-bold text-slate-800">
                          <span className="flex items-center gap-1">
                            <Landmark className="h-4 w-4 text-emerald-600" /> Net Payout
                          </span>
                          <span className="text-emerald-600">
                            ₹{order.netPayout.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-8 pt-4 border-t border-slate-100">
                      {order.deliveryStatus === "pending" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateStatus(order._id, "shipped")}
                            className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white transition hover:bg-indigo-500 active:scale-95 shadow-md shadow-indigo-600/10"
                          >
                            Dispatch Order
                          </button>
                          <button
                            onClick={() => updateStatus(order._id, "cancelled")}
                            className="rounded-xl border border-slate-200 hover:border-rose-100 hover:text-rose-600 hover:bg-rose-50 bg-white px-3 py-2.5 text-xs font-bold text-slate-600 transition active:scale-95"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                      {order.deliveryStatus === "shipped" && (
                        <button
                          onClick={() => updateStatus(order._id, "delivered")}
                          className="w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-500 active:scale-95 shadow-md shadow-emerald-600/10"
                        >
                          Confirm Delivery
                        </button>
                      )}
                      {["delivered", "cancelled"].includes(order.deliveryStatus) && (
                        <p className="text-center text-xs font-medium text-slate-400 italic">
                          Fulfillment complete
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
