import { Response } from "express";
import { Cart } from "../models/Cart";
import { ApiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthenticatedRequest } from "../middleware/auth";
import { AppError } from "../utils/appError";

export const getCart = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user?.id) {
    throw new AppError("Unauthorized", 401);
  }

  const cart = await Cart.findOne({ userId: req.user.id });
  return ApiResponse.success(res, "Cart retrieved successfully", {
    items: cart ? cart.items : [],
    coupon: cart?.coupon ?? null,
  });
});

export const updateCart = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user?.id) {
    throw new AppError("Unauthorized", 401);
  }

  const { items, coupon } = req.body;
  if (!Array.isArray(items)) {
    throw new AppError("Items must be an array", 400);
  }

  const cart = await Cart.findOneAndUpdate(
    { userId: req.user.id },
    {
      items,
      coupon: coupon !== undefined ? coupon : null,
      updatedAt: new Date(),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return ApiResponse.success(res, "Cart updated successfully", {
    items: cart.items,
    coupon: cart.coupon ?? null,
  });
});

export const clearCart = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user?.id) {
    throw new AppError("Unauthorized", 401);
  }

  await Cart.findOneAndUpdate(
    { userId: req.user.id },
    { items: [], coupon: null },
    { upsert: true, new: true }
  );

  return ApiResponse.success(res, "Cart cleared successfully", {
    items: [],
    coupon: null,
  });
});
