import { Schema, model, models } from "mongoose";

const OrderSchema = new Schema(
  {
    orderNumber: { type: String, unique: true, sparse: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: false },
    stripeSessionId: { type: String, unique: true, sparse: true },
    amount: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ["cod", "stripe", "card", "upi"],
      default: "cod",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    status: {
      type: String,
      enum: [
        "placed",
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "out_for_delivery",
        "delivered",
        "cancelled",
        "failed",
        "refunded",
      ],
      default: "placed",
    },
    itemCount: { type: Number, default: 1 },
    discount: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    couponCode: { type: String, default: "" },
    customer: {
      name: { type: String },
      email: { type: String },
      phone: { type: String },
    },
    shippingAddress: {
      fullName: { type: String },
      phone: { type: String },
      pincode: { type: String },
      locality: { type: String },
      address: { type: String },
      city: { type: String },
      state: { type: String },
      addressType: { type: String, default: "Home" },
    },
    items: [
      {
        productId: { type: Schema.Types.Mixed, required: false },
        title: { type: String, required: false },
        thumbnail: { type: String, required: false },
        quantity: { type: Number, required: true, min: 1, default: 1 },
        price: { type: Number, required: true, min: 0 },
        sellerId: { type: Schema.Types.ObjectId, ref: "Seller", default: null },
      },
    ],
    paidAt: { type: Date },
    deliveredAt: { type: Date },
  },
  { timestamps: true }
);

// Performance Indexes for high-speed queries on user orders, seller orders, and status filters
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ "customer.email": 1 });
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ paymentStatus: 1, status: 1 });
OrderSchema.index({ "items.sellerId": 1, status: 1 });
OrderSchema.index({ "items.productId": 1 });

export const Order = models?.Order || model("Order", OrderSchema);

