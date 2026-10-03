import { Router } from "express";
import { onboardSeller, getSellerProfile, getSellerDashboard, requestPayout } from "../controllers/sellerController";
import { protect, authorize } from "../middleware/auth";

const router = Router();

router.post("/onboard", protect as any, onboardSeller);
router.get("/profile", protect as any, getSellerProfile);
router.get("/dashboard", protect as any, authorize("seller") as any, getSellerDashboard);
router.post("/payout", protect as any, authorize("seller") as any, requestPayout);

export default router;
