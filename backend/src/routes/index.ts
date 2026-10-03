import { Router } from "express";
import authRoutes from "./authRoutes";
import productRoutes from "./productRoutes";
import categoryRoutes from "./categoryRoutes";
import ordersRoutes from "./ordersRoutes";
import checkoutRoutes from "./checkoutRoutes";
import webhookRoutes from "./webhookRoutes";
import sellerRoutes from "./sellerRoutes";
import adminRoutes from "./adminRoutes";
import couponRoutes from "./couponRoutes";
import dealsRoutes from "./dealsRoutes";
import electronicsRoutes from "./electronicsRoutes";
import contactRoutes from "./contactRoutes";
import uploadRoutes from "./uploadRoutes";
import wishlistRoutes from "./wishlistRoutes";
import cartRoutes from "./cartRoutes";
import newsletterRoutes from "./newsletterRoutes";
import notificationRoutes from "./notificationRoutes";

const router = Router();

// Health Check Endpoint
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy and operational",
    timestamp: new Date().toISOString(),
  });
});

// Master Route Aggregation
router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);
router.use("/orders", ordersRoutes);
router.use("/checkout", checkoutRoutes);
router.use("/webhook", webhookRoutes);
router.use("/seller", sellerRoutes);
router.use("/admin", adminRoutes);
router.use("/coupons", couponRoutes);
router.use("/deals", dealsRoutes);
router.use("/electronics", electronicsRoutes);
router.use("/contact", contactRoutes);
router.use("/upload", uploadRoutes);
router.use("/wishlist", wishlistRoutes);
router.use("/cart", cartRoutes);
router.use("/newsletter", newsletterRoutes);
router.use("/notifications", notificationRoutes);

export default router;
