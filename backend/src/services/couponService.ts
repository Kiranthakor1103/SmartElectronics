import { couponRepository, CouponFilterOptions } from "../repositories/couponRepository";
import { Product } from "../models/Product";
import { AppError } from "../utils/appError";

export class CouponService {
  async validateCoupon(code: string, subtotal: number, cartItems?: any[], userIdentifier?: string | string[]) {
    if (!code || !code.trim()) {
      throw new AppError("Coupon code is required", 400);
    }

    const cleanCode = code.trim().toUpperCase();
    const coupon = await couponRepository.findActiveByCode(cleanCode);
    if (!coupon) {
      throw new AppError("Invalid or inactive coupon code", 400);
    }

    if (coupon.minOrder && subtotal < coupon.minOrder) {
      throw new AppError(`Minimum order amount of ₹${coupon.minOrder.toLocaleString("en-IN")} is required to use this coupon`, 400);
    }

    // Check if user has already exceeded the per-customer usage limit
    const limit = coupon.usageLimitPerUser !== undefined ? Number(coupon.usageLimitPerUser) : 1;
    if (userIdentifier && limit > 0) {
      const idents = (Array.isArray(userIdentifier) ? userIdentifier : [userIdentifier])
        .filter(Boolean)
        .map((id) => String(id).trim().toLowerCase());

      const usedByList = (coupon.usedBy || []).map((u: any) => String(u).trim().toLowerCase());
      const maxRedemptions = idents.reduce((max, id) => {
        const count = usedByList.filter((u: string) => u === id).length;
        return Math.max(max, count);
      }, 0);

      if (maxRedemptions >= limit) {
        throw new AppError(
          `You have already redeemed coupon '${cleanCode}'. This offer is limited to ${limit} use(s) per customer.`,
          400
        );
      }
    }

    // Check if coupon is restricted to specific products
    if (coupon.appliesTo === "products") {
      const applicableSet = new Set((coupon.applicableProducts || []).map((p: any) => String(p)));
      
      // Also include products that have this coupon code directly assigned
      const matchingDbProds = await Product.find({ couponCode: cleanCode, active: { $ne: false } }).select("_id id title").lean();
      matchingDbProds.forEach((p: any) => {
        if (p._id) applicableSet.add(String(p._id));
        if (p.id) applicableSet.add(String(p.id));
      });

      const couponObj = (coupon as any).toObject ? (coupon as any).toObject() : { ...coupon };
      couponObj.applicableProducts = Array.from(applicableSet);

      if (Array.isArray(cartItems) && cartItems.length > 0) {
        const hasApplicable = cartItems.some((it: any) =>
          applicableSet.has(String(it.id)) || applicableSet.has(String(it._id)) || applicableSet.has(String(it.productId))
        );
        if (!hasApplicable) {
          const sampleTitles = matchingDbProds.map((p: any) => p.title).filter(Boolean).slice(0, 2);
          const hint = sampleTitles.length > 0 ? ` (e.g. ${sampleTitles.join(", ")})` : "";
          throw new AppError(`Coupon '${cleanCode}' is only valid for specific assigned products${hint}`, 400);
        }
      }

      return couponObj;
    }

    return coupon;
  }

