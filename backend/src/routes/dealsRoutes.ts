import { Router, Request, Response } from "express";
import { productService } from "../services/productService";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.get("/", asyncHandler(async (req: Request, res: Response) => {
  const {
    category,
    minDiscount,
    sort,
    page = "1",
    limit = "50",
  } = req.query;

  const result = await productService.getProducts({
    deal: true,
    category: category as string,
    minDiscount: minDiscount ? Number(minDiscount) : undefined,
    sort: sort as string || "discount",
    page: Number(page),
    limit: Math.min(Number(limit) || 50, 100),
  });

  const expiresAt = new Date();
  expiresAt.setHours(23, 59, 59, 999);

  return res.status(200).json({
    success: true,
    message: "Discounted deals retrieved successfully",
    deals: result.products,
    products: result.products,
    expiresAt: expiresAt.toISOString(),
    total: result.total,
    page: result.page,
    pages: result.pages,
    count: result.products.length,
  });
}));

export default router;
