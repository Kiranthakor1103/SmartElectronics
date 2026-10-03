import { Schema, model, models, Document, Types } from "mongoose";

export interface ICart extends Document {
  userId: Types.ObjectId;
  items: any[];
  coupon?: any;
  createdAt: Date;
  updatedAt: Date;
}

const CartSchema = new Schema<ICart>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    items: [Schema.Types.Mixed],
    coupon: {
      type: Schema.Types.Mixed,
      default: null,
    },
  },
  { timestamps: true }
);

export const Cart = models?.Cart || model<ICart>("Cart", CartSchema);
