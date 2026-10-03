import { Request, Response } from "express";
import { authService } from "../services/authService";
import { ApiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthenticatedRequest } from "../middleware/auth";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.registerUser(req.body);
  return ApiResponse.success(res, "User registered successfully", result, 201);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.loginUser(req.body);
  if (result?.token) {
    res.cookie("accessToken", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }
  return ApiResponse.success(res, "Login successful", result, 200);
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie("accessToken", { httpOnly: true, sameSite: "lax" });
  res.clearCookie("token", { sameSite: "lax" });
  res.clearCookie("adminToken", { sameSite: "lax" });
  return ApiResponse.success(res, "Logged out successfully", null, 200);
});

export const googleAuth = asyncHandler(async (req: Request, res: Response) => {
  const { credential } = req.body;
  const result = await authService.googleAuth(credential);
  return ApiResponse.success(res, "Google authentication successful", result, 200);
});

export const getMe = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = await authService.getCurrentUserProfile(req.user?.id || "");
  return ApiResponse.success(res, "User profile retrieved", user, 200);
});

export const updateProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const updatedUser = await authService.updateUserProfile(req.user?.id || "", req.body);
  return ApiResponse.success(res, "User profile updated successfully", updatedUser, 200);
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email, portal } = req.body;
  const result = await authService.requestPasswordReset(email, portal);
  return ApiResponse.success(res, result.message, result, 200);
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, password } = req.body;
  const result = await authService.resetPassword(token, password);
  return ApiResponse.success(res, result.message, null, 200);
});
