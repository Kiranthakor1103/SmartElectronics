import { z } from "zod";

export const productSchema = z.object({
  id: z.number().int().positive("ID must be a positive integer"),
  title: z.string().min(2, "Title must be at least 2 characters").trim(),
  price: z.number().positive("Price must be a positive number"),
  description: z.string().min(5, "Description must be at least 5 characters").trim(),
  category: z.string().min(2, "Category must be at least 2 characters").trim(),
  discountPercentage: z.number().min(0).max(100).default(0),
  rating: z.number().min(0).max(5).default(0),
  stock: z.number().int().nonnegative().default(0),
  brand: z.string().optional(),
  thumbnail: z.string().url("Thumbnail must be a valid URL").optional(),
  images: z.array(z.string().url()).optional(),
  originalPrice: z.number().positive().optional(),
  badge: z.string().optional(),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
});

export type ProductInput = z.infer<typeof productSchema>;
