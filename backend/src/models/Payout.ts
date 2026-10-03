import mongoose, { Document, Schema, Types } from "mongoose";

export interface IPayout extends Document {
  sellerId: Types.ObjectId;
  amount: number;
  status: "pending" | "processing" | "completed" | "failed";
  bankAccount: string;
  bankIfsc: string;
  subOrderIds: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const PayoutSchema = new Schema<IPayout>(
  {
    sellerId: { type: Schema.Types.ObjectId, ref: "Seller", required: true },
    amount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
    bankAccount: { type: String, required: true },
    bankIfsc: { type: String, required: true },
    subOrderIds: [{ type: Schema.Types.ObjectId, ref: "SubOrder" }],
  },
  { timestamps: true }
);

// Register indexes for faster seller payout audits
PayoutSchema.index({ sellerId: 1 });
PayoutSchema.index({ status: 1 });

export const Payout = mongoose.models.Payout || mongoose.model<IPayout>("Payout", PayoutSchema);
