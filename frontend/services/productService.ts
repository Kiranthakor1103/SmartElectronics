import { ProductApi } from "@/lib/api/productApi";
import { IProduct } from "@/app/models/Product";

export class ProductService {
  static async getProductById(id: number): Promise<IProduct | null> {
    try {
      const res = await ProductApi.getProductById(id);
      if (res.success && res.data) {
        return res.data;
      }
    } catch (err) {
      console.error("[ProductService] getProductById error:", err);
    }
    return null;
  }

  static async getProducts(options: Parameters<typeof ProductApi.getProducts>[0] = {}) {
    try {
      const res = await ProductApi.getProducts(options);
      if (res.success && res.data) {
        return {
          products: res.data,
          total: res.pagination?.total || res.data.length,
        };
      }
      if (res.success && res.products) {
        return {
          products: res.products,
          total: res.pagination?.total || res.products.length,
        };
      }
    } catch (err) {
      console.error("[ProductService] getProducts error:", err);
    }
    return { products: [], total: 0 };
  }

  static async createProduct(data: Partial<IProduct>): Promise<IProduct | null> {
    try {
      const res = await ProductApi.createProduct(data);
      if (res.success && res.data) {
        return res.data;
      }
    } catch (err) {
      console.error("[ProductService] createProduct error:", err);
    }
    return null;
  }

  static async updateProduct(id: number, data: Partial<IProduct>): Promise<IProduct | null> {
    try {
      const res = await ProductApi.updateProduct(id, data);
      if (res.success && res.data) {
        return res.data;
      }
    } catch (err) {
      console.error("[ProductService] updateProduct error:", err);
    }
    return null;
  }

  static async deleteProduct(id: number): Promise<boolean> {
    try {
      const res = await ProductApi.deleteProduct(id);
      return res.success;
    } catch (err) {
      console.error("[ProductService] deleteProduct error:", err);
    }
    return false;
  }

  static async getFilters() {
    try {
      const res = await ProductApi.getProducts({ limit: 1000 });
      const products: IProduct[] = res.data || res.products || [];
      const categories = Array.from(new Set(products.map((p) => p.category).filter(Boolean))).sort();
      const brands = Array.from(new Set(products.map((p) => p.brand).filter(Boolean))).sort();
      return { categories, brands };
    } catch (err) {
      console.error("[ProductService] getFilters error:", err);
    }
    return { categories: [], brands: [] };
  }
}
