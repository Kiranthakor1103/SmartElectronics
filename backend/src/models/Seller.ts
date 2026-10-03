import { Schema, model, Types, Document } from "mongoose";

export interface ISeller extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  companyName: string;
  gstNumber: string;
  panNumber: string;
  bankAccount: string;
  bankIfsc: string;
  kycStatus: "pending" | "approved" | "rejected";
  commissionRate: number;
  active: boolean;
}

const SellerSchema = new Schema<ISeller>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    companyName: { type: String, required: true, trim: true },
    gstNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
    panNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
    bankAccount: { type: String, required: true, trim: true },
    bankIfsc: { type: String, required: true, uppercase: true, trim: true },
    kycStatus: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    commissionRate: { type: Number, default: 10.0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

SellerSchema.index({ kycStatus: 1 });

export const Seller = model<ISeller>("Seller", SellerSchema);
