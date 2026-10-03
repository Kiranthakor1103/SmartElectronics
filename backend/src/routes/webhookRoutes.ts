import { Router } from "express";
import { handleWebhook } from "../controllers/webhookController";

const router = Router();

// POST /api/webhook - Stripe webhook handler (raw body required)
router.post("/", handleWebhook);

export default router;
