import { ApiClient } from "./apiClient";
import { ICategory } from "@/app/models/Category";

export class CategoryApi {
  static async getCategories() {
    return ApiClient.get<ICategory[]>("/categories");
  }

  static async createCategory(categoryData: Partial<ICategory>) {
    return ApiClient.post<ICategory>("/categories", categoryData);
  }
}
