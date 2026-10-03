import { Coupon, ICoupon } from "../models/Coupon";
import { BaseRepository } from "./baseRepository";

export interface CouponFilterOptions {
  search?: string;
  status?: string;
  type?: string;
  page?: number;
  limit?: number;
}

export class CouponRepository extends BaseRepository<ICoupon> {
  constructor() {
    super(Coupon);
  }

  async findByCode(code: string): Promise<ICoupon | null> {
    return Coupon.findOne({ code: code.toUpperCase().trim() }).exec();
  }

  async findActiveByCode(code: string): Promise<ICoupon | null> {
    return Coupon.findOne({ code: code.toUpperCase().trim(), active: true }).exec();
  }

  async getAllCoupons(): Promise<ICoupon[]> {
    return Coupon.find().sort({ createdAt: -1 }).exec();
  }

  async getActivePublicCoupons(): Promise<ICoupon[]> {
    return Coupon.find({ active: true })
      .select("code label type value minOrder")
      .sort({ value: -1 })
      .limit(10)
      .exec();
  }

  async findPaginated(options: CouponFilterOptions) {
    const page = Math.max(1, Number(options.page) || 1);
    const limit = Math.max(1, Number(options.limit) || 10);
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};

    if (options.search && options.search.trim()) {
      const searchRegex = new RegExp(options.search.trim(), "i");
      filter.$or = [{ code: searchRegex }, { label: searchRegex }];
    }

    if (options.status === "active") {
      filter.active = true;
    } else if (options.status === "inactive") {
      filter.active = false;
    }

    if (options.type && options.type !== "all") {
      filter.type = options.type;
    }

    const [coupons, total] = await Promise.all([
      Coupon.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean().exec(),
      Coupon.countDocuments(filter).exec(),
    ]);

    return {
      coupons,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit) || 1,
    };
  }

  async updateById(id: string, data: Partial<ICoupon>): Promise<ICoupon | null> {
    return Coupon.findByIdAndUpdate(id, data, { new: true, runValidators: true }).exec();
  }
}

export const couponRepository = new CouponRepository();
