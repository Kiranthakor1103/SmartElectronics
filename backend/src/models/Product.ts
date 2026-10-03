import { Schema, model, models } from "mongoose";

/**
 * Backend Product model — aligned with the frontend IProduct interface.
 * Fields are kept consistent so the same seed data & API response shape
 * works across both the Express backend and Next.js API routes.
 */

const ProductSchema = new Schema(
  {
    // Numeric ID used by the frontend router (e.g. /products/21)
    id: { type: Number, required: true, unique: true },

    // Primary display name (synced with `name`)
    title: { type: String, required: true, trim: true },

    // Alternative name field (synced with `title`)
    name: { type: String, required: true, trim: true },

    // Selling price
    price: { type: Number, required: true, min: 0 },

    // Optional pre-discounted price
    originalPrice: { type: Number },

    // Discounted price (computed when discountPercentage is supplied)
    discountPrice: { type: Number, default: 0 },

    description: { type: String, required: true },
    brand: { type: String, trim: true },
    category: { type: String, required: true, trim: true },

    // Primary image (thumbnail), synced with `image`
    thumbnail: { type: String },
    image: { type: String },

    // Gallery images
    images: [{ type: String }],

    // Discount as a percentage (0-100)
    discountPercentage: { type: Number, default: 0, min: 0, max: 100 },

    rating: { type: Number, default: 0, min: 0, max: 5 },
    stock: { type: Number, default: 0, min: 0 },

    // SKU identification
    sku: { type: String, trim: true },

    // Sub-category classification
    subCategory: { type: String, trim: true },

    // Sale price (synced with discountPrice)
    salePrice: { type: Number },

    // Technical specifications & hardware details
    specifications: { type: Schema.Types.Mixed, default: {} },

    // Manufacturer warranty
    warranty: { type: String, default: "1 Year Manufacturer Warranty" },

    // Trending badge flag
    trending: { type: Boolean, default: false },

    // Badge label shown on product card (e.g. "HOT", "NEW", "SALE")
    badge: { type: String, default: "" },

    featured: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    couponCode: { type: String, default: "", trim: true },
    sellerId: { type: Schema.Types.ObjectId, ref: "Seller", default: null },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "approved" },
  },
  { timestamps: true }
);


// Optimize database search and query performance with compound & text indexing
ProductSchema.index({ sellerId: 1, status: 1 });
ProductSchema.index({ category: 1, subCategory: 1, active: 1 });
ProductSchema.index({ category: 1, price: 1 });
ProductSchema.index({ brand: 1, active: 1 });
ProductSchema.index({ active: 1, status: 1, createdAt: -1 });
ProductSchema.index({ active: 1, price: 1 });
ProductSchema.index({ active: 1, rating: -1 });
ProductSchema.index({ featured: 1, discountPercentage: -1 });
ProductSchema.index({ trending: 1, active: 1 });
ProductSchema.index({ status: 1, createdAt: -1 });
ProductSchema.index(
  { title: "text", description: "text", brand: "text", category: "text" },
  { weights: { title: 10, brand: 5, category: 3, description: 1 } }
);

// Pre-save: keep title ↔ name and thumbnail ↔ image in sync,
// and compute discountPrice from discountPercentage if not explicitly set.
ProductSchema.pre("save", async function () {
  // Sync title / name
  if (this.title && !this.name) this.name = this.title;
  else if (this.name && !this.title) this.title = this.name;

  // Sync thumbnail / image
  if (this.thumbnail && !this.image) this.image = this.thumbnail;
  else if (this.image && !this.thumbnail) this.thumbnail = this.image;

  // Auto SKU if missing
  if (!this.sku && this.id) {
    this.sku = `SE-${this.id}`;
  }

  // Compute discountPrice & salePrice
  const price = this.price;
  if (price) {
    if (this.salePrice && (!this.discountPrice || this.discountPrice === 0)) {
      this.discountPrice = this.salePrice;
    }
    const dpct = this.discountPercentage;
    const dp = this.discountPrice;
    if (dpct && dpct > 0 && (!dp || dp === 0)) {
      this.discountPrice = Math.round(price * (1 - dpct / 100));
    } else if (dp && dp > 0 && (!dpct || dpct === 0)) {
      this.discountPercentage = Math.round(((price - dp) / price) * 100);
    }
    this.salePrice = this.discountPrice || this.price;
  }
});

// Avoid model re-compilation in Next.js hot-reload environments
export const Product = models?.Product || model("Product", ProductSchema);
