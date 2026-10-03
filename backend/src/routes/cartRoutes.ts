import { Router } from "express";
import { getCart, updateCart, clearCart } from "../controllers/cartController";
import { protect } from "../middleware/auth";

const router = Router();

router.use(protect as any);

router.get("/", getCart);
router.put("/", updateCart);
router.delete("/", clearCart);

export default router;