  calculateDiscount(coupon: any, subtotal: number, cartItems?: any[]): number {
    if (coupon.appliesTo === "products" && Array.isArray(cartItems) && cartItems.length > 0) {
      const applicableSet = new Set((coupon.applicableProducts || []).map((p: any) => String(p)));
      const eligibleSubtotal = cartItems
        .filter((it: any) => {
          const itemCoupon = it.couponCode ? String(it.couponCode).toUpperCase() : "";
          return (
            itemCoupon === coupon.code.toUpperCase() ||
            applicableSet.has(String(it.id)) ||
            applicableSet.has(String(it._id)) ||
            applicableSet.has(String(it.productId))
          );
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

  async getPublicCoupons() {
    return couponRepository.getActivePublicCoupons();
  }

  async getAllCoupons(options: CouponFilterOptions = {}) {
    return couponRepository.findPaginated(options);
  }

  async getCouponById(id: string) {
    const coupon = await couponRepository.findById(id);
    if (!coupon) {
      throw new AppError("Coupon not found", 404);
    }
    return coupon;
  }

  async createCoupon(data: any) {
    const { code, label, type, value, minOrder, active, appliesTo, applicableProducts, usageLimitPerUser } = data;
    if (!code || !label || !type || value === undefined || value === null) {
      throw new AppError("Code, label, discount type, and value are required", 400);
    }

    const cleanCode = code.trim().toUpperCase();
    if (cleanCode.length < 3) {
      throw new AppError("Coupon code must be at least 3 characters long", 400);
    }

    if (type !== "percent" && type !== "flat") {
      throw new AppError("Discount type must be either 'percent' or 'flat'", 400);
    }

    const numValue = Number(value);
    if (isNaN(numValue) || numValue <= 0) {
      throw new AppError("Discount value must be greater than 0", 400);
    }

    if (type === "percent" && numValue > 99) {
      throw new AppError("Percentage discount cannot exceed 99%", 400);
    }

    const existing = await couponRepository.findByCode(cleanCode);
    if (existing) {
      throw new AppError(`Coupon code '${cleanCode}' already exists`, 409);
    }

    return couponRepository.create({
      code: cleanCode,
      label: label.trim(),
      type,
      value: numValue,
      minOrder: minOrder !== undefined && minOrder !== "" ? Math.max(0, Number(minOrder)) : 0,
      active: active !== undefined ? Boolean(active) : true,
      appliesTo: appliesTo === "products" ? "products" : "all",
      applicableProducts: Array.isArray(applicableProducts) ? applicableProducts : [],
      usageLimitPerUser: usageLimitPerUser !== undefined && usageLimitPerUser !== "" ? Math.max(1, Number(usageLimitPerUser)) : 1,
    } as any);
  }

  async updateCoupon(id: string, data: any) {
    const existing = await couponRepository.findById(id);
    if (!existing) {
      throw new AppError("Coupon not found", 404);
    }

    const updatePayload: Record<string, any> = {};

    if (data.code) {
      const cleanCode = data.code.trim().toUpperCase();
      if (cleanCode !== existing.code) {
        const conflict = await couponRepository.findByCode(cleanCode);
        if (conflict && conflict._id.toString() !== id) {
          throw new AppError(`Coupon code '${cleanCode}' is already in use`, 409);
        }
      }
      updatePayload.code = cleanCode;
    }

    if (data.label !== undefined) updatePayload.label = data.label.trim();
    if (data.type !== undefined) {
      if (data.type !== "percent" && data.type !== "flat") {
        throw new AppError("Type must be 'percent' or 'flat'", 400);
      }
      updatePayload.type = data.type;
    }

    if (data.value !== undefined) {
      const numValue = Number(data.value);
      if (isNaN(numValue) || numValue <= 0) {
        throw new AppError("Discount value must be greater than 0", 400);
      }
      if ((data.type || existing.type) === "percent" && numValue > 99) {
        throw new AppError("Percentage discount cannot exceed 99%", 400);
      }
      updatePayload.value = numValue;
    }

    if (data.minOrder !== undefined) {
      updatePayload.minOrder = data.minOrder !== "" ? Math.max(0, Number(data.minOrder)) : 0;
    }

    if (data.active !== undefined) {
      updatePayload.active = Boolean(data.active);
    }

    if (data.appliesTo !== undefined) {
      updatePayload.appliesTo = data.appliesTo;
    }

    if (data.applicableProducts !== undefined) {
      updatePayload.applicableProducts = data.applicableProducts;
    }

    if (data.usageLimitPerUser !== undefined) {
      updatePayload.usageLimitPerUser = data.usageLimitPerUser !== "" ? Math.max(1, Number(data.usageLimitPerUser)) : 1;
    }

    const updated = await couponRepository.updateById(id, updatePayload as any);
    return updated;
  }


  async deleteCoupon(id: string) {
    const deleted = await couponRepository.deleteById(id);
    if (!deleted) {
      throw new AppError("Coupon not found", 404);
    }
    return { message: "Coupon deleted successfully" };
  }
}

export const couponService = new CouponService();
