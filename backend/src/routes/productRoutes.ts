import { Router } from "express";
import {
  getProducts,
  getSuggestions,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  importProducts,
} from "../controllers/productController";
import { protect, authorize } from "../middleware/auth";
import { cacheResponse, invalidateCache } from "../middleware/cacheMiddleware";

const router = Router();

// Invalidate catalog cache whenever products are created, imported, updated, or deleted
const clearProductCache = (req: any, res: any, next: any) => {
  res.on("finish", () => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      invalidateCache("cache:/api/products*");
      invalidateCache("cache:/api/admin/brands*");
    }
  });
  next();
};

router.get("/", cacheResponse(300), getProducts);
router.get("/suggestions", getSuggestions);
router.get("/:id", cacheResponse(300), getProductById);

router.post("/", clearProductCache, protect as any, authorize("seller", "admin") as any, createProduct);
router.post("/import", clearProductCache, protect as any, authorize("seller", "admin") as any, importProducts);
router.put("/:id", clearProductCache, protect as any, authorize("seller", "admin") as any, updateProduct);
router.delete("/:id", clearProductCache, protect as any, authorize("seller", "admin") as any, deleteProduct);

export default router;
