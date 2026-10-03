import { Router } from "express";
import { getMyOrders, getOrderBySessionId, createOrder, cancelCustomerOrder } from "../controllers/orderController";
import { optionalAuth, protect } from "../middleware/auth";

const router = Router();

router.post("/", optionalAuth as any, createOrder);
router.get("/", optionalAuth as any, getMyOrders);
router.get("/:sessionId", optionalAuth as any, getOrderBySessionId);
router.post("/:id/cancel", protect as any, cancelCustomerOrder);

export default router;
