import { Router } from "express";
import { getCategories, createCategory } from "../controllers/categoryController";
import { protect, authorize } from "../middleware/auth";
import { cacheResponse, invalidateCache } from "../middleware/cacheMiddleware";

const router = Router();

const clearCategoryCache = (req: any, res: any, next: any) => {
  res.on("finish", () => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      invalidateCache("cache:/api/categories*");
    }
  });
  next();
};

router.get("/", cacheResponse(600), getCategories);
router.post("/", clearCategoryCache, protect as any, authorize("admin") as any, createCategory);

export default router;
