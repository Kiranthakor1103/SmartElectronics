import { Response } from "express";
import { sellerService } from "../services/sellerService";
import { ApiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthenticatedRequest } from "../middleware/auth";
import { AppError } from "../utils/appError";

export const onboardSeller = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user?.id) {
    throw new AppError("Unauthorized", 401);
  }
  const seller = await sellerService.registerSeller(req.user.id, req.body);
  return ApiResponse.success(res, "Seller onboarding completed successfully", seller, 201);
});

export const getSellerProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user?.id) {
    throw new AppError("Unauthorized", 401);
  }
  const seller = await sellerService.getSellerProfile(req.user.id);
  return ApiResponse.success(res, "Seller profile retrieved", seller);
});

export const getSellerDashboard = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user?.id) {
    throw new AppError("Unauthorized", 401);
  }
  const dashboard = await sellerService.getSellerDashboardMetrics(req.user.id);
  return ApiResponse.success(res, "Seller dashboard data fetched", dashboard);
});

export const requestPayout = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user?.id) {
    throw new AppError("Unauthorized", 401);
  }
  const payout = await sellerService.requestPayout(req.user.id, req.body.amount);
  return ApiResponse.success(res, "Payout requested successfully", payout, 201);
});
