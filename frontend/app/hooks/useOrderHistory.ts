"use client";

import { getStorageItem, setStorageItem, STORAGE_KEYS } from "@/app/lib/storage";

export interface LocalOrder {
  sessionId: string;
  orderNumber?: string;
  amount: number;
  itemCount: number;
  date: string;
  status:
    | "placed"
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "out_for_delivery"
    | "delivered"
    | "cancelled"
    | "paid"
    | "failed"
    | "refunded"
    | (string & {});
  paymentStatus?: "pending" | "paid" | "failed" | "refunded" | (string & {});
  paymentMethod?: string;
  items?: any[];
  shippingAddress?: any;
  userEmail?: string;
  userId?: string;
  customerEmail?: string;
}


function getCurrentUser(): { id?: string; email?: string } | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("user");
  if (!stored || stored === "undefined" || stored === "null") return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function saveOrderToHistory(order: LocalOrder) {
  if (!order || !order.sessionId) return;

  const currentUser = getCurrentUser();
  const userEmail = currentUser?.email || order.customerEmail || order.userEmail;
  const userId = currentUser?.id || order.userId;

  const orderToSave: LocalOrder = {
    ...order,
    userEmail: userEmail?.toLowerCase(),
    userId,
    customerEmail: userEmail?.toLowerCase(),
  };

  const existing = getStorageItem<LocalOrder[]>(STORAGE_KEYS.orderHistory, []);
  const filtered = existing.filter((o) => o.sessionId !== orderToSave.sessionId);
  setStorageItem(STORAGE_KEYS.orderHistory, [orderToSave, ...filtered].slice(0, 50));

  // Sync to Express backend API asynchronously
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") || localStorage.getItem("authToken") : null;
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    fetch("/api/orders", {
      method: "POST",
      headers,
      body: JSON.stringify(orderToSave),
    }).catch(() => {});
  } catch {}
}

export function getOrderHistory(): LocalOrder[] {
  const allOrders = getStorageItem<LocalOrder[]>(STORAGE_KEYS.orderHistory, []);
  const currentUser = getCurrentUser();

  if (currentUser?.email) {
    const userEmail = currentUser.email.toLowerCase();
    const userId = currentUser.id;
    return allOrders.filter(
      (order) =>
        (order.userEmail && order.userEmail.toLowerCase() === userEmail) ||
        (order.customerEmail && order.customerEmail.toLowerCase() === userEmail) ||
        (userId && order.userId === userId)
    );
  }

  // Guest users: return orders without user context
  return allOrders.filter((order) => !order.userEmail && !order.userId);
}
