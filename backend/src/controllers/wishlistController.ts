import { Response } from "express";
import { Wishlist } from "../models/Wishlist";
import { ApiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthenticatedRequest } from "../middleware/auth";
import { AppError } from "../utils/appError";

export const getWishlist = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user?.id) {
    throw new AppError("Unauthorized", 401);
  }

  const wishlist = await Wishlist.findOne({ userId: req.user.id });
  const items = wishlist ? wishlist.items : [];

  return ApiResponse.success(res, "Wishlist retrieved successfully", { items });
});

export const updateWishlist = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user?.id) {
    throw new AppError("Unauthorized", 401);
  }

  const { items } = req.body;
  if (!Array.isArray(items)) {
    throw new AppError("Items must be an array", 400);
  }

  const wishlist = await Wishlist.findOneAndUpdate(
    { userId: req.user.id },
    { items, updatedAt: new Date() },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return ApiResponse.success(res, "Wishlist updated successfully", { items: wishlist.items });
});

export const toggleWishlistItem = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user?.id) {
    throw new AppError("Unauthorized", 401);
  }

  const { product } = req.body;
  if (!product || product.id === undefined) {
    throw new AppError("Product with a valid id is required", 400);
  }

  let wishlist = await Wishlist.findOne({ userId: req.user.id });
  if (!wishlist) {
    wishlist = new Wishlist({ userId: req.user.id, items: [product] });
    await wishlist.save();
    return ApiResponse.success(res, "Added to wishlist", { items: wishlist.items, added: true });
  }

  const index = wishlist.items.findIndex((item: any) => String(item.id) === String(product.id));
  let added = false;
  if (index >= 0) {
    wishlist.items.splice(index, 1);
  } else {
    wishlist.items.push(product);
    added = true;
  }

  wishlist.markModified("items");
  await wishlist.save();

  return ApiResponse.success(res, added ? "Added to wishlist" : "Removed from wishlist", {
    items: wishlist.items,
    added,
  });
});

export const clearWishlist = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user?.id) {
    throw new AppError("Unauthorized", 401);
  }

  await Wishlist.findOneAndUpdate(
    { userId: req.user.id },
    { items: [] },
    { upsert: true, new: true }
  );

  return ApiResponse.success(res, "Wishlist cleared successfully", { items: [] });
});
