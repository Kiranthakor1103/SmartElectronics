import { Request, Response } from "express";
import { categoryService } from "../services/categoryService";
import { productService } from "../services/productService";
import { ApiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const getCategories = asyncHandler(async (req: Request, res: Response) => {
  const dbCategories = await categoryService.getCategories();
  const productCategories = await productService.getProducts({ limit: 10000 });
  const distinctCats = Array.from(new Set(productCategories.products.map((p: any) => p.category))).filter(Boolean);

  const existingNames = new Set(dbCategories.map((c: any) => c.name.toLowerCase()));
  const combinedCategories: any[] = [...dbCategories];

  const categoryImageMap: Record<string, string> = {
    beauty: "/images/Beauty.png",
    books: "/images/Books.png",
    electronics: "/images/electronics.png",
    fashion: "/images/fashion.png",
    groceries: "/images/Groceries.png",
    sports: "/images/Sports.png",
    toys: "/images/Toys.png",
    home: "/images/Home.png",
    mobile: "/images/mobile-tablet.png",
    "tvs & appliances": "/images/tv-applications.png",
    "top offers": "/images/top-offers.png",
  };

  const colors = [
    "from-blue-50 to-blue-100",
    "from-violet-50 to-violet-100",
    "from-teal-50 to-teal-100",
    "from-pink-50 to-pink-100",
    "from-amber-50 to-amber-100",
    "from-emerald-50 to-emerald-100",
    "from-rose-50 to-rose-100",
  ];

  let colorIdx = 0;
  distinctCats.forEach((catName: string) => {
    if (catName && !existingNames.has(catName.toLowerCase())) {
      const mappedImage = categoryImageMap[catName.toLowerCase()] || "/images/top-offers.png";
      combinedCategories.push({
        name: catName,
        image: mappedImage,
        color: colors[colorIdx % colors.length],
        href: `/products?category=${encodeURIComponent(catName)}`,
        active: true,
      });
      colorIdx++;
    }
  });

  return ApiResponse.success(res, "Categories retrieved successfully", { categories: combinedCategories });
});

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.createCategory(req.body);
  return ApiResponse.success(res, "Category created successfully", category, 201);
});
