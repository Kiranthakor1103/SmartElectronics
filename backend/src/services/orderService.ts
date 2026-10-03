import mongoose from "mongoose";
import { orderRepository } from "../repositories/orderRepository";
import { Order } from "../models/Order";
import { Product } from "../models/Product";
import { Coupon } from "../models/Coupon";
import { AppError } from "../utils/appError";
import { decrementProductStock, incrementProductStock } from "../utils/stockManager";
import { runInTransaction } from "../utils/transactionRunner";

export class OrderService {
  async getUserOrders(userId: string) {
    return Order.find({ userId })
      .sort({ createdAt: -1 })
      .populate("items.productId", "title thumbnail price")
      .lean()
      .exec();
  }

  async getOrderById(orderId: string, userId: string, role?: string) {
    let order: any = null;
    if (orderId.startsWith("cs_") || orderId.startsWith("OD-")) {
      order = await Order.findOne({
        $or: [{ stripeSessionId: orderId }, { orderNumber: orderId }],
      })
        .populate("items.productId", "title thumbnail price")
        .exec();
    } else {
      order = await Order.findById(orderId)
        .populate("items.productId", "title thumbnail price")
        .exec();
    }

    if (!order) {
      throw new AppError("Order not found", 404);
    }
    if (role !== "admin" && order.userId?.toString() && order.userId?.toString() !== userId) {
      throw new AppError("Forbidden: Unauthorized to access this order", 403);
    }
    return order;
  }

  async getSellerSubOrders(sellerId: string) {
    return orderRepository.findSubOrdersBySellerId(sellerId);
  }

  async updateSubOrderStatus(subOrderId: string, status: string) {
    const subOrder = await orderRepository.updateSubOrderStatus(subOrderId, status);
    if (!subOrder) {
      throw new AppError("Sub-order not found", 404);
    }
    return subOrder;
  }

  async createOrder(data: any) {
    return runInTransaction(async (session) => {
      // Check if order with this session already exists
      const sessionId = data.sessionId || `cs_${data.paymentMethod === "cod" ? "cod" : "ord"}_${Date.now()}`;
      const existingQuery = Order.findOne({ stripeSessionId: sessionId });
      if (session) existingQuery.session(session);
      const existing = await existingQuery?.exec?.();
      if (existing) {
        return existing;
      }

      const paymentMethod = (data.paymentMethod || (data.payment_method === "cod" ? "cod" : "stripe")).toLowerCase();
      const isCod = paymentMethod === "cod";
      const paymentStatus = isCod ? "pending" : (data.paymentStatus || "paid");
      const orderStatus = data.status || (isCod ? "placed" : "confirmed");

      const orderNumber = `OD-KT-${Date.now().toString().slice(-6)}${Math.floor(100 + Math.random() * 900)}`;

      // Normalize items snapshot to ensure images, titles, and quantities are preserved
      const normalizedItems = Array.isArray(data.items)
        ? data.items.map((it: any) => ({
            productId: it.id || it.productId || null,
            title: it.title || it.productName || it.name || "Product Item",
            thumbnail: it.thumbnail || it.image || (it.images && it.images[0]) || "/placeholder.svg",
            quantity: Math.max(1, Number(it.quantity) || 1),
            price: Number(it.price) || 0,
            sellerId: it.sellerId || null,
          }))
        : [];

      const orderData: Record<string, any> = {
        orderNumber,
        stripeSessionId: sessionId,
        amount: Number(data.amount || data.total || 0),
        paymentMethod: isCod ? "cod" : paymentMethod.includes("card") ? "card" : paymentMethod.includes("upi") ? "upi" : "stripe",
        paymentStatus,
        status: orderStatus,
        itemCount: normalizedItems.length > 0 ? normalizedItems.reduce((acc: number, item: any) => acc + item.quantity, 0) : Number(data.itemCount || 1),
        discount: Number(data.discount || 0),
        shipping: Number(data.shipping || 0),
        couponCode: data.couponCode || "",
        customer: {
          name: data.customerName || data.customer?.name || data.shippingAddress?.fullName || "",
          email: data.customerEmail || data.customer?.email || "",
          phone: data.customerPhone || data.customer?.phone || data.shippingAddress?.phone || "",
        },
        shippingAddress: data.shippingAddress || {
          fullName: data.customerName || "",
          phone: data.customerPhone || "",
        },
        items: normalizedItems,
      };

      if (data.userId) {
        orderData.userId = data.userId;
      }

      if (paymentStatus === "paid") {
        orderData.paidAt = new Date();
      }

      // Pre-validate inventory: Ensure no item is out of stock or requested beyond available stock
      for (const it of normalizedItems) {
        let prodDoc: any = null;
        const pIdStr = String(it.productId || "").trim();
        if (mongoose.Types.ObjectId.isValid(pIdStr) && pIdStr.length === 24) {
          const q = Product.findById(pIdStr);
          if (session) q.session(session);
          prodDoc = await q.exec();
        } else if (!isNaN(Number(pIdStr))) {
          const q = Product.findOne({ id: Number(pIdStr) });
          if (session) q.session(session);
          prodDoc = await q.exec();
        } else if (it.title) {
          const q = Product.findOne({ title: it.title });
          if (session) q.session(session);
          prodDoc = await q.exec();
        }

        if (prodDoc) {
          const availableStock = typeof prodDoc.stock === "number" ? prodDoc.stock : 0;
          if (availableStock <= 0) {
            throw new AppError(
              `"${it.title || prodDoc.title}" is currently out of stock. Please remove it from your cart to proceed.`,
              400
            );
          }
          if (it.quantity > availableStock) {
            throw new AppError(
              `Only ${availableStock} unit(s) of "${it.title || prodDoc.title}" available in stock. Please adjust quantity.`,
              400
            );
          }
        }
      }

      let createdOrder: any;
      if (session) {
        const createdOrders = await Order.create([orderData], { session });
        createdOrder = createdOrders[0];
      } else {
        createdOrder = await Order.create(orderData);
      }

      // Decrement stock for purchased items safely in real time
      await decrementProductStock(normalizedItems);

      // Record coupon usage per user if a coupon code was applied
      if (orderData.couponCode) {
        const cleanCode = String(orderData.couponCode).trim().toUpperCase();
        const idents: string[] = [];
        if (orderData.userId) idents.push(String(orderData.userId).trim().toLowerCase());
        if (orderData.customer?.email) idents.push(String(orderData.customer.email).trim().toLowerCase());

        if (idents.length > 0) {
          const updateOpts = session ? { session } : undefined;
          await Coupon.updateOne(
            { code: cleanCode },
            {
              $push: { usedBy: { $each: idents } },
              $inc: { usageCount: 1 },
            },
            updateOpts
          ).catch(() => {});
        }
      }

      return createdOrder;
    });
  }

