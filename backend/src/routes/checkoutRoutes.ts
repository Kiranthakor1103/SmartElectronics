import { Router } from "express";
import { createCheckout } from "../controllers/checkoutController";
import { checkoutRateLimiter } from "../middleware/rateLimiter";

const router = Router();

// POST /api/checkout - Create Stripe checkout session (public — guest checkout supported)
router.post("/", checkoutRateLimiter, createCheckout);

export default router;
