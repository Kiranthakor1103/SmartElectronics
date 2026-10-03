import { Order } from "../models/Order";
import { SubOrder } from "../models/SubOrder";
import { BaseRepository } from "./baseRepository";

export class OrderRepository extends BaseRepository<any> {
  constructor() {
    super(Order);
  }

  async findByUserId(userId: string): Promise<any[]> {
    return Order.find({ userId }).sort({ createdAt: -1 }).populate("items.productId").exec();
  }

  async findByStripeSessionId(sessionId: string): Promise<any | null> {
    return Order.findOne({ stripeSessionId: sessionId }).exec();
  }

  async updateOrderStatus(orderId: string, status: "pending" | "paid" | "failed" | "refunded"): Promise<any | null> {
    return Order.findByIdAndUpdate(orderId, { status }, { new: true }).exec();
  }

  async createSubOrders(subOrdersData: any[]): Promise<any[]> {
    return SubOrder.insertMany(subOrdersData);
  }

  async findSubOrdersBySellerId(sellerId: string): Promise<any[]> {
    return SubOrder.find({ sellerId }).sort({ createdAt: -1 }).populate("parentOrderId").exec();
  }

  async updateSubOrderStatus(subOrderId: string, status: string): Promise<any | null> {
    return SubOrder.findByIdAndUpdate(subOrderId, { status }, { new: true }).exec();
  }
}

export const orderRepository = new OrderRepository();
