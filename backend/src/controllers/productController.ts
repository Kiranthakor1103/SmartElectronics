import { Request, Response } from "express";
import { productService } from "../services/productService";
import { ApiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthenticatedRequest } from "../middleware/auth";

export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const {
    category,
    subCategory,
    brand,
    minPrice,
    maxPrice,
    rating,
    sort,
    page = "1",
    limit = "100000",
    search,
    deal,
    featured,
    myProducts,
    minDiscount,
    inStock,
  } = req.query;

  const authReq = req as AuthenticatedRequest;

  const result = await productService.getProducts(
    {
      category: category as string,
      subCategory: subCategory as string,
      brand: brand as string,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      minRating: rating ? Number(rating) : undefined,
      sort: sort as string,
      page: Number(page),
      limit: Number(limit),
      search: search as string,
      deal: deal === "true",
      featured: featured === "true",
      myProducts: myProducts === "true",
      minDiscount: minDiscount ? Number(minDiscount) : undefined,
      inStock: inStock === "true",
    },
    authReq.user
  );

  return ApiResponse.paginated(
    res,
    result.products,
    {
      total: result.total,
      pages: result.pages,
      currentPage: result.page,
      limit: result.limit,
    },
    "Products fetched successfully"
  );
});

export const getSuggestions = asyncHandler(async (req: Request, res: Response) => {
  const { q } = req.query;
  const suggestions = await productService.getSearchSuggestions(q as string);
  return res.status(200).json({
    success: true,
    suggestions,
  });
});

export const getProductById = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.getProductById(req.params.id);
  return ApiResponse.success(res, "Product fetched successfully", product);
});

export const createProduct = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const product = await productService.createProduct(req.body, req.user);
  return ApiResponse.success(res, "Product created successfully", product, 201);
});

export const updateProduct = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const updatedProduct = await productService.updateProduct(req.params.id, req.body, req.user);
  return ApiResponse.success(res, "Product updated successfully", updatedProduct);
});

export const deleteProduct = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await productService.deleteProduct(req.params.id, req.user);
  return ApiResponse.success(res, "Product deleted successfully", result);
});

export const importProducts = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await productService.importProducts(req.body.products, req.user);
  return ApiResponse.success(res, `Successfully imported ${result.count} products!`, result, 201);
});
