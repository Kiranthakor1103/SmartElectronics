import { Response } from "express";
import { adminService } from "../services/adminService";
import { productRepository } from "../repositories/productRepository";
import { ApiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthenticatedRequest } from "../middleware/auth";
import { AppError } from "../utils/appError";
import { couponService } from "../services/couponService";

export const getAdminMetrics = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const metrics = await adminService.getDashboardMetrics();
  return ApiResponse.success(res, "Admin dashboard metrics retrieved", metrics);
});

export const getSellers = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { page, limit, status } = req.query;
  const data = await adminService.getAllSellers({
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
    status: status as string,
  });
  return ApiResponse.success(res, "Sellers retrieved", data);
});

export const updateSellerKyc = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { sellerId } = req.params;
  const { kycStatus } = req.body;
  const seller = await adminService.updateSellerKyc(sellerId, kycStatus);
  return ApiResponse.success(res, "Seller KYC status updated", seller);
});

export const updateProductStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const product = await adminService.updateProduct(id, { status });
  return ApiResponse.success(res, "Product status updated", product);
});

// --- PRODUCT HANDLERS ---
export const getAdminProducts = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { search, category, page, limit } = req.query;
  const data = await adminService.getAllProducts({
    search: search as string,
    category: category as string,
    page: Number(page) || 1,
    limit: Number(limit) || 10,
  });
  return ApiResponse.success(res, "Admin product catalog retrieved", data);
});

export const getAdminProductById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const product = await productRepository.findByMongoOrNumericId(id);
  if (!product) {
    throw new AppError("Product not found", 404);
  }
  return ApiResponse.success(res, "Product retrieved successfully", product);
});

export const createAdminProduct = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const product = await adminService.createProduct(req.body);
  return ApiResponse.success(res, "Product created successfully", product);
});

export const updateAdminProduct = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const product = await adminService.updateProduct(id, req.body);
  return ApiResponse.success(res, "Product updated successfully", product);
});

export const deleteAdminProduct = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const result = await adminService.deleteProduct(id);
  return ApiResponse.success(res, "Product deleted successfully", result);
});

// --- USER HANDLERS ---
export const getAdminUsers = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { page, limit } = req.query;
  const data = await adminService.getAllUsers({
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
  });
  return ApiResponse.success(res, "Users retrieved successfully", data);
});

export const updateAdminUserRole = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;
  const user = await adminService.updateUserRole(id, role);
  return ApiResponse.success(res, "User role updated successfully", user);
});

export const deleteAdminUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const result = await adminService.deleteUser(id);
  return ApiResponse.success(res, "User deleted successfully", result);
});

// --- ORDER HANDLERS ---
export const getAdminOrders = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { page, limit, status, search } = req.query;
  const data = await adminService.getAllOrders({
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
    status: status as string,
    search: search as string,
  });
  return ApiResponse.success(res, "Orders retrieved successfully", data);
});

export const updateAdminOrderStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const order = await adminService.updateOrderStatus(id, status);
  return ApiResponse.success(res, "Order status updated successfully", order);
});

export const updateAdminOrderPaymentStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { paymentStatus } = req.body;
  const order = await adminService.updateOrderPaymentStatus(id, paymentStatus);
  return ApiResponse.success(res, "Payment status updated successfully", order);
});


// --- COUPON / PROMOCODE HANDLERS ---
export const getAdminCoupons = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { search, status, type, page, limit } = req.query;
  const data = await couponService.getAllCoupons({
    search: search as string,
    status: status as string,
    type: type as string,
    page: Number(page) || 1,
    limit: Number(limit) || 10,
  });
  return ApiResponse.success(res, "Promocodes retrieved successfully", data);
});

export const getAdminCouponById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const coupon = await couponService.getCouponById(req.params.id);
  return ApiResponse.success(res, "Promocode details retrieved", { coupon });
});

export const createAdminCoupon = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const coupon = await couponService.createCoupon(req.body);
  return ApiResponse.success(res, "Promocode created successfully", { coupon }, 201);
});

export const updateAdminCoupon = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const coupon = await couponService.updateCoupon(req.params.id, req.body);
  return ApiResponse.success(res, "Promocode updated successfully", { coupon });
});

export const deleteAdminCoupon = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await couponService.deleteCoupon(req.params.id);
  return ApiResponse.success(res, "Promocode deleted successfully", result);
});

export const getAdminBrands = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const brands = await adminService.getBrands();
  return ApiResponse.success(res, "Brands retrieved successfully", brands);
});

// --- CATEGORY HANDLERS ---
export const getAdminCategories = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const data = await adminService.getCategories();
  return ApiResponse.success(res, "Categories retrieved successfully", data);
});

export const createAdminCategory = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const category = await adminService.createCategory(req.body);
  return ApiResponse.success(res, "Category created successfully", category, 201);
});

export const updateAdminCategory = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const category = await adminService.updateCategory(id, req.body);
  return ApiResponse.success(res, "Category updated successfully", category);
});

export const deleteAdminCategory = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const result = await adminService.deleteCategory(id);
  return ApiResponse.success(res, "Category deleted successfully", result);
});

// --- REPORT & ANALYTICS EXPORT HANDLER ---
export const exportAdminReport = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const format = (req.query.format as string)?.toLowerCase() === "pdf" ? "pdf" : "csv";
  const type = ((req.query.type as string) || "summary").toLowerCase() as "categories" | "orders" | "summary";

  const result = await adminService.exportReport(format, type);

  res.setHeader("Content-Type", result.contentType);
  res.setHeader("Content-Disposition", `attachment; filename="${result.filename}"`);
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  return res.status(200).send(result.buffer);
});
