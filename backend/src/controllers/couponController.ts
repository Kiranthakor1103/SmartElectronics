import { Request, Response } from "express";
import { couponService } from "../services/couponService";
import { ApiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const validateCoupon = asyncHandler(async (req: Request, res: Response) => {
  const code = (req.query.code || req.body?.code) as string;
  const subtotal = Number(req.query.subtotal || req.body?.subtotal) || 0;
  let items: any[] | undefined = undefined;
  if (req.query.items) {
    try {
      items = JSON.parse(req.query.items as string);
    } catch {}
  } else if (req.body?.items) {
    items = req.body.items;
  }

  const userIdentifiers: string[] = [
    (req as any).user?.id,
    (req as any).user?._id,
    (req as any).user?.email,
    req.query.userId as string,
    req.query.email as string,
    req.body?.userId as string,
    req.body?.email as string,
  ].filter(Boolean);

  const coupon = await couponService.validateCoupon(code, subtotal, items, userIdentifiers);
  const discount = couponService.calculateDiscount(coupon, subtotal, items);

  return res.status(200).json({
    success: true,
    message: "Coupon validated successfully",
    coupon,
    discount,
    data: { coupon, discount },
  });
});



export const getPublicCoupons = asyncHandler(async (_req: Request, res: Response) => {
  const coupons = await couponService.getPublicCoupons();
  return ApiResponse.success(res, "Active promotional coupons retrieved", { coupons });
});

export const getCoupons = asyncHandler(async (req: Request, res: Response) => {
  const { search, status, type, page, limit } = req.query;
  const data = await couponService.getAllCoupons({
    search: search as string,
    status: status as string,
    type: type as string,
    page: Number(page) || 1,
    limit: Number(limit) || 10,
  });
  return ApiResponse.success(res, "Coupons retrieved successfully", data);
});

export const getCouponById = asyncHandler(async (req: Request, res: Response) => {
  const coupon = await couponService.getCouponById(req.params.id);
  return ApiResponse.success(res, "Coupon details retrieved", { coupon });
});

export const createCoupon = asyncHandler(async (req: Request, res: Response) => {
  const coupon = await couponService.createCoupon(req.body);
  return ApiResponse.success(res, "Coupon created successfully", { coupon }, 201);
});

export const updateCoupon = asyncHandler(async (req: Request, res: Response) => {
  const coupon = await couponService.updateCoupon(req.params.id, req.body);
  return ApiResponse.success(res, "Coupon updated successfully", { coupon });
});

export const deleteCoupon = asyncHandler(async (req: Request, res: Response) => {
  const result = await couponService.deleteCoupon(req.params.id);
  return ApiResponse.success(res, "Coupon deleted successfully", result);
});
