export const FREE_SHIPPING_THRESHOLD = 999;

export const SHIPPING_FEE = 99;

export type CouponType = "percent" | "flat";

export interface Coupon {
  code: string;
  label: string;
  type: CouponType;
  value: number;
  minOrder?: number;
  appliesTo?: "all" | "products";
  applicableProducts?: any[];
}

export const COUPONS: Record<string, Coupon> = {
  SAVE10: {
    code: "SAVE10",
    label: "10% off your order",
    type: "percent",
    value: 10,
    minOrder: 500,
  },
  WELCOME20: {
    code: "WELCOME20",
    label: "20% off — welcome offer",
    type: "percent",
    value: 20,
    minOrder: 1500,
  },
  FLAT100: {
    code: "FLAT100",
    label: "₹100 off",
    type: "flat",
    value: 100,
    minOrder: 799,
  },
};

export function validateCoupon(code: string, subtotal: number): {
  valid: boolean;
  coupon?: Coupon;
  error?: string;
} {
  const normalized = code.trim().toUpperCase();
  const coupon = COUPONS[normalized];

  if (!coupon) {
    return { valid: false, error: "Invalid coupon code" };
  }

  if (coupon.minOrder && subtotal < coupon.minOrder) {
    return {
      valid: false,
      error: `Minimum order ₹${coupon.minOrder.toLocaleString()} required`,
    };
  }

  return { valid: true, coupon };
}

export function calculateDiscount(subtotal: number, coupon: Coupon, items?: any[]): number {
  if (coupon.appliesTo === "products" && Array.isArray(items) && items.length > 0) {
    const applicableSet = new Set((coupon.applicableProducts || []).map((p: any) => String(p)));
    const eligibleSubtotal = items
      .filter((it: any) => {
        const itemCoupon = it.couponCode ? String(it.couponCode).toUpperCase() : "";
        return itemCoupon === coupon.code.toUpperCase() ||
          applicableSet.has(String(it.id)) ||
          applicableSet.has(String(it._id)) ||
          applicableSet.has(String(it.productId));
      })
      .reduce((sum, it: any) => sum + (Number(it.price) || 0) * (Number(it.quantity) || 1), 0);

    const baseAmount = eligibleSubtotal > 0 ? eligibleSubtotal : subtotal;
    if (coupon.type === "percent") {
      return Math.round((baseAmount * coupon.value) / 100);
    }
    return Math.min(coupon.value, baseAmount);
  }

  if (coupon.type === "percent") {
    return Math.round((subtotal * coupon.value) / 100);
  }
  return Math.min(coupon.value, subtotal);
}

export function calculateShipping(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
}
