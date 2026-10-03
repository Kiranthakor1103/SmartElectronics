import { Router } from "express";
import {
  getAdminMetrics,
  getSellers,
  updateSellerKyc,
  updateProductStatus,
  getAdminProducts,
  getAdminProductById,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  getAdminUsers,
  updateAdminUserRole,
  deleteAdminUser,
  getAdminOrders,
  updateAdminOrderStatus,
  updateAdminOrderPaymentStatus,
  getAdminCoupons,
  getAdminCouponById,
  createAdminCoupon,
  updateAdminCoupon,
  deleteAdminCoupon,
  getAdminBrands,
  getAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
  exportAdminReport,
} from "../controllers/adminController";
import { protect, authorize } from "../middleware/auth";
import { invalidateCache } from "../middleware/cacheMiddleware";

const router = Router();

// Invalidate public & admin catalog caches when an admin creates, updates, or deletes products
const clearProductCache = (req: any, res: any, next: any) => {
  res.on("finish", () => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      invalidateCache("cache:/api/products*");
      invalidateCache("cache:/api/admin/products*");
      invalidateCache("cache:/api/admin/brands*");
    }
  });
  next();
};

// Protect and require "admin" role for all routes in this router
router.use(protect as any, authorize("admin") as any);

// Dashboard & Seller KYC
router.get("/metrics", getAdminMetrics);
router.get("/sellers", getSellers);
router.put("/sellers/:sellerId/kyc", updateSellerKyc);

// Product Catalog Management
router.get("/products", getAdminProducts);
router.get("/products/:id", getAdminProductById);
router.post("/products", clearProductCache, createAdminProduct);
router.put("/products/:id", clearProductCache, updateAdminProduct);
router.put("/products/:id/status", clearProductCache, updateProductStatus);
router.delete("/products/:id", clearProductCache, deleteAdminProduct);
router.get("/brands", getAdminBrands);

// Category Management
router.get("/categories", getAdminCategories);
router.post("/categories", createAdminCategory);
router.put("/categories/:id", updateAdminCategory);
router.delete("/categories/:id", deleteAdminCategory);

// User Management
router.get("/users", getAdminUsers);
router.put("/users/:id/role", updateAdminUserRole);
router.delete("/users/:id", deleteAdminUser);

// Order Management
router.get("/orders", getAdminOrders);
router.put("/orders/:id/status", updateAdminOrderStatus);
router.put("/orders/:id/payment-status", updateAdminOrderPaymentStatus);

// Promocode / Coupon Management
router.get("/coupons", getAdminCoupons);
router.get("/coupons/:id", getAdminCouponById);
router.post("/coupons", createAdminCoupon);
router.put("/coupons/:id", updateAdminCoupon);
router.delete("/coupons/:id", deleteAdminCoupon);

// Reports & Analytics Export APIs (CSV & PDF)
router.get("/reports/export", exportAdminReport);
router.get("/reports/export-csv", exportAdminReport);
router.get("/reports/export-pdf", exportAdminReport);

export default router;