  /**
   * Cancels an order and automatically replenishes inventory stock.
   */
  async cancelOrder(orderId: string, userId: string, role?: string, reason?: string) {
    return runInTransaction(async (session) => {
      let order: any = null;
      if (orderId.startsWith("OD-") || orderId.startsWith("cs_")) {
        const query = Order.findOne({
          $or: [{ stripeSessionId: orderId }, { orderNumber: orderId }],
        });
        if (session) query.session(session);
        order = await query.exec();
      } else {
        const query = Order.findById(orderId);
        if (session) query.session(session);
        order = await query.exec();
      }

      if (!order) {
        throw new AppError("Order not found", 404);
      }

      if (role !== "admin" && order.userId && order.userId.toString() !== userId) {
        throw new AppError("Forbidden: Unauthorized to cancel this order", 403);
      }

      if (order.status === "cancelled") {
        throw new AppError("Order is already cancelled", 400);
      }

      if (order.status === "delivered") {
        throw new AppError("Delivered orders cannot be cancelled directly. Please initiate an RMA return.", 400);
      }

      order.status = "cancelled";
      order.cancelReason = reason || "Customer request";
      order.cancelledAt = new Date();
      await (session ? order.save({ session }) : order.save());

      // Automatically replenish product inventory stock
      if (Array.isArray(order.items) && order.items.length > 0) {
        await incrementProductStock(order.items);
      }

      return order;
    });
  }

  /**
   * Marks order as refunded and restores stock.
   */
  async refundOrder(orderId: string, adminId: string, reason?: string) {
    return runInTransaction(async (session) => {
      const query = Order.findById(orderId);
      if (session) query.session(session);
      const order = await query.exec();
      if (!order) {
        throw new AppError("Order not found", 404);
      }

      order.status = "refunded";
      order.paymentStatus = "refunded";
      order.refundedAt = new Date();
      order.refundReason = reason || `Refund processed by admin ${adminId}`;
      await (session ? order.save({ session }) : order.save());

      if (Array.isArray(order.items) && order.items.length > 0) {
        await incrementProductStock(order.items);
      }

      return order;
    });
  }
}

export const orderService = new OrderService();
