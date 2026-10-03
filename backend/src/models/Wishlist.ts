import { Schema, model, models, Document, Types } from "mongoose";

export interface IWishlist extends Document {
  userId: Types.ObjectId;
  items: any[];
  createdAt: Date;
  updatedAt: Date;
}

const WishlistSchema = new Schema<IWishlist>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    items: [Schema.Types.Mixed],
  },
  { timestamps: true }
);

export const Wishlist = models?.Wishlist || model<IWishlist>("Wishlist", WishlistSchema);
