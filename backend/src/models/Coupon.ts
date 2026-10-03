import mongoose, { Document, Schema } from "mongoose";

export interface ICoupon extends Document {
  code: string;
  label: string;
  type: "percent" | "flat";
  value: number;
  minOrder?: number;
  active: boolean;
  appliesTo?: "all" | "products";
  applicableProducts?: any[];
  usageLimitPerUser?: number;
  usedBy?: string[];
  usageCount?: number;
  createdAt: Date;
}


const CouponSchema: Schema = new Schema(
  {
    code: {
      type: String,
      required: [true, "Coupon code is required"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    label: {
      type: String,
      required: [true, "Coupon label is required"],
      trim: true,
    },
    type: {
      type: String,
      required: [true, "Coupon type is required"],
      enum: ["percent", "flat"],
    },
    value: {
      type: Number,
      required: [true, "Discount value is required"],
      min: [1, "Value must be positive"],
    },
    minOrder: {
      type: Number,
      min: [0, "Minimum order must be positive"],
    },
    active: {
      type: Boolean,
      default: true,
    },
    appliesTo: {
      type: String,
      enum: ["all", "products"],
      default: "all",
    },
    applicableProducts: [
      {
        type: Schema.Types.Mixed,
      },
    ],
    usageLimitPerUser: {
      type: Number,
      default: 1,
    },
    usedBy: [
      {
        type: String,
        trim: true,
      },
    ],
    usageCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

CouponSchema.index({ code: 1, active: 1 });

export const Coupon = mongoose.models.Coupon || mongoose.model<ICoupon>("Coupon", CouponSchema);
