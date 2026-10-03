import { Schema, model, Document, Types } from "mongoose";

export interface ISubOrderItem {
  productId: Types.ObjectId | string;
  quantity: number;
  price: number;
}

export interface ISubOrder extends Document {
  orderId: Types.ObjectId;
  sellerId: Types.ObjectId;
  items: ISubOrderItem[];
  subTotal: number;
  commissionPaid: number;
  netPayout: number;
  deliveryStatus: "pending" | "shipped" | "delivered" | "cancelled";
  payoutStatus: "pending" | "paid" | "refunded";
  shippingAddress?: {
    line1?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const SubOrderSchema = new Schema<ISubOrder>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    sellerId: { type: Schema.Types.ObjectId, ref: "Seller", required: true },
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 },
      },
    ],
    subTotal: { type: Number, required: true, min: 0 },
    commissionPaid: { type: Number, required: true, min: 0 },
    netPayout: { type: Number, required: true, min: 0 },
    deliveryStatus: {
      type: String,
      enum: ["pending", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    payoutStatus: {
      type: String,
      enum: ["pending", "paid", "refunded"],
      default: "pending",
    },
    shippingAddress: {
      line1: String,
      city: String,
      state: String,
      postal_code: String,
      country: String,
    },
  },
  { timestamps: true }
);

SubOrderSchema.index({ sellerId: 1 });
SubOrderSchema.index({ sellerId: 1, deliveryStatus: 1, createdAt: -1 });
SubOrderSchema.index({ orderId: 1 });
SubOrderSchema.index({ deliveryStatus: 1 });
SubOrderSchema.index({ payoutStatus: 1 });

export const SubOrder = model<ISubOrder>("SubOrder", SubOrderSchema);
