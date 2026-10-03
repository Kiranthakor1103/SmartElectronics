import { Router, Request, Response } from "express";
import { productService } from "../services/productService";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.get("/", asyncHandler(async (req: Request, res: Response) => {
  const limit = Math.min(Number(req.query.limit) || 6, 100);
  const category = (req.query.category as string) || "Electronics";
  const result = await productService.getProducts({ category, limit });

  return res.status(200).json({
    success: true,
    message: "Electronics products retrieved successfully",
    products: result.products,
    total: result.total,
    count: result.products.length,
    category,
  });
}));

export default router;
