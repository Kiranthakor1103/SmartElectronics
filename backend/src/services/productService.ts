import { productRepository, ProductQueryFilterOptions } from "../repositories/productRepository";
import { sellerRepository } from "../repositories/sellerRepository";
import { AppError } from "../utils/appError";

export class ProductService {
  async getProducts(options: ProductQueryFilterOptions, user?: any) {
    if (options.myProducts && user) {
      const seller = await sellerRepository.findByUserId(user.id);
      if (seller) {
        options.sellerId = seller._id.toString();
        options.status = undefined; // Allow seller to view all their product statuses
      } else {
        options.status = "approved";
      }
    }

    return productRepository.queryProducts(options);
  }

  async getProductById(idParam: string) {
    const product = await productRepository.findByMongoOrNumericId(idParam);
    if (!product) {
      throw new AppError("Product not found", 404);
    }
    return product;
  }

  async getSearchSuggestions(query: string) {
    if (!query || typeof query !== "string") {
      return [];
    }
    return productRepository.getSearchSuggestions(query);
  }

  async createProduct(productData: any, user: any) {
    const isSeller = user?.role === "seller";
    const maxNumericId = await productRepository.getMaxNumericId();
    const nextId = maxNumericId + 1;

    const payload: any = {
      ...productData,
      id: nextId,
    };

    if (isSeller) {
      const seller = await sellerRepository.findByUserId(user.id);
      if (!seller) {
        throw new AppError("Seller profile not found. Please complete onboarding.", 400);
      }
      payload.sellerId = seller._id;
      payload.status = "pending";
    } else {
      payload.sellerId = null;
      payload.status = "approved";
    }

    return productRepository.create(payload);
  }

  async updateProduct(idParam: string, updateData: any, user: any) {
    const product = await productRepository.findByMongoOrNumericId(idParam);
    if (!product) {
      throw new AppError("Product not found", 404);
    }

    const isSeller = user?.role === "seller";
    if (isSeller) {
      const seller = await sellerRepository.findByUserId(user.id);
      if (!seller || !product.sellerId || product.sellerId.toString() !== seller._id.toString()) {
        throw new AppError("Forbidden: You do not own this product", 403);
      }
      delete updateData.status;
      delete updateData.sellerId;
    }

    return productRepository.updateProductByIdOrNumericId(idParam, updateData);
  }

  async deleteProduct(idParam: string, user: any) {
    const product = await productRepository.findByMongoOrNumericId(idParam);
    if (!product) {
      throw new AppError("Product not found", 404);
    }

    const isSeller = user?.role === "seller";
    if (isSeller) {
      const seller = await sellerRepository.findByUserId(user.id);
      if (!seller || !product.sellerId || product.sellerId.toString() !== seller._id.toString()) {
        throw new AppError("Forbidden: You do not own this product", 403);
      }
    }

    const deleted = await productRepository.softDeleteByIdOrNumericId(idParam);
    if (!deleted) {
      throw new AppError("Failed to delete product", 400);
    }
    return { success: true };
  }

  async importProducts(productsList: any[], user: any) {
    if (!Array.isArray(productsList) || productsList.length === 0) {
      throw new AppError("Invalid payload: 'products' array is required", 400);
    }

    const isSeller = user?.role === "seller";
    let sellerId = null;
    if (isSeller) {
      const seller = await sellerRepository.findByUserId(user.id);
      if (!seller) {
        throw new AppError("Seller profile not found. Please complete onboarding.", 400);
      }
      sellerId = seller._id;
    }

    let nextId = (await productRepository.getMaxNumericId()) + 1;

    const preparedProducts = productsList.map((prod: any) => {
      const id = nextId++;
      const title = prod.title || "Unnamed Imported Product";
      const image = prod.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80";

      return {
        id,
        title,
        name: title,
        description: prod.description || "No description provided.",
        price: Number(prod.price) || 0,
        category: prod.category || "General",
        brand: prod.brand || "Generic",
        image,
        thumbnail: image,
        stock: Number(prod.stock) || 0,
        status: isSeller ? "pending" : "approved",
        sellerId,
        active: true,
      };
    });

    const result = await productRepository.bulkCreate(preparedProducts);
    return { count: result.length, products: result };
  }
}

export const productService = new ProductService();
