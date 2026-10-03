import { categoryRepository } from "../repositories/categoryRepository";
import { AppError } from "../utils/appError";

export class CategoryService {
  async getCategories() {
    return categoryRepository.getAllCategories();
  }

  async getCategoryByName(name: string) {
    const category = await categoryRepository.findByName(name);
    if (!category) {
      throw new AppError("Category not found", 404);
    }
    return category;
  }

  async createCategory(data: any) {
    if (!data.name) {
      throw new AppError("Category name is required", 400);
    }
    const existing = await categoryRepository.findByName(data.name);
    if (existing) {
      throw new AppError("Category with this name already exists", 400);
    }
    return categoryRepository.create(data);
  }

  async updateCategory(name: string, data: any) {
    const category = await categoryRepository.updateCategoryByName(name, data);
    if (!category) {
      throw new AppError("Category not found", 404);
    }
    return category;
  }

  async deleteCategory(name: string) {
    const deleted = await categoryRepository.deleteCategoryByName(name);
    if (!deleted) {
      throw new AppError("Category not found or could not be deleted", 404);
    }
    return true;
  }
}

export const categoryService = new CategoryService();
