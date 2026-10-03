import { ApiClient } from "./apiClient";
import { IProduct } from "@/app/models/Product";

export interface ProductQueryOptions {
  category?: string;
  brand?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  featured?: boolean;
  deal?: boolean;
  sort?: string;
  page?: number;
  limit?: number;
}

export class ProductApi {
  static async getProducts(options: ProductQueryOptions = {}) {
    return ApiClient.get<IProduct[]>("/products", options as Record<string, unknown>);
  }

  static async getProductById(id: string | number) {
    return ApiClient.get<IProduct>(`/products/${id}`);
  }

  static async getSuggestions(query: string) {
    return ApiClient.get<string[]>("/products/suggestions", { q: query });
  }

  static async createProduct(productData: Partial<IProduct>) {
    return ApiClient.post<IProduct>("/products", productData);
  }

  static async updateProduct(id: string | number, productData: Partial<IProduct>) {
    return ApiClient.put<IProduct>(`/products/${id}`, productData);
  }

  static async deleteProduct(id: string | number) {
    return ApiClient.delete(`/products/${id}`);
  }

  static async importProducts(products: Partial<IProduct>[]) {
    return ApiClient.post("/products/import", { products });
  }
}
