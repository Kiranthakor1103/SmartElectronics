import { orderService } from "../services/orderService";
import { Order } from "../models/Order";
import { Product } from "../models/Product";
import { Coupon } from "../models/Coupon";
import * as stockManagerModule from "../utils/stockManager";

// Helper to create thenable Mongoose Query mock
function createMockQuery(resolvedValue: any) {
  const queryObj: any = {
    session: jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(resolvedValue),
    then: (resolve: any, reject: any) => Promise.resolve(resolvedValue).then(resolve, reject),
  };
  return queryObj;
}

// Mock dependencies
jest.mock("../models/Order");
jest.mock("../models/Product");
jest.mock("../models/Coupon");
jest.mock("../repositories/orderRepository", () => ({
  orderRepository: {
    findSubOrdersBySellerId: jest.fn(),
    updateSubOrderStatus: jest.fn(),
  },
}));
jest.mock("../utils/stockManager", () => ({
  decrementProductStock: jest.fn().mockResolvedValue(undefined),
  incrementProductStock: jest.fn().mockResolvedValue(undefined),
}));

describe("OrderService - Lifecycle, Transactions & Inventory Coordination", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (Product.findOne as jest.Mock).mockReturnValue(createMockQuery({ title: "Smart TV", stock: 10 }));
    (Product.findById as jest.Mock).mockReturnValue(createMockQuery({ title: "Smart TV", stock: 10 }));
  });

  describe("createOrder", () => {
    it("should create order, normalize items, and decrement stock", async () => {
      (Order.findOne as jest.Mock).mockReturnValue(createMockQuery(null));

      const mockCreatedOrder = {
        _id: "order_123",
        orderNumber: "OD-KT-999999",
        amount: 24999,
        items: [{ id: 55, quantity: 1, title: "Smart TV", price: 24999 }],
      };

      (Order.create as jest.Mock).mockResolvedValue(mockCreatedOrder);

      const result = await orderService.createOrder({
        sessionId: "cs_test_session_123",
        amount: 24999,
        paymentMethod: "stripe",
        items: [{ id: 55, quantity: 1, title: "Smart TV", price: 24999 }],
        customerEmail: "shopper@test.com",
      });

      expect(Order.create).toHaveBeenCalled();
      expect(stockManagerModule.decrementProductStock).toHaveBeenCalledWith([
        expect.objectContaining({ productId: 55, quantity: 1 }),
      ]);
      expect(result._id).toBe("order_123");
    });

    it("should set paymentStatus to 'pending' for Cash on Delivery (COD)", async () => {
      (Order.findOne as jest.Mock).mockReturnValue(createMockQuery(null));

      (Order.create as jest.Mock).mockImplementation((data) => ({
        ...(Array.isArray(data) ? data[0] : data),
        _id: "order_cod_123",
      }));

      await orderService.createOrder({
        sessionId: "cs_cod_test_456",
        paymentMethod: "cod",
        items: [{ id: 10, quantity: 2, title: "Gadget", price: 500 }],
        customerEmail: "codshopper@test.com",
      });

      expect(Order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          paymentMethod: "cod",
          paymentStatus: "pending",
          status: "placed",
        })
      );
    });

    it("should strictly reject order creation when a product is out of stock", async () => {
      (Order.findOne as jest.Mock).mockReturnValue(createMockQuery(null));
      (Product.findOne as jest.Mock).mockReturnValue(
        createMockQuery({ title: "Sold Out Headphones", stock: 0 })
      );

      await expect(
        orderService.createOrder({
          sessionId: "cs_out_of_stock_123",
          amount: 2999,
          items: [{ id: 99, quantity: 1, title: "Sold Out Headphones", price: 2999 }],
          customerEmail: "shopper@test.com",
        })
      ).rejects.toThrow("currently out of stock");
    });

    it("should reject order creation when requested quantity exceeds available stock", async () => {
      (Order.findOne as jest.Mock).mockReturnValue(createMockQuery(null));
      (Product.findOne as jest.Mock).mockReturnValue(
        createMockQuery({ title: "Limited Stock TV", stock: 2 })
      );

      await expect(
        orderService.createOrder({
          sessionId: "cs_exceeds_stock_123",
          amount: 50000,
          items: [{ id: 101, quantity: 5, title: "Limited Stock TV", price: 10000 }],
          customerEmail: "shopper@test.com",
        })
      ).rejects.toThrow("available in stock");
    });

    it("should update coupon usage count when coupon code is applied", async () => {
      (Order.findOne as jest.Mock).mockReturnValue(createMockQuery(null));

      (Order.create as jest.Mock).mockResolvedValue({ _id: "order_coupon_applied" });
      (Coupon.updateOne as jest.Mock).mockReturnValue({
        catch: jest.fn(),
      });

      await orderService.createOrder({
        sessionId: "cs_promo_test_789",
        amount: 5000,
        couponCode: "SAVE20",
        customerEmail: "buyer@test.com",
        userId: "user_buyer_1",
      });

      expect(Coupon.updateOne).toHaveBeenCalledWith(
        { code: "SAVE20" },
        expect.objectContaining({
          $inc: { usageCount: 1 },
        }),
        undefined
      );
    });
  });

  describe("cancelOrder", () => {
    it("should cancel active order and automatically restore stock", async () => {
      const mockOrder: any = {
        _id: "order_to_cancel",
        status: "confirmed",
        userId: "user_owner_1",
        items: [{ id: 55, quantity: 2, title: "Eufy Doorbell" }],
        save: jest.fn().mockResolvedValue(true),
      };

      (Order.findById as jest.Mock).mockReturnValue(createMockQuery(mockOrder));

      const cancelled = await orderService.cancelOrder(
        "order_to_cancel",
        "user_owner_1",
        "user",
        "Changed my mind"
      );

      expect(mockOrder.status).toBe("cancelled");
      expect(mockOrder.cancelReason).toBe("Changed my mind");
      expect(mockOrder.save).toHaveBeenCalled();
      expect(stockManagerModule.incrementProductStock).toHaveBeenCalledWith(mockOrder.items);
      expect(cancelled.status).toBe("cancelled");
    });

    it("should prevent a customer from cancelling another customer's order", async () => {
      const mockOrder = {
        _id: "order_another_user",
        status: "confirmed",
        userId: "real_owner",
        items: [],
      };

      (Order.findById as jest.Mock).mockReturnValue(createMockQuery(mockOrder));

      await expect(
        orderService.cancelOrder("order_another_user", "attacker_user", "user")
      ).rejects.toThrow("Forbidden: Unauthorized to cancel this order");
    });

    it("should reject cancellation if order is already cancelled", async () => {
      const mockOrder = {
        _id: "order_already_cancelled",
        status: "cancelled",
        userId: "user_owner_1",
      };

      (Order.findById as jest.Mock).mockReturnValue(createMockQuery(mockOrder));

      await expect(
        orderService.cancelOrder("order_already_cancelled", "user_owner_1", "user")
      ).rejects.toThrow("Order is already cancelled");
    });

    it("should reject cancellation if order is already delivered", async () => {
      const mockOrder = {
        _id: "order_delivered",
        status: "delivered",
        userId: "user_owner_1",
      };

      (Order.findById as jest.Mock).mockReturnValue(createMockQuery(mockOrder));

      await expect(
        orderService.cancelOrder("order_delivered", "user_owner_1", "user")
      ).rejects.toThrow("Delivered orders cannot be cancelled directly");
    });
  });

  describe("getOrderById - Access Control", () => {
    it("should reject unauthorized user attempting to access another user's order", async () => {
      const mockOrder = {
        _id: "order_private_1",
        userId: "customer_alice",
      };

      (Order.findById as jest.Mock).mockReturnValue(createMockQuery(mockOrder));

      await expect(
        orderService.getOrderById("order_private_1", "customer_bob", "user")
      ).rejects.toThrow("Forbidden: Unauthorized to access this order");
    });

    it("should allow admin to access any customer order", async () => {
      const mockOrder = {
        _id: "order_private_2",
        userId: "customer_alice",
      };

      (Order.findById as jest.Mock).mockReturnValue(createMockQuery(mockOrder));

      const order = await orderService.getOrderById("order_private_2", "admin_user_id", "admin");
      expect(order).toBeDefined();
      expect(order._id).toBe("order_private_2");
    });
  });
});
