import { Response } from "express";
import { orderService } from "../services/orderService";
import { ApiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthenticatedRequest } from "../middleware/auth";
import { AppError } from "../utils/appError";
import { Order } from "../models/Order";
import mongoose from "mongoose";

export const getMyOrders = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const userEmail = (req.user as any)?.email || (req.query.email as string);
  const sessionIdsParam = (req.query.sessionIds as string) || "";
  const sessionIds = sessionIdsParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const queryConditions: any[] = [];

  if (userId) {
    queryConditions.push({ userId });
  }

  if (userEmail) {
    const emailRegex = new RegExp(`^${userEmail.trim()}$`, "i");
    queryConditions.push({ "customer.email": emailRegex });
    queryConditions.push({ userEmail: emailRegex });
    queryConditions.push({ "shippingAddress.email": emailRegex });
  }

  if (sessionIds.length > 0) {
    queryConditions.push({ stripeSessionId: { $in: sessionIds } });
    queryConditions.push({ orderNumber: { $in: sessionIds } });

    const validObjectIds = sessionIds.filter((s) => mongoose.Types.ObjectId.isValid(s));
    if (validObjectIds.length > 0) {
      queryConditions.push({ _id: { $in: validObjectIds.map((id) => new mongoose.Types.ObjectId(id)) } });
    }
  }

  // If no filters provided at all, return empty list gracefully
  if (queryConditions.length === 0) {
    return res.status(200).json({
      success: true,
      orders: [],
      data: [],
    });
  }

  const rawOrders = await Order.find({ $or: queryConditions })
    .sort({ createdAt: -1 })
    .populate("items.productId", "title thumbnail price")
    .lean()
    .exec();

  const formattedOrders = rawOrders.map((order: any) => ({
    _id: order._id,
    orderNumber: order.orderNumber || `OD-${order._id?.toString().slice(-8).toUpperCase()}`,
    sessionId: order.stripeSessionId || order._id?.toString(),
    status: order.status || "placed",
    paymentStatus: order.paymentStatus || (order.status === "paid" || order.status === "delivered" ? "paid" : "pending"),
    paymentMethod: order.paymentMethod || "cod",
    amount: order.amount,
    itemCount: order.itemCount || (order.items?.length) || 1,
    items: order.items || [],
    shippingAddress: order.shippingAddress,
    customer: order.customer,
    createdAt: order.createdAt,
    paidAt: order.paidAt,
    deliveredAt: order.deliveredAt,
    date: new Date(order.createdAt).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
  }));

  return res.status(200).json({
    success: true,
    orders: formattedOrders,
    data: formattedOrders,
  });
});

export const getOrderBySessionId = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { sessionId } = req.params;
  if (!sessionId) {
    throw new AppError("Session ID is required", 400);
  }

  let order: any = null;
  if (sessionId.startsWith("cs_") || sessionId.startsWith("OD-")) {
    order = await Order.findOne({
      $or: [{ stripeSessionId: sessionId }, { orderNumber: sessionId }],
    })
      .populate("items.productId", "title thumbnail price")
      .exec();
  } else if (mongoose.Types.ObjectId.isValid(sessionId)) {
    order = await Order.findById(sessionId)
      .populate("items.productId", "title thumbnail price")
      .exec();
  }

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  // IDOR Protection: If order belongs to a registered user and requester is logged in, verify ownership
  if (
    req.user &&
    req.user.role !== "admin" &&
    order.userId &&
    order.userId.toString() !== req.user.id
  ) {
    throw new AppError("Forbidden: Unauthorized to access this order", 403);
  }

  return ApiResponse.success(res, "Order retrieved successfully", {
    _id: order._id,
    orderNumber: order.orderNumber || `OD-${order._id?.toString().slice(-8).toUpperCase()}`,
    sessionId: order.stripeSessionId || order._id?.toString(),
    status: order.status,
    paymentStatus: order.paymentStatus || (order.status === "paid" || order.status === "delivered" ? "paid" : "pending"),
    paymentMethod: order.paymentMethod || "cod",
    amount: order.amount,
    itemCount: order.itemCount,
    discount: order.discount,
    shipping: order.shipping,
    couponCode: order.couponCode,
    customer: order.customer,
    shippingAddress: order.shippingAddress,
    items: order.items || [],
    paidAt: order.paidAt,
    deliveredAt: order.deliveredAt,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  });
});

export const createOrder = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const sessionId = req.body.sessionId || `cs_${req.body.paymentMethod === "cod" ? "cod" : "ord"}_${Date.now()}`;

  const order = await orderService.createOrder({
    ...req.body,
    sessionId,
    userId: req.user?.id || req.body.userId,
  });

  return res.status(201).json({
    success: true,
    message: "Order placed successfully",
    order,
    data: order,
  });
});

export const cancelCustomerOrder = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body;
  const userId = req.user?.id || "";
  const role = req.user?.role;

  const order = await orderService.cancelOrder(id, userId, role, reason);
  return ApiResponse.success(res, "Order cancelled and inventory restored successfully", order, 200);
});

