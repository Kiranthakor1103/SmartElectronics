import { Router } from "express";
import {
  getWishlist,
  updateWishlist,
  toggleWishlistItem,
  clearWishlist,
} from "../controllers/wishlistController";
import { protect } from "../middleware/auth";

const router = Router();

router.use(protect as any);

router.get("/", getWishlist);
router.put("/", updateWishlist);
router.post("/toggle", toggleWishlistItem);
router.delete("/", clearWishlist);

export default router;
