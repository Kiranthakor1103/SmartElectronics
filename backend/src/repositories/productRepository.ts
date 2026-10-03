import { Product } from "../models/Product";
import { BaseRepository } from "./baseRepository";

export interface ProductQueryFilterOptions {
  category?: string;
  subCategory?: string;
  brand?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  minDiscount?: number;
  inStock?: boolean;
  featured?: boolean;
  deal?: boolean;
  myProducts?: boolean;
  sellerId?: string;
  status?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export class ProductRepository extends BaseRepository<any> {
  constructor() {
    super(Product);
  }

  async findByNumericId(id: number): Promise<any | null> {
    return Product.findOne({ id, active: { $ne: false } }).lean().exec();
  }

  async findByMongoOrNumericId(idParam: string): Promise<any | null> {
    const numericId = Number(idParam);
    if (!isNaN(numericId)) {
      return Product.findOne({ id: numericId, active: { $ne: false } }).lean().exec();
    }
    return Product.findById(idParam).lean().exec();
  }

  async getMaxNumericId(): Promise<number> {
    const maxProduct = await Product.findOne().sort({ id: -1 }).exec();
    return maxProduct && maxProduct.id ? maxProduct.id : 0;
  }

  async queryProducts(options: ProductQueryFilterOptions) {
    const filter: Record<string, any> = { active: { $ne: false } };

    if (options.sellerId) {
      filter.sellerId = options.sellerId;
    }

    if (options.status) {
      filter.status = options.status;
    } else if (!options.sellerId) {
      filter.status = "approved";
    }

    if (options.category && options.category.toLowerCase() !== "all") {
      filter.category = { $regex: `^${options.category.trim()}$`, $options: "i" };
    }

    if (options.subCategory && options.subCategory.toLowerCase() !== "all") {
      filter.subCategory = { $regex: options.subCategory.trim(), $options: "i" };
    }

    if (options.brand) {
      filter.brand = { $regex: `^${options.brand.trim()}$`, $options: "i" };
    }

    if (options.search?.trim()) {
      const searchRegex = { $regex: options.search.trim(), $options: "i" };
      filter.$or = [
        { title: searchRegex },
        { name: searchRegex },
        { description: searchRegex },
        { brand: searchRegex },
        { category: searchRegex },
        { subCategory: searchRegex },
      ];
    }

    if (typeof options.minPrice === "number" || typeof options.maxPrice === "number") {
      filter.price = {};
      if (typeof options.minPrice === "number") filter.price.$gte = options.minPrice;
      if (typeof options.maxPrice === "number") filter.price.$lte = options.maxPrice;
    }

    if (typeof options.minRating === "number") {
      filter.rating = { $gte: options.minRating };
    }

    if (typeof options.minDiscount === "number") {
      filter.discountPercentage = { $gte: options.minDiscount };
    }

    if (options.inStock) {
      filter.stock = { $gt: 0 };
    }

    if (options.featured) {
      filter.featured = true;
    }

    if (options.deal) {
      filter.$or = [
        { badge: { $exists: true, $ne: "" } },
        { discountPercentage: { $gte: 20 } },
      ];
    }

    const sortMap: Record<string, Record<string, 1 | -1>> = {
      featured: { featured: -1, rating: -1 },
      "price-asc": { price: 1 },
      "price-desc": { price: -1 },
      priceAsc: { price: 1 },
      priceDesc: { price: -1 },
      rating: { rating: -1 },
      discount: { discountPercentage: -1 },
      name: { title: 1 },
    };

    const sortQuery = sortMap[options.sort || "featured"] || { featured: -1, rating: -1 };

    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100000, Math.max(1, options.limit || 100));
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(filter).sort(sortQuery).skip(skip).limit(limit).lean().exec(),
      Product.countDocuments(filter).exec(),
    ]);

    return {
      products,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async getSearchSuggestions(queryText: string): Promise<string[]> {
    const containsRegex = new RegExp(queryText, "i");
    const [titleMatches, categoryMatches, brandMatches] = await Promise.all([
      Product.find({ title: containsRegex, active: true, status: "approved" })
        .limit(10)
        .select("title")
        .lean()
        .exec(),
      Product.distinct("category", { category: containsRegex, active: true, status: "approved" }).exec(),
      Product.distinct("brand", { brand: containsRegex, active: true, status: "approved" }).exec(),
    ]);

    const suggestions: string[] = [];
    categoryMatches.forEach((cat) => cat && suggestions.push(cat));
    brandMatches.forEach((br) => br && suggestions.push(br));
    titleMatches.forEach((prod) => prod.title && suggestions.push(prod.title));

    return Array.from(new Set(suggestions)).slice(0, 8);
  }

  async getDistinctCategories(): Promise<string[]> {
    return Product.distinct("category", { active: { $ne: false }, status: "approved" }).exec();
  }

  async getDistinctBrands(): Promise<string[]> {
    return Product.distinct("brand", { active: { $ne: false }, status: "approved" }).exec();
  }

  async bulkCreate(products: any[]): Promise<any[]> {
    return Product.insertMany(products);
  }

  async updateProductByIdOrNumericId(idParam: string, updateData: any): Promise<any | null> {
    const numericId = Number(idParam);
    if (!isNaN(numericId)) {
      return Product.findOneAndUpdate({ id: numericId }, updateData, { new: true, runValidators: true }).lean().exec();
    }
    return Product.findByIdAndUpdate(idParam, updateData, { new: true, runValidators: true }).lean().exec();
  }

  async softDeleteByIdOrNumericId(idParam: string): Promise<boolean> {
    const numericId = Number(idParam);
    let result;
    if (!isNaN(numericId)) {
      result = await Product.updateOne({ id: numericId }, { $set: { active: false } }).exec();
    } else {
      result = await Product.updateOne({ _id: idParam }, { $set: { active: false } }).exec();
    }
    return result.modifiedCount > 0;
  }
}

export const productRepository = new ProductRepository();
