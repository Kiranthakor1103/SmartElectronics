import mongoose from "mongoose";
import { Product } from "../models/Product";
import { invalidateCache } from "../middleware/cacheMiddleware";

export interface StockItemPayload {
  productId?: string | number | null;
  id?: string | number | null;
  quantity?: number | string | null;
  title?: string;
}

/**
 * Decrements product stock in real time when customer places an order.
 * Handles both MongoDB ObjectId and numeric product IDs (from frontend cart).
 */
export async function decrementProductStock(items: StockItemPayload[]): Promise<void> {
  if (!Array.isArray(items) || items.length === 0) return;

  for (const item of items) {
    const rawId = item.productId ?? item.id;
    if (rawId === null || rawId === undefined || rawId === "") continue;

    const qty = Math.max(1, Number(item.quantity) || 1);
    const strVal = String(rawId).trim();

    let filter: Record<string, any>;
    if (mongoose.Types.ObjectId.isValid(strVal) && strVal.length === 24) {
      filter = { _id: new mongoose.Types.ObjectId(strVal) };
    } else if (!isNaN(Number(strVal))) {
      filter = { id: Number(strVal) };
    } else if (item.title) {
      filter = { title: item.title };
    } else {
      continue;
    }

    try {
      const product = await Product.findOne(filter);
      if (product) {
        const previousStock = typeof product.stock === "number" ? product.stock : 0;
        const newStock = Math.max(0, previousStock - qty);
        product.stock = newStock;
        await product.save();

        console.log(
          `📦 [Stock Decrement] "${product.title}" (ID: ${product.id || product._id}): ${previousStock} ➔ ${newStock} (-${qty})`
        );
      } else {
        console.warn(`[Stock Warning] Product not found matching filter:`, filter);
      }
    } catch (err: any) {
      console.error(`❌ [Stock Error] Failed to decrement stock for item ${strVal}:`, err.message);
    }
  }

  // Clear product caches so Admin panel and Storefront receive fresh stock immediately
  try {
    await invalidateCache("cache:/api/products*");
    await invalidateCache("cache:/api/admin/products*");
  } catch (cacheErr: any) {
    console.warn("[Stock Cache Invalidation Warning]:", cacheErr.message);
  }
}

/**
 * Restores product stock when an order is cancelled or refunded.
 */
export async function incrementProductStock(items: StockItemPayload[]): Promise<void> {
  if (!Array.isArray(items) || items.length === 0) return;

  for (const item of items) {
    const rawId = item.productId ?? item.id;
    if (rawId === null || rawId === undefined || rawId === "") continue;

    const qty = Math.max(1, Number(item.quantity) || 1);
    const strVal = String(rawId).trim();

    let filter: Record<string, any>;
    if (mongoose.Types.ObjectId.isValid(strVal) && strVal.length === 24) {
      filter = { _id: new mongoose.Types.ObjectId(strVal) };
    } else if (!isNaN(Number(strVal))) {
      filter = { id: Number(strVal) };
    } else {
      continue;
    }

    try {
      const product = await Product.findOne(filter);
      if (product) {
        const previousStock = typeof product.stock === "number" ? product.stock : 0;
        product.stock = previousStock + qty;
        await product.save();

        console.log(
          `📦 [Stock Restored] "${product.title}" (ID: ${product.id || product._id}): ${previousStock} ➔ ${product.stock} (+${qty})`
        );
      }
    } catch (err: any) {
      console.error(`❌ [Stock Restore Error] Failed for item ${strVal}:`, err.message);
    }
  }

  try {
    await invalidateCache("cache:/api/products*");
    await invalidateCache("cache:/api/admin/products*");
  } catch {}
}
