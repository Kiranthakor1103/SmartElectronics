import { CategoryApi } from "@/lib/api/categoryApi";
import { ICategory } from "@/app/models/Category";

export class CategoryService {
  static async getCategories(): Promise<ICategory[]> {
    try {
      const res = await CategoryApi.getCategories();
      if (res.success && res.data) {
        return Array.isArray(res.data) ? res.data : [];
      }
      if (res.success && res.categories) {
        return res.categories as unknown as ICategory[];
      }
    } catch (err) {
      console.error("[CategoryService] getCategories error:", err);
    }
    return [];
  }

  static async createCategory(data: Partial<ICategory>): Promise<ICategory | null> {
    try {
      const res = await CategoryApi.createCategory(data);
      if (res.success && res.data) {
        return res.data;
      }
    } catch (err) {
      console.error("[CategoryService] createCategory error:", err);
    }
    return null;
  }
}
