import { decrementProductStock, incrementProductStock } from "../utils/stockManager";
import { Product } from "../models/Product";
import * as cacheModule from "../middleware/cacheMiddleware";

// Mock Product model and cache invalidation
jest.mock("../models/Product");
jest.mock("../middleware/cacheMiddleware", () => ({
  invalidateCache: jest.fn().mockResolvedValue(true),
  cacheResponse: jest.fn(() => (_req: any, _res: any, next: any) => next()),
}));

describe("StockManager - Real-Time Inventory & Dual ID Handling", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("decrementProductStock", () => {
    it("should correctly find product by numeric ID and decrement stock", async () => {
      const mockProduct = {
        id: 55,
        title: "Eufy Doorbell",
        stock: 20,
        save: jest.fn().mockResolvedValue(true),
      };

      (Product.findOne as jest.Mock).mockResolvedValue(mockProduct);

      await decrementProductStock([
        { id: 55, quantity: 2, title: "Eufy Doorbell" },
      ]);

      expect(Product.findOne).toHaveBeenCalledWith({ id: 55 });
      expect(mockProduct.stock).toBe(18);
      expect(mockProduct.save).toHaveBeenCalled();
      expect(cacheModule.invalidateCache).toHaveBeenCalledWith("cache:/api/products*");
      expect(cacheModule.invalidateCache).toHaveBeenCalledWith("cache:/api/admin/products*");
    });

    it("should correctly find product by 24-char ObjectId string", async () => {
      const mockProduct = {
        _id: "60d5ec49f1b2c8b1f8e4e1a1",
        title: "Sony Camera",
        stock: 10,
        save: jest.fn().mockResolvedValue(true),
      };

      (Product.findOne as jest.Mock).mockResolvedValue(mockProduct);

      await decrementProductStock([
        { productId: "60d5ec49f1b2c8b1f8e4e1a1", quantity: 3 },
      ]);

      expect(Product.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ _id: expect.anything() })
      );
      expect(mockProduct.stock).toBe(7);
      expect(mockProduct.save).toHaveBeenCalled();
    });

    it("should never let stock drop below 0 (underflow prevention)", async () => {
      const mockProduct = {
        id: 12,
        title: "Limited Edition Keyboard",
        stock: 2,
        save: jest.fn().mockResolvedValue(true),
      };

      (Product.findOne as jest.Mock).mockResolvedValue(mockProduct);

      await decrementProductStock([
        { id: 12, quantity: 10 },
      ]);

      expect(mockProduct.stock).toBe(0);
      expect(mockProduct.save).toHaveBeenCalled();
    });

    it("should fallback to matching product by title if ID is not numeric or ObjectId", async () => {
      const mockProduct = {
        title: "Smart Wireless Bulb",
        stock: 15,
        save: jest.fn().mockResolvedValue(true),
      };

      (Product.findOne as jest.Mock).mockResolvedValue(mockProduct);

      await decrementProductStock([
        { productId: "custom_slug_sku", title: "Smart Wireless Bulb", quantity: 5 },
      ]);

      expect(Product.findOne).toHaveBeenCalledWith({ title: "Smart Wireless Bulb" });
      expect(mockProduct.stock).toBe(10);
    });

    it("should safely handle empty or null item payloads without throwing errors", async () => {
      await expect(decrementProductStock([])).resolves.toBeUndefined();
      await expect(decrementProductStock(null as any)).resolves.toBeUndefined();
      await expect(decrementProductStock(undefined as any)).resolves.toBeUndefined();
      await expect(decrementProductStock([{ id: "" }])).resolves.toBeUndefined();
    });
  });

  describe("incrementProductStock", () => {
    it("should replenish product stock upon order cancellation", async () => {
      const mockProduct = {
        id: 55,
        title: "Eufy Doorbell",
        stock: 18,
        save: jest.fn().mockResolvedValue(true),
      };

      (Product.findOne as jest.Mock).mockResolvedValue(mockProduct);

      await incrementProductStock([
        { id: 55, quantity: 2 },
      ]);

      expect(mockProduct.stock).toBe(20);
      expect(mockProduct.save).toHaveBeenCalled();
      expect(cacheModule.invalidateCache).toHaveBeenCalledWith("cache:/api/products*");
      expect(cacheModule.invalidateCache).toHaveBeenCalledWith("cache:/api/admin/products*");
    });

    it("should safely handle empty increment calls", async () => {
      await expect(incrementProductStock([])).resolves.toBeUndefined();
      await expect(incrementProductStock(null as any)).resolves.toBeUndefined();
    });
  });
});
