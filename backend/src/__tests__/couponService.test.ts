import { CouponService } from "../services/couponService";

describe("CouponService - Discount Calculation & Business Rules", () => {
  let couponService: CouponService;

  beforeEach(() => {
    couponService = new CouponService();
  });

  describe("Percentage Coupons", () => {
    it("should accurately calculate 20% discount on a ₹10,000 subtotal", () => {
      const coupon = {
        code: "SMART20",
        type: "percent" as const,
        value: 20,
        active: true,
      };

      const discount = couponService.calculateDiscount(coupon, 10000);
      expect(discount).toBe(2000);
    });

    it("should round discounts accurately for uneven values", () => {
      const coupon = {
        code: "FESTIVE15",
        type: "percent" as const,
        value: 15,
        active: true,
      };

      // 15% of 333 = 49.95 -> 50
      const discount = couponService.calculateDiscount(coupon, 333);
      expect(discount).toBe(50);
    });
  });

  describe("Flat Coupons", () => {
    it("should calculate flat ₹500 discount on a ₹5,000 subtotal", () => {
      const coupon = {
        code: "FLAT500",
        type: "flat" as const,
        value: 500,
        active: true,
      };

      const discount = couponService.calculateDiscount(coupon, 5000);
      expect(discount).toBe(500);
    });

    it("should cap flat discount at the order subtotal to avoid negative totals", () => {
      const coupon = {
        code: "WELCOME500",
        type: "flat" as const,
        value: 500,
        active: true,
      };

      // Subtotal is only 300, discount cannot exceed 300
      const discount = couponService.calculateDiscount(coupon, 300);
      expect(discount).toBe(300);
    });
  });

  describe("Product-Specific Coupons", () => {
    it("should calculate discount only for eligible products in cart", () => {
      const coupon = {
        code: "AUDIO10",
        type: "percent" as const,
        value: 10,
        appliesTo: "products",
        applicableProducts: ["sony-wh1000xm5"],
        active: true,
      };

      const cartItems = [
        { id: "sony-wh1000xm5", price: 25000, quantity: 1 },
        { id: "apple-macbook-pro", price: 150000, quantity: 1 },
      ];

      // Only the headphones (25,000) are eligible, so 10% = 2,500
      const discount = couponService.calculateDiscount(coupon, 175000, cartItems);
      expect(discount).toBe(2500);
    });
  });
});
