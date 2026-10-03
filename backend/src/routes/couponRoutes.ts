import { Router } from "express";
import {
  validateCoupon,
  getPublicCoupons,
  getCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from "../controllers/couponController";
import { protect, authorize } from "../middleware/auth";

const router = Router();

// Public routes for checkout / cart
router.get("/validate", validateCoupon);
router.get("/public", getPublicCoupons);

// Protected Admin Promocode Management Routes
router.get("/", protect as any, authorize("admin") as any, getCoupons);
router.get("/:id", protect as any, authorize("admin") as any, getCouponById);
router.post("/", protect as any, authorize("admin") as any, createCoupon);
router.put("/:id", protect as any, authorize("admin") as any, updateCoupon);
router.delete("/:id", protect as any, authorize("admin") as any, deleteCoupon);

export default router;
